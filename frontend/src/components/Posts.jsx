import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'
import { Loader } from 'lucide-react'

const Posts = () => {
    const { posts } = useSelector(store => store.post);

    if (!posts) {
        return (
            <div className='flex items-center justify-center h-96'>
                <Loader className='animate-spin' size={32} />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center h-96'>
                <p className='text-gray-500 text-lg'>No posts yet</p>
                <p className='text-gray-400 text-sm'>Follow some users to see their posts</p>
            </div>
        );
    }

    return (
        <div className='w-full'>
            {posts.map((post) => (
                <Post key={post?._id} post={post} />
            ))}
        </div>
    )
}

export default Posts