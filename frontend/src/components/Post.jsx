import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Share, Heart, Loader } from 'lucide-react'
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '../redux/postSlice'
import { Badge } from './ui/badge'
import { API_ENDPOINTS } from '../config/api'
import { logger } from '../utils/logger'
import { Link } from 'react-router-dom'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const [bookmarked, setBookmarked] = useState(false);
    const [LikeLoading, setLikeLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            setLikeLoading(true);
            const ACTION = liked ? 'dislike' : 'like';
            const endpoint = liked 
                ? API_ENDPOINTS.POST.DISLIKE(post._id)
                : API_ENDPOINTS.POST.LIKE(post._id);

            const res = await axios.get(endpoint, { withCredentials: true });
            
            logger.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            logger.error('Like/Dislike error', error);
            toast.error('Failed to like/dislike post');
        } finally {
            setLikeLoading(false);
        }
    }

    const commentHandler = async () => {
        try {
            setCommentLoading(true);
            const res = await axios.post(
                API_ENDPOINTS.POST.COMMENT(post._id),
                { text },
                { headers: { 'Content-Type': 'application/json'}, withCredentials: true }
            );
            
            logger.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            logger.error('Comment error', error);
            toast.error('Failed to add comment');
        } finally {
            setCommentLoading(false);
        }
    }

    const deletePostHandler = async () => {
        try {
            setDeleteLoading(true);
            const res = await axios.delete(
                API_ENDPOINTS.POST.DELETE_POST(post?._id),
                { withCredentials: true }
            );
            
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            logger.error('Delete error', error);
            toast.error(error.response?.data?.message || 'Failed to delete post');
        } finally {
            setDeleteLoading(false);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(
                API_ENDPOINTS.POST.BOOKMARK(post?._id),
                { withCredentials: true }
            );
            if (res.data.success) {
                setBookmarked(!bookmarked);
                toast.success(res.data.message);
            }
        } catch (error) {
            logger.error('Bookmark error', error);
            toast.error('Failed to bookmark post');
        }
    }

    return (
        <div className='w-full border-b border-gray-200 bg-white'>
            {/* Post Header */}
            <div className='flex items-center justify-between p-4'>
                <Link to={`/profile/${post.author?._id}`} className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                        <AvatarImage src={post.author?.profilePicture} alt="author" />
                        <AvatarFallback>{post.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-3'>
                        <h1 className='font-semibold text-gray-800 text-sm'>{post.author?.username}</h1>
                        {user?._id === post.author._id && <Badge variant="secondary" className='text-xs'>Author</Badge>}
                    </div>
                </Link>
                
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer text-gray-600 hover:text-gray-800 transition-colors' size={20} />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center gap-4">
                        {post?.author?._id !== user?._id && (
                            <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold hover:bg-red-50">
                                Unfollow
                            </Button>
                        )}

                        <Button variant='ghost' className="cursor-pointer w-fit hover:bg-gray-100">
                            Add to favorites
                        </Button>

                        {user && user?._id === post?.author._id && (
                            <Button 
                                onClick={deletePostHandler}
                                disabled={deleteLoading}
                                variant='ghost' 
                                className="cursor-pointer w-fit text-[#ED4956] hover:bg-red-50"
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Post Image */}
            <div className='w-full aspect-square overflow-hidden bg-gray-100'>
                <img
                    className='w-full h-full object-cover hover:opacity-95 transition-opacity'
                    src={post.image}
                    alt="post_img"
                />
            </div>

            {/* Post Actions */}
            <div className='flex items-center justify-between p-4'>
                <div className='flex items-center gap-4'>
                    {liked ? (
                        <FaHeart 
                            onClick={likeOrDislikeHandler} 
                            size={24} 
                            className='cursor-pointer text-red-600 transition-colors' 
                        />
                    ) : (
                        <FaRegHeart 
                            onClick={likeOrDislikeHandler} 
                            size={24} 
                            className='cursor-pointer hover:text-gray-600 transition-colors' 
                        />
                    )}

                    <MessageCircle 
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }} 
                        className='cursor-pointer hover:text-gray-600 transition-colors'
                        size={24}
                    />
                    
                    <Share className='cursor-pointer hover:text-gray-600 transition-colors' size={24} />
                </div>

                <Bookmark 
                    onClick={bookmarkHandler} 
                    className='cursor-pointer hover:text-yellow-500 transition-colors'
                    size={24}
                    fill={bookmarked ? 'currentColor' : 'none'}
                    color={bookmarked ? '#eab308' : 'currentColor'}
                />
            </div>

            {/* Likes Count */}
            <div className='px-4 pb-2'>
                <span className='font-semibold text-gray-800 text-sm block'>{postLike} likes</span>
            </div>

            {/* Caption */}
            <div className='px-4 pb-3'>
                <p className='text-gray-800 text-sm'>
                    <span className='font-semibold text-gray-800'>{post.author?.username}</span>
                    {' '}{post.caption}
                </p>
            </div>

            {/* View Comments Link */}
            {comment.length > 0 && (
                <div className='px-4 pb-3'>
                    <span 
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }} 
                        className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'
                    >
                        View all {comment.length} comments
                    </span>
                </div>
            )}

            {/* Comment Dialog */}
            <CommentDialog open={open} setOpen={setOpen} />

            {/* Add Comment Section */}
            <div className='px-4 py-3 border-t border-gray-200 flex items-center gap-2'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='outline-none text-sm w-full bg-white'
                />
                {text && (
                    <span 
                        onClick={commentHandler}
                        className='text-[#3BADF8] cursor-pointer font-semibold hover:text-[#2a95d9] transition-colors text-sm'
                    >
                        {commentLoading ? 'Posting...' : 'Post'}
                    </span>
                )}
            </div>
        </div>
    )
}

export default Post