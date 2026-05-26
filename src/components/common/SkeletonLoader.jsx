import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-thumbnail shimmer" />
            <div className="skeleton-content">
              <div className="skeleton-title shimmer" />
              <div className="skeleton-text shimmer" />
              <div className="skeleton-text short shimmer" />
            </div>
          </div>
        );

      case 'episode':
        return (
          <div className="skeleton-episode">
            <div className="skeleton-episode-number shimmer" />
            <div className="skeleton-episode-content">
              <div className="skeleton-title shimmer" />
              <div className="skeleton-meta shimmer" />
            </div>
            <div className="skeleton-episode-duration shimmer" />
          </div>
        );

      case 'profile':
        return (
          <div className="skeleton-profile">
            <div className="skeleton-avatar shimmer" />
            <div className="skeleton-profile-info">
              <div className="skeleton-title shimmer" />
              <div className="skeleton-text shimmer" />
              <div className="skeleton-stats shimmer" />
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="skeleton-search">
            <div className="skeleton-search-thumb shimmer" />
            <div className="skeleton-search-content">
              <div className="skeleton-title shimmer" />
              <div className="skeleton-text shimmer" />
              <div className="skeleton-text short shimmer" />
            </div>
          </div>
        );

      case 'banner':
        return (
          <div className="skeleton-banner shimmer" />
        );

      case 'text':
        return (
          <div className="skeleton-text-block">
            <div className="skeleton-title shimmer" />
            <div className="skeleton-text shimmer" />
            <div className="skeleton-text shimmer" />
            <div className="skeleton-text short shimmer" />
          </div>
        );

      default:
        return (
          <div className="skeleton-card">
            <div className="skeleton-thumbnail shimmer" />
            <div className="skeleton-content">
              <div className="skeleton-title shimmer" />
              <div className="skeleton-text shimmer" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`skeleton-wrapper skeleton-${type}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-item">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// Specific skeleton loaders
export const CardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-thumbnail shimmer" />
    <div className="skeleton-content">
      <div className="skeleton-title shimmer" />
      <div className="skeleton-text shimmer" />
      <div className="skeleton-text short shimmer" />
    </div>
  </div>
);

export const EpisodeSkeleton = () => (
  <div className="skeleton-episode">
    <div className="skeleton-episode-number shimmer" />
    <div className="skeleton-episode-content">
      <div className="skeleton-title shimmer" />
      <div className="skeleton-meta shimmer" />
    </div>
    <div className="skeleton-episode-duration shimmer" />
  </div>
);

export const SeriesDetailSkeleton = () => (
  <div className="skeleton-series-detail">
    <div className="skeleton-banner shimmer" />
    <div className="skeleton-series-info">
      <div className="skeleton-title shimmer" />
      <div className="skeleton-text shimmer" />
      <div className="skeleton-text shimmer" />
      <div className="skeleton-stats shimmer" />
    </div>
  </div>
);

export const AudioPlayerSkeleton = () => (
  <div className="skeleton-audio-player">
    <div className="skeleton-progress shimmer" />
    <div className="skeleton-player-controls">
      <div className="skeleton-button shimmer" />
      <div className="skeleton-button large shimmer" />
      <div className="skeleton-button shimmer" />
    </div>
  </div>
);

export default SkeletonLoader;
