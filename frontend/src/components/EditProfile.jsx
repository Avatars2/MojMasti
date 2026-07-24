import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Loader2, Camera, ArrowLeft, User, Mail, FileText, Users, Check, Sparkles, Lock, Shield } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { setAuthUser } from '../redux/authSlice'
import { readFileAsDataURL } from '../lib/utils'
import { API_ENDPOINTS } from '../config/api'
import { logger } from '../utils/logger'

const EditProfile = () => {
  const { user } = useSelector(store => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState({
    bio: user?.bio || '',
    gender: user?.gender || '',
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewPic, setPreviewPic] = useState(user?.profilePicture)
  const fileInputRef = useRef(null)
  const [focusedField, setFocusedField] = useState(null)

  const [passInput, setPassInput] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passLoading, setPassLoading] = useState(false)

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

  const updatePasswordHandler = async () => {
    if (passInput.newPassword !== passInput.confirmPassword) {
      return toast.error("New passwords do not match")
    }
    if (!passInput.currentPassword || !passInput.newPassword) {
      return toast.error("Please fill in all password fields")
    }
    if (passInput.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters")
    }

    try {
      setPassLoading(true)
      const res = await axios.post(API_ENDPOINTS.USER.UPDATE_PASSWORD, {
        currentPassword: passInput.currentPassword,
        newPassword: passInput.newPassword
      }, { withCredentials: true })

      if (res.data.success) {
        toast.success(res.data.message)
        setPassInput({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password')
    } finally {
      setPassLoading(false)
    }
  }

  const hasChanges = input.bio !== (user?.bio || '') || input.gender !== (user?.gender || '') || profilePicture !== null
  const hasPassChanges = passInput.currentPassword && passInput.newPassword && passInput.confirmPassword

  return (
    <div style={styles.pageWrap}>

      {/* ═══════════ HEADER BAR ═══════════ */}
      <div style={styles.headerBar} className="animate-fade-in">
        <div>
          <h1 style={styles.headerTitle}>Edit Profile</h1>
          <p style={styles.headerSub}>Update your personal information</p>
        </div>
      </div>

      <div style={styles.contentWrap} className="animate-fade-in">

        {/* ═══════════ AVATAR CARD ═══════════ */}
        <div style={styles.avatarCard} className="hover-lift">
          {/* Mini gradient banner */}
          <div style={styles.avatarBanner}>
            <div style={styles.avatarBannerGradient} />
            <div style={{ ...styles.decoCircle, width: 100, height: 100, top: -30, right: -20, opacity: 0.12 }} />
            <div style={{ ...styles.decoCircle, width: 60, height: 60, bottom: -15, left: '30%', opacity: 0.08 }} />
          </div>

          <div style={styles.avatarContent}>
            {/* Avatar with ring */}
            <div style={styles.avatarWrap}>
              <div style={styles.avatarRing} className="animate-glow">
                <div style={styles.avatarInner}>
                  <Avatar className='w-full h-full'>
                    <AvatarImage src={previewPic} alt='profile' style={{ objectFit: 'cover' }} />
                    <AvatarFallback style={styles.avatarFallback}>
                      {user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              {/* Camera overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={styles.cameraOverlay}
                className="transition-smooth"
              >
                <Camera size={16} color="#fff" />
              </button>
            </div>

            <div style={styles.avatarInfo}>
              <span style={styles.avatarName}>{user?.username}</span>
              <span style={styles.avatarEmail}>{user?.email}</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={styles.changePhotoBtn}
                className="transition-smooth"
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#8b5cf6'
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'
                }}
              >
                <Camera size={14} style={{ marginRight: 6 }} />
                Change Photo
              </button>
            </div>
          </div>

          <input
            type='file'
            accept='image/*'
            ref={fileInputRef}
            onChange={fileChangeHandler}
            style={{ display: 'none' }}
          />
        </div>

        {/* ═══════════ FORM CARD ═══════════ */}
        <div style={styles.formCard} className="hover-lift">
          <div style={styles.formHeader}>
            <Sparkles size={18} color="#8b5cf6" />
            <span style={styles.formHeaderText}>Personal Information</span>
          </div>

          {/* Username Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>
              <User size={14} color="#9ca3af" style={{ marginRight: 6 }} />
              Username
            </label>
            <div style={styles.fieldInputWrap}>
              <input
                type='text'
                value={user?.username || ''}
                disabled
                style={{
                  ...styles.fieldInput,
                  ...styles.fieldDisabled,
                }}
              />
              <div style={styles.lockBadge}>
                <span style={styles.lockText}>Cannot change</span>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>
              <Mail size={14} color="#9ca3af" style={{ marginRight: 6 }} />
              Email Address
            </label>
            <div style={styles.fieldInputWrap}>
              <input
                type='email'
                value={user?.email || ''}
                disabled
                style={{
                  ...styles.fieldInput,
                  ...styles.fieldDisabled,
                }}
              />
              <div style={styles.lockBadge}>
                <span style={styles.lockText}>Cannot change</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Bio Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>
              <FileText size={14} color="#9ca3af" style={{ marginRight: 6 }} />
              Bio
            </label>
            <div style={{
              ...styles.textareaWrap,
              borderColor: focusedField === 'bio' ? '#8b5cf6' : 'rgba(0,0,0,0.08)',
              boxShadow: focusedField === 'bio' ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
            }}>
              <textarea
                value={input.bio}
                onChange={(e) => setInput({ ...input, bio: e.target.value })}
                onFocus={() => setFocusedField('bio')}
                onBlur={() => setFocusedField(null)}
                placeholder='✍️ Tell the world about yourself...'
                rows={3}
                maxLength={150}
                style={styles.textarea}
              />
              <div style={styles.charCount}>
                <div style={styles.charBar}>
                  <div style={{
                    ...styles.charBarFill,
                    width: `${(input.bio.length / 150) * 100}%`,
                    background: input.bio.length > 130
                      ? '#ef4444'
                      : 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                  }} />
                </div>
                <span style={{
                  ...styles.charText,
                  color: input.bio.length > 130 ? '#ef4444' : '#9ca3af',
                }}>
                  {input.bio.length}/150
                </span>
              </div>
            </div>
          </div>

          {/* Gender Field */}
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>
              <Users size={14} color="#9ca3af" style={{ marginRight: 6 }} />
              Gender
            </label>
            <div style={styles.genderRow}>
              {[
                { value: 'male', label: 'Male', emoji: '👨' },
                { value: 'female', label: 'Female', emoji: '👩' },
              ].map(opt => {
                const isSelected = input.gender === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setInput({ ...input, gender: opt.value })}
                    style={{
                      ...styles.genderBtn,
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.12))'
                        : 'rgba(255,255,255,0.8)',
                      borderColor: isSelected ? 'rgba(139,92,246,0.3)' : 'rgba(0,0,0,0.06)',
                      color: isSelected ? '#7c3aed' : '#6b7280',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                    className="transition-smooth"
                  >
                    <span style={{ fontSize: 18 }}>{opt.emoji}</span>
                    <span>{opt.label}</span>
                    {isSelected && (
                      <div style={styles.genderCheck}>
                        <Check size={12} color="#fff" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ═══════════ SUBMIT BUTTON ═══════════ */}
        <div style={styles.submitWrap}>
          <button
            onClick={editProfileHandler}
            disabled={loading || !hasChanges}
            style={{
              ...styles.submitBtn,
              opacity: (loading || !hasChanges) ? 0.5 : 1,
              cursor: (loading || !hasChanges) ? 'not-allowed' : 'pointer',
            }}
            className="transition-smooth"
            onMouseEnter={e => {
              if (!loading && hasChanges) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,92,246,0.4)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.3)'
            }}
          >
            {loading ? (
              <>
                <Loader2 className='animate-spin' size={18} style={{ marginRight: 8 }} />
                Saving Changes...
              </>
            ) : (
              <>
                <Check size={18} style={{ marginRight: 8 }} />
                Save Changes
              </>
            )}
          </button>
          {!hasChanges && (
            <p style={styles.noChangesHint}>Make changes above to enable saving</p>
          )}
        </div>

        {/* ═══════════ SECURITY CARD (Update Password) ═══════════ */}
        <div style={{ ...styles.formCard, marginTop: 10 }} className="hover-lift">
          <div style={styles.formHeader}>
            <Shield size={18} color="#ef4444" />
            <span style={styles.formHeaderText}>Security</span>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>
              <Lock size={14} color="#9ca3af" style={{ marginRight: 6 }} />
              Current Password
            </label>
            <div style={styles.fieldInputWrap}>
              <input
                type='password'
                value={passInput.currentPassword}
                onChange={(e) => setPassInput({ ...passInput, currentPassword: e.target.value })}
                onFocus={() => setFocusedField('currPass')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...styles.fieldInput,
                  borderColor: focusedField === 'currPass' ? '#8b5cf6' : 'rgba(0,0,0,0.08)',
                  boxShadow: focusedField === 'currPass' ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
                }}
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>
              <Lock size={14} color="#9ca3af" style={{ marginRight: 6 }} />
              New Password
            </label>
            <div style={styles.fieldInputWrap}>
              <input
                type='password'
                value={passInput.newPassword}
                onChange={(e) => setPassInput({ ...passInput, newPassword: e.target.value })}
                onFocus={() => setFocusedField('newPass')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...styles.fieldInput,
                  borderColor: focusedField === 'newPass' ? '#8b5cf6' : 'rgba(0,0,0,0.08)',
                  boxShadow: focusedField === 'newPass' ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
                }}
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>
              <Lock size={14} color="#9ca3af" style={{ marginRight: 6 }} />
              Confirm New Password
            </label>
            <div style={styles.fieldInputWrap}>
              <input
                type='password'
                value={passInput.confirmPassword}
                onChange={(e) => setPassInput({ ...passInput, confirmPassword: e.target.value })}
                onFocus={() => setFocusedField('confPass')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...styles.fieldInput,
                  borderColor: focusedField === 'confPass' ? '#8b5cf6' : 'rgba(0,0,0,0.08)',
                  boxShadow: focusedField === 'confPass' ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
                }}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div style={{ ...styles.submitWrap, paddingBottom: 0, paddingTop: 10 }}>
            <button
              onClick={updatePasswordHandler}
              disabled={passLoading || !hasPassChanges}
              style={{
                ...styles.submitBtn,
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                opacity: (passLoading || !hasPassChanges) ? 0.5 : 1,
                cursor: (passLoading || !hasPassChanges) ? 'not-allowed' : 'pointer',
              }}
              className="transition-smooth"
            >
              {passLoading ? (
                <>
                  <Loader2 className='animate-spin' size={18} style={{ marginRight: 8 }} />
                  Updating...
                </>
              ) : (
                <>
                  <Shield size={18} style={{ marginRight: 8 }} />
                  Update Password
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

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

  /* Header */
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 24px 16px',
    maxWidth: 600,
    margin: '0 auto',
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer',
    background: 'transparent',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 22, fontWeight: 800, color: '#1a1a2e',
    letterSpacing: '-0.3px', lineHeight: 1.2,
  },
  headerSub: {
    fontSize: 13, color: '#9ca3af', fontWeight: 500, marginTop: 2,
  },

  contentWrap: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex', flexDirection: 'column', gap: 20,
  },

  /* Avatar Card */
  avatarCard: {
    borderRadius: 20,
    overflow: 'hidden',
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
  },
  avatarBanner: {
    position: 'relative',
    height: 80,
    overflow: 'hidden',
  },
  avatarBannerGradient: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
    backgroundSize: '300% 300%',
    animation: 'gradientShift 8s ease infinite',
  },
  decoCircle: {
    position: 'absolute',
    borderRadius: '50%',
    background: '#fff',
  },
  avatarContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '0 20px 20px',
    marginTop: -36,
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatarRing: {
    width: 80, height: 80,
    borderRadius: '50%',
    padding: 3,
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarInner: {
    width: '100%', height: '100%',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid #fff',
    background: '#fff',
  },
  avatarFallback: {
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    color: 'white',
    fontSize: 26,
    fontWeight: 800,
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 28, height: 28,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2.5px solid #fff',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
  },
  avatarInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
    flex: 1,
    paddingTop: 38,
  },
  avatarName: {
    fontSize: 16, fontWeight: 700, color: '#1a1a2e',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  avatarEmail: {
    fontSize: 13, color: '#9ca3af', fontWeight: 500,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  changePhotoBtn: {
    display: 'inline-flex', alignItems: 'center',
    marginTop: 6,
    padding: '6px 14px',
    borderRadius: 10,
    fontSize: 13, fontWeight: 600,
    color: '#8b5cf6',
    background: 'transparent',
    border: '1.5px solid rgba(139,92,246,0.3)',
    cursor: 'pointer',
    width: 'fit-content',
  },

  /* Form Card */
  formCard: {
    borderRadius: 20,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
    padding: '24px 20px',
  },
  formHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 24,
  },
  formHeaderText: {
    fontSize: 16, fontWeight: 700, color: '#1a1a2e',
    letterSpacing: '-0.2px',
  },

  /* Fields */
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    display: 'flex', alignItems: 'center',
    fontSize: 13, fontWeight: 600, color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  fieldInputWrap: {
    position: 'relative',
  },
  fieldInput: {
    width: '100%',
    height: 46,
    padding: '0 16px',
    borderRadius: 14,
    border: '1.5px solid rgba(0,0,0,0.08)',
    fontSize: 14, fontWeight: 500, color: '#1a1a2e',
    outline: 'none',
    background: '#fff',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  fieldDisabled: {
    background: 'rgba(248,249,251,0.8)',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  lockBadge: {
    position: 'absolute',
    right: 12, top: '50%', transform: 'translateY(-50%)',
    display: 'flex', alignItems: 'center', gap: 4,
  },
  lockText: {
    fontSize: 11, fontWeight: 600, color: '#d1d5db',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },

  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.12), transparent)',
    margin: '24px 0',
  },

  /* Textarea */
  textareaWrap: {
    borderRadius: 14,
    border: '1.5px solid rgba(0,0,0,0.08)',
    overflow: 'hidden',
    transition: 'all 0.25s ease',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    border: 'none',
    outline: 'none',
    fontSize: 14, fontWeight: 500, color: '#1a1a2e',
    resize: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.6,
    background: 'transparent',
  },
  charCount: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '0 16px 10px',
  },
  charBar: {
    flex: 1, height: 3, borderRadius: 100,
    background: 'rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  charBarFill: {
    height: '100%', borderRadius: 100,
    transition: 'width 0.3s ease, background 0.3s ease',
  },
  charText: {
    fontSize: 11, fontWeight: 600, flexShrink: 0,
  },

  /* Gender */
  genderRow: {
    display: 'flex', gap: 10,
  },
  genderBtn: {
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px 16px',
    borderRadius: 14,
    border: '1.5px solid rgba(0,0,0,0.06)',
    fontSize: 14,
    cursor: 'pointer',
    position: 'relative',
  },
  genderCheck: {
    position: 'absolute',
    top: 8, right: 8,
    width: 20, height: 20,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  /* Submit */
  submitWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '8px 0 20px',
  },
  submitBtn: {
    width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '14px 32px',
    borderRadius: 16,
    fontSize: 15, fontWeight: 700, color: '#fff',
    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
    transition: 'all 0.25s ease',
  },
  noChangesHint: {
    marginTop: 10,
    fontSize: 12, color: '#d1d5db', fontWeight: 500,
  },
}

export default EditProfile