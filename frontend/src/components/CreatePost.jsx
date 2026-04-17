import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { Button } from "./ui/button"
import { readFileAsDataURL } from '../lib/utils'
import { Loader2, X, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts } from '../redux/postSlice'
import { API_ENDPOINTS } from '../config/api'
import { logger } from '../utils/logger'

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef(null)
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useSelector(store => store.auth)
  const { posts } = useSelector(store => store.post)
  const dispatch = useDispatch()

  // Handle file selection with validation
  const fileChangeHandler = async (e) => {
    try {
      setError('') // Clear previous errors
      const f = e.target.files?.[0]
      
      if (!f) {
        logger.log('No file selected')
        return
      }

      logger.log('File selected:', f.name, f.type, f.size)

      // Validation checks
      if (f.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        toast.error('Image size must be less than 5MB')
        return
      }

      if (!f.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, GIF, WebP)')
        toast.error('Please select a valid image file')
        return
      }

      // Check if it's a common image format
      const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validFormats.includes(f.type)) {
        setError(`Invalid image format. Supported: ${validFormats.join(', ')}`)
        toast.error('Invalid image format')
        return
      }

      setFile(f)
      logger.log('File validated successfully')

      // Read and preview
      const dataUrl = await readFileAsDataURL(f)
      setImagePreview(dataUrl)
      logger.log('Image preview generated')

    } catch (err) {
      logger.error('File selection error:', err)
      setError('Failed to process image. Please try again.')
      toast.error('Failed to process image')
    }
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      // Simulate file input change event
      const event = {
        target: {
          files: files
        }
      }
      await fileChangeHandler(event)
    }
  }

  // Create post handler with improved error handling
  const createPostHandler = async (e) => {
    e?.preventDefault?.()

    // Validation
    if (!file) {
      toast.error('Please select an image')
      return
    }
    if (!caption.trim()) {
      toast.error('Please add a caption')
      return
    }

    const formData = new FormData()
    formData.append('caption', caption.trim())
    formData.append('image', file)

    try {
      setLoading(true)
      setError('')
      logger.log('Creating post with file:', file.name)

      const res = await axios.post(API_ENDPOINTS.POST.CREATE, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      logger.log('Create post response:', res.data)

      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...(posts || [])]))
        toast.success('🎉 Post created successfully!')
        
        // Reset form
        setCaption('')
        setFile(null)
        setImagePreview('')
        setError('')
        
        // Close dialog
        setTimeout(() => {
          setOpen(false)
        }, 500)
      } else {
        setError(res.data.message || 'Failed to create post')
        toast.error(res.data.message || 'Failed to create post')
      }
    } catch (error) {
      logger.error('Create post error:', error)
      
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Failed to create post. Please try again.'
      
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    if (loading) return
    setCaption('')
    setFile(null)
    setImagePreview('')
    setError('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onInteractOutside={() => !loading && resetForm()} className="max-w-2xl">
        {/* Header with Gradient */}
        <DialogHeader className='bg-gradient-to-r from-pink-50 to-blue-50 -mx-6 px-6 py-4 rounded-t-lg border-b border-gray-200'>
          <div className='flex items-center justify-center gap-2'>
            <Sparkles size={20} className='text-pink-500' />
            <span className='text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600'>Create New Post</span>
            <Sparkles size={20} className='text-blue-500' />
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          {/* User Info */}
          <div className='flex gap-3 items-center border-b border-gray-200 pb-4'>
            <Avatar className='h-14 w-14 border-2 border-gradient-to-r from-pink-500 to-blue-500'>
              <AvatarImage src={user?.profilePicture} alt="profile" />
              <AvatarFallback className='bg-gradient-to-br from-pink-400 to-blue-400 text-white font-bold'>
                {user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <h1 className='font-bold text-gray-900'>{user?.username}</h1>
              <span className='text-sm text-gray-500'>{user?.bio || 'Share your moment with MojMasti...'}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-2'>
              <AlertCircle size={20} className='text-red-500 flex-shrink-0 mt-0.5' />
              <div>
                <p className='text-sm font-semibold text-red-800'>Error</p>
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            </div>
          )}

          {/* Caption Textarea */}
          <div>
            <label className='text-sm font-semibold text-gray-700 block mb-2'>Caption</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="focus-visible:ring-2 focus-visible:ring-pink-500 border-2 border-gray-200 focus:border-transparent rounded-xl resize-none"
              placeholder="What's on your mind? Write a caption..."
              maxLength={2200}
              rows={4}
              disabled={loading}
            />
            <div className='text-right text-xs font-semibold text-gray-500 mt-2'>
              {caption.length}/2200
            </div>
          </div>

          {/* Image Preview or Upload Area */}
          {imagePreview ? (
            <div className='space-y-2'>
              <label className='text-sm font-semibold text-gray-700 block'>Selected Image</label>
              <div className='relative w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden group'>
                <img 
                  src={imagePreview} 
                  alt="preview" 
                  className='w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105' 
                />
                <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300'></div>
                
                {/* Remove Button */}
                <button
                  onClick={() => { 
                    setFile(null)
                    setImagePreview('')
                    if (imageRef.current) imageRef.current.value = ''
                  }}
                  disabled={loading}
                  className='absolute top-3 right-3 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 transition-all duration-300 transform hover:scale-110 disabled:opacity-50'
                >
                  <X size={20} />
                </button>

                {/* Change Button */}
                <button
                  onClick={() => !loading && imageRef.current?.click()}
                  disabled={loading}
                  className='absolute bottom-3 left-3 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ImageIcon size={16} />
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div className='space-y-2'>
              <label className='text-sm font-semibold text-gray-700 block'>Upload Image</label>
              <button
                type="button"
                onClick={() => !loading && imageRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                disabled={loading}
                className='w-full border-3 border-dashed border-gray-300 hover:border-pink-500 rounded-xl p-8 hover:bg-gradient-to-br hover:from-pink-50 hover:to-blue-50 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <div className='w-16 h-16 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <ImageIcon size={32} className='text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500' />
                </div>
                <div>
                  <span className='text-gray-700 font-bold block'>Click to select or drag and drop</span>
                  <span className='text-gray-500 text-sm'>PNG, JPG, GIF, WebP up to 5MB</span>
                </div>
              </button>
            </div>
          )}

          {/* Hidden File Input - IMPORTANT */}
          <input
            ref={imageRef}
            type='file'
            accept='image/jpeg,image/png,image/gif,image/webp'
            className='hidden'
            onChange={fileChangeHandler}
            disabled={loading}
          />

          {/* Action Buttons */}
          <div className='flex gap-3 pt-4'>
            <Button 
              onClick={resetForm} 
              disabled={loading} 
              variant='outline' 
              className='flex-1 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold'
            >
              Cancel
            </Button>
            <Button
              onClick={createPostHandler}
              disabled={loading || !imagePreview || !caption.trim()}
              className='flex-1 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300'
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Posting...
                </>
              ) : (
                <>
                  <Sparkles className='mr-2 h-4 w-4' />
                  Post Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost