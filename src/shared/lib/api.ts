import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.fitfolio.app",
    withCredentials: true, // send cookies if needed
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  // 🔐 Optional: attach JWT or session token automatically
  api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  // ⚠️ Optional: handle common API errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("Unauthorized — maybe redirect to login");
      }
      return Promise.reject(error);
    }
  );
  
  export { api };