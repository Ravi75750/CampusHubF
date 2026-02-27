import { useState, useCallback } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import ImageCropper from "../components/ImageCropper.jsx";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("Student");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    course: "BCA",
    idCardNumber: "",
    mobileNumber: ""
  });
  const [avatarBlob, setAvatarBlob] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [cropImage, setCropImage] = useState(null); // The raw image to crop

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropImage(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = (croppedBlob) => {
    setAvatarBlob(croppedBlob);
    setAvatarPreview(URL.createObjectURL(croppedBlob));
    setCropImage(null); // Close cropper
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    formData.append('role', role);
    if (avatarBlob) {
      formData.append('avatar', avatarBlob, 'avatar.jpg');
    }

    try {
      const res = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.user && res.data.user.role === 'Teacher' && !res.data.user.isApproved) {
        setMsg(res.data.message || "Registration successful. Please wait for admin approval.");
        setMsg(res.data.message || "Registration successful. Please wait for admin approval.");
        setForm({ name: "", username: "", email: "", password: "", course: "BCA", idCardNumber: "", mobileNumber: "" });
        setAvatarPreview(null);
        setAvatarPreview(null);
        setAvatarBlob(null);
      } else {
        login(res.data.token, res.data.user);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-28 p-6 border rounded-lg bg-slate-800 border-slate-700">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>

      {/* Role Selection Tabs */}
      <div className="flex bg-slate-900/50 p-1 rounded-xl mb-6">
        <button
          onClick={() => setRole("Student")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === "Student"
            ? "bg-slate-800 text-indigo-400 shadow-sm"
            : "text-slate-500 hover:text-slate-300"
            }`}
        >
          Student
        </button>
        <button
          onClick={() => setRole("Teacher")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === "Teacher"
            ? "bg-slate-800 text-indigo-400 shadow-sm"
            : "text-slate-500 hover:text-slate-300"
            }`}
        >
          Teacher
        </button>
      </div>

      {error && <div className="mb-3 text-sm text-red-500 bg-red-900/20 p-2 rounded">{error}</div>}
      {msg && <div className="mb-3 text-sm text-green-400 bg-green-900/20 p-2 rounded">{msg}</div>}

      {!msg && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-900 border border-slate-700">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>
                </div>
              )}
            </div>
            <label className="mt-2 text-sm text-indigo-600 cursor-pointer hover:underline">
              Upload Picture
              <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="text-sm block mb-1">Name</label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              placeholder="John Doe"
            />
          </div>

          {role === "Student" && (
            <div>
              <label className="text-sm block mb-1">Username</label>
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.replace(/\s+/g, '').toLowerCase() }))}
                required
                placeholder="johndoe123"
              />
            </div>
          )}

          {role === "Student" && (
            <div>
              <label className="text-sm block mb-1">Course</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.course}
                onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
              >
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="Tally">Tally</option>
                <option value="ADCA">ADCA</option>
                <option value="DCA">DCA</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-sm block mb-1">Mobile Number</label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={form.mobileNumber}
              onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))}
              required
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Institute's ID Card Number</label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={form.idCardNumber}
              onChange={e => setForm(f => ({ ...f, idCardNumber: e.target.value }))}
              required
              placeholder="ID-123456"
            />
          </div>

          {role === "Student" && (
            <div>
              <label className="text-sm font-medium block mb-1.5 ml-1">Email</label>
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                type="email"
                required
                placeholder="student@institute.edu"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium block mb-1.5 ml-1">Password</label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              type="password"
              required
              placeholder="••••••••"
            />
          </div>
          <button disabled={loading} className="mt-4 btn-primary w-full py-3 disabled:opacity-50">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      )}
      <div className="mt-3 text-xs">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </div>

      {cropImage && (
        <ImageCropper
          imageSrc={cropImage}
          onCancel={() => setCropImage(null)}
          onCropComplete={onCropComplete}
        />
      )}

    </div>
  );
}
