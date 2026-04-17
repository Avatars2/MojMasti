import React, { useState, useRef } from 'react';
import { X, Upload, Send, Music, Tag, MapPin } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';

const CreateReel = ({ onClose, onReelCreated }) => {
    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [tags, setTags] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 100MB for reels)
            if (file.size > 100 * 1024 * 1024) {
                toast.error('File size must be less than 100MB');
                return;
            }

            // Check file type
            if (!file.type.startsWith('video/')) {
                toast.error('Only video files are allowed for reels');
                return;
            }

            setVideo(file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setVideoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVideoLoaded = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!video) {
            toast.error('Please select a video');
            return;
        }

        if (duration > 90) {
            toast.error('Reels must be 90 seconds or less');
            return;
        }

        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('video', video);
            formData.append('caption', caption);
            formData.append('mediaType', 'reel');
            formData.append('tags', tags.split(',').map(tag => tag.trim()).filter(tag => tag));
            formData.append('location', location);

            const res = await axios.post(
                API_ENDPOINTS.POST.CREATE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            if (res.data.success) {
                toast.success('Reel created successfully!');
                onReelCreated();
            }
        } catch (error) {
            console.error('Error creating reel:', error);
            toast.error(error.response?.data?.message || 'Failed to create reel');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveVideo = () => {
        setVideo(null);
        setVideoPreview(null);
        setCaption('');
        setTags('');
        setLocation('');
        setDuration(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-200'>
                    <h2 className='text-xl font-bold'>Create Reel</h2>
                    <button
                        onClick={onClose}
                        className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className='p-4 max-h-[70vh] overflow-y-auto'>
                    {!videoPreview ? (
                        // File Upload Area
                        <div className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center'>
                            <div className='flex flex-col items-center gap-4'>
                                <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
                                    <Music className='w-8 h-8 text-white' />
                                </div>
                                
                                <div>
                                    <p className='text-lg font-semibold text-gray-800 mb-2'>
                                        Create a new reel
                                    </p>
                                    <p className='text-sm text-gray-500 mb-4'>
                                        Share a short video with your followers
                                    </p>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='video/*'
                                    onChange={handleFileSelect}
                                    className='hidden'
                                    id='reel-video-input'
                                />

                                <label
                                    htmlFor='reel-video-input'
                                    className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2'
                                >
                                    <Upload size={20} />
                                    Choose video
                                </label>

                                <div className='text-xs text-gray-400 space-y-1'>
                                    <p>MP4, WebM, MOV (Max 100MB, 90 seconds)</p>
                                    <p>Recommended: 9:16 aspect ratio</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Preview and Details
                        <div className='space-y-4'>
                            {/* Video Preview */}
                            <div className='relative rounded-xl overflow-hidden bg-black'>
                                <video
                                    ref={videoRef}
                                    src={videoPreview}
                                    className='w-full h-96 object-contain'
                                    controls
                                    onLoadedMetadata={handleVideoLoaded}
                                />
                                
                                <button
                                    onClick={handleRemoveVideo}
                                    className='absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all'
                                >
                                    <X size={16} />
                                </button>

                                {/* Duration Badge */}
                                <div className='absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded'>
                                    {formatDuration(duration)}
                                </div>
                            </div>

                            {/* Caption Input */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Caption
                                </label>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder='Write a caption for your reel...'
                                    className='w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                                    rows={3}
                                    maxLength={2000}
                                />
                                <div className='text-right mt-1'>
                                    <span className='text-xs text-gray-500'>
                                        {caption.length}/2000
                                    </span>
                                </div>
                            </div>

                            {/* Tags Input */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                                    <Tag size={16} />
                                    Tags
                                </label>
                                <input
                                    type='text'
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder='Add tags (comma separated)...'
                                    className='w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                                />
                                <p className='text-xs text-gray-500 mt-1'>
                                    Separate tags with commas (e.g., dance, music, trending)
                                </p>
                            </div>

                            {/* Location Input */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                                    <MapPin size={16} />
                                    Location (optional)
                                </label>
                                <input
                                    type='text'
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder='Add location...'
                                    className='w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading || duration > 90}
                                className='w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loading ? (
                                    <>
                                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Share Reel
                                    </>
                                )}
                            </button>

                            {duration > 90 && (
                                <p className='text-red-500 text-sm text-center'>
                                    Video is too long. Please trim to 90 seconds or less.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateReel;
