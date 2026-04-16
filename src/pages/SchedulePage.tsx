import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { getSchedule, getDonghuaSchedule } from '@/lib/api';
import type { ScheduleDay, DonghuaSchedule } from '@/lib/types';
import { Loader2, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const dayNamesShort: Record<string, string> = { Senin: 'Sen', Selasa: 'Sel', Rabu: 'Rab', Kamis: 'Kam', Jumat: 'Jum', Sabtu: 'Sab', Minggu: 'Min' };

function getTodayDay(): string {
  return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date().getDay()];
}

export default function SchedulePage() {
  const [animeSchedule, setAnimeSchedule] = useState<ScheduleDay[]>([]);
  const [donghuaSchedule, setDonghuaSchedule] = useState<DonghuaSchedule>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'anime' | 'donghua'>('anime');
  const today = getTodayDay();
  const [activeAnimeDay, setActiveAnimeDay] = useState(today);
  const [activeDonghuaDay, setActiveDonghuaDay] = useState('');

  useEffect(() => {
    Promise.all([getSchedule(), getDonghuaSchedule()]).then(([a, d]) => {
      setAnimeSchedule(a);
      setDonghuaSchedule(d);
      const days = Object.keys(d);
      if (days.length > 0) setActiveDonghuaDay(days[0]);
      setLoading(false);
    });
  }, []);

  const activeAnimeList = animeSchedule.find(s => s.day === activeAnimeDay)?.anime_list || [];
  const donghuaDays = Object.keys(donghuaSchedule);
  const activeDonghuaList = donghuaSchedule[activeDonghuaDay] || [];

  const renderDayPills = (
    days: { key: string; label: string; count: number }[],
    activeDay: string,
    setDay: (d: string) => void
  ) => (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
      {days.map(day => (
        <button key={day.key} onClick={() => setDay(day.key)} className={cn(
          'flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all min-w-[56px] relative',
          activeDay === day.key
            ? 'gradient-bg text-primary-foreground shadow-lg scale-105'
            : 'bg-card text-muted-foreground hover:bg-card/80 border border-border',
          day.key === today && activeDay !== day.key && 'ring-2 ring-primary/40'
        )}>
          <span className="font-bold">{day.label}</span>
          <span className="text-[10px] opacity-70">{day.count} judul</span>
          {day.key === today && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background" />}
        </button>
      ))}
    </div>
  );

  const renderAnimeGrid = (items: { title: string; slug: string; poster: string }[], linkPrefix: string) => (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab === 'anime' ? activeAnimeDay : activeDonghuaDay}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      >
        {items.length > 0 ? items.map((item, i) => (
          <Link key={`${item.slug}-${i}`} to={`${linkPrefix}${item.slug}`} className="group">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted shadow-md">
              <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Clock className="w-3 h-3 text-primary-foreground" />
                  <span className="text-[10px] text-primary-foreground">Tayang hari ini</span>
                </div>
              </div>
            </div>
            <h4 className="mt-2 text-[11px] font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {item.title.split('\t')[0]}
            </h4>
          </Link>
        )) : (
          <p className="col-span-full text-center py-8 text-sm text-muted-foreground">Tidak ada jadwal untuk hari ini</p>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-display font-bold text-foreground">Jadwal Tayang</h1>
        </div>

        <div className="flex gap-2">
          {(['anime', 'donghua'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn(
              'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
              tab === t ? 'gradient-bg text-primary-foreground shadow-lg' : 'bg-card text-muted-foreground hover:text-foreground border border-border'
            )}>
              {t === 'anime' ? 'Anime' : 'Donghua'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === 'anime' ? (
              <motion.div key="anime" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                {renderDayPills(
                  animeSchedule.map(s => ({ key: s.day, label: dayNamesShort[s.day] || s.day, count: s.anime_list.length })),
                  activeAnimeDay,
                  setActiveAnimeDay
                )}
                {renderAnimeGrid(activeAnimeList, '/anime/')}
              </motion.div>
            ) : (
              <motion.div key="donghua" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                {renderDayPills(
                  donghuaDays.map(d => ({ key: d, label: dayNamesShort[d] || d, count: donghuaSchedule[d]?.length || 0 })),
                  activeDonghuaDay,
                  setActiveDonghuaDay
                )}
                {renderAnimeGrid(
                  activeDonghuaList.map(item => ({ title: item.title.split('\t')[0], slug: item.slug, poster: item.poster })),
                  '/donghua/'
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
