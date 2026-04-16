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
import { Crown, UserPlus, MessageCircle, Loader2, Users } from 'lucide-react';
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name || ''} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/50" />
            ) : (
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">{(profile.display_name || 'U').charAt(0).toUpperCase()}</span>
              </div>
            )}
            {profile.is_premium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold text-foreground">{profile.display_name || 'User'}</h1>
              {profile.badge && (
                <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">{profile.badge}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm">{badge.emoji}</span>
              <span className="text-xs text-muted-foreground">Level {profile.level}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{friendCount} Teman</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">ID: {profile.user_id.slice(0, 8)}</p>
          </div>
        </motion.div>

        {!isMe && user && (
          <div className="flex gap-2">
            {!isFriend ? (
              <button onClick={() => sendRequest(userId!)} className="flex-1 flex items-center justify-center gap-2 py-2.5 gradient-bg rounded-xl text-sm font-medium text-primary-foreground">
                <UserPlus className="w-4 h-4" /> Tambah Teman
              </button>
            ) : (
              <Link to={`/chat/${userId}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 gradient-bg rounded-xl text-sm font-medium text-primary-foreground">
                <MessageCircle className="w-4 h-4" /> Chat
              </Link>
            )}
          </div>
        )}

        <LevelBadge level={profile.level} exp={profile.exp} isPremium={profile.is_premium} coins={isMe ? profile.coins : 0} badge={profile.badge} />

        <div className="flex gap-2">
          <button onClick={() => setTab('info')} className={`px-4 py-2 rounded-xl text-xs font-medium transition ${tab === 'info' ? 'gradient-bg text-primary-foreground' : 'bg-card text-muted-foreground'}`}>
            Info
          </button>
          <button onClick={() => setTab('comments')} className={`px-4 py-2 rounded-xl text-xs font-medium transition ${tab === 'comments' ? 'gradient-bg text-primary-foreground' : 'bg-card text-muted-foreground'}`}>
            Komentar ({comments.length})
          </button>
        </div>

        {tab === 'info' && (
          <div className="space-y-3">
            <div className="p-3 bg-card rounded-xl space-y-2">
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">EXP Total:</span> {profile.exp.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Status:</span> {profile.is_premium ? 'Premium' : 'Free'}</p>
              {profile.created_at && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Bergabung:</span> {new Date(profile.created_at).toLocaleDateString('id-ID')}</p>}
            </div>
          </div>
        )}

        {tab === 'comments' && (
          <div className="space-y-2">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada komentar</p>
            ) : comments.map(c => (
              <div key={c.id} className="p-3 bg-card rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded capitalize">{c.content_type}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                <p className="text-sm text-foreground">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
