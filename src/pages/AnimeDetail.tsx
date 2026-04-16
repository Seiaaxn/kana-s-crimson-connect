import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { FavoriteButton } from '@/components/FavoriteButton';
import { getAnimeDetail } from '@/lib/api';
import type { AnimeDetail } from '@/lib/types';
import { Loader2, ArrowLeft, Play, Star, Film, Tv, Clock, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnimeDetailPage() {
  const { animeId } = useParams<{ animeId: string }>();
  const [detail, setDetail] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllEps, setShowAllEps] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  useEffect(() => {
    if (!animeId) return;
    setLoading(true);
    getAnimeDetail(animeId).then(d => { setDetail(d); setLoading(false); }).catch(() => setLoading(false));
  }, [animeId]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!detail) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Anime tidak ditemukan</div>;

  const eps = showAllEps ? detail.episodeList : detail.episodeList.slice(0, 20);
  const synopsisText = detail.synopsis?.paragraphs.join('\n') || '';

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Hero Banner */}
      <div className="relative">
        <img src={detail.poster} alt={detail.title} className="w-full h-72 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute top-0 left-0 right-0 z-40">
          <div className="flex items-center justify-between h-14 px-4">
            <Link to="/" className="flex items-center gap-2 text-white hover:text-primary backdrop-blur-sm bg-black/20 rounded-full px-3 py-1.5">
              <ArrowLeft className="w-5 h-5" /><span className="text-sm font-medium">Kembali</span>
            </Link>
            <div className="backdrop-blur-sm bg-black/20 rounded-full p-1">
              <FavoriteButton contentId={animeId!} type="anime" title={detail.title} poster={detail.poster} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-24 relative z-10 space-y-4">
        {/* Poster + Title */}
        <div className="flex gap-4">
          <img src={detail.poster} alt={detail.title} className="w-28 h-40 rounded-xl object-cover shadow-2xl flex-shrink-0 ring-2 ring-border/50" />
          <div className="flex-1 pt-10 space-y-2">
            <h1 className="text-lg font-display font-bold text-foreground line-clamp-2">{detail.title}</h1>
            {detail.score && (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2.5 py-1 rounded-lg w-fit">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">{detail.score}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {detail.genreList?.map(g => (
                <Link key={g.genreId} to={`/genre/${g.genreId}`} className="text-[10px] px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition">{g.title}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-2">
          {detail.type && (
            <div className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border/30">
              <Film className="w-4 h-4 text-primary" />
              <div><p className="text-[10px] text-muted-foreground">Tipe</p><p className="text-xs font-medium text-foreground">{detail.type}</p></div>
            </div>
          )}
          {detail.status && (
            <div className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border/30">
              <Tv className="w-4 h-4 text-primary" />
              <div><p className="text-[10px] text-muted-foreground">Status</p><p className="text-xs font-medium text-foreground">{detail.status}</p></div>
            </div>
          )}
          {detail.episodes && (
            <div className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border/30">
              <Clock className="w-4 h-4 text-primary" />
              <div><p className="text-[10px] text-muted-foreground">Episode</p><p className="text-xs font-medium text-foreground">{detail.episodes}</p></div>
            </div>
          )}
          {detail.studios && (
            <div className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border/30">
              <Building2 className="w-4 h-4 text-primary" />
              <div><p className="text-[10px] text-muted-foreground">Studio</p><p className="text-xs font-medium text-foreground">{detail.studios}</p></div>
            </div>
          )}
        </motion.div>

        {/* Synopsis */}
        {synopsisText && (
          <div>
            <h3 className="font-display font-bold text-foreground mb-2">Sinopsis</h3>
            <p className={`text-sm text-muted-foreground leading-relaxed ${!showFullSynopsis && 'line-clamp-4'}`}>{synopsisText}</p>
            {synopsisText.length > 200 && (
              <button onClick={() => setShowFullSynopsis(!showFullSynopsis)} className="text-xs text-primary font-medium mt-1">
                {showFullSynopsis ? 'Sembunyikan' : 'Baca selengkapnya'}
              </button>
            )}
          </div>
        )}

        {/* First Episode CTA */}
        {detail.episodeList.length > 0 && (
          <Link to={`/watch/${detail.episodeList[detail.episodeList.length - 1].episodeId}`} className="flex items-center justify-center gap-2 py-3 gradient-bg rounded-xl text-sm font-bold text-primary-foreground shadow-lg">
            <Play className="w-5 h-5 fill-current" /> Mulai Tonton
          </Link>
        )}

        {/* Episode List */}
        <div>
          <h3 className="font-display font-bold text-foreground mb-2">Episode ({detail.episodeList.length})</h3>
          <div className="space-y-1.5">
            {eps.map(ep => (
              <Link key={ep.episodeId} to={`/watch/${ep.episodeId}`} className="flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-card/80 transition group border border-border/20">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                  <Play className="w-3.5 h-3.5 text-primary-foreground fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition">{ep.title}</p>
                  <p className="text-[10px] text-muted-foreground">{ep.date}</p>
                </div>
              </Link>
            ))}
          </div>
          {detail.episodeList.length > 20 && !showAllEps && (
            <button onClick={() => setShowAllEps(true)} className="w-full mt-2 py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition">Lihat Semua Episode</button>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
