/**
 * Utility functions for post operations
 */

/**
 * Filters out deleted posts from an array of posts
 * @param {Array} posts - Array of post objects
 * @returns {Array} Array of active (non-deleted) posts
 */
export const filterActivePosts = (posts) => {
  if (!Array.isArray(posts)) return [];
  
  return posts.filter(post => 
    post && 
    !post.deleted && 
    !post.isDeleted &&
    post._id // Ensure post has a valid ID
  );
};

/**
 * Checks if a post is active (not deleted)
 * @param {Object} post - Post object
 * @returns {boolean} True if post is active, false otherwise
 */
export const isPostActive = (post) => {
  return post && !post.deleted && !post.isDeleted && post._id;
};