import os
from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types
from app.tools.functions import tools_list
import json

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "DUMMY_KEY"))

# Global memory storage for sessions
sessions = {}

from datetime import datetime

def get_system_instruction():
    today = datetime.now().strftime("%Y-%m-%d")
    return f"""
You are a helpful healthcare voice appointment assistant. Your name is MyKare Assistant.
You can help users identify themselves, check available slots, book, modify, or cancel appointments.
Always be polite and concise, as your responses will be spoken aloud via TTS.

When users ask to book, ensure you collect their name, phone number, date, and time. If you don't have all the info, ask for it.
When users ask to retrieve appointments, ask for their phone number if you don't already know it, then call retrieve_appointments.
When users ask to modify an appointment, check if you already know the Confirmation ID from recent context (e.g., if they say "Move it to 3 PM" right after booking). If you have the ID, use it to call modify_appointment. Otherwise, ask for the Confirmation ID.
When users ask to cancel an appointment, check if you already know the Confirmation ID from recent context (e.g., if they say "Cancel that"). If you have the ID, use it to call cancel_appointment. Otherwise, ask for the Confirmation ID.

IMPORTANT: You must internally format all dates to YYYY-MM-DD and times to 24-hour HH:MM before calling any tools. Do NOT ask the user to format the date or time. For example, if they say "tomorrow at 3 PM", calculate the date yourself and pass "15:00". Assume today is {today}.

Once you have the necessary information for any action, call the appropriate tool.
When an appointment is booked successfully, you MUST confirm it clearly exactly in this format:
"Your appointment has been booked.
Date: [Date]
Time: [Time]
Confirmation ID: [ID]"

If the user wants to end the conversation, call end_conversation().
"""

async def get_or_create_session(session_id: str):
    if session_id not in sessions:
        chat = client.aio.chats.create(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=get_system_instruction(),
                tools=tools_list,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=False,
                    maximum_remote_calls=5
                )
            )
        )
        sessions[session_id] = chat
    return sessions[session_id]

async def process_chat(session_id: str, user_text: str) -> dict:
    chat = await get_or_create_session(session_id)
    history_len_before = len(chat.get_history())
    
    from fastapi import HTTPException
    try:
        response = await chat.send_message(user_text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM Service Error: {str(e)}")
    
    new_messages = chat.get_history()[history_len_before:]
    tools_called = []
    
    for msg in new_messages:
        if msg.role == "model" and msg.parts:
            for part in msg.parts:
                if getattr(part, 'function_call', None):
                    tools_called.append(part.function_call.name)
                    
    return {
        "reply": response.text,
        "tools": tools_called
    }

async def generate_summary(session_id: str) -> dict:
    if session_id not in sessions:
        return {"error": "Session not found."}
        
    chat = sessions[session_id]
    
    # Compile history
    history_text = ""
    for msg in chat.get_history():
        role = "User" if msg.role == "user" else "Assistant"
        parts_text = []
        if msg.parts:
            for p in msg.parts:
                if getattr(p, 'text', None):
                    parts_text.append(p.text)
                elif getattr(p, 'function_call', None):
                    parts_text.append(f"[Called {p.function_call.name}]")
        history_text += f"{role}: {' '.join(parts_text)}\n"

    summary_prompt = f"""
    Based on the following conversation history, extract the requested information in JSON format.
    Required fields exactly as follows:
    - "name" (string or null)
    - "phone_number" (string or null)
    - "intent" (string: e.g., 'book_appointment', 'cancel_appointment', 'check_slots', etc.)
    - "appointment_date" (string YYYY-MM-DD or null)
    - "appointment_time" (string HH:MM or null)
    - "actions" (list of strings: e.g. ["Identified User", "Fetched Available Slots", "Booked Appointment"] or null)
    - "preferences" (string or null)
    
    Conversation History:
    {history_text}
    """
    
    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=summary_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    try:
        summary_data = json.loads(response.text)
        return summary_data
    except Exception as e:
        return {"error": "Failed to parse summary", "raw": response.text}
