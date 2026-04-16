import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComicDetail } from '@/lib/api';
import { FavoriteButton } from '@/components/FavoriteButton';
import { CommentSection } from '@/components/CommentSection';
import { BottomNav } from '@/components/BottomNav';
import type { ComicDetail } from '@/lib/types';
import { Loader2, ArrowLeft, BookOpen, ChevronDown, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [detail, setDetail] = useState<ComicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getComicDetail(slug).then(d => { setDetail(d); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!detail) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Komik tidak ditemukan</div>;

  const sortedChapters = sortAsc ? [...(detail.chapters || [])] : [...(detail.chapters || [])].reverse();
  const chapters = showAllChapters ? sortedChapters : sortedChapters.slice(0, 30);

  // Extract chapter number from title or chapter field
  const getChapterNum = (text: string | undefined) => {
    if (!text) return null;
    const match = text.match(/Chapter\s*(\d+)/i) || text.match(/Ch\.?\s*(\d+)/i);
    return match ? match[1] : null;
  };

  const getChapterTitle = (ch: any) => ch.title || ch.chapter || 'Chapter';

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Hero Banner */}
      <div className="relative h-56 overflow-hidden">
        <img src={detail.image} alt={detail.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <header className="absolute top-0 left-0 right-0 z-40">
          <div className="flex items-center justify-between h-14 px-4">
            <Link to="/all-comic" className="flex items-center gap-2 text-white hover:text-primary bg-black/30 rounded-full px-3 py-1.5 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4" /><span className="text-xs">Kembali</span>
            </Link>
            <div className="bg-black/30 rounded-full backdrop-blur-sm">
              <FavoriteButton contentId={slug!} type="comic" title={detail.title} poster={detail.image} />
            </div>
          </div>
        </header>
      </div>

      <div className="px-4 -mt-20 relative z-10 space-y-4">
        {/* Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
          <img src={detail.image} alt={detail.title} className="w-28 h-40 rounded-xl object-cover shadow-2xl flex-shrink-0 ring-2 ring-background" />
          <div className="flex-1 space-y-2 pt-6">
            <h1 className="text-lg font-display font-bold text-foreground line-clamp-2">{detail.title}</h1>
            <div className="text-xs text-muted-foreground space-y-1">
              {detail.metadata.type && (
                <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium mr-1">{detail.metadata.type}</span>
              )}
              {detail.metadata.status && (
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${detail.metadata.status === 'Ongoing' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>{detail.metadata.status}</span>
              )}
            </div>
            {detail.metadata.author && <p className="text-[11px] text-muted-foreground">✍️ {detail.metadata.author}</p>}
            <div className="flex flex-wrap gap-1">
              {detail.genres?.slice(0, 5).map(g => (
                <Link key={g.slug} to={`/comic-genre/${g.slug}`} className="text-[9px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full hover:bg-primary/20 transition">{g.name}</Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Synopsis */}
        {detail.synopsis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h3 className="font-display font-bold text-foreground mb-2 text-sm">Sinopsis</h3>
            <p className="text-xs text-muted-foreground leading-relaxed bg-card p-3 rounded-xl border border-border/30">{detail.synopsis}</p>
          </motion.div>
        )}

        {/* Chapters */}
        {detail.chapters && detail.chapters.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-foreground text-sm">Chapter ({detail.chapters.length})</h3>
              <button onClick={() => setSortAsc(!sortAsc)} className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-1 rounded-full">
                <ChevronDown className={`w-3 h-3 transition-transform ${sortAsc ? '' : 'rotate-180'}`} />
                {sortAsc ? 'Terlama' : 'Terbaru'}
              </button>
            </div>
            <div className="space-y-1.5">
              {chapters.map((ch, i) => {
                const chTitle = getChapterTitle(ch);
                const num = getChapterNum(chTitle);
                return (
                  <motion.div key={ch.slug || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}>
                    <Link to={`/read/${ch.slug}`} className="flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-primary/5 transition group border border-border/20">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {num ? <span className="text-xs font-bold text-primary">{num}</span> : <Hash className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition">{chTitle}</p>
                        {ch.date && <p className="text-[10px] text-muted-foreground">{ch.date}</p>}
                      </div>
                      <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition flex-shrink-0" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            {detail.chapters.length > 30 && !showAllChapters && (
              <button onClick={() => setShowAllChapters(true)} className="w-full mt-3 py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition">
                Lihat Semua Chapter ({detail.chapters.length})
              </button>
            )}
          </motion.div>
        )}

        <CommentSection contentId={slug!} contentType="comic" />
      </div>
      <BottomNav />
    </main>
  );
}
