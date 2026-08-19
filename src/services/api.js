const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

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

const request = async (method, path, body, useAuth = false, isLogin) => {

  const headers = isLogin
  ? {"Content-Type": "application/x-www-form-urlencoded"}
  : useAuth ? getAuthHeaders() : {"Content-Type": "application/json"};

  const requestBody = body
  ? isLogin
    ? new URLSearchParams(body).toString()
    : JSON.stringify(body)
  : undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error("Erro na requisição.");
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
  post: (path, body, isLogin=false) => request("POST", path, body, false, isLogin),
  get: (path, useAuth = false) => request("GET", path, undefined, useAuth),
  patch: (path, body, useAuth = false) => request("PATCH", path, body, useAuth),
};
