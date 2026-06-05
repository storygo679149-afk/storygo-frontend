import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import DatabaseUsers from './pages/admin/DatabaseUsers';
import VerifyOTP from './components/auth/VerifyOTP'; // ✅ Already imported — kuch change nahi

// ------------- Existing page imports -------------
const Home = lazy(() => import('./pages/Home'));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'));
const EpisodePlayer = lazy(() => import('./pages/EpisodePlayer'));
const Library = lazy(() => import('./pages/Library'));
const Trending = lazy(() => import('./pages/Trending'));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Auth = lazy(() => import('./pages/Auth'));
const SearchResults = lazy(() => import('./components/search/SearchResults'));
const Categories = lazy(() => import('./pages/Categories'));
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'));
const TopRated = lazy(() => import('./pages/TopRated'));
const NewReleases = lazy(() => import('./pages/NewReleases'));
const Subscription = lazy(() => import('./pages/Subscription'));

// ------------- Novel pages (new feature) -------------
const NovelsPage = lazy(() => import('./pages/NovelsPage'));
const NovelDetail = lazy(() => import('./pages/NovelDetail'));
const ChapterReader = lazy(() => import('./pages/ChapterReader'));

// ------------- Admin imports -------------
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminSeries = lazy(() => import('./pages/admin/SeriesManager'));
const AdminEpisodes = lazy(() => import('./pages/admin/Episodes'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminSubscriptions = lazy(() => import('./pages/admin/Subscriptions'));

// Admin feature imports
const NotificationsPage = lazy(() => import('./pages/admin/NotificationsAnnouncements'));
const CreatorManagement = lazy(() => import('./pages/admin/CreatorManagement'));
const SubscriptionPlans = lazy(() => import('./pages/admin/SubscriptionPlans'));
const ContentScheduling = lazy(() => import('./pages/admin/ContentScheduling'));
const FeedbackRatings = lazy(() => import('./pages/admin/FeedbackRatings'));
const ApiIntegrations = lazy(() => import('./pages/admin/ApiIntegrations'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const StorageMedia = lazy(() => import('./pages/admin/StorageMedia'));
const OnboardingFlow = lazy(() => import('./pages/admin/OnboardingFlow'));
const ListenerGeography = lazy(() => import('./pages/admin/ListenerGeography'));

// ------------- Creator novel management components -------------
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
                    {/* Auth page (no layout) */}
                    <Route path="/auth" element={<Auth />} />

                    {/* ✅ SIRF YEH EK LINE ADD KI HAI — Auth ke neeche, MainLayout ke BAHAR */}
                    <Route path="/verify-otp" element={<VerifyOTP />} />

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

                      {/* Novel routes */}
                      <Route path="/novels" element={<NovelsPage />} />
                      <Route path="/novels/:id" element={<NovelDetail />} />
                      <Route path="/novels/:novelId/read/:chapterId" element={<ChapterReader />} />

                      {/* Creator dashboard routes */}
                      <Route path="/creator/dashboard" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/tts" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/series" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/series/new" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/series/:seriesId" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/series/:seriesId/edit" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/episodes/upload" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/followers" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />
                      <Route path="/creator/analytics" element={<ProtectedRoute requireCreator><CreatorDashboard /></ProtectedRoute>} />

                      {/* Creator novel management routes */}
                      <Route path="/creator/novels" element={<ProtectedRoute requireCreator><CreatorNovels /></ProtectedRoute>} />
                      <Route path="/creator/novels/new" element={<ProtectedRoute requireCreator><UploadNovel /></ProtectedRoute>} />
                      <Route path="/creator/novels/:novelId/chapters" element={<ProtectedRoute requireCreator><CreatorNovels /></ProtectedRoute>} />
                      <Route path="/creator/novels/:novelId/chapters/new" element={<ProtectedRoute requireCreator><AddChapter /></ProtectedRoute>} />

                      {/* Admin routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="series" element={<AdminSeries />} />
                        <Route path="episodes" element={<AdminEpisodes />} />
                        <Route path="payments" element={<AdminPayments />} />
                        <Route path="subscriptions" element={<AdminSubscriptions />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="creators" element={<CreatorManagement />} />
                        <Route path="plans" element={<SubscriptionPlans />} />
                        <Route path="schedule" element={<ContentScheduling />} />
                        <Route path="database" element={<DatabaseUsers />} />
                        <Route path="feedback" element={<FeedbackRatings />} />
                        <Route path="integrations" element={<ApiIntegrations />} />
                        <Route path="audit" element={<AuditLogs />} />
                        <Route path="storage" element={<StorageMedia />} />
                        <Route path="listeners" element={<ListenerGeography />} />
                        <Route path="onboarding" element={<OnboardingFlow />} />
                      </Route>

                      {/* 404 catch-all */}
                      <Route path="*" element={
                        <div className="not-found-page">
                          <h1>404</h1>
                          <h2>Page Not Found</h2>
                          <a href="/">Go to Home</a>
                        </div>
                      } />
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
