import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const StoryViewer = ({ storyGroup, onClose }) => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [viewers, setViewers] = useState([]);

    const currentStory = storyGroup.stories[currentStoryIndex];
    const totalStories = storyGroup.stories.length;

    // Auto-progress timer
    useEffect(() => {
        const duration = 5000; // 5 seconds per story
        const interval = 100; // Update progress every 100ms
        
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (currentStoryIndex < totalStories - 1) {
                        setCurrentStoryIndex(prev => prev + 1);
                        return 0;
                    } else {
                        onClose();
                        return 100;
                    }
                }
                return prev + (interval / duration) * 100;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [currentStoryIndex, totalStories, onClose]);

    // Mark story as viewed
    const markAsViewed = async () => {
        try {
            await axios.post(
                `${API_ENDPOINTS.STORY.VIEW}/${currentStory._id}`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Error marking story as viewed:', error);
        }
    };

    const fetchViewers = async () => {
        try {
            // This would need to be implemented in backend
            // const res = await axios.get(`${API_ENDPOINTS.STORY.VIEWERS}/${currentStory._id}`, {
            //     withCredentials: true
            // });
            // setViewers(res.data.viewers);
        } catch (error) {
            console.error('Error fetching viewers:', error);
        }
    };

    useEffect(() => {
        if (currentStory && !isLoading) {
            markAsViewed();
            fetchViewers();
        }
    }, [currentStory, isLoading, markAsViewed, fetchViewers]);

    const handleNext = useCallback(() => {
        if (currentStoryIndex < totalStories - 1) {
            setCurrentStoryIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentStoryIndex, totalStories, onClose]);

    const handlePrevious = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
            setProgress(0);
        }
    };

    const handleMediaLoad = () => {
        setIsLoading(false);
    };

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'Escape') onClose();
    }, [handleNext, handlePrevious, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!currentStory) return null;

    return (
        <div className='fixed inset-0 bg-black z-50 flex items-center justify-center'>
            {/* Progress Bar */}
            <div className='absolute top-4 left-4 right-4 flex gap-1 z-10'>
                {storyGroup.stories.map((_, index) => (
                    <div 
                        key={index} 
                        className='flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden'
                    >
                        <div 
                            className='h-full bg-white transition-all duration-100 ease-linear'
                            style={{
                                width: index === currentStoryIndex ? `${progress}%` : 
                                       index < currentStoryIndex ? '100%' : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className='absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-all'
            >
                <X size={24} />
            </button>

            {/* Story Content */}
            <div className='relative w-full h-full max-w-md max-h-[85vh] mx-auto'>
                {/* Navigation Buttons */}
                <button
                    onClick={handlePrevious}
                    className='absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-all disabled:opacity-0'
                    disabled={currentStoryIndex === 0}
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    onClick={handleNext}
                    className='absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-70 transition-all'
                >
                    <ChevronRight size={24} />
                </button>

                {/* Media Content */}
                <div className='relative w-full h-full flex items-center justify-center'>
                    {isLoading && (
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        </div>
                    )}

                    {currentStory.mediaType === 'video' ? (
                        <video
                            src={currentStory.media}
                            className='w-full h-full object-contain'
                            autoPlay
                            onLoadedData={handleMediaLoad}
                            onClick={handleNext}
                        />
                    ) : (
                        <img
                            src={currentStory.media}
                            alt='Story'
                            className='w-full h-full object-contain'
                            onLoad={handleMediaLoad}
                            onClick={handleNext}
                        />
                    )}
                </div>

                {/* Story Info */}
                <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-4'>
                    <div className='flex items-center gap-3 mb-3'>
                        <img
                            src={storyGroup.author.profilePicture || 'https://via.placeholder.com/40'}
                            alt={storyGroup.author.username}
                            className='w-8 h-8 rounded-full border-2 border-white'
                        />
                        <div className='flex-1'>
                            <p className='text-white font-semibold text-sm'>
                                {storyGroup.author.username}
                            </p>
                            <p className='text-white text-opacity-70 text-xs'>
                                {new Date(currentStory.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>

                    {currentStory.caption && (
                        <p className='text-white text-sm mb-2'>{currentStory.caption}</p>
                    )}

                    {viewers.length > 0 && (
                        <div className='flex items-center gap-2 text-white text-opacity-70 text-xs'>
                            <span>{viewers.length} views</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;
