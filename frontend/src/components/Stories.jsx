import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';
import StoryViewer from './StoryViewer';
import CreateStory from './CreateStory';

const Stories = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStoryGroup, setSelectedStoryGroup] = useState(null);
    const [showCreateStory, setShowCreateStory] = useState(false);
    const [userStories, setUserStories] = useState([]);

    useEffect(() => {
        fetchStories();
        fetchUserStories();
    }, []);

    const fetchStories = async () => {
        try {
            setLoading(true);
            console.log('Fetching stories from:', API_ENDPOINTS.STORY.GET_ALL);
            const res = await axios.get(API_ENDPOINTS.STORY.GET_ALL, {
                withCredentials: true
            });
            console.log('Stories response:', res.data);
            if (res.data.success) {
                setStories(res.data.stories || []);
                console.log('Stories loaded:', res.data.stories?.length || 0);
            } else {
                console.error('Stories API failed:', res.data.message);
                setStories([]);
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
            if (error.response?.status === 401) {
                console.log('User not authenticated - stories will show after login');
                setStories([]);
            } else {
                toast.error('Failed to load stories');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStories = async () => {
        try {
            console.log('Fetching user stories from:', API_ENDPOINTS.STORY.GET_USER_STORIES);
            const res = await axios.get(API_ENDPOINTS.STORY.GET_USER_STORIES, {
                withCredentials: true
            });
            console.log('User stories response:', res.data);
            if (res.data.success) {
                setUserStories(res.data.stories || []);
                console.log('User stories loaded:', res.data.stories?.length || 0);
            } else {
                console.error('User stories API failed:', res.data.message);
                setUserStories([]);
            }
        } catch (error) {
            console.error('Error fetching user stories:', error);
            if (error.response?.status === 401) {
                console.log('User not authenticated - user stories will show after login');
                setUserStories([]);
            } else {
                console.error('User stories error:', error);
            }
        }
    };

    const handleStoryClick = (storyGroup) => {
        setSelectedStoryGroup(storyGroup);
    };

    const handleCloseViewer = () => {
        setSelectedStoryGroup(null);
        fetchStories(); // Refresh stories to update viewed status
    };

    const handleStoryCreated = () => {
        setShowCreateStory(false);
        fetchStories();
        fetchUserStories();
    };

    if (loading) {
        return (
            <div className='w-full h-48 bg-gray-100 rounded-xl animate-pulse'></div>
        );
    }

    return (
        <>
            <div className='w-full bg-white rounded-xl border border-gray-200 p-4 mb-6'>
                <div className='flex gap-4 overflow-x-auto scrollbar-hide min-h-[120px]'>
                    {/* Add Story Button */}
                    <div className='flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer' onClick={() => setShowCreateStory(true)}>
                        <div className='relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 p-0.5 flex-shrink-0'>
                            <div className='w-full h-full rounded-full bg-white p-0.5'>
                                <div className='w-full h-full rounded-full bg-gray-200 flex items-center justify-center'>
                                    <Plus className='w-6 h-6 text-gray-600' />
                                </div>
                            </div>
                            <div className='absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white'>
                                <Plus className='w-3 h-3 text-white' />
                            </div>
                        </div>
                        <span className='text-xs text-gray-600 font-medium whitespace-nowrap'>Your story</span>
                    </div>

                    {/* Stories from followed users */}
                    {stories.map((storyGroup, index) => (
                        <div 
                            key={index} 
                            className='flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer'
                            onClick={() => handleStoryClick(storyGroup)}
                        >
                            <div className='relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 p-0.5 flex-shrink-0'>
                                <div className='w-full h-full rounded-full bg-white p-0.5'>
                                    <img 
                                        src={storyGroup.author.profilePicture || 'https://via.placeholder.com/80'} 
                                        alt={storyGroup.author.username}
                                        className='w-full h-full rounded-full object-cover'
                                    />
                                </div>
                                {!storyGroup.hasViewed && (
                                    <div className='absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white'></div>
                                )}
                            </div>
                            <span className='text-xs text-gray-600 font-medium truncate max-w-[60px] md:max-w-[80px] whitespace-nowrap'>
                                {storyGroup.author.username}
                            </span>
                        </div>
                    ))}

                    {stories.length === 0 && userStories.length === 0 && (
                        <div className='flex items-center justify-center w-full py-4 text-gray-500 text-sm'>
                            No stories available. Create your first story!
                        </div>
                    )}
                </div>
            </div>

            {/* Story Viewer */}
            {selectedStoryGroup && (
                <StoryViewer 
                    storyGroup={selectedStoryGroup} 
                    onClose={handleCloseViewer}
                />
            )}

            {/* Create Story Dialog */}
            {showCreateStory && (
                <CreateStory 
                    onClose={() => setShowCreateStory(false)}
                    onStoryCreated={handleStoryCreated}
                />
            )}
        </>
    );
};

export default Stories;
