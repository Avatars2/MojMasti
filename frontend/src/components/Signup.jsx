import React, { useEffect, useState } from 'react'
// import axios from 'axios'; // Not using fetch instead
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useSelector } from 'react-redux';
import { API_ENDPOINTS } from '../config/api';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        mobile: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    // Validation rules
    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!input.username.trim()) {
            newErrors.username = 'Please enter your username';
        } else if (input.username.length < 3) {
            newErrors.username = 'Username should be at least 3 characters long';
        } else if (input.username.length > 20) {
            newErrors.username = 'Username should be less than 20 characters';
        } else if (!/^[a-zA-Z0-9_ ]+$/.test(input.username)) {
            newErrors.username = 'Username can only contain letters, numbers, spaces, and underscores';
        }

        // Email validation
        if (!input.email.trim()) {
            newErrors.email = 'Please enter your email address';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Mobile validation (optional but if provided must be valid)
        if (input.mobile.trim() && !/^\d{10}$/.test(input.mobile.trim())) {
            newErrors.mobile = 'Please enter a valid 10-digit mobile number';
        }

        // Password validation
        if (!input.password) {
            newErrors.password = 'Password is required';
        } else if (input.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (input.password.length > 50) {
            newErrors.password = 'Password must be less than 50 characters';
        } else if (!/(?=.*[a-z])/.test(input.password)) {
            newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(input.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(input.password)) {
            newErrors.password = 'Password must contain at least one number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
        // Clear error for this field as user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            toast.error('Please review the form and fix any issues');
            return;
        }

        try {
            setLoading(true);
            logger.log('Attempting signup to:', API_ENDPOINTS.AUTH.REGISTER);
            logger.log('Signup data:', input);
            
            // Try using fetch instead of axios to debug
            const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(input)
            });
            
            const res = await response.json();
            logger.log('Response:', res);

            if (res.success) {
                handleApiSuccess(res.message);
                setInput({
                    username: "",
                    email: "",
                    mobile: "",
                    password: ""
                });
                logger.log('Signup successful, redirecting to login');
                setTimeout(() => navigate("/login"), 1500);
            }
        } catch (error) {
            logger.error('Signup error', error);
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate])

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
            <div style={{
                position: 'absolute', width: '250px', height: '250px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
                top: '40%', left: '10%', pointerEvents: 'none',
            }} />

            <form onSubmit={signupHandler} className='animate-scale-in glass shadow-premium' style={{
                display: 'flex', flexDirection: 'column', gap: '18px',
                padding: '36px 32px', borderRadius: '28px', maxWidth: '420px', width: '100%',
                position: 'relative', zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2px' }}>
                    <div className='gradient-brand animate-gradient' style={{
                        width: '56px', height: '56px', borderRadius: '18px', margin: '0 auto 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(236,72,153,0.3)',
                        backgroundSize: '200% 200%',
                    }}>
                        <span style={{ color: 'white', fontWeight: 900, fontSize: '22px' }}>M</span>
                    </div>
                    <h1 className='gradient-brand-text' style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px' }}>MojMasti</h1>
                    <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '6px' }}>Create your account to get started</p>
                </div>

                {/* Username Field */}
                <div>
                    <label style={{ fontWeight: 600, fontSize: '13px', color: '#4b5563', display: 'block', marginBottom: '8px' }}>Username</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                        <input
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={input.username}
                            onChange={changeEventHandler}
                            style={inputStyle(errors.username)}
                            onFocus={(e) => { if (!errors.username) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)' }}}
                            onBlur={(e) => { if (!errors.username) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}}
                        />
                    </div>
                    {errors.username && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 500 }}>{errors.username}</span>}
                    <p style={{ fontSize: '11px', color: '#b0b0b8', marginTop: '4px' }}>3-20 characters, letters, numbers & underscores</p>
                </div>

                {/* Email Field */}
                <div>
                    <label style={{ fontWeight: 600, fontSize: '13px', color: '#4b5563', display: 'block', marginBottom: '8px' }}>Email</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={input.email}
                            onChange={changeEventHandler}
                            style={inputStyle(errors.email)}
                            onFocus={(e) => { if (!errors.email) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)' }}}
                            onBlur={(e) => { if (!errors.email) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}}
                        />
                    </div>
                    {errors.email && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 500 }}>{errors.email}</span>}
                </div>

                {/* Mobile Number Field */}
                <div>
                    <label style={{ fontWeight: 600, fontSize: '13px', color: '#4b5563', display: 'block', marginBottom: '8px' }}>Mobile Number <span style={{ color: '#b0b0b8', fontWeight: 400 }}>(optional)</span></label>
                    <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="Enter 10-digit mobile number"
                            value={input.mobile}
                            onChange={changeEventHandler}
                            maxLength={10}
                            style={inputStyle(errors.mobile)}
                            onFocus={(e) => { if (!errors.mobile) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)' }}}
                            onBlur={(e) => { if (!errors.mobile) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}}
                        />
                    </div>
                    {errors.mobile && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 500 }}>{errors.mobile}</span>}
                    <p style={{ fontSize: '11px', color: '#b0b0b8', marginTop: '4px' }}>You can also login using your mobile number</p>
                </div>

                {/* Password Field */}
                <div>
                    <label style={{ fontWeight: 600, fontSize: '13px', color: '#4b5563', display: 'block', marginBottom: '8px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Create a strong password"
                            value={input.password}
                            onChange={changeEventHandler}
                            style={{ ...inputStyle(errors.password), paddingRight: '44px' }}
                            onFocus={(e) => { if (!errors.password) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)' }}}
                            onBlur={(e) => { if (!errors.password) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', background: 'none', border: 'none', padding: '2px', cursor: 'pointer' }}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 500 }}>{errors.password}</span>}
                    <p style={{ fontSize: '11px', color: '#b0b0b8', marginTop: '4px' }}>6+ characters with uppercase, lowercase & numbers</p>
                </div>

                {/* Signup Button */}
                <button type='submit' disabled={loading}
                    className='gradient-brand transition-smooth'
                    style={{
                        width: '100%', padding: '13px', borderRadius: '14px', border: 'none',
                        color: 'white', fontWeight: 700, fontSize: '15px',
                        boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                        opacity: loading ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '4px',
                    }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                >
                    {loading && <Loader2 className='animate-spin' style={{ width: '18px', height: '18px' }} />}
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>

                {/* Divider */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                    <span style={{ padding: '0 12px', fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
                </div>

                {/* Login Link */}
                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#8b5cf6', fontWeight: 700, textDecoration: 'none' }}>Login here</Link>
                </p>
            </form>
        </div>
    )
}

export default Signup