import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Zap, Crown, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ExpEarnProps {
  source: 'watch_anime' | 'watch_donghua' | 'read_comic';
  contentId: string;
  contentTitle: string;
  baseExp?: number;
}

const sourceLabels = {
  watch_anime: 'Menonton Anime',
  watch_donghua: 'Menonton Donghua',
  read_comic: 'Membaca Komik',
};

export function ExpEarn({ source, contentId, contentTitle, baseExp = 10 }: ExpEarnProps) {
  const { user } = useAuth();
  const { profile, addExp, addCoins } = useProfile();
  const earned = useRef(false);
  const [showEarn, setShowEarn] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [earnedCoin, setEarnedCoin] = useState(false);

  useEffect(() => {
    if (!user || earned.current) return;
    earned.current = true;

    const timer = setTimeout(async () => {
      const result = await addExp(baseExp);
      if (result) {
        const amount = profile?.is_premium ? baseExp * 5 : baseExp;
        setEarnedAmount(amount);
        setShowEarn(true);

        // Give 1 coin per activity
        const coinOk = await addCoins(1);
        if (coinOk) setEarnedCoin(true);

        setTimeout(() => setShowEarn(false), 3000);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [user]);

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
