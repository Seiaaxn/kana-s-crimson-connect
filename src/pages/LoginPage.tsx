import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate('/profile');
  }, [user, navigate]);

  const handleGoogle = async () => {
    setBusy(true);
    try { await signInWithGoogle(); toast.success('Berhasil masuk!'); }
    catch (e: any) { toast.error(e?.message || 'Gagal masuk'); }
    finally { setBusy(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    try {
      if (tab === 'signin') {
        await signInWithEmail(email, password);
        toast.success('Berhasil masuk!');
      } else {
        if (password.length < 6) { toast.error('Password minimal 6 karakter'); setBusy(false); return; }
        await signUpWithEmail(email, password, displayName);
        toast.success('Akun berhasil dibuat!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan');
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    if (!email) { toast.error('Masukkan email terlebih dulu'); return; }
    try { await resetPassword(email); toast.success('Link reset password dikirim ke email'); }
    catch (err: any) { toast.error(err?.message || 'Gagal mengirim email'); }
  };

  return (
    <main className="min-h-screen bg-background pb-24">
      <Header />
      <div className="flex items-center justify-center min-h-[70vh] px-4 py-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-display font-bold text-foreground">{tab === 'signin' ? 'Masuk' : 'Daftar'}</h1>
            <p className="text-sm text-muted-foreground">Masuk untuk menyimpan favorit, riwayat & komentar</p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading || busy}
            className="w-full py-3 gradient-bg text-primary-foreground font-semibold rounded-lg transition hover:opacity-90 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Masuk dengan Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">atau pakai email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setTab('signin')}
              className={`py-2 text-sm font-semibold rounded-md transition ${tab === 'signin' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >Masuk</button>
            <button
              onClick={() => setTab('signup')}
              className={`py-2 text-sm font-semibold rounded-md transition ${tab === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >Daftar</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'signup' && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama tampilan"
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? 'Password (min. 6 karakter)' : 'Password'}
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {tab === 'signin' ? 'Masuk' : 'Daftar'}
            </button>
            {tab === 'signin' && (
              <button type="button" onClick={handleForgot} className="w-full text-xs text-muted-foreground hover:text-primary">
                Lupa password?
              </button>
            )}
          </form>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
