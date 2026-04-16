import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDonghuaDetail } from '@/lib/api';
import { FavoriteButton } from '@/components/FavoriteButton';
import { BottomNav } from '@/components/BottomNav';
import type { DonghuaDetail } from '@/lib/types';
import { Loader2, ArrowLeft, Play } from 'lucide-react';

export default function DonghuaDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [detail, setDetail] = useState<DonghuaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllEps, setShowAllEps] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getDonghuaDetail(slug).then(d => { setDetail(d); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!detail) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Donghua tidak ditemukan</div>;

  const eps = showAllEps ? detail.episodes : detail.episodes?.slice(0, 20);

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/all-donghua" className="flex items-center gap-2 text-foreground hover:text-primary"><ArrowLeft className="w-5 h-5" /><span className="text-sm">Kembali</span></Link>
          <FavoriteButton contentId={slug!} type="donghua" title={detail.title} poster={detail.poster} />
        </div>
      </header>

      <div className="relative">
        <img src={detail.poster} alt={detail.title} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="px-4 -mt-20 relative z-10 space-y-4">
        <div className="flex gap-4">
          <img src={detail.poster} alt={detail.title} className="w-28 h-40 rounded-lg object-cover shadow-lg flex-shrink-0" />
          <div className="flex-1 pt-8 space-y-2">
            <h1 className="text-lg font-display font-bold text-foreground line-clamp-2">{detail.title}</h1>
            <div className="flex flex-wrap gap-1.5">
              {detail.genres?.map(g => (
                <span key={g.name} className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">{g.name}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {detail.info.status && <div><span className="font-medium text-foreground">Status:</span> {detail.info.status}</div>}
          {detail.info.studio && <div><span className="font-medium text-foreground">Studio:</span> {detail.info.studio}</div>}
          {detail.info.episodes && <div><span className="font-medium text-foreground">Episode:</span> {detail.info.episodes}</div>}
          {detail.info.country && <div><span className="font-medium text-foreground">Negara:</span> {detail.info.country}</div>}
        </div>

        {detail.synopsis && (
          <div>
            <h3 className="font-display font-bold text-foreground mb-1">Sinopsis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{detail.synopsis}</p>
          </div>
        )}

        {eps && eps.length > 0 && (
          <div>
            <h3 className="font-display font-bold text-foreground mb-2">Episode ({detail.episodes.length})</h3>
            <div className="space-y-1.5">
              {eps.map(ep => (
                <Link key={ep.slug} to={`/donghua-watch/${ep.slug}`} className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-card/80 transition group">
                  <Play className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition">Episode {ep.episode}</p>
                    <p className="text-[10px] text-muted-foreground">{ep.date}</p>
                  </div>
                </Link>
              ))}
            </div>
            {detail.episodes.length > 20 && !showAllEps && (
              <button onClick={() => setShowAllEps(true)} className="w-full mt-2 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg">Lihat Semua Episode</button>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
