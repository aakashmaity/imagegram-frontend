"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Heart, Smile, PartyPopper, Angry, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { REACTION_CONFIG } from "@/constants";


const HOVER_HIDE_DELAY_MS = 150;

const LikeButton = ({
  postId,
  initialReactions = [], // array of likes
  onReactionChange,
  className,
  userReaction = null,
  currentUserId,
}) => {

  const [reactions, setReactions] = useState(initialReactions);
  const [currentUserReaction, setCurrentUserReaction] = useState(userReaction?.likeType || null);
  const [showReactions, setShowReactions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileReactions, setShowMobileReactions] = useState(false);

  const containerRef = useRef(null);
  const timeoutRef = useRef(null);


  const iconMap = useMemo(
    () => ({
      Heart,
      PartyPopper,
      Smile,
      Angry,
    }),
    []
  );

  // total likes (simply array length)
  const totalReactions = useMemo(() => reactions?.length || 0, [reactions]);

  // keep in sync if parent updates post
  useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);


  useEffect(() => {
    const timeoutAtMount = timeoutRef.current;
    return () => {
      if (timeoutAtMount) clearTimeout(timeoutAtMount);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isLoading) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowReactions(true);
  }, [isLoading]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, HOVER_HIDE_DELAY_MS);
  }, []);

  const handleButtonClick = useCallback((e) => {
    e.preventDefault();
    if (isLoading) return;
    setShowMobileReactions((prev) => !prev);
  }, [isLoading]);

  
  const handleReaction = useCallback(
    async (reactionType) => {
      if (isLoading) return;
      setIsLoading(true);

      const previousUserReaction = currentUserReaction;
      let updatedReactions = Array.isArray(reactions) ? [...reactions] : [];

      try {
        // prevent further interaction during the request
        setShowReactions(false);
        setShowMobileReactions(false);
        if (previousUserReaction === reactionType) {
          // remove user's reaction
          updatedReactions = updatedReactions.filter(
            (like) => like.user?._id !== currentUserId
          );
          await onReactionChange?.(postId, reactionType, false, userReaction);
          setCurrentUserReaction(null);
        } else {
          // replace previous reaction with new one
          updatedReactions = updatedReactions.filter(
            (like) => like.user?._id !== currentUserId && like.userId !== currentUserId
          );
          updatedReactions.push({ userId: currentUserId, user: { _id: currentUserId }, likeType: reactionType });
          await onReactionChange?.(postId, reactionType, true, userReaction);
          setCurrentUserReaction(reactionType);
        }

        setReactions(updatedReactions);
        setShowReactions(false);
      } catch (error) {
        console.error("Error handling reaction:", error);
        // Revert to previous state on error
        setReactions(initialReactions || []);
        setCurrentUserReaction(userReaction?.likeType || null);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, reactions, currentUserReaction, currentUserId, postId, onReactionChange, initialReactions, userReaction]
  );

  const handleMobileReaction = useCallback(
    (reactionType) => {
      handleReaction(reactionType);
      setShowMobileReactions(false);
    },
    [handleReaction]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowMobileReactions(false);
      }
    };
    if (showMobileReactions) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMobileReactions]);


    // Reusable components
  const ReactionButton = ({
    type,
    icon,
    color,
    label,
    isUserReaction,
    onClick,
    size = "w-12 h-12",
    iconSize = "w-6 h-6",
  }) => {
    const IconComponent = iconMap[icon] || Heart;

    return (
      <button
        onClick={onClick}
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-200 active:scale-95",
          "bg-secondary/70 hover:bg-secondary border border-border/60 hover:border-border",
          "shadow-sm hover:shadow-md",
          color,
          isUserReaction && "ring-2 ring-blue-500 scale-110 bg-accent",
          size
        )}
        title={label}
        disabled={isLoading}
      >
        <IconComponent
          className={cn(iconSize, isUserReaction && "fill-current")}
        />
      </button>
    );
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center space-x-2">
        {/* Like Button */}
        <div
          ref={containerRef}
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center space-x-1 hover:bg-accent/80 transition-colors duration-200 active:scale-95",
              currentUserReaction && "text-blue-500",
              // Accessible touch target on small screens
              "min-h-11 min-w-11 rounded-full"
            )}
            disabled={isLoading}
            onClick={handleButtonClick}
          >
            {currentUserReaction ? (
              (() => {
                const config = REACTION_CONFIG.find(
                  (r) => r.type === currentUserReaction
                );
                const IconComponent = iconMap[config?.icon] || ThumbsUp;
                return <IconComponent className={`w-5 h-5 ${config?.color}`} />;
              })()
            ) : (
              <ThumbsUp className="w-5 h-5" />
            )}
          </Button>

          {/* Desktop popup (md and up) */}
         {showReactions && (
            <div
              className="hidden md:flex absolute bottom-full left-0 mb-1 bg-popover/95 backdrop-blur-sm border border-border/60 rounded-2xl shadow-xl p-2 items-center space-x-1 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {REACTION_CONFIG.map(({ type, icon, color, label }) => (
                <ReactionButton
                  key={type}
                  type={type}
                  icon={icon}
                  color={color}
                  label={label}
                  isUserReaction={currentUserReaction === type}
                  onClick={() => handleReaction(type)}
                  className="hover:scale-125"
                />
              ))}
            </div>
          )}


          {/* Mobile popup (below md) */}
          {showMobileReactions && (
            <div className="md:hidden absolute bottom-full left-0 mb-2 bg-popover/95 backdrop-blur-sm border border-border/60 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  {REACTION_CONFIG.map(({ type, icon, color, label }) => (
                    <ReactionButton
                      key={type}
                      type={type}
                      icon={icon}
                      color={color}
                      label={label}
                      isUserReaction={currentUserReaction === type}
                      onClick={() => handleMobileReaction(type)}
                      size="w-14 h-14"
                      iconSize="w-7 h-7"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Only show total reactions */}
        {totalReactions > 0 && (
          <span
            className={cn(
              "text-muted-foreground font-medium",
              "text-xs md:text-sm"
            )}
          >
            {totalReactions}
          </span>
        )}
      </div>
    </div>
  );
};

export default LikeButton;
