import axios from "axios";

// Soporta CRA (REACT_APP_API) y Vite (VITE_API); fallback a localhost
const baseURL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API) ||
  process.env.REACT_APP_API ||
  "http://localhost:5050/api";

const api = axios.create({ baseURL });

export default api;
