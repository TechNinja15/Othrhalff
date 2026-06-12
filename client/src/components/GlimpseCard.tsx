import React, { useState, useEffect, useRef } from 'react';
import { Heart, Flame, Sparkles, Tv, BadgeCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getOptimizedUrl } from '../utils/image';

interface GlimpseCardProps {
  glimpse: {
    id: string;
    user_id: string;
    image_path: string;
    caption: string | null;
    university: string;
    created_at: string;
    profiles: {
      id: string;
      real_name: string | null;
      anonymous_id: string;
      avatar: string | null;
      is_verified: boolean;
      university: string;
    } | null;
  };
  currentUser: any;
  initialReactions: { reaction_type: string; user_id: string }[];
  onOpenLobby: () => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export const GlimpseCard: React.FC<GlimpseCardProps> = ({
  glimpse,
  currentUser,
  initialReactions,
  onOpenLobby,
}) => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const lastTap = useRef<number>(0);

  // States for reactions
  const [heartsCount, setHeartsCount] = useState(0);
  const [firesCount, setFiresCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);

  const [isHearted, setIsHearted] = useState(false);
  const [isFired, setIsFired] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Sync initial reactions from parent/database
  useEffect(() => {
    if (initialReactions) {
      const heartsList = initialReactions.filter(r => r.reaction_type === 'heart');
      const firesList = initialReactions.filter(r => r.reaction_type === 'fire');
      const likesList = initialReactions.filter(r => r.reaction_type === 'like');

      setHeartsCount(heartsList.length);
      setFiresCount(firesList.length);
      setLikesCount(likesList.length);

      if (currentUser) {
        setIsHearted(heartsList.some(r => r.user_id === currentUser.id));
        setIsFired(firesList.some(r => r.user_id === currentUser.id));
        setIsLiked(likesList.some(r => r.user_id === currentUser.id));
      }
    }
  }, [initialReactions, currentUser]);

  // Handle reaction updates in DB
  const toggleReaction = async (reactionType: 'heart' | 'fire' | 'like') => {
    if (!currentUser || !supabase) return;

    let currentlyActive = false;
    if (reactionType === 'heart') currentlyActive = isHearted;
    else if (reactionType === 'fire') currentlyActive = isFired;
    else if (reactionType === 'like') currentlyActive = isLiked;

    // Optimistic Update
    if (reactionType === 'heart') {
      setIsHearted(!isHearted);
      setHeartsCount(prev => isHearted ? prev - 1 : prev + 1);
    } else if (reactionType === 'fire') {
      setIsFired(!isFired);
      setFiresCount(prev => isFired ? prev - 1 : prev + 1);
    } else if (reactionType === 'like') {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    }

    try {
      if (currentlyActive) {
        // Delete reaction
        const { error } = await supabase
          .from('glimpse_reactions')
          .delete()
          .eq('glimpse_id', glimpse.id)
          .eq('user_id', currentUser.id)
          .eq('reaction_type', reactionType);

        if (error) throw error;
      } else {
        // Insert reaction
        const { error } = await supabase
          .from('glimpse_reactions')
          .insert({
            glimpse_id: glimpse.id,
            user_id: currentUser.id,
            reaction_type: reactionType,
          });

        if (error) throw error;
      }
    } catch (err) {
      console.error(`Error toggling reaction ${reactionType}:`, err);
      // Revert optimistic update on failure
      if (reactionType === 'heart') {
        setIsHearted(currentlyActive);
        setHeartsCount(prev => currentlyActive ? prev + 1 : prev - 1);
      } else if (reactionType === 'fire') {
        setIsFired(currentlyActive);
        setFiresCount(prev => currentlyActive ? prev + 1 : prev - 1);
      } else if (reactionType === 'like') {
        setIsLiked(currentlyActive);
        setLikesCount(prev => currentlyActive ? prev + 1 : prev - 1);
      }
    }
  };

  // Double-tap handler
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      handleDoubleTap(e);
    }
    lastTap.current = now;
  };

  const handleDoubleTap = async (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Get tap coordinates relative to card
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 2. Add floating heart animation
    const newHeart: FloatingHeart = { id: Date.now(), x, y };
    setHearts(prev => [...prev, newHeart]);

    // Cleanup heart after animation
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 800);

    // 3. Record heart reaction in DB if not already hearted
    if (!isHearted && currentUser && supabase) {
      setIsHearted(true);
      setHeartsCount(prev => prev + 1);

      try {
        const { error } = await supabase
          .from('glimpse_reactions')
          .insert({
            glimpse_id: glimpse.id,
            user_id: currentUser.id,
            reaction_type: 'heart',
          });

        // If unique constraint violated (already exists), ignore. Otherwise throw.
        if (error && error.code !== '23505') {
          throw error;
        }
      } catch (err) {
        console.error('Error recording double-tap heart:', err);
        setIsHearted(false);
        setHeartsCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  // Resolve storage path to public url
  const imageUrl = glimpse.image_path.startsWith('http')
    ? glimpse.image_path
    : supabase
      ? supabase.storage.from('glimpses').getPublicUrl(glimpse.image_path).data.publicUrl
      : '';

  return (
    <div
      onClick={handleCardClick}
      className="relative w-full h-[100dvh] bg-black overflow-hidden flex items-center justify-center story-card select-none"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-heart {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0;
          }
          15% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.9;
          }
          30% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -120px) scale(1.4);
            opacity: 0;
          }
        }
        .animate-float-heart {
          animation: float-heart 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      ` }} />

      {/* Floating Hearts Layer */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          style={{ left: heart.x, top: heart.y }}
          className="absolute z-40 pointer-events-none text-neon filter drop-shadow-[0_0_12px_#ff007f] animate-float-heart"
        >
          <Heart className="w-20 h-20 fill-neon text-neon" strokeWidth={1} />
        </div>
      ))}

      {/* Story Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Glimpse"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-950 flex items-center justify-center text-gray-700">
          Loading content...
        </div>
      )}

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none z-10" />

      {/* Glassmorphic Profile & Caption Card */}
      <div className="absolute left-4 right-20 bottom-24 md:bottom-8 z-20 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col gap-2 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500">
        {/* User Credentials */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-gray-950 flex-shrink-0">
            {glimpse.profiles?.avatar ? (
              <img
                src={getOptimizedUrl(glimpse.profiles.avatar, 64)}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neon/10 flex items-center justify-center text-neon text-xs font-bold font-mono">
                {glimpse.profiles?.anonymous_id?.slice(-2).toUpperCase() || '??'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-white truncate">
                {glimpse.profiles?.real_name || 'Anonymous'}
              </span>
              {glimpse.profiles?.is_verified && (
                <BadgeCheck className="w-4 h-4 text-[#60a5fa] drop-shadow-[0_0_4px_rgba(96,165,250,0.6)]" fill="currentColor" stroke="black" strokeWidth={1.5} />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
              <span className="truncate">@{glimpse.profiles?.anonymous_id || 'guest'}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span className="truncate text-neon/95">{glimpse.profiles?.university || glimpse.university}</span>
            </div>
          </div>
        </div>

        {/* Caption */}
        {glimpse.caption && (
          <p className="text-sm text-gray-200 leading-relaxed font-medium mt-1">
            {glimpse.caption}
          </p>
        )}

        {/* Timestamp */}
        <span className="text-[9px] text-gray-500 font-mono mt-0.5">
          {new Date(glimpse.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(glimpse.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Floating Interaction Panel (Right) */}
      <div className="absolute right-4 bottom-24 md:bottom-8 z-20 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-right-5 duration-500">
        {/* Heart Reaction */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleReaction('heart');
          }}
          className="flex flex-col items-center group active:scale-75 transition-transform duration-150"
          aria-label="React with Heart"
        >
          <div className={`p-3 rounded-full border backdrop-blur-md transition-all duration-300 shadow-lg
            ${isHearted
              ? 'bg-neon border-neon text-white shadow-[0_0_15px_#ff007f]'
              : 'bg-black/40 border-white/10 text-white hover:border-neon/50 hover:text-neon'
            }`}
          >
            <Heart
              className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${isHearted ? 'fill-white animate-pulse' : ''}`}
              strokeWidth={2.2}
            />
          </div>
          <span className="text-xs font-mono font-bold text-gray-300 mt-1.5 drop-shadow-md">
            {heartsCount}
          </span>
        </button>

        {/* Flame Reaction */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleReaction('fire');
          }}
          className="flex flex-col items-center group active:scale-75 transition-transform duration-150"
          aria-label="React with Fire"
        >
          <div className={`p-3 rounded-full border backdrop-blur-md transition-all duration-300 shadow-lg
            ${isFired
              ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_15px_#ff7f00]'
              : 'bg-black/40 border-white/10 text-white hover:border-orange-500/50 hover:text-orange-500'
            }`}
          >
            <Flame
              className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${isFired ? 'fill-white animate-pulse' : ''}`}
              strokeWidth={2.2}
            />
          </div>
          <span className="text-xs font-mono font-bold text-gray-300 mt-1.5 drop-shadow-md">
            {firesCount}
          </span>
        </button>

        {/* Sparkles/Like Reaction */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleReaction('like');
          }}
          className="flex flex-col items-center group active:scale-75 transition-transform duration-150"
          aria-label="React with Sparkles"
        >
          <div className={`p-3 rounded-full border backdrop-blur-md transition-all duration-300 shadow-lg
            ${isLiked
              ? 'bg-purple-500 border-purple-500 text-white shadow-[0_0_15px_#a855f7]'
              : 'bg-black/40 border-white/10 text-white hover:border-purple-500/50 hover:text-purple-500'
            }`}
          >
            <Sparkles
              className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${isLiked ? 'fill-white animate-pulse' : ''}`}
              strokeWidth={2.2}
            />
          </div>
          <span className="text-xs font-mono font-bold text-gray-300 mt-1.5 drop-shadow-md">
            {likesCount}
          </span>
        </button>

        {/* Duo Dates / Vibe Rooms */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenLobby();
          }}
          className="flex flex-col items-center group active:scale-75 transition-transform duration-150"
          aria-label="Open Vibe Rooms"
        >
          <div className="p-3 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 backdrop-blur-md transition-all duration-300 shadow-lg hover:bg-cyan-500 hover:text-white hover:border-transparent hover:shadow-[0_0_15px_#06b6d4]">
            <Tv
              className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
              strokeWidth={2.2}
            />
          </div>
          <span className="text-[10px] font-bold text-cyan-400 mt-1.5 uppercase tracking-wider drop-shadow-md">
            Lobby
          </span>
        </button>
      </div>
    </div>
  );
};
