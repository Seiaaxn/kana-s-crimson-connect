import { useState } from 'react';
import { Heart } from 'lucide-react';
import { isFavorited, addFavorite, removeFavorite } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  contentId: string;
  type: 'anime' | 'donghua' | 'comic';
  title: string;
  poster: string;
  className?: string;
}

export function FavoriteButton({ contentId, type, title, poster, className }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(() => isFavorited(contentId, type));
  const { user, openLoginModal } = useAuth();

  const toggle = () => {
    if (!user) {
      toast.info('Masuk untuk menyimpan favorit');
      openLoginModal();
      return;
    }
    if (favorited) {
      removeFavorite(contentId, type);
    } else {
      addFavorite({ type, contentId, title, poster });
    }
    setFavorited(!favorited);
  };

  return (
    <button onClick={toggle} className={cn('p-2 rounded-full transition-all', favorited ? 'text-primary' : 'text-muted-foreground hover:text-foreground', className)}>
      <Heart className={cn('w-5 h-5', favorited && 'fill-primary')} />
    </button>
  );
}
