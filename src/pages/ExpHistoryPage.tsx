import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/integrations/firebase/config';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { ExpActivity } from '@/hooks/useProfile';
import { motion } from 'framer-motion';
import { Loader2, Zap, Coins, Tv, Film, BookOpen, Sparkles, Gift, ArrowLeft } from 'lucide-react';

const SOURCE_META: Record<string, { label: string; icon: any; color: string }> = {
  watch_anime: { label: 'Tonton Anime', icon: Tv, color: 'text-blue-500' },
  watch_donghua: { label: 'Tonton Donghua', icon: Film, color: 'text-purple-500' },
  read_comic: { label: 'Baca Komik', icon: BookOpen, color: 'text-emerald-500' },
  level_up_bonus: { label: 'Bonus Level Up', icon: Sparkles, color: 'text-yellow-500' },
  daily_bonus: { label: 'Bonus Harian', icon: Gift, color: 'text-pink-500' },
  other: { label: 'Lainnya', icon: Zap, color: 'text-primary' },
};

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'watch_anime', label: 'Anime' },
  { key: 'watch_donghua', label: 'Donghua' },
  { key: 'read_comic', label: 'Komik' },
  { key: 'level_up_bonus', label: 'Level Up' },
];

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ExpHistoryPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ExpActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const q = query(ref(db, `exp_activity/${user.uid}`), limitToLast(200));
    const unsub = onValue(q, (snap) => {
      const list: ExpActivity[] = [];
      snap.forEach((child) => {
        list.push({ id: child.key!, ...(child.val() as ExpActivity) });
      });
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivities(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const totals = useMemo(() => {
    return activities.reduce(
      (acc, a) => ({ exp: acc.exp + (a.exp || 0), coins: acc.coins + (a.coins || 0) }),
      { exp: 0, coins: 0 },
    );
  }, [activities]);

  const filtered = useMemo(() => {
    if (filter === 'all') return activities;
    return activities.filter((a) => a.source === filter);
  }, [activities, filter]);

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-5 pb-24 space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-display font-bold text-foreground">Riwayat EXP</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border/40">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Zap className="w-3.5 h-3.5 text-primary" /> Total EXP (200 terakhir)
            </div>
            <p className="text-2xl font-bold text-foreground">{totals.exp.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/40">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Coins className="w-3.5 h-3.5 text-yellow-500" /> Total Koin
            </div>
            <p className="text-2xl font-bold text-foreground">{totals.coins.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border/40 hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Belum ada aktivitas EXP.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a, i) => {
              const meta = SOURCE_META[a.source] || SOURCE_META.other;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30"
                >
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${meta.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {a.content_title || meta.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {meta.label} • {formatRelative(a.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    {a.exp > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-primary">
                        <Zap className="w-3 h-3" /> +{a.exp}
                      </span>
                    )}
                    {a.coins > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-yellow-500">
                        <Coins className="w-3 h-3" /> +{a.coins}
                      </span>
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
