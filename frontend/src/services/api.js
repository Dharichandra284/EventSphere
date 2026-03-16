import { getToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function buildHeaders(customHeaders = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw data || { message: "Something went wrong" };
  }

  return data;
}

export function apiUpload(path, formData) {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData,
    headers,
  }).then(async (res) => {
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw data || { message: "Upload failed" };
    return data;
  });
}
