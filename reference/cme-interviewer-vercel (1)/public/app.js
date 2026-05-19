const { useState, useEffect, useRef } = React;

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

function AttachIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function generateSessionId(name) {
  const safe = name.replace(/[^a-zA-Z0-9]/g, '_');
  return `${safe}_${Date.now()}`;
}

// Build the messages array in the format Claude API expects,
// handling image and file attachments correctly.
function buildApiMessages(messages) {
  return messages.map(m => {
    if (!m.attachment) return { role: m.role, content: m.content };
    if (m.attachment.type === 'image') {
      const parts = [];
      parts.push({ type: 'image', source: { type: 'base64', media_type: m.attachment.mediaType, data: m.attachment.data } });
      if (m.content) parts.push({ type: 'text', text: m.content });
      return { role: m.role, content: parts };
    }
    // Text file (CSV / XLSX converted to CSV)
    const fileText = `${m.content || ''}\n\n[Attached file: ${m.attachment.name}]\n\`\`\`\n${m.attachment.text}\n\`\`\``.trim();
    return { role: m.role, content: fileText };
  });
}

// Read a file and return attachment object
async function readFileAsAttachment(file) {
  const name = file.name;
  const ext = name.split('.').pop().toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target.result;
        const [header, data] = dataUrl.split(',');
        const mediaType = header.match(/:(.*?);/)[1];
        resolve({ type: 'image', name, mediaType, data });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  if (ext === 'csv') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve({ type: 'text', name, text: e.target.result });
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  if (ext === 'xlsx' || ext === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const parts = wb.SheetNames.map(name => {
            const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name]);
            return `Sheet: ${name}\n${csv}`;
          });
          resolve({ type: 'text', name, text: parts.join('\n\n') });
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // Generic text fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve({ type: 'text', name, text: e.target.result });
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function App() {
  const [phase, setPhase] = useState('welcome');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [participant, setParticipant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [kbStatus, setKbStatus] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Ref holds always-current session data so async callbacks never read stale state
  const sessionRef = useRef({ sessionId: null, participant: null, startedAt: null });

  useEffect(() => {
    fetch('/api/knowledge-base-status')
      .then(r => r.json())
      .then(setKbStatus)
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // On browser/tab close: fire-and-forget completion email with full transcript from DB
  useEffect(() => {
    const handleUnload = () => {
      const { sessionId, participant: p } = sessionRef.current;
      if (!p || !sessionId) return;
      // sendBeacon to trigger completion email (server reads transcript from DB)
      navigator.sendBeacon(
        '/api/interview-completed',
        new Blob([JSON.stringify({ sessionId })], { type: 'application/json' })
      );
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(email)) e.email = 'Please enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStart = async () => {
    if (!validate()) return;
    const p = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role: 'Stakeholder',
      department: 'CME'
    };
    const sid = generateSessionId(p.name);
    const now = new Date().toISOString();

    // Write to ref immediately — available to all async callbacks without waiting for re-render
    sessionRef.current = { sessionId: sid, participant: p, startedAt: now };

    setParticipant(p);
    setStartedAt(now);
    setPhase('loading');

    // Notify admin immediately that someone has started
    fetch('/api/interview-started', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stakeholder: p })
    }).catch(() => {});

    try {
      const initMessages = [{ role: 'user', content: 'Please begin the interview. Introduce yourself briefly and start the requirements gathering session.' }];
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: initMessages, stakeholder: p })
      });
      const data = await response.json();
      if (data.content?.[0]) {
        const firstMsg = { role: 'assistant', content: data.content[0].text, timestamp: new Date().toISOString() };
        const initialMessages = [firstMsg];
        sessionRef.messagesSnapshot = initialMessages;
        setMessages(initialMessages);
        doAutoSave(initialMessages);
        setPhase('chat');
      } else if (data.error === 'RATE_LIMIT') {
        setMessages([{ role: 'assistant', content: 'The AI is temporarily busy — please wait 30 seconds then try starting the interview again.', timestamp: new Date().toISOString() }]);
        setPhase('chat');
      } else {
        setMessages([{ role: 'assistant', content: `Error: ${data.error || 'Could not start interview. Please check the API key.'}`, timestamp: new Date().toISOString() }]);
        setPhase('chat');
      }
    } catch {
      setMessages([{ role: 'assistant', content: 'Connection error. Please ensure the server is running and try again.', timestamp: new Date().toISOString() }]);
      setPhase('chat');
    }
  };

  // Silent auto-save — uses sessionRef so it always has fresh values. No email.
  const doAutoSave = async (currentMessages) => {
    const { sessionId, participant: p, startedAt: sa } = sessionRef.current;
    if (!p || !sessionId || !currentMessages || currentMessages.length === 0) return;
    const cleanMessages = currentMessages.map(m => {
      if (m.attachment?.type === 'image') {
        return { ...m, attachment: { type: 'image', name: m.attachment.name } };
      }
      return m;
    });
    try {
      const resp = await fetch('/api/save-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stakeholder: p,
          messages: cleanMessages,
          startedAt: sa,
          completedAt: new Date().toISOString(),
          sessionId,
          sendEmail: false
        })
      });
      const data = await resp.json();
      if (data.success) {
        setLastAutoSave(new Date().toISOString());
      } else {
        // Visible warning — the save actually failed
        console.error('Auto-save failed:', data.error);
        setSaveStatus({ error: `Auto-save failed: ${data.error || 'unknown error'}. Please screenshot this conversation.` });
      }
    } catch (err) {
      console.error('Auto-save network error:', err);
      setSaveStatus({ error: 'Could not reach the server to save. Please screenshot this conversation.' });
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && !pendingFile) || loading) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      ...(pendingFile ? { attachment: pendingFile } : {})
    };

    const updated = [...messages, userMsg];
    sessionRef.messagesSnapshot = updated;
    setMessages(updated);
    setInput('');
    setPendingFile(null);
    setLoading(true);

    const attemptChat = async (messagesSnapshot, attempt = 1) => {
      try {
        const apiMessages = buildApiMessages(messagesSnapshot);
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, stakeholder: sessionRef.current.participant })
        });
        const data = await response.json();
        if (data.content?.[0]) {
          const aiMsg = { role: 'assistant', content: data.content[0].text, timestamp: new Date().toISOString() };
          const finalMessages = [...messagesSnapshot, aiMsg];
          sessionRef.messagesSnapshot = finalMessages;
          setMessages(finalMessages);
          doAutoSave(finalMessages);
        } else if (data.error === 'RATE_LIMIT') {
          if (attempt < 4) {
            // Auto-retry with increasing delay (5s, 10s, 20s)
            const delay = attempt * 5000;
            setMessages(prev => {
              const retryMsg = { role: 'assistant', content: `One moment — I'm catching my breath. Retrying in ${delay/1000} seconds...`, timestamp: new Date().toISOString(), _isRetry: true };
              return [...prev, retryMsg];
            });
            await new Promise(r => setTimeout(r, delay));
            // Remove the retry notice and try again
            setMessages(prev => prev.filter(m => !m._isRetry));
            return attemptChat(messagesSnapshot, attempt + 1);
          } else {
            setMessages(prev => [...prev, { role: 'assistant', content: 'The AI is temporarily busy due to high demand. Please wait 30 seconds and send your message again — your progress is saved.', timestamp: new Date().toISOString() }]);
          }
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error || 'No response'}`, timestamp: new Date().toISOString() }]);
        }
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.', timestamp: new Date().toISOString() }]);
      } finally {
        setLoading(false);
      }
    };

    try {
      await attemptChat(updated);
    } catch {
      setLoading(false);
    }
  };

  // Manual save — shows confirmation banner AND sends email notification
  const saveTranscript = async (silent = false) => {
    const { sessionId, participant: p, startedAt: sa } = sessionRef.current;
    const currentMessages = sessionRef.messagesSnapshot || messages;
    if (!p || currentMessages.length === 0) return;
    if (!silent) setSaveStatus('saving');
    try {
      // Strip binary image data
      const cleanMessages = currentMessages.map(m => {
        if (m.attachment?.type === 'image') return { ...m, attachment: { type: 'image', name: m.attachment.name } };
        return m;
      });
      const r = await fetch('/api/save-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stakeholder: p,
          messages: cleanMessages,
          startedAt: sa,
          completedAt: new Date().toISOString(),
          sessionId,
          sendEmail: true
        })
      });
      const data = await r.json();
      if (!silent) setSaveStatus(data.success ? { ok: true, filename: data.filename } : { error: data.error });
      if (data.success) setLastAutoSave(new Date().toISOString());
    } catch {
      if (!silent) setSaveStatus({ error: 'Failed to save.' });
    }
  };

  const downloadTranscript = () => {
    const currentMessages = sessionRef.messagesSnapshot || messages;
    const p = sessionRef.current.participant;
    if (!p || currentMessages.length === 0) return;
    const transcript = {
      metadata: {
        stakeholder: p,
        startedAt: sessionRef.current.startedAt,
        completedAt: new Date().toISOString(),
        totalMessages: currentMessages.length,
        organization: 'Canadian Manufacturers & Exporters (CME)',
        projectContext: 'CME Event Management Platform Requirements Gathering'
      },
      conversation: currentMessages.map((m, i) => ({
        turn: i + 1,
        role: m.role,
        content: m.content,
        attachment: m.attachment ? { name: m.attachment.name, type: m.attachment.type } : undefined,
        timestamp: m.timestamp
      })),
      savedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview_${p.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const endSession = async () => {
    const { sessionId } = sessionRef.current;
    const currentMessages = sessionRef.messagesSnapshot || messages;
    if (currentMessages.length > 0) {
      // 1. Save latest version to DB (no email from save endpoint)
      await doAutoSave(currentMessages);
      // 2. Email full transcript from DB
      if (sessionId) {
        fetch('/api/interview-completed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        }).catch(() => {});
      }
    }
    sessionRef.current = { sessionId: null, participant: null, startedAt: null };
    sessionRef.messagesSnapshot = [];
    setPhase('welcome');
    setMessages([]);
    setSaveStatus(null);
    setParticipant(null);
    setStartedAt(null);
    setLastAutoSave(null);
    setPendingFile(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setErrors({});
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const attachment = await readFileAsAttachment(file);
      setPendingFile(attachment);
    } catch {
      alert('Could not read that file. Please try a different format.');
    }
    e.target.value = '';
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const initials = participant ? (participant.firstName[0] + participant.lastName[0]).toUpperCase() : 'U';

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-logos">
          <img src="/cme-logo.png" alt="CME" />
          <div className="logo-divider" />
          <img src="/ec-logo.png" alt="eCommerce Canada" />
        </div>
        <div className="header-right">
          {kbStatus && (
            <span className={`kb-pill ${kbStatus.loaded ? 'loaded' : ''}`}>
              {kbStatus.loaded ? `KB ${(kbStatus.size/1000).toFixed(1)}k chars` : 'KB not found'}
            </span>
          )}
          {phase === 'chat' && (
            <>
              <button className="btn-ghost" onClick={() => saveTranscript(false)}>Save Transcript</button>
              <button className="btn-ghost" onClick={downloadTranscript}>Download JSON</button>
            </>
          )}
        </div>
      </header>

      <div className="main">
        {/* Welcome / Start Screen */}
        {phase === 'welcome' && (
          <div className="welcome-screen">
            <div className="welcome-card">
              <div className="welcome-logos">
                <img src="/cme-logo.png" alt="CME" />
                <div className="welcome-logo-divider" />
                <img src="/ec-logo.png" alt="eCommerce Canada" />
              </div>
              <h1>Event Platform Requirements Interview</h1>
              <p>
                Welcome to the CME Event Management Platform requirements gathering tool. This AI-facilitated interview will collect your needs, pain points, and workflow requirements. Please enter your details to begin.
              </p>

              <div className="form-row">
                <div>
                  <label className="form-label">First Name</label>
                  <input
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Jane"
                    value={firstName}
                    onChange={e => { setFirstName(e.target.value); setErrors(p => ({...p, firstName: ''})); }}
                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                  />
                  {errors.firstName && <div className="form-error">{errors.firstName}</div>}
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Smith"
                    value={lastName}
                    onChange={e => { setLastName(e.target.value); setErrors(p => ({...p, lastName: ''})); }}
                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                  />
                  {errors.lastName && <div className="form-error">{errors.lastName}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  placeholder="jane.smith@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <button className="btn-start" onClick={handleStart}>
                Begin Interview
              </button>

              <div className="privacy-note">
                Your responses will be recorded and used solely for CME event management platform requirements analysis. This session is facilitated by an AI interviewer.
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {phase === 'loading' && (
          <div className="welcome-screen">
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Starting your interview session...</div>
            </div>
          </div>
        )}

        {/* Chat Screen */}
        {phase === 'chat' && (
          <div className="chat-layout">
            <div className="session-bar">
              <div className="session-info">
                <h2>{participant?.name}</h2>
                <p>
                  {participant?.email} &nbsp;·&nbsp; {messages.length} message{messages.length !== 1 ? 's' : ''} &nbsp;·&nbsp; Started {formatTime(startedAt)}
                  {lastAutoSave && <span style={{ color: 'var(--success)', marginLeft: 8 }}>· ✓ Saved {formatTime(lastAutoSave)}</span>}
                </p>
              </div>
              <div className="session-actions">
                <button className="btn-danger" onClick={endSession}>End Session</button>
              </div>
            </div>

            {saveStatus?.ok && (
              <div className="save-banner">✓ Your interview has been saved. Thank you!</div>
            )}
            {saveStatus?.error && (
              <div className="save-banner error">✗ {saveStatus.error}</div>
            )}

            <div className="messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className={`avatar ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                    {msg.role === 'assistant' ? 'AI' : initials}
                  </div>
                  <div className={`bubble ${msg.role === 'assistant' ? 'ai' : 'user'}`} style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                    {msg.attachment && (
                      <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(0,0,0,0.06)', borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {msg.attachment.type === 'image'
                          ? <span>🖼 {msg.attachment.name}</span>
                          : <span>📎 {msg.attachment.name}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <div className="avatar ai">AI</div>
                  <div className="bubble ai">
                    <div className="typing-indicator">
                      <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              {pendingFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#EFF6FF', borderRadius: 8, marginBottom: 8, fontSize: 13, color: '#1D4ED8' }}>
                  {pendingFile.type === 'image' ? '🖼' : '📎'} <strong>{pendingFile.name}</strong> attached
                  <button onClick={() => setPendingFile(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 16, lineHeight: 1 }}>×</button>
                </div>
              )}
              <div className="input-row">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.csv,.xlsx,.xls,.txt,.pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <button
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach a file (image, spreadsheet, CSV)"
                  disabled={loading}
                >
                  <AttachIcon />
                </button>
                <textarea
                  className="chat-textarea"
                  placeholder={`Reply as ${participant?.firstName}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                />
                <button className="send-btn" onClick={sendMessage} disabled={(!input.trim() && !pendingFile) || loading}>
                  <SendIcon />
                </button>
              </div>
              <div className="input-hint">Enter to send &nbsp;·&nbsp; Shift+Enter for new line &nbsp;·&nbsp; 📎 attach images or spreadsheets</div>
              <div className="input-hint" style={{ marginTop: 4, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '4px 10px', fontSize: 11 }}>
                When you are finished, please click <strong>Save Transcript</strong> (top right) or <strong>End Session</strong> to submit your responses.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
