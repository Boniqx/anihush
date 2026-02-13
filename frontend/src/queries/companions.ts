import { useQuery } from '@tanstack/react-query';
import { Companion, CompanionWithAffinity } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Fetch all companions
export const useCompanions = () => {
  return useQuery({
    queryKey: ['companions'],
    queryFn: async (): Promise<Companion[]> => {
      const response = await fetch(`${API_URL}/api/v1/companions`);
      if (!response.ok) {
        throw new Error('Failed to fetch companions');
      }
      const data = await response.json();
      return data.companions || [];
    },
  });
};

// Fetch single companion by ID
export const useCompanion = (id: string) => {
  return useQuery({
    queryKey: ['companion', id],
    queryFn: async (): Promise<CompanionWithAffinity> => {
      const response = await fetch(`${API_URL}/api/v1/companions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch companion');
      }
      return response.json();
    },
    enabled: !!id, // Only run if id exists
  });
};
