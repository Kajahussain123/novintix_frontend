import api from "../../../shared/api/axios";

export const userApi = {
  getAll: () => api.get("/users"),
  invite: (data) => api.post("/users", data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
};
