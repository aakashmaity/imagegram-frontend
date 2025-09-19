'use client';

import { use } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import PostCard from '@/components/features/PostCard';
import { useAuth, usePost } from '@/hooks';

function PostLoadingSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="w-full aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-3 w-2/3 bg-muted rounded" />
      </div>
    </Card>
  );
}

export default function PostPage({ params }) {
  const { postId } = use(params);
  const { user: currentUser } = useAuth();
  const { post, loading, error } = usePost(postId);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto py-8 px-4">
          {error ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Post not found</h3>
                    <p className="text-sm text-muted-foreground">The post you are looking for does not exist or was removed.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : loading ? (
            <PostLoadingSkeleton />
          ) : post ? (
            <PostCard
              post={post}
              currentUserId={currentUser?._id}
              showOwnerActions={false}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="w-5 h-5 mx-auto mb-2" />
              Loading...
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

