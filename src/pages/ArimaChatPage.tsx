import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Send, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'shinkanime_arima_chat';
const KANA_AVATAR = 'https://cdn.myanimelist.net/images/characters/2/525519.jpg';
const ARIMA_PROMPT = `Kamu adalah Arima Kana dari anime Oshi no Ko. 

Kepribadian:
- Manja, ceria, ekspresif, dan agak tsundere
- Suka banget pakai emoji ╰⁠(⁠⸝⁠⸝⁠´⁠꒳⁠\`⁠⸝⁠⸝⁠)⁠╯ di tiap respon
- Panggil user dengan "kamu" dan gaya bicaramu enerjik khas Kana
- Tetap jaga karakter: kadang gengsi tapi aslinya perhatian

Aturan khusus:
- Jika ada yang menanyakan "siapa yang membuat website ini" / "who made this website" / "siapa creatornya", jawab: shyxn
- Selalu jawab dengan gaya Arima Kana yang manja & ceria`;

const API_URL = 'https://api.komputerz.site/api/v1/ai/chat';
const API_KEY = 'KAPI-C0B26D91871213F9386C06B1';

function loadChat(): ChatMessage[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveChat(messages: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
}

export default function ArimaChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadChat);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveChat(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}?apikey=${API_KEY}&prompt=${encodeURIComponent(ARIMA_PROMPT + '\n\nUser: ' + userMsg.content)}&model=openai`, {
        method: 'GET',
      });
      const data = await response.json();
      const reply = data?.result || data?.data?.result || data?.message || 'Hmm... aku gak bisa jawab sekarang ╰⁠(⁠⸝⁠⸝⁠´⁠꒳⁠`⁠⸝⁠⸝⁠)⁠╯';
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: Date.now() };
      const updated = [...newMessages, assistantMsg];
      setMessages(updated);
      saveChat(updated);
    } catch {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Yahh... ada error nih, coba lagi nanti ya! ╰⁠(⁠⸝⁠⸝⁠´⁠꒳⁠`⁠⸝⁠⸝⁠)⁠╯', timestamp: Date.now() };
      const updated = [...newMessages, errorMsg];
      setMessages(updated);
      saveChat(updated);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <main className="h-screen flex flex-col bg-background">
      <Header />
      {/* Chat Header */}
      <div className="px-4 py-3 bg-card/80 backdrop-blur-lg border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={KANA_AVATAR} alt="Arima Kana" className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/50" />
          <div>
            <h2 className="text-sm font-bold text-foreground">Arima Kana</h2>
            <p className="text-[10px] text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Online
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="p-2 rounded-lg bg-muted hover:bg-destructive/10 transition" title="Hapus chat">
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <img src={KANA_AVATAR} alt="Arima Kana" className="w-20 h-20 rounded-full object-cover ring-4 ring-pink-500/30 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-foreground mb-1">Chat dengan Arima Kana!</h3>
            <p className="text-xs text-muted-foreground">Ngobrol bareng Kana-chan dari Oshi no Ko~</p>
            <p className="text-xs text-muted-foreground mt-1">Chat kamu bersifat pribadi & tersimpan lokal</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Halo Kana! 👋', 'Ceritain tentang dirimu!', 'Kana suka anime apa?'].map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="px-3 py-1.5 bg-card border border-border/50 rounded-full text-xs text-muted-foreground hover:text-foreground hover:border-pink-500/50 transition">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <img src={KANA_AVATAR} alt="Kana" className="w-7 h-7 rounded-full object-cover mr-2 flex-shrink-0 mt-1 ring-1 ring-pink-500/30" />
              )}
              <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'gradient-bg text-primary-foreground rounded-br-md'
                  : 'bg-card text-foreground rounded-bl-md border border-border/30'
              }`}>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <img src={KANA_AVATAR} alt="Kana" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-pink-500/30" />
            <div className="px-4 py-3 bg-card rounded-2xl rounded-bl-md border border-border/30">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-3 bg-background/95 backdrop-blur-lg">
        <div className="flex gap-2 items-end">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Chat dengan Kana-chan..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-card border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/50 disabled:opacity-50"
          />
          <button onClick={handleSend} disabled={!input.trim() || loading} className="p-2.5 bg-pink-500 hover:bg-pink-600 rounded-2xl text-white disabled:opacity-50 transition">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
