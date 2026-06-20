# Healthcare Voice Appointment Assistant

<img width="1833" height="955" alt="Screenshot From 2026-06-20 23-10-00" src="https://github.com/user-attachments/assets/358c50f2-0b28-4389-9f06-9a0941c303bc" />
<img width="1833" height="955" alt="Screenshot From 2026-06-20 23-10-08" src="https://github.com/user-attachments/assets/8a1eeda2-fe05-4dff-9c22-71923f463228" />
<img width="616" height="667" alt="Screenshot From 2026-06-20 23-10-41" src="https://github.com/user-attachments/assets/de6f3205-5cfd-4dad-83dd-45054c580254" />

<img width="1873" height="445" alt="Screenshot From 2026-06-20 23-10-25" src="https://github.com/user-attachments/assets/692d8dec-85c9-49e5-8af2-92271f8b0ebe" />
<img width="1833" height="955" alt="Screenshot From 2026-06-20 23-09-52" src="https://github.com/user-attachments/assets/78c40be0-93fa-41a5-b671-adf5690a0560" />




A production-ready AI-powered healthcare voice assistant that enables users to book, retrieve, modify, and cancel appointments through natural voice conversations.

The assistant combines Speech-to-Text, Large Language Model reasoning, intelligent function calling, and Text-to-Speech to deliver a seamless healthcare receptionist experience.

---

## Live Demo

### Frontend

https://mykare-ai.vercel.app/

### Backend API

https://mykare-ai.onrender.com/

### Demo Video

<DEMO_VIDEO_URL>

---

# Features

## Voice Conversation

* Voice-first user experience
* Speech-to-Text transcription using Deepgram
* Natural conversation powered by Gemini 2.5 Flash
* Context-aware multi-turn conversations
* Supports 5+ back-and-forth exchanges
* Low-latency voice interactions

## Intelligent Tool Calling

The assistant automatically invokes backend tools based on user intent.

Implemented tools:

* identify_user
* fetch_slots
* book_appointment
* retrieve_appointments
* modify_appointment
* cancel_appointment
* end_conversation

## Appointment Management

Users can:

* Book appointments
* View existing appointments
* Modify appointments
* Cancel appointments
* Prevent double bookings
* Receive appointment confirmations

## Voice Assistant Interface

* Animated healthcare avatar
* Listening state
* Processing state
* Speaking state
* Call-style interaction experience
* Real-time activity tracking

## Conversation Summary

At the end of each session the assistant generates:

* User information
* Appointment actions
* Conversation intent
* Appointment status
* User preferences
* Timestamp

# Cost Monitoring & Call Analytics

The application tracks the estimated cost of each conversation by measuring the AI and voice services used during the interaction.

Metrics include:

- Speech-to-Text Cost (Deepgram)
- LLM Processing Cost (Gemini)
- Text-to-Speech Cost (Cartesia)
- Total Session Cost
- Session Duration
- Tool Call Count

This enables visibility into operational expenses and helps evaluate the scalability of the voice assistant.

---

# Architecture

User Voice
↓
Deepgram Speech-to-Text
↓
Gemini 2.5 Flash
↓
Function Calling
↓
FastAPI Tool Layer
↓
SQLite Database
↓
Cartesia Text-to-Speech
↓
Avatar Interface

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* React Hooks

## Backend

* FastAPI
* SQLAlchemy
* SQLite
* Pydantic

## AI & Voice

* Gemini 2.5 Flash
* Deepgram Speech-to-Text
* Cartesia Text-to-Speech

## Deployment

* Frontend: Vercel
* Backend: Render

---

# Project Structure

```text
mykare-ai/

├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── tools/
│   │   ├── database/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │
│   ├── package.json
│   └── .env.local.example
│
└── README.md
```

---

# Core Functionalities

## User Identification

The assistant identifies users through their phone number and uses it as a unique identifier for appointment management.

## Slot Retrieval

Available appointment slots are fetched dynamically and presented to the user.

## Appointment Booking

The assistant:

* Validates slot availability
* Prevents double booking
* Saves appointments in SQLite
* Provides confirmation details

## Appointment Retrieval

Users can retrieve previously booked appointments using their phone number.

## Appointment Modification

Users can modify existing appointments by selecting a new date and time.

## Appointment Cancellation

Users can cancel appointments through natural voice commands.

## Conversation Summary

A structured summary is generated when the conversation ends.

### Cost Tracking & Analytics

- Cost-per-call estimation
- Session duration tracking
- Tool usage tracking
- Voice pipeline cost visibility
- Operational monitoring metrics



---

# Database Schema

## Appointment

| Field            | Type     |
| ---------------- | -------- |
| id               | Integer  |
| name             | String   |
| phone_number     | String   |
| appointment_date | Date     |
| appointment_time | Time     |
| status           | String   |
| created_at       | DateTime |

---

# Environment Variables

## Backend

Create:

```bash
cp .env.example .env
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key

DEEPGRAM_API_KEY=your_deepgram_api_key

CARTESIA_API_KEY=your_cartesia_api_key
```

---

# Local Setup

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt
```

Run:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend available at:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend available at:

```text
http://localhost:3000
```

---

# Deployment

## Backend Deployment

Deployed on Render.

Production start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Frontend Deployment

Deployed on Vercel.

Environment Variable:

```env
NEXT_PUBLIC_API_URL=<BACKEND_URL>
```

---

# Assessment Requirements Coverage

| Requirement               | Status |
| ------------------------- | ------ |
| Voice Conversation        | ✅      |
| Speech Recognition        | ✅      |
| Context Retention         | ✅      |
| Avatar Interface          | ✅      |
| Tool Calling              | ✅      |
| Appointment Booking       | ✅      |
| Appointment Retrieval     | ✅      |
| Appointment Modification  | ✅      |
| Appointment Cancellation  | ✅      |
| Double Booking Prevention | ✅      |
| Conversation Summary      | ✅      |
| Backend Deployment        | ✅      |
| Frontend Deployment       | ✅      |
| Cost Per Call Breakdown (Bonus) | ✅ |

---

# Design Decisions

### Simplified Voice Architecture

To optimize delivery time and maintain reliability, a streamlined REST-based architecture was chosen instead of a fully streaming WebRTC implementation.

### Server-Side Tool Calling

All tool execution occurs server-side, reducing security risks and preventing client-side manipulation.

### Lightweight Avatar

A CSS-based animated avatar was implemented to provide a responsive user experience without introducing heavy rendering dependencies.

### Modular Voice Stack

The architecture separates:

* Speech Recognition
* Reasoning
* Tool Execution
* Speech Synthesis

allowing individual components to be upgraded independently.

---

# Future Enhancements

* LiveKit integration for real-time streaming conversations
* WebRTC-based voice calls
* Cartesia streaming audio
* Regional language support
* PostgreSQL persistence
* Appointment reminders
* Analytics dashboard
* Cost-per-call tracking

---

# Author

Sreekailas V S

Python Developer | AI Engineer

Built as part of the Mykare Voice AI Engineer Assessment.




