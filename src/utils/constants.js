/**
 * Application constants
 */

// App info
export const APP_NAME = 'Pocket FM';
export const APP_DESCRIPTION = 'Advanced Audio Storytelling Platform';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000;

// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'pocket_fm_audio';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Audio Player
export const DEFAULT_PLAYBACK_SPEED = 1.0;
export const PROGRESS_SAVE_INTERVAL = 5000; // 5 seconds
export const SKIP_SECONDS = 15;
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

// File Upload
export const MAX_AUDIO_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'pocket-fm-theme',
  FONT_SIZE: 'pocket-fm-font-size',
  VOLUME: 'audioVolume',
  PLAYBACK_SPEED: 'playbackSpeed',
  RECENT_SEARCHES: 'recentSearches',
  PLAYBACK_SETTINGS: 'playbackSettings',
  ONBOARDING_COMPLETE: 'onboardingComplete'
};

// Routes
export const ROUTES = {
  HOME: '/',
  TRENDING: '/trending',
  LIBRARY: '/library',
  SEARCH: '/search',
  CATEGORIES: '/categories',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  AUTH: '/auth',
  SERIES_DETAIL: '/series/:id',
  EPISODE_PLAYER: '/play/:id',
  CREATOR_DASHBOARD: '/creator/dashboard',
  CREATOR_SERIES: '/creator/series',
  UPLOAD_EPISODE: '/creator/episodes/upload',
  HISTORY: '/history',
  BOOKMARKS: '/bookmarks',
  LIKED: '/liked',
  FOLLOWING: '/following'
};

// Activity Types
export const ACTIVITY_TYPES = {
  LISTEN: 'listen',
  LIKE: 'like',
  BOOKMARK: 'bookmark',
  SHARE: 'share',
  FOLLOW: 'follow',
  RATE: 'rate',
  COMMENT: 'comment'
};

// Series Status
export const SERIES_STATUS = {
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  HIATUS: 'hiatus',
  DRAFT: 'draft'
};

export const SERIES_STATUS_LABELS = {
  [SERIES_STATUS.ONGOING]: 'Ongoing',
  [SERIES_STATUS.COMPLETED]: 'Completed',
  [SERIES_STATUS.HIATUS]: 'On Hiatus',
  [SERIES_STATUS.DRAFT]: 'Draft'
};

// Languages
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' }
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'relevance', label: 'Relevance' }
];

// Trending Periods
export const TRENDING_PERIODS = [
  { key: 'daily', label: 'Today', icon: 'FiActivity' },
  { key: 'weekly', label: 'This Week', icon: 'FiCalendar' },
  { key: 'all', label: 'All Time', icon: 'FiTrendingUp' }
];

// Theme Options
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
};

// Font Size Options
export const FONT_SIZES = {
  SMALL: 'small',
  NORMAL: 'normal',
  LARGE: 'large',
  XLARGE: 'xlarge'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'File type not supported.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  SIGNUP: 'Account created successfully!',
  LOGOUT: 'Logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  SERIES_CREATED: 'Series created successfully!',
  SERIES_UPDATED: 'Series updated successfully!',
  SERIES_DELETED: 'Series deleted successfully.',
  EPISODE_UPLOADED: 'Episode uploaded successfully!',
  EPISODE_UPDATED: 'Episode updated successfully!',
  EPISODE_DELETED: 'Episode deleted successfully.',
  BOOKMARK_ADDED: 'Bookmarked!',
  BOOKMARK_REMOVED: 'Bookmark removed.',
  LIKED: 'Added to likes!',
  UNLIKED: 'Removed from likes.',
  FOLLOWED: 'Following creator!',
  UNFOLLOWED: 'Unfollowed creator.',
  BECOME_CREATOR: 'You are now a creator!'
};

// Placeholder Images
export const PLACEHOLDER_IMAGES = {
  SERIES_THUMBNAIL: '/images/placeholder-series.png',
  EPISODE_THUMBNAIL: '/images/placeholder-episode.png',
  USER_AVATAR: '/images/placeholder-avatar.png',
  CATEGORY: '/images/placeholder-category.png'
};

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_PWA: process.env.REACT_APP_ENABLE_PWA === 'true',
  ENABLE_DARK_MODE: process.env.REACT_APP_ENABLE_DARK_MODE === 'true',
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_PUSH_NOTIFICATIONS: false
};

// Audio Quality Options
export const AUDIO_QUALITY = {
  LOW: { label: 'Low', bitrate: '64k' },
  MEDIUM: { label: 'Medium', bitrate: '128k' },
  HIGH: { label: 'High', bitrate: '256k' },
  AUTO: { label: 'Auto', bitrate: 'auto' }
};

// Media Queries (for JS usage)
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1200,
  xxl: 1400
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM D, YYYY',
  LONG: 'MMMM D, YYYY',
  FULL: 'MMMM D, YYYY h:mm A',
  TIME: 'h:mm A',
  RELATIVE: 'relative'
};

// Content Types
export const CONTENT_TYPES = {
  SERIES: 'series',
  EPISODE: 'episode',
  CATEGORY: 'category',
  USER: 'user'
};

// Social Links
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/pocketfm',
  INSTAGRAM: 'https://instagram.com/pocketfm',
  YOUTUBE: 'https://youtube.com/pocketfm',
  FACEBOOK: 'https://facebook.com/pocketfm',
  GITHUB: 'https://github.com/pocketfm'
};

// Support
export const SUPPORT = {
  EMAIL: 'support@pocketfm.com',
  HELP_CENTER: '/help',
  FAQ: '/faq',
  CONTACT: '/contact'
};

// Creator Requirements
export const CREATOR_REQUIREMENTS = {
  MIN_AGE: 13,
  REQUIRES_VERIFICATION: false,
  MAX_SERIES_FREE: 3,
  MAX_EPISODES_FREE: 10
};