import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Sidebar from './Sidebar';
import AudioPlayer from '../audio/AudioPlayer';
import ScrollToTop from '../common/ScrollToTop';
import { useAudioContext } from '../../context/AudioContext';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();
  const { currentEpisode } = useAudioContext();
  const isHomePage = location.pathname === '/';

  // Pages that don't need sidebar
  const fullWidthPaths = ['/auth', '/login', '/signup'];
  const isFullWidth = fullWidthPaths.some(path => location.pathname.startsWith(path));

  // Pages that hide the footer player padding
  const isPlayerPage = location.pathname.includes('/play/');

  return (
    <div className={`main-layout ${currentEpisode ? 'has-player' : ''}`}>
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Sidebar - Hidden on full width pages */}
        {!isFullWidth && <Sidebar />}

        {/* Page Content */}
        <main className={`main-content ${isFullWidth ? 'full-width' : ''} ${isPlayerPage ? 'player-page' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="page-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3,
                ease: 'easeInOut'
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      {!isFullWidth && !isPlayerPage && <Footer />}

      {/* Audio Player - Fixed at bottom */}
      {currentEpisode && <AudioPlayer />}

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default MainLayout;
