import { useQuery } from '@tanstack/react-query';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { ChatListResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const useChats = () => {
  const { user } = useDynamicContext();

  return useQuery({
    queryKey: ['chats', user?.userId],
    queryFn: async (): Promise<ChatListResponse> => {
      if (!user?.userId) return { chats: [] };
      
      const response = await fetch(`${API_URL}/api/v1/chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.userId}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      return response.json();
    },
    enabled: !!user?.userId,
  });
};
