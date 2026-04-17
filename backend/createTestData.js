import mongoose from 'mongoose';
import { User } from './models/user.model.js';
import { Post } from './models/post.model.js';
import { Story } from './models/story.model.js';

mongoose.connect('mongodb+srv://avatars2610_db_user:TO9HjGSjiLvuGBdI@cluster0.wnfvv15.mongodb.net/?appName=Cluster0')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Create a test user if not exists
  let user = await User.findOne({ email: 'test@example.com' });
  if (!user) {
    user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      profilePicture: 'https://via.placeholder.com/150'
    });
    await user.save();
    console.log('Test user created');
  }
  
  // Create test posts
  const posts = [
    {
      caption: 'Beautiful sunset! 🌅',
      image: 'https://picsum.photos/400/400?random=1',
      mediaType: 'image',
      author: user._id,
      likes: [],
      comments: []
    },
    {
      caption: 'Amazing view from the top! 🏔️',
      image: 'https://picsum.photos/400/400?random=2',
      mediaType: 'image',
      author: user._id,
      likes: [],
      comments: []
    },
    {
      caption: 'Coffee time ☕',
      image: 'https://picsum.photos/400/400?random=3',
      mediaType: 'image',
      author: user._id,
      likes: [],
      comments: []
    }
  ];
  
  for (const postData of posts) {
    const existingPost = await Post.findOne({ caption: postData.caption });
    if (!existingPost) {
      const post = new Post(postData);
      await post.save();
      console.log('Test post created:', postData.caption);
    }
  }
  
  // Create test story
  const storyData = {
    caption: 'Story time! 📸',
    media: 'https://picsum.photos/400/600?random=10',
    mediaType: 'image',
    author: user._id,
    viewers: []
  };
  
  const existingStory = await Story.findOne({ caption: storyData.caption });
  if (!existingStory) {
    const story = new Story(storyData);
    await story.save();
    console.log('Test story created');
  }
  
  console.log('Test data created successfully!');
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
