import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '@/types';

interface ChatState {
  messages: Record<string, ChatMessage[]>; // Keyed by companionId
  isTyping: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: {},
  isTyping: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ companionId: string; message: ChatMessage }>) => {
      const { companionId, message } = action.payload;
      if (!state.messages[companionId]) {
        state.messages[companionId] = [];
      }
      state.messages[companionId].push(message);
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ companionId: string; messages: ChatMessage[] }>) => {
      const { companionId, messages } = action.payload;
      state.messages[companionId] = messages;
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      state.messages[action.payload] = [];
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { addMessage, setTyping, clearMessages, setError, setMessages } = chatSlice.actions;
export default chatSlice.reducer;
