import { create } from 'zustand';
import type { Case, DiaryEntry, Document, Settings, User } from '../types';

interface AppState {
  cases: Case[];
  diaryEntries: DiaryEntry[];
  documents: Document[];
  settings: Settings | null;
  user: User | null;
  token: string | null;
  
  // Auth
  login: (badgeNumber: string, password: string) => Promise<void>;
  logout: () => void;

  // Data fetching
  fetchCases: () => Promise<void>;
  fetchDiaryEntries: (caseId: string) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  
  // Mutations
  updateSettings: (newSettings: any) => Promise<void>;
  createFIR: (data: any) => Promise<any>;
  updateCaseStatus: (caseId: string, status: string) => Promise<void>;
  addDiaryEntry: (data: any) => Promise<void>;
  generateReport: (caseId: string, docType: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  cases: [],
  diaryEntries: [],
  documents: [],
  settings: null,
  user: null,
  token: null,

  login: async (badgeNumber, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeNumber, password })
      });
      const data = await res.json();
      if (data.success) {
        set({ user: data.user, token: data.token });
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  },

  logout: () => {
    set({ user: null, token: null });
  },

  fetchCases: async () => {
    try {
      const res = await fetch('/api/cases');
      const data = await res.json();
      set({ cases: data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchDiaryEntries: async (caseId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/diary`);
      const data = await res.json();
      set({ diaryEntries: data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchDocuments: async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      set({ documents: data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      set({ settings: data });
    } catch (err) {
      console.error(err);
    }
  },

  updateSettings: async (newSettings: any) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      set({ settings: data });
    } catch (err) {
      console.error(err);
    }
  },

  createFIR: async (firData: any) => {
    try {
      const res = await fetch('/api/firs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firData)
      });
      const data = await res.json();
      await get().fetchCases();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateCaseStatus: async (caseId: string, status: string) => {
    try {
      await fetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await get().fetchCases();
    } catch (err) {
      console.error(err);
    }
  },

  addDiaryEntry: async (data: any) => {
    try {
      await fetch(`/api/cases/${data.caseId}/diary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      await get().fetchDiaryEntries(data.caseId);
      await get().fetchCases();
    } catch (err) {
      console.error(err);
    }
  },

  generateReport: async (caseId: string, docType: string) => {
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, docType })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate report');
      }
      await get().fetchDocuments();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}));
