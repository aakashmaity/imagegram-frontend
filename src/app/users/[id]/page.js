"use client";

import { use, useState, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import PostCard from "@/components/features/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Mail, User, Camera, RefreshCw } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useAuth, usePosts } from "@/hooks";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/features/FollowButton";

function UserLoadingSkeleton() {
  return (
    <Card className="mb-8">
      <CardContent className="p-6 animate-pulse">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 w-full">
            <div className="w-20 h-20 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>

        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/4" />
        </div>
      </CardContent>
    </Card>
  );
}

function PostsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="w-full aspect-square bg-muted animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-1/3 bg-muted rounded" />
            <div className="h-3 w-2/3 bg-muted rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ProfileSection({
  user,
  isOwner,
  totalPosts,
  currentUser,
  onTargetUserUpdate,
  onAuthUserUpdate,
}) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.avatar} alt={user?.username} />
              <AvatarFallback>
                <User className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user?.fullname || "User"}</h1>
              <p className="text-muted-foreground">
                {user?.fullName || user?.username}
              </p>
              {user?.bio && (
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.bio}
                </p>
              )}
            </div>
          </div>
          {isOwner ? (
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          ) : (
            <FollowButton
              targetUser={user}
              currentUser={currentUser}
              onTargetUserUpdate={onTargetUserUpdate}
              onAuthUserUpdate={onAuthUserUpdate}
              size="sm"
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalPosts}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Array.isArray(user?.followers)
                ? user.followers.length
                : user?.followers ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Array.isArray(user?.following)
                ? user.following.length
                : user?.following ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {user?.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>
              Joined{" "}
              {user?.joinDate
                ? new Date(user.joinDate).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "Recently"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostsSection({
  posts = [],
  currentUser,
  hasMore,
  loadMorePosts,
  onDelete,
  onUpdate,
  postLoading,
  handleReactionChange,
}) {
  if (posts?.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Camera className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No posts yet</h3>
          <p className="text-muted-foreground">No shared posts available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={currentUser?._id}
          onUpdate={onUpdate}
          onReactionChange={handleReactionChange}
          onDelete={onDelete}
          showOwnerActions={true}
        />
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center py-8">
          <Button
            onClick={loadMorePosts}
            disabled={postLoading}
            variant="outline"
            className="w-full"
          >
            {postLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Posts"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function UserPage({ params }) {
  const { id } = use(params);
  const userId = id;

  const {
    loading: userLoading,
    error: userError,
    user,
    setUser: setTargetUser,
  } = useUser(userId);
  const {
    posts,
    hasMore,
    loadMorePosts,
    loading: postLoading,
    error: postError,
    deletePost: deletePostHandler,
    updatePost: updatePostHandler,
    handleReactionChange,
  } = usePosts(userId);

  const { user: currentUser, setUser: setCurrentUser } = useAuth();

  const handleTargetUserUpdate = useCallback((updater) => {
    setTargetUser((prev) => {
      const nextUser = typeof updater === "function" ? updater(prev) : updater;
      return nextUser;
    });
  }, [setTargetUser]);

  const handleAuthUserUpdate = useCallback((updater) => {
    setCurrentUser((prev) => {
      const nextUser = typeof updater === "function" ? updater(prev) : updater;
      return nextUser;
    });
  }, [setCurrentUser]);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto py-8 px-4">
          {userError ? (
            <Card className="mb-8">
              <CardContent className="p-6">
                <p className="text-sm text-red-500">No user found</p>
              </CardContent>
            </Card>
          ) : userLoading ? (
            <UserLoadingSkeleton />
          ) : (
            <ProfileSection
              totalPosts={posts?.length}
              user={user}
              isOwner={user?._id === currentUser?._id}
              currentUser={currentUser}
              onTargetUserUpdate={handleTargetUserUpdate}
              onAuthUserUpdate={handleAuthUserUpdate}
            />
          )}

          <div className="mb-6">
            {postError ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-red-500">No posts</p>
                </CardContent>
              </Card>
            ) : postLoading ? (
              <PostsLoadingSkeleton />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Posts</h2>
                </div>
                <PostsSection
                  posts={posts}
                  currentUser={currentUser}
                  onDelete={deletePostHandler}
                  onUpdate={updatePostHandler}
                  hasMore={hasMore}
                  loadMorePosts={loadMorePosts}
                  postLoading={postLoading}
                  handleReactionChange={handleReactionChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}