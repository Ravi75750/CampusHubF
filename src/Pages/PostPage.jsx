import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function PostPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/social/posts/${id}`);
                setPost(res.data);
            } catch (err) {
                console.error("Failed to fetch post", err);
                setError("Post not found or deleted.");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleLike = async (postId) => {
        try {
            const res = await api.put(`/social/posts/${postId}/like`);
            setPost(res.data);
        } catch (err) {
            console.error("Failed to like post", err);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await api.delete(`/social/posts/${postId}`);
            navigate('/feed');
        } catch (err) {
            console.error("Failed to delete post", err);
        }
    };

    // Placeholder handlers for now, as PostCard expects them
    const handleEdit = (post) => {
        console.log("Edit post", post);
        // Implement edit logic if needed, or pass dummy
    };

    const handleReport = (post) => {
        console.log("Report post", post);
    };

    const handleSave = (post) => {
        console.log("Save post", post);
    };

    const handleAddComment = async (postId, text) => {
        try {
            const res = await api.post(`/social/posts/${postId}/comment`, { text });
            setPost(res.data);
        } catch (err) {
            console.error("Failed to add comment", err);
        }
    };

    const handleReply = async (postId, commentId, text) => {
        try {
            const res = await api.post(`/social/posts/${postId}/comments/${commentId}/reply`, { text });
            setPost(res.data);
        } catch (err) {
            console.error("Failed to reply", err);
        }
    };

    if (loading) return <div className="flex justify-center items-center  min-h-[50vh] text-white">Loading...</div>;
    if (error) return <div className="flex justify-center items-center min-h-[50vh] text-red-500">{error}</div>;

    return (
        <div className="max-w-2xl mx-auto p-4 pt-20">
            <button onClick={() => navigate(-1)} className="mb-4 text-gray-400 hover:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                Back
            </button>

            {post && (
                <PostCard
                    post={post}
                    currentUser={user}
                    onLike={handleLike}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onReport={handleReport}
                    onSave={handleSave}
                    onAddComment={handleAddComment}
                    onReply={handleReply}
                />
            )}
        </div>
    );
}
