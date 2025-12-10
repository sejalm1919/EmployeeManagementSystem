import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
}

const STORAGE_KEY = 'ems_chat_messages';

// Load messages from LocalStorage
const loadMessagesFromStorage = (): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading messages from localStorage:', error);
    return [];
  }
};

// Save messages to LocalStorage
const saveMessagesToStorage = (messages: Message[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages to localStorage:', error);
  }
};

const initialState: ChatState = {
  messages: loadMessagesFromStorage(),
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Omit<Message, 'id' | 'timestamp'>>) => {
      const newMessage: Message = {
        ...action.payload,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      state.messages.push(newMessage);
      saveMessagesToStorage(state.messages);
    },
    markMessagesAsRead: (state, action: PayloadAction<{ sender: string; receiver: string }>) => {
      // This can be extended if you want to track read status
      // For now, we just ensure messages are loaded
      const { sender, receiver } = action.payload;
      // Filter logic can be added here if needed
    },
    clearAllMessages: (state) => {
      state.messages = [];
      saveMessagesToStorage([]);
    },
    loadMessages: (state) => {
      state.messages = loadMessagesFromStorage();
    },
    editMessage: (state, action: PayloadAction<{ id: string; text: string }>) => {
      const messageIndex = state.messages.findIndex((msg) => msg.id === action.payload.id);
      if (messageIndex !== -1) {
        state.messages[messageIndex].text = action.payload.text;
        saveMessagesToStorage(state.messages);
      }
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((msg) => msg.id !== action.payload);
      saveMessagesToStorage(state.messages);
    },
  },
});

export const { addMessage, markMessagesAsRead, clearAllMessages, loadMessages, editMessage, deleteMessage } = chatSlice.actions;
export default chatSlice.reducer;
