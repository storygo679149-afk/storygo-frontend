/**
 * Utility functions for formatting values
 */

/**
 * Format seconds to MM:SS or HH:MM:SS
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format seconds to human readable duration
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0 min';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hrs > 0) {
    return `${hrs} hr ${mins > 0 ? mins + ' min' : ''}`;
  }
  
  if (mins > 0) {
    return `${mins} min`;
  }
  
  const secs = Math.floor(seconds % 60);
  return `${secs} sec`;
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toLocaleString('en-US');
};

/**
 * Format large numbers (1K, 1M, 1B)
 * @param {number} num - Number to format
 * @returns {string} Abbreviated number
 */
export const formatCompactNumber = (num) => {
  if (!num && num !== 0) return '0';
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
};

/**
 * Format file size in bytes to human readable
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatTimeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 0) return 'Just now';
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

/**
 * Format date to locale string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format date and time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format rating to one decimal place
 * @param {number} rating - Rating value
 * @returns {string} Formatted rating
 */
export const formatRating = (rating) => {
  if (!rating && rating !== 0) return '0.0';
  return parseFloat(rating).toFixed(1);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} total - Total value
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';
  return Math.round((value / total) * 100) + '%';
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Format episode number with season
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {string} Formatted episode string
 */
export const formatEpisodeCode = (season, episode) => {
  const s = season ? `S${season.toString().padStart(2, '0')}` : 'S01';
  const e = episode ? `E${episode.toString().padStart(2, '0')}` : 'E01';
  return `${s}${e}`;
};

/**
 * Get readable status label
 * @param {string} status - Status value
 * @returns {string} Readable status
 */
export const getStatusLabel = (status) => {
  const statusMap = {
    'ongoing': 'Ongoing',
    'completed': 'Completed',
    'hiatus': 'On Hiatus',
    'draft': 'Draft',
    'published': 'Published',
    'active': 'Active',
    'inactive': 'Inactive'
  };
  return statusMap[status] || capitalize(status);
};

/**
 * Get status color class
 * @param {string} status - Status value
 * @returns {string} CSS class name
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'ongoing': 'success',
    'completed': 'info',
    'hiatus': 'warning',
    'draft': 'muted',
    'published': 'success',
    'active': 'success',
    'inactive': 'error'
  };
  return colorMap[status] || 'muted';
};