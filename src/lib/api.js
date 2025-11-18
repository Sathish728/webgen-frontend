import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

//create axios instance
export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Token expired → try refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await api.get("/refresh");
        if (res.data.success) {
          localStorage.setItem("accessToken", res.data.accessToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        localStorage.removeItem("accessToken");
      }
    }

    return Promise.reject(error);
  }
);
