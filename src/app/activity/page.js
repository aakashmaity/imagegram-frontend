'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Heart, MessageCircle, User, Bell } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/hooks';

export default function ActivityPage() {
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications({ pageSize: 20, pollMs: 15000 });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <User className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'like':
        return `liked your post`;
      case 'comment':
        return `commented on your post`;
      case 'follow':
        return 'started following you';
      default:
        return 'interacted with your content';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const ts = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const diff = now - ts;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const activities = useMemo(() => notifications || [], [notifications]);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                Activity
              </h1>
              <p className="text-muted-foreground">
                See what&apos;s happening with your posts and followers
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button size="sm" variant="outline" onClick={markAllRead}>
                  Mark all as read ({unreadCount})
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {loading && activities.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Bell className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Loading activity...</h2>
                </CardContent>
              </Card>
            ) : activities.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Bell className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">No activity yet</h2>
                  <p className="text-muted-foreground">
                    When people interact with your posts, you&apos;ll see it here
                  </p>
                </CardContent>
              </Card>
            ) : (
              activities.map((activity) => {
                const id = activity._id || activity.id;
                const actor = activity.actor || activity.user || {};
                const actorName = actor.username || actor.name || 'Someone';
                const actorAvatar = actor.avatar || actor.image || null;
                const createdAt = activity.createdAt || activity.timestamp || new Date();
                const isUnread = activity.read === false || activity.isRead === false;

                const postId = activity.post?.id || activity.post?._id || activity.postId || activity.entity?.postId || activity.entity?.id || activity.entityId;
                const userId = actor._id || actor.id;
                const href = activity.type === 'follow' && userId ? `/users/${userId}` : (postId ? `/posts/${postId}` : '/activity');

                return (
                  <Card key={id} className={isUnread ? 'border-primary/40' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={actorAvatar} alt={actorName} />
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            {getActivityIcon(activity.type)}
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-semibold">{actorName}</span>{' '}
                                <span className="text-muted-foreground">
                                  {getActivityText(activity)}
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTimestamp(createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Link href={href} onClick={() => markRead(id)}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <Button onClick={loadMore} variant="outline">
                {loading ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
