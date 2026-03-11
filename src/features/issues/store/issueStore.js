import { create } from "zustand";
import { issueApi } from "../api/issueApi";

export const useIssueStore = create((set, get) => ({
  issues: [],
  selectedIssue: null,
  loading: false,
  error: null,

  fetchIssues: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await issueApi.getAll();
      set({ issues: data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch issues",
        loading: false,
      });
    }
  },

  fetchIssueById: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await issueApi.getById(id);
      set({ selectedIssue: data, loading: false });
      return data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Issue not found",
        loading: false,
      });
    }
  },

  createIssue: async (payload) => {
    const { data } = await issueApi.create(payload);
    set((s) => ({ issues: [data, ...s.issues] }));
    return data;
  },

  updateIssue: async (id, payload) => {
    const { data } = await issueApi.update(id, payload);
    set((s) => ({
      issues: s.issues.map((i) => (i._id === id ? data : i)),
      selectedIssue: s.selectedIssue?._id === id ? data : s.selectedIssue,
    }));
    return data;
  },

  deleteIssue: async (id) => {
    await issueApi.delete(id);
    set((s) => ({ issues: s.issues.filter((i) => i._id !== id) }));
  },

  transitionStatus: async (id, newStatus) => {
    const { data } = await issueApi.transitionStatus(id, newStatus);
    set((s) => ({
      issues: s.issues.map((i) => (i._id === id ? data : i)),
      selectedIssue: s.selectedIssue?._id === id ? data : s.selectedIssue,
    }));
    return data;
  },

  generateAISummary: async (id) => {
    const { data } = await issueApi.generateAISummary(id);
    set((s) => ({
      selectedIssue: s.selectedIssue?._id === id ? data : s.selectedIssue,
    }));
    return data;
  },

  applySocketUpdate: ({ issueId, status }) => {
    set((s) => ({
      issues: s.issues.map((i) => (i._id === issueId ? { ...i, status } : i)),
      selectedIssue:
        s.selectedIssue?._id === issueId
          ? { ...s.selectedIssue, status }
          : s.selectedIssue,
    }));
  },

  clearSelected: () => set({ selectedIssue: null }),
}));
