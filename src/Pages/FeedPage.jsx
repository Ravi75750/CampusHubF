import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";



import PostCard from "../components/PostCard";

/* ---------- ICONS ---------- */
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
);
const MoreVerticalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
);

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [events, setEvents] = useState([]);

  // Create Post State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ text: "", image: null });

  // Interaction State
  // Interaction State
  // const [comments, setComments] = useState({}); // Moved to PostCard
  // const [activeCommentSectionId, setActiveCommentSectionId] = useState(null); // Moved to PostCard
  // const [replyText, setReplyText] = useState(""); // Moved to PostCard
  // const [activeReplyId, setActiveReplyId] = useState(null); // Moved to PostCard

  // Edit State
  const [editingPost, setEditingPost] = useState(null);
  // const [activeMenuId, setActiveMenuId] = useState(null); // Moved to PostCard


  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    fetchPosts();
    fetchEvents();
    if (user?.id) fetchConnectionCount();
  }, [refresh, user]);

  async function fetchConnectionCount() {
    try {
      const res = await api.get(`/social/connections/count/${user.id}`);
      setConnectionCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchEvents() {
    try {
      const res = await api.get("/events");
      setEvents(res.data.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  }

  async function fetchPosts() {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  }


  async function handleCreatePost(e) {
    if (e) e.preventDefault();
    if (!newPost.text.trim()) return;

    const formData = new FormData();
    formData.append("text", newPost.text);
    if (newPost.image) {
      formData.append("image", newPost.image);
    }

    try {
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setNewPost({ text: "", image: null });
      setIsCreateModalOpen(false); // Close modal
      setRefresh(prev => prev + 1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post");
    }
  }

  async function handleDeletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      setRefresh(prev => prev + 1);
    } catch (err) {
      alert("Failed to delete post");
    }
  }

  async function handleLike(postId) {
    // Optimistic Update
    setPosts(currentPosts => currentPosts.map(p => {
      if (p._id === postId) {
        const isLiked = p.likes.includes(user.id);
        const newLikes = isLiked
          ? p.likes.filter(id => id !== user.id)
          : [...p.likes, user.id];
        return { ...p, likes: newLikes };
      }
      return p;
    }));

    try {
      await api.put(`/posts/${postId}/like`);
      // No need to refresh entire list if optimistic update works
      // setRefresh(prev => prev + 1); 
    } catch (err) {
      console.error("Like failed", err);
      setRefresh(prev => prev + 1); // Revert on failure
    }
  }

  function handleSavePost(post) {
    const postContent = `
    Author: ${post.author?.name} (${post.author?.email})
    Date: ${new Date(post.createdAt).toLocaleString()}
    Content: ${post.text}
    Image: ${post.image || 'N/A'}
    Likes: ${post.likes?.length || 0}
    Comments: ${post.comments?.length || 0}
    `;
    const blob = new Blob([postContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post_${post._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleAddComment(postId, text) { // Added text arg
    if (!text) return;
    try {
      await api.post(`/posts/${postId}/comment`, { text });
      // setComments({ ...comments, [postId]: "" }); // Handled in PostCard
      setRefresh(prev => prev + 1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to comment");
    }
  }

  async function handleReply(postId, commentId, text) { // Added text arg
    if (!text.trim()) return;
    try {
      await api.post(`/posts/${postId}/comments/${commentId}/reply`, { text });
      // setReplyText(""); // Handled in PostCard
      // setActiveReplyId(null); // Handled in PostCard
      setRefresh(prev => prev + 1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reply");
    }
  }

  async function handleDeleteComment(postId, commentId) {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      setRefresh(prev => prev + 1);
    } catch (err) {
      alert("Failed to delete comment");
    }
  }

  async function handleDeleteReply(postId, commentId, replyId) {
    if (!confirm("Delete this reply?")) return;
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}/replies/${replyId}`);
      setRefresh(prev => prev + 1);
    } catch (err) {
      alert("Failed to delete reply");
    }
  }

  async function handleUpdatePost() {
    if (!editingPost || !editingPost.text.trim()) return;
    try {
      await api.put(`/posts/${editingPost._id}`, { text: editingPost.text });
      setRefresh(prev => prev + 1);
      setEditingPost(null);
    } catch (err) {
      alert("Failed to update post");
    }
  }

  // Report State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState({ type: 'post', id: null, reason: 'Abusive', description: '' });

  function openReportModal(type, id) {
    setReportData({ ...reportData, type, id });
    setIsReportModalOpen(true);
  }

  async function handleSubmitReport() {
    try {
      await api.post("/moderation/report", reportData);
      alert("Report submitted successfully.");
      setIsReportModalOpen(false);
      setReportData({ type: 'post', id: null, reason: 'Abusive', description: '' });
    } catch (err) {
      alert("Failed to report");
    }
  }

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl 3xl:max-w-[1600px] 4xl:max-w-[2000px] 5xl:max-w-[2800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Sidebar - Profile Summary */}
          {user.role !== 'Admin' && (
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl sticky top-24 border border-white/10 shadow-xl shadow-white/20">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] mb-4">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt="Profile"
                      className="w-full h-full rounded-full border-4 border-white dark:border-[#1a1d24] bg-white dark:bg-slate-800 object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-xl text-white">{user.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{user.role}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs text-center px-4 mb-6">
                    "Empowering voices, connecting minds."
                  </p>

                  <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-4">
                    <div>
                      <div className="font-bold text-lg text-white">{connectionCount}</div>
                      <div className="text-xs text-slate-500">Connections</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-white">{posts.filter(p => p.author?._id === user.id).length}</div>
                      <div className="text-xs text-slate-500">Posts</div>
                    </div>
                  </div>

                  <Link to="/profile" className="mt-6 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all">
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Profile Summary (Visible only on small screens) */}
          {user.role !== 'Admin' && (
            <div className="lg:hidden mb-6">
              <div className="bg-white dark:bg-[#1a1d24] p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-slate-100 dark:border-slate-700"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user.name}</h3>
                  <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span><b>{connectionCount}</b> Connections</span>
                    <span><b>{posts.filter(p => p.author?._id === user.id).length}</b> Posts</span>
                  </div>
                </div>
                <Link to="/profile" className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg text-sm font-medium">
                  Profile
                </Link>
              </div>
            </div>
          )}

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onLike={handleLike}
                onAddComment={handleAddComment}
                onReply={handleReply}
                onDelete={handleDeletePost}
                onEdit={setEditingPost}
                onReport={(p) => openReportModal('post', p._id)}
                onSave={handleSavePost}
                onDeleteComment={handleDeleteComment}
                onDeleteReply={handleDeleteReply}
              />
            ))}
          </div>

          {/* Right Sidebar - Events */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">



            <div className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl sticky top-24 border border-white/10 shadow-xl shadow-white/20">
              <h3 className="font-bold mb-4 flex items-center justify-between text-white">
                Upcoming Events
                <Link to="/events" className="text-xs text-indigo-500 hover:underline">View All</Link>
              </h3>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center text-sm text-slate-500">
                    No upcoming events
                  </div>
                ) : (
                  events.map(event => (
                    <div key={event._id} className="group flex gap-3 items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 w-12 h-12 rounded-lg flex-shrink-0 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        <span className="text-[10px] font-bold uppercase">{event.date.split(" ")[1] || "DATE"}</span>
                        <span className="text-lg font-bold leading-none">{event.date.split(" ")[0] || "00"}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-2 text-slate-900 dark:text-slate-200 group-hover:text-indigo-500 transition-colors">{event.title}</h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <span>📍 {event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 z-40 outline-none"
        aria-label="Create Post"
      >
        <PlusIcon />
      </button>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create a post</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                <XIcon />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <div className="flex gap-3 mb-4">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt="User"
                  className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{user.name}</h3>
                  <button className="text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5 mt-1 flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800">
                    🌎 Anyone ▾
                  </button>
                </div>
              </div>

              <textarea
                value={newPost.text}
                onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
                placeholder="What do you want to talk about?"
                className="w-full bg-transparent text-lg text-slate-900 dark:text-white placeholder-slate-400 border-none focus:ring-0 resize-none min-h-[150px] outline-none"
              />

              {newPost.image && (
                <div className="relative mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={newPost.image instanceof File ? URL.createObjectURL(newPost.image) : newPost.image} alt="Preview" className="w-full h-auto max-h-64 object-cover" />
                  <button
                    onClick={() => setNewPost({ ...newPost, image: null })}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                  >
                    <XIcon />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex gap-2">
                <label className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors" title="Add Image">
                  <ImageIcon />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setNewPost({ ...newPost, image: e.target.files[0] })}
                  />
                </label>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><MoreVerticalIcon /></button>
              </div>

              <button
                onClick={handleCreatePost}
                disabled={!newPost.text.trim()}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${newPost.text.trim()
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingPost(null)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Post</h2>
              <button
                onClick={() => setEditingPost(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400"
              >
                <XIcon />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={editingPost.text || ""}
                onChange={(e) => setEditingPost({ ...editingPost, text: e.target.value })}
                className="w-full bg-transparent text-lg text-slate-900 dark:text-white placeholder-slate-400 border-none focus:ring-0 resize-none min-h-[150px] outline-none"
              />
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePost}
                className="px-6 py-2 rounded-full font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReportModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1d24] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Report Content</h3>
              <button onClick={() => setIsReportModalOpen(false)}><XIcon /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Reason</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none"
                  value={reportData.reason}
                  onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                >
                  <option value="Abusive">Abusive</option>
                  <option value="Violence">Violence</option>
                  <option value="Religional Hate/Speech">Religional Hate/Speech</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none h-24 resize-none"
                  placeholder="Describe the issue..."
                  value={reportData.description}
                  onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                />
              </div>
              <button
                onClick={handleSubmitReport}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
