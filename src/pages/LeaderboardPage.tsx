import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { db } from '@/integrations/firebase/config';
import { ref, get } from 'firebase/database';
import { useAuth } from '@/hooks/useAuth';
import { getLevelBadge } from '@/lib/levelUtils';
import { Trophy, Crown, Medal, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  exp: number;
  is_premium: boolean;
  badge: string | null;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await get(ref(db, 'profiles'));
      if (snapshot.exists()) {
        const list: LeaderboardUser[] = [];
        snapshot.forEach((child) => {
          const val = child.val();
          list.push({ user_id: val.user_id || child.key!, display_name: val.display_name, avatar_url: val.avatar_url, level: val.level || 1, exp: val.exp || 0, is_premium: val.is_premium || false, badge: val.badge || null });
        });
        list.sort((a, b) => b.level - a.level || b.exp - a.exp);
        setUsers(list.slice(0, 100));
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 text-center text-xs font-bold text-muted-foreground">#{rank}</span>;
  };

  const myRank = user ? users.findIndex(u => u.user_id === user.uid) + 1 : 0;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-xl font-display font-bold text-foreground">Leaderboard</h1>
        </div>

        {myRank > 0 && (
          <div className="p-3 bg-primary/10 rounded-xl text-sm text-primary font-medium">
            Peringkat kamu: <span className="font-bold">#{myRank}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-2">
            {users.map((u, i) => {
              const badge = getLevelBadge(u.level);
              const isMe = user?.uid === u.user_id;
              return (
                <motion.div
                  key={u.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Link
                    to={`/user/${u.user_id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl transition ${isMe ? 'bg-primary/10 border border-primary/30' : 'bg-card hover:bg-card/80'}`}
                  >
                    <div className="w-8 flex justify-center">{getRankIcon(i + 1)}</div>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> :
                        <span className="text-sm font-bold text-primary">{(u.display_name || '?').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground truncate">{u.display_name || 'User'}</span>
                        {u.badge && <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1 py-0.5 rounded">{u.badge}</span>}
                        {u.is_premium && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{badge.emoji}</span>
                        <span className="text-[10px] text-muted-foreground">Lv.{u.level} • {u.exp.toLocaleString()} EXP</span>
                      </div>
                    </div>
                  </Link>
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
