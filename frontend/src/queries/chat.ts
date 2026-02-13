import { useMutation } from '@tanstack/react-query';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ChatRequest {
  companion_id: string;
  message: string;
  user_id?: string;
}

interface ChatResponse {
  response: string;
}

// Send chat message mutation
export const useSendMessage = () => {
  const { user } = useDynamicContext();
  
  return useMutation({
    mutationFn: async (data: ChatRequest): Promise<ChatResponse> => {
      const response = await fetch(`${API_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.userId}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
  });
};

interface Message {
  id: string;
  user_id: string;
  companion_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ChatHistoryResponse {
  messages: Message[];
}

export const useGetChatHistory = () => {
  const { user } = useDynamicContext();

  return useMutation({
    mutationFn: async (companionId: string): Promise<ChatHistoryResponse> => {
      const response = await fetch(`${API_URL}/api/v1/chat/${companionId}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.userId}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      return response.json();
    },
  });
};

