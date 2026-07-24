import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, TrendingUp, MapPin, Hash, X, Compass, Heart, MessageCircle, Play } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const MobileExplore = () => {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const { user } = useSelector(store => store.auth);

    const tabs = [
        { id: 'all', label: 'All', icon: Search },
        { id: 'trending', label: 'Trending', icon: TrendingUp },
        { id: 'nearby', label: 'Nearby', icon: MapPin },
        { id: 'tags', label: 'Tags', icon: Hash },
    ];

    const popularTags = [
        'photography', 'nature', 'travel', 'food', 'fashion',
        'art', 'music', 'sports', 'tech', 'lifestyle'
    ];

    useEffect(() => {
        fetchPosts();
    }, [activeTab, searchQuery]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            let url = API_ENDPOINTS.POST.ALL;
            if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;
            else if (activeTab === 'trending') url += '?sort=trending';
            else if (activeTab === 'nearby') url += '?sort=nearby';

            const [postRes, userRes] = await Promise.all([
                axios.get(url, { withCredentials: true }),
                searchQuery ? axios.get(`${API_ENDPOINTS.USER.SEARCH}?query=${encodeURIComponent(searchQuery)}`, { withCredentials: true }) : Promise.resolve({ data: { users: [] } })
            ]);

            if (postRes.data.success) setPosts(postRes.data.posts);
            if (userRes.data?.success) setUsers(userRes.data.users);
        } catch (error) {
            console.error('Error fetching search results:', error);
            toast.error('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
            {/* Search & Tabs Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 30,
                background: 'rgba(248,249,251,0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}>
                {/* Search Bar */}
                <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px 16px 0 16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{
                            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                            width: '18px', height: '18px', color: '#a1a1aa',
                        }} />
                        <input
                            type='text'
                            placeholder='Search posts, tags, users...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '46px',
                                paddingRight: searchQuery ? '42px' : '16px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                background: 'white',
                                border: '1.5px solid rgba(0,0,0,0.08)',
                                borderRadius: '14px',
                                fontSize: '14px',
                                color: '#374151',
                                outline: 'none',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                            }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{
                                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                padding: '4px', borderRadius: '50%', background: 'rgba(0,0,0,0.06)',
                            }}>
                                <X style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Pills */}
                <div className='scrollbar-hide' style={{
                    display: 'flex', justifyContent: 'flex-start',
                    gap: '8px', padding: '12px 16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch'
                }}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className='transition-smooth'
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 18px', borderRadius: '12px', whiteSpace: 'nowrap',
                                    fontSize: '13px', fontWeight: 600, flexShrink: 0,
                                    background: isActive ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'white',
                                    color: isActive ? 'white' : '#6b7280',
                                    border: isActive ? 'none' : '1.5px solid rgba(0,0,0,0.08)',
                                    boxShadow: isActive ? '0 2px 8px rgba(139,92,246,0.3)' : '0 1px 2px rgba(0,0,0,0.04)',
                                }}
                            >
                                <Icon size={14} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ paddingBottom: '80px' }}>
                {/* Tags section */}
                {activeTab === 'tags' && (
                    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1f2937', marginBottom: '14px' }}>Popular Tags</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {popularTags.map((tag, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setSearchQuery(tag); setActiveTab('all'); }}
                                    className='transition-smooth hover-lift'
                                    style={{
                                        padding: '10px 20px', borderRadius: '14px', fontSize: '14px',
                                        fontWeight: 600, background: 'white', color: '#7c3aed',
                                        border: '1.5px solid rgba(139,92,246,0.15)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    }}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <div className='animate-spin-smooth' style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            border: '3px solid rgba(139,92,246,0.15)', borderTopColor: '#8b5cf6',
                        }} />
                    </div>
                ) : posts.length === 0 && users.length === 0 ? (
                    /* Empty State */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
                        <div className='animate-float' style={{
                            width: '88px', height: '88px', borderRadius: '24px',
                            background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.10))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                        }}>
                            <Compass style={{ width: '38px', height: '38px', color: '#a78bfa' }} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', marginBottom: '8px' }}>
                            {searchQuery ? 'No results found' : 'No posts yet'}
                        </h2>
                        <p style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'center', maxWidth: '300px' }}>
                            {searchQuery ? 'Try searching for something else' : 'Start exploring to see posts'}
                        </p>
                    </div>
                ) : (
                    /* ── Instagram-style Explore Grid & Users ── */
                    <div style={{ maxWidth: '935px', margin: '0 auto', padding: '2px' }}>
                        {users.length > 0 && (
                            <div style={{ padding: '16px 12px', background: 'white', borderRadius: '16px', margin: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#374151', marginBottom: '12px', paddingLeft: '4px' }}>Users</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {users.map(u => (
                                        <div key={u._id} onClick={() => window.location.href = `/app/profile/${u._id}`} className='transition-smooth hover-lift' style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', cursor: 'pointer', borderRadius: '8px' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', padding: '2px' }}>
                                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'white' }}>
                                                    <img src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.username}&background=random`} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '2px' }}>{u.username}</h4>
                                                <p style={{ fontSize: '13px', color: '#6b7280' }}>{u.bio || 'MojMasti user'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {posts.length > 0 && (
                            <>
                            {users.length > 0 && <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#374151', marginBottom: '12px', paddingLeft: '14px' }}>Posts</h3>}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '2px',
                            }}>
                            {posts.map((post, index) => {
                                // Every 5th group: make 1 item span 2 rows (Instagram pattern)
                                const groupIndex = Math.floor(index / 5);
                                const posInGroup = index % 5;
                                const isLarge = posInGroup === 0 && groupIndex % 2 === 0;

                                return (
                                    <div
                                        key={post._id}
                                        className='transition-smooth'
                                        style={{
                                            position: 'relative',
                                            aspectRatio: isLarge ? undefined : '1',
                                            gridRow: isLarge ? 'span 2' : 'span 1',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            borderRadius: '2px',
                                            background: '#e5e7eb',
                                        }}
                                    >
                                        {post.mediaType === 'image' ? (
                                            <img
                                                src={post.image}
                                                alt={post.caption}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)' }}
                                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                                            />
                                        ) : (
                                            <>
                                                <video
                                                    src={post.video}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    poster={post.thumbnail}
                                                    muted
                                                    onMouseEnter={(e) => e.target.play()}
                                                    onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                                />
                                                <div style={{
                                                    position: 'absolute', top: '10px', right: '10px',
                                                    background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '4px 6px',
                                                }}>
                                                    <Play style={{ width: '14px', height: '14px', color: 'white', fill: 'white' }} />
                                                </div>
                                            </>
                                        )}

                                        {/* Hover Overlay */}
                                        <div
                                            className='transition-smooth'
                                            style={{
                                                position: 'absolute', inset: 0,
                                                background: 'rgba(0,0,0,0)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(0,0,0,0.35)';
                                                e.currentTarget.querySelectorAll('.ov-stat').forEach(el => el.style.opacity = '1');
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(0,0,0,0)';
                                                e.currentTarget.querySelectorAll('.ov-stat').forEach(el => el.style.opacity = '0');
                                            }}
                                        >
                                            <div className='ov-stat' style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                color: 'white', fontWeight: 700, fontSize: '15px',
                                                opacity: 0, transition: 'opacity 0.2s ease',
                                            }}>
                                                <Heart size={18} fill='white' /> {post.likes?.length || 0}
                                            </div>
                                            <div className='ov-stat' style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                color: 'white', fontWeight: 700, fontSize: '15px',
                                                opacity: 0, transition: 'opacity 0.2s ease',
                                            }}>
                                                <MessageCircle size={18} fill='white' /> {post.comments?.length || 0}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileExplore;
