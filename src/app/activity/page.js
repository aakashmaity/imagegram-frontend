'use client';

import { useState, useEffect, useMemo } from 'react';
import { Heart, MessageCircle, User, Bell } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { axiosInstance } from '@/api';
import { useAuth } from '@/hooks';
import { getSocket } from '@/utils/socket';

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const mapNotificationToActivity = (n) => {
    const base = {
      id: n._id || crypto.randomUUID(),
      timestamp: new Date(n.createdAt || Date.now()),
      user: {
        name: n?.sender?.username || 'Someone',
        avatar: null,
      },
    };

    switch (n.type) {
      case 'LIKE_POST':
        return { ...base, type: 'like', post: { id: n.entityId, caption: n.message } };
      case 'LIKE_COMMENT':
        return { ...base, type: 'like', post: { id: n.entityId, caption: n.message } };
      case 'COMMENT_POST':
        return { ...base, type: 'comment', post: { id: n.entityId, caption: n.message }, comment: { text: n.message } };
      case 'FOLLOW_USER':
        return { ...base, type: 'follow' };
      default:
        return { ...base, type: 'other' };
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchInitial = async () => {
      try {
        if (!isAuthenticated) {
          setActivities([]);
          setLoading(false);
          return;
        }
        const res = await axiosInstance.get('/notifications/me');
        const items = (res?.data?.data?.notifications || res?.data?.notifications || [])
          .map(mapNotificationToActivity);
        if (!cancelled) {
          setActivities(items);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load notifications', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchInitial();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();
    const handleNotification = (n) => {
      setActivities((prev) => [mapNotificationToActivity(n), ...prev]);
    };
    socket.on('getNotification', handleNotification);
    return () => {
      socket.off('getNotification', handleNotification);
    };
  }, [isAuthenticated]);

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
        return `liked your post "${activity.post.caption}"`;
      case 'comment':
        return `commented "${activity.comment.text}" on your post`;
      case 'follow':
        return 'started following you';
      default:
        return 'interacted with your content';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading activity...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Activity
            </h1>
            <p className="text-muted-foreground">
              See what&apos;s happening with your posts and followers
            </p>
          </div>

          <div className="space-y-4">
            {activities.length === 0 ? (
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
              activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-semibold">{activity.user.name}</span>
                              {' '}
                              <span className="text-muted-foreground">
                                {getActivityText(activity)}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
