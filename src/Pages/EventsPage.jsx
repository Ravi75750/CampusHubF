import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

/* ---------- ICONS ---------- */
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);


export default function EventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", location: "", category: "General", image: "" });
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Academic", "Sports", "Cultural", "Tech", "Workshops"];

    useEffect(() => {
        fetchEvents();
    }, []);

    function fetchEvents() {
        api.get("/events").then(res => setEvents(res.data)).catch(console.error);
    }

    async function handleCreateEvent(e) {
        e.preventDefault();
        try {
            await api.post("/events", newEvent);
            setShowModal(false);
            setNewEvent({ title: "", date: "", time: "", location: "", category: "General", image: "" });
            fetchEvents();
        } catch (error) {
            alert("Failed to create event");
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete event?")) return;
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (error) {
            alert("Failed to delete");
        }
    }

    if (!user) return <div className="p-8 text-center">Loading...</div>;

    const filteredEvents = selectedCategory === "All"
        ? events
        : events.filter(e => e.category === selectedCategory);

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

                {/* Categories Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Upcoming Events</h1>
                        <p className="text-slate-400">Discover what's happening on campus</p>
                    </div>

                    {/* Category Filter Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${selectedCategory === cat
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                    : "bg-black/20 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-sm">
                            <div className="text-6xl mb-4">📅</div>
                            <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
                            <p className="text-slate-400">There are no events in this category yet.</p>
                        </div>
                    )}

                    {filteredEvents.map((event) => (
                        <div
                            key={event._id}
                            className="group bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        >
                            <div className="h-48 relative overflow-hidden bg-slate-800">
                                <img src={event.image || "https://images.unsplash.com/photo-1546514714-df0b2df7c23c?ixlib=rb-4.0-3&auto=format&fit=crop&w=800&q=80"} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide text-indigo-400 border border-white/10 shadow-sm">
                                    {event.category}
                                </div>
                                {user?.role === 'Admin' && (
                                    <button onClick={() => handleDelete(event._id)} className="absolute top-4 left-4 bg-red-500/90 text-white p-2 rounded-lg hover:bg-red-600 transition-colors shadow-sm">
                                        <TrashIcon />
                                    </button>
                                )}
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex gap-4 mb-4">
                                    <div className="flex flex-col items-center justify-center bg-indigo-900/20 w-14 h-14 rounded-xl flex-shrink-0 text-indigo-400 border border-indigo-500/20 shadow-sm">
                                        <span className="text-xs font-bold uppercase">{event.date.split(" ")[1] || "DATE"}</span>
                                        <span className="text-xl font-bold leading-none">{event.date.split(" ")[0] || "00"}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg leading-tight mb-2 text-white group-hover:text-indigo-400 transition-colors line-clamp-2">{event.title}</h3>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <ClockIcon /> <span>{event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <MapPinIcon /> <span className="truncate">{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-[#1a1d24] bg-slate-700"></div>
                                        ))}
                                        <span className="ml-2 text-xs text-slate-500 self-center pl-1">+12 others</span>
                                    </div>
                                    <button className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Register</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* FAB for Admin */}
            {user?.role === 'Admin' && (
                <button
                    onClick={() => setShowModal(true)}
                    className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 z-40 outline-none"
                    aria-label="Create Event"
                >
                    <PlusIcon />
                </button>
            )}

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#1a1d24] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
                        <div className="flex items-center justify-between p-4 border-b border-slate-800">
                            <h2 className="text-lg font-semibold text-white">Create Event</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                            >
                                <XIcon />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Event Title</label>
                                <input
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder-slate-500"
                                    placeholder="e.g. Annual Tech Symposium"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                                    <input
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder-slate-500"
                                        placeholder="e.g. 25 DEC"
                                        value={newEvent.date}
                                        onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Time</label>
                                    <input
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder-slate-500"
                                        placeholder="e.g. 10:00 AM"
                                        value={newEvent.time}
                                        onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                                <input
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder-slate-500"
                                    placeholder="e.g. Auditorium A"
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
                                        value={newEvent.category}
                                        onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                                    >
                                        <option>General</option>
                                        <option>Academic</option>
                                        <option>Sports</option>
                                        <option>Cultural</option>
                                        <option>Tech</option>
                                        <option>Workshops</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Image URL</label>
                                    <input
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder-slate-500"
                                        placeholder="https://..."
                                        value={newEvent.image}
                                        onChange={e => setNewEvent({ ...newEvent, image: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all">Create Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
