import { Link } from 'react-router-dom';
import { Search, User, Sun, Moon, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { NotificationBell } from './NotificationBell';

const LOGO_URL = 'https://cdn.phototourl.com/free/2026-04-15-dbc2ede5-53df-434f-97b7-1a684467a4a7.jpg';

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const displayName = user?.displayName || user?.email?.split('@')[0];
  const avatar = user?.photoURL;

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="ShinKanimeID" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-xl font-display font-bold">
            <span className="gradient-text">SHINKAN</span>
            <span className="text-foreground">IMEID</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/arima-chat" className="p-2 rounded-full hover:bg-muted transition-colors" title="Chat Kana AI">
            <Bot className="w-5 h-5 text-pink-500" />
          </Link>

          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
          </button>

          <Link to="/search" className="p-2 rounded-full hover:bg-muted transition-colors">
            <Search className="w-5 h-5 text-foreground" />
          </Link>

          <NotificationBell />

          <Link to={user ? '/profile' : '/login'} className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted transition-colors">
            {user ? (
              <>
                {avatar ? (
                  <img src={avatar} alt={displayName || ''} className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/50" />
                ) : (
                  <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">{(displayName || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className="text-sm font-medium text-foreground max-w-[80px] truncate hidden sm:inline">{displayName}</span>
              </>
            ) : (
              <>
                <User className="w-5 h-5 text-foreground" />
                <span className="text-sm text-muted-foreground hidden sm:inline">Masuk</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
