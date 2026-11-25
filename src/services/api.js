import {clearActiveContext} from "../utils/activeContext.js";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

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

const request = async (method, path, body, useAuth = false, isLogin, keepSessionOnUnauthorized = false) => {

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
    if(response.status === 401 && useAuth && !keepSessionOnUnauthorized) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("user");
      clearActiveContext();

      window.dispatchEvent(new CustomEvent("session-expired"));
    }
    const error = new Error("Erro na requisição.");
    error.response = {
      status: response.status,
      data,
    };
    throw error;
  }

  return {
    data,
    status: response.status,
  };
};

const clearExpiredSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("user");
  clearActiveContext();

  window.dispatchEvent(new CustomEvent("session-expired"));
};

const parseSseFrame = (frameText) => {
  const lines = frameText.split("\n");
  let eventName = "message";
  const dataLines = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim() || "message";
    } else if (line.startsWith("data:")) {
      const rawValue = line.slice(5);
      dataLines.push(rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue);
    }
  }

  if (dataLines.length === 0) return null;

  const rawData = dataLines.join("\n");
  try {
    return { event: eventName, data: JSON.parse(rawData) };
  } catch {
    return { event: eventName, data: rawData };
  }
};

const streamRequest = async (path, body, options = {}) => {
  const { useAuth = true, signal, onEvent } = options;
  const baseHeaders = useAuth ? getAuthHeaders() : { "Content-Type": "application/json" };
  const headers = {
    ...baseHeaders,
    Accept: "text/event-stream",
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (response.status === 401 && useAuth) {
      clearExpiredSession();
    }

    const error = new Error("Erro na requisição.");
    error.response = {
      status: response.status,
      data,
    };
    throw error;
  }

  if (!response.body) {
    throw new Error("Resposta de streaming indisponível.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        break;
      }

      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      let separatorIndex = buffer.indexOf("\n\n");
      while (separatorIndex !== -1) {
        const rawFrame = buffer.slice(0, separatorIndex).trim();
        buffer = buffer.slice(separatorIndex + 2);
        if (rawFrame) {
          const parsed = parseSseFrame(rawFrame);
          if (parsed) {
            onEvent?.(parsed);
          }
        }
        separatorIndex = buffer.indexOf("\n\n");
      }
    }

    const remaining = buffer.replace(/\r\n/g, "\n").trim();
    if (remaining) {
      const parsed = parseSseFrame(remaining);
      if (parsed) {
        onEvent?.(parsed);
      }
    }
  } finally {
    reader.releaseLock?.();
  }
};

export const api = {
  post: (path, body, isLogin=false, useAuth=false) => request("POST", path, body, useAuth, isLogin),
  streamPost: (path, body, options = {}) => streamRequest(path, body, options),
  get: (path, useAuth = false) => request("GET", path, undefined, useAuth),
  patch: (path, body, useAuth = false) => request("PATCH", path, body, useAuth),
  delete: (path, body, useAuth = false, options = {}) => request("DELETE", path, body, useAuth, false, options.keepSessionOnUnauthorized),
};
