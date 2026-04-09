import { create } from "zustand";
import { taskApi } from "../api/taskApi";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,

  fetchTasks: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await taskApi.getAll(projectId);
      set({ tasks: data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch tasks",
        loading: false,
      });
    }
  },

  fetchTaskById: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await taskApi.getById(id);
      set({ selectedTask: data, loading: false });
      return data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Task not found",
        loading: false,
      });
    }
  },

  createTask: async (payload) => {
    const { data } = await taskApi.create(payload);
    set((s) => ({ tasks: [data, ...s.tasks] }));
    return data;
  },

  updateTask: async (id, payload) => {
    const { data } = await taskApi.update(id, payload);
    set((s) => ({
      tasks: s.tasks.map((t) => (t._id === id ? data : t)),
      selectedTask: s.selectedTask?._id === id ? data : s.selectedTask,
    }));
    return data;
  },

  deleteTask: async (id) => {
    await taskApi.delete(id);
    set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) }));
  },

  transitionStatus: async (id, newStatus) => {
    const { data } = await taskApi.transitionStatus(id, newStatus);
    set((s) => ({
      tasks: s.tasks.map((t) => (t._id === id ? data : t)),
      selectedTask: s.selectedTask?._id === id ? data : s.selectedTask,
    }));
    return data;
  },

  generateAISummary: async (id) => {
    const { data } = await taskApi.generateAISummary(id);
    set((s) => ({
      selectedTask: s.selectedTask?._id === id ? data : s.selectedTask,
    }));
    return data;
  },

  applySocketUpdate: ({ taskId, status }) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t._id === taskId ? { ...t, status } : t)),
      selectedTask:
        s.selectedTask?._id === taskId
          ? { ...s.selectedTask, status }
          : s.selectedTask,
    }));
  },

  clearSelected: () => set({ selectedTask: null }),
}));
