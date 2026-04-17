import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { db } from '@/integrations/firebase/config';
import { ref, get, update, push } from 'firebase/database';
import { Crown, Gift, Users, Loader2, Check, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Friend {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  premium_expires_at?: string | null;
}

const DURATION_OPTIONS = [
  { days: 3, cost: 3000, label: '3 Hari' },
  { days: 7, cost: 7000, label: '7 Hari' },
  { days: 14, cost: 14000, label: '14 Hari' },
  { days: 30, cost: 30000, label: '30 Hari' },
  { days: 90, cost: 80000, label: '90 Hari' },
];

export default function SharePremiumPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[3]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile && !profile.is_premium) { navigate('/premium'); return; }
    if (user) fetchFriends();
  }, [user, profile]);

  const fetchFriends = async () => {
    if (!user) return;
    try {
      const friendsSnap = await get(ref(db, 'friendships'));
      const friendIds: string[] = [];
      if (friendsSnap.exists()) {
        friendsSnap.forEach((child) => {
          const val = child.val();
          if (val.status === 'accepted') {
            if (val.requester_id === user.uid) friendIds.push(val.addressee_id);
            else if (val.addressee_id === user.uid) friendIds.push(val.requester_id);
          }
        });
      }

      const friendProfiles: Friend[] = [];
      for (const fid of friendIds) {
        const pSnap = await get(ref(db, `profiles/${fid}`));
        if (pSnap.exists()) {
          const val = pSnap.val();
          friendProfiles.push({
            user_id: fid,
            display_name: val.display_name,
            avatar_url: val.avatar_url,
            is_premium: val.is_premium || false,
            premium_expires_at: val.premium_expires_at || null,
          });
        }
      }
      setFriends(friendProfiles);
    } catch (err) {
      console.error('Error fetching friends:', err);
      toast.error('Gagal memuat daftar teman');
    }
    setLoading(false);
  };

  const sharePremium = async (friendId: string) => {
    if (!profile || sharing || !user) return;
    setSharing(friendId);

    const SHARE_DAYS = selectedDuration.days;
    const SHARE_COST = selectedDuration.cost;

    try {
      const profileSnap = await get(ref(db, `profiles/${user.uid}`));
      const currentCoins = profileSnap.exists() ? (profileSnap.val().coins || 0) : 0;

      if (currentCoins < SHARE_COST) {
        toast.error(`Koin tidak cukup! Butuh ${SHARE_COST.toLocaleString()} koin (kamu punya ${currentCoins.toLocaleString()})`);
        setSharing(null);
        return;
      }

      // Get friend current premium status & expiry
      const friendSnap = await get(ref(db, `profiles/${friendId}`));
      if (!friendSnap.exists()) {
        toast.error('Teman tidak ditemukan');
        setSharing(null);
        return;
      }
      const friendData = friendSnap.val();
      const now = new Date();
      let baseDate = now;
      if (friendData.is_premium && friendData.premium_expires_at) {
        const existingExpiry = new Date(friendData.premium_expires_at);
        if (existingExpiry > now) baseDate = existingExpiry;
      }
      const newExpiresAt = new Date(baseDate);
      newExpiresAt.setDate(newExpiresAt.getDate() + SHARE_DAYS);

      // Deduct coins from sender
      await update(ref(db, `profiles/${user.uid}`), { coins: currentCoins - SHARE_COST });

      // Update friend's premium (extend or activate)
      await update(ref(db, `profiles/${friendId}`), {
        is_premium: true,
        premium_expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      });

      const friendProfile = friends.find(f => f.user_id === friendId);
      const wasAlreadyPremium = friendData.is_premium;

      // Send notification
      await push(ref(db, `notifications/${friendId}`), {
        user_id: friendId,
        title: wasAlreadyPremium ? 'Premium Diperpanjang! 🎁' : 'Premium Diterima! 🎉',
        message: `${profile.display_name || 'Seseorang'} ${wasAlreadyPremium ? 'memperpanjang' : 'memberi'} premium ${SHARE_DAYS} hari ${wasAlreadyPremium ? 'untukmu' : 'denganmu'}!`,
        type: 'gift',
        is_read: false,
        created_at: new Date().toISOString(),
      });

      setFriends(prev => prev.map(f => f.user_id === friendId
        ? { ...f, is_premium: true, premium_expires_at: newExpiresAt.toISOString() }
        : f));

      toast.success(`Premium ${SHARE_DAYS} hari ${wasAlreadyPremium ? 'ditambahkan' : 'diberikan'} ke ${friendProfile?.display_name || 'teman'}! (-${SHARE_COST.toLocaleString()} koin)`);

      if (fetchProfile) fetchProfile();
    } catch (err) {
      console.error('Error sharing premium:', err);
      toast.error('Gagal berbagi premium, coba lagi');
    }
    setSharing(null);
  };

  const filteredFriends = friends.filter(f =>
    !searchQuery || (f.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || (profile && !profile.is_premium)) return null;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-6 space-y-5 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl gradient-bg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-6 h-6 text-primary-foreground" />
              <h1 className="text-lg font-display font-bold text-primary-foreground">Berbagi Premium</h1>
            </div>
            <p className="text-xs text-primary-foreground/80">Pilih durasi & berikan premium ke teman dengan koinmu</p>
            <p className="text-xs text-primary-foreground/60 mt-1">Koin kamu: {(profile?.coins || 0).toLocaleString()}</p>
          </div>
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary-foreground/10 rounded-full blur-xl" />
        </motion.div>

        {/* Duration selector */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Pilih Durasi</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt.days}
                onClick={() => setSelectedDuration(opt)}
                className={`px-2 py-2.5 rounded-xl text-xs font-bold transition border ${
                  selectedDuration.days === opt.days
                    ? 'gradient-bg text-primary-foreground border-transparent shadow-lg'
                    : 'bg-card text-foreground border-border/50 hover:border-primary/50'
                }`}
              >
                <div>{opt.label}</div>
                <div className={`text-[10px] font-normal mt-0.5 ${selectedDuration.days === opt.days ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {opt.cost.toLocaleString()} koin
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari teman..."
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : friends.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada teman</p>
            <p className="text-xs text-muted-foreground mt-1">Tambah teman terlebih dahulu</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFriends.map((friend, i) => (
              <motion.div key={friend.user_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/30">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full object-cover" /> :
                    <span className="text-sm font-bold text-secondary-foreground">{(friend.display_name || '?').charAt(0).toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{friend.display_name || 'User'}</span>
                    {friend.is_premium && <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                  </div>
                  {friend.is_premium && friend.premium_expires_at && (
                    <p className="text-[10px] text-yellow-500">
                      Aktif s/d {new Date(friend.premium_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => sharePremium(friend.user_id)}
                  disabled={!!sharing}
                  className="px-3 py-1.5 gradient-bg text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition disabled:opacity-40 flex items-center gap-1"
                >
                  {sharing === friend.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> :
                    friend.is_premium ? <Check className="w-3 h-3" /> : <Gift className="w-3 h-3" />}
                  {friend.is_premium ? 'Tambah' : 'Kirim'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
