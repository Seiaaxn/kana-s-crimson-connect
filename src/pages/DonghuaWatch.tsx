import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDonghuaEpisode } from '@/lib/api';
import { addHistory } from '@/lib/storage';
import { CommentSection } from '@/components/CommentSection';
import { ExpEarn } from '@/components/ExpEarn';
import { BottomNav } from '@/components/BottomNav';
import type { DonghuaEpisodeDetail } from '@/lib/types';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Download, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function DonghuaWatchPage() {
  const { episodeSlug } = useParams<{ episodeSlug: string }>();
  const [episode, setEpisode] = useState<DonghuaEpisodeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStream, setActiveStream] = useState(0);
  const [showDownload, setShowDownload] = useState(false);
  const [widescreen, setWidescreen] = useState(true);

  useEffect(() => {
    if (!episodeSlug) return;
    setLoading(true);
    getDonghuaEpisode(episodeSlug).then(d => {
      setEpisode(d);
      setLoading(false);
      if (d) addHistory({ type: 'donghua', contentId: d.navigation.all_slug, title: d.title, poster: d.anime_info?.thumbnail || '', episodeId: episodeSlug, episodeTitle: d.title });
    }).catch(() => setLoading(false));
  }, [episodeSlug]);

  const streamUrl = episode?.streams[activeStream]?.url || '';

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!episode) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Episode tidak ditemukan</div>;

  const downloads = episode.downloads || [];

  return (
    <main className="min-h-screen bg-background pb-20">
      <ExpEarn source="watch_donghua" contentId={episodeSlug!} contentTitle={episode.title} />
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to={`/donghua/${episode.navigation.all_slug}`} className="flex items-center gap-2 text-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" /><span className="text-sm font-medium">Kembali</span>
          </Link>
          <button onClick={() => setWidescreen(!widescreen)} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition">
            {widescreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {widescreen ? '16:9' : '4:3'}
          </button>
        </div>
      </header>
      <div className={cn('w-full bg-black', widescreen ? 'aspect-video' : 'aspect-[4/3]')}>
        <iframe src={streamUrl} className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" />
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-4 space-y-4">
        <h1 className="text-lg font-display font-bold text-foreground">{episode.title}</h1>
        <div className="flex gap-2">
          {episode.navigation.prev_slug && (
            <Link to={`/donghua-watch/${episode.navigation.prev_slug}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-muted rounded-lg text-sm font-medium text-foreground hover:bg-muted/80 transition">
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </Link>
          )}
          {episode.navigation.next_slug && (
            <Link to={`/donghua-watch/${episode.navigation.next_slug}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 gradient-bg rounded-lg text-sm font-medium text-primary-foreground">
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        {episode.streams.length > 1 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Server</h3>
            <div className="flex flex-wrap gap-2">
              {episode.streams.map((s, i) => (
                <button key={i} onClick={() => setActiveStream(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${i === activeStream ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                  {s.server}
                </button>
              ))}
            </div>
          </div>
        )}
        {downloads.length > 0 && (
          <div className="space-y-2">
            <button onClick={() => setShowDownload(!showDownload)} className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Download className="w-4 h-4 text-primary" /> Download Episode
              <ChevronRight className={`w-4 h-4 transition-transform ${showDownload ? 'rotate-90' : ''}`} />
            </button>
            {showDownload && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pl-2">
                {downloads.map((dl: any, i: number) => (
                  <a key={i} href={dl.url || dl.link || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-xs font-medium text-foreground hover:text-primary transition">
                    <ExternalLink className="w-3 h-3" /> {dl.title || dl.server || `Download ${i + 1}`}
                  </a>
                ))}
              </motion.div>
            )}
          </div>
        )}
        <CommentSection contentId={episodeSlug!} contentType="donghua" />
      </motion.div>
      <BottomNav />
    </main>
  );
}
