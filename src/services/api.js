const API_BASE_URL = "http://127.0.0.1:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const request = async (method, path, body, useAuth = false) => {
  const headers = useAuth
    ? getAuthHeaders()
    : { "Content-Type": "application/json" };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error("Erro na requisicao.");
    error.response = {
      status: response.status,
      data,
    };
    throw error;
  }

  console.log("[API RESPONSE]", {
    method,
    url: path,
    status: response.status,
    data,
  });

  return {
    data,
    status: response.status,
  };
};

export const api = {
  post: (path, body) => request("POST", path, body),
  get: (path, useAuth = false) => request("GET", path, undefined, useAuth),
  patch: (path, body, useAuth = false) => request("PATCH", path, body, useAuth),
};
