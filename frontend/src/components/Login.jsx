import React, { useEffect, useState } from 'react'
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../redux/authSlice';
import { API_ENDPOINTS } from '../config/api';
import { handleApiSuccess } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const Login = () => {
    const [input, setInput] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotEmailError, setForgotEmailError] = useState("");
    const [resetSent, setResetSent] = useState(false);
    const [loginError, setLoginError] = useState("");

    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const validateLoginForm = () => {
        const newErrors = {};
        if (!input.email.trim()) newErrors.email = 'Email or mobile number is required';
        else {
            const val = input.email.trim();
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            const isMobile = /^\d{10}$/.test(val);
            if (!isEmail && !isMobile) newErrors.email = 'Please enter a valid email or 10-digit mobile number';
        }
        if (!input.password) newErrors.password = 'Password is required';
        else if (input.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const validateForgotEmail = () => {
        if (!forgotEmail.trim()) { setForgotEmailError('Email is required'); return false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) { setForgotEmailError('Please enter a valid email address'); return false; }
        setForgotEmailError(''); return true;
    }

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
        if (loginError) setLoginError('');
    }

    const loginHandler = async (e) => {
        e.preventDefault();
        setLoginError('');
        if (!validateLoginForm()) { toast.error('Please fix the errors above'); return; }
        try {
            setLoading(true);
            const res = await axios.post(API_ENDPOINTS.AUTH.LOGIN, input, {
                headers: { 'Content-Type': 'application/json' }, withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                handleApiSuccess(res.data.message);
                setInput({ email: "", password: "" });
                logger.log('Login successful, redirecting to home');
                setTimeout(() => navigate("/"), 1500);
            }
        } catch (error) {
            logger.error('Login error', error);
            if (error.response?.status === 404) {
                setLoginError("No account found with this email/mobile. Please signup to create an account.");
                toast.error("No account found");
            } else if (error.response?.status === 401) {
                setLoginError("Email/mobile or password is incorrect. Please try again.");
                toast.error("Email/mobile or password is incorrect");
            } else {
                setLoginError("Login failed. Please try again later.");
                toast.error(error.response?.data?.message || "Login failed");
            }
        } finally { setLoading(false); }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!validateForgotEmail()) return;
        try {
            setForgotLoading(true);
            const res = await axios.post(
                `${API_ENDPOINTS.AUTH.LOGIN.replace('/login', '/forgot-password')}`,
                { email: forgotEmail },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            if (res.data.success) {
                handleApiSuccess('Password reset link sent to your email');
                setResetSent(true); setForgotEmail("");
                setTimeout(() => { setShowForgotPassword(false); setResetSent(false); }, 2000);
            }
        } catch (error) {
            logger.error('Forgot password error', error);
            if (error.response?.status === 404) {
                toast.error('No account found with this email');
                setForgotEmailError('No account found with this email');
            } else toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally { setForgotLoading(false); }
    }

    useEffect(() => { if (user) navigate("/"); }, [user, navigate])

    const inputStyle = (hasError) => ({
        width: '100%',
        padding: '12px 16px 12px 44px',
        borderRadius: '14px',
        border: hasError ? '2px solid #ef4444' : '1.5px solid rgba(0,0,0,0.08)',
        fontSize: '14px',
        color: '#1f2937',
        background: '#fafafe',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
    });

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100vw', minHeight: '100vh', padding: '16px',
            background: 'linear-gradient(135deg, #faf5ff 0%, #f0f4ff 50%, #fdf2f8 100%)',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Decorative blobs */}
            <div style={{
                position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(236,72,153,0.08), transparent 70%)',
                top: '-100px', right: '-100px', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)',
                bottom: '-50px', left: '-50px', pointerEvents: 'none',
            }} />

            {!showForgotPassword ? (
                <form onSubmit={loginHandler} className='animate-scale-in glass shadow-premium' style={{
                    display: 'flex', flexDirection: 'column', gap: '20px',
                    padding: '40px 32px', borderRadius: '28px', maxWidth: '420px', width: '100%',
                    position: 'relative', zIndex: 1,
                }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                        <div className='gradient-brand animate-gradient' style={{
                            width: '56px', height: '56px', borderRadius: '18px', margin: '0 auto 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(236,72,153,0.3)',
                            backgroundSize: '200% 200%',
                        }}>
                            <span style={{ color: 'white', fontWeight: 900, fontSize: '22px' }}>M</span>
                        </div>
                        <h1 className='gradient-brand-text' style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px' }}>MojMasti</h1>
                        <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '6px' }}>Share your moments, connect with friends</p>
                    </div>

                    {/* Error */}
                    {loginError && (
                        <div className='animate-fade-in' style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            background: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.2)',
                            borderRadius: '14px', padding: '12px 16px',
                        }}>
                            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
                            <p style={{ color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>{loginError}</p>
                        </div>
                    )}

                    {/* Email or Mobile */}
                    <div>
                        <label style={{ fontWeight: 600, fontSize: '13px', color: '#4b5563', display: 'block', marginBottom: '8px' }}>Email or Mobile</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                            <input type="text" name="email" placeholder="Email address or mobile number" value={input.email} onChange={changeEventHandler}
                                style={inputStyle(errors.email)}
                                onFocus={(e) => { if (!errors.email) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)' }}}
                                onBlur={(e) => { if (!errors.email) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}}
                            />
                        </div>
                        {errors.email && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 500 }}>{errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{ fontWeight: 600, fontSize: '13px', color: '#4b5563', display: 'block', marginBottom: '8px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                            <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={input.password} onChange={changeEventHandler}
                                style={{ ...inputStyle(errors.password), paddingRight: '44px' }}
                                onFocus={(e) => { if (!errors.password) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)' }}}
                                onBlur={(e) => { if (!errors.password) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', background: 'none', border: 'none', padding: '2px' }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 500 }}>{errors.password}</span>}
                    </div>

                    {/* Forgot Password */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setShowForgotPassword(true)}
                            style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none' }}>
                            Forgot password?
                        </button>
                    </div>

                    {/* Login Button */}
                    <button type='submit' disabled={loading}
                        className='gradient-brand transition-smooth'
                        style={{
                            width: '100%', padding: '13px', borderRadius: '14px', border: 'none',
                            color: 'white', fontWeight: 700, fontSize: '15px',
                            boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        }}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                        {loading && <Loader2 className='animate-spin' style={{ width: '18px', height: '18px' }} />}
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    {/* Divider */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                        <span style={{ padding: '0 12px', fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                    </div>

                    {/* Signup Link */}
                    <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: '#8b5cf6', fontWeight: 700 }}>Signup here</Link>
                    </p>
                </form>
            ) : (
                /* Forgot Password Form */
                <form onSubmit={handleForgotPassword} className='animate-scale-in glass shadow-premium' style={{
                    display: 'flex', flexDirection: 'column', gap: '20px',
                    padding: '40px 32px', borderRadius: '28px', maxWidth: '420px', width: '100%',
                    position: 'relative', zIndex: 1,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <button type="button" onClick={() => setShowForgotPassword(false)}
                            className='transition-smooth'
                            style={{ padding: '6px', borderRadius: '10px', background: 'none', border: 'none', color: '#4b5563' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1f2937' }}>Reset Password</h2>
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {!resetSent ? (
                        <>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '13px', color: '#4b5563', display: 'block', marginBottom: '8px' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                                    <input type="email" placeholder="Enter your email" value={forgotEmail}
                                        onChange={(e) => { setForgotEmail(e.target.value); if (forgotEmailError) setForgotEmailError(''); }}
                                        style={inputStyle(forgotEmailError)}
                                        onFocus={(e) => { if (!forgotEmailError) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)' }}}
                                        onBlur={(e) => { if (!forgotEmailError) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}}
                                    />
                                </div>
                                {forgotEmailError && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 500 }}>{forgotEmailError}</span>}
                            </div>
                            <button type='submit' disabled={forgotLoading}
                                className='gradient-brand transition-smooth'
                                style={{
                                    width: '100%', padding: '13px', borderRadius: '14px', border: 'none',
                                    color: 'white', fontWeight: 700, fontSize: '15px',
                                    boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                                    opacity: forgotLoading ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}
                            >
                                {forgotLoading && <Loader2 className='animate-spin' style={{ width: '18px', height: '18px' }} />}
                                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </>
                    ) : (
                        <div className='animate-scale-in' style={{ textAlign: 'center', padding: '24px 0' }}>
                            <div style={{
                                background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.2)',
                                borderRadius: '14px', padding: '16px', marginBottom: '12px',
                            }}>
                                <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '14px' }}>✓ Reset link sent successfully!</p>
                            </div>
                            <p style={{ color: '#9ca3af', fontSize: '13px' }}>Check your email. The link will expire in 1 hour.</p>
                        </div>
                    )}
                </form>
            )}
        </div>
    )
}

export default Login