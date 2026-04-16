import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { LevelBadge } from '@/components/LevelBadge';
import { db } from '@/integrations/firebase/config';
import { ref, get } from 'firebase/database';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { getLevelBadge } from '@/lib/levelUtils';
import { Crown, UserPlus, MessageCircle, Loader2, Users, Sparkles, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  exp: number;
  coins: number;
  is_premium: boolean;
  badge: string | null;
  created_at: string;
}

interface UserComment {
  id: string;
  content_id: string;
  content_type: string;
  text: string;
  created_at: string;
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { friends, sendRequest } = useFriends();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'info' | 'comments'>('info');
  const [friendCount, setFriendCount] = useState(0);

  const isMe = user?.uid === userId;
  const isFriend = friends.some(f => f.friend_profile?.user_id === userId);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const profileSnap = await get(ref(db, `profiles/${userId}`));
        if (profileSnap.exists()) {
          setProfile({ user_id: userId, ...profileSnap.val() } as UserProfile);
        }

        const userComments: UserComment[] = [];
        const commentsSnap = await get(ref(db, 'comments'));
        if (commentsSnap.exists()) {
          commentsSnap.forEach((child) => {
            const val = child.val();
            if (val.user_id === userId) {
              userComments.push({ id: child.key!, ...val });
            }
          });
        }
        userComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setComments(userComments.slice(0, 50));

        let fc = 0;
        const friendsSnap = await get(ref(db, 'friendships'));
        if (friendsSnap.exists()) {
          friendsSnap.forEach((child) => {
            const val = child.val();
            if (val.status === 'accepted' && (val.requester_id === userId || val.addressee_id === userId)) fc++;
          });
        }
        setFriendCount(fc);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  if (loading) return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      <BottomNav />
    </main>
  );

  if (!profile) return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">User tidak ditemukan</div>
      <BottomNav />
    </main>
  );

  const badge = getLevelBadge(profile.level);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-6 space-y-5 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-card border border-border/30 p-5">
          <div className="absolute inset-0 gradient-bg opacity-10" />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name || ''} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary/50 shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">{(profile.display_name || 'U').charAt(0).toUpperCase()}</span>
                </div>
              )}
              {profile.is_premium && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                  <Crown className="w-3.5 h-3.5 text-background" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-display font-bold text-foreground">{profile.display_name || 'User'}</h1>
                {profile.badge && (
                  <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {profile.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {friendCount} teman</span>
                {profile.created_at && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-card rounded-xl border border-border/30 text-center">
            <p className="text-lg font-display font-bold text-foreground">{profile.level}</p>
            <p className="text-[10px] text-muted-foreground">Level</p>
          </div>
          <div className="p-3 bg-card rounded-xl border border-border/30 text-center">
            <p className="text-lg font-display font-bold text-foreground">{(profile.exp || 0).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">EXP</p>
          </div>
          <div className="p-3 bg-card rounded-xl border border-border/30 text-center">
            <p className="text-lg font-display font-bold text-foreground">{(profile.coins || 0).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Koin</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-4 bg-card rounded-xl border border-border/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{badge.emoji}</span>
            <div>
              <p className="text-sm font-bold text-foreground">{badge.name}</p>
              <p className="text-xs text-muted-foreground">Rank berdasarkan level</p>
            </div>
          </div>
        </motion.div>

        {!isMe && user && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex gap-2">
            {!isFriend && (
              <button onClick={() => sendRequest(userId!)} className="flex-1 flex items-center justify-center gap-2 py-3 gradient-bg rounded-xl text-sm font-bold text-primary-foreground shadow-lg">
                <UserPlus className="w-4 h-4" /> Tambah Teman
              </button>
            )}
            {isFriend && (
              <Link to={`/chat/${userId}`} className="flex-1 flex items-center justify-center gap-2 py-3 gradient-bg rounded-xl text-sm font-bold text-primary-foreground shadow-lg">
                <MessageCircle className="w-4 h-4" /> Kirim Pesan
              </Link>
            )}
          </motion.div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setTab('info')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${tab === 'info' ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            Info
          </button>
          <button onClick={() => setTab('comments')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${tab === 'comments' ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            Komentar ({comments.length})
          </button>
        </div>

        {tab === 'info' ? (
          <LevelBadge level={profile.level} exp={profile.exp} isPremium={profile.is_premium} coins={profile.coins} badge={profile.badge} />
        ) : (
          <div className="space-y-2">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Belum ada komentar</p>
            ) : comments.map(c => (
              <div key={c.id} className="p-3 bg-card rounded-xl border border-border/30">
                <p className="text-sm text-foreground">{c.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString('id-ID')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
