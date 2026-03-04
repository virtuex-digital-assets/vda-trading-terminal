import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { startConversation } from './store/conversationsReducer';
import ConversationList from './components/ConversationList';
import ConversationView from './components/ConversationView';
import ChatInterface from './components/ChatInterface';
import './App.css';

const VIEW = {
  CHAT: 'chat',
  HISTORY: 'history',
  VIEW_CONVERSATION: 'view_conversation',
};

const App = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversationId } = useSelector(
    (state) => state.conversations
  );

  const [view, setView] = useState(VIEW.CHAT);
  const [viewingConversationId, setViewingConversationId] = useState(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const viewingConversation = conversations.find(
    (c) => c.id === viewingConversationId
  );

  const handleNewChat = () => {
    dispatch(startConversation('New Conversation'));
    setView(VIEW.CHAT);
  };

  const handleSelectConversation = (id) => {
    setViewingConversationId(id);
    setView(VIEW.VIEW_CONVERSATION);
  };

  const handleShowHistory = () => {
    setView(VIEW.HISTORY);
  };

  const handleBackFromView = () => {
    setView(VIEW.HISTORY);
    setViewingConversationId(null);
  };

  const handleBackToChat = () => {
    setView(VIEW.CHAT);
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">VDA</span>
        <h1 className="app-title">Trading Terminal</h1>
        <nav className="app-nav">
          <button
            className={`nav-btn ${view === VIEW.CHAT ? 'active' : ''}`}
            onClick={handleBackToChat}
          >
            Chat
          </button>
          <button
            className={`nav-btn ${view === VIEW.HISTORY || view === VIEW.VIEW_CONVERSATION ? 'active' : ''}`}
            onClick={handleShowHistory}
          >
            History
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === VIEW.CHAT && (
          <ChatInterface
            conversation={activeConversation}
            onShowHistory={handleShowHistory}
          />
        )}

        {view === VIEW.HISTORY && (
          <ConversationList
            conversations={conversations}
            onSelect={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        )}

        {view === VIEW.VIEW_CONVERSATION && (
          <ConversationView
            conversation={viewingConversation}
            onBack={handleBackFromView}
          />
        )}
      </main>
    </div>
  );
};

export default App;
