import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import SkeletonLoader from './components/common/SkeletonLoader';
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/responsive.css';
import './App.css';

// Auth pages
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
import AdminUsers from './pages/admin/Users';
import AdminAnalytics from './pages/admin/Analytics';
import AdminModeration from './pages/admin/Moderation';
import AdminMonetization from './pages/admin/Monetization';
import AdminNotifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/Settings';
import AdminAuditLogs from './pages/admin/AuditLogs';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'));
const EpisodePlayer = lazy(() => import('./pages/EpisodePlayer'));
const Library = lazy(() => import('./pages/Library'));
const Trending = lazy(() => import('./pages/Trending'));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const SearchResults = lazy(() => import('./components/search/SearchResults'));
const Categories = lazy(() => import('./pages/Categories'));
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'));
const TopRated = lazy(() => import('./pages/TopRated'));
const NewReleases = lazy(() => import('./pages/NewReleases'));
const Subscription = lazy(() => import('./pages/Subscription'));
const NovelsPage = lazy(() => import('./pages/NovelsPage'));
const NovelDetail = lazy(() => import('./pages/NovelDetail'));
const ChapterReader = lazy(() => import('./pages/ChapterReader'));
const CreatorNovels = lazy(() => import('./components/creator/CreatorNovels'));
const UploadNovel = lazy(() => import('./components/creator/UploadNovel'));
const AddChapter = lazy(() => import('./components/creator/AddChapter'));

const PageLoader = () => (
  <div className="page-loader">
    <SkeletonLoader type="card" count={6} />
  </div>
);

const toastOptions = {
  duration: 3000,
  position: 'top-right',
  style: {
    background: '#1a1a2e',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '14px 18px',
    fontSize: '14px',
  },
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AudioProvider>
            <Router>
              <div className="app">
                <Toaster toastOptions={toastOptions} />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Auth routes */}
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/signup" element={<SignupForm />} />
                    <Route path="/auth" element={<LoginForm />} />

                    {/* Admin routes – ENABLED */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="/admin/users" replace />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="moderation" element={<AdminModeration />} />
                      <Route path="monetization" element={<AdminMonetization />} />
                      <Route path="notifications" element={<AdminNotifications />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="audit-logs" element={<AdminAuditLogs />} />
                    </Route>

                    {/* Main layout routes */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/trending" element={<Trending />} />
                      <Route path="/series/:id" element={<SeriesDetail />} />
                      <Route path="/play/:id" element={<EpisodePlayer />} />
                      <Route path="/search" element={<SearchResults />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/categories/:slug" element={<CategoryDetail />} />
                      <Route path="/new-releases" element={<NewReleases />} />
                      <Route path="/top-rated" element={<TopRated />} />
                      <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                      <Route path="/history" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                      <Route path="/bookmarks" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                      <Route path="/liked" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                      <Route path="/following" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
                      <Route path="/become-creator" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/novels" element={<NovelsPage />} />
                      <Route path="/novels/:id" element={<NovelDetail />} />
                      <Route path="/novels/:novelId/read/:chapterId" element={<ChapterReader />} />
                      <Route path="/creator/dashboard" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/tts" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/series" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/series/new" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/series/:seriesId" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/series/:seriesId/edit" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/episodes/upload" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/followers" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/analytics" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/novels" element={<ProtectedRoute requireCreator><CreatorNovels /></ProtectedRoute>} />
                      <Route path="/creator/novels/new" element={<ProtectedRoute requireCreator><UploadNovel /></ProtectedRoute>} />
                      <Route path="/creator/novels/:novelId/chapters" element={<ProtectedRoute requireCreator><CreatorNovels /></ProtectedRoute>} />
                      <Route path="/creator/novels/:novelId/chapters/new" element={<ProtectedRoute requireCreator><AddChapter /></ProtectedRoute>} />
                      <Route path="*" element={<div className="not-found-page"><h1>404</h1><h2>Page Not Found</h2><a href="/">Go to Home</a></div>} />
                    </Route>
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </AudioProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
