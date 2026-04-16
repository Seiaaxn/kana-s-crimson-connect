import { Crown, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLevelBadge, getExpProgress } from '@/lib/levelUtils';

interface LevelBadgeProps {
  level: number;
  exp: number;
  expForNext?: number;
  isPremium: boolean;
  coins: number;
  badge?: string | null;
  compact?: boolean;
}

export function LevelBadge({ level, exp, isPremium, coins, badge, compact }: LevelBadgeProps) {
  const levelBadge = getLevelBadge(level);
  const progress = getExpProgress(exp, level);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs">{levelBadge.emoji}</span>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Lv.{level}</span>
        {badge && (
          <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Shield className="w-2.5 h-2.5" />{badge}
          </span>
        )}
        {isPremium && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-card rounded-2xl border border-border/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
            <span className="text-xl">{levelBadge.emoji}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">Level {level}</p>
              {badge && (
                <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Shield className="w-2.5 h-2.5" />{badge}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">{levelBadge.name} • {progress.current.toLocaleString()} / {progress.needed.toLocaleString()} EXP</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isPremium && (
            <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full">
              <Crown className="w-3 h-3 text-yellow-500" />
              <span className="text-[10px] font-bold text-yellow-500">PREMIUM</span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">{coins.toLocaleString()} Koin</span>
          </div>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full gradient-bg rounded-full"
        />
      </div>
    </motion.div>
  );
}
