import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import novelService from '../services/novelService';
import useAuth from '../hooks/useAuth';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiGlobe, FiRotateCcw, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ChapterReader.css';

// Supported languages for translation
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'ko', name: 'Korean' },
];

const ChapterReader = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [chapter, setChapter] = useState(null);
  const [novelTitle, setNovelTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [allChapters, setAllChapters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [targetLang, setTargetLang] = useState('');
  const [translatedContent, setTranslatedContent] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const contentRef = useRef(null);
  const saveTimeout = useRef(null);

  useEffect(() => {
    fetchChapter();
    fetchNovelChapters();
  }, [chapterId]);

  useEffect(() => {
    if (contentRef.current && chapter) {
      const savedPos = localStorage.getItem(`reading_${chapterId}`);
      if (savedPos) {
        contentRef.current.scrollTop = parseInt(savedPos);
      }
    }
  }, [chapter]);

  const fetchChapter = async () => {
    setIsLoading(true);
    try {
      const response = await novelService.getChapter(novelId, chapterId);
      const data = response.data?.data || response.data || {};
      setChapter(data.chapter);
      setNovelTitle(data.chapter?.novel_title || '');
      setTranslatedContent(null);
      setTargetLang('');
      setShowOriginal(false);
    } catch (error) {
      toast.error('Failed to load chapter');
      navigate(`/novels/${novelId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNovelChapters = async () => {
    try {
      const response = await novelService.getNovelById(novelId);
      const chapters = response.data?.data?.chapters || response.data?.chapters || [];
      setAllChapters(chapters);
      const idx = chapters.findIndex(c => c.id === chapterId);
      setCurrentIndex(idx);
    } catch (error) {}
  };

  const handleScroll = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (contentRef.current && isAuthenticated) {
        const scrollPercent = (contentRef.current.scrollTop / (contentRef.current.scrollHeight - contentRef.current.clientHeight)) * 100;
        novelService.saveReadingProgress(chapterId, Math.floor(scrollPercent)).catch(() => {});
        localStorage.setItem(`reading_${chapterId}`, contentRef.current.scrollTop);
      }
    }, 1000);
  };

  const goToPrevChapter = () => {
    if (currentIndex > 0) {
      navigate(`/novels/${novelId}/read/${allChapters[currentIndex - 1].id}`);
    }
  };

  const goToNextChapter = () => {
    if (currentIndex < allChapters.length - 1) {
      navigate(`/novels/${novelId}/read/${allChapters[currentIndex + 1].id}`);
    }
  };

  // Translation using free MyMemory API
  const translateContent = async () => {
    if (!targetLang || targetLang === 'en') {
      setTranslatedContent(null);
      setShowOriginal(false);
      return;
    }
    if (!chapter?.content) return;

    setIsTranslating(true);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chapter.content)}&langpair=en|${targetLang}`;
      const response = await fetch(url);
      const data = await response.json();
      const translatedText = data.responseData?.translatedText || chapter.content;
      setTranslatedContent(translatedText);
      setShowOriginal(false);
      toast.success(`Translated to ${LANGUAGES.find(l => l.code === targetLang)?.name}`);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
      setTranslatedContent(null);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (targetLang) {
      translateContent();
    } else {
      setTranslatedContent(null);
    }
  }, [targetLang, chapter?.content]);

  const displayedContent = showOriginal ? chapter?.content : (translatedContent || chapter?.content);

  if (isLoading) {
    return (
      <div className="chapter-reader-loading">
        <SkeletonLoader type="text" count={5} />
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div className="chapter-reader-fullwidth">
      <div className="chapter-reader-page">
        {/* Header */}
       {/* Header with integrated translation */}
<div className="reader-header">
  <Link to={`/novels/${novelId}`} className="back-link">
    <FiArrowLeft /> Back to Novel
  </Link>
  <div className="reader-title">{novelTitle}</div>
  <div className="reader-controls">
    <div className="reader-nav">
      <button onClick={goToPrevChapter} disabled={currentIndex <= 0}>
        <FiChevronLeft /> Prev
      </button>
      <button onClick={goToNextChapter} disabled={currentIndex >= allChapters.length - 1}>
        Next <FiChevronRight />
      </button>
    </div>
    <div className="translation-selector">
      <FiGlobe className="globe-icon" />
      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        disabled={isTranslating}
      >
        <option value="">Original (English)</option>
        {LANGUAGES.filter(l => l.code !== 'en').map(lang => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
      {isTranslating && <FiLoader className="spinning" />}
    </div>
    {translatedContent && !showOriginal && (
      <button className="show-original-btn" onClick={() => setShowOriginal(true)}>
        <FiRotateCcw /> Original
      </button>
    )}
    {showOriginal && (
      <button className="show-original-btn active" onClick={() => setShowOriginal(false)}>
        Show Translation
      </button>
    )}
  </div>
</div>

        {/* Reading content */}
        <div className="reader-content" ref={contentRef} onScroll={handleScroll}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {chapter.title}
          </motion.h1>
          <motion.div
            className="chapter-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            dangerouslySetInnerHTML={{ __html: displayedContent?.replace(/\n/g, '<br/>') }}
          />
          <div className="chapter-footer">
            <div className="word-count">{chapter.word_count || 0} words</div>
            <div className="chapter-nav-bottom">
              <button onClick={goToPrevChapter} disabled={currentIndex <= 0}>
                ← Previous Chapter
              </button>
              <button onClick={goToNextChapter} disabled={currentIndex >= allChapters.length - 1}>
                Next Chapter →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;