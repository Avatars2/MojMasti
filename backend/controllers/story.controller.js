import { Story } from '../models/story.model.js';
import { User } from '../models/user.model.js';
import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/datauri.js';

// Create a new story
export const createStory = async (req, res) => {
    try {
        const { caption } = req.body;
        const userId = req.id;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Media file is required'
            });
        }

        // Convert buffer to data URI for Cloudinary (multer memory storage)
        const fileUri = getDataUri(req.file);
        const result = await cloudinary.uploader.upload(fileUri, {
            resource_type: 'auto',
            folder: 'stories'
        });

        const mediaType = result.resource_type === 'video' ? 'video' : 'image';

        const story = await Story.create({
            author: userId,
            media: result.secure_url,
            mediaType,
            caption: caption || ''
        });

        await story.populate('author', 'username profilePicture');

        res.status(201).json({
            success: true,
            message: 'Story created successfully',
            story
        });
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create story'
        });
    }
};

// Get all active stories from followed users
export const getStories = async (req, res) => {
    try {
        const userId = req.id;
        
        // Get user's following list
        const user = await User.findById(userId).select('following');
        const followingIds = [...user.following];
        
        // Add current user to see their own stories
        followingIds.push(userId);

        // Get stories from followed users and self
        const stories = await Story.find({
            author: { $in: followingIds },
            expiresAt: { $gt: new Date() }
        })
        .populate('author', 'username profilePicture')
        .sort({ createdAt: -1 });

        // Group stories by author
        const storiesByAuthor = {};
        stories.forEach(story => {
            const authorId = story.author._id.toString();
            if (!storiesByAuthor[authorId]) {
                storiesByAuthor[authorId] = {
                    author: story.author,
                    stories: [],
                    hasViewed: false
                };
            }
            storiesByAuthor[authorId].stories.push(story);
            
            // Check if current user has viewed any story from this author
            const hasViewed = story.viewers.some(viewer => 
                viewer.user.toString() === userId
            );
            if (hasViewed) {
                storiesByAuthor[authorId].hasViewed = true;
            }
        });

        res.status(200).json({
            success: true,
            stories: Object.values(storiesByAuthor)
        });
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stories'
        });
    }
};

// View a story (mark as viewed)
export const viewStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Check if user already viewed this story
        const alreadyViewed = story.viewers.some(viewer => 
            viewer.user.toString() === userId
        );

        if (!alreadyViewed) {
            story.viewers.push({ user: userId });
            await story.save();
        }

        res.status(200).json({
            success: true,
            message: 'Story marked as viewed'
        });
    } catch (error) {
        console.error('Error viewing story:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to view story'
        });
    }
};

// Delete a story
export const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Check if user is the author
        if (story.author.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this story'
            });
        }

        // Delete from Cloudinary
        try {
            const publicId = story.media.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`stories/${publicId}`);
        } catch (cloudError) {
            console.warn('Failed to delete story media from Cloudinary:', cloudError);
        }

        await Story.findByIdAndDelete(storyId);

        res.status(200).json({
            success: true,
            message: 'Story deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete story'
        });
    }
};

// Get user's own stories
export const getUserStories = async (req, res) => {
    try {
        const userId = req.id;

        const stories = await Story.find({
            author: userId,
            expiresAt: { $gt: new Date() }
        })
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            stories
        });
    } catch (error) {
        console.error('Error fetching user stories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user stories'
        });
    }
};
