// Sidebar.jsx - Ultra-smooth animations + mobile toggle

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import {
  FiHome, FiTrendingUp, FiBookOpen, FiClock,
  FiBookmark, FiHeart, FiHeadphones, FiUsers, FiBarChart2,
  FiChevronLeft, FiChevronRight, FiGrid,
  FiStar, FiZap, FiUserPlus, FiChevronDown,
  FiCreditCard, FiShield, FiLogOut, FiMenu
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Sidebar.css';

const getInitialCollapsed = () =>
  typeof window !== 'undefined' && window.innerWidth < 1200;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: { x: -20, opacity: 0, transition: { duration: 0.15 } },
};

const sectionVariants = {
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
};

const Sidebar = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [browseExpanded, setBrowseExpanded] = useState(true);
  const [libraryExpanded, setLibraryExpanded] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });
  const tooltipTimeout = useRef(null);

  // Force refresh user data when authentication state changes (e.g., after becoming creator)
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const showTooltip = useCallback(
    (label, e) => {
      if (!isCollapsed || window.innerWidth < 1200) return;
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        visible: true,
        text: label,
        x: rect.right + 10,
        y: rect.top + rect.height / 2,
      });
    },
    [isCollapsed]
  );

  const hideTooltip = useCallback(() => {
    tooltipTimeout.current = setTimeout(
      () => setTooltip((prev) => ({ ...prev, visible: false })),
      100
    );
  }, []);

  useEffect(() => () => tooltipTimeout.current && clearTimeout(tooltipTimeout.current), []);

  const mainLinks = [
    { path: '/', icon: <FiHome />, label: 'Home' },
    { path: '/trending', icon: <FiTrendingUp />, label: 'Trending' },
    { path: '/library', icon: <FiBookOpen />, label: 'Library' },
    { path: '/categories', icon: <FiGrid />, label: 'Categories' },
    { path: '/new-releases', icon: <FiZap />, label: 'New Releases' },
    { path: '/top-rated', icon: <FiStar />, label: 'Top Rated' },
    { path: '/subscription', icon: <FiCreditCard />, label: 'Subscription' },
    { path: '/novels', icon: <FiBookOpen />, label: 'Novels' },
  ];
  if (user?.is_admin) mainLinks.push({ path: '/admin', icon: <FiShield />, label: 'Admin Panel' });

  const libraryLinks = [
    { path: '/history', icon: <FiClock />, label: 'History', requiresAuth: true },
    { path: '/bookmarks', icon: <FiBookmark />, label: 'Bookmarks', requiresAuth: true },
    { path: '/liked', icon: <FiHeart />, label: 'Liked', requiresAuth: true },
    { path: '/following', icon: <FiUserPlus />, label: 'Following', requiresAuth: true },
  ];

  const isCreator = user?.is_creator || user?.role === 'creator';
  const creatorLinks = isCreator
    ? [
        { path: '/creator/dashboard', icon: <FiBarChart2 />, label: 'Dashboard' },
        { path: '/creator/series', icon: <FiBookOpen />, label: 'My Series' },
        { path: '/creator/episodes/upload', icon: <FiHeadphones />, label: 'Upload' },
        { path: '/creator/followers', icon: <FiUsers />, label: 'Followers' },
        { path: '/creator/novels', icon: <FiBookOpen />, label: 'My Novels' },
      ]
    : [];

  const sidebarVariants = {
    expanded: { width: 260, transition: { type: 'spring', stiffness: 350, damping: 30 } },
    collapsed: { width: 80, transition: { type: 'spring', stiffness: 350, damping: 30 } },
  };

  const sidebarClasses = `sidebar ${
    isCollapsed && window.innerWidth >= 1200 ? 'desktop-collapsed' : 'desktop-expanded'
  } ${isMobileOpen ? 'mobile-open' : ''}`;

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.button
        className="sidebar-mobile-toggle"
        whileHover={{ scale: 1.05, x: 4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle navigation"
      >
        <FiMenu />
      </motion.button>

      <motion.aside
        className={sidebarClasses}
        variants={sidebarVariants}
        animate={isCollapsed && window.innerWidth >= 1200 ? 'collapsed' : 'expanded'}
      >
        {window.innerWidth >= 1200 && (
          <motion.button
            className="sidebar-collapse-btn"
            whileHover={{ scale: 1.1, backgroundColor: '#ff6b6b', color: '#fff' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </motion.button>
        )}

        {/* User Profile */}
        {isAuthenticated && (
          <motion.div
            className="sidebar-user-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="user-profile-card">
              <div className="user-avatar-wrapper">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                ) : (
                  <div className="user-avatar-placeholder">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
                <motion.span
                  className="user-status-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                />
              </div>
              {(!isCollapsed || window.innerWidth < 1200) && (
                <motion.div
                  className="user-info"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="user-name">
                    {user?.name || user?.email?.split('@')[0]}
                  </div>
                  <div className="user-email">{user?.email}</div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        <nav className="sidebar-nav">
          {/* Browse Section */}
          <div className="nav-section">
            <motion.button
              className="nav-section-header"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              onClick={() => setBrowseExpanded(!browseExpanded)}
            >
              {(!isCollapsed || window.innerWidth < 1200) && (
                <span className="nav-section-title">Browse</span>
              )}
              <motion.span
                animate={{ rotate: browseExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown size={14} />
              </motion.span>
            </motion.button>
            <AnimatePresence initial={false}>
              {browseExpanded && (
                <motion.div
                  variants={sectionVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  style={{ overflow: 'hidden' }}
                >
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {mainLinks.map((link) => (
                      <motion.div key={link.path} variants={itemVariants}>
                        <NavLink
                          to={link.path}
                          end={link.path === '/'}
                          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                          onMouseEnter={(e) => showTooltip(link.label, e)}
                          onMouseLeave={hideTooltip}
                        >
                          <span className="nav-icon">{link.icon}</span>
                          {(!isCollapsed || window.innerWidth < 1200) && (
                            <span className="nav-label">{link.label}</span>
                          )}
                        </NavLink>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Library Section */}
          {isAuthenticated && (
            <div className="nav-section">
              <motion.button
                className="nav-section-header"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                onClick={() => setLibraryExpanded(!libraryExpanded)}
              >
                {(!isCollapsed || window.innerWidth < 1200) && (
                  <span className="nav-section-title">Library</span>
                )}
                <motion.span
                  animate={{ rotate: libraryExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown size={14} />
                </motion.span>
              </motion.button>
              <AnimatePresence initial={false}>
                {libraryExpanded && (
                  <motion.div
                    variants={sectionVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    style={{ overflow: 'hidden' }}
                  >
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {libraryLinks.map((link) => (
                        <motion.div key={link.path} variants={itemVariants}>
                          <NavLink
                            to={link.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onMouseEnter={(e) => showTooltip(link.label, e)}
                            onMouseLeave={hideTooltip}
                          >
                            <span className="nav-icon">{link.icon}</span>
                            {(!isCollapsed || window.innerWidth < 1200) && (
                              <span className="nav-label">{link.label}</span>
                            )}
                          </NavLink>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Creator Section */}
          {creatorLinks.length > 0 && (
            <div className="nav-section">
              <div className="nav-section-header">
                {(!isCollapsed || window.innerWidth < 1200) && (
                  <span className="nav-section-title">Creator</span>
                )}
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {creatorLinks.map((link) => (
                  <motion.div key={link.path} variants={itemVariants}>
                    <NavLink
                      to={link.path}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                      onMouseEnter={(e) => showTooltip(link.label, e)}
                      onMouseLeave={hideTooltip}
                    >
                      <span className="nav-icon">{link.icon}</span>
                      {(!isCollapsed || window.innerWidth < 1200) && (
                        <span className="nav-label">{link.label}</span>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </nav>

        {/* Bottom section */}
        <motion.div
          className="sidebar-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isAuthenticated ? (
            <motion.button
              className={`sidebar-logout-btn ${isLoggingOut ? 'loading' : ''}`}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,71,87,0.18)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <FiLogOut size={18} />
              {(!isCollapsed || window.innerWidth < 1200) && <span>Logout</span>}
            </motion.button>
          ) : (
            <motion.div
              className="sidebar-auth-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p>Discover premium features</p>
              <motion.button
                className="sidebar-signin-btn"
                whileHover={{ scale: 1.02, boxShadow: '0 6px 16px rgba(255,107,107,0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/subscription')}
              >
                Go Premium
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.aside>

      <AnimatePresence>
        {tooltip.visible && (
          <motion.div
            className="nav-tooltip"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translateY(-50%)' }}
          >
            {tooltip.text}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
