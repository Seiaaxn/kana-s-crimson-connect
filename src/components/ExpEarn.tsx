import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Zap, Crown, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpEarnProps {
  source: 'watch_anime' | 'watch_donghua' | 'read_comic';
  contentId: string;
  contentTitle: string;
  baseExp?: number;
}

// 1 hour cooldown per content to avoid farming on refresh
const COOLDOWN_MS = 60 * 60 * 1000;

export function ExpEarn({ source, contentId, baseExp = 10 }: ExpEarnProps) {
  const { user } = useAuth();
  const { profile, loading, addExpAndCoins } = useProfile();
  const earned = useRef(false);
  const [showEarn, setShowEarn] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [earnedCoin, setEarnedCoin] = useState(false);

  useEffect(() => {
    if (!user || loading || !profile || earned.current) return;

    // Per-user per-content cooldown
    const key = `exp_earned_${user.uid}_${source}_${contentId}`;
    const last = Number(localStorage.getItem(key) || 0);
    if (Date.now() - last < COOLDOWN_MS) {
      earned.current = true;
      return;
    }

    earned.current = true;
    const timer = setTimeout(async () => {
      const result = await addExpAndCoins(baseExp, 1);
      if (result) {
        localStorage.setItem(key, String(Date.now()));
        setEarnedAmount(result.gainedExp);
        setEarnedCoin(result.gainedCoins > 0);
        setShowEarn(true);
        setTimeout(() => setShowEarn(false), 3000);
      } else {
        earned.current = false; // allow retry on next mount
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [user, loading, profile, source, contentId, baseExp, addExpAndCoins]);

  if (!user) return null;

  return (
    <AnimatePresence>
      {showEarn && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-1"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg shadow-lg">
            <Zap className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-bold text-primary-foreground">+{earnedAmount} EXP</span>
            {profile?.is_premium && <Crown className="w-3.5 h-3.5 text-yellow-300" />}
          </div>
          {earnedCoin && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-500 text-xs font-bold shadow-lg">
              <Coins className="w-3.5 h-3.5" /> +1 Koin
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
