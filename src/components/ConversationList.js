import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteConversation } from '../store/conversationsReducer';

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ConversationList = ({ conversations, onSelect, onNewChat }) => {
  const dispatch = useDispatch();

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      dispatch(deleteConversation(id));
    }
  };

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2>Conversations</h2>
        <button className="btn-new-chat" onClick={onNewChat}>
          + New Chat
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className="empty-state">
          No conversations yet. Start a new chat to get started.
        </p>
      ) : (
        <ul className="conversations">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className="conversation-item"
              onClick={() => onSelect(conv.id)}
            >
              <div className="conversation-item-content">
                <span className="conversation-title">{conv.title}</span>
                <span className="conversation-date">
                  {formatDate(conv.updatedAt)}
                </span>
                <span className="conversation-preview">
                  {conv.messages.length} message
                  {conv.messages.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                className="btn-delete"
                onClick={(e) => handleDelete(e, conv.id)}
                title="Delete conversation"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConversationList;
