import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { db, storage } from '@/integrations/firebase/config';
import { ref, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Send, Loader2, ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Profile } from '@/hooks/useProfile';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ChatPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChat(friendId || null);
  const [input, setInput] = useState('');
  const [friendProfile, setFriendProfile] = useState<Profile | null>(null);
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (friendId) {
      get(ref(db, `profiles/${friendId}`))
        .then((snap) => { if (snap.exists()) setFriendProfile({ ...snap.val(), user_id: friendId } as Profile); });
    }
  }, [friendId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Hanya file gambar yang diperbolehkan'); return; }
    if (file.size > MAX_IMAGE_SIZE) { toast.error('Ukuran gambar maksimal 5MB'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string> => {
    const chatId = [user!.uid, friendId].sort().join('_');
    const filename = `chats/${chatId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
    const fileRef = storageRef(storage, filename);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleSend = async () => {
    if ((!input.trim() && !imageFile) || sending) return;
    setSending(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      const msg = input.trim();
      setInput('');
      clearImage();
      await sendMessage(msg, imageUrl);
    } catch {
      toast.error('Gagal mengirim pesan');
    }
    setSending(false);
  };

  if (!user) return null;

  return (
    <main className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 h-14 px-4">
          <Link to="/friends" className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></Link>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {friendProfile?.avatar_url ? <img src={friendProfile.avatar_url} className="w-full h-full object-cover" /> :
              <span className="text-xs font-bold text-primary">{(friendProfile?.display_name || '?').charAt(0).toUpperCase()}</span>}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{friendProfile?.display_name || 'Loading...'}</p>
            <p className="text-[10px] text-muted-foreground">Lv.{friendProfile?.level || 1}</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> :
          messages.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">Mulai percakapan!</p> :
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user.uid;
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.5) }} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl text-sm overflow-hidden ${isMe ? 'gradient-bg text-primary-foreground rounded-br-md' : 'bg-card text-foreground rounded-bl-md'}`}>
                  {msg.image_url && (
                    <button onClick={() => setViewImage(msg.image_url!)} className="block w-full">
                      <img src={msg.image_url} alt="Gambar" className="w-full max-w-[280px] max-h-[200px] object-cover" loading="lazy" />
                    </button>
                  )}
                  {msg.content && (
                    <div className="px-3.5 py-2">
                      <p>{msg.content}</p>
                    </div>
                  )}
                  <p className={`text-[9px] px-3.5 pb-1.5 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-3 bg-background/95 backdrop-blur-lg">
        {/* Image preview */}
        {imagePreview && (
          <div className="relative inline-block mb-2">
            <img src={imagePreview} alt="Preview" className="h-16 rounded-lg object-cover border border-border" />
            <button onClick={clearImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-2xl bg-card text-muted-foreground hover:text-primary transition">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ketik pesan..."
            className="flex-1 px-4 py-2.5 bg-card border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button onClick={handleSend} disabled={(!input.trim() && !imageFile) || sending} className="p-2.5 gradient-bg rounded-2xl text-primary-foreground disabled:opacity-50 transition">
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Full image viewer */}
      <AnimatePresence>
        {viewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setViewImage(null)}
          >
            <button className="absolute top-4 right-4 text-white/80 hover:text-white">
              <X className="w-8 h-8" />
            </button>
            <img src={viewImage} alt="Gambar" className="max-w-full max-h-full object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
