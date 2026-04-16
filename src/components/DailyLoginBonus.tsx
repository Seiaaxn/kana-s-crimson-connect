import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Gift, Flame, Coins, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const DAILY_KEY = 'shinkanime_daily_login';

interface DailyData {
  lastClaim: string;
  streak: number;
}

// Rewards cycle every 7 days but streak continues infinitely
const BASE_REWARDS = [
  { coins: 5, exp: 20 },
  { coins: 10, exp: 30 },
  { coins: 15, exp: 40 },
  { coins: 20, exp: 50 },
  { coins: 30, exp: 75 },
  { coins: 40, exp: 100 },
  { coins: 100, exp: 200 },
];

function getRewardForDay(day: number) {
  const cycleIndex = (day - 1) % 7;
  const cycleMultiplier = 1 + Math.floor((day - 1) / 7) * 0.5; // +50% per completed cycle
  const base = BASE_REWARDS[cycleIndex];
  return {
    coins: Math.floor(base.coins * cycleMultiplier),
    exp: Math.floor(base.exp * cycleMultiplier),
  };
}

function getDailyData(): DailyData | null {
  try {
    const d = localStorage.getItem(DAILY_KEY);
    return d ? JSON.parse(d) : null;
  } catch { return null; }
}

function saveDailyData(data: DailyData) {
  localStorage.setItem(DAILY_KEY, JSON.stringify(data));
}

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function isYesterday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
}

export function DailyLoginBonus() {
  const { user } = useAuth();
  const { addExp, addCoins } = useProfile();
  const [show, setShow] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const data = getDailyData();
    if (data && isToday(data.lastClaim)) {
      setAlreadyClaimed(true);
      setCurrentStreak(data.streak);
      return;
    }

    let streak = 1;
    if (data && isYesterday(data.lastClaim)) {
      streak = data.streak + 1; // Continue infinitely, no reset at 7
    }
    setCurrentStreak(streak);
    setShow(true);
  }, [user]);

  const handleClaim = async () => {
    if (claiming) return;
    setClaiming(true);
    const reward = getRewardForDay(currentStreak);
    
    await addCoins(reward.coins);
    await addExp(reward.exp);

    saveDailyData({ lastClaim: new Date().toISOString(), streak: currentStreak });
    setAlreadyClaimed(true);
    
    toast.success(`🎁 +${reward.coins} Koin & +${reward.exp} EXP!`, { duration: 3000 });
    
    setTimeout(() => {
      setShow(false);
      setClaiming(false);
    }, 1500);
  };

  if (!user || !show) return null;

  const reward = getRewardForDay(currentStreak);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="w-full max-w-sm bg-card rounded-2xl border border-border/50 overflow-hidden"
        >
          <div className="relative p-6 gradient-bg">
            <button onClick={() => setShow(false)} className="absolute top-3 right-3 p-1 bg-primary-foreground/20 rounded-full">
              <X className="w-4 h-4 text-primary-foreground" />
            </button>
            <div className="text-center">
              <Gift className="w-12 h-12 text-primary-foreground mx-auto mb-2 animate-bounce-in" />
              <h2 className="text-xl font-display font-bold text-primary-foreground">Login Harian</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Flame className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">Streak: {currentStreak} hari</span>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Show 7-day cycle grid with current cycle info */}
            <div className="text-center mb-2">
              <span className="text-[10px] text-muted-foreground">
                Siklus {Math.floor((currentStreak - 1) / 7) + 1} • Hari ke-{currentStreak}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }, (_, i) => {
                const dayInCycle = ((currentStreak - 1) % 7);
                const isActive = i === dayInCycle;
                const isPast = i < dayInCycle;
                const dayReward = getRewardForDay(Math.floor((currentStreak - 1) / 7) * 7 + i + 1);
                return (
                  <div key={i} className={`flex flex-col items-center p-1.5 rounded-lg text-center ${isActive ? 'bg-primary/20 ring-2 ring-primary' : isPast ? 'bg-success/10' : 'bg-muted'}`}>
                    <span className="text-[8px] font-medium text-muted-foreground">{i + 1}</span>
                    <Coins className={`w-3 h-3 mt-0.5 ${isActive ? 'text-primary' : isPast ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className={`text-[8px] font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{dayReward.coins}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm text-foreground font-medium">Hadiah hari ini:</p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-gold" />
                  <span className="text-sm font-bold text-foreground">+{reward.coins} Koin</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">+{reward.exp} EXP</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClaim}
              disabled={claiming || alreadyClaimed}
              className="w-full py-3 gradient-bg text-primary-foreground font-bold rounded-xl transition hover:opacity-90 disabled:opacity-50 animate-pulse-glow"
            >
              {alreadyClaimed ? '✅ Sudah Diklaim' : claiming ? 'Mengklaim...' : '🎁 Klaim Hadiah'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
