import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { LevelBadge } from '@/components/LevelBadge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Clock, Heart, LogOut, Loader2, Crown, Users, Trophy, Shield, Gift, MessageSquare } from 'lucide-react';
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
    { icon: Clock, label: 'Riwayat Tontonan', href: '/history', color: 'text-primary' },
    { icon: Heart, label: 'Favorit', href: '/favorites', color: 'text-primary' },
    { icon: Users, label: 'Pertemanan', href: '/friends', color: 'text-primary' },
    { icon: MessageSquare, label: 'Diskusi', href: '/discussion', color: 'text-primary' },
    { icon: Trophy, label: 'Leaderboard', href: '/leaderboard', color: 'text-yellow-500' },
    { icon: Crown, label: 'Premium', href: '/premium', color: 'text-yellow-500' },
    ...(profile?.is_premium ? [{ icon: Gift, label: 'Berbagi Premium', href: '/share-premium', color: 'text-yellow-500' }] : []),
    { icon: Trophy, label: 'Achievement', href: '/achievements', color: 'text-yellow-500' },
    ...(isAdmin ? [{ icon: Shield, label: 'Admin Panel', href: '/admin', color: 'text-destructive' }] : []),
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-6 space-y-5 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/50" />
            ) : (
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">{displayName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            {profile?.is_premium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold text-foreground">{displayName}</h1>
              {profile?.badge && (
                <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">{profile.badge}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-[10px] text-muted-foreground/70">ID: {user.uid.slice(0, 8)}</p>
          </div>
        </motion.div>

        {profile && (
          <LevelBadge
            level={profile.level}
            exp={profile.exp}
            isPremium={profile.is_premium}
            coins={profile.coins}
            badge={profile.badge}
          />
        )}

        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={item.href} className="flex items-center gap-3 p-4 bg-card rounded-xl hover:bg-card/80 transition border border-border/30">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </Link>
            </motion.div>
          ))}
          <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} onClick={handleLogout} className="w-full flex items-center gap-3 p-4 bg-card rounded-xl hover:bg-destructive/10 transition text-left border border-border/30">
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Keluar</span>
          </motion.button>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
