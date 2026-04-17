const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/v1/user/register`,
    LOGIN: `${API_BASE_URL}/api/v1/user/login`,
    LOGOUT: `${API_BASE_URL}/api/v1/user/logout`,
  },
  USER: {
    PROFILE: (userId) => `${API_BASE_URL}/api/v1/user/${userId}/profile`,
    EDIT_PROFILE: `${API_BASE_URL}/api/v1/user/profile/edit`,
    SUGGESTED: `${API_BASE_URL}/api/v1/user/suggested`,
    FOLLOW: (userId) => `${API_BASE_URL}/api/v1/user/followorunfollow/${userId}`,
  },
  POST: {
    ALL: `${API_BASE_URL}/api/v1/post/all`,
    CREATE: `${API_BASE_URL}/api/v1/post/addpost`,
    USER_POSTS: `${API_BASE_URL}/api/v1/post/userpost/all`,
    LIKED: `${API_BASE_URL}/api/v1/post/liked`,
    SAVED: `${API_BASE_URL}/api/v1/post/saved`,
    LIKE: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/like`,
    DISLIKE: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/dislike`,
    COMMENT: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/comment`,
    GET_COMMENTS: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/comment/all`,
    DELETE_POST: (postId) => `${API_BASE_URL}/api/v1/post/delete/${postId}`,
    BOOKMARK: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/bookmark`,
  },
  MESSAGE: {
    GET_ALL: (conversationId) => `${API_BASE_URL}/api/v1/message/all/${conversationId}`,
    SEND: `${API_BASE_URL}/api/v1/message/send`,
  },
  STORY: {
    GET_ALL: `${API_BASE_URL}/api/v1/story`,
    CREATE: `${API_BASE_URL}/api/v1/story/create`,
    GET_USER_STORIES: `${API_BASE_URL}/api/v1/story/my-stories`,
    VIEW: `${API_BASE_URL}/api/v1/story`,
    DELETE: (storyId) => `${API_BASE_URL}/api/v1/story/${storyId}`,
  }
};