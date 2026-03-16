const STORAGE_KEY = "eventSphere_auth";

export function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  return getAuth()?.user || null;
}

export function getToken() {
  return getAuth()?.token || null;
}

export function setAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event("authChanged"));
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("authChanged"));
  window.location.href = "/login";
}
