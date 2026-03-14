/**
 * Chat controller.
 *
 * Manages conversations and messages between users.
 */

const {
  conversations, chatMessages,
  createConversation, createMessage,
} = require('../models/chatStore');

// ── Conversations ─────────────────────────────────────────────────────────────

function listConversations(req, res) {
  try {
    const userId = req.user.id;
    const list = [...conversations.values()]
      .filter((c) => c.participants.includes(userId))
      .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createConversationHandler(req, res) {
  try {
    const { participants, title, type } = req.body;
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'participants array is required' });
    }
    // Ensure the creator is included
    const allParticipants = [...new Set([req.user.id, ...participants])];
    const conversation = createConversation({ participants: allParticipants, title, type });
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getConversation(req, res) {
  try {
    const conversation = conversations.get(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    // Check access
    if (!conversation.participants.includes(req.user.id) &&
        req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const messages = [...chatMessages.values()]
      .filter((m) => m.conversationId === req.params.id)
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

    res.json({ ...conversation, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Messages ──────────────────────────────────────────────────────────────────

function sendMessage(req, res) {
  try {
    const conversation = conversations.get(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    if (!conversation.participants.includes(req.user.id) &&
        req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const message = createMessage({
      conversationId: req.params.id,
      senderId: req.user.id,
      content,
      readBy: [req.user.id],
    });

    // Update conversation lastMessage and updatedAt
    conversation.lastMessage = { id: message.id, content, senderId: req.user.id, createdAt: message.createdAt };
    conversation.updatedAt = message.createdAt;

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function markRead(req, res) {
  try {
    const conversation = conversations.get(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const userId = req.user.id;
    let updated = 0;
    for (const msg of chatMessages.values()) {
      if (msg.conversationId === req.params.id && !msg.readBy.includes(userId)) {
        msg.readBy.push(userId);
        updated++;
      }
    }

    res.json({ message: `Marked ${updated} message(s) as read` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listConversations,
  createConversation: createConversationHandler,
  getConversation,
  sendMessage,
  markRead,
};
