import api from "../../../shared/api/axios";

export const issueApi = {
  getAll: () => api.get("/issues"),
  getById: (id) => api.get(`/issues/${id}`),
  create: (data) => api.post("/issues", data),
  update: (id, data) => api.put(`/issues/${id}`, data),
  delete: (id) => api.delete(`/issues/${id}`),
  transitionStatus: (id, newStatus) =>
    api.patch(`/issues/${id}/status`, { newStatus }),
  generateAISummary: (id) => api.post(`/issues/${id}/ai-summary`),
  getDashboard: () => api.get("/issues/dashboard"),
};
