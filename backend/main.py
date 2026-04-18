from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid
import database, models
import os
import urllib.parse as urlparse
from youtube_transcript_api import YouTubeTranscriptApi
from google import genai
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional

load_dotenv()

def extract_video_id(url):
    try:
        parsed = urlparse.urlparse(url)
        if parsed.hostname == 'youtu.be':
            return parsed.path[1:]
        if parsed.hostname in ('www.youtube.com', 'youtube.com'):
            if parsed.path == '/watch':
                return urlparse.parse_qs(parsed.query)['v'][0]
    except:
        pass
    return None

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageInput(BaseModel):
    session_id: Optional[str] = None
    input_type: str # 'url' or 'notes'
    content: str


@app.post("/api/chat")
def chat(payload: MessageInput, db: Session = Depends(database.get_db)):
    session_id = payload.session_id
    if not session_id:
        session_id = str(uuid.uuid4())
        title = "New Analysis"
        if payload.input_type == "url":
            title = f"Video: {payload.content[:30]}..."
        else:
            title = f"Notes: {payload.content[:30]}..."
            
        new_session = models.ChatSession(id=session_id, title=title)
        db.add(new_session)
        db.commit()

    user_msg_id = str(uuid.uuid4())
    user_msg = models.ChatMessage(id=user_msg_id, session_id=session_id, role="user", content=payload.content)
    db.add(user_msg)
    db.commit()
    
    ai_msg_content = "Analysis could not be completed."
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
             ai_msg_content = "### ⚠️ API Key Missing\n\nPlease set your `GEMINI_API_KEY` environment variable in your system or terminal so I can analyze this properly!"
        else:
            client = genai.Client(api_key=api_key)
            
            # Smart Video Extraction
            content_context = payload.content
            if payload.input_type == 'url':
                video_id = extract_video_id(payload.content)
                if video_id:
                    try:
                        api = YouTubeTranscriptApi()
                        transcript_list = api.list(video_id).find_transcript(['en', 'en-US', 'hi']).fetch()
                        transcript_text = " ".join([getattr(d, 'text', str(d)) for d in transcript_list])
                        content_context = f"**Video Script Extracted**:\n\n{transcript_text}"
                    except Exception as e:
                        content_context = f"Video URL: {payload.content}\n\n(Note: I couldn't pull the transcript directly. Try watching it or analyzing the main topic. Error: {str(e)})"

            prompt = f"""
You are Geeks.AI, a world-class mentor, futuristic-advisor, and concept analyzer.

I will provide either a video transcript or my raw notes.
Input Context (Type: {payload.input_type}): {content_context}

Your goals are:
1. UNDERSTAND & ANALYZE: Actually read the transcript or notes. Break down what the video/notes are trying to convey at their core. Do NOT hallucinate. Use the provided text.
2. IMPROVE: Identify areas where my understanding can expand based on that content.
3. PREDICT & SUGGEST: Give concrete, actionable recommendations for a "better future" regarding the topics discussed.

Tone: Cyberpunk, futuristic, intellectual, but incredibly clear.
Format: Use Markdown, highlighting key takeaways. Use ### for main headers.
            """
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            ai_msg_content = response.text
    except Exception as e:
        ai_msg_content = f"### Error During AI Generation\n`{str(e)}`"

    ai_msg_id = str(uuid.uuid4())
    ai_msg = models.ChatMessage(id=ai_msg_id, session_id=session_id, role="ai", content=ai_msg_content.strip())
    db.add(ai_msg)
    db.commit()

    return {
        "session_id": session_id,
        "history": [
            {"id": user_msg.id, "role": user_msg.role, "content": user_msg.content},
            {"id": ai_msg.id, "role": ai_msg.role, "content": ai_msg.content}
        ]
    }

@app.get("/api/history")
def get_history(db: Session = Depends(database.get_db)):
    sessions = db.query(models.ChatSession).order_by(models.ChatSession.created_at.desc()).all()
    return [{"id": s.id, "title": s.title, "created_at": str(s.created_at)} for s in sessions]

@app.get("/api/history/{session_id}")
def get_session(session_id: str, db: Session = Depends(database.get_db)):
    messages = db.query(models.ChatMessage).filter(models.ChatMessage.session_id == session_id).order_by(models.ChatMessage.created_at.asc()).all()
    if not messages:
        raise HTTPException(status_code=404, detail="Session not found")
    return [{"id": m.id, "role": m.role, "content": m.content, "created_at": str(m.created_at)} for m in messages]

@app.delete("/api/history/{session_id}")
def delete_session(session_id: str, db: Session = Depends(database.get_db)):
    session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": "ok"}
