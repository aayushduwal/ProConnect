import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // backend base URL
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
