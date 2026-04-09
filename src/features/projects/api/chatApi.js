import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const chatApi = {
  getMessages: async (projectId) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/chat/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  sendMessage: async (projectId, content) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/chat/${projectId}`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};
