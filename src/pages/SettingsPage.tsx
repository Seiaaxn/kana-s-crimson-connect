import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { db, storage } from '@/integrations/firebase/config';
import { ref as dbRef, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';
import { Camera, Loader2, Save, ArrowLeft, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran maksimal 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('File harus gambar'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user || saving) return;
    if (!displayName.trim()) { toast.error('Nama tidak boleh kosong'); return; }
    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url || null;

      if (avatarFile) {
        setUploading(true);
        const path = `avatars/${user.uid}-${Date.now()}-${avatarFile.name}`;
        const sRef = storageRef(storage, path);
        await uploadBytes(sRef, avatarFile);
        avatarUrl = await getDownloadURL(sRef);
        setUploading(false);
      }

      await update(dbRef(db, `profiles/${user.uid}`), {
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      // Sync to Firebase Auth profile so Header & comments reflect new info
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
          photoURL: avatarUrl || undefined,
        });
      }

      toast.success('Profil berhasil disimpan! 🎉');
      setAvatarFile(null);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Gagal menyimpan profil');
    }
    setSaving(false);
    setUploading(false);
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-6 space-y-5 pb-24 max-w-2xl mx-auto">
        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Kembali ke profil
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl gradient-bg relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary-foreground" />
            <h1 className="text-lg font-display font-bold text-primary-foreground">Pengaturan Profil</h1>
          </div>
          <p className="text-xs text-primary-foreground/80 mt-1 relative z-10">Ubah nama tampilan, bio, dan foto profil</p>
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary-foreground/10 rounded-full blur-xl" />
        </motion.div>

        {/* Avatar */}
        <div className="bg-card rounded-2xl border border-border/30 p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Foto Profil</p>
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-24 h-24 rounded-2xl object-cover ring-2 ring-primary/50" />
              ) : (
                <div className="w-24 h-24 rounded-2xl gradient-bg flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary-foreground">{(displayName || 'U').charAt(0).toUpperCase()}</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-background/70 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-medium text-foreground transition disabled:opacity-50"
              >
                <Camera className="w-4 h-4" /> Pilih Gambar
              </button>
              <p className="text-[10px] text-muted-foreground">JPG / PNG, max 5MB</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>
          </div>
        </div>

        {/* Name & bio */}
        <div className="bg-card rounded-2xl border border-border/30 p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama Tampilan</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={30}
              placeholder="Nama kamu..."
              className="mt-2 w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{displayName.length}/30</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={150}
              rows={3}
              placeholder="Ceritakan tentang dirimu..."
              className="mt-2 w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{bio.length}/150</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
            <p className="mt-2 text-sm text-muted-foreground px-4 py-2.5 bg-muted/50 rounded-xl">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 gradient-bg text-primary-foreground font-bold rounded-xl hover:opacity-90 transition disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {uploading ? 'Mengunggah...' : saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
      <BottomNav />
    </main>
  );
}
