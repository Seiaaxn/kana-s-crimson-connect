import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/integrations/firebase/config';
import { ref, get } from 'firebase/database';
import { Gift, Loader2, Crown, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReceivedGift {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  days: number;
  was_extension: boolean;
  created_at: string;
}

export default function PremiumReceivedPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [gifts, setGifts] = useState<ReceivedGift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchReceived = async () => {
      try {
        const snap = await get(ref(db, 'premium_gifts'));
        if (!snap.exists()) { setGifts([]); setLoading(false); return; }

        const items: ReceivedGift[] = [];
        const senderIds = new Set<string>();

        // premium_gifts is structured as premium_gifts/{senderId}/{giftId}
        snap.forEach(senderNode => {
          const senderId = senderNode.key!;
          senderNode.forEach(giftNode => {
            const val = giftNode.val();
            if (val.receiver_id === user.uid) {
              senderIds.add(senderId);
              items.push({
                id: `${senderId}_${giftNode.key}`,
                sender_id: senderId,
                sender_name: 'User',
                sender_avatar: null,
                days: val.days,
                was_extension: val.was_extension || false,
                created_at: val.created_at,
              });
            }
          });
        });

        // Fetch sender profiles in parallel
        const senderProfiles: Record<string, { name: string; avatar: string | null }> = {};
        await Promise.all(Array.from(senderIds).map(async (sid) => {
          const pSnap = await get(ref(db, `profiles/${sid}`));
          if (pSnap.exists()) {
            const v = pSnap.val();
            senderProfiles[sid] = { name: v.display_name || 'User', avatar: v.avatar_url || null };
          }
        }));

        items.forEach(it => {
          const sp = senderProfiles[it.sender_id];
          if (sp) { it.sender_name = sp.name; it.sender_avatar = sp.avatar; }
        });

        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setGifts(items);
      } catch (err) {
        console.error('Error fetching received gifts:', err);
      }
      setLoading(false);
    };
    fetchReceived();
  }, [user]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const totalDays = gifts.reduce((sum, g) => sum + g.days, 0);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-6 space-y-5 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl gradient-bg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Inbox className="w-6 h-6 text-primary-foreground" />
              <h1 className="text-lg font-display font-bold text-primary-foreground">Premium yang Diterima</h1>
            </div>
            <p className="text-xs text-primary-foreground/80">Riwayat hadiah premium dari teman-temanmu</p>
            {gifts.length > 0 && (
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider">Total Hadiah</p>
                  <p className="text-lg font-bold text-primary-foreground">{gifts.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider">Total Hari</p>
                  <p className="text-lg font-bold text-primary-foreground">{totalDays} hari</p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary-foreground/10 rounded-full blur-xl" />
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada hadiah premium diterima</p>
            <p className="text-xs text-muted-foreground mt-1">Ajak teman untuk berbagi premium denganmu!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {gifts.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/user/${g.sender_id}`}
                  className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/30 hover:border-primary/50 transition">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                      {g.sender_avatar ? <img src={g.sender_avatar} className="w-full h-full object-cover" /> :
                        <span className="text-sm font-bold text-secondary-foreground">{(g.sender_name || '?').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full gradient-bg flex items-center justify-center">
                      <Gift className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">{g.sender_name}</span>
                      <Crown className="w-3 h-3 text-yellow-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {g.was_extension ? 'Memperpanjang' : 'Memberi'} premium
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">{formatDate(g.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">+{g.days}</p>
                    <p className="text-[10px] text-muted-foreground">hari</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
