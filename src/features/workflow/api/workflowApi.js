import api from "../../../shared/api/axios";

export const workflowApi = {
  get: () => api.get("/workflows"),
  update: (data) => api.put("/workflows", data),
};
