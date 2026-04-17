import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from "./ui/button"
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { setAuthUser } from '../redux/authSlice'
import { readFileAsDataURL } from '../lib/utils'
import { API_ENDPOINTS } from '../config/api'
import { logger } from '../utils/logger'

const EditProfile = () => {
  const { user } = useSelector(store => store.auth)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState({
    bio: user?.bio || '',
    gender: user?.gender || '',
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewPic, setPreviewPic] = useState(user?.profilePicture)

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      const dataUrl = await readFileAsDataURL(file)
      setPreviewPic(dataUrl)
    }
  }

  const editProfileHandler = async () => {
    const formData = new FormData()
    formData.append('bio', input.bio)
    formData.append('gender', input.gender)
    if (profilePicture) formData.append('profilePhoto', profilePicture)

    try {
      setLoading(true)
      const res = await axios.post(API_ENDPOINTS.USER.EDIT_PROFILE, formData, {
        withCredentials: true
      })

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user))
        toast.success(res.data.message)
      }
    } catch (error) {
      logger.error('Edit profile error', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full bg-gray-50 min-h-screen p-4 md:p-8'>
      <div className='max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8'>
        <h1 className='text-3xl font-bold mb-8'>Edit profile</h1>

        <div className='flex flex-col md:flex-row gap-8 mb-8'>
          <Avatar className='h-32 w-32'>
            <AvatarImage src={previewPic} alt='profile' />
            <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className='flex flex-col gap-4'>
            <label className='block'>
              <span className='text-gray-700 font-semibold'>Profile Picture</span>
              <input
                type='file'
                accept='image/*'
                onChange={fileChangeHandler}
                className='block w-full mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              />
            </label>
          </div>
        </div>

        <div className='space-y-6'>
          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Username</label>
            <Input
              type='text'
              value={user?.username}
              disabled
              className='bg-gray-100'
            />
          </div>

          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Email</label>
            <Input
              type='email'
              value={user?.email}
              disabled
              className='bg-gray-100'
            />
          </div>

          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Bio</label>
            <Textarea
              value={input.bio}
              onChange={(e) => setInput({ ...input, bio: e.target.value })}
              placeholder='Write your bio...'
              rows={4}
              maxLength={150}
            />
            <p className='text-xs text-gray-500 mt-1'>{input.bio.length}/150</p>
          </div>

          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Gender</label>
            <select
              value={input.gender}
              onChange={(e) => setInput({ ...input, gender: e.target.value })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500'
            >
              <option value=''>Select gender</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
            </select>
          </div>

          <Button
            onClick={editProfileHandler}
            disabled={loading}
            className='w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-bold'
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Updating...
              </>
            ) : (
              'Update profile'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EditProfile