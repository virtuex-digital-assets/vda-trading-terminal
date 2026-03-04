import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage } from '../store/conversationsReducer';

const ASSISTANT_RESPONSES = [
  'I can help you analyze market trends. What asset are you interested in?',
  'Based on current data, the market shows mixed signals. Would you like a detailed breakdown?',
  'That is a great question. Let me pull up the latest data for you.',
  'I see. Could you provide more context about your trading strategy?',
  'The current market conditions suggest caution. Diversification is recommended.',
];

const ChatInterface = ({ conversation, onShowHistory }) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const replyTimerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || !conversation) return;

    const userMessage = {
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };
    dispatch(addMessage(conversation.id, userMessage));
    setInput('');

    const conversationId = conversation.id;
    replyTimerRef.current = setTimeout(() => {
      const reply =
        ASSISTANT_RESPONSES[
          Math.floor(Math.random() * ASSISTANT_RESPONSES.length)
        ];
      const assistantMessage = {
        role: 'assistant',
        text: reply,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(conversationId, assistantMessage));
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="chat-interface chat-empty">
        <p>Select a conversation or start a new one.</p>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2 className="chat-title">{conversation.title}</h2>
        <button className="btn-history" onClick={onShowHistory}>
          History
        </button>
      </div>

      <div className="chat-messages">
        {conversation.messages.map((msg, index) => (
          <div key={index} className={`message message-${msg.role}`}>
            <span className="message-role">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </span>
            <p className="message-text">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about market data, trading strategies…"
          rows={2}
        />
        <button
          className="btn-send"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
