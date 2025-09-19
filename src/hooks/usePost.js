import { useCallback, useEffect, useState } from "react";
import { getPostById } from "@/services/postService";

export const usePost = (postId) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPost = useCallback(async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const result = await getPostById(id);
      if (result.success) {
        // API may return { post } or the post directly; normalize
        const data = result.data?.post || result.data;
        setPost(data);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch post");
      }
    } catch (err) {
      setError("Failed to fetch post");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPost(postId);
  }, [fetchPost, postId]);

  return { post, loading, error, fetchPost, setPost };
};

