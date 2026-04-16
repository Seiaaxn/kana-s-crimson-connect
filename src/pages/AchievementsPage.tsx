import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { db } from '@/integrations/firebase/config';
import { ref, get } from 'firebase/database';
import { Trophy, Lock, CheckCircle2, Star, Eye, MessageSquare, Clock, Users, Flame, Heart, BookOpen, Crown, Swords, Zap, Target, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'watch' | 'social' | 'streak' | 'level';
  requirement: number;
  reward: { exp: number; coins: number };
  checkValue: (stats: UserStats) => number;
}

interface UserStats {
  level: number;
  exp: number;
  commentCount: number;
  friendCount: number;
  loginStreak: number;
  watchCount: number;
  favoriteCount: number;
  readCount: number;
  coins: number;
}

const achievements: Achievement[] = [
  { id: 'first_watch', title: 'Penonton Pertama', description: 'Tonton 1 anime/donghua', icon: Eye, category: 'watch', requirement: 1, reward: { exp: 50, coins: 10 }, checkValue: s => s.watchCount },
  { id: 'watch_10', title: 'Penggemar Anime', description: 'Tonton 10 anime/donghua', icon: Eye, category: 'watch', requirement: 10, reward: { exp: 200, coins: 30 }, checkValue: s => s.watchCount },
  { id: 'watch_25', title: 'Binge Watcher', description: 'Tonton 25 anime/donghua', icon: Eye, category: 'watch', requirement: 25, reward: { exp: 350, coins: 60 }, checkValue: s => s.watchCount },
  { id: 'watch_50', title: 'Otaku Sejati', description: 'Tonton 50 anime/donghua', icon: Eye, category: 'watch', requirement: 50, reward: { exp: 500, coins: 100 }, checkValue: s => s.watchCount },
  { id: 'watch_100', title: 'Master Weeb', description: 'Tonton 100 anime/donghua', icon: Star, category: 'watch', requirement: 100, reward: { exp: 1000, coins: 200 }, checkValue: s => s.watchCount },
  { id: 'watch_200', title: 'Anime Addict', description: 'Tonton 200 anime/donghua', icon: Zap, category: 'watch', requirement: 200, reward: { exp: 2000, coins: 400 }, checkValue: s => s.watchCount },
  { id: 'watch_500', title: 'No Life', description: 'Tonton 500 anime/donghua', icon: Crown, category: 'watch', requirement: 500, reward: { exp: 5000, coins: 1000 }, checkValue: s => s.watchCount },
  { id: 'first_read', title: 'Pembaca Pertama', description: 'Baca 1 chapter komik', icon: BookOpen, category: 'watch', requirement: 1, reward: { exp: 30, coins: 5 }, checkValue: s => s.readCount },
  { id: 'read_20', title: 'Bookworm', description: 'Baca 20 chapter komik', icon: BookOpen, category: 'watch', requirement: 20, reward: { exp: 250, coins: 50 }, checkValue: s => s.readCount },
  { id: 'read_100', title: 'Manga Master', description: 'Baca 100 chapter komik', icon: BookOpen, category: 'watch', requirement: 100, reward: { exp: 800, coins: 150 }, checkValue: s => s.readCount },
  { id: 'first_comment', title: 'Komentator', description: 'Tulis 1 komentar', icon: MessageSquare, category: 'social', requirement: 1, reward: { exp: 30, coins: 5 }, checkValue: s => s.commentCount },
  { id: 'comment_10', title: 'Aktif Berkomentar', description: 'Tulis 10 komentar', icon: MessageSquare, category: 'social', requirement: 10, reward: { exp: 150, coins: 25 }, checkValue: s => s.commentCount },
  { id: 'comment_50', title: 'Diskusi Master', description: 'Tulis 50 komentar', icon: MessageSquare, category: 'social', requirement: 50, reward: { exp: 400, coins: 75 }, checkValue: s => s.commentCount },
  { id: 'comment_100', title: 'Keyboard Warrior', description: 'Tulis 100 komentar', icon: Swords, category: 'social', requirement: 100, reward: { exp: 800, coins: 150 }, checkValue: s => s.commentCount },
  { id: 'comment_500', title: 'Forum Legend', description: 'Tulis 500 komentar', icon: Medal, category: 'social', requirement: 500, reward: { exp: 3000, coins: 500 }, checkValue: s => s.commentCount },
  { id: 'first_friend', title: 'Teman Baru', description: 'Tambah 1 teman', icon: Users, category: 'social', requirement: 1, reward: { exp: 50, coins: 10 }, checkValue: s => s.friendCount },
  { id: 'friend_5', title: 'Sosialita', description: 'Punya 5 teman', icon: Users, category: 'social', requirement: 5, reward: { exp: 200, coins: 40 }, checkValue: s => s.friendCount },
  { id: 'friend_15', title: 'Party Leader', description: 'Punya 15 teman', icon: Users, category: 'social', requirement: 15, reward: { exp: 500, coins: 100 }, checkValue: s => s.friendCount },
  { id: 'friend_50', title: 'Guild Master', description: 'Punya 50 teman', icon: Crown, category: 'social', requirement: 50, reward: { exp: 1500, coins: 300 }, checkValue: s => s.friendCount },
  { id: 'first_fav', title: 'Kolektor', description: 'Simpan 1 favorit', icon: Heart, category: 'social', requirement: 1, reward: { exp: 20, coins: 5 }, checkValue: s => s.favoriteCount },
  { id: 'fav_10', title: 'Kolektor Handal', description: 'Simpan 10 favorit', icon: Heart, category: 'social', requirement: 10, reward: { exp: 150, coins: 30 }, checkValue: s => s.favoriteCount },
  { id: 'fav_50', title: 'Otaku Collector', description: 'Simpan 50 favorit', icon: Heart, category: 'social', requirement: 50, reward: { exp: 500, coins: 100 }, checkValue: s => s.favoriteCount },
  { id: 'level_5', title: 'Naik Level', description: 'Capai level 5', icon: Trophy, category: 'level', requirement: 5, reward: { exp: 100, coins: 20 }, checkValue: s => s.level },
  { id: 'level_10', title: 'Veteran', description: 'Capai level 10', icon: Trophy, category: 'level', requirement: 10, reward: { exp: 300, coins: 50 }, checkValue: s => s.level },
  { id: 'level_25', title: 'Elite', description: 'Capai level 25', icon: Trophy, category: 'level', requirement: 25, reward: { exp: 750, coins: 150 }, checkValue: s => s.level },
  { id: 'level_50', title: 'Legendaris', description: 'Capai level 50', icon: Star, category: 'level', requirement: 50, reward: { exp: 2000, coins: 500 }, checkValue: s => s.level },
  { id: 'level_100', title: 'Mythical', description: 'Capai level 100', icon: Crown, category: 'level', requirement: 100, reward: { exp: 5000, coins: 1000 }, checkValue: s => s.level },
  { id: 'coins_1000', title: 'Kaya Raya', description: 'Kumpulkan 1000 koin', icon: Target, category: 'level', requirement: 1000, reward: { exp: 500, coins: 100 }, checkValue: s => s.coins },
  { id: 'coins_10000', title: 'Miliarder', description: 'Kumpulkan 10000 koin', icon: Crown, category: 'level', requirement: 10000, reward: { exp: 2000, coins: 500 }, checkValue: s => s.coins },
  { id: 'streak_3', title: 'Konsisten', description: 'Login 3 hari berturut', icon: Flame, category: 'streak', requirement: 3, reward: { exp: 100, coins: 15 }, checkValue: s => s.loginStreak },
  { id: 'streak_7', title: 'Seminggu Penuh', description: 'Login 7 hari berturut', icon: Flame, category: 'streak', requirement: 7, reward: { exp: 300, coins: 50 }, checkValue: s => s.loginStreak },
  { id: 'streak_14', title: 'Dua Minggu', description: 'Login 14 hari berturut', icon: Flame, category: 'streak', requirement: 14, reward: { exp: 600, coins: 100 }, checkValue: s => s.loginStreak },
  { id: 'streak_30', title: 'Sebulan Penuh', description: 'Login 30 hari berturut', icon: Flame, category: 'streak', requirement: 30, reward: { exp: 1500, coins: 300 }, checkValue: s => s.loginStreak },
  { id: 'streak_60', title: 'Iron Will', description: 'Login 60 hari berturut', icon: Zap, category: 'streak', requirement: 60, reward: { exp: 3000, coins: 600 }, checkValue: s => s.loginStreak },
  { id: 'streak_100', title: 'Immortal', description: 'Login 100 hari berturut', icon: Crown, category: 'streak', requirement: 100, reward: { exp: 10000, coins: 2000 }, checkValue: s => s.loginStreak },
];

const CLAIMED_KEY = 'shinkanime_achievements_claimed';

function getClaimedAchievements(): string[] {
  try {
    const d = localStorage.getItem(CLAIMED_KEY);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function claimAchievement(id: string) {
  const claimed = getClaimedAchievements();
  if (!claimed.includes(id)) {
    claimed.push(id);
    localStorage.setItem(CLAIMED_KEY, JSON.stringify(claimed));
  }
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, addExp, addCoins } = useProfile();
  const [stats, setStats] = useState<UserStats>({ level: 0, exp: 0, commentCount: 0, friendCount: 0, loginStreak: 0, watchCount: 0, favoriteCount: 0, readCount: 0, coins: 0 });
  const [claimed, setClaimed] = useState<string[]>([]);
  const [tab, setTab] = useState<'all' | 'watch' | 'social' | 'level' | 'streak'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setClaimed(getClaimedAchievements());

    const dailyData = localStorage.getItem('shinkanime_daily_login');
    let streak = 0;
    if (dailyData) {
      try { streak = JSON.parse(dailyData).streak || 0; } catch {}
    }

    const history = localStorage.getItem('shinkanime_history');
    let watchCount = 0;
    if (history) {
      try { watchCount = JSON.parse(history).length; } catch {}
    }

    const favorites = localStorage.getItem('shinkanime_favorites');
    let favoriteCount = 0;
    if (favorites) {
      try { favoriteCount = JSON.parse(favorites).length; } catch {}
    }

    const readHistory = localStorage.getItem('shinkanime_history');
    let readCount = 0;
    if (readHistory) {
      try { readCount = JSON.parse(readHistory).filter((h: any) => h.type === 'comic').length; } catch {}
    }

    // Fetch comment and friend counts from Firebase
    const fetchStats = async () => {
      let commentCount = 0;
      let friendCount = 0;

      try {
        const commentsSnap = await get(ref(db, 'comments'));
        if (commentsSnap.exists()) {
          commentsSnap.forEach((child) => {
            const val = child.val();
            if (val.user_id === user.uid) commentCount++;
          });
        }
      } catch {}

      try {
        const friendsSnap = await get(ref(db, 'friendships'));
        if (friendsSnap.exists()) {
          friendsSnap.forEach((child) => {
            const val = child.val();
            if (val.status === 'accepted' && (val.requester_id === user.uid || val.addressee_id === user.uid)) friendCount++;
          });
        }
      } catch {}

      setStats({
        level: profile?.level || 0,
        exp: profile?.exp || 0,
        commentCount,
        friendCount,
        loginStreak: streak,
        watchCount,
        favoriteCount,
        readCount,
        coins: profile?.coins || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, [user, profile]);

  const filtered = tab === 'all' ? achievements : achievements.filter(a => a.category === tab);

  const handleClaim = async (achievement: Achievement) => {
    if (claimed.includes(achievement.id)) return;
    await addCoins(achievement.reward.coins);
    await addExp(achievement.reward.exp);
    claimAchievement(achievement.id);
    setClaimed(prev => [...prev, achievement.id]);
  };

  const completedCount = achievements.filter(a => a.checkValue(stats) >= a.requirement).length;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Achievement</h1>
            <p className="text-xs text-muted-foreground">{completedCount}/{achievements.length} selesai</p>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div className="h-full gradient-bg rounded-full transition-all" style={{ width: `${(completedCount / achievements.length) * 100}%` }} />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {([{ key: 'all', label: 'Semua' }, { key: 'watch', label: 'Menonton' }, { key: 'social', label: 'Sosial' }, { key: 'level', label: 'Level' }, { key: 'streak', label: 'Streak' }] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${tab === t.key ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Clock className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a, i) => {
              const current = a.checkValue(stats);
              const completed = current >= a.requirement;
              const isClaimed = claimed.includes(a.id);
              const progress = Math.min(100, (current / a.requirement) * 100);

              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`p-4 rounded-xl border transition ${completed ? (isClaimed ? 'bg-green-500/5 border-green-500/20' : 'bg-primary/5 border-primary/30') : 'bg-card border-border/30'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${completed ? 'gradient-bg' : 'bg-muted'}`}>
                      {completed ? (
                        isClaimed ? <CheckCircle2 className="w-5 h-5 text-primary-foreground" /> : <a.icon className="w-5 h-5 text-primary-foreground" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{a.title}</h3>
                        {isClaimed && <span className="text-[9px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full font-medium">Diklaim</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-primary font-medium">+{a.reward.exp} EXP</span>
                        <span className="text-[10px] text-yellow-500 font-medium">+{a.reward.coins} Koin</span>
                      </div>
                      <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${completed ? 'bg-green-500' : 'gradient-bg'}`} style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{current}/{a.requirement}</p>
                    </div>
                    {completed && !isClaimed && (
                      <button onClick={() => handleClaim(a)} className="px-3 py-1.5 gradient-bg text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition">
                        Klaim
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
