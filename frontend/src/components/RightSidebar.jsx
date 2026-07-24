import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { handleApiSuccess, handleApiError } from '../utils/errorHandler'
import { logger } from '../utils/logger'
import { Input } from './ui/input'
import { setAuthUser, setSuggestedUsers } from '../redux/authSlice'

const RightSidebar = () => {
    const dispatch = useDispatch()
    const { suggestedUsers, user } = useSelector(store => store.auth)
    const [loading, setLoading] = useState({})
    const [searchTerm, setSearchTerm] = useState('')

    const followOrUnfollowHandler = async (userId) => {
        try {
            setLoading(prev => ({ ...prev, [userId]: true }))
            const res = await axios.post(API_ENDPOINTS.USER.FOLLOW(userId), {}, { withCredentials: true })
            logger.log('Follow API response', res.data)

            if (res.data.success) {
                if (res.data.user) {
                    dispatch(setAuthUser(res.data.user))
                }
                if (res.data.targetUser && suggestedUsers) {
                    const updatedSuggestions = suggestedUsers.map(s =>
                        s._id === res.data.targetUser._id ? res.data.targetUser : s
                    )
                    dispatch(setSuggestedUsers(updatedSuggestions))
                }
                handleApiSuccess(res.data.message)
            }
        } catch (error) {
            logger.error('Follow error', error)
            handleApiError(error)
        } finally {
            setLoading(prev => ({ ...prev, [userId]: false }))
        }
    }

    const filteredUsers = (suggestedUsers || []).filter(suggestedUser => {
        if (suggestedUser?._id === user?._id) return false
        return suggestedUser?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    })

    return (
        <div className='scrollbar-hide' style={{ width: '100%', height: '100vh', overflowY: 'auto', paddingTop: '24px', paddingLeft: '8px' }}>
            {/* Search Bar */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        size={16}
                        style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#a1a1aa',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            paddingLeft: '40px',
                            paddingRight: '16px',
                            paddingTop: '10px',
                            paddingBottom: '10px',
                            background: '#f4f4f8',
                            border: '1px solid transparent',
                            borderRadius: '14px',
                            fontSize: '13px',
                            color: '#374151',
                            outline: 'none',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'
                            e.currentTarget.style.background = '#faf8ff'
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)'
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'transparent'
                            e.currentTarget.style.background = '#f4f4f8'
                            e.currentTarget.style.boxShadow = 'none'
                        }}
                    />
                </div>
            </div>

            {/* Suggested Users */}
            <div>
                <h3 style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                }}>
                    Suggested for you
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filteredUsers && filteredUsers.length > 0 ? (
                        filteredUsers.map((suggestedUser) => {
                            const isFollowing = (user?.following || []).map(String).includes(String(suggestedUser?._id))
                            return (
                                <div
                                    key={suggestedUser?._id}
                                    className='transition-smooth'
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '10px',
                                        padding: '10px 12px',
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.04)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                                >
                                    <Link to={`/app/profile/${suggestedUser?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, textDecoration: 'none', minWidth: 0 }}>
                                        <Avatar className='h-10 w-10' style={{ border: '2px solid rgba(139,92,246,0.12)', flexShrink: 0 }}>
                                            <AvatarImage src={suggestedUser?.profilePicture} alt="user" />
                                            <AvatarFallback style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white', fontSize: '13px', fontWeight: 700 }}>
                                                {suggestedUser?.username?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, color: '#1f2937', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {suggestedUser?.username}
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {suggestedUser?.followers?.length || 0} followers
                                            </p>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={() => followOrUnfollowHandler(suggestedUser?._id)}
                                        disabled={loading[suggestedUser?._id]}
                                        className='transition-smooth'
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '10px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            color: isFollowing ? '#6b7280' : 'white',
                                            background: isFollowing
                                                ? '#f3f4f6'
                                                : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                            border: 'none',
                                            whiteSpace: 'nowrap',
                                            boxShadow: isFollowing ? 'none' : '0 2px 8px rgba(139,92,246,0.3)',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isFollowing) {
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,0.4)'
                                                e.currentTarget.style.transform = 'translateY(-1px)'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFollowing) {
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(139,92,246,0.3)'
                                                e.currentTarget.style.transform = 'translateY(0)'
                                            }
                                        }}
                                    >
                                        {loading[suggestedUser?._id] ? '...' : (isFollowing ? 'Following' : 'Follow')}
                                    </button>
                                </div>
                            )
                        })
                    ) : (
                        <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                            {searchTerm ? 'No users found' : 'No suggestions available'}
                        </p>
                    )}
                </div>
            </div>


        </div>
    )
}

export default RightSidebar