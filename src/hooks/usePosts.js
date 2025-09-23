import { useState, useEffect, useCallback } from "react";
import {
  getALLPosts,
  createPost,
  updatePost,
  deletePost,
  getPostsMadeByUser,
  getPostById
} from "@/services/postService";
import {
  createPostLike,
  deletePostLike,
  updatePostLike,
} from "@/services/likeService";

export const usePosts = (userId, initialOffset = 0, initialLimit = 10, options = {}) => {
  const { initialFetch = true } = options;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [singlePost, setSinglePost] = useState(null);
  const [singlePostLoading, setSinglePostLoading] = useState(false);
  const [singlePostError, setSinglePostError] = useState(null);

  const fetchPosts = useCallback(
    async (userId, offset = initialOffset, limit = initialLimit) => {
      try {
        setLoading(true);

        let result = userId
          ? await getPostsMadeByUser(userId, offset, limit)
          : await getALLPosts(offset, limit);

        if (result.success) {
          setPosts(result.data.posts);
          setError(null);
          setHasMore(result.data.totalDocuments > result.data.posts.length);
        } else {
          setError(result.error.message);
        }
      } catch (err) {
        setError("Failed to fetch posts");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    },
    [initialOffset, initialLimit]
  );

  const fetchPostById = useCallback(async (id) => {
    if (!id) return;
    try {
      setSinglePostLoading(true);
      const result = await getPostById(id);
      console.log("result", result)
      if (result.success) {
        const data = result.data?.post;
        setSinglePost(data);
        setSinglePostError(null);
      } else {
        setSinglePostError(result.error?.message || "Failed to fetch post");
      }
    } catch (err) {
      setSinglePostError("Failed to fetch post");
    } finally {
      setSinglePostLoading(false);
    }
  }, []);

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const offset = posts?.length || 0;
      const result = userId
        ? await getPostsMadeByUser(userId, offset, initialLimit)
        : await getALLPosts(offset, initialLimit);

      if (result.success) {
        setPosts((prev) => [...prev, ...result.data.posts]);
        const totalDocuments = result.data.totalDocuments ?? 0;
        const accumulatedCount = offset + (result.data.posts?.length ?? 0);
        setHasMore(accumulatedCount < totalDocuments);
      } else {
        setError(result.error?.message || "Failed to load more posts");
        return;
      }
    } catch (err) {
      setError("Failed to fetch more posts");
    } finally {
      setLoading(false);
    }
  };

  const createPostHandler = async (postData) => {
    try {
      const result = await createPost(postData);
      if (result.success) {
        setPosts((prev) => [result.data, ...prev]);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: "Failed to create post" };
    }
  };

  const updatePostHandler = async (postId, postData) => {
    try {
      const result = await updatePost(postId, postData);
      if (result.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, ...result.data } : post
          )
        );
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: "Failed to update post" };
    }
  };

  const deletePostHandler = async (postId) => {
    try {
      const result = await deletePost(postId);
      if (result.success) {
        const postList = posts.filter((post) => post?._id !== postId);
        setPosts(postList);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: "Failed to delete post" };
    }
  };

  const handleReactionChange = async ({
    onModel,
    likableId,
    reactionType,
    previousUserReaction,
  }) => {
    try {
      let apiResponse;

      if (!previousUserReaction) {
        apiResponse = await createPostLike(onModel, likableId, reactionType);
      } else if (previousUserReaction.likeType !== reactionType) {
        apiResponse = await updatePostLike(
          previousUserReaction._id,
          onModel,
          likableId,
          reactionType
        );
      } else {
        apiResponse = await deletePostLike(
          previousUserReaction._id,
          onModel,
          likableId
        );
      }

      if (!apiResponse?.success) {
        return {
          success: false,
          error: apiResponse?.error || "Reaction request failed",
        };
      }

      const returnedLike = apiResponse?.data?.data || apiResponse?.data || null;

      setPosts((prev) =>
        prev.map((post) => {
          if (post._id !== likableId) return post;

          // likes is an array of like objects
          const previousLike = previousUserReaction;
          let updatedLikes = Array.isArray(post.likes) ? [...post.likes] : [];
          let updatedCurrentUserLike = post?.currentUserLike || null;

          if (!previousLike) {
            // created
            if (returnedLike) {
              updatedLikes.push(returnedLike);
              updatedCurrentUserLike = returnedLike;
            }
          } else if (previousLike.likeType !== reactionType) {
            // updated
            updatedLikes = updatedLikes.map((like) =>
              like._id === previousLike._id
                ? { ...like, likeType: reactionType }
                : like
            );
            updatedCurrentUserLike = {
              ...previousLike,
              likeType: reactionType,
            };
          } else {
            // deleted
            updatedLikes = updatedLikes.filter(
              (like) => like._id !== previousLike._id
            );
            updatedCurrentUserLike = null;
          }

          return {
            ...post,
            likes: updatedLikes,
            currentUserLike: updatedCurrentUserLike,
          };
        })
      );

      return { success: true };
    } catch (err) {
      console.error("Failed to update reaction", err);
      return { success: false, error: "Failed to update reaction" };
    }
  };

  useEffect(() => {
    if (initialFetch) {
      fetchPosts(userId);
    }
  }, [fetchPosts, userId, initialFetch]);


  return {
    posts,
    loading,
    error,
    hasMore,
    fetchPosts,
    loadMorePosts,
    createPost: createPostHandler,
    updatePost: updatePostHandler,
    deletePost: deletePostHandler,
    handleReactionChange,
    singlePost,
    singlePostLoading,
    singlePostError,
    fetchPostById,
  };
};
