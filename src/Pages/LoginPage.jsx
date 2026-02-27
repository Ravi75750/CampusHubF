import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginPage({ isModal }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      toast.success("Login successful!");
      navigate("/feed");
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Account not found. Please register first.");
      } else {
        toast.error(err.response?.data?.message || "Login failed");
      }
      // setError(err.response?.data?.message || "Login failed"); // Optional: keep inline error if desired, but toast is requested
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className={`max-w-md mx-auto ${isModal ? '' : 'pt-32 pb-12 p-6'}`}>
      <div className={`${isModal ? '' : 'p-6 border rounded-lg bg-slate-800 border-slate-700 shadow-lg'}`}>
        <h1 className="text-xl font-semibold mb-4 text-white">Login</h1>
        {error && <div className="mb-3 text-sm text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-sm block mb-1 text-slate-300 font-semibold">Email, Mobile, or ID</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm bg-slate-900 border-slate-600 text-white"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              type="text"
              required
              placeholder="Enter Email, Mobile, or ID"
            />
          </div>
          <div>
            <label className="text-sm block mb-1 text-slate-300 font-semibold">Password</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm bg-slate-900 border-slate-600 text-white"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              type="password"
              required
            />
          </div>
          <button
            disabled={loading}
            className="mt-2 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
        <div className="mt-3 text-xs">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
