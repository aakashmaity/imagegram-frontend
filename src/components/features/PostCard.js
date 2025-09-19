'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MessageCircle, Share, MoreHorizontal, User, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { cn } from '@/utils';

const PostCard = ({ 
  post, 
  className,
  showOwnerActions = false,
  currentUserId,
  onDelete,
  onUpdate,
  onReactionChange,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caption, setCaption] = useState(post.caption || '');
  const [description, setDescription] = useState(post.description || '');
  const [copied, setCopied] = useState(false);
  const copyResetTimeoutRef = useRef(null);

  // console.log(post)
  const postId = post._id;

  const handleLikeChange = async (postId, reactionType, isActive, previousUserReaction) => {
    setIsLiked(isActive);
    const payload = {
      reactionType,
      isActive,
      previousUserReaction,
      likableId: postId,
      onModel: "Post",
    }
    console.log("handleLikeChange", payload);
    await onReactionChange?.(payload);
  };



  const handleToggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
  };

  const handleEditSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      setIsSubmitting(true);
      const result = await onUpdate?.(postId, { caption, description });
      if (result?.success) {
        // Optimistically reflect local changes
        setIsEditOpen(false);
        setIsMenuOpen(false);
      }
    } catch (err) {
      // no-op: follow existing minimal error handling style
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      const result = await onDelete?.(postId);
      if (result?.success || result === true) {
        setIsDeleteOpen(false);
        setIsMenuOpen(false);
      }
    } catch (err) {
      // no-op
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${origin}/posts/${postId}`;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopied(true);
      if (copyResetTimeoutRef.current) clearTimeout(copyResetTimeoutRef.current);
      copyResetTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // no-op minimal error handling per existing style
    }
  };

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) clearTimeout(copyResetTimeoutRef.current);
    };
  }, []);

  const isOwner = post?.user?._id && currentUserId ? post.user._id === currentUserId : false;
  const canShowOwnerActions = showOwnerActions && isOwner;

  return (
    <Card className={cn(
      "w-full max-w-2xl mx-auto",
      "rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm",
      "shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-border/60">
              <AvatarImage src={post.user?.avatar} alt={post.user?.username} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm hover:text-foreground transition-colors">
                {post.user?.fullname || 'Anonymous'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {canShowOwnerActions && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen((v) => !v)}
                className="hover:bg-accent rounded-full"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-popover text-popover-foreground shadow-lg z-10 overflow-hidden">
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent/80 transition-colors"
                    onClick={() => { setIsEditOpen(true); }}
                  >
                    Edit
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-accent/80 transition-colors"
                    onClick={() => { setIsDeleteOpen(true); }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Image */}
        <div className="relative w-full aspect-square overflow-hidden rounded-t-xl">
          <Image
            src={post.image}
            alt={post.caption}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 will-change-transform hover:scale-[1.02]"
            priority
          />
          {/* subtle gradient overlay for depth */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
        </div>

        {/* Actions */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center space-x-4">
              <LikeButton
                postId={post._id}
                initialReactions={post?.likes || []}
                onReactionChange={handleLikeChange}
                currentUserId={currentUserId}
                userReaction={post?.currentUserLike}
              />
              
            
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleComments}
                className="flex items-center space-x-2 hover:bg-accent rounded-full"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">
                  {post.comments?.length || 0}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                title={copied ? 'Link copied!' : 'Copy post link'}
                className="hover:bg-accent rounded-full"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Share className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Caption */}
          {caption && (
            <div className="space-y-2">
              <p className="text-sm leading-relaxed">
                <span className="font-semibold hover:text-foreground transition-colors">{post.user?.username || 'Anonymous'}</span>
                {' '}
                <span>{caption}</span>
              </p>
              {description && (
                <p className="text-sm text-muted-foreground">{"description"}</p>
              )}
            </div>
          )}

          {/* Comments Section */}
          {showComments && (
            <div className="mt-2 rounded-xl border border-border/60 bg-card/60">
              <CommentSection
                postId={postId}
                initialComments={[]}
                currentUserId={currentUserId}
                className="p-4"
              />
            </div>
          )}
        </div>
      </CardContent>
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption</label>
              <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Update caption" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add an optional description"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save changes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>{isSubmitting ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PostCard;
