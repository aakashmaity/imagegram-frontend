import { getCurrentUser } from '@/utils';
import { postsApi } from '../api';

export const getALLPosts = async (offset = 0, limit = 5) => {
  try {
    const response = await postsApi.getAllPosts(offset, limit);

    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const getPostById = async (postId) => {
  try {
    const response = await postsApi.getPostById(postId);
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching post by id:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const getPostsMadeByUser = async (userId, offset = 0, limit = 5) => {
  try {
    const response = await postsApi.getPostsMadeByUser(userId, offset, limit);
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const createPost = async (postData) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating post for user:', user);
    
    const response = await postsApi.createPost({...postData, user: user._id });
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const updatePost = async (postId, postData) => {
  try {
    const response = await postsApi.updatePost(postId, postData);
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error updating post:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const deletePost = async (postId) => {
  try {
    await postsApi.deletePost(postId);
    return {
      success: true,
      data: null,
      error: null,
    };
  } catch (error) {
    console.error('Error deleting post:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};
