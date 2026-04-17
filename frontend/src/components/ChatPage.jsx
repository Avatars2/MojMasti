import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '../redux/authSlice';
import { Input } from './ui/input';
import { Button } from "./ui/button";
import { MessageCircleCode, Send } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { addMessage } from '../redux/chatSlice';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers } = useSelector(store => store.chat);
    const dispatch = useDispatch();

    const isMutual = useMemo(() => {
        if (!user || !selectedUser) return false;
        return (user.following || []).map(String).includes(String(selectedUser._id)) &&
               (selectedUser.following || []).map(String).includes(String(user._id));
    }, [user, selectedUser]);

    const sendMessageHandler = async (receiverId) => {
        if (!isMutual) {
            toast.error('You can only message users who you follow and who follow you back.');
            return;
        }
        if (!textMessage.trim()) return;

        try {
            const res = await axios.post(`${API_ENDPOINTS.MESSAGE.SEND}/${receiverId}`, { textMessage }, {
                headers: { 'Content-Type': 'application/json'},
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(addMessage(res.data.newMessage));
                setTextMessage("");
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to send message';
            toast.error(msg);
        }
    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    }, [dispatch]);

    return (
        <div className='flex flex-col lg:flex-row lg:ml-[16%] h-screen bg-gray-50'>
            <section className='w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200'>
                <div className='p-4 border-b border-gray-200'>
                    <h1 className='font-bold text-xl'>{user?.username}</h1>
                </div>
                <div className='overflow-y-auto h-[calc(100%-80px)]'>
                    {
                        (suggestedUsers || []).map((suggestedUser) => {
                            const isOnline = (onlineUsers || []).includes(suggestedUser?._id);
                            return (
                                <div 
                                    key={suggestedUser._id} 
                                    onClick={() => dispatch(setSelectedUser(suggestedUser))} 
                                    className={`flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedUser?._id === suggestedUser._id ? 'bg-gray-100' : ''}`}
                                >
                                    <div className='relative'>
                                        <Avatar className='w-14 h-14'>
                                            <AvatarImage src={suggestedUser?.profilePicture} />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        {isOnline && <div className='absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>}
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-sm'>{suggestedUser?.username}</span>
                                        <span className={`text-xs ${isOnline ? 'text-green-600 font-bold' : 'text-gray-500'}`}>{isOnline ? 'online' : 'offline'}</span>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

            </section>
            {
                selectedUser ? (
                    <section className='flex-1 flex flex-col h-full bg-white'>
                        <div className='flex gap-3 items-center px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10'>
                            <Avatar className='h-12 w-12'>
                                <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                                <span className='font-semibold text-sm'>{selectedUser?.username}</span>
                                {!isMutual && <p className='text-xs text-red-500'>Messaging restricted</p>}
                            </div>
                        </div>
                        <Messages selectedUser={selectedUser} isMutual={isMutual} />
                        <div className='flex items-center gap-2 p-4 border-t border-gray-200'>
                            <Input 
                                value={textMessage} 
                                onChange={(e) => setTextMessage(e.target.value)} 
                                type="text" 
                                className='flex-1 focus-visible:ring-2 focus-visible:ring-pink-500' 
                                placeholder="Message..." 
                                onKeyPress={(e) => e.key === 'Enter' && sendMessageHandler(selectedUser?._id)}
                            />
                            <Button 
                                onClick={() => sendMessageHandler(selectedUser?._id)} 
                                disabled={!isMutual || !textMessage.trim()}
                                className='bg-pink-500 hover:bg-pink-600'
                            >
                                <Send size={18} />
                            </Button>
                        </div>
                    </section>
                ) : (
                    <div className='flex flex-col items-center justify-center flex-1'>
                        <MessageCircleCode className='w-32 h-32 my-4 text-gray-300' />
                        <h1 className='font-medium text-lg'>Your messages</h1>
                        <span className='text-gray-500'>Send a message to start a chat.</span>
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage;