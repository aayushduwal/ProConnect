import axios from "axios";

// use Render URL in production, localhost for dev
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Example: Register user
export const registerUser = async (formData) => {
  try {
    const response = await API.post("/auth/register", formData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

// Example: Login user
export const loginUser = async (formData) => {
  try {
    const response = await API.post("/auth/login", formData);
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export default API;
