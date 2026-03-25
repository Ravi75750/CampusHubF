import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

/* ---------- ICONS ---------- */
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
);
const ReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="m4.84 21 8.1-14a2 2 0 0 1 3.42 0l8.1 14A2 2 0 0 1 21.08 24H2.92a2 2 0 0 1-1.66-3Z" /><path d="m3 21 8.1-14a2 2 0 0 1 3.42 0l8.1 14" /></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const BanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 14.14 14.14" /></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
);
const ComplaintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);

export default function AdminPanelPage() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState("dashboard"); // sidebar selection

  // State
  const [users, setUsers] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [reportsData, setReportsData] = useState({ posts: [], users: [], teacherComplaints: [], studentComplaints: [] });
  const [archivedPosts, setArchivedPosts] = useState([]);

  // Forms
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "", course: "BCA", idCardNumber: "" });
  const [newNotice, setNewNotice] = useState({ title: "", content: "", important: false });
  const [landingImageFile, setLandingImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "Admin") return;
    refreshData();
  }, [user, activeView]);

  function refreshData() {
    api.get("/admin/users").then(res => setUsers(res.data));
    api.get("/admin/pending-teachers").then(res => setPendingTeachers(res.data));
    api.get("/admin/notices").then(res => setNotices(res.data));
    api.get("/admin/reports").then(res => setReportsData(res.data));
    api.get("/admin/archived-posts").then(res => setArchivedPosts(res.data));
  }

  // --- Actions ---
  async function approveTeacher(id) {
    if (!window.confirm("Approve this teacher account?")) return;
    try { await api.patch(`/admin/approve-teacher/${id}`); refreshData(); } catch (err) { alert("Failed"); }
  }

  async function createStudent(e) {
    e.preventDefault();
    try { await api.post("/admin/create-student", newStudent); alert("Student Created"); refreshData(); setNewStudent({ name: "", email: "", password: "", course: "BCA", idCardNumber: "" }); } catch (err) { alert("Failed: " + err.response?.data?.message); }
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;
    try { await api.delete(`/admin/users/${id}`); refreshData(); } catch (err) { alert("Failed"); }
  }

  async function createNotice(e) {
    e.preventDefault();
    try { await api.post("/admin/notices", newNotice); alert("Notice Posted"); refreshData(); setNewNotice({ title: "", content: "", important: false }); } catch (err) { alert("Failed"); }
  }

  async function deleteNotice(id) {
    if (!window.confirm("Delete notice?")) return;
    try { await api.delete(`/admin/notices/${id}`); refreshData(); } catch (err) { alert("Failed"); }
  }

  async function banUser(id) {
    const days = prompt("Enter ban duration in days:", "7");
    if (!days) return;
    try { await api.post("/moderation/ban", { userId: id, durationInDays: parseInt(days) }); alert("User banned"); refreshData(); } catch (err) { alert("Failed"); }
  }

  async function unbanUser(id) {
    if (!window.confirm("Unban this user?")) return;
    try { await api.post("/moderation/unban", { userId: id }); alert("User unbanned"); refreshData(); } catch (err) { alert("Failed"); }
  }

  async function restorePost(id) {
    if (!window.confirm("Restore this post?")) return;
    try { await api.patch(`/admin/restore-post/${id}`); refreshData(); } catch (err) { alert("Restored"); }
  }

  async function updateLandingImage(e) {
    e.preventDefault();
    if (!landingImageFile) return alert("Please select an image");
    
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("landingPageImage", landingImageFile);

    try {
      await api.put("/admin/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Landing page image updated successfully!");
      setLandingImageFile(null);
    } catch (err) {
      alert("Failed to update image: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUploadingImage(false);
    }
  }

  if (!user || user.role !== "Admin") return <div className="p-4">Admin access required.</div>;

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { id: "reports", label: "Reports", icon: <ReportIcon /> },
    { id: "teacher-complaints", label: "Teacher's Complaint", icon: <ComplaintIcon /> },
    { id: "student-complaints", label: "Student Complaint", icon: <UserIcon /> },
    { id: "banned", label: "Banned", icon: <BanIcon /> },
    { id: "deleted", label: "Deleted", icon: <TrashIcon /> },
    { id: "settings", label: "Site Settings", icon: <SettingsIcon /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Controls</h2>
        </div>
        <nav className="flex-1 px-2 space-y-1 py-4">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeView === item.id
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
              <span className={activeView === item.id ? "text-indigo-500" : "text-slate-400"}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeView.replace("-", " ")}</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and monitor platform activity.</p>
          </div>
          <div className="text-xs text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            Logged in as <b>{user.name}</b>
          </div>
        </header>

        {/* Dashboard View (Users, Approvals, Notices) */}
        {activeView === "dashboard" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Users Overview</h3>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{users.length}</span>
                  <span className="text-sm text-slate-500 mb-1">Total Members</span>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Pending Approvals</h3>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-orange-500">{pendingTeachers.length}</span>
                  <span className="text-sm text-slate-500 mb-1">Teachers awaiting</span>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Active Notices</h3>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-indigo-500">{notices.length}</span>
                  <span className="text-sm text-slate-500 mb-1">Announcements</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold">Recent Users</h3>
                    <button className="text-xs text-indigo-500 hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left">User</th>
                          <th className="px-4 py-3 text-left">Role</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.slice(0, 10).map(u => (
                          <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                              {u.name}
                              <div className="text-xs font-normal text-slate-400">{u.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${u.role === 'Teacher' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                }`}>{u.role}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {u.isBanned ? <span className="text-red-500">Banned</span> : <span className="text-green-500">Active</span>}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => deleteUser(u._id)} className="text-red-400 hover:text-red-600">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="font-bold mb-4">Create Student</h3>
                  <form onSubmit={createStudent} className="space-y-3">
                    <input className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Name" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} required />
                    <input className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Email" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} required />
                    <input className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Password" value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} required />
                    <select className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newStudent.course} onChange={e => setNewStudent({ ...newStudent, course: e.target.value })}>
                      <option>BCA</option><option>MCA</option><option>Tally</option><option>ADCA</option><option>DCA</option>
                    </select>
                    <input className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ID Card No." value={newStudent.idCardNumber} onChange={e => setNewStudent({ ...newStudent, idCardNumber: e.target.value })} required />
                    <button className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform">Create</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports View */}
        {activeView === "reports" && (
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Reported Content (Detailed)</h3>
              <div className="grid gap-4">
                {reportsData.posts.map(post => (
                  <div key={post._id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-indigo-500 uppercase mb-1">Post ID: {post._id}</div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">"{post.text || post.content}"</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.reports.map((r, i) => (
                          <span key={i} className="px-2 py-1 bg-red-50 dark:bg-red-900/10 text-red-600 text-[10px] rounded-lg border border-red-100 dark:border-red-900/30">
                            {r.reason} (by {r.reporterId?.name})
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Dismiss</button>
                      <button onClick={() => { /* ban logic */ }} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20">Action</button>
                    </div>
                  </div>
                ))}
                {reportsData.posts.length === 0 && <p className="text-slate-500">No reports at this time.</p>}
              </div>
            </section>
          </div>
        )}

        {/* Teacher's Complaints */}
        {activeView === "teacher-complaints" && (
          <div className="space-y-6">
            <div className="grid gap-4">
              {reportsData.teacherComplaints.map(report => (
                <div key={report._id} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">T</div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{report.reporter?.name}</div>
                        <div className="text-xs text-slate-500">Teacher • {new Date(report.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${report.status === 'Pending' ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                      }`}>{report.status}</span>
                  </div>
                  <p className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 italic mb-4">
                    "{report.description || report.reason}"
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Target Type: <b>{report.targetType}</b></span>
                    <div className="flex gap-2">
                      <button className="text-indigo-500 hover:underline">View Details</button>
                      <button className="text-green-500 hover:underline">Mark Solved</button>
                    </div>
                  </div>
                </div>
              ))}
              {reportsData.teacherComplaints.length === 0 && <p className="text-slate-500">No teacher complaints found.</p>}
            </div>
          </div>
        )}

        {/* Student Complaints */}
        {activeView === "student-complaints" && (
          <div className="space-y-6">
            <div className="grid gap-4">
              {reportsData.studentComplaints.map(report => (
                <div key={report._id} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">S</div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{report.reporter?.name}</div>
                        <div className="text-xs text-slate-500">Student • {new Date(report.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-bold uppercase">{report.reason}</span>
                  </div>
                  <p className="border-l-4 border-slate-200 dark:border-slate-700 pl-4 py-1 text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {report.description || "No additional details provided."}
                  </p>
                  <div className="flex justify-end gap-3">
                    <button className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold">Dismiss</button>
                    <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Resolve</button>
                  </div>
                </div>
              ))}
              {reportsData.studentComplaints.length === 0 && <p className="text-slate-500">No student complaints found.</p>}
            </div>
          </div>
        )}

        {/* Banned View */}
        {activeView === "banned" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-sm">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-500">User</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500">Ban Duration</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.filter(u => u.isBanned).map(u => (
                  <tr key={u._id} className="hover:bg-red-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {u.banExpiresAt ? (
                        <span className="text-orange-500">Expires {new Date(u.banExpiresAt).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-red-600 font-bold uppercase text-[10px]">Permanent</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => unbanUser(u._id)} className="text-green-600 font-bold hover:underline">Unban User</button>
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.isBanned).length === 0 && (
                  <tr><td colSpan="3" className="p-8 text-center text-slate-500 italic">No banned users currently.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Deleted View (Archived Posts) */}
        {activeView === "deleted" && (
          <div className="grid gap-6">
            {archivedPosts.map(post => (
              <div key={post._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm border-l-4 border-l-red-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">P</div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">Post by {post.author?.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Archived {new Date(post.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  {post.text || post.content}
                </p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => restorePost(post._id)} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold">Restore Post</button>
                  <button className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl font-bold">Permanent Delete</button>
                </div>
              </div>
            ))}
            {archivedPosts.length === 0 && (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                No deleted or archived posts to show.
              </div>
            )}
          </div>
        )}

        {/* Site Settings View */}
        {activeView === "settings" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-2xl">
            <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-4">Landing Page Configuration</h3>
            
            <form onSubmit={updateLandingImage} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Background Image</label>
                <div className="flex flex-col gap-4">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setLandingImageFile(e.target.files[0])}
                    className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-600
                    hover:file:bg-indigo-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-400
                    cursor-pointer"
                  />
                  {landingImageFile && (
                    <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      Selected: <span className="font-bold text-slate-700 dark:text-slate-300">{landingImageFile.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">Upload a high-resolution image for the main landing page background. Recommended ratio 16:9.</p>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="submit" 
                  disabled={isUploadingImage || !landingImageFile}
                  className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all ${isUploadingImage || !landingImageFile ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:scale-[1.02]'}`}
                >
                  {isUploadingImage ? "Setting Image to Upload..." : "Upload & Save Global Image"}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
