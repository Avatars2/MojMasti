import React, { useRef, useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { Button } from "./ui/button"
import { readFileAsDataURL } from '../lib/utils'
import { Loader2, X, Image as ImageIcon, Sparkles, AlertCircle, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts } from '../redux/postSlice'
import { addUserProfilePost } from '../redux/authSlice'
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
  const [isDragging, setIsDragging] = useState(false)

  // Automatically open file picker when dialog opens
  useEffect(() => {
    if (open && !imagePreview && !file) {
      const timer = setTimeout(() => {
        imageRef.current?.click()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [open])

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
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      const event = { target: { files: files } }
      await fileChangeHandler(event)
    }
  }

  // Create post handler
  const createPostHandler = async (e) => {
    e?.preventDefault?.()

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
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      logger.log('Create post response:', res.data)

      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...(posts || [])]))
        dispatch(addUserProfilePost(res.data.post))
        toast.success('🎉 Post created successfully!')
        
        // Reset form & close
        resetForm()
      } else {
        setError(res.data.message || 'Failed to create post')
        toast.error(res.data.message || 'Failed to create post')
      }
    } catch (error) {
      logger.error('Create post error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create post. Please try again.'
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
      <DialogContent 
        onInteractOutside={() => !loading && resetForm()} 
        className={`transition-all duration-500 ease-out p-0 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden ${imagePreview ? 'max-w-4xl' : 'max-w-2xl'}`}
      >
        {!imagePreview ? (
          /* ═════════ HIDDEN FILE PICKER STATE ═════════ */
          <div className="hidden"></div>
        ) : (
          /* ═════════ TWO COLUMN PREVIEW & DETAILS STATE ═════════ */
          <div className="flex flex-col md:flex-row max-h-[85vh]">
            
            {/* Left Column: Image Preview */}
            <div className="md:w-[55%] relative bg-black/5 flex items-center justify-center overflow-hidden group">
              <img 
                src={imagePreview} 
                alt="preview" 
                className="w-full h-full object-cover max-h-[50vh] md:max-h-[85vh] transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay Gradient for visual flair */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Change/Remove Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => !loading && imageRef.current?.click()}
                  disabled={loading}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                  title="Change Image"
                >
                  <ImageIcon size={18} />
                </button>
                <button
                  onClick={() => {
                    setFile(null)
                    setImagePreview('')
                    if (imageRef.current) imageRef.current.value = ''
                  }}
                  disabled={loading}
                  className="bg-red-500/90 backdrop-blur-sm hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                  title="Remove Image"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Right Column: Post Details */}
            <div className="md:w-[45%] flex flex-col bg-white/60 backdrop-blur-md relative border-l border-white/40">
              
              <div className="flex items-center justify-between p-4 border-b border-gray-200/60 bg-white/40">
                <div className='flex items-center gap-3'>
                  <Avatar className='h-10 w-10 border-2 border-gradient-to-r from-pink-400 to-blue-400 shadow-sm'>
                    <AvatarImage src={user?.profilePicture} alt="profile" />
                    <AvatarFallback className='bg-gradient-to-br from-pink-400 to-blue-400 text-white font-bold text-sm'>
                      {user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className='font-bold text-gray-900'>{user?.username}</span>
                </div>
              </div>

              {/* Caption Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full min-h-[150px] md:min-h-[250px] border-none focus-visible:ring-0 bg-transparent resize-none text-gray-800 placeholder:text-gray-400 text-base p-0"
                  placeholder="Write a caption for your post..."
                  maxLength={2200}
                  disabled={loading}
                />
                
                {error && (
                  <div className='mt-4 p-3 bg-red-50/80 rounded-lg border border-red-100 flex gap-2'>
                    <AlertCircle size={16} className='text-red-500 mt-0.5 shrink-0' />
                    <p className='text-sm text-red-600 font-medium'>{error}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200/60 bg-white/40">
                <div className='flex justify-between items-center mb-4'>
                  <span className="text-xs font-semibold text-gray-400">
                    {caption.length} / 2200
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={resetForm} 
                    disabled={loading} 
                    variant='outline' 
                    className='w-full sm:w-auto bg-white/50 border-gray-300 hover:bg-white hover:text-gray-900 font-semibold'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createPostHandler}
                    disabled={loading || !caption.trim()}
                    className='flex-1 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-bold shadow-md hover:shadow-lg transition-all duration-300'
                  >
                    {loading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Sparkles className='mr-2 h-4 w-4' />
                        Share Post
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={imageRef}
          type='file'
          accept='image/jpeg,image/png,image/gif,image/webp'
          className='hidden'
          onChange={fileChangeHandler}
          disabled={loading}
        />
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost