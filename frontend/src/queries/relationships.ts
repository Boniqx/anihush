import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface RelationshipData {
  found: boolean;
  affinity_score: number;
  current_mood: string;
  last_interaction_at?: string;
}

export const useRelationship = (companionId: string) => {
  return useQuery({
    queryKey: ['relationship', companionId],
    queryFn: async (): Promise<RelationshipData> => {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        // Return default "no relationship" if not logged in
        return { found: false, affinity_score: 0, current_mood: 'neutral' };
      }

      const response = await fetch(`${API_URL}/api/v1/relationship/${companionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch relationship');
      }

      return response.json();
    },
    enabled: !!companionId,
    staleTime: 1000 * 60, // 1 minute
  });
};

export interface InteractResponse {
  new_score: number;
  delta: number;
  new_mood: string;
  toast_message: string;
  reaction_video_url?: string;
}

export const useInteract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companionId,
      action,
      storyId,
    }: {
      companionId: string;
      action: string;
      storyId: string;
    }): Promise<InteractResponse> => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/api/v1/interact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companion_id: companionId,
          action,
          story_id: storyId,
        }),
      });

      if (!res.ok) throw new Error("Interaction failed");
      return res.json();
    },
    onMutate: async ({ companionId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['relationship', companionId] });

      // Snapshot previous value
      const previousRelationship = queryClient.getQueryData<RelationshipData>(['relationship', companionId]);

      // Optimistically update to the new value
      if (previousRelationship) {
        queryClient.setQueryData<RelationshipData>(['relationship', companionId], {
          ...previousRelationship,
          affinity_score: previousRelationship.affinity_score + 5, // Assume +5 for interaction
        });
      }

      return { previousRelationship };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousRelationship) {
        queryClient.setQueryData(
          ['relationship', newTodo.companionId],
          context.previousRelationship
        );
      }
    },
    onSettled: (data, error, variables) => {
        // If successful, update with actual data from server response if needed, 
        // but invalidating is safer to get the exact state including mood changes
        queryClient.invalidateQueries({ queryKey: ['relationship', variables.companionId] });
    },
  });
};
