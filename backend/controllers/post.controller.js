import sharp from "sharp";
import { Readable } from "stream";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// ==================== GET LIKED POSTS ====================
export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.id;
        
        // Find all posts and filter by user's likes
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({ 
                path: 'author', 
                select: 'username profilePicture' 
            })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });

        // Filter posts that user has liked
        const likedPosts = posts.filter(post => 
            post.likes && post.likes.includes(userId)
        );

        return res.status(200).json({
            posts: likedPosts,
            success: true
        });
    } catch (error) {
        console.error('Error fetching liked posts:', error);
        return res.status(500).json({
            message: 'Failed to fetch liked posts',
            success: false
        });
    }
};

// ==================== GET SAVED POSTS ====================
export const getSavedPosts = async (req, res) => {
    try {
        const userId = req.id;
        
        // Get user with bookmarks
        const user = await User.findById(userId).populate('bookmarks');
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        // Get full post details for bookmarked posts
        const savedPosts = await Post.find({
            _id: { $in: user.bookmarks }
        })
            .sort({ createdAt: -1 })
            .populate({ 
                path: 'author', 
                select: 'username profilePicture' 
            })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });

        return res.status(200).json({
            posts: savedPosts,
            success: true
        });
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        return res.status(500).json({
            message: 'Failed to fetch saved posts',
            success: false
        });
    }
};

// ==================== CREATE POST ====================
export const addNewPost = async (req, res) => {
    try {
        const { caption, mediaType, tags, location } = req.body;
        const mediaFile = req.file;
        const authorId = req.id;

        // Validate input
        if (!caption || !caption.trim()) {
            return res.status(400).json({ 
                message: 'Caption is required',
                success: false 
            });
        }

        if (!mediaFile) {
            return res.status(400).json({ 
                message: 'Media file is required. Please select an image or video.',
                success: false 
            });
        }

        // Determine media type if not provided
        const fileType = mediaType || (mediaFile.mimetype.startsWith('video/') ? 'video' : 'image');
        
        let mediaUrl;
        let thumbnailUrl = null;
        let duration = 0;

        console.log(`Processing ${fileType} for post creation:`, mediaFile.originalname);

        if (fileType === 'image') {
            // Validate image size (5MB max)
            if (mediaFile.size > 5 * 1024 * 1024) {
                return res.status(400).json({ 
                    message: 'Image size must be less than 5MB',
                    success: false 
                });
            }

            // Optimize image using sharp
            const optimizedImageBuffer = await sharp(mediaFile.buffer)
                .resize({ width: 800, height: 800, fit: 'inside' })
                .toFormat('jpeg', { quality: 80 })
                .toBuffer();

            // Convert buffer to data URI for Cloudinary
            const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
            
            console.log('Uploading image to Cloudinary...');
            const cloudResponse = await cloudinary.uploader.upload(fileUri, {
                folder: 'posts',
                resource_type: 'auto'
            });
            mediaUrl = cloudResponse.secure_url;

        } else if (fileType === 'video') {
            // Validate video size (50MB for regular videos)
            const maxSize = 50 * 1024 * 1024;
            if (mediaFile.size > maxSize) {
                return res.status(400).json({ 
                    message: `Video size must be less than 50MB`,
                    success: false 
                });
            }

            // Upload video directly to Cloudinary
            console.log('Uploading video to Cloudinary...');
            const cloudResponse = await cloudinary.uploader.upload_stream({
                folder: 'videos',
                resource_type: 'video',
                chunk_size: 6000000
            }, (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    throw error;
                }
                return result;
            });

            // Convert buffer to stream for Cloudinary
            const readableStream = new Readable();
            readableStream.push(mediaFile.buffer);
            readableStream.push(null);

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                    folder: 'videos',
                    resource_type: 'video'
                }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                readableStream.pipe(uploadStream);
            });

            mediaUrl = uploadResult.secure_url;
            duration = uploadResult.duration || 0;

            // Generate thumbnail from video
            try {
                const thumbnailBuffer = await sharp(mediaFile.buffer, { animated: true })
                    .resize({ width: 400, height: 400, fit: 'cover' })
                    .jpeg({ quality: 80 })
                    .toBuffer();

                const thumbnailUri = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
                const thumbnailResponse = await cloudinary.uploader.upload(thumbnailUri, {
                    folder: 'thumbnails',
                    resource_type: 'image'
                });
                thumbnailUrl = thumbnailResponse.secure_url;
            } catch (error) {
                console.log('Could not generate thumbnail:', error.message);
            }
        }

        // Create post in database
        const postData = {
            caption: caption.trim(),
            author: authorId,
            mediaType: fileType,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            location: location || '',
            duration: duration,
            thumbnail: thumbnailUrl
        };

        if (fileType === 'image') {
            postData.image = mediaUrl;
        } else {
            postData.video = mediaUrl;
        }

        const post = await Post.create(postData);

        // Add post to user's posts array
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        // Populate post with author details
        await post.populate({ 
            path: 'author', 
            select: '-password' 
        });

        console.log('Post created successfully:', post._id);

        return res.status(201).json({
            message: 'Post created successfully',
            post,
            success: true,
        });

    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({
            message: 'Failed to create post. Please try again.',
            error: error.message,
            success: false
        });
    }
}

// ==================== GET ALL POSTS ====================
export const getAllPost = async (req, res) => {
    try {
        const { type } = req.query;
        let query = Post.find().sort({ createdAt: -1 });
        
        const posts = await query
            .populate({ 
                path: 'author', 
                select: 'username profilePicture email'
            })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });

        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({
            message: 'Failed to fetch posts',
            success: false
        });
    }
};

// ==================== GET USER POSTS ====================
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'username profilePicture'
            })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });

        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.error('Error fetching user posts:', error);
        return res.status(500).json({
            message: 'Failed to fetch posts',
            success: false
        });
    }
}

// ==================== LIKE POST ====================
export const likePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ 
                message: 'Post not found', 
                success: false 
            });
        }

        // Check if user already liked the post
        const isLiked = post.likes.includes(userId);
        
        if (isLiked) {
            return res.status(400).json({
                message: 'Already liked this post',
                success: false
            });
        }

        // Add like
        await post.updateOne({ $addToSet: { likes: userId } });

        // Get updated post with populated data
        const updatedPost = await Post.findById(postId).populate([
            {
                path: 'author',
                select: 'username profilePicture'
            },
            {
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            }
        ]);

        // Socket notification to post author
        const author = await User.findById(post.author);
        if (author) {
            const authorSocketId = getReceiverSocketId(author._id.toString());
            if (authorSocketId) {
                io.to(authorSocketId).emit('notification', {
                    type: 'like',
                    userId: userId,
                    postId: postId,
                    message: 'Someone liked your post'
                });
            }
        }

        return res.status(200).json({
            message: 'Post liked',
            post: updatedPost,
            success: true
        });

    } catch (error) {
        console.error('Error liking post:', error);
        return res.status(500).json({
            message: 'Failed to like post',
            success: false
        });
    }
}

// ==================== DISLIKE POST ====================
export const dislikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ 
                message: 'Post not found', 
                success: false 
            });
        }

        // Check if user liked the post
        const isLiked = post.likes.includes(userId);
        
        if (!isLiked) {
            return res.status(400).json({
                message: 'You have not liked this post',
                success: false
            });
        }

        // Remove like
        await post.updateOne({ $pull: { likes: userId } });

        // Get updated post with populated data
        const updatedPost = await Post.findById(postId).populate([
            {
                path: 'author',
                select: 'username profilePicture'
            },
            {
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            }
        ]);

        return res.status(200).json({
            message: 'Post unliked',
            post: updatedPost,
            success: true
        });

    } catch (error) {
        console.error('Error unliking post:', error);
        return res.status(500).json({
            message: 'Failed to unlike post',
            success: false
        });
    }
}

// ==================== ADD COMMENT ====================
export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const authorId = req.id;

        // Validate input
        if (!text || !text.trim()) {
            return res.status(400).json({
                message: 'Comment cannot be empty',
                success: false
            });
        }

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            });
        }

        // Create comment
        const comment = await Comment.create({
            text: text.trim(),
            author: authorId,
            post: postId
        });

        // Populate comment author details
        await comment.populate({
            path: 'author',
            select: 'username profilePicture'
        });

        // Add comment to post
        post.comments.push(comment._id);
        await post.save();

        // Socket notification to post author
        const author = await User.findById(post.author);
        if (author) {
            const authorSocketId = getReceiverSocketId(author._id.toString());
            if (authorSocketId) {
                io.to(authorSocketId).emit('notification', {
                    type: 'comment',
                    userId: authorId,
                    postId: postId,
                    message: 'Someone commented on your post'
                });
            }
        }

        return res.status(201).json({
            message: 'Comment added',
            comment,
            success: true
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({
            message: 'Failed to add comment',
            error: error.message,
            success: false
        });
    }
}

// ==================== GET COMMENTS OF POST ====================
export const getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;

        // Find the post
        const post = await Post.findById(postId).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        });

        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            });
        }

        return res.status(200).json({
            comments: post.comments,
            success: true
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({
            message: 'Failed to fetch comments',
            success: false
        });
    }
}

// ==================== DELETE POST ====================
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            });
        }

        // Check if user is the author
        if (post.author.toString() !== userId) {
            return res.status(403).json({
                message: 'You are not authorized to delete this post',
                success: false
            });
        }

        // Delete image from Cloudinary (optional, but good for cleanup)
        if (post.image) {
            try {
                // Extract public ID from Cloudinary URL
                const urlParts = post.image.split('/');
                const publicIdWithExtension = urlParts[urlParts.length - 1];
                const publicId = `mojmasti/posts/${publicIdWithExtension.split('.')[0]}`;
                
                await cloudinary.uploader.destroy(publicId);
                console.log('Image deleted from Cloudinary:', publicId);
            } catch (cloudError) {
                console.warn('Failed to delete image from Cloudinary:', cloudError);
                // Continue with post deletion even if image deletion fails
            }
        }

        // Delete all comments associated with the post
        await Comment.deleteMany({ post: postId });

        // Delete the post
        await Post.findByIdAndDelete(postId);

        // Remove post from user's posts array
        await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });

        return res.status(200).json({
            message: 'Post deleted successfully',
            success: true
        });

    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({
            message: 'Failed to delete post',
            error: error.message,
            success: false
        });
    }
}

// ==================== BOOKMARK POST ====================
export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        // Check if already bookmarked
        const isBookmarked = user.bookmarks.includes(postId);

        if (isBookmarked) {
            // Remove bookmark
            await user.updateOne({ $pull: { bookmarks: postId } });

            return res.status(200).json({
                message: 'Bookmark removed',
                isBookmarked: false,
                success: true
            });
        } else {
            // Add bookmark
            await user.updateOne({ $addToSet: { bookmarks: postId } });

            return res.status(200).json({
                message: 'Post bookmarked',
                isBookmarked: true,
                success: true
            });
        }

    } catch (error) {
        console.error('Error bookmarking post:', error);
        return res.status(500).json({
            message: 'Failed to bookmark post',
            error: error.message,
            success: false
        });
    }
}

// ==================== SHARE POST ====================
export const sharePost = async (req, res) => {
    try {
        const postId = req.params.id;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            });
        }

        // Increment share count
        await post.updateOne({ $inc: { shareCount: 1 } });

        return res.status(200).json({
            message: 'Post shared',
            shareCount: (post.shareCount || 0) + 1,
            success: true
        });

    } catch (error) {
        console.error('Error sharing post:', error);
        return res.status(500).json({
            message: 'Failed to share post',
            success: false
        });
    }
}