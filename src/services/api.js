const API_BASE_URL = "http://127.0.0.1:8000";

const request = async (method, path, body) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
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
};
