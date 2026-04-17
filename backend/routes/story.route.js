import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { createStory, getStories, viewStory, deleteStory, getUserStories } from '../controllers/story.controller.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// Create a new story
router.route('/create').post(
    isAuthenticated,
    upload.single('media'),
    createStory
);

// Get all stories from followed users
router.route('/').get(
    isAuthenticated,
    getStories
);

// Get user's own stories
router.route('/my-stories').get(
    isAuthenticated,
    getUserStories
);

// View a story (mark as viewed)
router.route('/:storyId/view').post(
    isAuthenticated,
    viewStory
);

// Delete a story
router.route('/:storyId').delete(
    isAuthenticated,
    deleteStory
);

export default router;
