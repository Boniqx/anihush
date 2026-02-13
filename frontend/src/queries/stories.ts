import { useQuery } from '@tanstack/react-query';
import { StoriesGrouped, Story } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface StoriesResponse {
  stories: StoriesGrouped[];
  count: number;
}

// Fetch all stories grouped by companion
export const useStories = () => {
  return useQuery({
    queryKey: ['stories'],
    queryFn: async (): Promise<StoriesGrouped[]> => {
      const response = await fetch(`${API_URL}/api/v1/stories`);

      console.log(response, "story response")
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      const data: StoriesResponse = await response.json();
      return data.stories;
    },
  });
};

interface StoryResponse {
  stories: Story[];
  count: number;
}

export const useStory = (companionId: string) => {
  return useQuery({
    queryKey: ['story', companionId],
    queryFn: async (): Promise<Story[]> => {
      if (!companionId) return [];
      const response = await fetch(`${API_URL}/api/v1/story/${companionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      const data: StoryResponse = await response.json();
      return data.stories;
    },
    enabled: !!companionId,
  });
};
