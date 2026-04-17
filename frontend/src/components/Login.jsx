import React, { useEffect, useState } from 'react'
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../redux/authSlice';
import { API_ENDPOINTS } from '../config/api';
import { handleApiSuccess } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });
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

    // Validation for login form
    const validateLoginForm = () => {
        const newErrors = {};

        if (!input.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!input.password) {
            newErrors.password = 'Password is required';
        } else if (input.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // Validation for forgot password
    const validateForgotEmail = () => {
        if (!forgotEmail.trim()) {
            setForgotEmailError('Email is required');
            return false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
            setForgotEmailError('Please enter a valid email address');
            return false;
        }
        setForgotEmailError('');
        return true;
    }

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
        if (loginError) {
            setLoginError('');
        }
    }

    const loginHandler = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!validateLoginForm()) {
            toast.error('Please fix the errors above');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(API_ENDPOINTS.AUTH.LOGIN, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                handleApiSuccess(res.data.message);
                setInput({
                    email: "",
                    password: ""
                });
                logger.log('Login successful, redirecting to home');
                setTimeout(() => navigate("/"), 1500);
            }
        } catch (error) {
            logger.error('Login error', error);

            // Detailed error handling based on status code
            if (error.response?.status === 404) {
                // User doesn't exist
                setLoginError("❌ No account found with this email. Please signup to create an account.");
                toast.error("No account found with this email");
            } else if (error.response?.status === 401) {
                // Wrong password
                setLoginError("❌ Email or password is incorrect. Please try again.");
                toast.error("Email or password is incorrect");
            } else {
                // Other errors
                setLoginError("❌ Login failed. Please try again later.");
                toast.error(error.response?.data?.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!validateForgotEmail()) {
            return;
        }

        try {
            setForgotLoading(true);
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/user/forgot-password`,
                { email: forgotEmail },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            if (res.data.success) {
                handleApiSuccess('Password reset link sent to your email');
                setResetSent(true);
                setForgotEmail("");
                setTimeout(() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                }, 2000);
            }
        } catch (error) {
            logger.error('Forgot password error', error);
            if (error.response?.status === 404) {
                toast.error('❌ No account found with this email address');
                setForgotEmailError('No account found with this email');
            } else {
                toast.error(error.response?.data?.message || 'Failed to send reset link');
            }
        } finally {
            setForgotLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate])

    return (
        <div className='flex items-center w-screen min-h-screen justify-center bg-gradient-to-br from-pink-50 to-blue-50 p-4'>
            {!showForgotPassword ? (
                // Login Form
                <form onSubmit={loginHandler} className='shadow-2xl flex flex-col gap-6 p-8 bg-white rounded-lg max-w-md w-full'>
                    {/* Logo/Title Section */}
                    <div className='text-center mb-2'>
                        <h1 className='text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500'>
                            MojMasti
                        </h1>
                        <p className='text-sm text-gray-600 mt-2'>Share your moments, connect with friends</p>
                    </div>

                    {/* Error Message Box */}
                    {loginError && (
                        <div className='flex items-start gap-3 bg-red-50 border-2 border-red-300 rounded-lg p-4'>
                            <AlertCircle size={20} className='text-red-600 flex-shrink-0 mt-0.5' />
                            <p className='text-red-700 text-sm font-semibold'>{loginError}</p>
                        </div>
                    )}

                    {/* Email Field */}
                    <div>
                        <label className='font-semibold text-gray-700 block mb-2'>Email</label>
                        <div className='relative'>
                            <Mail size={18} className='absolute left-3 top-3 text-gray-400' />
                            <Input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={input.email}
                                onChange={changeEventHandler}
                                className={`pl-10 focus-visible:ring-2 focus-visible:ring-pink-500 ${errors.email ? 'border-red-500 border-2' : ''
                                    }`}
                            />
                        </div>
                        {errors.email && (
                            <span className='text-red-500 text-sm mt-1 block'>{errors.email}</span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className='font-semibold text-gray-700 block mb-2'>Password</label>
                        <div className='relative'>
                            <Lock size={18} className='absolute left-3 top-3 text-gray-400' />
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={input.password}
                                onChange={changeEventHandler}
                                className={`pl-10 pr-10 focus-visible:ring-2 focus-visible:ring-pink-500 ${errors.password ? 'border-red-500 border-2' : ''
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <span className='text-red-500 text-sm mt-1 block'>{errors.password}</span>
                        )}
                    </div>

                    {/* Forgot Password Link */}
                    <div className='flex justify-end'>
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className='text-pink-600 text-sm font-semibold hover:text-pink-700 transition-colors'
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Login Button */}
                    {
                        loading ? (
                            <Button disabled className='w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold py-2 rounded-lg'>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Logging in...
                            </Button>
                        ) : (
                            <Button
                                type='submit'
                                className='w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105'
                            >
                                Login
                            </Button>
                        )
                    }

                    {/* Divider */}
                    <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-gray-300'></div>
                        </div>
                        <div className='relative flex justify-center text-sm'>
                            <span className='px-2 bg-white text-gray-500'>OR</span>
                        </div>
                    </div>

                    {/* Signup Link */}
                    <p className='text-center text-gray-700'>
                        Don't have an account?{' '}
                        <Link to="/signup" className='text-pink-600 font-semibold hover:text-pink-700 transition-colors'>
                            Signup here
                        </Link>
                    </p>
                </form>
            ) : (
                // Forgot Password Form
                <form onSubmit={handleForgotPassword} className='shadow-2xl flex flex-col gap-6 p-8 bg-white rounded-lg max-w-md w-full'>
                    {/* Header */}
                    <div className='flex items-center gap-2 mb-2'>
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(false)}
                            className='text-gray-600 hover:text-gray-800 transition-colors'
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className='text-2xl font-bold text-gray-800'>Reset Password</h2>
                    </div>
                    <p className='text-gray-600 text-sm'>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {!resetSent ? (
                        <>
                            {/* Email Field */}
                            <div>
                                <label className='font-semibold text-gray-700 block mb-2'>Email Address</label>
                                <div className='relative'>
                                    <Mail size={18} className='absolute left-3 top-3 text-gray-400' />
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={forgotEmail}
                                        onChange={(e) => {
                                            setForgotEmail(e.target.value);
                                            if (forgotEmailError) setForgotEmailError('');
                                        }}
                                        className={`pl-10 focus-visible:ring-2 focus-visible:ring-pink-500 ${forgotEmailError ? 'border-red-500 border-2' : ''
                                            }`}
                                    />
                                </div>
                                {forgotEmailError && (
                                    <span className='text-red-500 text-sm mt-1 block'>{forgotEmailError}</span>
                                )}
                            </div>

                            {/* Send Button */}
                            {
                                forgotLoading ? (
                                    <Button disabled className='w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold py-2 rounded-lg'>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Sending...
                                    </Button>
                                ) : (
                                    <Button
                                        type='submit'
                                        className='w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105'
                                    >
                                        Send Reset Link
                                    </Button>
                                )
                            }
                        </>
                    ) : (
                        // Success Message
                        <div className='text-center py-8'>
                            <div className='bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-4'>
                                <p className='text-green-700 font-semibold'>✓ Reset link sent successfully!</p>
                            </div>
                            <p className='text-gray-600 text-sm'>
                                Check your email for the password reset link. The link will expire in 1 hour.
                            </p>
                        </div>
                    )}
                </form>
            )}
        </div>
    )
}

export default Login