/**
 * In-memory chat data store.
 */

const { v4: uuidv4 } = require('uuid');

// ── Conversations ─────────────────────────────────────────────────────────────

const conversations = new Map();

// ── Messages ──────────────────────────────────────────────────────────────────

const chatMessages = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────

function createConversation(fields = {}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const conversation = {
    id,
    participants: fields.participants || [],
    title: fields.title || '',
    type: fields.type || 'direct',
    lastMessage: fields.lastMessage || null,
    createdAt: now,
    updatedAt: now,
  };
  conversations.set(id, conversation);
  return conversation;
}

function createMessage(fields = {}) {
  const id = uuidv4();
  const message = {
    id,
    conversationId: fields.conversationId || null,
    senderId: fields.senderId || null,
    content: fields.content || '',
    readBy: fields.readBy || [],
    createdAt: new Date().toISOString(),
  };
  chatMessages.set(id, message);
  return message;
}

module.exports = {
  conversations,
  chatMessages,
  createConversation,
  createMessage,
};
