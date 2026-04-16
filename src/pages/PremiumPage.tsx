import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Crown, Zap, Gift, Star, Coins, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const premiumPlans = [
  { days: 7, cost: 500, label: '1 Minggu', popular: false },
  { days: 30, cost: 1500, label: '1 Bulan', popular: true },
  { days: 90, cost: 3500, label: '3 Bulan', popular: false },
];

const benefits = [
  { icon: Zap, label: '5x EXP Multiplier', desc: 'Naik level 5x lebih cepat' },
  { icon: Crown, label: 'Badge Premium', desc: 'Tampil beda dengan badge eksklusif' },
  { icon: Gift, label: 'Berbagi Premium', desc: 'Bagikan premium ke teman' },
  { icon: Star, label: 'Prioritas Support', desc: 'Dapatkan bantuan lebih cepat' },
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, buyPremium } = useProfile();
  const [buying, setBuying] = useState(false);

  if (!user) { navigate('/login'); return null; }

  const handleBuyPremium = async (days: number, cost: number) => {
    if (!profile) return;
    if (profile.coins < cost) {
      toast.error(`Koin tidak cukup! Butuh ${cost} koin, kamu punya ${profile.coins}`);
      return;
    }
    setBuying(true);
    const ok = await buyPremium(days, cost);
    setBuying(false);
    if (ok) toast.success('Premium berhasil diaktifkan! 🎉');
    else toast.error('Gagal membeli premium');
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-6 space-y-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl p-5 gradient-bg">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-primary-foreground" />
              <h1 className="text-lg font-display font-bold text-primary-foreground">
                {profile?.is_premium ? 'Premium Aktif' : 'Upgrade ke Premium'}
              </h1>
            </div>
            {profile?.is_premium && profile.premium_expires_at && (
              <p className="text-xs text-primary-foreground/80">
                Berlaku hingga: {new Date(profile.premium_expires_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
            )}
            <div className="flex items-center gap-2 mt-3 bg-background/20 rounded-xl px-3 py-2 w-fit">
              <Coins className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-bold text-primary-foreground">{(profile?.coins || 0).toLocaleString()} Koin</span>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        </motion.div>

        <div>
          <h2 className="text-base font-display font-bold text-foreground mb-3">Keuntungan Premium</h2>
          <div className="grid grid-cols-2 gap-2">
            {benefits.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-3 bg-card rounded-xl border border-border/50">
                <b.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-xs font-bold text-foreground">{b.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {!profile?.is_premium && (
          <div>
            <h2 className="text-base font-display font-bold text-foreground mb-3">Pilih Paket Premium</h2>
            <div className="space-y-2">
              {premiumPlans.map((plan, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleBuyPremium(plan.days, plan.cost)}
                  disabled={buying}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${plan.popular ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:border-primary/50'}`}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{plan.label}</span>
                      {plan.popular && <span className="text-[9px] px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-bold">POPULER</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-foreground">{plan.cost}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {profile?.is_premium && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => navigate('/share-premium')} className="w-full flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">Berbagi Premium</p>
                  <p className="text-[10px] text-muted-foreground">Kirim 3 hari premium ke teman (300 koin)</p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        <div className="p-4 bg-card rounded-xl border border-border/50">
          <h3 className="text-sm font-bold text-foreground mb-2">Cara Mendapatkan Koin</h3>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• Tonton anime → +1 koin per episode</li>
            <li>• Tonton donghua → +1 koin per episode</li>
            <li>• Baca komik → +1 koin per chapter</li>
            <li>• Login harian → bonus koin</li>
          </ul>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
