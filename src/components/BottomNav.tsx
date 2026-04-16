import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, BookOpen, Tv, Heart, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Beranda' },
  { href: '/genres', icon: LayoutGrid, label: 'Genre' },
  { href: '/discussion', icon: MessageSquare, label: 'Diskusi' },
  { href: '/all-comic', icon: BookOpen, label: 'Komik' },
  { href: '/all-donghua', icon: Tv, label: 'Donghua' },
  { href: '/favorites', icon: Heart, label: 'Favorit' },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'fill-primary/20')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
