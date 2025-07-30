import { jwtDecode } from "jwt-decode";

export const KEY_TOKEN = "accessToken";
export const KEY_REFRESH_TOKEN = "refreshToken";

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

export const getExpirationFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);

    return decoded.exp ? new Date(decoded.exp * 1000) : null; // exp là thời gian hết hạn
  } catch {
    return null;
  }
}

export const isTokenExpiringSoon = (thresholdSeconds = 60) => {
  const expiration = getExpirationFromToken();
  if (!expiration) return true;

  const now = new Date();
  const timeLeft = expiration.getTime() - now.getTime();
  return timeLeft < thresholdSeconds * 1000;
};
