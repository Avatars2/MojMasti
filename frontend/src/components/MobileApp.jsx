import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
    Home, 
    Search, 
    Plus, 
    Heart, 
    MessageCircle, 
    Bookmark, 
    User, 
    PlayCircle,
    Menu,
    X
} from 'lucide-react'
import Stories from './Stories'
import CreatePost from './CreatePost'
import useGetAllPost from '../hooks/useGetAllPost'
import useGetSuggestedUsers from '../hooks/useGetSuggestedUsers'

const MobileApp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector(store => store.auth);
    const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Fetch posts and suggested users
    useGetAllPost();
    useGetSuggestedUsers();

    useEffect(() => {
        // Set active tab based on current route
        const path = location.pathname;
        if (path === '/' || path === '/app') setActiveTab('home');
        else if (path === '/app/explore') setActiveTab('explore');
        else if (path === '/app/reels') setActiveTab('reels');
        else if (path === '/app/likes') setActiveTab('likes');
        else if (path === '/app/saved') setActiveTab('saved');
        else if (path === '/app/chat') setActiveTab('chat');
        else if (path.includes('/app/profile')) setActiveTab('profile');
    }, [location.pathname]);

    const bottomNavItems = [
        { 
            id: 'home', 
            icon: <Home size={20} />, 
            label: 'Home', 
            href: '/' 
        },
        { 
            id: 'explore', 
            icon: <Search size={20} />, 
            label: 'Explore', 
            href: '/app/explore' 
        },
        { 
            id: 'reels', 
            icon: <PlayCircle size={20} />, 
            label: 'Reels', 
            href: '/app/reels' 
        },
        { 
            id: 'chat', 
            icon: <MessageCircle size={20} />, 
            label: 'Chat', 
            href: '/app/chat' 
        },
        { 
            id: 'profile', 
            icon: <User size={20} />, 
            label: 'Profile', 
            href: `/app/profile/${user?._id}` 
        },
    ];

    const handleNavClick = (href) => {
        navigate(href);
        setShowMobileMenu(false);
    };

    return (
        <div className='min-h-screen bg-gray-50 flex flex-col'>
            {/* Mobile Header */}
            <div className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200'>
                <div className='flex items-center justify-between px-4 py-3'>
                    {/* Logo */}
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center'>
                            <span className='text-white font-bold text-sm'>M</span>
                        </div>
                        <span className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500'>
                            MojMasti
                        </span>
                    </div>

                    {/* Right Actions */}
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() => setCreatePostDialogOpen(true)}
                            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                        >
                            <Plus className='w-5 h-5 text-gray-700' />
                        </button>
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                        >
                            {showMobileMenu ? <X className='w-5 h-5 text-gray-700' /> : <Menu className='w-5 h-5 text-gray-700' />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className='absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg'>
                        <div className='py-2'>
                            <button
                                onClick={() => handleNavClick('/likes')}
                                className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors'
                            >
                                <Heart className='w-5 h-5 text-gray-700' />
                                <span className='text-gray-900'>Likes</span>
                            </button>
                            <button
                                onClick={() => handleNavClick('/saved')}
                                className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors'
                            >
                                <Bookmark className='w-5 h-5 text-gray-700' />
                                <span className='text-gray-900'>Saved</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className='flex-1 mt-14 mb-16 overflow-y-auto'>
                {/* Page Header */}
                <div className='sticky top-14 z-30 bg-white border-b border-gray-200 px-4 py-3'>
                    <div className='flex items-center justify-between'>
                        <h1 className='text-lg font-bold text-gray-900 capitalize'>
                            {activeTab === 'home' && 'Feed'}
                            {activeTab === 'explore' && 'Explore'}
                            {activeTab === 'reels' && 'Reels'}
                            {activeTab === 'likes' && 'Likes'}
                            {activeTab === 'saved' && 'Saved'}
                            {activeTab === 'chat' && 'Messages'}
                            {activeTab === 'profile' && 'Profile'}
                        </h1>
                        <div className='text-xs text-gray-500 font-semibold px-3 py-1 bg-gray-100 rounded-full'>
                            {user?.username}
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className='pb-4'>
                    {/* Stories - Only on Home */}
                    {activeTab === 'home' && (
                        <div className='px-4 mb-4'>
                            <Stories />
                        </div>
                    )}

                    {/* Feed/Content */}
                    <div className='px-4'>
                        <Outlet />
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40'>
                <div className='flex items-center justify-around py-2'>
                    {bottomNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.href)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                                activeTab === item.id
                                    ? 'text-pink-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <div className={activeTab === item.id ? 'text-pink-600' : 'text-gray-600'}>
                                {item.icon}
                            </div>
                            <span className={`text-xs font-medium ${
                                activeTab === item.id ? 'text-pink-600' : 'text-gray-700'
                            }`}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Floating Create Button */}
            <button
                onClick={() => setCreatePostDialogOpen(true)}
                className='fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-30'
            >
                <Plus className='w-6 h-6' />
            </button>

            {/* Create Post Dialog */}
            <CreatePost open={createPostDialogOpen} setOpen={setCreatePostDialogOpen} />
        </div>
    )
}

export default MobileApp;
