import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5050",
  withCredentials: true, // <<-- envía/recibe la cookie
});

// Iniciar sesión
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

// Obtener sesión actual
export const me = () => api.get("/auth/me");

// Cerrar sesión
export const logout = () => api.post("/auth/logout");

export default api;