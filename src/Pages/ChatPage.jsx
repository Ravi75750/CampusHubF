import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ChatPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [viewType, setViewType] = useState('main');
    const [image, setImage] = useState(null); // Image to send
    const [editingMessage, setEditingMessage] = useState(null); // Message being edited
    const [reports, setReports] = useState([]); // Teacher reports
    const [activeReport, setActiveReport] = useState(null); // To view details if needed, or just list

    // Options & Modal State
    const [showOptions, setShowOptions] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", action: null, data: null });
    const [lightboxImage, setLightboxImage] = useState(null);
    const optionsRef = useRef(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const targetUserId = params.get('userId');

        if (targetUserId) {
            startChat(targetUserId);
        } else {
            if (user?.role === 'Teacher' && viewType === 'requests') {
                fetchReports();
            } else {
                fetchConversations();
            }
        }
    }, [location.search, viewType]);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation._id);
            const interval = setInterval(() => fetchMessages(activeConversation._id), 1000);
            return () => clearInterval(interval);
        }
    }, [activeConversation]);

    // Auto-scroll removed as per request
    // useEffect(() => {
    //     scrollToBottom();
    // }, [messages]);

    async function startChat(targetId) {
        try {
            const res = await api.post('/social/chat/start', { receiverId: targetId });
            setActiveConversation(res.data);
            fetchConversations();
        } catch (err) {
            console.error("Failed to start chat", err);
        }
    }

    // Close options on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function fetchConversations() {
        try {
            const res = await api.get(`/social/chat/conversations?type=${viewType}`);
            setConversations(res.data);
        } catch (err) {
            console.error("Failed to fetch chats", err);
        }
    }

    async function fetchReports() {
        try {
            const res = await api.get('/moderation/reports');
            setReports(res.data);
        } catch (err) {
            console.error("Failed to fetch reports", err);
        }
    }

    async function fetchMessages(convId) {
        try {
            const res = await api.get(`/social/chat/${convId}/messages`);
            // Preserve optimistic "sending" status if needed
            setMessages(prev => {
                const sendingMsgs = prev.filter(m => m.status === 'sending');
                // Merge real messages with sending ones (duplicates handled by ID if real one arrived)
                // Simplified: just replace, but we might lose 'sending' animation if backend is slow.
                // Better: keep 'sending' ones that aren't in 'res.data' yet? 
                // For simplicity in this iteration, just set data.
                return res.data;
            });
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    }

    async function handleSendMessage(e) {
        e.preventDefault();
        if ((!newMessage.trim() && !image) || !activeConversation) return;

        // EDIT MODE
        if (editingMessage) {
            try {
                await api.put(`/social/chat/message/${editingMessage._id}`, { text: newMessage });
                setEditingMessage(null);
                setNewMessage("");
                setImage(null);
                fetchMessages(activeConversation._id);
            } catch (err) {
                alert("Failed to edit");
            }
            return;
        }

        // SEND MODE
        const tempId = Date.now();
        const tempMsg = {
            _id: tempId,
            text: newMessage,
            image: image ? URL.createObjectURL(image) : null,
            sender: user.id,
            conversationId: activeConversation._id,
            status: 'sending'
        };

        setMessages(prev => [...prev, tempMsg]);

        const formData = new FormData();
        formData.append("conversationId", activeConversation._id);
        if (newMessage.trim()) formData.append("text", newMessage);
        if (image) formData.append("image", image);

        setNewMessage("");
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        try {
            await api.post('/social/chat/message', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setMessages(prev => prev.map(m =>
                m._id === tempId ? { ...m, status: 'sent' } : m
            ));

            setTimeout(() => {
                setMessages(prev => prev.map(m =>
                    m._id === tempId ? { ...m, status: null } : m
                ));
            }, 2000);

            fetchMessages(activeConversation._id);
        } catch (err) {
            console.error("Failed to send", err);
            setMessages(prev => prev.filter(m => m._id !== tempId));
            alert("Failed to send message");
        }
    }

    async function handleDeleteMessage(msgId) {
        if (!confirm("Unsend this message?")) return;
        try {
            await api.delete(`/social/chat/message/${msgId}`);
            setMessages(prev => prev.filter(m => m._id !== msgId));
        } catch (err) {
            alert("Failed to unsend");
        }
    }

    function startEdit(msg) {
        setEditingMessage(msg);
        setNewMessage(msg.text || "");
        // Focus input
    }

    async function handleAcceptRequest(convId) {
        try {
            await api.post('/social/chat/accept', { conversationId: convId });
            setViewType('main');
        } catch (err) {
            alert("Failed to accept");
        }
    }

    function getOtherParticipant(conv) {
        if (!conv || !conv.participants || !user) return { name: 'Unknown', avatar: '' };
        const other = conv.participants.find(p => p && p._id !== user.id);
        return other || { name: 'Unknown', avatar: '' };
    }

    async function handleReportAction(reportId, status, e) {
        e.stopPropagation();
        if (!confirm(`Mark report as ${status}?`)) return;
        try {
            await api.put(`/moderation/report/${reportId}`, { status });
            // Remove from list or update
            setReports(prev => prev.filter(r => r._id !== reportId));
            // alert(`Report ${status}`);
        } catch (err) {
            alert("Failed to update report");
        }
    }

    async function handleBanUser(userId) {
        const days = prompt("Enter ban duration in days (e.g., 7):", "30");
        if (!days) return;
        try {
            await api.post('/moderation/ban', { userId, durationInDays: parseInt(days) });
            alert("User banned.");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to ban user");
        }
    }

    // --- Actions ---

    function confirmRemoveConnection() {
        setModalConfig({
            isOpen: true,
            title: "Are you sure you want to remove this connection? Chat history will be deleted.",
            action: removeConnection,
            confirmText: "Remove",
            confirmColor: "red"
        });
        setShowOptions(false);
    }

    async function removeConnection() {
        try {
            const other = getOtherParticipant(activeConversation);
            await api.post('/social/connect/remove', { targetId: other._id });
            setActiveConversation(null);
            fetchConversations();
            closeModal();
        } catch (err) {
            alert("Failed to remove connection");
        }
    }

    function confirmBlockUser() {
        setModalConfig({
            isOpen: true,
            title: "Are you sure you want to BLOCK this user?",
            action: blockUser,
            confirmText: "Block",
            confirmColor: "red"
        });
        setShowOptions(false);
    }

    async function blockUser() {
        try {
            const other = getOtherParticipant(activeConversation);
            await api.post('/social/block', { targetId: other._id });
            setActiveConversation(null);
            fetchConversations();
            closeModal();
        } catch (err) {
            alert("Failed to block user");
        }
    }

    function closeModal() {
        setModalConfig({ ...modalConfig, isOpen: false });
    }

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden relative">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                onConfirm={modalConfig.action}
                onCancel={closeModal}
                confirmText={modalConfig.confirmText}
                confirmColor={modalConfig.confirmColor}
            />

            {/* Lightbox */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Full view"
                        className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
            {/* Sidebar */}
            <div className={`w-full md:w-[400px] border-r border-white/10 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {/* Sidebar Header */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {user.username} <span className="text-xs">▼</span>
                        </h1>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                    </div>

                    {/* Header */}
                    <div className="pb-3 mb-4 border-b border-white/10">
                        <h2 className="text-white font-bold text-lg">Friends</h2>
                    </div>

                    {/* Search */}
                    <div className="relative mb-2">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-[#262626] text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto px-2">


                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 mt-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <p className="text-sm">No Friends Yet</p>
                        </div>
                    ) : (
                        Array.from(new Map(conversations.map(c => [getOtherParticipant(c)._id, c])).values()).map(conv => {
                            const other = getOtherParticipant(conv);
                            const isActive = activeConversation?._id === conv._id;
                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                >
                                    <div className="relative">
                                        <img src={other.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other.name}`} alt={other.name} className="w-12 h-12 rounded-full bg-gray-800" />
                                        {conv.unreadCount > 0 && <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-black rounded-full"></span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'} text-white truncate`}>{other.name}</h4>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">
                                            {conv.lastMessage || 'Sent an attachment.'} <span className="mx-1">·</span> 1d
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-black ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveConversation(null)} className="md:hidden text-white mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                                </button>
                                <img src={getOtherParticipant(activeConversation).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getOtherParticipant(activeConversation).name}`} alt="" className="w-10 h-10 rounded-full" />
                                <div>
                                    <h3 className="font-semibold text-white text-base">{getOtherParticipant(activeConversation).name}</h3>
                                    <p className="text-xs text-gray-400">{getOtherParticipant(activeConversation).username || 'Active now'}</p>
                                </div>
                            </div>
                            <div className="relative" ref={optionsRef}>
                                <button
                                    onClick={() => setShowOptions(!showOptions)}
                                    className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </button>
                                {showOptions && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#262626] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            onClick={confirmRemoveConnection}
                                            className="w-full text-left px-4 py-3 text-white hover:bg-white/5 transition-colors"
                                        >
                                            Remove Connection
                                        </button>
                                        <button
                                            onClick={confirmBlockUser}
                                            className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-500/10 transition-colors"
                                        >
                                            Block User
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {/* Profile Placeholder in Chat */}
                            <div className="flex flex-col items-center justify-center py-10 opacity-70">
                                <img src={getOtherParticipant(activeConversation).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getOtherParticipant(activeConversation).name}`} alt="" className="w-20 h-20 rounded-full mb-3" />
                                <h3 className="font-bold text-lg">{getOtherParticipant(activeConversation).name}</h3>
                                <p className="text-sm text-gray-400 mb-3">@{getOtherParticipant(activeConversation).username || (getOtherParticipant(activeConversation).name || 'unknown').toLowerCase().replace(/\s/g, '')} · Instagram</p>
                                <button className="px-4 py-1.5 bg-[#262626] rounded-lg text-sm font-semibold hover:bg-[#363636] transition-colors">View profile</button>
                            </div>

                            {/* Date Separator mock */}
                            <div className="text-center text-xs text-gray-500 my-4">Jan 18, 2026, 8:34 AM</div>

                            {messages.map((msg, i) => {
                                const isMe = msg.sender === user.id;
                                return (
                                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}>
                                        <div className={`max-w-[70%] px-4 py-2.5 text-[15px] rounded-3xl ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : 'bg-[#262626] text-white rounded-bl-md'
                                            }`}>
                                            {msg.image && (
                                                <img
                                                    src={msg.image}
                                                    alt="Sent"
                                                    onClick={() => setLightboxImage(msg.image)}
                                                    className="rounded-lg mb-2 max-w-full max-h-80 w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                />
                                            )}
                                            {msg.text.includes("/post/") ? (
                                                <div>
                                                    <p className="mb-2">{msg.text.split("http")[0]}</p>
                                                    <a
                                                        href={msg.text.match(/https?:\/\/[^\s]+/) ? msg.text.match(/https?:\/\/[^\s]+/)[0] : `/post/${msg.text.split("/post/")[1]}`}
                                                        className="block bg-black/20 p-3 rounded-lg hover:bg-black/40 transition-colors border border-white/10"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold text-sm">Shared Post</span>
                                                                <span className="block text-xs text-gray-400">Click to view</span>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </div>
                                            ) : (
                                                msg.text
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 px-6 pb-6">
                            <div className="bg-[#262626] rounded-full flex items-center p-1.5 px-2 border border-transparent focus-within:border-white/20 transition-colors">
                                <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                                </button>
                                <form onSubmit={handleSendMessage} className="flex-1 flex items-center mx-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Message..."
                                        className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-400"
                                    />
                                    {image && <span className="text-xs text-blue-400 mr-2">Image attached</span>}
                                </form>
                                <input type="file" ref={fileInputRef} onChange={e => setImage(e.target.files[0])} className="hidden" accept="image/*" />
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors mr-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                </button>
                                {newMessage.trim() || image ? (
                                    <button onClick={handleSendMessage} className="p-2 text-blue-500 hover:bg-white/10 rounded-full transition-colors">
                                        <span className="font-semibold text-sm">Send</span>
                                    </button>
                                ) : (
                                    <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white">
                        <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        </div>
                        <h2 className="text-xl font-light">Your Messages</h2>
                        <p className="text-gray-400 mt-2">Send private photos and messages to a friend or group.</p>
                        <button className="mt-6 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Send Message</button>
                    </div>
                )}
            </div>
        </div>
    );
}
