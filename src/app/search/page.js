"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/features/FollowButton";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { searchUsers, userList, loading: usersLoading } = useUser();

  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);

    // Fetch matching users from backend
    await searchUsers(searchQuery);
  };

  const handleViewUserPage = async(userId) => {
    if(userId){
      window.location.href = `/users/${userId}`;
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Discover</h1>
            <p className="text-muted-foreground">
              Find amazing posts and connect with creators
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users by username or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                type="submit"
                disabled={usersLoading || !searchQuery.trim()}
              >
                {usersLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>

          {/* Search results */}
          {hasSearched && (
            <div className="space-y-6">
              {usersLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="bg-card/70 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 animate-pulse">
                          <div className="w-10 h-10 rounded-full bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-muted rounded" />
                            <div className="h-3 w-1/4 bg-muted rounded" />
                          </div>
                          <div className="h-8 w-24 bg-muted rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (userList?.length || 0) === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">No users found</h2>
                  <p className="text-muted-foreground">
                    Try a different name or username
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userList?.map((u) => (
                    <Card
                      key={u._id}
                      className="bg-card/70 border-border/50 hover:bg-accent/60 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/users/${u._id}`}
                            className="flex items-center space-x-3"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={u.avatar} alt={u.username} />
                              <AvatarFallback>
                                {u.username?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{u?.fullname || u.username}</div>
                              <div className="text-sm text-muted-foreground">
                                {u.username}
                              </div>
                            </div>
                          </Link>
                          <Button variant="secondary" size="sm" onClick={() => handleViewUserPage(u._id)}>
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state when no search has been performed */}
          {!hasSearched && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Start exploring</h2>
              <p className="text-muted-foreground">
                Search for posts, captions, or descriptions to discover amazing
                content
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
