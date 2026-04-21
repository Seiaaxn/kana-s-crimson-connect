import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'menu' | 'signin' | 'signup' | 'forgot';

export function LoginModal() {
  const {
    loginModalOpen,
    closeLoginModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<Mode>('menu');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setMode('menu');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setBusy(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      closeLoginModal();
      setTimeout(reset, 200);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
      toast.success('Berhasil masuk!');
    } catch (e: any) {
      toast.error(e?.message || 'Gagal masuk dengan Google');
    } finally {
      setBusy(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Berhasil masuk!');
    } catch (err: any) {
      toast.error(err?.message || 'Email atau password salah');
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    setBusy(true);
    try {
      await signUpWithEmail(email, password, displayName);
      toast.success('Akun berhasil dibuat!');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal membuat akun');
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await resetPassword(email);
      toast.success('Link reset password dikirim ke email');
      setMode('signin');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengirim email reset');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={loginModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode !== 'menu' && (
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="p-1 rounded-full hover:bg-muted transition"
                aria-label="Kembali"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {mode === 'menu' && 'Masuk ke ShinKanime'}
            {mode === 'signin' && 'Masuk dengan Email'}
            {mode === 'signup' && 'Buat Akun Baru'}
            {mode === 'forgot' && 'Reset Password'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'menu' && 'Masuk untuk komentar, simpan favorit & sinkron data.'}
            {mode === 'signin' && 'Masukkan email dan password kamu.'}
            {mode === 'signup' && 'Daftar pakai email & password.'}
            {mode === 'forgot' && 'Kirim link reset password ke email kamu.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'menu' && (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogle}
              disabled={busy}
              className="w-full py-3 gradient-bg text-primary-foreground font-semibold rounded-lg hover:opacity-90 flex items-center justify-center gap-3 disabled:opacity-50 transition"
            >
              {busy ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
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
              <span className="text-xs text-muted-foreground">atau</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={() => setMode('signin')}
              className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Mail className="w-4 h-4" />
              Masuk dengan Email
            </button>
            <button
              onClick={() => setMode('signup')}
              className="w-full py-2 text-sm text-primary font-medium hover:underline"
            >
              Belum punya akun? Daftar
            </button>
          </div>
        )}

        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3 pt-2">
            <FieldEmail value={email} onChange={setEmail} />
            <FieldPassword value={password} onChange={setPassword} />
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 gradient-bg text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Masuk
            </button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => setMode('forgot')} className="text-muted-foreground hover:text-primary">
                Lupa password?
              </button>
              <button type="button" onClick={() => setMode('signup')} className="text-primary font-medium hover:underline">
                Buat akun baru
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3 pt-2">
            <FieldText value={displayName} onChange={setDisplayName} placeholder="Nama tampilan" icon={<UserIcon className="w-4 h-4" />} />
            <FieldEmail value={email} onChange={setEmail} />
            <FieldPassword value={password} onChange={setPassword} placeholder="Password (min. 6 karakter)" />
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 gradient-bg text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Daftar
            </button>
            <button type="button" onClick={() => setMode('signin')} className="w-full text-xs text-muted-foreground hover:text-primary">
              Sudah punya akun? Masuk
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-3 pt-2">
            <FieldEmail value={email} onChange={setEmail} />
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 gradient-bg text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Kirim Link Reset
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FieldEmail({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="email"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Email"
        className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  );
}

function FieldPassword({ value, onChange, placeholder = 'Password' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="password"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  );
}

function FieldText({
  value,
  onChange,
  placeholder,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  );
}