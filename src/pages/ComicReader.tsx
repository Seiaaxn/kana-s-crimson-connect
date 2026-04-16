import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComicChapter } from '@/lib/api';
import { addHistory } from '@/lib/storage';
import { ExpEarn } from '@/components/ExpEarn';
import { BottomNav } from '@/components/BottomNav';
import type { ComicChapterDetail } from '@/lib/types';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ComicReaderPage() {
  const { chapterSlug } = useParams<{ chapterSlug: string }>();
  const [chapter, setChapter] = useState<ComicChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterSlug) return;
    setLoading(true);
    getComicChapter(chapterSlug).then(d => {
      setChapter(d);
      setLoading(false);
      if (d) addHistory({ type: 'comic', contentId: d.navigation.chapterList, title: d.manga_title, poster: d.images[0] || '', chapterSlug, chapterTitle: d.chapter_title });
    }).catch(() => setLoading(false));
  }, [chapterSlug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!chapter) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Chapter tidak ditemukan</div>;

  return (
    <main className="min-h-screen bg-background pb-20">
      <ExpEarn source="read_comic" contentId={chapterSlug!} contentTitle={chapter.chapter_title} />
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to={`/comic/${chapter.navigation.chapterList}`} className="flex items-center gap-2 text-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium text-foreground truncate flex-1 text-center">{chapter.chapter_title}</span>
          <div className="w-5" />
        </div>
      </header>

      <div className="flex justify-center gap-2 py-3 px-4">
        {chapter.navigation.previousChapter && (
          <Link to={`/read/${chapter.navigation.previousChapter}`} className="flex items-center gap-1 px-4 py-2 bg-muted rounded-lg text-sm font-medium text-foreground">
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </Link>
        )}
        {chapter.navigation.nextChapter && (
          <Link to={`/read/${chapter.navigation.nextChapter}`} className="flex items-center gap-1 px-4 py-2 gradient-bg rounded-lg text-sm font-medium text-primary-foreground">
            Selanjutnya <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="max-w-3xl mx-auto">
        {chapter.images.map((img, i) => (
          <img key={i} src={img} alt={`Page ${i + 1}`} className="w-full" loading="lazy" />
        ))}
      </div>

      <div className="flex justify-center gap-2 py-4 px-4">
        {chapter.navigation.previousChapter && (
          <Link to={`/read/${chapter.navigation.previousChapter}`} className="flex items-center gap-1 px-4 py-2 bg-muted rounded-lg text-sm font-medium text-foreground">
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </Link>
        )}
        {chapter.navigation.nextChapter && (
          <Link to={`/read/${chapter.navigation.nextChapter}`} className="flex items-center gap-1 px-4 py-2 gradient-bg rounded-lg text-sm font-medium text-primary-foreground">
            Selanjutnya <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
