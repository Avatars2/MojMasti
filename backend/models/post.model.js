import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption: { type: String, default: '' },
    image: { type: String },
    video: { type: String },
    mediaType: { type: String, enum: ['image', 'video', 'reel'], required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    duration: { type: Number, default: 0 }, // for videos in seconds
    thumbnail: { type: String }, // for video thumbnails
    tags: [{ type: String }], // for discoverability
    location: { type: String, default: '' },
}, { timestamps: true });

export const Post = mongoose.model('Post', postSchema);