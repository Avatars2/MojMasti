import React, { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from "./ui/button";
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '../hooks/useGetAllMessage'
import useGetRTM from '../hooks/useGetRTM'

const Messages = ({ selectedUser, isMutual }) => {
    useGetRTM();
    useGetAllMessage();
    const { messages } = useSelector(store => store.chat);
    const { user } = useSelector(store => store.auth);
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isMutual) {
        return (
            <div className='overflow-y-auto flex-1 p-8 flex items-center justify-center'>
                <div className='text-center'>
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                        <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <h2 className='font-semibold mb-2'>Messaging restricted</h2>
                    <p className='text-sm text-gray-600 mb-4'>You can send messages only to users you follow who follow you back.</p>
                    <Link to={`/profile/${selectedUser?._id}`}><Button className="h-8" variant="secondary">View profile</Button></Link>
                </div>
            </div>
        )
    }

    const getSenderId = (msg) => {
        if (!msg) return null;
        if (typeof msg.senderId === 'string') return msg.senderId;
        if (msg.senderId?._id) return msg.senderId._id;
        return null;
    }

    return (
        <div className='overflow-y-auto flex-1 p-4 space-y-4' ref={containerRef}>
            {(messages || []).length === 0 && (
                <div className='flex items-center justify-center h-full'>
                    <div className='text-center'>
                        <Avatar className="h-16 w-16 mx-auto mb-2">
                            <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <p className='text-gray-600'>Start a conversation with {selectedUser?.username}</p>
                    </div>
                </div>
            )}

            {(messages || []).map((msg) => {
                const senderId = getSenderId(msg);
                const isMine = String(senderId) === String(user?._id);
                return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-lg ${isMine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                            <p className='text-sm break-words'>{msg.message}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Messages