import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { HeroCarousel } from '@/components/HeroCarousel';
import { SearchBar } from '@/components/SearchBar';
import { DailyLoginBonus } from '@/components/DailyLoginBonus';
import { SectionTitle } from '@/components/SectionTitle';
import { AnimeCard } from '@/components/AnimeCard';
import { ComicCard } from '@/components/ComicCard';
import { DonghuaCard } from '@/components/DonghuaCard';
import { getHome, getComicHomepage, getDonghuaHome, getSchedule } from '@/lib/api';
import type { Anime, Comic, DonghuaItem, ScheduleDay } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { ScheduleSection } from '@/components/ScheduleSection';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [ongoingAnime, setOngoingAnime] = useState<Anime[]>([]);
  const [completedAnime, setCompletedAnime] = useState<Anime[]>([]);
  const [latestComics, setLatestComics] = useState<Comic[]>([]);
  const [popularComics, setPopularComics] = useState<Comic[]>([]);
  const [donghuaSlider, setDonghuaSlider] = useState<DonghuaItem[]>([]);
  const [donghuaPopular, setDonghuaPopular] = useState<DonghuaItem[]>([]);
  const [donghuaLatest, setDonghuaLatest] = useState<DonghuaItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [showMoreAnime, setShowMoreAnime] = useState(false);
  const [showMoreComic, setShowMoreComic] = useState(false);
  const [showMoreDonghua, setShowMoreDonghua] = useState(false);
  const [showMorePopularComic, setShowMorePopularComic] = useState(false);
  const [showMoreDonghuaLatest, setShowMoreDonghuaLatest] = useState(false);

  useEffect(() => {
    Promise.all([getHome(), getComicHomepage(), getDonghuaHome(), getSchedule()]).then(([home, comic, donghua, sched]) => {
      setOngoingAnime(home.ongoing?.animeList || []);
      setCompletedAnime(home.completed?.animeList || []);
      setLatestComics(comic.latest || []);
      setPopularComics(comic.popular || []);
      setDonghuaSlider(donghua.slider || []);
      setDonghuaPopular(donghua.popular || []);
      setDonghuaLatest(donghua.latest || []);
      setSchedule(sched);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      <BottomNav />
    </main>
  );

  return (
    <main className="min-h-screen bg-background">
      <DailyLoginBonus />
      <Header />
      <div className="px-4 space-y-6 pb-24 pt-4">
        <HeroCarousel animeList={ongoingAnime} donghuaList={donghuaSlider} />
        <SearchBar />

        {/* Anime Ongoing */}
        {ongoingAnime.length > 0 && (
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionTitle title="Anime Terbaru" href="/all-anime?tab=ongoing" showMore />
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {ongoingAnime.slice(0, showMoreAnime ? 18 : 6).map(a => <AnimeCard key={a.animeId} anime={a} />)}
            </div>
            {ongoingAnime.length > 6 && !showMoreAnime && (
              <button onClick={() => setShowMoreAnime(true)} className="w-full mt-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
                Muat Lebih Banyak
              </button>
            )}
          </motion.section>
        )}

        {/* Completed Anime */}
        {completedAnime.length > 0 && (
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionTitle title="Anime Selesai" href="/all-anime?tab=completed" showMore />
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {completedAnime.slice(0, 6).map(a => <AnimeCard key={a.animeId} anime={a} showScore showEpisode={false} />)}
            </div>
          </motion.section>
        )}

        {/* Donghua Popular */}
        {donghuaPopular.length > 0 && (
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionTitle title="Donghua Populer" href="/all-donghua?tab=popular" showMore />
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {donghuaPopular.slice(0, showMoreDonghua ? 18 : 6).map((d, i) => <DonghuaCard key={i} item={d} />)}
            </div>
            {donghuaPopular.length > 6 && !showMoreDonghua && (
              <button onClick={() => setShowMoreDonghua(true)} className="w-full mt-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
                Muat Lebih Banyak
              </button>
            )}
          </motion.section>
        )}

        {/* Donghua Latest */}
        {donghuaLatest.length > 0 && (
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionTitle title="Donghua Terbaru" href="/all-donghua?tab=latest" showMore />
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {donghuaLatest.slice(0, showMoreDonghuaLatest ? 18 : 6).map((d, i) => <DonghuaCard key={i} item={d} />)}
            </div>
            {donghuaLatest.length > 6 && !showMoreDonghuaLatest && (
              <button onClick={() => setShowMoreDonghuaLatest(true)} className="w-full mt-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
                Muat Lebih Banyak
              </button>
            )}
          </motion.section>
        )}

        {/* Comics Latest */}
        {latestComics.length > 0 && (
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionTitle title="Komik Terbaru" href="/all-comic?tab=terbaru" showMore />
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {latestComics.slice(0, showMoreComic ? 18 : 6).map((c, i) => <ComicCard key={i} comic={c} />)}
            </div>
            {latestComics.length > 6 && !showMoreComic && (
              <button onClick={() => setShowMoreComic(true)} className="w-full mt-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
                Muat Lebih Banyak
              </button>
            )}
          </motion.section>
        )}

        {/* Popular Comics */}
        {popularComics.length > 0 && (
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionTitle title="Komik Populer" href="/all-comic?tab=populer" showMore />
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {popularComics.slice(0, showMorePopularComic ? 18 : 6).map((c, i) => <ComicCard key={i} comic={c} />)}
            </div>
            {popularComics.length > 6 && !showMorePopularComic && (
              <button onClick={() => setShowMorePopularComic(true)} className="w-full mt-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
                Muat Lebih Banyak
              </button>
            )}
          </motion.section>
        )}

        {/* Schedule */}
        {schedule.length > 0 && (
          <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionTitle title="Jadwal Anime" href="/schedule" showMore />
            <ScheduleSection schedule={schedule} />
          </motion.section>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
