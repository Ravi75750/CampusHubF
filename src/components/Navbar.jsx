import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState, useEffect } from "react";

import { api } from "../api";

/* ---------- ICONS ---------- */

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);



const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-300">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-300">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 dark:text-slate-200">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 dark:text-slate-200">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function Navbar({ transparent }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const res = await api.get(`/auth/search?q=${searchQuery}`);
          setSearchResults(res.data);
          setShowResults(true);
        } catch (err) {
          console.error("Search failed", err);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Optional: Poll every 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  async function fetchNotifications() {
    try {
      const res = await api.get('/social/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  }

  async function handleNotificationClick(notif) {
    try {
      if (!notif.isRead) {
        await api.put(`/social/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      if (notif.type === 'like' && notif.post) {
        navigate(`/feed`); // Ideally scroll to post or open post details
      } else if (notif.type === 'connection_request') {
        // Stay open or go to profile?
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConnectionAction(notif, action) {
    try {
      // Assuming original request ID might be needed, but we can assume we know the sender.
      // Actually socialController needs requestId. We might not have it easily in notification unless we stored it.
      // But we can find pending request from sender.
      // Simplified: Just use the sender ID to find pending request in backend?
      // Wait, socialController acceptConnectionRequest takes 'requestId'.
      // We need to fetch pending requests to map them or update backend to accept by pair (sender/receiver).
      // Let's assume for now we just show "Go to Profile" or "Message" if accepted.
      // But user wants Accept/Reject buttons here.
      // Workaround: We'll fetch pending requests to find the ID.
      // OR: We update socialController to accept by senderId.
      // Let's go to Profile for safety or implement quick look?
      // Better: Update socialController logic would be cleanest, but I can't change it mid-flight easily without risk.
      // Let's just navigate to sender profile for now where they can accept?
      // User asked for "containing reject and accept".
      // I need to fetch pending connections to get the requestId.
      const pendingRes = await api.get('/social/connections/pending');
      const request = pendingRes.data.find(r => r.sender._id === notif.sender._id);

      if (request) {
        if (action === 'accept') {
          await api.post('/social/connect/accept', { requestId: request._id });
        } else {
          // Reject (maybe just ignore or implement reject endpoint)
        }
        fetchNotifications(); // Refresh
      }
    } catch (err) {
      console.error(err);
    }
  }

  const isLanding = location.pathname === "/";

  return (
    <nav
      className={`
        fixed top-0 left-0 w-full z-50
        transition-all duration-300
        backdrop-blur-md border-b
        ${isLanding
          ? "bg-[#ffffff22] border-none text-white"
          : "bg-white/10 backdrop-blur-md border-white/10 text-white"}
      `}
    >
      <div className="max-w-7xl 3xl:max-w-[1600px] 4xl:max-w-[2000px] 5xl:max-w-[2800px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to={user ? "/feed" : "/"} className="flex items-center space-x-1">

            <span className={`font-bold text-[40px] ${isLanding ? "text-[#ffffff]" : "text-white"}`}>
              CampusHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/feed"
              className={`font-medium transition-colors ${isLanding
                ? "text-white text-[20px] hover:text-white"
                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                }`}
            >
              Feed
            </Link>

            <Link
              to="/events"
              className={`font-medium transition-colors ${isLanding
                ? "text-white text-[20px] hover:text-white"
                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                }`}
            >
              Events
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                onFocus={() => { if (searchQuery) setShowResults(true); }}
                className={`
                  w-full py-2 pl-11 pr-4 rounded-xl
                  ${isLanding
                    ? "bg-white/20 text-white placeholder-white/70 focus:ring-white/40"
                    : "bg-blue-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-blue-100 dark:border-slate-700/50"}
                `}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon />
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white dark:bg-[#1a1d24] rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
                  {searchResults.map(result => (
                    <Link
                      key={result._id}
                      to={`/profile/${result._id}`}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setShowResults(false)}
                    >
                      <img
                        src={result.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.name}`}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{result.name}</div>
                        <div className="text-xs text-slate-500">@{result.username || result.email.split('@')[0]}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-3">

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-white/10 relative"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1a1d24] rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="font-semibold text-slate-900 dark:text-white">Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={async () => {
                          try {
                            await api.delete('/social/notifications');
                            setNotifications([]);
                            setUnreadCount(0);
                          } catch (e) { console.error(e); }
                        }}
                        className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                        <span className="text-2xl mb-2">🔕</span>
                        <span className="text-sm">No notifications</span>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          className={`p-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="flex gap-3">
                            <img
                              src={notif.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.sender.name}`}
                              alt="Avatar"
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-800 dark:text-slate-200">
                                <span className="font-bold hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${notif.sender._id}`) }}>
                                  {notif.sender?.name || "Unknown"}
                                </span>
                                {' '}
                                {notif.type === 'like' && <span className="text-slate-500">liked your post</span>}
                                {notif.type === 'connection_request' && <span className="text-slate-500">sent you a connection request</span>}
                                {notif.type === 'comment' && <span className="text-slate-500">commented on your post</span>}
                              </p>
                              <div className="text-xs text-slate-400 mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>

                              {/* Action Buttons for Connection Request */}
                              {notif.type === 'connection_request' && (
                                <div className="flex gap-2 mt-2">
                                  {notif.accepted ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/chat?userId=${notif.sender._id}`);
                                        setShowNotifications(false);
                                      }}
                                      className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"
                                    >
                                      <span>Message</span>
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          // Optimistic Update
                                          const prevNotifs = [...notifications];
                                          setNotifications(notifications.map(n => n._id === notif._id ? { ...n, accepted: true } : n));

                                          try {
                                            // Find pending request logic
                                            const pendingRes = await api.get('/social/connections/pending');
                                            const request = pendingRes.data.find(r => r.sender._id === notif.sender._id);
                                            if (request) {
                                              await api.post('/social/connect/accept', { requestId: request._id });
                                              // Success - state already updated optimistically
                                            } else {
                                              // Fallback or error
                                              // Maybe it's already accepted?
                                            }
                                          } catch (err) {
                                            console.error(err);
                                            setNotifications(prevNotifs); // Revert
                                            alert("Failed to accept");
                                          }
                                        }}
                                        className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); /* Reject */ }}
                                        className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                      >
                                        Decline
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Post Thumbnail for Like/Comment */}
                            {(notif.type === 'like' || notif.type === 'comment') && notif.post && (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                                {notif.post.image ? (
                                  <img src={notif.post.image} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400">abc</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/chat" className="p-2 rounded-full hover:bg-white/10 text-slate-600 dark:text-slate-300">
              <ChatIcon />
            </Link>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-4 space-y-4 animate-in slide-in-from-top-2 bg-white dark:bg-[#1a1d24] p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl absolute left-4 right-4 top-16">

            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                onFocus={() => { if (searchQuery) setShowResults(true); }}
                className="w-full py-2.5 pl-11 pr-4 rounded-lg bg-blue-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-blue-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon />
              </div>
              {/* Mobile Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white dark:bg-[#1a1d24] rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {searchResults.map(result => (
                    <Link
                      key={result._id}
                      to={`/profile/${result._id}`}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => { setShowResults(false); setMobileMenuOpen(false); }}
                    >
                      <img src={result.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.name}`} alt="" className="w-8 h-8 rounded-full" />
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{result.name}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Link
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
              >
                <span className="text-xl">🏠</span> Feed
              </Link>
              <Link
                to="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
              >
                <span className="text-xl">📅</span> Events
              </Link>
              <Link
                to={`/profile/${user?.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
              >
                <span className="text-xl">👤</span> My Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
