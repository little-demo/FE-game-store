import { jwtDecode } from "jwt-decode";

export const KEY_TOKEN = "accessToken";

export const setToken = (token) => {
  localStorage.setItem(KEY_TOKEN, token);
};

export const getToken = () => {
  return localStorage.getItem(KEY_TOKEN);
};

export const removeToken = () => {
  return localStorage.removeItem(KEY_TOKEN);
};

export const getRoleFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.scope || null; // scope là quyền
  } catch {
    return null;
  }
};

export const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.sub || null; // hoặc decoded.id tùy JWT bạn thiết kế
  } catch {
    return null;
  }
};
