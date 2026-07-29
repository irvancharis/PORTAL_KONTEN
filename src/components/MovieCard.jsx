import React from 'react';
import { Star, Play } from 'lucide-react';

export default function MovieCard({ movie, onSelect, currentUser }) {
  // Format views to YouTube style (e.g. 25.430 views -> "25 rb x ditonton")
  const formatViews = (views) => {
    if (views >= 1000) {
      return (views / 1000).toFixed(1).replace('.', ',') + ' rb x ditonton';
    }
    return views + ' x ditonton';
  };

  // Generate channel initial/color based on genre
  const firstGenre = movie.genre[0] || 'F';
  const getAvatarBg = (genre) => {
    const colors = [
      'linear-gradient(135deg, #4f46e5, #06b6d4)', // Indigo/Cyan
      'linear-gradient(135deg, #f59e0b, #e11d48)', // Amber/Rose
      'linear-gradient(135deg, #10b981, #3b82f6)', // Emerald/Blue
      'linear-gradient(135deg, #8b5cf6, #ec4899)'  // Violet/Pink
    ];
    // Simple hash
    const index = genre.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Calculate playback progress
  let activeEpisodeIdx = 0;
  let savedProgress = 0;
  let savedDuration = 0;
  const userId = currentUser ? currentUser.id : 'guest';

  if (movie.episodes && movie.episodes.length > 0) {
    for (let i = 0; i < movie.episodes.length; i++) {
      const pKey = `playback_progress_${userId}_${movie.id}_${i}`;
      const prog = localStorage.getItem(pKey);
      if (prog) {
        const parsedP = parseFloat(prog);
        if (parsedP > savedProgress) {
          savedProgress = parsedP;
          activeEpisodeIdx = i;
          const dKey = `playback_duration_${userId}_${movie.id}_${i}`;
          savedDuration = parseFloat(localStorage.getItem(dKey) || '0');
        }
      }
    }
  } else {
    const pKey = `playback_progress_${userId}_${movie.id}_0`;
    const prog = localStorage.getItem(pKey);
    if (prog) {
      savedProgress = parseFloat(prog);
      const dKey = `playback_duration_${userId}_${movie.id}_0`;
      savedDuration = parseFloat(localStorage.getItem(dKey) || '0');
    }
  }

  const parseDurationToSeconds = (durationStr) => {
    if (!durationStr) return 0;
    let totalSeconds = 0;
    
    const hourMatch = durationStr.match(/(\d+)\s*h/i);
    if (hourMatch) {
      totalSeconds += parseInt(hourMatch[1]) * 3600;
    }
    
    const minuteMatch = durationStr.match(/(\d+)\s*m/i);
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60;
    }
    
    if (!hourMatch && !minuteMatch) {
      const numericMatch = durationStr.match(/(\d+)/);
      if (numericMatch) {
        totalSeconds += parseInt(numericMatch[1]) * 60;
      }
    }
    
    return totalSeconds;
  };

  if (!savedDuration || isNaN(savedDuration) || savedDuration <= 0) {
    savedDuration = parseDurationToSeconds(movie.duration);
  }

  const progressPercent = savedDuration > 0 ? Math.min((savedProgress / savedDuration) * 100, 100) : 0;

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = Math.floor(timeInSeconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="movie-card youtube-style animate-fade-in" onClick={() => onSelect(movie)}>
      <div className="thumbnail-wrapper" style={{ position: 'relative' }}>
        <img 
          src={movie.backdrop} 
          alt={movie.title} 
          className="movie-thumbnail" 
          loading="lazy"
        />
        
        {/* Play Overlay */}
        <div className="thumbnail-hover-overlay">
          <div className="play-circle-small">
            <Play fill="currentColor" size={18} />
          </div>
        </div>

        {/* Video badges inside thumbnail */}
        <span className="thumbnail-badge duration">{movie.duration}</span>

        {/* Red Progress Bar at the bottom of thumbnail */}
        {progressPercent > 0 && (
          <div 
            className="thumbnail-progress-bar-container" 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.2)',
              zIndex: 3,
              overflow: 'hidden'
            }}
          >
            <div 
              className="thumbnail-progress-bar-fill" 
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'var(--primary, #ef4444)'
              }}
            ></div>
          </div>
        )}
      </div>

      {/* Video Info: Avatar + Text Details */}
      <div className="video-info-container">
        <div 
          className="channel-avatar" 
          style={{ background: getAvatarBg(firstGenre) }}
          title={`Genre: ${firstGenre}`}
        >
          {firstGenre.charAt(0)}
        </div>
        
        <div className="video-text-details">
          <h3 className="video-title" title={movie.title}>{movie.title}</h3>
          
          <div className="channel-name">
            {movie.genre.slice(0, 2).join(' / ')}
          </div>
          
          <div className="video-metadata">
            <span className="meta-views">{formatViews(movie.views)}</span>
            <span className="meta-dot">•</span>
            <span className="meta-rating">
              <Star fill="#f59e0b" color="#f59e0b" size={12} className="star-icon" />
              {movie.rating}
            </span>
            <span className="meta-dot">•</span>
            <span className="meta-year">{movie.year}</span>
          </div>

          {/* Time Progress Info */}
          {savedProgress > 5 && (
            <div 
              className="progress-text-label" 
              style={{
                fontSize: '0.78rem',
                color: 'var(--primary, #ef4444)',
                marginTop: '6px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '4px'
              }}
            >
              <span>Terakhir ditonton: {formatTime(savedProgress)}</span>
              {savedDuration > 0 && <span style={{ color: 'var(--text-secondary)' }}>/ {formatTime(savedDuration)}</span>}
              {movie.episodes && movie.episodes.length > 0 && (
                <span 
                  style={{ 
                    fontSize: '0.7rem', 
                    background: 'rgba(239, 68, 68, 0.12)', 
                    color: 'var(--primary, #ef4444)', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    marginLeft: '4px',
                    fontWeight: '600'
                  }}
                >
                  {movie.episodes[activeEpisodeIdx].title}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
