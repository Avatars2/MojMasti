import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
            <div
                className='shadow-card w-full bg-white sm:rounded-[20px] sm:border border-b border-gray-100 mb-2 sm:mb-5 py-3 px-4 sm:px-5'
            >
                <div style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <div className='skeleton' style={{ width: '68px', height: '68px', borderRadius: '50%' }} />
                            <div className='skeleton' style={{ width: '48px', height: '10px', borderRadius: '5px' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className='shadow-card w-full bg-white sm:rounded-[20px] sm:border border-b border-gray-100 mb-2 sm:mb-5 py-3 px-4 sm:px-5'
            >
                <div className='scrollbar-hide' style={{ display: 'flex', gap: '14px', overflowX: 'auto', minHeight: '100px', alignItems: 'flex-start', paddingBottom: '4px' }}>
                    {/* Add Story Button */}
                    <div
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: 'pointer' }}
                        onClick={() => setShowCreateStory(true)}
                    >
                        <div style={{ position: 'relative' }}>
                            <div
                                style={{
                                    width: '68px',
                                    height: '68px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.10))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed rgba(139,92,246,0.3)',
                                    transition: 'all 0.25s ease',
                                }}
                                className='hover-lift'
                            >
                                <Plus style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
                            </div>
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    right: '-2px',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2.5px solid white',
                                    boxShadow: '0 2px 6px rgba(236,72,153,0.3)',
                                }}
                            >
                                <Plus style={{ width: '11px', height: '11px', color: 'white', strokeWidth: 3 }} />
                            </div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Your story</span>
                    </div>

                    {/* Stories from followed users */}
                    {stories.map((storyGroup, index) => (
                        <div
                            key={index}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: 'pointer' }}
                            onClick={() => handleStoryClick(storyGroup)}
                        >
                            <div className={storyGroup.hasViewed ? 'story-ring-viewed' : 'story-ring'} style={{ position: 'relative' }}>
                                <div className='story-ring-inner'>
                                    <img
                                        src={storyGroup.author.profilePicture || 'https://via.placeholder.com/80'}
                                        alt={storyGroup.author.username}
                                        style={{
                                            width: '62px',
                                            height: '62px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>
                                {!storyGroup.hasViewed && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            border: '2px solid white',
                                        }}
                                    />
                                )}
                            </div>
                            <span style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '68px',
                                textAlign: 'center',
                            }}>
                                {storyGroup.author.username}
                            </span>
                        </div>
                    ))}

                    {stories.length === 0 && userStories.length === 0 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            padding: '12px 0',
                        }}>
                            <p style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>
                                No stories available.{' '}
                                <span
                                    onClick={() => setShowCreateStory(true)}
                                    style={{ color: '#8b5cf6', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Create your first story!
                                </span>
                            </p>
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
