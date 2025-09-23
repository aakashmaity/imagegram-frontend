/**
 * Utility functions for post operations
 */

/**
 * Filters out invalid posts from an array of posts
 * @param {Array} posts - Array of post objects
 * @returns {Array} Array of valid posts
 */
export const filterValidPosts = (posts) => {
  if (!Array.isArray(posts)) return [];
  
  return posts.filter(post => 
    post && 
    post._id && // Ensure post has a valid ID
    post.caption && // Ensure required fields exist
    post.image &&
    post.user
  );
};

/**
 * Checks if a post is valid
 * @param {Object} post - Post object
 * @returns {boolean} True if post is valid, false otherwise
 */
export const isValidPost = (post) => {
  return post && post._id && post.caption && post.image && post.user;
};