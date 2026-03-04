import React from 'react';

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ConversationView = ({ conversation, onBack }) => {
  if (!conversation) return null;

  return (
    <div className="conversation-view">
      <div className="conversation-view-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <h2 className="conversation-view-title">{conversation.title}</h2>
      </div>

      <div className="messages">
        {conversation.messages.length === 0 ? (
          <p className="empty-state">No messages in this conversation.</p>
        ) : (
          conversation.messages.map((msg, index) => (
            <div key={index} className={`message message-${msg.role}`}>
              <span className="message-role">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </span>
              <p className="message-text">{msg.text}</p>
              <span className="message-time">{formatDate(msg.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationView;
