import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

api.interceptors.response.use(
  (response) => {
    console.log("[API RESPONSE]", {
      method: response.config?.method?.toUpperCase(),
      url: response.config?.url,
      status: response.status,
      data: response.data,
    });

    return response;
  },
  (error) => {
    console.error("[API ERROR]", {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  },
);
