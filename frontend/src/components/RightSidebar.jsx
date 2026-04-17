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
        <div className='w-full h-screen overflow-y-auto p-6 bg-white'>
            <div className='mb-8 sticky top-0 bg-white z-10'>
                <div className='relative'>
                    <Search size={18} className='absolute left-3 top-3 text-gray-400' />
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='pl-10 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-full'
                    />
                </div>
            </div>

            <div>
                <h3 className='text-lg font-bold text-gray-800 mb-4'>Suggested for you</h3>
                <div className='space-y-4'>
                    {filteredUsers && filteredUsers.length > 0 ? (
                        filteredUsers.map((suggestedUser) => {
                            const isFollowing = (user?.following || []).map(String).includes(String(suggestedUser?._id))
                            return (
                                <div key={suggestedUser?._id} className='flex items-center justify-between gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors'>
                                    <Link to={`/profile/${suggestedUser?._id}`} className='flex items-center gap-2 flex-1'>
                                        <Avatar className='h-10 w-10'>
                                            <AvatarImage src={suggestedUser?.profilePicture} alt="user" />
                                            <AvatarFallback>{suggestedUser?.username?.[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className='flex-1 min-w-0'>
                                            <p className='font-semibold text-gray-800 truncate text-sm'>{suggestedUser?.username}</p>
                                            <p className='text-xs text-gray-500 truncate'>{suggestedUser?.followers?.length || 0} followers</p>
                                        </div>
                                    </Link>

                                    <Button
                                        onClick={() => followOrUnfollowHandler(suggestedUser?._id)}
                                        disabled={loading[suggestedUser?._id]}
                                        className={`text-white font-semibold text-xs px-3 py-1 h-auto transition-all ${
                                            isFollowing ? 'bg-gray-300 hover:bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                                        }`}
                                    >
                                        {loading[suggestedUser?._id] ? '...' : (isFollowing ? 'Following' : 'Follow')}
                                    </Button>
                                </div>
                            )
                        })
                    ) : (
                        <p className='text-gray-500 text-sm text-center py-4'>
                            {searchTerm ? 'No users found' : 'No suggestions available'}
                        </p>
                    )}
                </div>
            </div>

            <div className='mt-12 text-xs text-gray-500 space-y-2 border-t border-gray-200 pt-4'>
                <p>© 2024 MojMasti</p>
                <p>Made with ❤️ for connection</p>
                <div className='flex gap-2 text-xs'>
                    <a href="#" className='hover:underline'>About</a>
                    <a href="#" className='hover:underline'>Help</a>
                    <a href="#" className='hover:underline'>Privacy</a>
                </div>
            </div>
        </div>
    )
}

export default RightSidebar