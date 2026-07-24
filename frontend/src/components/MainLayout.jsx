import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { setAuthUser } from '../redux/authSlice'
import {
  Home,
  Search,
  Plus,
  Heart,
  Bookmark,
  User,
  PlayCircle,
  Menu,
  X,
  Settings,
  LogOut,
  Compass
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import Stories from './Stories'
import CreatePost from './CreatePost'
import CreateStory from './CreateStory'
import RightSidebar from './RightSidebar'
import useGetAllPost from '../hooks/useGetAllPost'
import useGetSuggestedUsers from '../hooks/useGetSuggestedUsers'

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector(store => store.auth)
  const dispatch = useDispatch()
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [createStoryOpen, setCreateStoryOpen] = useState(false)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  // Fetch data
  useGetAllPost()
  useGetSuggestedUsers()

  useEffect(() => {
    const path = location.pathname
    if (path === '/app' || path === '/app/') setActiveTab('home')
    else if (path.includes('/explore')) setActiveTab('explore')

    else if (path.includes('/likes')) setActiveTab('likes')
    else if (path.includes('/saved')) setActiveTab('saved')
    else if (path.includes('/profile')) setActiveTab('profile')
    else if (path.includes('/account/edit')) setActiveTab('settings')
  }, [location.pathname])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', href: '/app' },
    { id: 'explore', icon: Compass, label: 'Explore', href: '/app/explore' },

    { id: 'likes', icon: Heart, label: 'Likes', href: '/app/likes' },
    { id: 'saved', icon: Bookmark, label: 'Saved', href: '/app/saved' },
    { id: 'profile', icon: User, label: 'Profile', href: `/app/profile/${user?._id}` },
  ]

  const mobileBottomNav = [
    { id: 'home', icon: Home, label: 'Home', href: '/app' },
    { id: 'explore', icon: Search, label: 'Explore', href: '/app/explore' },
    { id: 'create', icon: Plus, label: 'Create', action: () => setCreatePostOpen(true) },

    { id: 'profile', icon: User, label: 'Profile', href: `/app/profile/${user?._id}` },
  ]

  const handleNav = (href) => {
    navigate(href)
    setMobileMenuOpen(false)
  }

  const isHomeFeed = activeTab === 'home'
  const isFullWidth = false

  return (
    <div className='min-h-screen' style={{ backgroundColor: '#f8f9fb' }}>

      {/* ═══════════════ DESKTOP LEFT SIDEBAR ═══════════════ */}
      <aside
        className='desktop-only fixed left-0 top-0 bottom-0 z-40 flex flex-col shadow-sidebar'
        style={{
          width: '250px',
          background: 'linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)',
          borderRight: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px' }}>
          <Link to='/app' className='flex items-center gap-3' style={{ textDecoration: 'none' }}>
            <div
              className='gradient-brand animate-gradient'
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(236,72,153,0.3)',
              }}
            >
              <span style={{ color: 'white', fontWeight: 900, fontSize: '16px', letterSpacing: '-0.5px' }}>M</span>
            </div>
            <span
              className='gradient-brand-text'
              style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}
            >
              MojMasti
            </span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className='flex-1 overflow-y-auto scrollbar-hide' style={{ padding: '8px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.href)}
                  className='transition-smooth'
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#7c3aed' : '#4b5563',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.10))'
                      : 'transparent',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(139,92,246,0.05)'
                      e.currentTarget.style.color = '#6d28d9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#4b5563'
                    }
                  }}
                >
                  <Icon
                    size={21}
                    style={{
                      color: isActive ? '#8b5cf6' : '#6b7280',
                      strokeWidth: isActive ? 2.5 : 2,
                    }}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div
                      style={{
                        marginLeft: 'auto',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                      }}
                    />
                  )}
                </button>
              )
            })}

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '8px 16px' }} />

            {/* Create Post Menu */}
            <button
              onClick={() => setCreatePostOpen(true)}
              className='transition-smooth'
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#4b5563',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.08))'
                e.currentTarget.style.color = '#7c3aed'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#4b5563'
              }}
            >
              <div
                className='gradient-brand'
                style={{
                  width: '21px',
                  height: '21px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={13} style={{ color: 'white', strokeWidth: 3 }} />
              </div>
              <span>Create Post</span>
            </button>
          </div>
        </nav>

        {/* User Info at bottom */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '16px' }}>
          <button
            onClick={() => handleNav(`/app/profile/${user?._id}`)}
            className='transition-smooth'
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '14px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.05)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <Avatar className='h-10 w-10' style={{ border: '2px solid rgba(139,92,246,0.2)' }}>
              <AvatarImage src={user?.profilePicture} alt={user?.username} />
              <AvatarFallback
                style={{
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username}
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.bio || 'View profile'}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* ═══════════════ MOBILE TOP HEADER ═══════════════ */}
      <header
        className='mobile-only glass fixed top-0 left-0 right-0 z-50'
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
          <Link to='/app' className='flex items-center gap-2' style={{ textDecoration: 'none' }}>
            <div
              className='gradient-brand'
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(236,72,153,0.25)',
              }}
            >
              <span style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>M</span>
            </div>
            <span
              className='gradient-brand-text'
              style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px' }}
            >
              MojMasti
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='transition-smooth'
              style={{
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: mobileMenuOpen ? 'rgba(139,92,246,0.08)' : 'transparent',
              }}
            >
              {mobileMenuOpen
                ? <X style={{ width: '22px', height: '22px', color: '#7c3aed' }} />
                : <Menu style={{ width: '22px', height: '22px', color: '#4b5563' }} />
              }
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            className='animate-slide-down glass-subtle'
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ padding: '8px' }}>
              {[
                { icon: Heart, label: 'Likes', href: '/app/likes' },
                { icon: Bookmark, label: 'Saved', href: '/app/saved' },
                { icon: Settings, label: 'Settings', href: '/app/account/edit' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <button
                    key={i}
                    onClick={() => handleNav(item.href)}
                    className='transition-smooth'
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.05)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <Icon style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                    <span>{item.label}</span>
                  </button>
                )
              })}

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '4px 16px' }} />

              {/* Sign Out */}
              <button
                onClick={async () => {
                  try {
                    await axios.get(API_ENDPOINTS.AUTH.LOGOUT, { withCredentials: true })
                    dispatch(setAuthUser(null))
                    navigate('/login')
                  } catch (err) {
                    dispatch(setAuthUser(null))
                    navigate('/login')
                  }
                }}
                className='transition-smooth'
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ef4444',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <LogOut style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════ MAIN CONTENT AREA ═══════════════ */}
      <div className='main-content-wrapper min-h-screen'>
        {/* Mobile top spacing */}
        <div className='lg:hidden' style={{ height: '56px' }} />

        {isHomeFeed ? (
          /* ── Instagram-style centered layout: Feed + Right Sidebar ── */
          <div className="flex justify-center lg:justify-start w-full px-0 sm:px-4 lg:px-8">
            <div className="flex gap-8 w-full max-w-[820px] pt-4 lg:pt-6 justify-center lg:justify-start">
              {/* Feed Column */}
              <main className="w-full max-w-[470px] flex-1 min-w-0 mx-auto lg:mx-0">
                <Stories />
                <div className='pb-24 lg:pb-8 px-0 sm:px-0'>
                  <Outlet />
                </div>
              </main>

              {/* Right Sidebar — desktop only */}
              <aside className='desktop-only hidden xl:block w-[320px] shrink-0 sticky top-0 h-screen overflow-y-auto'>
                <RightSidebar />
              </aside>
            </div>
          </div>
        ) : isFullWidth ? (
          /* ── Full-width pages: Chat, Reels ── */
          <div className='h-[calc(100dvh-56px-60px)] lg:h-screen w-full overflow-hidden'>
            <Outlet />
          </div>
        ) : (
          /* ── Other pages: centered content ── */
          <div style={{ width: '100%' }}>
            <main style={{ minHeight: '100vh' }}>
              <div className='pb-24 lg:pb-0'>
                <Outlet />
              </div>
            </main>
          </div>
        )}

        {/* Mobile bottom spacing */}
        <div className='lg:hidden' style={{ height: '20px' }} />
      </div>

      {/* ═══════════════ MOBILE BOTTOM NAV ═══════════════ */}
      <nav
        className='mobile-only fixed bottom-0 left-0 right-0 z-40 glass shadow-bottom-nav'
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 0 8px' }}>
          {mobileBottomNav.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) item.action()
                  else handleNav(item.href)
                }}
                className='transition-smooth'
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  position: 'relative',
                }}
              >
                {/* Active indicator dot above icon */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      width: '20px',
                      height: '3px',
                      borderRadius: '100px',
                      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                    }}
                  />
                )}
                <Icon
                  size={22}
                  style={{
                    color: isActive ? '#7c3aed' : '#9ca3af',
                    strokeWidth: isActive ? 2.5 : 1.8,
                    transition: 'all 0.2s ease',
                  }}
                />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#7c3aed' : '#9ca3af',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>



      {/* Create Post Dialog */}
      <CreatePost open={createPostOpen} setOpen={setCreatePostOpen} />

      {/* Create Story Dialog */}
      {createStoryOpen && (
        <CreateStory
          onClose={() => setCreateStoryOpen(false)}
          onStoryCreated={() => { setCreateStoryOpen(false); }}
        />
      )}


      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className='mobile-only'
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.2)',
            zIndex: 45,
          }}
        />
      )}
    </div>
  )
}

export default MainLayout