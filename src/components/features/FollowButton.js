"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { followUser as followUserRequest, unfollowUser as unfollowUserRequest } from "@/services/userService";

/**
 * Follow/Unfollow Button with optimistic UI updates.
 *
 * Props:
 * - targetUser: user object to follow/unfollow (must contain _id and optionally followers array)
 * - currentUser: logged-in user object (must contain _id and optionally following array)
 * - onTargetUserUpdate: function(newTargetUser) -> void, to update target user locally (optional)
 * - onAuthUserUpdate: function(partialAuthUser) -> void, to update auth user locally (optional)
 * - size/variant/disabled: forwarded to Button
 */
export default function FollowButton({
  targetUser,
  currentUser,
  onTargetUserUpdate,
  onAuthUserUpdate,
  size = "sm",
  variant = "default",
  disabled = false,
  className,
}) {
  const [submitting, setSubmitting] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id;
  const targetUserId = targetUser?._id || targetUser?.id;

  const isFollowing = useMemo(() => {
    if (!currentUserId || !targetUserId) return false;

    const targetFollowers = Array.isArray(targetUser?.followers)
      ? targetUser.followers.map(String)
      : [];

    const authFollowing = Array.isArray(currentUser?.following)
      ? currentUser.following.map(String)
      : [];

    return targetFollowers.includes(String(currentUserId)) || authFollowing.includes(String(targetUserId));
  }, [currentUserId, targetUserId, targetUser?.followers, currentUser?.following]);

  const applyOptimistic = useCallback(
    (nextIsFollowing) => {
      if (typeof onTargetUserUpdate === "function") {
        onTargetUserUpdate((prev) => {
          const safePrev = prev ?? targetUser ?? {};
          const prevFollowers = Array.isArray(safePrev.followers) ? safePrev.followers.map(String) : [];

          let nextFollowers;
          if (nextIsFollowing) {
            if (!prevFollowers.includes(String(currentUserId))) {
              nextFollowers = [...prevFollowers, String(currentUserId)];
            } else {
              nextFollowers = prevFollowers;
            }
          } else {
            nextFollowers = prevFollowers.filter((id) => String(id) !== String(currentUserId));
          }

          return { ...safePrev, followers: nextFollowers };
        });
      }

      if (typeof onAuthUserUpdate === "function") {
        const prevFollowing = Array.isArray(currentUser?.following)
          ? currentUser.following.map(String)
          : [];

        let nextFollowing;
        if (nextIsFollowing) {
          if (!prevFollowing.includes(String(targetUserId))) {
            nextFollowing = [...prevFollowing, String(targetUserId)];
          } else {
            nextFollowing = prevFollowing;
          }
        } else {
          nextFollowing = prevFollowing.filter((id) => String(id) !== String(targetUserId));
        }

        onAuthUserUpdate({ following: nextFollowing });
      }
    },
    [onTargetUserUpdate, onAuthUserUpdate, currentUser?.following, currentUserId, targetUser, targetUserId]
  );

  const handleClick = useCallback(
    async (e) => {
      if (e && typeof e.stopPropagation === "function") {
        e.stopPropagation();
        if (typeof e.preventDefault === "function") e.preventDefault();
      }

      if (!currentUserId || !targetUserId || submitting || disabled) return;
      setSubmitting(true);

      // Optimistic toggle
      const willFollow = !isFollowing;
      applyOptimistic(willFollow);

      try {
        if (willFollow) {
          await followUserRequest({ currentUserId, targetUserId });
        } else {
          await unfollowUserRequest({ currentUserId, targetUserId });
        }
      } catch (err) {
        // Revert on failure
        applyOptimistic(!willFollow);
      } finally {
        setSubmitting(false);
      }
    },
    [applyOptimistic, currentUserId, disabled, isFollowing, submitting, targetUserId]
  );

  if (!currentUserId || !targetUserId || String(currentUserId) === String(targetUserId)) {
    return null;
  }

  return (
    <Button
      size={size}
      variant={isFollowing ? "outline" : variant}
      disabled={submitting || disabled}
      onClick={handleClick}
      className={className}
    >
      {submitting ? (isFollowing ? "Unfollowing..." : "Following...") : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}

