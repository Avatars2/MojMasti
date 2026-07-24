import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send, Heart } from 'lucide-react'
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
    const { user, suggestedUsers } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [shareCount, setShareCount] = useState(post.shareCount || 0);
    const [comment, setComment] = useState(post.comments);
    const [bookmarked, setBookmarked] = useState(false);
    const [LikeLoading, setLikeLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [likeAnimating, setLikeAnimating] = useState(false);
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
            setLikeAnimating(true);
            setTimeout(() => setLikeAnimating(false), 350);

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
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
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

    const shareHandler = async () => {
        const shareData = {
            title: `MojMasti Post by ${post.author?.username}`,
            text: post.caption ? `Check out this post: "${post.caption}"` : 'Check out this post on MojMasti!',
            url: window.location.origin
        };

        let shared = false;
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                shared = true;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
            toast.success('Link copied to clipboard!');
            shared = true;
        }

        if (shared) {
            try {
                const res = await axios.get(API_ENDPOINTS.POST.SHARE(post._id), { withCredentials: true });
                if (res.data.success) {
                    setShareCount(res.data.shareCount);
                }
            } catch (err) {
                console.error('Failed to increment share count', err);
            }
        }
    }

    return (
        <div
            className='animate-fade-in w-full bg-white sm:rounded-[20px] sm:border border-b border-gray-100 mb-2 sm:mb-4 overflow-hidden shadow-card sm:shadow-md'
        >
            {/* Post Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                <Link to={`/app/profile/${post.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <Avatar className='h-10 w-10' style={{ border: '2px solid rgba(139,92,246,0.15)' }}>
                        <AvatarImage src={post.author?.profilePicture} alt="author" />
                        <AvatarFallback style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white', fontSize: '13px', fontWeight: 700 }}>
                            {post.author?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#1f2937', fontSize: '14px' }}>{post.author?.username}</span>
                        {user?._id === post.author._id && (
                            <span className='pill pill-brand' style={{ fontSize: '10px', padding: '2px 8px' }}>Author</span>
                        )}
                    </div>
                </Link>


            </div>

            {/* Post Image */}
            <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#f3f4f6' }}>
                <img
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'opacity 0.2s ease',
                    }}
                    src={post.image}
                    alt="post_img"
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.95' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                />
            </div>

            {/* Post Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={likeOrDislikeHandler}
                        className={likeAnimating ? 'animate-heart-bounce' : ''}
                        style={{ display: 'flex', alignItems: 'center', padding: '4px', gap: '6px' }}
                    >
                        {liked ? (
                            <FaHeart size={22} style={{ color: '#ef4444', transition: 'color 0.2s' }} />
                        ) : (
                            <FaRegHeart size={22} style={{ color: '#6b7280', transition: 'color 0.2s' }} />
                        )}
                        <span style={{ color: liked ? '#ef4444' : '#6b7280', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>{postLike}</span>
                    </button>

                    <button
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                        className='transition-smooth'
                        style={{ display: 'flex', alignItems: 'center', padding: '4px', gap: '6px' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.querySelector('svg').style.color = '#4b5563';
                            e.currentTarget.querySelector('span').style.color = '#4b5563';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.querySelector('svg').style.color = '#6b7280';
                            e.currentTarget.querySelector('span').style.color = '#6b7280';
                        }}
                    >
                        <MessageCircle size={22} style={{ color: '#6b7280', transition: 'color 0.2s' }} />
                        <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>{comment.length}</span>
                    </button>

                    <button
                        onClick={shareHandler}
                        className='transition-smooth'
                        style={{ display: 'flex', alignItems: 'center', padding: '4px', gap: '6px' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.querySelector('svg').style.color = '#4b5563';
                            e.currentTarget.querySelector('span').style.color = '#4b5563';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.querySelector('svg').style.color = '#6b7280';
                            e.currentTarget.querySelector('span').style.color = '#6b7280';
                        }}
                        title="Share"
                    >
                        <Send size={22} style={{ color: '#6b7280', transition: 'color 0.2s' }} />
                        <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}>{shareCount}</span>
                    </button>
                </div>

                <button
                    onClick={bookmarkHandler}
                    className='transition-smooth'
                    style={{ display: 'flex', alignItems: 'center', padding: '4px' }}
                >
                    <Bookmark
                        size={22}
                        fill={bookmarked ? '#f59e0b' : 'none'}
                        style={{ color: bookmarked ? '#f59e0b' : '#6b7280', transition: 'all 0.2s' }}
                    />
                </button>
            </div>



            {/* Caption */}
            <div style={{ padding: '0 16px 10px' }}>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                    <span style={{ fontWeight: 700, color: '#1f2937', marginRight: '6px' }}>{post.author?.username}</span>
                    {post.caption}
                </p>
            </div>

            {/* View Comments Link */}
            {comment.length > 0 && (
                <div style={{ padding: '0 16px 10px' }}>
                    <span
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                        style={{ cursor: 'pointer', fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}
                    >
                        View all {comment.length} comments
                    </span>
                </div>
            )}

            {/* Comment Dialog */}
            <CommentDialog open={open} setOpen={setOpen} />


        </div>
    )
}

export default Post