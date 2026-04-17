import React, { useState, useEffect } from 'react';
import { Bookmark, ExternalLink, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';

const Saved = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    const fetchSavedPosts = async () => {
        try {
            setLoading(true);
            // Use the dedicated saved posts endpoint
            const response = await axios.get(API_ENDPOINTS.POST.SAVED, {
                withCredentials: true
            });
            
            if (response.data.success) {
                setSavedPosts(response.data.posts);
            }
        } catch (error) {
            console.error('Error fetching saved posts:', error);
            toast.error('Failed to load saved posts');
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (postId) => {
        try {
            const response = await axios.get(API_ENDPOINTS.POST.BOOKMARK(postId), {
                withCredentials: true
            });
            
            if (response.data.success) {
                // Remove post from saved posts
                setSavedPosts(prev => prev.filter(post => post._id !== postId));
                toast.success('Post removed from saved');
            }
        } catch (error) {
            console.error('Error unsaving post:', error);
            toast.error('Failed to unsave post');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMins = Math.floor(diffTime / (1000 * 60));
                return diffMins === 0 ? 'Just now' : `${diffMins}m ago`;
            }
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Posts</h1>
                    <p className="text-gray-600">Posts you've saved for later</p>
                </div>

                {/* Content */}
                {savedPosts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mb-4">
                            <Bookmark className="h-16 w-16 text-gray-300 mx-auto" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No saved posts yet</h2>
                        <p className="text-gray-500 mb-6">
                            Save posts to see them here later
                        </p>
                        <button
                            onClick={() => window.location.href = '/explore'}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                        >
                            Explore Posts
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {savedPosts.map((post) => (
                            <div key={post._id} className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                                {/* Post Media */}
                                <div className="relative aspect-square">
                                    {post.mediaType === 'image' ? (
                                        <img
                                            src={post.image}
                                            alt={post.caption}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="relative w-full h-full">
                                            <video
                                                src={post.video}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                controls={false}
                                                poster={post.thumbnail}
                                            />
                                            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                                {post.mediaType === 'reel' ? 'REEL' : 'VIDEO'}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-3">
                                            <div className="flex items-center gap-1 text-white">
                                                <Heart className="h-4 w-4" />
                                                <span className="text-sm">{post.likes?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-white">
                                                <MessageCircle className="h-4 w-4" />
                                                <span className="text-sm">{post.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Unsave Button */}
                                    <button
                                        onClick={() => handleUnsave(post._id)}
                                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                                        title="Remove from saved"
                                    >
                                        <Bookmark className="h-4 w-4 text-blue-500 fill-current" />
                                    </button>
                                </div>

                                {/* Post Info */}
                                <div className="p-3">
                                    <p className="text-sm text-gray-900 mb-2 line-clamp-2 font-medium">
                                        {post.caption || 'No caption'}
                                    </p>
                                    
                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {post.tags.slice(0, 2).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                            {post.tags.length > 2 && (
                                                <span className="text-xs text-gray-500">
                                                    +{post.tags.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Location */}
                                    {post.location && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                            <ExternalLink className="h-3 w-3" />
                                            <span>{post.location}</span>
                                        </div>
                                    )}
                                    
                                    {/* Author and Date */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={post.author?.profilePicture || '/default-avatar.png'}
                                                alt={post.author?.username}
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                            <span className="text-xs text-gray-600">
                                                {post.author?.username}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(post.createdAt)}
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

export default Saved;
