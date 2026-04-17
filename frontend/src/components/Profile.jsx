import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '../hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from "./ui/button";
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';
import { setAuthUser } from '../redux/authSlice';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useGetUserProfile(userId);

  const { userProfile, user } = useSelector(store => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;

  useEffect(() => {
    if (user && userProfile) {
      setIsFollowing((user.following || []).map(String).includes(String(userProfile._id)));
    }
  }, [userProfile, user]);

  const handleFollowUnfollow = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        API_ENDPOINTS.USER.FOLLOW(userProfile._id),
        {},
        { withCredentials: true }
      );
      
      if (res.data.success) {
        if (res.data.user) {
          dispatch(setAuthUser(res.data.user));
          setIsFollowing(!isFollowing);
        }
        handleApiSuccess(res.data.message);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  if (!userProfile) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='animate-spin' size={32} />
      </div>
    );
  }

  return (
    <div className='w-full bg-gray-50 min-h-screen'>
      <div className='max-w-5xl mx-auto p-4 md:p-8'>
        
        {/* Profile Header */}
        <div className='bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8'>
          <div className='flex flex-col md:flex-row items-center md:items-start gap-8'>
            <Avatar className='h-40 w-40'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>{userProfile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className='flex-1 text-center md:text-left'>
              <div className='flex flex-col md:flex-row items-center gap-4 mb-4'>
                <h1 className='text-3xl font-bold text-gray-800'>{userProfile?.username}</h1>
                {
                  isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit"><Button className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold'>Edit profile</Button></Link>
                      <Button className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold'>View archive</Button>
                    </>
                  ) : (
                    isFollowing ? (
                      <>
                        <Button 
                          className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold'
                          onClick={handleFollowUnfollow}
                          disabled={loading}
                        >
                          {loading ? <Loader className='animate-spin mr-2' size={16} /> : null}
                          Unfollow
                        </Button>
                        <Button className='bg-blue-500 hover:bg-blue-600 text-white font-bold'>Message</Button>
                      </>
                    ) : (
                      <Button 
                        className='bg-blue-500 hover:bg-blue-600 text-white font-bold'
                        onClick={handleFollowUnfollow}
                        disabled={loading}
                      >
                        {loading ? <Loader className='animate-spin mr-2' size={16} /> : null}
                        Follow
                      </Button>
                    )
                  )
                }
              </div>

              <div className='flex justify-center md:justify-start gap-8 mb-6'>
                <div>
                  <p className='font-bold text-xl'>{userProfile?.posts?.length || 0}</p>
                  <p className='text-gray-600 text-sm'>posts</p>
                </div>
                <div>
                  <p className='font-bold text-xl'>{userProfile?.followers?.length || 0}</p>
                  <p className='text-gray-600 text-sm'>followers</p>
                </div>
                <div>
                  <p className='font-bold text-xl'>{userProfile?.following?.length || 0}</p>
                  <p className='text-gray-600 text-sm'>following</p>
                </div>
              </div>

              <div>
                <p className='font-semibold text-gray-800 mb-2'>{userProfile?.bio || 'Add bio to your profile'}</p>
                <Badge className='w-fit'>
                  <AtSign size={16} className='mr-1' /> {userProfile?.username}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className='bg-white rounded-lg shadow-sm'>
          <div className='border-b border-gray-200 flex justify-center'>
            <button
              onClick={() => handleTabChange('posts')}
              className={`py-4 px-6 font-semibold transition-all ${activeTab === 'posts' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}
            >
              POSTS
            </button>
            {isLoggedInUserProfile && (
              <button
                onClick={() => handleTabChange('saved')}
                className={`py-4 px-6 font-semibold transition-all ${activeTab === 'saved' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}
              >
                SAVED
              </button>
            )}
          </div>

          {displayedPost && displayedPost.length > 0 ? (
            <div className='grid grid-cols-3 gap-1 p-4'>
              {displayedPost.map((post) => (
                <div key={post?._id} className='relative group cursor-pointer aspect-square'>
                  <img
                    src={post.image}
                    alt='postimage'
                    className='rounded-sm w-full h-full object-cover group-hover:opacity-75 transition-opacity'
                  />
                  <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm'>
                    <div className='flex items-center text-white space-x-4'>
                      <button className='flex items-center gap-2 hover:text-gray-300'>
                        <Heart size={20} />
                        <span>{post?.likes?.length || 0}</span>
                      </button>
                      <button className='flex items-center gap-2 hover:text-gray-300'>
                        <MessageCircle size={20} />
                        <span>{post?.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex items-center justify-center h-96'>
              <p className='text-gray-500'>No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile