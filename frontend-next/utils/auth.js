// utils/auth.js
export const saveSession = (user, token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  }
};

export const getUser = () => {
  if (typeof window !== "undefined") {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }
  return null;
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const isLoggedIn = () => !!getToken();

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login"; // redirect after logout
  }
};
