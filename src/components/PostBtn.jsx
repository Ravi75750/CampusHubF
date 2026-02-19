// FeedPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

/* ---------- ICONS ---------- */
const ThumbsUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
);
const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
);
const RepeatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
);
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);
const MoreVerticalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/posts").then(res => {
      setPosts(res.data);
      setLoading(false);
    });
  }, []);

  if (!user || loading) return <div className="pt-32 text-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-24 space-y-6">

        {posts.map(post => (
          <div
            key={post._id}
            className="bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
          >

            {/* ---------- HEADER ---------- */}
            <div className="flex items-center gap-3 p-4">
              <img
                src={post.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg"}
                className="w-11 h-11 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  {post.author?.name || "Unknown"}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
              <MoreVerticalIcon />
            </div>

            {/* ---------- TEXT ---------- */}
            {post.text && (
              <div className="px-4 pb-3 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {post.text}
              </div>
            )}

            {/* ---------- 🔥 INSTAGRAM-STYLE IMAGE ---------- */}
            {post.image && (
              <div className="relative w-full bg-black flex items-center justify-center max-h-[520px] overflow-hidden">
                <img
                  src={post.image}
                  alt="Post media"
                  className="max-h-[520px] w-auto max-w-full object-contain"
                />
              </div>
            )}

            {/* ---------- ACTION BAR ---------- */}
            <div className="flex justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-slate-500">
              <button className="flex items-center gap-2 hover:text-blue-600">
                <ThumbsUpIcon /> Like
              </button>
              <button className="flex items-center gap-2 hover:text-indigo-600">
                <MessageCircleIcon /> Comment
              </button>
              <button className="flex items-center gap-2 hover:text-green-600">
                <RepeatIcon /> Repost
              </button>
              <button className="flex items-center gap-2 hover:text-cyan-600">
                <SendIcon /> Send
              </button>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
