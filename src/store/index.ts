import { create } from 'zustand';
import type { 
  Personality, 
  CandidateItem, 
  PurchaseApplication, 
  TrialResult, 
  Feedback, 
  UsageLog, 
  FilterParams, 
  User,
  Employee,
  PersonalityAssignment
} from '../types';

interface AppStore {
  user: User | null;
  isAuthenticated: boolean;
  
  personalities: Personality[];
  riskPersonalityIds: string[];
  filters: FilterParams;
  candidateList: CandidateItem[];
  compareList: Personality[];
  trialResults: TrialResult[];
  applications: PurchaseApplication[];
  usageData: UsageLog[];
  feedbackData: Feedback[];
  
  employees: Employee[];
  assignments: PersonalityAssignment[];
  
  quota: number;

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
  
  addRiskPersonality: (personalityId: string) => void;
  removeRiskPersonality: (personalityId: string) => void;
  setRiskPersonalities: (ids: string[]) => void;
  
  setQuota: (quota: number) => void;
  
  setEmployees: (employees: Employee[]) => void;
  addAssignment: (assignment: Omit<PersonalityAssignment, 'id' | 'assigned_at'>) => void;
  
  getValidCandidateList: () => CandidateItem[];
}

const localStorageKey = 'ai-personality-market-storage';

const loadFromStorage = (): Partial<AppStore> => {
  try {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
  return {};
};

const savedData = loadFromStorage();

export const useAppStore = create<AppStore>((set, get) => ({
  user: { id: '1', email: 'admin@example.com', role: 'admin' },
  isAuthenticated: true,
  
  personalities: [],
  riskPersonalityIds: savedData.riskPersonalityIds || [],
  filters: {
    industry: [],
    taskType: [],
    complianceLevel: [],
    responseStyle: [],
  },
  candidateList: savedData.candidateList || [],
  compareList: [],
  trialResults: [],
  applications: savedData.applications || [],
  usageData: [],
  feedbackData: [],
  
  employees: savedData.employees || [],
  assignments: savedData.assignments || [],
  
  quota: savedData.quota ?? 50000,

  setUser: (user) => set({ user }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  
  setPersonalities: (personalities) => set({ personalities }),
  setFilters: (filters) => set({ filters }),
  
  addToCandidateList: (personality) => {
    const state = get();
    if (state.riskPersonalityIds.includes(personality.id)) {
      return;
    }
    if (state.candidateList.some(item => item.personality_id === personality.id)) {
      return;
    }
    set((state) => ({
      candidateList: [...state.candidateList, {
        id: `${personality.id}-${Date.now()}`,
        personality_id: personality.id,
        user_id: state.user?.id || '',
        added_at: new Date().toISOString(),
        personality,
      }],
    }));
    saveToStorage(get());
  },
  
  removeFromCandidateList: (personalityId) => {
    set((state) => ({
      candidateList: state.candidateList.filter(item => item.personality_id !== personalityId),
    }));
    saveToStorage(get());
  },
  
  clearCandidateList: () => {
    set({ candidateList: [] });
    saveToStorage(get());
  },
  
  setCompareList: (personalities) => set({ compareList: personalities }),
  
  addToCompareList: (personality) => set((state) => {
    if (state.compareList.length >= 5) return state;
    if (state.compareList.some(p => p.id === personality.id)) return state;
    if (state.riskPersonalityIds.includes(personality.id)) return state;
    return { compareList: [...state.compareList, personality] };
  }),
  
  removeFromCompareList: (personalityId) => set((state) => ({
    compareList: state.compareList.filter(p => p.id !== personalityId),
  })),
  
  clearCompareList: () => set({ compareList: [] }),
  
  setTrialResults: (results) => set({ trialResults: results }),
  clearTrialResults: () => set({ trialResults: [] }),
  
  setApplications: (applications) => {
    set({ applications });
    saveToStorage(get());
  },
  
  addApplication: (application) => {
    set((state) => ({
      applications: [...state.applications, application],
    }));
    saveToStorage(get());
  },
  
  updateApplicationStatus: (applicationId, status) => {
    set((state) => ({
      applications: state.applications.map(app => 
        app.id === applicationId ? { ...app, status, approved_at: status === 'approved' ? new Date().toISOString() : app.approved_at } : app
      ),
    }));
    saveToStorage(get());
  },
  
  setUsageData: (data) => set({ usageData: data }),
  setFeedbackData: (data) => set({ feedbackData: data }),
  
  addRiskPersonality: (personalityId) => {
    set((state) => ({
      riskPersonalityIds: [...state.riskPersonalityIds, personalityId],
      compareList: state.compareList.filter(p => p.id !== personalityId),
      candidateList: state.candidateList.filter(item => item.personality_id !== personalityId),
    }));
    saveToStorage(get());
  },
  
  removeRiskPersonality: (personalityId) => {
    set((state) => ({
      riskPersonalityIds: state.riskPersonalityIds.filter(id => id !== personalityId),
    }));
    saveToStorage(get());
  },
  
  setRiskPersonalities: (ids) => {
    set((state) => ({
      riskPersonalityIds: ids,
      compareList: state.compareList.filter(p => !ids.includes(p.id)),
      candidateList: state.candidateList.filter(item => !ids.includes(item.personality_id)),
    }));
    saveToStorage(get());
  },
  
  setQuota: (quota) => {
    set({ quota });
    saveToStorage(get());
  },
  
  setEmployees: (employees) => {
    set({ employees });
    saveToStorage(get());
  },
  
  addAssignment: (assignment) => {
    const state = get();
    const existingAssignment = state.assignments.find(
      a => a.application_id === assignment.application_id && 
           a.employee_id === assignment.employee_id && 
           a.personality_id === assignment.personality_id
    );
    
    if (existingAssignment) {
      set((state) => ({
        assignments: state.assignments.map(a => 
          a.id === existingAssignment.id 
            ? { ...a, quantity: a.quantity + assignment.quantity }
            : a
        ),
      }));
    } else {
      set((state) => ({
        assignments: [...state.assignments, {
          ...assignment,
          id: `assign-${Date.now()}`,
          assigned_at: new Date().toISOString(),
        }],
      }));
    }
    saveToStorage(get());
  },
  
  getValidCandidateList: () => {
    const state = get();
    return state.candidateList.filter(item => !state.riskPersonalityIds.includes(item.personality_id));
  },
}));

const saveToStorage = (state: AppStore) => {
  try {
    const data = {
      applications: state.applications,
      riskPersonalityIds: state.riskPersonalityIds,
      quota: state.quota,
      employees: state.employees,
      assignments: state.assignments,
      candidateList: state.candidateList,
    };
    localStorage.setItem(localStorageKey, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
};

export const getAssignmentsByEmployee = (employeeId: string): PersonalityAssignment[] => {
  const state = useAppStore.getState();
  const rawAssignments = state.assignments
    .filter(a => a.employee_id === employeeId);
  
  const merged: Record<string, PersonalityAssignment> = {};
  rawAssignments.forEach(a => {
    const key = `${a.personality_id}`;
    if (merged[key]) {
      merged[key].quantity += a.quantity;
    } else {
      merged[key] = { ...a };
    }
  });
  
  return Object.values(merged).map(a => ({
    ...a,
    employee: state.employees.find(e => e.id === a.employee_id),
    personality: state.personalities.find(p => p.id === a.personality_id),
  }));
};

export const getAssignmentsByApplication = (applicationId: string): PersonalityAssignment[] => {
  const state = useAppStore.getState();
  const rawAssignments = state.assignments
    .filter(a => a.application_id === applicationId);
  
  const merged: Record<string, PersonalityAssignment> = {};
  rawAssignments.forEach(a => {
    const key = `${a.employee_id}-${a.personality_id}`;
    if (merged[key]) {
      merged[key].quantity += a.quantity;
    } else {
      merged[key] = { ...a };
    }
  });
  
  return Object.values(merged).map(a => ({
    ...a,
    employee: state.employees.find(e => e.id === a.employee_id),
    personality: state.personalities.find(p => p.id === a.personality_id),
  }));
};

export const getAllEmployeesWithAssignments = (): Array<{
  employee: Employee | undefined;
  assignments: PersonalityAssignment[];
  totalQuantity: number;
}> => {
  const state = useAppStore.getState();
  return state.employees.map(employee => {
    const assignments = getAssignmentsByEmployee(employee.id);
    return {
      employee,
      assignments,
      totalQuantity: assignments.reduce((sum, a) => sum + a.quantity, 0),
    };
  }).filter(item => item.totalQuantity > 0);
};
