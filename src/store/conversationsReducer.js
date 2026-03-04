const STORAGE_KEY = 'vda_conversations';

const loadConversations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveConversations = (conversations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage not available
  }
};

const ADD_MESSAGE = 'conversations/ADD_MESSAGE';
const START_CONVERSATION = 'conversations/START_CONVERSATION';
const DELETE_CONVERSATION = 'conversations/DELETE_CONVERSATION';

const initialState = {
  conversations: loadConversations(),
  activeConversationId: null,
};

const conversationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_CONVERSATION: {
      const newConversation = {
        id: crypto.randomUUID(),
        title: action.payload.title || 'New Conversation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      const conversations = [newConversation, ...state.conversations];
      saveConversations(conversations);
      return {
        ...state,
        conversations,
        activeConversationId: newConversation.id,
      };
    }

    case ADD_MESSAGE: {
      const conversations = state.conversations.map((conv) => {
        if (conv.id !== action.payload.conversationId) return conv;
        const messages = [...conv.messages, action.payload.message];
        const title =
          conv.messages.length === 0 && action.payload.message.role === 'user'
            ? action.payload.message.text.slice(0, 50)
            : conv.title;
        return {
          ...conv,
          messages,
          title,
          updatedAt: new Date().toISOString(),
        };
      });
      saveConversations(conversations);
      return { ...state, conversations };
    }

    case DELETE_CONVERSATION: {
      const conversations = state.conversations.filter(
        (conv) => conv.id !== action.payload.id
      );
      saveConversations(conversations);
      const activeConversationId =
        state.activeConversationId === action.payload.id
          ? null
          : state.activeConversationId;
      return { ...state, conversations, activeConversationId };
    }

    default:
      return state;
  }
};

export const startConversation = (title) => ({
  type: START_CONVERSATION,
  payload: { title },
});

export const addMessage = (conversationId, message) => ({
  type: ADD_MESSAGE,
  payload: { conversationId, message },
});

export const deleteConversation = (id) => ({
  type: DELETE_CONVERSATION,
  payload: { id },
});

export default conversationsReducer;
