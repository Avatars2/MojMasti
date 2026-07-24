import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '../hooks/useGetUserProfile';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from "./ui/button";
import { Badge } from './ui/badge';
import {
  AtSign, Heart, MessageCircle, Loader, Grid, Bookmark,
  Settings, UserPlus, UserCheck, Camera, MapPin, LinkIcon,
  MoreHorizontal, Share2, Film, Trash2
} from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';
import { setAuthUser, setUserProfile } from '../redux/authSlice';
import { setSelectedPost } from '../redux/postSlice';
import CommentDialog from './CommentDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [open, setOpen] = useState(false);
  const [headerShrunk, setHeaderShrunk] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [listLoading, setListLoading] = useState({});
  const [likedPosts, setLikedPosts] = useState([]);

  useGetUserProfile(userId);

  const { userProfile, user } = useSelector(store => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;

  useEffect(() => {
    if (user && userProfile) {
      setIsFollowing((user.following || []).map(String).includes(String(userProfile._id)));
    }
  }, [userProfile, user]);

  /* scroll listener for header shrink */
  useEffect(() => {
    const handler = () => setHeaderShrunk(window.scrollY > 180);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (activeTab === 'liked' && isLoggedInUserProfile && likedPosts.length === 0) {
      setLoading(true);
      axios.get(API_ENDPOINTS.POST.LIKED, { withCredentials: true })
        .then(res => {
          if (res.data.success) setLikedPosts(res.data.posts);
        })
        .catch(err => console.error("Error fetching liked posts:", err))
        .finally(() => setLoading(false));
    }
  }, [activeTab, isLoggedInUserProfile, likedPosts.length]);

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
  };

  const handleDeletePost = async (postId) => {
    try {
      const res = await axios.delete(
        API_ENDPOINTS.POST.DELETE_POST(postId),
        { withCredentials: true }
      );

      if (res.data.success) {
        handleApiSuccess(res.data.message);
        const updatedPosts = userProfile.posts.filter(p => p._id !== postId);
        dispatch(setUserProfile({ ...userProfile, posts: updatedPosts }));
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const followListItemHandler = async (e, targetUserId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setListLoading(prev => ({ ...prev, [targetUserId]: true }));
      const res = await axios.post(API_ENDPOINTS.USER.FOLLOW(targetUserId), {}, { withCredentials: true });
      if (res.data.success) {
        if (res.data.user) {
          dispatch(setAuthUser(res.data.user));
        }
        handleApiSuccess(res.data.message);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setListLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const displayedPosts = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  if (!userProfile) {
    return (
      <div style={styles.loaderWrap}>
        <div style={styles.loaderRing}>
          <Loader className='animate-spin' size={28} color="#8b5cf6" />
        </div>
        <p style={{ marginTop: 16, fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>Loading profile…</p>
      </div>
    );
  }

  const postCount = userProfile?.posts?.length || 0;
  const followerCount = userProfile?.followers?.length || 0;
  const followingCount = userProfile?.following?.length || 0;

  return (
    <div style={styles.pageWrap}>

      {/* ═══════════ COVER BANNER ═══════════ */}
      <div style={styles.coverBanner}>
        <div style={styles.coverGradient} />
        {/* floating decorative circles */}
        <div style={{ ...styles.decoCircle, width: 200, height: 200, top: -60, right: -40, opacity: 0.10 }} />
        <div style={{ ...styles.decoCircle, width: 120, height: 120, bottom: -30, left: '20%', opacity: 0.08 }} />
        <div style={{ ...styles.decoCircle, width: 80, height: 80, top: 20, left: '60%', opacity: 0.06 }} />
      </div>

      {/* ═══════════ PROFILE CARD ═══════════ */}
      <div style={styles.profileCard} className="animate-fade-in">

        {/* Avatar positioned overlapping banner */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarRing} className="animate-glow">
            <div style={styles.avatarInner}>
              <Avatar className='w-full h-full'>
                <AvatarImage src={userProfile?.profilePicture} alt="profile" style={{ objectFit: 'cover' }} />
                <AvatarFallback style={styles.avatarFallback}>
                  {userProfile?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          {isLoggedInUserProfile && (
            <Link to="/app/account/edit" style={styles.cameraBtn} className="transition-smooth">
              <Camera size={14} color="#fff" />
            </Link>
          )}
        </div>

        {/* Name & Username */}
        <div style={styles.nameSection}>
          <div style={styles.nameRow}>
            <h1 style={styles.displayName}>{userProfile?.username}</h1>
          </div>
          <div style={styles.handleRow}>
            <AtSign size={13} color="#9ca3af" style={{ marginRight: 2 }} />
            <span style={styles.handle}>{userProfile?.username}</span>
          </div>
        </div>

        {/* Bio */}
        <p style={styles.bio}>
          {userProfile?.bio || (isLoggedInUserProfile ? '✨ Add a bio to tell the world about yourself' : 'No bio yet')}
        </p>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          {[
            { label: 'Posts', value: postCount, action: null },
            { label: 'Followers', value: followerCount, action: () => setFollowersOpen(true) },
            { label: 'Following', value: followingCount, action: () => setFollowingOpen(true) },
          ].map((stat, i) => (
            <div key={i} style={styles.statCard} className="transition-smooth hover-lift" onClick={stat.action}>
              <span style={styles.statValue}>{stat.value >= 1000 ? `${(stat.value / 1000).toFixed(1)}K` : stat.value}</span>
              <span style={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={styles.actionRow}>
          {isLoggedInUserProfile ? (
            <>
              <Link to="/app/account/edit" style={{ flex: 1, textDecoration: 'none' }}>
                <button style={styles.btnPrimary} className="transition-smooth">
                  <Settings size={15} style={{ marginRight: 6 }} />
                  Edit Profile
                </button>
              </Link>
            </>
          ) : isFollowing ? (
            <>
              <button
                style={styles.btnFollowing}
                className="transition-smooth"
                onClick={handleFollowUnfollow}
                disabled={loading}
              >
                {loading ? <Loader className='animate-spin' size={15} style={{ marginRight: 6 }} /> : <UserCheck size={15} style={{ marginRight: 6 }} />}
                Following
              </button>
            </>
          ) : (
            <>
              <button
                style={styles.btnFollow}
                className="transition-smooth"
                onClick={handleFollowUnfollow}
                disabled={loading}
              >
                {loading ? <Loader className='animate-spin' size={15} style={{ marginRight: 6 }} /> : <UserPlus size={15} style={{ marginRight: 6 }} />}
                Follow
              </button>
            </>
          )}
        </div>
      </div>

      {/* ═══════════ TAB BAR ═══════════ */}
      <div style={styles.tabContainer} className="animate-fade-in">
        <div style={styles.tabBar}>
          {[
            { id: 'posts', icon: Grid, label: 'Posts' },
            { id: 'saved', icon: Bookmark, label: 'Saved', hidden: !isLoggedInUserProfile },
            { id: 'liked', icon: Heart, label: 'Liked', hidden: !isLoggedInUserProfile },
          ].filter(t => !t.hidden).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabBtn,
                  color: isActive ? '#7c3aed' : '#9ca3af',
                  fontWeight: isActive ? 700 : 500,
                  borderBottom: isActive ? '2.5px solid #8b5cf6' : '2.5px solid transparent',
                  background: isActive ? 'linear-gradient(to top, rgba(139,92,246,0.06), transparent)' : 'transparent',
                }}
                className="transition-smooth"
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════ POST GRID ═══════════ */}
      <div style={styles.gridContainer} className="animate-fade-in">
        {(() => {
          let posts = [];
          if (activeTab === 'posts') posts = userProfile?.posts;
          else if (activeTab === 'saved') posts = userProfile?.bookmarks;
          else if (activeTab === 'liked') posts = likedPosts;
          
          const hasPosts = posts && posts.length > 0;

          return hasPosts ? (
            <div style={styles.postGrid}>
              {posts.filter(p => p != null).map((post, idx) => (
                <div
                  key={post?._id || idx}
                  style={styles.gridItem}
                  className="transition-smooth"
                  onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.querySelector('.grid-overlay').style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.querySelector('.grid-overlay').style.opacity = '0';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {post?.mediaType === 'video' ? (
                    <>
                      <video
                        src={post?.video}
                        poster={post?.thumbnail}
                        style={styles.gridMedia}
                        muted loop playsInline
                        onMouseOver={e => e.target.play()}
                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                      <div style={styles.videoIndicator}>
                        <Film size={14} color="#fff" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={post?.image}
                      alt='post'
                      style={styles.gridMedia}
                      loading="lazy"
                    />
                  )}
                  {/* Hover overlay */}
                  <div className="grid-overlay" style={styles.gridOverlay}>
                    {isLoggedInUserProfile && activeTab === 'posts' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post._id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(239, 68, 68, 0.8)',
                          borderRadius: '50%',
                          padding: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                          transition: 'transform 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Trash2 size={16} color="white" />
                      </button>
                    )}
                    <div style={styles.overlayStats}>
                      <div style={styles.overlayStat}>
                        <Heart size={18} fill="#fff" color="#fff" />
                        <span style={styles.overlayNum}>{post?.likes?.length || 0}</span>
                      </div>
                      <div style={styles.overlayStat}>
                        <MessageCircle size={18} fill="#fff" color="#fff" />
                        <span style={styles.overlayNum}>{post?.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState} className="animate-fade-in">
              <div style={styles.emptyIcon}>
                <Camera size={36} color="#c084fc" />
              </div>
              <h3 style={styles.emptyTitle}>
                {activeTab === 'posts' ? 'No Posts Yet' : 'No Saved Posts'}
              </h3>
              <p style={styles.emptyDesc}>
                {isLoggedInUserProfile
                  ? activeTab === 'posts'
                    ? 'Share your first photo or video to get started!'
                    : 'Posts you save will appear here.'
                  : "This user hasn't posted anything yet."}
              </p>
              {isLoggedInUserProfile && activeTab === 'posts' && (
                <button style={styles.emptyBtn} className="transition-smooth">
                  Share your first post
                </button>
              )}
            </div>
          );
        })()}
      </div>

      <Dialog open={followersOpen} onOpenChange={setFollowersOpen}>
        <DialogContent className="max-w-md w-full rounded-[24px] p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-5 border-b border-gray-100/50 flex items-center justify-center bg-white/50">
            <DialogTitle className="text-[17px] font-bold text-gray-900 tracking-wide">Followers</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto p-3 flex flex-col gap-1 scrollbar-hide">
            {userProfile?.followers?.length > 0 ? userProfile.followers.map(f => (
              <div key={f._id || f} className="flex items-center justify-between p-3 hover:bg-gray-50/80 rounded-2xl transition-all duration-200 group">
                <Link to={`/app/profile/${f._id || f}`} onClick={() => setFollowersOpen(false)} className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 shadow-sm shrink-0 border-2 border-white group-hover:border-purple-50 transition-colors">
                    <AvatarImage src={f.profilePicture} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-lg font-bold">
                      {f.username ? f.username.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate pr-3">
                    <span className="font-bold text-[15px] text-gray-900 truncate">{f.username || 'User'}</span>
                    <span className="text-[13px] text-gray-500 truncate">{f.bio || 'MojMasti User'}</span>
                  </div>
                </Link>
                {user?._id !== (f._id || f) && (
                  <Button
                    onClick={(e) => followListItemHandler(e, f._id || f)}
                    disabled={listLoading[f._id || f]}
                    variant={(user?.following || []).map(String).includes(String(f._id || f)) ? 'secondary' : 'default'}
                    className={`h-9 px-5 rounded-full text-[13px] font-bold shrink-0 transition-all duration-300 ${!(user?.following || []).map(String).includes(String(f._id || f)) ? 'bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'}`}
                  >
                    {listLoading[f._id || f] ? '...' : ((user?.following || []).map(String).includes(String(f._id || f)) ? 'Following' : 'Follow')}
                  </Button>
                )}
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-bold text-[15px] mb-1">No followers yet</p>
                <p className="text-gray-500 text-[13px]">When people follow this user, they'll appear here.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={followingOpen} onOpenChange={setFollowingOpen}>
        <DialogContent className="max-w-md w-full rounded-[24px] p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-5 border-b border-gray-100/50 flex items-center justify-center bg-white/50">
            <DialogTitle className="text-[17px] font-bold text-gray-900 tracking-wide">Following</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto p-3 flex flex-col gap-1 scrollbar-hide">
            {userProfile?.following?.length > 0 ? userProfile.following.map(f => (
              <div key={f._id || f} className="flex items-center justify-between p-3 hover:bg-gray-50/80 rounded-2xl transition-all duration-200 group">
                <Link to={`/app/profile/${f._id || f}`} onClick={() => setFollowingOpen(false)} className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 shadow-sm shrink-0 border-2 border-white group-hover:border-purple-50 transition-colors">
                    <AvatarImage src={f.profilePicture} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-lg font-bold">
                      {f.username ? f.username.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate pr-3">
                    <span className="font-bold text-[15px] text-gray-900 truncate">{f.username || 'User'}</span>
                    <span className="text-[13px] text-gray-500 truncate">{f.bio || 'MojMasti User'}</span>
                  </div>
                </Link>
                {user?._id !== (f._id || f) && (
                  <Button
                    onClick={(e) => followListItemHandler(e, f._id || f)}
                    disabled={listLoading[f._id || f]}
                    variant={(user?.following || []).map(String).includes(String(f._id || f)) ? 'secondary' : 'default'}
                    className={`h-9 px-5 rounded-full text-[13px] font-bold shrink-0 transition-all duration-300 ${!(user?.following || []).map(String).includes(String(f._id || f)) ? 'bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'}`}
                  >
                    {listLoading[f._id || f] ? '...' : ((user?.following || []).map(String).includes(String(f._id || f)) ? 'Following' : 'Follow')}
                  </Button>
                )}
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-bold text-[15px] mb-1">Not following anyone</p>
                <p className="text-gray-500 text-[13px]">When this user follows someone, they'll appear here.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CommentDialog open={open} setOpen={setOpen} />
    </div>
  );
};

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const styles = {
  pageWrap: {
    width: '100%',
    minHeight: '100vh',
    background: 'transparent',
    paddingBottom: 80,
  },

  /* Loader */
  loaderWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  loaderRing: {
    width: 56, height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.12))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  /* Cover Banner */
  coverBanner: {
    position: 'relative',
    height: 180,
    borderRadius: '0 0 24px 24px',
    overflow: 'hidden',
    marginBottom: -60,
  },
  coverGradient: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 40%, #6366f1 70%, #3b82f6 100%)',
    backgroundSize: '300% 300%',
    animation: 'gradientShift 8s ease infinite',
  },
  decoCircle: {
    position: 'absolute',
    borderRadius: '50%',
    background: '#fff',
  },

  /* Profile Card */
  profileCard: {
    position: 'relative',
    maxWidth: 600,
    margin: '0 auto',
    padding: '0 20px',
    textAlign: 'center',
  },

  /* Avatar */
  avatarSection: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: 14,
  },
  avatarRing: {
    width: 120, height: 120,
    borderRadius: '50%',
    padding: 3.5,
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarInner: {
    width: '100%', height: '100%',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3.5px solid #fff',
    background: '#fff',
  },
  avatarFallback: {
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    color: 'white',
    fontSize: 38,
    fontWeight: 800,
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 6, right: 6,
    width: 32, height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2.5px solid #fff',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
  },

  /* Name / Handle */
  nameSection: { marginBottom: 8 },
  nameRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  displayName: {
    fontSize: 24, fontWeight: 800, color: '#1a1a2e',
    letterSpacing: '-0.3px', lineHeight: 1.3,
  },
  handleRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  handle: { fontSize: 14, color: '#9ca3af', fontWeight: 500 },

  /* Bio */
  bio: {
    fontSize: 14, color: '#4b5563',
    lineHeight: 1.6, maxWidth: 400,
    margin: '0 auto 20px',
    whiteSpace: 'pre-wrap',
  },

  /* Stats */
  statsRow: {
    display: 'flex', justifyContent: 'center', gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: '0 0 auto',
    minWidth: 90, padding: '14px 18px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(139,92,246,0.08)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    textAlign: 'center',
    cursor: 'pointer',
  },
  statValue: {
    display: 'block',
    fontSize: 22, fontWeight: 800,
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2,
  },
  statLabel: {
    display: 'block',
    fontSize: 11, fontWeight: 600, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginTop: 2,
  },

  /* Action Buttons */
  actionRow: {
    display: 'flex', gap: 10,
    justifyContent: 'center',
    marginBottom: 8,
  },
  btnPrimary: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 20px', borderRadius: 14,
    fontSize: 14, fontWeight: 700,
    color: '#7c3aed',
    background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.12))',
    border: '1px solid rgba(139,92,246,0.15)',
    cursor: 'pointer',
  },
  btnSecondary: {
    width: 44, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(0,0,0,0.08)',
    cursor: 'pointer',
    color: '#6b7280',
    flexShrink: 0,
  },
  btnFollow: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 20px', borderRadius: 14,
    fontSize: 14, fontWeight: 700, color: '#fff',
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
  },
  btnFollowing: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 20px', borderRadius: 14,
    fontSize: 14, fontWeight: 700,
    color: '#7c3aed',
    background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.12))',
    border: '1px solid rgba(139,92,246,0.15)',
    cursor: 'pointer',
  },
  btnMessage: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 20px', borderRadius: 14,
    fontSize: 14, fontWeight: 700, color: '#fff',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
  },

  /* Tab Bar */
  tabContainer: {
    maxWidth: 600, margin: '24px auto 0', padding: '0 20px',
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    borderRadius: '16px 16px 0 0',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(8px)',
  },
  tabBtn: {
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '14px 0',
    fontSize: 13,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    border: 'none',
  },

  /* Post Grid */
  gridContainer: {
    maxWidth: 600, margin: '0 auto', padding: '8px 20px',
  },
  postGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridItem: {
    position: 'relative',
    aspectRatio: '1 / 1',
    cursor: 'pointer',
    overflow: 'hidden',
    background: '#f3f4f6',
  },
  gridMedia: {
    width: '100%', height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  videoIndicator: {
    position: 'absolute',
    top: 8, right: 8,
    width: 28, height: 28,
    borderRadius: 8,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.25s ease',
  },
  overlayStats: {
    display: 'flex', gap: 20, alignItems: 'center',
  },
  overlayStat: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  overlayNum: {
    color: '#fff', fontSize: 15, fontWeight: 700,
    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },

  /* Empty State */
  emptyState: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: 80, height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.12))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22, fontWeight: 800, color: '#1a1a2e',
    marginBottom: 8, letterSpacing: '-0.3px',
  },
  emptyDesc: {
    fontSize: 14, color: '#9ca3af', maxWidth: 280,
    lineHeight: 1.5, marginBottom: 20,
  },
  emptyBtn: {
    padding: '10px 24px', borderRadius: 14,
    fontSize: 14, fontWeight: 700, color: '#fff',
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
  },
};

export default Profile