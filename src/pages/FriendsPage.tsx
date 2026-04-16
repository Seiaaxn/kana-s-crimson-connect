import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { db } from '@/integrations/firebase/config';
import { ref, get } from 'firebase/database';
import { Users, UserPlus, Check, X, MessageCircle, Search, Loader2, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Profile } from '@/hooks/useProfile';

export default function FriendsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends, pendingRequests, loading, sendRequest, acceptRequest, rejectRequest, removeFriend } = useFriends();
  const [tab, setTab] = useState<'friends' | 'pending' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  if (!user) { navigate('/login'); return null; }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results: Profile[] = [];
    try {
      const snapshot = await get(ref(db, 'profiles'));
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const val = child.val();
          if (val.user_id !== user.uid && val.display_name && val.display_name.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push(val as Profile);
          }
        });
      }
    } catch {}
    setSearchResults(results.slice(0, 20));
    setSearching(false);
  };

  const isFriend = (userId: string) => friends.some(f =>
    f.friend_profile?.user_id === userId
  );

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-display font-bold text-foreground">Pertemanan</h1>
        </div>

        <div className="flex gap-2">
          {[
            { key: 'friends' as const, label: 'Teman', count: friends.length },
            { key: 'pending' as const, label: 'Permintaan', count: pendingRequests.length },
            { key: 'search' as const, label: 'Cari Teman' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${tab === t.key ? 'gradient-bg text-primary-foreground shadow-lg' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
              {t.label} {t.count !== undefined && t.count > 0 && <span className="ml-1 bg-primary/20 px-1.5 py-0.5 rounded-full text-[10px]">{t.count}</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'friends' && (
            <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> :
                friends.length === 0 ? <p className="text-center text-muted-foreground py-8">Belum ada teman. Cari teman baru!</p> :
                friends.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-card rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {f.friend_profile?.avatar_url ? <img src={f.friend_profile.avatar_url} className="w-full h-full object-cover" /> :
                        <span className="text-sm font-bold text-primary">{(f.friend_profile?.display_name || '?').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{f.friend_profile?.display_name || 'User'}</p>
                        {f.friend_profile?.is_premium && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Lv.{f.friend_profile?.level || 1}</p>
                    </div>
                    <Link to={`/chat/${f.friend_profile?.user_id}`} className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </Link>
                    <button onClick={() => removeFriend(f.id)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition">
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
            </motion.div>
          )}

          {tab === 'pending' && (
            <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {pendingRequests.length === 0 ? <p className="text-center text-muted-foreground py-8">Tidak ada permintaan pertemanan</p> :
                pendingRequests.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-card rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {r.requester_profile?.avatar_url ? <img src={r.requester_profile.avatar_url} className="w-full h-full object-cover" /> :
                        <span className="text-sm font-bold text-primary">{(r.requester_profile?.display_name || '?').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{r.requester_profile?.display_name || 'User'}</p>
                      <p className="text-[10px] text-muted-foreground">Ingin berteman</p>
                    </div>
                    <button onClick={() => acceptRequest(r.id)} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition">
                      <Check className="w-4 h-4 text-green-500" />
                    </button>
                    <button onClick={() => rejectRequest(r.id)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition">
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
            </motion.div>
          )}

          {tab === 'search' && (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Cari nama pengguna..." className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <button onClick={handleSearch} className="px-4 py-2 gradient-bg text-primary-foreground rounded-xl text-sm font-medium">Cari</button>
              </div>
              {searching ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> :
                searchResults.map(p => (
                  <div key={p.user_id} className="flex items-center gap-3 p-3 bg-card rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> :
                        <span className="text-sm font-bold text-primary">{(p.display_name || '?').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{p.display_name || 'User'}</p>
                        {p.is_premium && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Lv.{p.level}</p>
                    </div>
                    {isFriend(p.user_id) ? (
                      <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded-full">Teman</span>
                    ) : (
                      <button onClick={() => sendRequest(p.user_id)} className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition">
                        <UserPlus className="w-4 h-4 text-primary" />
                      </button>
                    )}
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </main>
  );
}
