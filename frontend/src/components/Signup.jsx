import React, { useEffect, useState } from 'react'
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// import axios from 'axios'; // Not using fetch instead
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { API_ENDPOINTS } from '../config/api';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
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

    return (
        <div className='flex items-center w-screen min-h-screen justify-center bg-gradient-to-br from-pink-50 to-blue-50 p-4'>
            <form onSubmit={signupHandler} className='shadow-2xl flex flex-col gap-6 p-8 bg-white rounded-lg max-w-md w-full'>
                {/* Logo/Title Section */}
                <div className='text-center mb-2'>
                    <h1 className='text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500'>
                        MojMasti
                    </h1>
                    <p className='text-sm text-gray-600 mt-2'>Share your moments, connect with friends</p>
                </div>

                {/* Username Field */}
                <div>
                    <label className='font-semibold text-gray-700 block mb-2'>Username</label>
                    <div className='relative'>
                        <User size={18} className='absolute left-3 top-3 text-gray-400' />
                        <Input
                            type="text"
                            name="username"
                            placeholder="Enter your username"
                            value={input.username}
                            onChange={changeEventHandler}
                            className={`pl-10 focus-visible:ring-2 focus-visible:ring-pink-500 ${
                                errors.username ? 'border-red-500 border-2' : ''
                            }`}
                        />
                    </div>
                    {errors.username && (
                        <span className='text-red-500 text-sm mt-1 block'>{errors.username}</span>
                    )}
                    <p className='text-xs text-gray-500 mt-1'>Choose a username between 3-20 characters</p>
                </div>

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
                            className={`pl-10 focus-visible:ring-2 focus-visible:ring-pink-500 ${
                                errors.email ? 'border-red-500 border-2' : ''
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
                            className={`pl-10 pr-10 focus-visible:ring-2 focus-visible:ring-pink-500 ${
                                errors.password ? 'border-red-500 border-2' : ''
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
                    <p className='text-xs text-gray-500 mt-1'>Password must be 6+ characters with uppercase, lowercase, and numbers</p>
                </div>

                {/* Signup Button */}
                {
                    loading ? (
                        <Button disabled className='w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold py-2 rounded-lg'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Creating account...
                        </Button>
                    ) : (
                        <Button 
                            type='submit'
                            className='w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105'
                        >
                            Signup
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

                {/* Login Link */}
                <p className='text-center text-gray-700'>
                    Already have an account?{' '}
                    <Link to="/login" className='text-pink-600 font-semibold hover:text-pink-700 transition-colors'>
                        Login here
                    </Link>
                </p>
            </form>
        </div>
    )
}

export default Signup