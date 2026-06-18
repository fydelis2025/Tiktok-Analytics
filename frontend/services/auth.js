const TOKEN_KEY = 'session_token';
const USER_KEY = 'user_data';

export function getSessionToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSessionToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUserData() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setUserData(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
}

export function isAuthenticated() {
  return !!getSessionToken();
}