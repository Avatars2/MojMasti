import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';
import Post from './Post';

const Likes = () => {
    const [likedPosts, setLikedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        fetchLikedPosts();
    }, []);

    const fetchLikedPosts = async () => {
        try {
            setLoading(true);
            // Use the dedicated liked posts endpoint
            const response = await axios.get(API_ENDPOINTS.POST.LIKED, {
                withCredentials: true
            });
            
            if (response.data.success) {
                setLikedPosts(response.data.posts);
            }
        } catch (error) {
            console.error('Error fetching liked posts:', error);
            toast.error('Failed to load liked posts');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlike = async (postId) => {
        try {
            const response = await axios.get(API_ENDPOINTS.POST.DISLIKE(postId), {
                withCredentials: true
            });
            
            if (response.data.success) {
                // Remove post from liked posts
                setLikedPosts(prev => prev.filter(post => post._id !== postId));
                toast.success('Post unliked');
            }
        } catch (error) {
            console.error('Error unliking post:', error);
            toast.error('Failed to unlike post');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Liked Posts</h1>
                    <p className="text-gray-600">Posts you've liked on MojMasti</p>
                </div>

                {/* Content */}
                {likedPosts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mb-4">
                            <Heart className="h-16 w-16 text-gray-300 mx-auto" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No liked posts yet</h2>
                        <p className="text-gray-500 mb-6">
                            Start liking posts to see them here
                        </p>
                        <button
                            onClick={() => window.location.href = '/explore'}
                            className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                        >
                            Explore Posts
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {likedPosts.map((post) => (
                            <div key={post._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* Post Image/Video */}
                                <div className="relative aspect-square bg-gray-100">
                                    {post.mediaType === 'image' ? (
                                        <img
                                            src={post.image}
                                            alt={post.caption}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <video
                                            src={post.video}
                                            className="w-full h-full object-cover"
                                            controls={false}
                                            onMouseEnter={(e) => e.target.play()}
                                            onMouseLeave={(e) => e.target.pause()}
                                        />
                                    )}
                                    
                                    {/* Overlay Actions */}
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            onClick={() => handleUnlike(post._id)}
                                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                                        >
                                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                                        </button>
                                    </div>
                                </div>

                                {/* Post Info */}
                                <div className="p-4">
                                    <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                                        {post.caption || 'No caption'}
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Heart className="h-4 w-4 fill-current text-red-500" />
                                            <span className="text-sm">{post.likes?.length || 0}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="h-4 w-4" />
                                            <span className="text-sm">{post.comments?.length || 0}</span>
                                        </div>
                                        
                                        <span className="text-xs">
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

export default Likes;
