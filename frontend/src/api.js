import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8080" : "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  withCredentials: true,
  withXSRFToken: true,
});

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method) && config.url !== "/api/auth/csrf") {
    await api.get("/api/auth/csrf");
  }
  return config;
});

export async function getCategories() {
  const { data } = await api.get("/api/categories");
  return data;
}

export async function getMatches(profile) {
  const { data } = await api.post("/api/schemes/match", profile);
  return data;
}

export async function getSchemes(category) {
  const { data } = await api.get("/api/schemes", {
    params: category ? { category } : undefined,
  });
  return data;
}

export async function askAssistant(question, language) {
  const { data } = await api.post("/api/assistant", { question, language }, { timeout: 45000 });
  return data;
}

export async function processDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/documents/parse", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

export async function loginUser(credentials) {
  const { data } = await api.post("/api/auth/login", credentials);
  return data;
}

export async function registerUser(account) {
  const { data } = await api.post("/api/auth/register", account);
  return data;
}

export async function logoutUser() {
  const { data } = await api.post("/api/auth/logout");
  return data;
}
