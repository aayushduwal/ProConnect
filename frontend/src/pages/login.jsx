import { useState } from "react";
import api from "../api/api";
import { saveSession } from "../utils/auth";

function Login() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/auth/login", formData);
      console.log("Login success:", res.data);

      // ✅ Save session (user + token)
      saveSession(res.data.user, res.data.token);

      // ✅ Show success message
      setMessage("✅ Login successful!");

      // ✅ Redirect to homepage after 1 sec
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

      // Optional: clear form
      setFormData({ identifier: "", password: "" });
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "❌ Login failed. Please try again.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Login to ProConnect
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Username or Email</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
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
            disabled={loading}
            className={`w-full p-2 rounded font-semibold transition-all ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <a href="/" className="text-green-400 hover:underline">
            Sign up
          </a>
        </p>

        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
