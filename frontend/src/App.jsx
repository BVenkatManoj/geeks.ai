import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import mentorImg from './assets/mentor.png';

// Production Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Roman Numeral converter for true Gatsby elegance
function toRoman(num) {
  const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let roman = '';
  for (let i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState('url');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (currentSessionId) fetchSession(currentSessionId);
    else setMessages([]);
  }, [currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) { console.error('Error fetching history:', err); }
  };

  const fetchSession = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) { console.error('Error fetching session:', err); }
  };

  const deleteSession = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (currentSessionId === id) startNewChat();
        fetchHistory();
      }
    } catch (err) { console.error('Error deleting session:', err); }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInputText('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentSessionId,
          input_type: inputType,
          content: userMessage.content
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(data.history);
        if (!currentSessionId) {
          setCurrentSessionId(data.session_id);
          fetchHistory();
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setInputText('');
  };

  return (
    <>
      <header className="top-header">
        <h1>Geeks.AI</h1>
      </header>
      
      <div className="main-layout">
        <aside className="history-sidebar">
          <h2 className="history-heading">Archives</h2>
          <button className="new-session-btn" onClick={startNewChat}>New Commission</button>
          
          <div className="history-list">
            {sessions.length === 0 ? (<div className="no-history" style={{color: 'var(--pewter)'}}>The archives are empty.</div>) : null}

            {sessions.map((s, index) => (
              <div key={s.id} className={`history-item-container ${currentSessionId === s.id ? 'active' : ''}`}>
                <span className="history-item-numeral">{toRoman(sessions.length - index)}.</span>
                <button 
                  className="history-item-btn"
                  onClick={() => setCurrentSessionId(s.id)}
                  title={s.title}
                >
                  {s.title}
                </button>
                <button 
                  className="history-del-btn" 
                  onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                  title="Expunge Record"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </aside>

        <main className="chat-interface">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-screen">
                <div style={{ padding: '8px', border: '1px solid var(--gold)', display: 'inline-block', marginBottom: '2rem', background: 'var(--obsidian)' }}>
                  <img src={mentorImg} alt="Geeks.AI Mentor" style={{ width: '150px', height: '150px', objectFit: 'cover', display: 'block', filter: 'contrast(1.2) sepia(0.3) hue-rotate(330deg)' }} />
                </div>
                <h2>A Legacy of Knowledge.</h2>
                <p>Provide the foundational artifacts (Video or Texts), and I shall structure an impeccable analysis of its core architectural truths.</p>
              </div>
            )}
            
            {messages.map((m) => (
              <div key={m.id} className={`message-card ${m.role}`}>
                {m.role === 'ai' ? (
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                ) : (
                  <div>{m.content}</div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="message-card ai loader">
                Drafting Schematics...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-section">
            <form className="input-container" onSubmit={handleSend}>
              <select 
                className="type-dropdown" 
                value={inputType} 
                onChange={(e) => setInputType(e.target.value)}
              >
                <option value="url">Video Link</option>
                <option value="notes">Notes</option>
              </select>
              
              <input 
                type="text" 
                className="text-input"
                placeholder={inputType === 'url' ? "Provide the broadcast URL..." : "Document your concepts..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
              />
              
              <button type="submit" className="submit-btn" disabled={loading || !inputText.trim()}>
                Dispatch
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
