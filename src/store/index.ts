import { create } from 'zustand';
import type { Personality, CandidateItem, PurchaseApplication, TrialResult, Feedback, UsageLog, FilterParams, User } from '../types';

interface AppStore {
  user: User | null;
  isAuthenticated: boolean;
  
  personalities: Personality[];
  filters: FilterParams;
  candidateList: CandidateItem[];
  compareList: Personality[];
  trialResults: TrialResult[];
  applications: PurchaseApplication[];
  usageData: UsageLog[];
  feedbackData: Feedback[];

  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  
  setPersonalities: (personalities: Personality[]) => void;
  setFilters: (filters: FilterParams) => void;
  addToCandidateList: (personality: Personality) => void;
  removeFromCandidateList: (personalityId: string) => void;
  clearCandidateList: () => void;
  
  setCompareList: (personalities: Personality[]) => void;
  addToCompareList: (personality: Personality) => void;
  removeFromCompareList: (personalityId: string) => void;
  clearCompareList: () => void;
  
  setTrialResults: (results: TrialResult[]) => void;
  clearTrialResults: () => void;
  
  setApplications: (applications: PurchaseApplication[]) => void;
  addApplication: (application: PurchaseApplication) => void;
  updateApplicationStatus: (applicationId: string, status: 'pending' | 'approved' | 'rejected') => void;
  
  setUsageData: (data: UsageLog[]) => void;
  setFeedbackData: (data: Feedback[]) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: { id: '1', email: 'admin@example.com', role: 'admin' },
  isAuthenticated: true,
  
  personalities: [],
  filters: {
    industry: [],
    taskType: [],
    complianceLevel: [],
    responseStyle: [],
  },
  candidateList: [],
  compareList: [],
  trialResults: [],
  applications: [],
  usageData: [],
  feedbackData: [],

  setUser: (user) => set({ user }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  
  setPersonalities: (personalities) => set({ personalities }),
  setFilters: (filters) => set({ filters }),
  
  addToCandidateList: (personality) => set((state) => ({
    candidateList: [...state.candidateList, {
      id: `${personality.id}-${Date.now()}`,
      personality_id: personality.id,
      user_id: state.user?.id || '',
      added_at: new Date().toISOString(),
      personality,
    }],
  })),
  
  removeFromCandidateList: (personalityId) => set((state) => ({
    candidateList: state.candidateList.filter(item => item.personality_id !== personalityId),
  })),
  
  clearCandidateList: () => set({ candidateList: [] }),
  
  setCompareList: (personalities) => set({ compareList: personalities }),
  
  addToCompareList: (personality) => set((state) => {
    if (state.compareList.length >= 5) return state;
    if (state.compareList.some(p => p.id === personality.id)) return state;
    return { compareList: [...state.compareList, personality] };
  }),
  
  removeFromCompareList: (personalityId) => set((state) => ({
    compareList: state.compareList.filter(p => p.id !== personalityId),
  })),
  
  clearCompareList: () => set({ compareList: [] }),
  
  setTrialResults: (results) => set({ trialResults: results }),
  clearTrialResults: () => set({ trialResults: [] }),
  
  setApplications: (applications) => set({ applications }),
  
  addApplication: (application) => set((state) => ({
    applications: [...state.applications, application],
  })),
  
  updateApplicationStatus: (applicationId, status) => set((state) => ({
    applications: state.applications.map(app => 
      app.id === applicationId ? { ...app, status } : app
    ),
  })),
  
  setUsageData: (data) => set({ usageData: data }),
  setFeedbackData: (data) => set({ feedbackData: data }),
}));
