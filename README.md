# ✨ Geeks.AI: Next-Gen Intellectual Advisor

**Geeks.AI** is a sophisticated, AI-driven conceptual analyzer built with a luxurious **Art Deco (Gatsby)** aesthetic. It bridges the gap between raw data and actionable wisdom by dissecting YouTube videos and personal notes to predict a "Better Future" for the user.

![Geeks.AI Mentor](./frontend/src/assets/mentor.png)

---

## 🏛️ The Gatsby Vision
Unlike generic, minimalist AI tools, Geeks.AI celebrates **opulence, mathematical precision, and architectural grandeur**. 
- **Obsidian & Gold**: A deep, high-contrast palette.
- **Marcellus & Josefin Sans**: Stunning Roman-style typography.
- **Geometric Precision**: Every component follows a strict 0-radius structure with decorative stepped-corner "L-Brackets."
- **Roman Numerals**: Your chat archives are organized into classically numbered scrolls (I, II, III...).

## 🚀 Core Functionalities

### 1. **Neural Broadcast Synthesis (YouTube Integration)**
Paste any YouTube URL into the dispatch terminal. Geeks.AI will:
- Silently extract the broadcast ID.
- Access the high-fidelity transcript (English or Hindi).
- Use **Gemini AI** to analyze the core architectural truths of the video.

### 2. **Conceptual Refactoring**
Provide your raw notes or messy thoughts, and the AI will refactor them into structured, intellectual takeaways.

### 3. **Future Prediction**
The mentor does not just summarize; it identifies areas for cognitive expansion and provides concrete, actionable recommendations for your professional and personal trajectory.

---

## 🛠️ Technical Architecture

- **Frontend**: React (Vite) + Vanilla CSS (Custom Gatsby Design System)
- **Backend**: FastAPI (Python)
- **Brain**: Google Gemini 2.5 Flash
- **Database**: SQLite (SQLAlchemy)
- **Video Extraction**: YouTube Transcript API

---

## 🏗️ Setup & Installation

### **Prerequisites**
- Python 3.10+
- Node.js & npm

### **1. Configure the Vault (.env)**
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_google_ai_key_here
```

### **2. Launch the System**
We have provided a one-click initialization script for Windows users:
- Double-click **`start.bat`** in the root directory.

*Alternatively, manually:*
- **Backend**: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`
- **Frontend**: `cd frontend && npm install && npm run dev`

---

## ⚖️ License
Privately commissioned for the pursuit of excellence. Created by **Antigravity**.
