import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ConnectionListModal from "./ConnectionListModal";

/* ---------- ICONS ---------- */
const ThumbsUpIcon = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>
);
const MessageCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
);
const MoreVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
);

/* ---------- UTILS ---------- */
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return "now";
}

export default function PostCard({
    post,
    currentUser,
    onLike,
    onDelete,
    onEdit,
    onReport,
    onSave,
    onAddComment,
    onReply
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // For real-time updates of "time ago"
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const handleCommentSubmit = () => {
        if (!commentText.trim()) return;
        onAddComment(post._id, commentText);
        setCommentText("");
    };

    const handleReplySubmit = (commentId) => {
        if (!replyText.trim()) return;
        onReply(post._id, commentId, replyText);
        setReplyText("");
        setActiveReplyId(null);
    };

    const initiateReply = (comment) => {
        setActiveReplyId(comment._id);
        const username = comment.author?.username || comment.author?.name?.replace(/\s/g, '').toLowerCase() || "user";
        setReplyText(`@${username} `);
    };

    return (
        <div className="bg-white dark:bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl shadow-white/20 hover:shadow-2xl hover:shadow-white/30 transition-all duration-200">
            {/* Post Header */}
            <div className="p-4 flex items-center gap-3">
                <Link to={`/profile/${post.author?._id}`}>
                    <img src={post.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown"} alt="Avatar" className="w-12 h-12 rounded-full bg-yellow-100 object-cover border border-slate-200 dark:border-slate-700" />
                </Link>
                <div className="flex-1 min-w-0">
                    <Link to={`/profile/${post.author?._id}`} className="hover:underline">
                        <h4 className="font-bold text-blue-600 dark:text-blue-400 text-base truncate">
                            {post.author?.name || "Unknown User"}
                            <span className="text-sm font-normal text-black dark:text-slate-300 ml-2">@{post.author?.username || post.author?.email?.split('@')[0] || "unknown"}</span>
                        </h4>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • <span className="text-xs">🌎</span>
                    </p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <MoreVerticalIcon />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-10 bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl w-40 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            {currentUser && (post.author?._id === currentUser.id || post.author?._id === currentUser._id || currentUser.role === 'Admin') ? (
                                <>
                                    <button
                                        onClick={() => { onEdit(post); setIsMenuOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        Edit Post
                                    </button>
                                    <button
                                        onClick={() => { onDelete(post._id); setIsMenuOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                                    >
                                        Delete Post
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { onReport(post); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    Report
                                </button>
                            )}
                            <button
                                onClick={() => { onSave(post); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                                Save
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-2">
                <p className="text-black dark:text-slate-100 whitespace-pre-wrap mb-4 text-[15px] leading-relaxed">
                    {post.text || post.content}
                </p>
            </div>

            {/* Post Image */}
            {post.image && (
                <div className="w-full mt-2">
                    <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[600px]" />
                </div>
            )}

            {/* Social Counts */}
            <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1">
                    <div className="bg-blue-500 rounded-full p-[2px]"><ThumbsUpIcon /></div>
                    <span>{post.likes?.length || 0}</span>
                </div>
                <div>
                    {post.comments?.length || 0} comments
                </div>
            </div>

            {/* Action Bar */}
            <div className="px-2 py-1 flex items-center justify-between">
                <button
                    onClick={() => onLike(post._id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-colors group ${post.likes?.includes(currentUser.id || currentUser._id)
                        ? "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/10"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                >
                    <ThumbsUpIcon filled={post.likes?.includes(currentUser.id || currentUser._id)} />
                    <span className={`transition-colors ${post.likes?.includes(currentUser.id || currentUser._id) ? "text-red-600 dark:text-red-500" : "group-hover:text-red-500"}`}>
                        {post.likes?.includes(currentUser.id || currentUser._id) ? "Liked" : "Like"}
                    </span>
                </button>
                <button
                    onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors group"
                >
                    <MessageCircleIcon /> <span className="group-hover:text-indigo-500 transition-colors">Comment</span>
                </button>
                {/* Repost Removed */}
                <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors group"
                >
                    <SendIcon /> <span className="group-hover:text-cyan-500 transition-colors">Send</span>
                </button>
            </div>

            {/* Comments Section (Collapsible) */}
            {isCommentsOpen && (
                <div className="bg-slate-50 dark:bg-black/20 p-4 border-t border-slate-100 dark:border-slate-800">
                    {/* Add Comment */}
                    <div className="flex gap-3 mb-6">
                        <img src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="Me" className="w-8 h-8 rounded-full" />
                        <div className="flex-1 relative">
                            <input
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCommentSubmit()}
                            />
                            {commentText && (
                                <button onClick={handleCommentSubmit} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-indigo-600 hover:bg-indigo-50 rounded-full">
                                    <SendIcon />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {post.comments?.map((comment, idx) => (
                            <div key={comment._id || idx} className="flex gap-3">
                                <img src={comment.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown"} alt="Au" className="w-8 h-8 rounded-full mt-1" />
                                <div className="flex-1 group">
                                    <div className="bg-slate-200/50 dark:bg-slate-800 p-3 rounded-r-2xl rounded-bl-2xl inline-block min-w-[200px]">
                                        <div className="font-bold text-xs text-slate-900 dark:text-white mb-1">{comment.author?.name}</div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 ml-1">
                                        <button className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium">Like</button>
                                        <button
                                            onClick={() => activeReplyId === comment._id ? setActiveReplyId(null) : initiateReply(comment)}
                                            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium"
                                        >
                                            Reply
                                        </button>
                                        <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
                                    </div>

                                    {/* Reply Input */}
                                    {activeReplyId === comment._id && (
                                        <div className="mt-2 ml-2 flex gap-2">
                                            <div className="h-8 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                            <div className="flex-1">
                                                <input
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-500 transition-colors"
                                                    placeholder="Write a reply..."
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end mt-1">
                                                    <button onClick={() => handleReplySubmit(comment._id)} className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-md hover:bg-indigo-700">Reply</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Nested Replies */}
                                    {comment.replies?.length > 0 && (
                                        <div className="mt-2 ml-4 space-y-3">
                                            {comment.replies.map((reply, rIdx) => (
                                                <div key={reply._id || rIdx} className="flex gap-2">
                                                    <img src={reply.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown"} alt="Au" className="w-6 h-6 rounded-full" />
                                                    <div>
                                                        <div className="bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl">
                                                            <span className="font-bold text-xs block dark:text-white">{reply.author?.name}</span>
                                                            <span className="text-xs text-slate-600 dark:text-slate-400">{reply.text}</span>
                                                        </div>
                                                        <div className="ml-2">
                                                            <span className="text-xs text-slate-400">{timeAgo(reply.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ConnectionListModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                post={post}
            />
        </div>
    );
}
