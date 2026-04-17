import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { LevelBadge } from '@/components/LevelBadge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Clock, Heart, LogOut, Loader2, Crown, Users, Trophy, Shield, Gift, MessageSquare, Sparkles, Settings, Inbox } from 'lucide-react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  if (loading) return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      <BottomNav />
    </main>
  );

  if (!user) return null;

  const displayName = profile?.display_name || user.displayName || user.email?.split('@')[0] || 'User';
  const avatar = profile?.avatar_url || user.photoURL;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isAdmin = user.email === 'ryu694602@gmail.com';

  const menuItems = [
    { icon: Settings, label: 'Pengaturan Profil', href: '/settings', color: 'text-primary' },
    { icon: Clock, label: 'Riwayat Tontonan', href: '/history', color: 'text-primary' },
    { icon: Heart, label: 'Favorit', href: '/favorites', color: 'text-primary' },
    { icon: Users, label: 'Pertemanan', href: '/friends', color: 'text-primary' },
    { icon: MessageSquare, label: 'Diskusi', href: '/discussion', color: 'text-primary' },
    { icon: Trophy, label: 'Leaderboard', href: '/leaderboard', color: 'text-yellow-500' },
    { icon: Crown, label: 'Premium', href: '/premium', color: 'text-yellow-500' },
    ...(profile?.is_premium ? [{ icon: Gift, label: 'Berbagi Premium', href: '/share-premium', color: 'text-yellow-500' }] : []),
    { icon: Inbox, label: 'Premium yang Diterima', href: '/premium-received', color: 'text-yellow-500' },
    { icon: Trophy, label: 'Achievement', href: '/achievements', color: 'text-yellow-500' },
    ...(isAdmin ? [{ icon: Shield, label: 'Admin Panel', href: '/admin', color: 'text-destructive' }] : []),
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-6 space-y-5 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-card border border-border/30 p-5">
          <div className="absolute inset-0 gradient-bg opacity-10" />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt={displayName} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary/50 shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">{displayName.charAt(0).toUpperCase()}</span>
                </div>
              )}
              {profile?.is_premium && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                  <Crown className="w-3.5 h-3.5 text-background" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-display font-bold text-foreground">{displayName}</h1>
                {profile?.badge && (
                  <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {profile.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">ID: {user.uid.slice(0, 8)}</p>
            </div>
          </div>
        </motion.div>

        {profile && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <LevelBadge level={profile.level} exp={profile.exp} isPremium={profile.is_premium} coins={profile.coins} badge={profile.badge} />
          </motion.div>
        )}

        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
              <Link to={item.href} className="flex items-center gap-3 p-4 bg-card rounded-xl hover:bg-card/80 transition border border-border/30 group">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </Link>
            </motion.div>
          ))}
          <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 bg-card rounded-xl hover:bg-destructive/10 transition text-left border border-border/30 group">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition">
              <LogOut className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-sm font-medium text-destructive">Keluar</span>
          </motion.button>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
