'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser } from '@/services/userService';

const FollowButton = ({
  targetUserId,
  initialIsFollowing = false,
  initialFollowersCount = 0,
  disabled = false,
  size = 'sm',
  variant,
  onChange,
}) => {
  const [isFollowing, setIsFollowing] = useState(!!initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(Number(initialFollowersCount) || 0);
  const [loading, setLoading] = useState(false);

  const buttonLabel = useMemo(() => {
    if (loading) return isFollowing ? 'Unfollowing...' : 'Following...';
    return isFollowing ? 'Unfollow' : 'Follow';
  }, [isFollowing, loading]);

  const buttonVariant = useMemo(() => {
    if (variant) return variant;
    return isFollowing ? 'secondary' : 'default';
  }, [variant, isFollowing]);

  const handleToggle = async (e) => {
    e?.preventDefault?.();
    if (!targetUserId || loading || disabled) return;

    const nextFollowing = !isFollowing;
    const previousCount = followersCount;

    // optimistic update
    setIsFollowing(nextFollowing);
    setFollowersCount((c) => (nextFollowing ? c + 1 : Math.max(0, c - 1)));
    setLoading(true);

    try {
      const result = nextFollowing ? await followUser(targetUserId) : await unfollowUser(targetUserId);
      if (!result?.success) {
        // revert on failure
        setIsFollowing(isFollowing);
        setFollowersCount(previousCount);
      }
      onChange?.({ isFollowing: nextFollowing, followersCount: nextFollowing ? previousCount + 1 : Math.max(0, previousCount - 1) });
    } catch (err) {
      setIsFollowing(isFollowing);
      setFollowersCount(previousCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button size={size} variant={buttonVariant} disabled={loading || disabled} onClick={handleToggle}>
        {buttonLabel}
      </Button>
      <span className="text-xs text-muted-foreground">{followersCount.toLocaleString()}</span>
    </div>
  );
};

export default FollowButton;

