import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookOpen, FiHeart, FiGithub, FiTwitter,
  FiInstagram, FiYoutube, FiMail
} from 'react-icons/fi';   // FiBookOpen added here
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <FiBookOpen className="footer-logo-icon" />
              <span>Story Go</span>
            </Link>
            <p className="footer-description">
              Immerse yourself in captivating audio stories. Stream your favorite series
              anytime, anywhere.
            </p>
            <div className="footer-social">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FiTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FiInstagram />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FiYoutube />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FiGithub />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="footer-section">
            <h4 className="footer-title">Explore</h4>
            <ul className="footer-links">
              <li><Link to="/trending">Trending</Link></li>
              <li><Link to="/browse">Browse Series</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/new-releases">New Releases</Link></li>
              <li><Link to="/top-rated">Top Rated</Link></li>
            </ul>
          </div>

          {/* Library */}
          <div className="footer-section">
            <h4 className="footer-title">Library</h4>
            <ul className="footer-links">
              <li><Link to="/library">My Library</Link></li>
              <li><Link to="/history">Listening History</Link></li>
              <li><Link to="/bookmarks">Bookmarks</Link></li>
              <li><Link to="/downloads">Downloads</Link></li>
              <li><Link to="/following">Following</Link></li>
            </ul>
          </div>

          {/* Creators */}
          <div className="footer-section">
            <h4 className="footer-title">Creators</h4>
            <ul className="footer-links">
              <li><Link to="/creator/dashboard">Creator Dashboard</Link></li>
              <li><Link to="/creator/resources">Resources</Link></li>
              <li><Link to="/creator/guidelines">Guidelines</Link></li>
              <li><Link to="/become-creator">Become a Creator</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/feedback">Feedback</Link></li>
              <li>
                <a href="mailto:support@storygo.com" className="footer-email">
                  <FiMail />
                  support@storygo.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; {currentYear} Story Go. All rights reserved.</p>
          </div>
          <div className="footer-bottom-right">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>

        <div className="footer-tagline">
          <p>Made with <FiHeart className="heart-icon" /> for audio lovers everywhere</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;