import { useState, useCallback, useEffect } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import ImageCropper from "../components/ImageCropper.jsx";

// ICONS
const EyeIcon = ({ show }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-slate-600 transition-colors">
    {show ? (
      <>
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
      </>
    )}
  </svg>
);

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState("Student");
  const [step, setStep] = useState(1); // 1 = details, 2 = otp, 3 = profile pic
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    course: "", // Default empty to show placeholder
    idCardNumber: "", // Hidden for now based on clean UI request, but required by backend if Student/Teacher. Let's auto-generate or use a generic field if not provided by UI
    mobileNumber: "" // For teachers
  });
  const [usernameModified, setUsernameModified] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameAvail, setUsernameAvail] = useState(null);
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 digit OTP
  
  const [avatarBlob, setAvatarBlob] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [registeredData, setRegisteredData] = useState(null);

  // Auto-generate username from name
  useEffect(() => {
    if (form.name && !usernameModified && role === "Student") {
      const firstName = form.name.trim().split(" ")[0].toLowerCase();
      const gen = firstName.replace(/[^a-z0-9]/g, "");
      
      setForm(f => {
        const existingDigits = f.username.match(/\d+$/);
        const digits = existingDigits ? existingDigits[0] : Math.floor(1000 + Math.random() * 9000);
        return { ...f, username: `${gen}${digits}` };
      });
    }
  }, [form.name, usernameModified, role]);

  // Debounced username check
  useEffect(() => {
    if (!form.username || role !== "Student") {
      setUsernameAvail(null);
      return;
    }
    const timer = setTimeout(async () => {
      setUsernameLoading(true);
      try {
        const res = await api.get(`/auth/check-username/${form.username}`);
        setUsernameAvail(res.data.available);
      } catch (e) {
        setUsernameAvail(null);
      } finally {
        setUsernameLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.username, role]);


  async function handleStep1(e) {
    e.preventDefault();
    if (role === "Student" && usernameAvail === false) {
       return setError("Please choose a different username.");
    }
    if (!form.course && role === "Student") {
       return setError("Please select an academic course.");
    }
    
    setError("");
    setLoading(true);
    try {
      // Provide dummy idCardNumber if required by your existing model but not in new UI
      const submitData = { ...form, role, idCardNumber: form.idCardNumber || `ID-${Date.now()}` };
      await api.post("/auth/register-step-1", submitData);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2(e) {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) return setError("Please enter the complete 6-digit OTP.");
    
    setError("");
    setLoading(true);
    try {
      const submitData = { ...form, role, otp: otpString, idCardNumber: form.idCardNumber || `ID-${Date.now()}` };
      const res = await api.post("/auth/register-step-2", submitData);
      
      if (res.data.user?.isApproved === false) {
         // Teacher pending approval
         alert(res.data.message);
         navigate('/login');
         return;
      }
      
      // Store token internally to finalize picture
      setRegisteredData({ token: res.data.token, user: res.data.user });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep3(e) {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      if (avatarBlob && registeredData) {
        // We have to temporarily set token in axios to make this call
        localStorage.setItem("cc_token", registeredData.token);
        const formData = new FormData();
        formData.append("avatar", avatarBlob, "avatar.jpg");
        const res = await api.put("/auth/user", formData, { headers: { "Content-Type": "multipart/form-data" }});
        login(registeredData.token, res.data.user);
      } else {
        login(registeredData.token, registeredData.user);
      }
      navigate("/");
    } catch (err) {
      setError("Failed to upload profile picture. You can change it later.");
      login(registeredData.token, registeredData.user);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

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
    setCropImage(null);
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center pt-20 pb-4 px-4 sm:px-6 lg:px-8">
      
      {/* Container */}
      <div className="max-w-md w-full bg-[#101530] rounded-3xl py-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 border border-slate-100 relative overflow-hidden">
        
        {/* Step Indicator (Optional visual cue) */}
        

        {/* --- STEP 1: Details --- */}
        {step === 1 && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-xl font-bold py-1 text-white mb-2 text-center">Register Here</h1>
           
            
            <div className="flex bg-slate-100/80 p-1 rounded-xl mb-4">
              <button onClick={() => setRole("Student")} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${role === "Student" ? "bg-white text-[#f79a3d] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Student</button>
              <button onClick={() => setRole("Teacher")} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${role === "Teacher" ? "bg-white text-[#71eeff] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Teacher</button>
            </div>

            {error && <div className="mb-3 text-xs font-semibold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{error}</div>}

            <form onSubmit={handleStep1} className="space-y-3">
              
              <div className="grid grid-cols-2 gap-4">
                <div className={role === "Teacher" ? "col-span-2" : ""}>
                  <label className="block text-[10px] font-bold text-white uppercase tracking-wider mb-0.5 ml-1">Full Name</label>
                  <input
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border text-slate-700 border-slate-200 focus:border-[#005766] rounded-xl px-3 py-2 text-sm outline-none transition-all placeholder:text-slate-300"
                    placeholder="E.g. Ravi Sahani"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  />
                </div>
                {role === "Student" && (
                  <div>
                    <label className="block text-[10px] font-bold text-white uppercase tracking-wider mb-0.5 ml-1">Username</label>
                    <div className="relative">
                      <input
                        className={`w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border text-slate-700 border-slate-200 focus:border-[#005766] rounded-xl px-3 py-2 text-sm outline-none transition-all placeholder:text-slate-300 ${usernameAvail === false ? 'border-red-300 focus:border-red-400 bg-red-50/30' : ''}`}
                        placeholder="E.g. ravi1234"
                        value={form.username} 
                        onChange={e => {
                          setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') });
                          setUsernameModified(true);
                        }} 
                        required
                      />
                      {form.username && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {usernameLoading ? <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-[#005766] animate-spin inline-block"></span> :
                            usernameAvail === true ? <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> :
                            usernameAvail === false ? <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                          : null}
                        </div>
                      )}
                    </div>
                    {usernameAvail === false && <p className="text-[10px] text-red-500 mt-1 ml-1 absolute">Username strictly unavailable</p>}
                  </div>
                )}
              </div>

              {role === "Student" && (
                <div className="mt-1">
                  <label className="block text-[10px] font-bold text-white uppercase tracking-wider mb-0.5 ml-1">Academic Course</label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 text-slate-700 focus:border-[#005766] rounded-xl px-3 py-2 text-sm outline-none transition-all appearance-none cursor-pointer"
                      value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} required
                    >
                      <option value="" disabled>Choose your course</option>
                      <option value="BCA">Bachelor of Computer Applications (BCA)</option>
                      <option value="MCA">Master of Computer Applications (MCA)</option>
                      <option value="Tally">Tally / Accounting</option>
                      <option value="ADCA">Advanced Diploma in Comp. App. (ADCA)</option>
                      <option value="DCA">Diploma in Comp. App. (DCA)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              )}

              {role === "Teacher" && (
                <div>
                  <label className="block text-[10px] font-bold text-white uppercase tracking-wider mb-0.5 ml-1">Mobile Number</label>
                  <input
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border text-slate-700 border-slate-200 focus:border-[#005766] rounded-xl px-3 py-2 text-sm outline-none transition-all placeholder:text-slate-300"
                    placeholder="9876543210"
                    value={form.mobileNumber} onChange={e => setForm({ ...form, mobileNumber: e.target.value })} required
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-white uppercase tracking-wider mb-0.5 ml-1">Email Address</label>
                <input
                  type="email"
                  className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border text-slate-700 border-slate-200 focus:border-[#005766] rounded-xl px-3 py-2 text-sm outline-none transition-all placeholder:text-slate-300"
                  placeholder="vane@editorial.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white uppercase tracking-wider mb-0.5 ml-1">Security Key</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border text-slate-700 border-slate-200 focus:border-[#005766] rounded-xl px-3 py-2 text-sm outline-none transition-all placeholder:text-slate-300"
                    placeholder="••••••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 outline-none">
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide rounded-xl py-2.5 shadow-lg shadow-[#005766]/20 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100">
                  {loading ? "Submitting..." : "SUBMIT"}
                </button>
              </div>
            </form>
            
            <div className="text-center mt-4 text-xs text-slate-500">
               Already a member? <Link to="/login" className="font-bold text-[#005766] hover:underline">Log In</Link>
            </div>
          </div>
        )}

        {/* --- STEP 2: OTP Verification --- */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 absolute top-6 left-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h1 className="text-xl font-bold text-slate-800 mb-1 mt-4 text-center" style={{ fontFamily: '"Inter", sans-serif' }}>Verify Email</h1>
            <p className="text-slate-500 text-xs text-center mb-5 px-4">We've sent a 6-digit security code to <strong className="text-slate-700">{form.email}</strong>. Enter it below to confirm your identity.</p>

            {error && <div className="mb-4 text-xs font-semibold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 text-center">{error}</div>}

            <form onSubmit={handleStep2}>
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength="1"
                    className="w-10 h-12 bg-slate-50 border border-slate-200 focus:bg-white text-center text-xl font-bold rounded-lg text-[#005766] outline-none focus:border-[#005766] focus:ring-2 focus:ring-[#005766]/20 transition-all"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && i > 0) {
                        document.getElementById(`otp-${i - 1}`).focus();
                      }
                    }}
                  />
                ))}
              </div>

              <button disabled={loading} className="w-full bg-[#005766] hover:bg-[#004652] text-white font-bold tracking-wide rounded-xl py-2.5 shadow-lg shadow-[#005766]/20 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100">
                {loading ? "VERIFYING..." : "CONFIRM IDENTITY"}
              </button>
            </form>
          </div>
        )}

        {/* --- STEP 3: Profile Picture --- */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 duration-300 flex flex-col items-center">
            <h1 className="text-xl font-bold text-slate-800 mb-1 text-center" style={{ fontFamily: '"Inter", sans-serif' }}>You're In!</h1>
            <p className="text-slate-500 text-xs text-center mb-6 px-4">Let's put a face to the name. Choose an avatar or skip for now.</p>
            
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center mb-6 group cursor-pointer hover:border-[#005766] transition-colors">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-[#005766] transition-colors"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <span className="text-white text-xs font-bold uppercase tracking-wider">Upload</span>
              </div>
              <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

             <div className="w-full flex gap-3">
                <button disabled={loading} onClick={() => handleStep3()} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl py-2.5 transition-all">
                  Skip for now
                </button>
                <button disabled={loading || !avatarBlob} onClick={(e) => handleStep3(e)} className={`flex-1 font-bold rounded-xl py-2.5 transition-all ${!avatarBlob ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#005766] hover:bg-[#004652] text-white shadow-lg shadow-[#005766]/20'}`}>
                  {loading ? "Saving..." : "Save Image"}
                </button>
             </div>
          </div>
        )}

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
