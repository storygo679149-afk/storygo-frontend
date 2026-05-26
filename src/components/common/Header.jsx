import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import SearchBar from '../search/SearchBar';
import {
  FiMenu, FiX, FiUser, FiLogOut, FiSettings,
  FiHeadphones, FiTrendingUp, FiBookOpen, FiPlusCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
      setIsProfileMenuOpen(false);
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const headerClasses = `header ${isScrolled ? 'scrolled' : ''}`;

  return (
    <>
      <header className={headerClasses}>
        <div className="header-container">
          {/* PNG Logo */}
          <Link to="/" className="logo">
            <img 
              src="/icons/icon-192x192.png" 
              alt="Story Go" 
              className="logo-image"
            />
            <span className="logo-text">Story Go</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/trending" className="nav-link">
              <FiTrendingUp />
              <span>Trending</span>
            </Link>
            <Link to="/library" className="nav-link">
              <FiBookOpen />
              <span>Library</span>
            </Link>
            {isAuthenticated && user?.is_creator && (
              <Link to="/creator/dashboard" className="nav-link">
                <FiPlusCircle />
                <span>Create</span>
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="header-right">
            <div className={`search-wrapper ${isSearchOpen ? 'open' : ''}`}>
              <SearchBar 
                isOpen={isSearchOpen} 
                onToggle={() => setIsSearchOpen(!isSearchOpen)}
                onClose={() => setIsSearchOpen(false)}
              />
            </div>

            {isAuthenticated ? (
              <div className="user-menu-container">
                <button className="user-avatar-btn" onClick={handleProfileClick}>
                  {user?.profile_picture ? (
                    <img src={user.profile_picture} alt={user.full_name} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      className="profile-dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="dropdown-header">
                        <div className="dropdown-user-info">
                          <span className="dropdown-username">{user?.full_name || user?.username}</span>
                          <span className="dropdown-email">{user?.email}</span>
                        </div>
                      </div>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item" onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); }}>
                        <FiUser /> <span>Profile</span>
                      </button>
                      {user?.is_creator && (
                        <button className="dropdown-item" onClick={() => { navigate('/creator/dashboard'); setIsProfileMenuOpen(false); }}>
                          <FiSettings /> <span>Creator Dashboard</span>
                        </button>
                      )}
                      <button className="dropdown-item" onClick={() => { navigate('/library'); setIsProfileMenuOpen(false); }}>
                        <FiBookOpen /> <span>My Library</span>
                      </button>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item logout" onClick={handleLogout}>
                        <FiLogOut /> <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/auth?mode=login" className="btn btn-text">Sign In</Link>
                <Link to="/auth?mode=signup" className="btn btn-primary">Sign Up</Link>
              </div>
            )}

            <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              className="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mobile-nav-links">
                <Link to="/trending" className="mobile-nav-link"><FiTrendingUp /><span>Trending</span></Link>
                <Link to="/library" className="mobile-nav-link"><FiBookOpen /><span>Library</span></Link>
                {isAuthenticated && user?.is_creator && (
                  <Link to="/creator/dashboard" className="mobile-nav-link"><FiPlusCircle /><span>Creator Dashboard</span></Link>
                )}
                {isAuthenticated && (
                  <>
                    <div className="mobile-nav-divider" />
                    <Link to="/profile" className="mobile-nav-link"><FiUser /><span>Profile</span></Link>
                    <button className="mobile-nav-link logout" onClick={handleLogout}><FiLogOut /><span>Logout</span></button>
                  </>
                )}
                {!isAuthenticated && (
                  <div className="mobile-auth-buttons">
                    <Link to="/auth?mode=login" className="btn btn-primary full-width">Sign In</Link>
                    <Link to="/auth?mode=signup" className="btn btn-outline full-width">Create Account</Link>
                  </div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {(isMobileMenuOpen || isProfileMenuOpen) && (
        <div className="header-overlay" onClick={() => { setIsMobileMenuOpen(false); setIsProfileMenuOpen(false); }} />
      )}
    </>
  );
};

export default Header;