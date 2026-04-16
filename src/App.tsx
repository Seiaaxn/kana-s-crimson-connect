import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnimeDetail from "./pages/AnimeDetail";
import WatchPage from "./pages/WatchPage";
import ComicDetail from "./pages/ComicDetail";
import ComicReader from "./pages/ComicReader";
import DonghuaDetail from "./pages/DonghuaDetail";
import DonghuaWatch from "./pages/DonghuaWatch";
import SearchPage from "./pages/SearchPage";
import GenresPage from "./pages/GenresPage";
import GenreAnime from "./pages/GenreAnime";
import ComicGenrePage from "./pages/ComicGenrePage";
import DonghuaGenrePage from "./pages/DonghuaGenrePage";
import FavoritesPage from "./pages/FavoritesPage";
import HistoryPage from "./pages/HistoryPage";
import SchedulePage from "./pages/SchedulePage";
import AllAnimePage from "./pages/AllAnimePage";
import AllComicPage from "./pages/AllComicPage";
import AllDonghuaPage from "./pages/AllDonghuaPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";
import ChatPage from "./pages/ChatPage";
import PremiumPage from "./pages/PremiumPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import UserProfilePage from "./pages/UserProfilePage";
import AchievementsPage from "./pages/AchievementsPage";
import DiscussionPage from "./pages/DiscussionPage";
import AdminPanel from "./pages/AdminPanel";
import SharePremiumPage from "./pages/SharePremiumPage";
import ArimaChatPage from "./pages/ArimaChatPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/anime/:animeId" element={<AnimeDetail />} />
              <Route path="/watch/:episodeId" element={<WatchPage />} />
              <Route path="/comic/:slug" element={<ComicDetail />} />
              <Route path="/read/:chapterSlug" element={<ComicReader />} />
              <Route path="/donghua/:slug" element={<DonghuaDetail />} />
              <Route path="/donghua-watch/:episodeSlug" element={<DonghuaWatch />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/genres" element={<GenresPage />} />
              <Route path="/genre/:genreId" element={<GenreAnime />} />
              <Route path="/comic-genre/:genre" element={<ComicGenrePage />} />
              <Route path="/donghua-genre/:genre" element={<DonghuaGenrePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/all-anime" element={<AllAnimePage />} />
              <Route path="/all-comic" element={<AllComicPage />} />
              <Route path="/all-donghua" element={<AllDonghuaPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/chat/:friendId" element={<ChatPage />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/user/:userId" element={<UserProfilePage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/discussion" element={<DiscussionPage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/share-premium" element={<SharePremiumPage />} />
              <Route path="/arima-chat" element={<ArimaChatPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
