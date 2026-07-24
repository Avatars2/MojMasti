import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'

const Comment = ({ comment }) => {
    return (
        <div className='flex gap-3 mb-4 group'>
            <Link to={`/app/profile/${comment?.author?._id}`}>
                <Avatar className='h-8 w-8 shrink-0'>
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback>{comment?.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            </Link>
            <div className='flex flex-col flex-1'>
                <div className='text-[14px] leading-[18px]'>
                    <Link to={`/app/profile/${comment?.author?._id}`} className='font-semibold text-gray-900 mr-1 hover:text-gray-500'>
                        {comment?.author?.username}
                    </Link>
                    <span className='text-gray-800 break-words'>{comment?.text}</span>
                </div>
                {/* Optional: Add timestamp or reply button here if available in the future */}
                {/* <div className='flex items-center gap-3 mt-1 text-[12px] text-gray-500 font-semibold'>
                    <span>2h</span>
                    <button className='hover:text-gray-400'>Reply</button>
                </div> */}
            </div>
        </div>
    )
}

export default Comment