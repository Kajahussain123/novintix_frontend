import api from "../../../shared/api/axios";

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  sendOtp: (email) => api.post("/auth/send-otp", { email }),
};
