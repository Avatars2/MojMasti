import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from "./ui/button";
import { MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import Comment from './Comment'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts } from '../redux/postSlice'
import { useDispatch, useSelector } from 'react-redux'
import { API_ENDPOINTS } from '../config/api';

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector(store => store.post);
  const [comment, setComment] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  }

  const sendMessageHandler = async () => {
    console.log('Sending comment to:', API_ENDPOINTS.POST.COMMENT(selectedPost?._id));
    console.log('Comment text:', text);

    try {
      const res = await axios.post(`${API_ENDPOINTS.POST.COMMENT(selectedPost?._id)}`, { text }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log('Response:', res.data);

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map(p =>
          p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    }
  }

  const deletePostHandler = async () => {
    try {
        setDeleteLoading(true);
        const res = await axios.delete(
            API_ENDPOINTS.POST.DELETE_POST(selectedPost?._id),
            { withCredentials: true }
        );

        if (res.data.success) {
            const updatedPostData = posts.filter((postItem) => postItem?._id !== selectedPost?._id);
            dispatch(setPosts(updatedPostData));
            toast.success(res.data.message);
            setOpen(false);
        }
    } catch (error) {
        console.error('Delete error', error);
        toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
        setDeleteLoading(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-[1000px] h-[90vh] md:h-[600px] p-0 flex flex-col rounded-lg md:rounded-lg rounded-t-xl rounded-b-none overflow-hidden border-none shadow-2xl mt-auto md:mt-0 mb-0 md:mb-auto">
        <div className='flex flex-col md:flex-row flex-1 h-full'>
          <div className='hidden md:flex w-full md:w-[50%] lg:w-[60%] bg-black items-center justify-center overflow-hidden'>
            {selectedPost?.mediaType === 'video' || selectedPost?.mediaType === 'reel' ? (
                <video
                    src={selectedPost?.video}
                    poster={selectedPost?.thumbnail}
                    controls
                    autoPlay
                    loop
                    className='w-full h-full object-contain'
                />
            ) : (
                <img
                    src={selectedPost?.image}
                    alt="post_img"
                    className='w-full h-full object-contain'
                />
            )}
          </div>
          <div className='w-full md:w-[50%] lg:w-[40%] flex flex-col bg-white h-full'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-100'>
              <div className='flex gap-3 items-center'>
                <Link to={`/app/profile/${selectedPost?.author?._id}`}>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>{selectedPost?.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link to={`/app/profile/${selectedPost?.author?._id}`} className='font-semibold text-[14px] text-gray-900 hover:text-gray-500'>
                    {selectedPost?.author?.username}
                  </Link>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className='cursor-pointer text-gray-600 hover:text-gray-900 transition-colors' />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center">
                  {user && user?._id === selectedPost?.author?._id ? (
                      <Button
                          onClick={deletePostHandler}
                          disabled={deleteLoading}
                          variant='ghost'
                          className="cursor-pointer w-full text-[#ED4956] font-bold py-2 hover:bg-red-50"
                      >
                          {deleteLoading ? 'Deleting...' : 'Delete'}
                      </Button>
                  ) : (
                      <>
                        <div className='cursor-pointer w-full text-[#ED4956] font-bold py-2'>
                          Unfollow
                        </div>
                        <hr className='w-full border-gray-100' />
                        <div className='cursor-pointer w-full py-2'>
                          Add to favorites
                        </div>
                      </>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {/* Comments Area */}
            <div className='flex-1 overflow-y-auto p-4 custom-scrollbar'>
              {/* Post Caption as first comment */}
              {selectedPost?.caption && (
                <div className='flex gap-3 mb-4'>
                    <Avatar className='h-8 w-8 shrink-0'>
                        <AvatarImage src={selectedPost?.author?.profilePicture} />
                        <AvatarFallback>{selectedPost?.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                        <h1 className='text-[14px] leading-[18px]'>
                            <span className='font-semibold text-gray-900 mr-1'>{selectedPost?.author?.username}</span>
                            <span className='text-gray-800 break-words'>{selectedPost?.caption}</span>
                        </h1>
                    </div>
                </div>
              )}
              {
                comment.map((comment) => <Comment key={comment._id} comment={comment} />)
              }
            </div>

            {/* Input Area */}
            <div className='border-t border-gray-100 p-4'>
              <div className='flex items-center gap-2'>
                <input 
                  type="text" 
                  value={text} 
                  onChange={changeEventHandler} 
                  placeholder='Add a comment...' 
                  className='w-full outline-none text-[14px] placeholder-gray-500 text-gray-900 bg-transparent'
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && text.trim()) {
                          sendMessageHandler();
                      }
                  }}
                />
                <button 
                  disabled={!text.trim()} 
                  onClick={sendMessageHandler} 
                  className={`font-semibold text-[14px] transition-opacity ${text.trim() ? 'text-blue-500 hover:text-blue-700 cursor-pointer' : 'text-blue-200 cursor-default'}`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommentDialog