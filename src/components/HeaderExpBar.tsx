import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { getExpProgress, getLevelBadge } from '@/lib/levelUtils';

export function HeaderExpBar() {
  const { profile } = useProfile();
  if (!profile) return null;
  const progress = getExpProgress(profile.exp, profile.level);
  const badge = getLevelBadge(profile.level);

  return (
    <div className="px-4 max-w-7xl mx-auto pb-2">
      <div className="flex items-center gap-2">
        <span className="text-xs" aria-hidden>{badge.emoji}</span>
        <span className="text-[10px] font-bold text-primary whitespace-nowrap">Lv.{profile.level}</span>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full gradient-bg rounded-full"
          />
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
          {progress.current.toLocaleString()}/{progress.needed.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
