import api from "../../../shared/api/axios";

export const taskApi = {
  getAll: (projectId) => api.get("/tasks", { params: { projectId } }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  transitionStatus: (id, newStatus) =>
    api.patch(`/tasks/${id}/status`, { newStatus }),
  generateAISummary: (id) => api.post(`/tasks/${id}/ai-summary`),
  getDashboard: () => api.get("/tasks/dashboard"),
};
