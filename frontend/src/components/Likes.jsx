import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';

const Likes = () => {
    const [likedPosts, setLikedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector(store => store.auth);

    useEffect(() => { fetchLikedPosts(); }, []);

    const fetchLikedPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.POST.LIKED, { withCredentials: true });
            if (response.data.success) setLikedPosts(response.data.posts);
        } catch (error) {
            console.error('Error fetching liked posts:', error);
            toast.error('Failed to load liked posts');
        } finally { setLoading(false); }
    };

    const handleUnlike = async (postId) => {
        try {
            const response = await axios.get(API_ENDPOINTS.POST.DISLIKE(postId), { withCredentials: true });
            if (response.data.success) {
                setLikedPosts(prev => prev.filter(post => post._id !== postId));
                toast.success('Post unliked');
            }
        } catch (error) { toast.error('Failed to unlike post'); }
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
                    <h1 className='gradient-brand-text' style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>Liked Posts</h1>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>Posts you've liked on MojMasti</p>
                </div>

                {likedPosts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 0' }}>
                        <div className='animate-float' style={{
                            width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 20px',
                            background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.10))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Heart style={{ width: '36px', height: '36px', color: '#f472b6' }} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', marginBottom: '8px' }}>No liked posts yet</h2>
                        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>Start liking posts to see them here</p>
                        <button onClick={() => window.location.href = '/app/explore'} className='gradient-brand transition-smooth'
                            style={{ padding: '10px 28px', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
                            Explore Posts
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {likedPosts.map((post) => (
                            <div key={post._id} className='shadow-card hover-lift animate-fade-in' style={{
                                borderRadius: '18px', overflow: 'hidden', background: 'white', border: '1px solid rgba(0,0,0,0.04)',
                            }}>
                                <div style={{ position: 'relative', aspectRatio: '1', background: '#f3f4f6' }}>
                                    {post.mediaType === 'image' ? (
                                        <img src={post.image} alt={post.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <video src={post.video} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => e.target.pause()} />
                                    )}
                                    <button onClick={() => handleUnlike(post._id)}
                                        className='glass transition-smooth'
                                        style={{ position: 'absolute', top: '10px', right: '10px', padding: '8px', borderRadius: '12px', border: 'none' }}
                                    >
                                        <Heart style={{ width: '16px', height: '16px', color: '#ef4444', fill: '#ef4444' }} />
                                    </button>
                                </div>
                                <div style={{ padding: '14px' }}>
                                    <p style={{ fontSize: '13px', color: '#1f2937', marginBottom: '10px', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {post.caption || 'No caption'}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart style={{ width: '13px', height: '13px', color: '#ef4444', fill: '#ef4444' }} /> {post.likes?.length || 0}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageCircle style={{ width: '13px', height: '13px' }} /> {post.comments?.length || 0}</span>
                                        </div>
                                        <span style={{ fontSize: '11px' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
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

export default Likes;
