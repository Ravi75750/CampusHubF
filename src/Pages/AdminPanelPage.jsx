import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminPanelPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  // State
  const [users, setUsers] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [reports, setReports] = useState({ posts: [], users: [] });

  // Forms
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "", course: "BCA", idCardNumber: "" });
  const [newNotice, setNewNotice] = useState({ title: "", content: "", important: false });

  useEffect(() => {
    if (!user || user.role !== "Admin") return;
    refreshData();
  }, [user, activeTab]);

  function refreshData() {
    if (activeTab === "users") api.get("/admin/users").then(res => setUsers(res.data));
    if (activeTab === "approvals") api.get("/admin/pending-teachers").then(res => setPendingTeachers(res.data));
    if (activeTab === "notices") api.get("/admin/notices").then(res => setNotices(res.data));
    if (activeTab === "reports") api.get("/admin/reports").then(res => setReports(res.data));
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

  if (!user || user.role !== "Admin") return <div className="p-4">Admin access required.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 pt-24 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        {["users", "approvals", "notices", "reports"].map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize font-medium transition-colors ${activeTab === tab ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Approvals Tab */}
      {activeTab === "approvals" && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Pending Teacher Approvals</h2>
          {pendingTeachers.length === 0 ? <p className="text-slate-500">No pending approvals.</p> : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 dark:bg-slate-800"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Mobile</th><th className="p-3">Action</th></tr></thead>
                <tbody>
                  {pendingTeachers.map(t => (
                    <tr key={t._id} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="p-3">{t.name}</td><td className="p-3">{t.email}</td><td className="p-3">{t.mobileNumber}</td>
                      <td className="p-3"><button onClick={() => approveTeacher(t._id)} className="text-green-600 hover:underline">Approve</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Notices Tab */}
      {activeTab === "notices" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border p-4 rounded-lg bg-white dark:bg-slate-800">
            <h3 className="font-semibold mb-3">Post New Notice</h3>
            <form onSubmit={createNotice} className="flex flex-col gap-3">
              <input className="input-field" placeholder="Title" value={newNotice.title} onChange={e => setNewNotice({ ...newNotice, title: e.target.value })} required />
              <textarea className="input-field" placeholder="Content" value={newNotice.content} onChange={e => setNewNotice({ ...newNotice, content: e.target.value })} required />
              <label className="flex items-center gap-2"><input type="checkbox" checked={newNotice.important} onChange={e => setNewNotice({ ...newNotice, important: e.target.checked })} /> Important?</label>
              <button className="btn-primary py-2">Post Notice</button>
            </form>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-3">Active Notices</h3>
            <div className="space-y-3">
              {notices.map(n => (
                <div key={n._id} className="p-3 border rounded bg-white dark:bg-slate-800 flex justify-between items-start">
                  <div>
                    <div className="font-bold flex items-center gap-2">{n.important && <span className="bg-red-100 text-red-600 text-xs px-1 rounded">IMPORTANT</span>} {n.title}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{n.content}</div>
                  </div>
                  <button onClick={() => deleteNotice(n._id)} className="text-red-500 text-sm">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border p-4 rounded-lg bg-white dark:bg-slate-800 h-fit">
            <h3 className="font-semibold mb-3">Create Student</h3>
            <form onSubmit={createStudent} className="flex flex-col gap-3">
              <input className="input-field" placeholder="Name" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} required />
              <input className="input-field" placeholder="Email" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} required />
              <input className="input-field" placeholder="Password" value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} required />
              <select className="input-field" value={newStudent.course} onChange={e => setNewStudent({ ...newStudent, course: e.target.value })}>
                <option>BCA</option><option>MCA</option><option>Tally</option><option>ADCA</option><option>DCA</option>
              </select>
              <input className="input-field" placeholder="ID Card No." value={newStudent.idCardNumber} onChange={e => setNewStudent({ ...newStudent, idCardNumber: e.target.value })} required />
              <button className="btn-primary py-2">Create Student</button>
            </form>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-3">All Users</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 dark:bg-slate-800"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Status</th><th className="p-3">Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="p-3">{u.name} <div className="text-xs text-slate-500">{u.email}</div></td>
                      <td className="p-3">{u.role}</td>
                      <td className="p-3">{u.isBanned ? <span className="text-red-600">Banned</span> : "Active"}</td>
                      <td className="p-3 flex gap-2">
                        {u.isBanned ? (
                          <button onClick={() => unbanUser(u._id)} className="text-green-600 hover:underline">Unban</button>
                        ) : (
                          <button onClick={() => banUser(u._id)} className="text-orange-600 hover:underline">Ban</button>
                        )}
                        <button onClick={() => deleteUser(u._id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Reported Posts</h3>
            {reports.posts.length === 0 && <p className="text-slate-500">No reported posts.</p>}
            {reports.posts.map(post => (
              <div key={post._id} className="p-3 border rounded mb-2 bg-white dark:bg-slate-800">
                <p className="font-medium">Post Content: {post.content}</p>
                <div className="mt-2 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  <strong>Reports:</strong>
                  {post.reports.map((r, i) => (
                    <div key={i}>- {r.reason} (by {r.reporterId?.name || "Unknown"})</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Reported Users</h3>
            {reports.users.length === 0 && <p className="text-slate-500">No reported users.</p>}
            {reports.users.map(u => (
              <div key={u._id} className="p-3 border rounded mb-2 bg-white dark:bg-slate-800">
                <p className="font-medium">User: {u.name} ({u.email})</p>
                <div className="mt-2 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  <strong>Reports:</strong>
                  {u.reportsReceived.map((r, i) => (
                    <div key={i}>- {r.reason} (by {r.reporterId?.name || "Unknown"})</div>
                  ))}
                </div>
                <div className="mt-2">
                  <button onClick={() => banUser(u._id)} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Ban User</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
