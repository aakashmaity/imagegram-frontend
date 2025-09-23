"use client";

import { Settings, Edit, Camera, User, Mail, Calendar } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PostCard from "@/components/features/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, usePosts } from "@/hooks";

export default function ProfilePage() {
  const { user, loading: userLoading } = useAuth();
  const {
    posts,
    loading: postsLoading,
    handleReactionChange,
    updatePost,
    deletePost,
  } = usePosts();

  const userPosts = posts?.filter((post) => post.user?._id === user._id);


  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto py-8 px-4">
          {/* Profile Header */}
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
                    <h1 className="text-2xl font-bold">{user?.fullname}</h1>
                    <p className="text-muted-foreground">{user?.username}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user?.bio}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {user?.posts ??
                      (Array.isArray(user?.postIds) ? user.postIds.length : 0)}
                  </div>
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

              {/* Additional Info */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {user?.joinDate?.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    }) || "Recently"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Posts</h2>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {postsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Loading posts...</p>
              </div>
            ) : userPosts?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Share your first moment with the world
                  </p>
                  <Button>
                    <Camera className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {userPosts?.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUserId={user?._id}
                    onUpdate={updatePost}
                    onReactionChange={handleReactionChange}
                    onDelete={deletePost}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
