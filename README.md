# NeuroSathi NER 🧠🌿
### AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)

**Smart India Hackathon 2026** • **Problem Statement ID**: `SIH26003` • **Team**: `Mavericks`  
**Theme**: Space & Healthcare Technology • **Category**: Software

> **Motto**: `[PLAY • REMEMBER • CONNECT • CARE]`

---

## 🌟 Executive Summary

**NeuroSathi NER** is a full-stack, culturally grounded, offline-first assistive platform built specifically for senior citizens and early-to-moderate stage dementia patients across North Eastern India (Assam, Manipur, Meghalaya, Mizoram, Nagaland, Arunachal Pradesh, Tripura, and Sikkim).

Unlike generic cognitive tools, **NeuroSathi NER** prioritizes:
1. **Dementia-Optimized Tactile UX**: Giant typography, high-contrast themes, soft 3D visual cards, minimum 60px touch targets, zero clutter, and automated text-to-speech (TTS) voice reading on hover/click.
2. **NER Cultural Resonance**: Cognitive games rooted in local folklore, regional musical rhythms (Bihu Dhol, Manipuri Pung, Kamakhya bells), and indigenous artifacts (Assam Tea Leaf, Kaziranga Rhino, Great Hornbill, Japi, Xorai, Living Root Bridges, Keibul Lamjao Sangai deer).
3. **Voice Sathi Assistant**: Real-time browser Speech Recognition & Synthesis with multi-language phrases in Assamese, Bengali, Hindi, Manipuri, and Mizo.
4. **Clinical Caregiver Analytics**: Real-time medication adherence tracking, cognitive performance progression curves, and deterministic AI recommendations for calibrated cognitive stimulation.
5. **Offline-First Resilience**: Automatic local caching that seamlessly operates in remote hilly terrain and synchronizes with Supabase/FastAPI upon internet reconnection.

---

## 🏗️ Architecture & Technology Stack

```
                                ┌──────────────────────────┐
                                │     Elder Patient        │
                                └────────────┬─────────────┘
                                             │ (Voice / Touch / Regional Audio)
                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 REACT.JS FRONTEND (Vite)                                │
│  - Elder Mode (Tactile 3D UX)             - Accessibility Center (S/M/L/XL & Contrast) │
│  - Voice Sathi (Web Speech API STT/TTS)    - 3 NER Cognitive Games (Match, Rhythm, Story)│
│  - Daily Memory Scheduler                  - Caregiver Clinical Analytics (Recharts)    │
│  - Dual-Engine Offline Layer (localStorage + Sync Queue)                               │
└─────────────────────────────┬─────────────────────────────┬────────────────────────────┘
                              │ (REST APIs / JSON)          │ (PostgreSQL Sync)
                              ▼                             ▼
               ┌──────────────────────────────┐    ┌─────────────────────────────┐
               │    FASTAPI PYTHON BACKEND    │    │    SUPABASE POSTGRESQL      │
               │  - Deterministic AI Engine   │    │  - Profiles, Reminders      │
               │  - Telemetry & Difficulty    │    │  - Game Results & Alerts    │
               │  - Caregiver Aggregator      │    │  - Row Level Security (RLS) │
               └──────────────────────────────┘    └─────────────────────────────┘
```

### Tech Stack Details:
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti, Web Speech API, Web Audio API Tone Synthesizer.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn, Dotenv.
- **Database**: Supabase Cloud PostgreSQL with Hybrid In-Memory & SQLite Local Fallback.

---

## 🎮 Playable Cognitive Games

### 1. Heritage Memory Match
- **Cultural Elements**: Assam Orthodox Tea Leaf, Kaziranga One-horned Rhino, Nagaland Hornbill, Bihu Dhol drum, Mizo Cheraw Bamboo, Loktak Floating Phumdi, Woven Japi hat.
- **Adaptive Difficulty**: Auto-scales from 4 pairs (2x2/2x4) to 6 pairs (3x4) or 8 pairs (4x4) based on accuracy and completion speed.

### 2. NER Rhythm & Sequence Recall
- **Auditory Memory**: Watch, listen, and repeat rhythmic patterns using the *Kamakhya Temple Bell*, *Bihu Dhol Beat*, *Hill Bamboo Flute*, and *Monastery Gong*.
- **Synthesized Audio**: Generates authentic pentatonic musical frequencies directly in-browser.

### 3. North East Object & Story Recall
- **Reminiscence Therapy**: Photo-based associative recall with questions on traditional items (Xorai, Pepa, Living Root Bridges, Japi, Sangai Deer) with gentle clues and cultural backstories.

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Navigate
```bash
cd "NER new"
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
> The API will be live at: `http://localhost:8000`  
> Interactive Swagger API Docs: `http://localhost:8000/docs`

### 3. Frontend Setup (React + Vite)
```bash
cd ../frontend
npm install
npm run dev
```
> The web application will launch at: `http://localhost:5173`

---

## 🧪 Automated Testing

To run the backend test suite:
```bash
cd backend
python test_api.py
```

---

## 🗄️ Supabase PostgreSQL Setup (Optional Cloud Sync)

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase.
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `backend/.env` and `frontend/.env`.

---

## 🏆 Smart India Hackathon 2026 Pitch Highlights

- **National Priority Alignment**: Directly supports **Digital India**, **Inclusive Healthcare (WHO Dementia Guidelines)**, and **MDoNER** (Ministry of Development of North Eastern Region).
- **Zero Configuration Demo**: Pre-loaded with realistic patient data (*Bhaben Kalita, Age 74, Guwahati, Assam*), historical cognitive trends, active medication schedules, and pre-computed AI heuristics.

Developed with ❤️ by **Team Mavericks** for **SIH 2026**.
