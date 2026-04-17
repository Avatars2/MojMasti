import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, TrendingUp, MapPin, Hash, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const MobileExplore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const { user } = useSelector(store => store.auth);

    const tabs = [
        { id: 'all', label: 'All', icon: <Search size={16} /> },
        { id: 'trending', label: 'Trending', icon: <TrendingUp size={16} /> },
        { id: 'nearby', label: 'Nearby', icon: <MapPin size={16} /> },
        { id: 'tags', label: 'Tags', icon: <Hash size={16} /> },
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
            
            if (searchQuery) {
                url += `?search=${encodeURIComponent(searchQuery)}`;
            } else if (activeTab === 'trending') {
                url += '?sort=trending';
            } else if (activeTab === 'nearby') {
                url += '?sort=nearby';
            }

            const response = await axios.get(url, {
                withCredentials: true
            });

            if (response.data.success) {
                setPosts(response.data.posts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    const handleTagClick = (tag) => {
        setSearchQuery(tag);
        setActiveTab('all');
    };

    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mb-4'></div>
                    <p className='text-gray-600'>Loading posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='sticky top-0 z-40 bg-white border-b border-gray-200'>
                {/* Search Bar */}
                <div className='p-4'>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                        <input
                            type='text'
                            placeholder='Search posts, tags, users...'
                            value={searchQuery}
                            onChange={handleSearch}
                            className='w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500'
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className='absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full'
                            >
                                <X className='w-4 h-4 text-gray-500' />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className='flex overflow-x-auto scrollbar-hide border-b border-gray-200'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab.icon}
                            <span className='text-sm font-medium'>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className='pb-20'>
                {/* Tags Section */}
                {activeTab === 'tags' && (
                    <div className='p-4'>
                        <h3 className='text-lg font-bold text-gray-900 mb-4'>Popular Tags</h3>
                        <div className='flex flex-wrap gap-2'>
                            {popularTags.map((tag, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTagClick(tag)}
                                    className='px-3 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-medium hover:bg-pink-200 transition-colors'
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Posts Grid */}
                {posts.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-16 px-4'>
                        <div className='text-center'>
                            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <Search className='w-8 h-8 text-gray-400' />
                            </div>
                            <h2 className='text-xl font-bold text-gray-900 mb-3'>
                                {searchQuery ? 'No results found' : 'No posts yet'}
                            </h2>
                            <p className='text-gray-600 text-sm mb-6 text-center'>
                                {searchQuery 
                                    ? 'Try searching for something else'
                                    : 'Start exploring to see posts'
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 gap-3 p-4'>
                        {posts.map((post) => (
                            <div key={post._id} className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                                {/* Post Image */}
                                <div className='aspect-square bg-gray-100 relative'>
                                    {post.mediaType === 'image' ? (
                                        <img
                                            src={post.image}
                                            alt={post.caption}
                                            className='w-full h-full object-cover'
                                        />
                                    ) : (
                                        <div className='relative w-full h-full'>
                                            <video
                                                src={post.video}
                                                className='w-full h-full object-cover'
                                                poster={post.thumbnail}
                                            />
                                            {post.mediaType === 'reel' && (
                                                <div className='absolute top-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs'>
                                                    REEL
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Post Info */}
                                <div className='p-3'>
                                    {/* Author */}
                                    <div className='flex items-center gap-2 mb-2'>
                                        <img
                                            src={post.author?.profilePicture || '/default-avatar.png'}
                                            alt={post.author?.username}
                                            className='w-6 h-6 rounded-full object-cover'
                                        />
                                        <span className='text-xs font-medium text-gray-900 truncate'>
                                            {post.author?.username}
                                        </span>
                                    </div>

                                    {/* Caption */}
                                    {post.caption && (
                                        <p className='text-xs text-gray-800 mb-2 line-clamp-2'>
                                            {post.caption}
                                        </p>
                                    )}

                                    {/* Engagement */}
                                    <div className='flex items-center justify-between text-xs text-gray-500'>
                                        <div className='flex items-center gap-2'>
                                            <span>❤️ {post.likes?.length || 0}</span>
                                            <span>💬 {post.comments?.length || 0}</span>
                                        </div>
                                        <span>
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
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

export default MobileExplore;
