'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { getFollowers, getFollowing } from '@/services/userService';

const FollowListDialog = ({ open, onOpenChange, userId, type = 'followers' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    const run = async () => {
      setLoading(true);
      const result = type === 'followers' ? await getFollowers(userId) : await getFollowing(userId);
      if (result.success) {
        const list = result.data?.users || result.data?.[type] || result.data || [];
        setItems(list);
      }
      setLoading(false);
    };
    run();
  }, [open, userId, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">{type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-3 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No {type} yet.</p>
          ) : (
            items.map((u) => (
              <div key={u._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={u.avatar} alt={u.username} />
                    <AvatarFallback>{u.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{u.username}</div>
                    <div className="text-xs text-muted-foreground">{u.fullName || u.username}</div>
                  </div>
                </div>
                <Link href={`/users/${u._id}`}>
                  <Button size="sm" variant="secondary">View</Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;

