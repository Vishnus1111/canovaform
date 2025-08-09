// src/services/api.js
import axios from "axios";

const instance = axios.create({
  baseURL: "/api/forms",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const formAPI = {
  createForm: (data) => instance.post("/save", data),
  getProjects: (userId) => instance.get(`/projects/${userId}`),
  // ... other methods
};
