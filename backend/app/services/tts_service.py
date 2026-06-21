import os
import base64
import httpx
from dotenv import load_dotenv

load_dotenv()

# Global client keeps the connection pool alive to prevent repeated SSL handshakes
http_client = httpx.AsyncClient()

CARTESIA_API_KEY = os.environ.get("CARTESIA_API_KEY")

async def generate_speech(text: str) -> str:
    """Returns base64 encoded audio string using Cartesia TTS."""
    if not CARTESIA_API_KEY or CARTESIA_API_KEY == "DUMMY_KEY":
        print("No Cartesia API Key found.")
        return ""
        
    url = "https://api.cartesia.ai/tts/bytes"
    headers = {
        "X-API-Key": CARTESIA_API_KEY,
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model_id": "sonic-3.5",
        "transcript": text,
        "voice": {
            "mode": "id",
            "id": "694f9389-aac1-45b6-b726-9d9369183238"
        },
        "output_format": {
            "container": "mp3",
            "encoding": "mp3",
            "sample_rate": 44100
        }
    }
    
    try:
        response = await http_client.post(url, headers=headers, json=payload, timeout=15.0)
        
        if response.status_code == 200:
            return base64.b64encode(response.content).decode("utf-8")
        else:
            print(f"Cartesia TTS Error: {response.status_code} - {response.text}")
            return ""
    except Exception as e:
        print(f"Cartesia TTS Exception: {str(e)}")
        return ""
