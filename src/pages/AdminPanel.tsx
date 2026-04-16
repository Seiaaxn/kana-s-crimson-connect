import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/integrations/firebase/config';
import { ref, get, remove, update } from 'firebase/database';
import { Shield, Users, MessageSquare, Trash2, Search, Loader2, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'ryu694602@gmail.com';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  exp: number;
  coins: number;
  is_premium: boolean;
  badge: string | null;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<'users' | 'comments' | 'discussions'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) { navigate('/'); return; }
    fetchData();
  }, [user, tab]);

  const fetchData = async () => {
    setLoading(true);
    if (tab === 'users') {
      const snap = await get(ref(db, 'profiles'));
      const u: UserProfile[] = [];
      if (snap.exists()) snap.forEach((c) => { u.push({ ...c.val(), id: c.key!, user_id: c.val().user_id || c.key! }); });
      u.sort((a, b) => (b.level || 0) - (a.level || 0));
      setUsers(u);
    } else if (tab === 'comments') {
      const allComments: any[] = [];
      for (const ct of ['anime', 'donghua', 'comic']) {
        const snap = await get(ref(db, `comments/${ct}`));
        if (snap.exists()) snap.forEach((contentChild) => {
          contentChild.forEach((commentChild) => {
            allComments.push({ ...commentChild.val(), id: commentChild.key!, content_path: `${ct}/${contentChild.key}` });
          });
        });
      }
      allComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      // Enrich with display names
      const userIds = [...new Set(allComments.map(c => c.user_id))];
      const names: Record<string, string> = {};
      for (const uid of userIds) {
        const p = await get(ref(db, `profiles/${uid}/display_name`));
        names[uid] = p.exists() ? p.val() : 'Unknown';
      }
      setComments(allComments.map(c => ({ ...c, display_name: names[c.user_id] || 'Unknown' })).slice(0, 100));
    } else {
      const allDisc: any[] = [];
      const rooms = ['general', 'anime', 'donghua', 'comic', 'offtopic'];
      for (const room of rooms) {
        const snap = await get(ref(db, `discussions/${room}`));
        if (snap.exists()) snap.forEach((child) => { allDisc.push({ ...child.val(), id: child.key!, room_path: room }); });
      }
      allDisc.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const userIds = [...new Set(allDisc.map(d => d.user_id))];
      const names: Record<string, string> = {};
      for (const uid of userIds) {
        const p = await get(ref(db, `profiles/${uid}/display_name`));
        names[uid] = p.exists() ? p.val() : 'Unknown';
      }
      setDiscussions(allDisc.map(d => ({ ...d, display_name: names[d.user_id] || 'Unknown' })).slice(0, 100));
    }
    setLoading(false);
  };

  const deleteComment = async (c: any) => {
    await remove(ref(db, `comments/${c.content_path}/${c.id}`));
    setComments(prev => prev.filter(x => x.id !== c.id));
    toast.success('Komentar dihapus');
  };

  const deleteDiscussion = async (d: any) => {
    await remove(ref(db, `discussions/${d.room_path}/${d.id}`));
    setDiscussions(prev => prev.filter(x => x.id !== d.id));
    toast.success('Pesan dihapus');
  };

  const updateUserBadge = async (userId: string, badge: string) => {
    await update(ref(db, `profiles/${userId}`), { badge });
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, badge } : u));
    toast.success('Badge diperbarui');
  };

  const updateUserCoins = async (userId: string, coins: number) => {
    await update(ref(db, `profiles/${userId}`), { coins });
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, coins } : u));
    toast.success('Koin diperbarui');
  };

  const togglePremium = async (userId: string, isPremium: boolean) => {
    const expiresAt = isPremium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null;
    await update(ref(db, `profiles/${userId}`), { is_premium: isPremium, premium_expires_at: expiresAt });
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_premium: isPremium } : u));
    toast.success(isPremium ? 'Premium diaktifkan' : 'Premium dinonaktifkan');
  };

  const filteredUsers = users.filter(u => !searchQuery || (u.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  if (!user || user.email !== ADMIN_EMAIL) return null;

  const tabs = [
    { key: 'users' as const, label: 'Users', icon: Users },
    { key: 'comments' as const, label: 'Komentar', icon: MessageSquare },
    { key: 'discussions' as const, label: 'Diskusi', icon: MessageSquare },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Kelola pengguna & konten</p>
          </div>
        </div>

        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition ${tab === t.key ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari user..."
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : tab === 'users' ? (
          <div className="space-y-2">
            {filteredUsers.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="p-4 bg-card rounded-xl border border-border/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> :
                      <span className="text-sm font-bold text-secondary-foreground">{(u.display_name || '?').charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{u.display_name || 'No Name'}</span>
                      {u.badge && <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">{u.badge}</span>}
                      {u.is_premium && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Lv.{u.level} • {(u.coins || 0).toLocaleString()} koin • EXP: {(u.exp || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateUserBadge(u.user_id, 'Developer')} className="px-2 py-1 text-[10px] bg-primary/10 text-primary rounded-lg">+ Developer</button>
                  <button onClick={() => updateUserBadge(u.user_id, 'Admin')} className="px-2 py-1 text-[10px] bg-destructive/10 text-destructive rounded-lg">+ Admin</button>
                  <button onClick={() => updateUserBadge(u.user_id, '')} className="px-2 py-1 text-[10px] bg-muted text-muted-foreground rounded-lg">Hapus Badge</button>
                  <button onClick={() => togglePremium(u.user_id, !u.is_premium)} className="px-2 py-1 text-[10px] bg-yellow-500/10 text-yellow-500 rounded-lg">
                    {u.is_premium ? 'Nonaktif Premium' : 'Aktif Premium'}
                  </button>
                  <button onClick={() => updateUserCoins(u.user_id, (u.coins || 0) + 1000)} className="px-2 py-1 text-[10px] bg-primary/10 text-primary rounded-lg">+1000 Koin</button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : tab === 'comments' ? (
          <div className="space-y-2">
            {comments.map(c => (
              <div key={c.id} className="p-3 bg-card rounded-xl border border-border/30 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{c.display_name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 break-words">{c.text}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{c.content_type} • {new Date(c.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <button onClick={() => deleteComment(c)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {comments.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Tidak ada komentar</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {discussions.map(d => (
              <div key={d.id} className="p-3 bg-card rounded-xl border border-border/30 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{d.display_name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 break-words">{d.message}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{d.room} • {new Date(d.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <button onClick={() => deleteDiscussion(d)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {discussions.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Tidak ada diskusi</p>}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
