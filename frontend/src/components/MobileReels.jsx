import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const MobileReels = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentReelIndex, setCurrentReelIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRefs = useRef([]);
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        fetchReels();
    }, []);

    useEffect(() => {
        // Auto-play current reel when in view
        if (videoRefs.current[currentReelIndex]) {
            const video = videoRefs.current[currentReelIndex];
            if (isPlaying) {
                video.play();
            } else {
                video.pause();
            }
        }
    }, [currentReelIndex, isPlaying]);

    const fetchReels = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_ENDPOINTS.POST.ALL}?type=reel`, {
                withCredentials: true
            });

            if (response.data.success) {
                const reelPosts = response.data.posts.filter(post => post.mediaType === 'reel');
                setReels(reelPosts);
            }
        } catch (error) {
            console.error('Error fetching reels:', error);
            toast.error('Failed to load reels');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPause = () => {
        const video = videoRefs.current[currentReelIndex];
        if (video) {
            if (isPlaying) {
                video.pause();
                setIsPlaying(false);
            } else {
                video.play();
                setIsPlaying(true);
            }
        }
    };

    const handleMuteUnmute = () => {
        const video = videoRefs.current[currentReelIndex];
        if (video) {
            video.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleLike = async (reelId) => {
        try {
            const response = await axios.get(API_ENDPOINTS.POST.LIKE(reelId), {
                withCredentials: true
            });
            if (response.data.success) {
                toast.success('Reel liked!');
            }
        } catch (error) {
            toast.error('Failed to like reel');
        }
    };

    const handleShare = async (reelId) => {
        try {
            const reelUrl = `${window.location.origin}/reel/${reelId}`;
            await navigator.clipboard.writeText(reelUrl);
            toast.success('Link copied!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const handleVideoEnd = () => {
        // Auto-play next reel
        if (currentReelIndex < reels.length - 1) {
            setCurrentReelIndex(currentReelIndex + 1);
            setIsPlaying(true);
        }
    };

    if (loading) {
        return (
            <div className='min-h-screen bg-black flex items-center justify-center'>
                <div className='text-center'>
                    <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4'></div>
                    <p className='text-white'>Loading reels...</p>
                </div>
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div className='min-h-screen bg-black flex items-center justify-center'>
                <div className='text-center'>
                    <Play className='w-16 h-16 text-gray-400 mb-4' />
                    <h2 className='text-xl font-bold text-white mb-3'>
                        No reels yet
                    </h2>
                    <p className='text-gray-400 text-sm mb-6'>
                        Create your first reel to get started!
                    </p>
                    <button
                        onClick={() => window.location.href = '/explore'}
                        className='px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-full text-sm font-medium'
                    >
                        Explore Content
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-black relative overflow-hidden'>
            {/* Reels Container */}
            <div className='h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide'>
                {reels.map((reel, index) => (
                    <div
                        key={reel._id}
                        className={`h-screen w-full flex-shrink-0 snap-center ${
                            index === currentReelIndex ? 'block' : 'hidden'
                        }`}
                    >
                        {/* Video Container */}
                        <div className='relative h-full w-full bg-black'>
                            <video
                                ref={(el) => videoRefs.current[index] = el}
                                src={reel.video}
                                className='w-full h-full object-cover'
                                loop
                                muted={isMuted}
                                onEnded={handleVideoEnd}
                                onClick={handlePlayPause}
                                playsInline
                            />
                            
                            {/* Video Overlay Controls */}
                            <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none'>
                                {/* Top Controls */}
                                <div className='absolute top-4 left-4 right-4 flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <div className='bg-black/50 px-2 py-1 rounded-full'>
                                            <span className='text-white text-xs font-medium'>
                                                REEL
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Handle more options
                                        }}
                                        className='p-2 bg-black/50 rounded-full'
                                    >
                                        <MoreVertical className='w-4 h-4 text-white' />
                                    </button>
                                </div>

                                {/* Center Play Indicator */}
                                {!isPlaying && index === currentReelIndex && (
                                    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                                        <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center'>
                                            <Pause className='w-6 h-6 text-white' />
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Controls */}
                                <div className='absolute bottom-4 left-4 right-4'>
                                    <div className='flex items-center justify-between w-full'>
                                        {/* Left Controls */}
                                        <div className='flex items-center gap-3'>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMuteUnmute();
                                                }}
                                                className='p-2 bg-black/50 rounded-full'
                                            >
                                                {isMuted ? (
                                                    <VolumeX className='w-4 h-4 text-white' />
                                                ) : (
                                                    <Volume2 className='w-4 h-4 text-white' />
                                                )}
                                            </button>
                                        </div>

                                        {/* Right Actions */}
                                        <div className='flex items-center gap-3'>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLike(reel._id);
                                                }}
                                                className='p-2 bg-black/50 rounded-full'
                                            >
                                                <Heart className={`w-4 h-4 ${
                                                    reel.likes?.includes(user?._id)
                                                        ? 'text-red-500 fill-current'
                                                        : 'text-white'
                                                }`} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShare(reel._id);
                                                }}
                                                className='p-2 bg-black/50 rounded-full'
                                            >
                                                <Share2 className='w-4 h-4 text-white' />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Author Info */}
                                <div className='absolute bottom-20 left-4 right-4'>
                                    <div className='flex items-center gap-2'>
                                        <img
                                            src={reel.author?.profilePicture || '/default-avatar.png'}
                                            alt={reel.author?.username}
                                            className='w-6 h-6 rounded-full border-2 border-white'
                                        />
                                        <div>
                                            <p className='text-white text-sm font-medium'>
                                                {reel.author?.username}
                                            </p>
                                            <p className='text-gray-300 text-xs'>
                                                {reel.caption}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className='absolute bottom-0 left-0 right-0 h-1 bg-gray-700'>
                                    <div 
                                        className='h-full bg-gradient-to-r from-pink-500 to-blue-500 transition-all duration-300'
                                        style={{
                                            width: isPlaying && index === currentReelIndex ? '100%' : '0%'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Swipe Instructions */}
            <div className='absolute top-4 left-1/2 transform -translate-x-1/2 text-center text-white text-xs bg-black/50 px-3 py-2 rounded-full'>
                Swipe up/down to navigate
            </div>
        </div>
    );
};

export default MobileReels;
