import { useState } from "react";
import api from "../api/api";
import { saveSession } from "../utils/auth";
const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", formData);

      // ✅ Save session immediately after signup
      saveSession(res.data.user, res.data.token);

      // ✅ Show success message
      setMessage("✅ Signup successful!");

      // ✅ Redirect to homepage after 1 second
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

      // Optional: clear form
      setFormData({ name: "", username: "", email: "", password: "" });
      console.log("Signup success:", res.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "❌ Signup failed! Try again.";
      setMessage(msg);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 focus:ring focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 focus:ring focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 focus:ring focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 focus:ring focus:ring-green-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 p-2 rounded font-semibold transition-all"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-green-400 hover:underline">
            Log in
          </a>
        </p>

        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default Signup;
