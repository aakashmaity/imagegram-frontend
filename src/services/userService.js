import { usersApi } from '../api';


export const createUser = async (userData) => {
  try {
    const response = await usersApi.createUser(userData);
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const signup = async (userData) => {
  try {
    const response = await usersApi.signup(userData);
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error signing up user:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await usersApi.getUserProfile(userId);
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const getCurrentUserProfile = async () => {
  try {
    const response = await usersApi.getCurrentUserProfile();
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await usersApi.updateUserProfile(userId, userData);
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const getUserPosts = async (userId, offset = 0, limit = 5) => {
  try {
    const response = await usersApi.getUserPosts(userId, offset, limit);
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

export const searchUsers = async (query, offset = 0, limit = 10) => {
  try {
    const response = await usersApi.searchUsers(query, offset, limit);
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const followUser = async ({ currentUserId, targetUserId }) => {
  try {
    const response = await usersApi.followUser({ currentUserId, targetUserId });
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error following user:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export const unfollowUser = async ({ currentUserId, targetUserId }) => {
  try {
    const response = await usersApi.unfollowUser({ currentUserId, targetUserId });
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

