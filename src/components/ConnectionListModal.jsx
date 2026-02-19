import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function ConnectionListModal({ isOpen, onClose, post }) {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sendingId, setSendingId] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchConnections();
        }
    }, [isOpen]);

    const fetchConnections = async () => {
        setLoading(true);
        try {
            const res = await api.get('/social/connections');
            setConnections(res.data);
        } catch (error) {
            console.error("Failed to fetch connections", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (targetUserId) => {
        setSendingId(targetUserId);
        try {
            // Check if conversation exists or start one
            const startRes = await api.post('/social/chat/start', { receiverId: targetUserId });
            const conversationId = startRes.data._id;

            // Send the message with post link
            // We'll use a specific format that ChatPage can detect: "Check out this post: /post/ID"
            const messageText = `Check out this post: /post/${post._id}`;

            const formData = new FormData();
            formData.append("conversationId", conversationId);
            formData.append("text", messageText);

            // If post has an image, we could potentially attach it, but for now just the link/text is fine.
            // Or we can send the image as an attachment if we want to be fancy, but the user asked for "redirected to that post", so link is key.

            await api.post('/social/chat/message', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Show success (maybe a toast or just button state)
            // For now, let's just close sending state and maybe close modal after a moment? 
            // Or keep it open to send to multiple people. Instagram keeps it open.

            // Let's toggle button to "Sent"
            setConnections(prev => prev.map(c =>
                c._id === targetUserId ? { ...c, sent: true } : c
            ));

        } catch (error) {
            console.error("Failed to send post", error);
            alert("Failed to send");
        } finally {
            setSendingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#262626] border border-white/10 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Send to...</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Search (Optional, for now just list) */}
                <div className="p-3 border-b border-white/10">
                    <input
                        type="text"
                        placeholder="Search people"
                        className="w-full bg-black/40 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-white/20"
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="flex justify-center p-4 text-gray-500">Loading...</div>
                    ) : connections.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">No connections yet.</div>
                    ) : (
                        connections.map(conn => (
                            <div key={conn._id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group">
                                <div className="flex items-center gap-3">
                                    <img src={conn.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.name}`} alt="" className="w-10 h-10 rounded-full bg-gray-800" />
                                    <div className="text-left">
                                        <div className="text-white font-medium text-sm">{conn.name}</div>
                                        <div className="text-gray-400 text-xs">@{conn.username}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !conn.sent && handleSend(conn._id)}
                                    disabled={sendingId === conn._id || conn.sent}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${conn.sent
                                        ? "bg-green-600/20 text-green-500"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                        }`}
                                >
                                    {sendingId === conn._id ? "Sending..." : conn.sent ? "Sent" : "Send"}
                                </button>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
