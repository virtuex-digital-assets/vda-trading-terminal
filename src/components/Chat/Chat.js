import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';

const DEMO_CONVERSATIONS = [
  { id: 'C1', title: 'Support - Alice Johnson', type: 'support', lastMessage: 'Thank you for your help!', unread: 2, time: '10:32' },
  { id: 'C2', title: 'Internal - Risk Team', type: 'group', lastMessage: 'Margin call alert for account...', unread: 0, time: '09:15' },
  { id: 'C3', title: 'Bob Chen', type: 'direct', lastMessage: 'Deposit request submitted', unread: 1, time: 'Yesterday' },
];

const DEMO_MESSAGES = {
  C1: [
    { id: 'M1', sender: 'Alice Johnson', content: 'Hello, I need help with my withdrawal.', own: false, time: '10:25' },
    { id: 'M2', sender: 'Support Agent', content: 'Hi Alice! I can help you with that. What is the issue?', own: true, time: '10:27' },
    { id: 'M3', sender: 'Alice Johnson', content: 'My withdrawal has been pending for 3 days.', own: false, time: '10:29' },
    { id: 'M4', sender: 'Support Agent', content: 'I can see your withdrawal request. Let me escalate this.', own: true, time: '10:30' },
    { id: 'M5', sender: 'Alice Johnson', content: 'Thank you for your help!', own: false, time: '10:32' },
  ],
  C2: [
    { id: 'M6', sender: 'Risk Team', content: 'Margin call alert for account ACC-2234', own: false, time: '09:15' },
  ],
  C3: [
    { id: 'M7', sender: 'Bob Chen', content: 'Deposit request submitted', own: false, time: 'Yesterday' },
  ],
};

function initials(title) {
  return title.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const Chat = () => {
  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [selectedId, setSelectedId] = useState(null);
  const [inputText, setInputText] = useState('');
  const threadRef = useRef(null);

  const selectedConv = conversations.find((c) => c.id === selectedId);
  const currentMessages = selectedId ? (messages[selectedId] || []) : [];

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [currentMessages]);

  const handleSelectConversation = (id) => {
    setSelectedId(id);
    setConversations((prev) =>
      prev.map((c) => c.id === id ? { ...c, unread: 0 } : c)
    );
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    const newMsg = {
      id: `M${Date.now()}`,
      sender: 'Support Agent',
      content: inputText.trim(),
      own: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, lastMessage: newMsg.content, time: newMsg.time }
          : c
      )
    );
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-wrap">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span className="chat-sidebar-title">💬 Messages</span>
          <button className="chat-new-btn">+ New</button>
        </div>
        <div className="conversation-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item${selectedId === conv.id ? ' active' : ''}`}
              onClick={() => handleSelectConversation(conv.id)}
            >
              <div className={`conv-avatar ${conv.type}`}>{initials(conv.title)}</div>
              <div className="conv-info">
                <div className="conv-name-row">
                  <span className="conv-name">{conv.title}</span>
                  <span className={`conv-type-badge ${conv.type}`}>{conv.type}</span>
                </div>
                <div className="conv-preview">{conv.lastMessage}</div>
              </div>
              <div className="conv-meta">
                <span className="conv-time">{conv.time}</span>
                {conv.unread > 0 && (
                  <span className="unread-badge">{conv.unread}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main panel ──────────────────────────────────────────────────── */}
      <div className="chat-main">
        {selectedConv ? (
          <>
            <div className="chat-main-header">
              <div className={`conv-avatar ${selectedConv.type}`} style={{ width: 32, height: 32, fontSize: 12 }}>
                {initials(selectedConv.title)}
              </div>
              <div>
                <div className="chat-main-title">{selectedConv.title}</div>
                <div className="chat-main-subtitle">{currentMessages.length} messages</div>
              </div>
              <span className={`conv-type-badge ${selectedConv.type}`} style={{ marginLeft: 'auto' }}>
                {selectedConv.type}
              </span>
            </div>

            <div className="message-thread" ref={threadRef}>
              {currentMessages.map((msg) => (
                <div key={msg.id} className={`message-group ${msg.own ? 'own' : 'other'}`}>
                  {!msg.own && <div className="message-sender">{msg.sender}</div>}
                  <div className={`message-bubble ${msg.own ? 'own' : 'other'}`}>
                    {msg.content}
                  </div>
                  <div className="message-time">{msg.time}</div>
                </div>
              ))}
            </div>

            <div className="message-input-bar">
              <textarea
                className="message-input"
                rows={1}
                placeholder="Type a message… (Enter to send)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="message-send-btn"
                onClick={handleSend}
                disabled={!inputText.trim()}
              >
                Send ➤
              </button>
            </div>
          </>
        ) : (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-text">No conversation selected</div>
            <div className="chat-empty-sub">Choose a conversation from the sidebar to start messaging</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
