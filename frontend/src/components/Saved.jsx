import React, { useState, useEffect } from 'react';
import { Bookmark, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';

const Saved = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector(store => store.auth);

    useEffect(() => { fetchSavedPosts(); }, []);

    const fetchSavedPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.POST.SAVED, { withCredentials: true });
            if (response.data.success) setSavedPosts(response.data.posts);
        } catch (error) {
            console.error('Error fetching saved posts:', error);
            toast.error('Failed to load saved posts');
        } finally { setLoading(false); }
    };

    const handleUnsave = async (postId) => {
        try {
            const response = await axios.get(API_ENDPOINTS.POST.BOOKMARK(postId), { withCredentials: true });
            if (response.data.success) {
                setSavedPosts(prev => prev.filter(post => post._id !== postId));
                toast.success('Post removed from saved');
            }
        } catch (error) { toast.error('Failed to unsave post'); }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours === 0) { const diffMins = Math.floor(diffTime / (1000 * 60)); return diffMins === 0 ? 'Just now' : `${diffMins}m ago`; }
            return `${diffHours}h ago`;
        } else if (diffDays === 1) return 'Yesterday';
        else if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className='animate-spin-smooth' style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid rgba(139,92,246,0.15)', borderTopColor: '#8b5cf6' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
            <div className='max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6'>
                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 className='gradient-brand-text' style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>Saved Posts</h1>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>Posts you've saved for later</p>
                </div>

                {savedPosts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 0' }}>
                        <div className='animate-float' style={{
                            width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 20px',
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.10))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Bookmark style={{ width: '36px', height: '36px', color: '#818cf8' }} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', marginBottom: '8px' }}>No saved posts yet</h2>
                        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>Save posts to see them here later</p>
                        <button onClick={() => window.location.href = '/app/explore'} className='gradient-brand transition-smooth'
                            style={{ padding: '10px 28px', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
                            Explore Posts
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                        {savedPosts.map((post) => (
                            <div key={post._id} className='shadow-card hover-lift animate-fade-in' style={{
                                borderRadius: '18px', overflow: 'hidden', background: 'white', border: '1px solid rgba(0,0,0,0.04)',
                                position: 'relative',
                            }}>
                                {/* Image */}
                                <div style={{ position: 'relative', aspectRatio: '1' }}>
                                    {post.mediaType === 'image' ? (
                                        <img src={post.image} alt={post.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }} />
                                    ) : (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <video src={post.video} style={{ width: '100%', height: '100%', objectFit: 'cover' }} poster={post.thumbnail} />
                                            <span className='pill' style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 8px' }}>
                                                VIDEO
                                            </span>
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className='transition-smooth' style={{
                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; e.currentTarget.querySelectorAll('.ov').forEach(el => el.style.opacity = '1') }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.querySelectorAll('.ov').forEach(el => el.style.opacity = '0') }}
                                    >
                                        <div className='ov' style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontWeight: 700, fontSize: '13px', opacity: 0, transition: 'opacity 0.2s' }}>
                                            <Heart size={16} /> {post.likes?.length || 0}
                                        </div>
                                        <div className='ov' style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontWeight: 700, fontSize: '13px', opacity: 0, transition: 'opacity 0.2s' }}>
                                            <MessageCircle size={16} /> {post.comments?.length || 0}
                                        </div>
                                    </div>

                                    {/* Unsave */}
                                    <button onClick={() => handleUnsave(post._id)} className='glass transition-smooth'
                                        style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px', borderRadius: '10px', border: 'none', opacity: 0, transition: 'opacity 0.3s' }}
                                        onMouseEnter={(e) => e.currentTarget.parentElement.querySelector('.transition-smooth')?.style}
                                    >
                                        <Bookmark style={{ width: '14px', height: '14px', color: '#8b5cf6', fill: '#8b5cf6' }} />
                                    </button>
                                </div>

                                {/* Info */}
                                <div style={{ padding: '12px 14px' }}>
                                    <p style={{ fontSize: '13px', color: '#1f2937', marginBottom: '8px', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {post.caption || 'No caption'}
                                    </p>
                                    {post.tags && post.tags.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                            {post.tags.slice(0, 2).map((tag, i) => (
                                                <span key={i} className='pill pill-brand' style={{ fontSize: '10px', padding: '2px 8px' }}>#{tag}</span>
                                            ))}
                                            {post.tags.length > 2 && <span style={{ fontSize: '10px', color: '#9ca3af' }}>+{post.tags.length - 2}</span>}
                                        </div>
                                    )}
                                    {post.location && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>
                                            <ExternalLink style={{ width: '12px', height: '12px' }} /> {post.location}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={post.author?.profilePicture || '/default-avatar.png'} alt={post.author?.username}
                                                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(139,92,246,0.15)' }} />
                                            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>{post.author?.username}</span>
                                        </div>
                                        <span style={{ fontSize: '10px', color: '#c4c4cc' }}>{formatDate(post.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Saved;
