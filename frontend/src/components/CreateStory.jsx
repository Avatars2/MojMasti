import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Send } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';

const CreateStory = ({ onClose, onStoryCreated }) => {
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [mediaType, setMediaType] = useState('image');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!mediaPreview && !media) {
            const timer = setTimeout(() => {
                fileInputRef.current?.click();
            }, 150);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 50MB for stories)
            if (file.size > 50 * 1024 * 1024) {
                toast.error('File size must be less than 50MB');
                return;
            }

            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
            if (!validTypes.includes(file.type)) {
                toast.error('Only images (JPG, PNG, GIF) and videos (MP4, WebM) are allowed');
                return;
            }

            setMedia(file);
            setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setMediaPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!media) {
            toast.error('Please select a photo or video');
            return;
        }

        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('media', media);
            formData.append('caption', caption);

            const res = await axios.post(
                API_ENDPOINTS.STORY.CREATE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            if (res.data.success) {
                toast.success('Story created successfully!');
                onStoryCreated();
            }
        } catch (error) {
            console.error('Error creating story:', error);
            toast.error(error.response?.data?.message || 'Failed to create story');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMedia = () => {
        setMedia(null);
        setMediaPreview(null);
        setCaption('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!mediaPreview) {
        return (
            <div className="hidden">
                <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*,video/*'
                    onChange={handleFileSelect}
                    className='hidden'
                    id='story-media-input'
                />
            </div>
        );
    }

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-200'>
                    <h2 className='text-xl font-bold'>Create Story</h2>
                    <button
                        onClick={onClose}
                        className='w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className='p-4'>
                    {/* Preview and Caption */}
                    <div className='space-y-4'>
                        {/* Media Preview */}
                        <div className='relative rounded-xl overflow-hidden bg-black'>
                            {mediaType === 'video' ? (
                                <video
                                    src={mediaPreview}
                                    className='w-full h-64 object-contain'
                                    controls
                                />
                            ) : (
                                <img
                                    src={mediaPreview}
                                    alt='Story preview'
                                    className='w-full h-64 object-contain'
                                />
                            )}
                            
                            <button
                                onClick={handleRemoveMedia}
                                className='absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all'
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Caption Input */}
                        <div>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder='Add a caption (optional)...'
                                className='w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                rows={3}
                                maxLength={500}
                            />
                            <div className='text-right mt-1'>
                                <span className='text-xs text-gray-500'>
                                    {caption.length}/500
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className='w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? (
                                <>
                                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Share Story
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateStory;
