import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'
import { ImageOff } from 'lucide-react'

const Posts = () => {
    const { posts } = useSelector(store => store.post);

    if (!posts) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '320px',
            }}>
                <div
                    className='animate-spin-smooth'
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '3px solid rgba(139,92,246,0.15)',
                        borderTopColor: '#8b5cf6',
                    }}
                />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '360px',
                padding: '32px',
            }}>
                <div
                    className='animate-float'
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.10))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                    }}
                >
                    <ImageOff style={{ width: '32px', height: '32px', color: '#a78bfa' }} />
                </div>
                <p style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1f2937',
                    marginBottom: '8px',
                }}>
                    No posts yet
                </p>
                <p style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    textAlign: 'center',
                    maxWidth: '260px',
                    lineHeight: '1.5',
                }}>
                    Follow some users to see their posts
                </p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            {posts.map((post) => (
                <Post key={post?._id} post={post} />
            ))}
        </div>
    )
}

export default Posts