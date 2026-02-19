import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';

/* ---------- ICONS ---------- */
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);
const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
const ThreeDotsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
);

export default function ChatWidget() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [image, setImage] = useState(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", action: null, data: null });
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        if (user) {
            fetchConversations();
            const interval = setInterval(fetchConversations, 10000); // Poll for list updates
            return () => clearInterval(interval);
        }
    }, [user]);

    // Active Chat Polling
    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation._id);
            const interval = setInterval(() => fetchMessages(activeConversation._id), 2000); // Faster polling for chat
            return () => clearInterval(interval);
        }
    }, [activeConversation]);

    // Scroll to bottom when conversation opens
    useEffect(() => {
        if (activeConversation) scrollToBottom();
    }, [activeConversation]);

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

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    async function fetchConversations() {
        try {
            // Force 'main' view type for the widget (friends list)
            const res = await api.get(`/social/chat/conversations?type=main`);
            setConversations(res.data);
        } catch (err) {
            console.error("Failed to fetch chats", err);
        }
    }

    async function fetchMessages(convId) {
        try {
            const res = await api.get(`/social/chat/${convId}/messages`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    }

    async function handleSendMessage(e) {
        e.preventDefault();
        if ((!newMessage.trim() && !image) || !activeConversation) return;

        const tempId = Date.now();
        const tempMsg = {
            _id: tempId,
            text: newMessage,
            image: image ? URL.createObjectURL(image) : null,
            sender: user.id || user._id, // Handle potential ID difference
            conversationId: activeConversation._id,
            status: 'sending'
        };

        setMessages(prev => [...prev, tempMsg]);
        setTimeout(scrollToBottom, 100); // Scroll after render

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
            fetchMessages(activeConversation._id);
        } catch (err) {
            console.error("Failed to send", err);
            setMessages(prev => prev.filter(m => m._id !== tempId));
        }
    }

    // --- Modal Handlers ---

    function confirmDeleteMessage(msgId) {
        setModalConfig({
            isOpen: true,
            title: "Are you sure you want to delete this message?",
            action: () => deleteMessage(msgId),
            confirmText: "Yes",
            confirmColor: "red"
        });
    }

    async function deleteMessage(msgId) {
        try {
            await api.delete(`/social/chat/message/${msgId}`);
            setMessages(prev => prev.filter(m => m._id !== msgId));
            closeModal();
        } catch (err) {
            alert("Failed to delete message");
        }
    }

    function confirmRemoveConnection() {
        setModalConfig({
            isOpen: true,
            title: "Are you sure you want to remove this connection?",
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

    function getOtherParticipant(conv) {
        if (!conv || !conv.participants || !user) return { name: 'Unknown', avatar: '' };
        const userId = user.id || user._id;
        const other = conv.participants.find(p => p && (p._id !== userId));
        return other || { name: 'Unknown', avatar: '' };
    }

    return (
        <div className="bg-white/80 dark:bg-[#1a1d24]/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden flex flex-col h-[500px] relative">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                onConfirm={modalConfig.action}
                onCancel={closeModal}
                confirmText={modalConfig.confirmText}
                confirmColor={modalConfig.confirmColor}
            />

            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                {activeConversation ? (
                    <div className="flex items-center gap-2 w-full">
                        <button onClick={() => setActiveConversation(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ChevronLeftIcon />
                        </button>
                        <div className="flex items-center gap-2 flex-1">
                            <img
                                src={getOtherParticipant(activeConversation).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getOtherParticipant(activeConversation).name}`}
                                alt=""
                                className="w-8 h-8 rounded-full"
                            />
                            <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                                {getOtherParticipant(activeConversation).name}
                            </h3>
                        </div>

                        {/* Options Menu */}
                        <div className="relative" ref={optionsRef}>
                            <button
                                onClick={() => setShowOptions(!showOptions)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                            >
                                <ThreeDotsIcon />
                            </button>

                            {showOptions && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={confirmRemoveConnection}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Remove Connection
                                    </button>
                                    <button
                                        onClick={confirmBlockUser}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        Block User
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <h3 className="font-bold text-slate-900 dark:text-white">Friends</h3>
                )}
                {!activeConversation && (
                    <Link to="/chat" className="text-xs text-indigo-500 hover:underline">Full View</Link>
                )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-0">
                {!activeConversation ? (
                    // Conversation List
                    <div className="space-y-1 p-2">
                        {conversations.length === 0 ? (
                            <div className="text-center text-slate-500 text-sm mt-10">No conversations yet</div>
                        ) : (
                            conversations.map(conv => {
                                const other = getOtherParticipant(conv);
                                return (
                                    <div
                                        key={conv._id}
                                        onClick={() => setActiveConversation(conv)}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                    >
                                        <div className="relative">
                                            <img
                                                src={other.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other.name}`}
                                                alt={other.name}
                                                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700"
                                            />
                                            {conv.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 border-2 border-white dark:border-[#1a1d24] rounded-full text-[10px] flex items-center justify-center text-white">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{other.name}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {user && conv.lastMessage?.includes('Sent an image') ? '📷 Image' : conv.lastMessage || 'Started a chat'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    // Chat View
                    <div className="h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.map((msg, i) => {
                                const isMe = msg.sender === (user.id || user._id);
                                return (
                                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="group relative max-w-[85%]">
                                            <div className={`px-3 py-2 text-sm rounded-2xl break-words ${isMe
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                                                }`}>
                                                {msg.image && (
                                                    <img src={msg.image} alt="Sent" className="rounded-lg mb-2 max-w-full w-40 h-auto object-cover" />
                                                )}
                                                {msg.text}
                                            </div>
                                            {/* Delete Button (visible on hover for own messages) */}
                                            {isMe && (
                                                <button
                                                    onClick={() => confirmDeleteMessage(msg._id)}
                                                    className="absolute -left-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                    title="Delete"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                                            {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700/50 bg-white dark:bg-[#1a1d24]">
                            {image && (
                                <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <span className="text-xs text-indigo-500 truncate max-w-[150px]">Image attached</span>
                                    <button onClick={() => setImage(null)} className="text-slate-400 hover:text-red-500"><XIcon /></button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full pl-4 pr-10 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <input type="file" ref={fileInputRef} onChange={e => setImage(e.target.files[0])} className="hidden" accept="image/*" />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 p-1"
                                    >
                                        <ImageIcon />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() && !image}
                                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <SendIcon />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
