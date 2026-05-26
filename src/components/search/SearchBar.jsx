import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import seriesService from '../../services/seriesService';
import {
  FiSearch, FiX, FiClock, FiTrendingUp,
  FiLoader, FiArrowRight, FiHeadphones, FiMic
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './SearchBar.css';

const SearchBar = ({ isOpen, onToggle, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);   // 🎤

  const debouncedQuery = useDebounce(query, 300);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Load recent and popular searches
  useEffect(() => {
    if (isOpen) {
      loadRecentSearches();
      loadPopularSearches();
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
        setQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const fetchSuggestions = async (searchQuery) => {
    setIsLoading(true);
    try {
      const data = await seriesService.getSuggestions(searchQuery);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentSearches = () => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch {
        setRecentSearches([]);
      }
    }
  };

  const loadPopularSearches = async () => {
    try {
      const data = await seriesService.getPopularSearches();
      setPopularSearches(data.popular || []);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const saveRecentSearch = (searchQuery) => {
    const stored = localStorage.getItem('recentSearches');
    let searches = stored ? JSON.parse(stored) : [];
    searches = searches.filter(s => s.toLowerCase() !== searchQuery.toLowerCase());
    searches.unshift(searchQuery);
    searches = searches.slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    setRecentSearches(searches.slice(0, 5));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const searchQuery = suggestion.title || suggestion.search_query;
    saveRecentSearch(searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowDropdown(false);
    onClose();
    setQuery('');
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    if (e.target.value.length >= 2) {
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e) => {
    const items = getDropdownItems();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < items.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : items.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          if (typeof items[selectedIndex] === 'string') {
            setQuery(items[selectedIndex]);
            handleSubmit(e);
          } else {
            handleSuggestionClick(items[selectedIndex]);
          }
        } else {
          handleSubmit(e);
        }
        break;
    }
  };

  const getDropdownItems = () => {
    if (query.length >= 2 && suggestions.length > 0) {
      return suggestions;
    }
    const items = [];
    if (recentSearches.length > 0 && query.length < 2) {
      items.push(...recentSearches);
    }
    return items;
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const highlightMatch = (text) => {
    if (!query || query.length < 2) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  // 🎤 Improved voice search – handles "not-allowed" gracefully
  const startVoiceSearch = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in your browser');
      return;
    }

    // Explicitly request microphone permission (works around some "not-allowed" cases)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());   // release immediately
    } catch (permError) {
      if (permError.name === 'NotAllowedError') {
        toast.error(
          'Microphone access was denied. Please allow microphone access in your browser settings.',
          { duration: 5000 }
        );
      } else {
        toast.error('Could not access the microphone: ' + permError.message);
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSubmit(new Event('submit'));
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        toast.error('Microphone access blocked. Check your browser settings.');
      } else {
        toast.error('Voice error: ' + event.error);
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <>
      <div className="search-bar-container" ref={containerRef}>
        <form onSubmit={handleSubmit} className="search-form">
          <div className={`search-input-wrapper ${isFocused ? 'focused' : ''} ${query ? 'has-value' : ''}`}>
            <FiSearch className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                setIsFocused(true);
                setShowDropdown(true);
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Search series, episodes, authors..."
              className="search-input"
              autoComplete="off"
            />
            {/* 🎤 Microphone button */}
            {!query && (
              <button
                type="button"
                className="search-mic-btn"
                onClick={startVoiceSearch}
                disabled={isListening}
                title="Search by voice"
              >
                <FiMic />
              </button>
            )}
            {query && (
              <button
                type="button"
                className="search-clear"
                onClick={clearQuery}
              >
                <FiX />
              </button>
            )}
            {isLoading && (
              <div className="search-loader">
                <FiLoader className="spinning" />
              </div>
            )}
            <button type="submit" className="search-submit">
              <FiArrowRight />
            </button>
          </div>
        </form>

        {/* Dropdown – unchanged */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              className="search-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Suggestions */}
              {query.length >= 2 && suggestions.length > 0 && (
                <div className="dropdown-section">
                  <h4 className="dropdown-title">Suggestions</h4>
                  {suggestions.map((item, index) => (
                    <motion.button
                      key={item.id || index}
                      className={`dropdown-item ${selectedIndex === index ? 'selected' : ''}`}
                      onClick={() => handleSuggestionClick(item)}
                      whileHover={{ x: 4 }}
                    >
                      <FiSearch className="dropdown-item-icon" />
                      <div className="dropdown-item-content">
                        <span className="dropdown-item-title">
                          {highlightMatch(item.title)}
                        </span>
                        <span className="dropdown-item-type">
                          {item.type === 'series' ? (
                            <><FiHeadphones size={12} /> Series</>
                          ) : (
                            <><FiHeadphones size={12} /> Episode</>
                          )}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {query.length >= 2 && suggestions.length === 0 && !isLoading && (
                <div className="dropdown-empty">
                  <p>No results found for "{query}"</p>
                  <button
                    className="dropdown-search-btn"
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(query)}`);
                      setShowDropdown(false);
                      onClose();
                    }}
                  >
                    Search for "{query}"
                  </button>
                </div>
              )}

              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="dropdown-section">
                  <div className="dropdown-header">
                    <h4 className="dropdown-title">
                      <FiClock size={14} />
                      Recent Searches
                    </h4>
                    <button
                      className="dropdown-clear"
                      onClick={clearRecentSearches}
                    >
                      Clear All
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={search}
                      className={`dropdown-item ${selectedIndex === index ? 'selected' : ''}`}
                      onClick={() => {
                        setQuery(search);
                        handleSubmit(new Event('submit'));
                      }}
                      whileHover={{ x: 4 }}
                    >
                      <FiClock className="dropdown-item-icon" />
                      <span>{search}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Popular Searches */}
              {!query && popularSearches.length > 0 && (
                <div className="dropdown-section">
                  <h4 className="dropdown-title">
                    <FiTrendingUp size={14} />
                    Popular Searches
                  </h4>
                  <div className="popular-tags">
                    {popularSearches.map((item) => (
                      <button
                        key={item.search_query}
                        className="popular-tag"
                        onClick={() => {
                          setQuery(item.search_query);
                          handleSubmit(new Event('submit'));
                        }}
                      >
                        {item.search_query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SearchBar;