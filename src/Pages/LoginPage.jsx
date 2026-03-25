import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginPage({ isModal }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLoginStep1(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login-step-1", form);
      if (res.data && res.data.userEmail) {
        setForm(f => ({ ...f, email: res.data.userEmail }));
      }
      setStep(2);
      toast.success("OTP sent to your email!");
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Account pending approval.");
      } else if (err.response?.status === 404) {
        toast.error("Account not found. Please register first.");
      } else {
        toast.error(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLoginStep2(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login-step-2", { email: form.email, otp });
      login(res.data.token, res.data.user);
      toast.success("Login successful!");
      navigate("/feed");
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("Invalid or expired OTP.");
      } else {
        toast.error(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className={`max-w-md mx-auto ${isModal ? '' : 'pt-32 pb-12 p-6'}`}>
      <div className={`${isModal ? '' : 'p-6 border rounded-lg bg-[#101530] border-slate-700 shadow-lg'}`}>
        <h1 className="text-xl font-semibold mb-4 text-white">Login</h1>
        {error && <div className="mb-3 text-sm text-red-500">{error}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleLoginStep1} className="flex flex-col gap-3">
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
              className="mt-2 bg-blue-600 text-xl text-white font-bold py-2 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginStep2} className="flex flex-col gap-3">
            <div>
              <label className="text-sm block mb-1 text-slate-300 font-semibold">Enter OTP</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm bg-slate-900 border-slate-600 text-white"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                type="text"
                required
                placeholder="Check your email for the OTP"
              />
            </div>
            <button
              disabled={loading}
              className="mt-2 bg-blue-600 text-xl text-white font-bold py-2 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-center text-xs text-slate-400 hover:text-white"
            >
              Back to login
            </button>
          </form>
        )}

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
