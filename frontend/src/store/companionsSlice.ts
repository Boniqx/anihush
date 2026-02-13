import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Companion, CompanionWithAffinity, StoriesGrouped } from '@/types';

interface CompanionsState {
  companions: Companion[];
  selectedCompanion: CompanionWithAffinity | null;
  stories: StoriesGrouped[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanionsState = {
  companions: [],
  selectedCompanion: null,
  stories: [],
  isLoading: false,
  error: null,
};

export const companionsSlice = createSlice({
  name: 'companions',
  initialState,
  reducers: {
    setCompanions: (state, action: PayloadAction<Companion[]>) => {
      state.companions = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSelectedCompanion: (state, action: PayloadAction<CompanionWithAffinity | null>) => {
      state.selectedCompanion = action.payload;
    },
    setStories: (state, action: PayloadAction<StoriesGrouped[]>) => {
      state.stories = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { 
  setCompanions, 
  setSelectedCompanion, 
  setStories,
  setLoading, 
  setError 
} = companionsSlice.actions;

export default companionsSlice.reducer;
