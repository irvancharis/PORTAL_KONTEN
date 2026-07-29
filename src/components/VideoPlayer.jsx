import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, AlertTriangle, Lock, Check, Sparkles, Info, CreditCard, ArrowRight, Upload, X, Shield } from 'lucide-react';

export default function VideoPlayer({ 
  movie, 
  affiliateLinks = [], 
  gdriveApiKey = '', 
  whatsappAdmin = 'https://wa.me/6281234567890',
  premiumPrice = 'Rp 29.000 / Bulan',
  paymentInstructions = '',
  currentUser, 
  confirmations = [],
  setConfirmations,
  onClose,
  onLoginClick,
  onSubscribeClick
}) {
  const getProPrice = (basicPriceStr) => {
    if (!basicPriceStr) return 'Rp 25.000 / Bulan';
    const num = parseInt(basicPriceStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return 'Rp 25.000 / Bulan';
    const proNum = Math.round((num * 2.5) / 1000) * 1000;
    return `Rp ${proNum.toLocaleString('id-ID')} / Bulan`;
  };

  const formatAmountWithUnique = (priceStr, uCode) => {
    if (!priceStr) return 'Rp 0';
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return priceStr;
    const finalAmount = num + uCode;
    return `Rp ${finalAmount.toLocaleString('id-ID')}`;
  };

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const hasResumedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [playerError, setPlayerError] = useState('');
  const [resumeMessage, setResumeMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const controlsTimeoutRef = useRef(null);

  // Initialize lock/unlock state based on user role and plan rules
  const [isUnlocked, setIsUnlocked] = useState(() => {
    // Semi (18+) content is restricted to Pro / Admin
    if (movie.isSemi) {
      if (currentUser && (currentUser.role === 'pro' || currentUser.role === 'superadmin' || currentUser.role === 'staf')) {
        return true;
      }
      return false;
    }

    // Pro / Admin automatically bypasses affiliate gates
    if (currentUser && (currentUser.role === 'pro' || currentUser.role === 'superadmin' || currentUser.role === 'staf')) {
      return true;
    }
    // Basic Member also bypasses affiliate gates for standard movies
    if (currentUser && currentUser.role === 'member') {
      return true;
    }
    // Check token
    const tokenKey = `unlock_${movie.id}`;
    const hasToken = localStorage.getItem(tokenKey) === 'true';
    if (hasToken) {
      localStorage.removeItem(tokenKey);
      return true;
    }
    return false;
  });

  // Keep playback unlocked dynamically if user logs in
  useEffect(() => {
    if (movie.isSemi) {
      if (currentUser && (currentUser.role === 'pro' || currentUser.role === 'superadmin' || currentUser.role === 'staf')) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    } else {
      if (currentUser && (currentUser.role === 'member' || currentUser.role === 'pro' || currentUser.role === 'superadmin' || currentUser.role === 'staf')) {
        setIsUnlocked(true);
      }
    }
  }, [currentUser, movie.isSemi, movie.id]);


  // Fallback direct streaming URLs for dummy movies
  const getDummyVideoUrl = (movieId) => {
    const dummyVideos = {
      'spiderman-spiderverse': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'interstellar': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'inception': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'dune-part-two': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'laskar-pelangi': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'kimi-no-na-wa': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'wolf-wallstreet': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    };
    return dummyVideos[movieId] || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  };

  // Subscription status check
  const isSubscribed = currentUser && (
    currentUser.role === 'member' || 
    currentUser.role === 'pro' || 
    currentUser.role === 'superadmin' || 
    currentUser.role === 'staf'
  );
  const isLimited = !isSubscribed && !(movie.episodes && movie.episodes.length > 0);

  // Episode Handling
  const hasEpisodes = movie.episodes && movie.episodes.length > 0;
  const [currentEpisodeIdx, setCurrentEpisodeIdx] = useState(() => {
    const epKey = `unlock_ep_${movie.id}`;
    const savedEp = localStorage.getItem(epKey);
    if (savedEp !== null) {
      localStorage.removeItem(epKey); // Consume token immediately
      return parseInt(savedEp, 10) || 0;
    }
    return 0;
  });

  // Reset active episode and preview timers when movie changes
  useEffect(() => {
    setCurrentEpisodeIdx(0);
    setPlayerError('');
    setIsPlaying(false);
    setElapsedTime(0);
    setLimitReached(false);
  }, [movie.id]);

  const activeEpisode = hasEpisodes ? movie.episodes[currentEpisodeIdx] : null;

  // Determine active videoUrl and driveId based on active episode
  const activeVideoUrl = activeEpisode
    ? (activeEpisode.source.startsWith('http') || activeEpisode.source.includes('/') || activeEpisode.source.includes('.') ? activeEpisode.source : '')
    : movie.videoUrl;

  const activeDriveId = activeEpisode
    ? (activeVideoUrl ? '' : activeEpisode.source)
    : movie.driveId;

  // Detect if driveId is a fake placeholder or if we have a direct videoUrl or Google Drive API Key
  const isPlaceholderDriveId = !activeDriveId || activeDriveId.length < 25 || activeDriveId.includes('ExampleDriveId');
  const useHtml5Player = isPlaceholderDriveId || !!activeVideoUrl || !!gdriveApiKey;
  const embedUrl = `https://drive.google.com/file/d/${activeDriveId}/preview`;

  // Convert driveId to direct download streaming link, or use the direct videoUrl (authenticated if API key is provided)
  const videoSrc = activeVideoUrl || (isPlaceholderDriveId
    ? getDummyVideoUrl(movie.id)
    : (gdriveApiKey
      ? `https://www.googleapis.com/drive/v3/files/${activeDriveId}?alt=media&key=${gdriveApiKey}`
      : `https://drive.google.com/uc?export=download&id=${activeDriveId}`));

  // Preview limit timer for non-subscribed users watching single movies (180s = 3 minutes)
  useEffect(() => {
    if (!isLimited || limitReached) return;

    let interval = null;
    const shouldTrack = useHtml5Player ? isPlaying : !isLoading;

    if (shouldTrack) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= 180 - 1) {
            setLimitReached(true);
            if (videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
            clearInterval(interval);
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLimited, limitReached, isPlaying, isLoading, useHtml5Player]);

  // Reset player state immediately when switching source URLs (episodes)
  useEffect(() => {
    hasResumedRef.current = false;
    if (isUnlocked) {
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(true);
      setPlayerError('');
    }
  }, [currentEpisodeIdx, videoSrc, embedUrl, isUnlocked]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!isUnlocked || limitReached) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle Click on Locked Gate Overlay
  const handleGateClick = () => {
    // Select a random affiliate link
    let targetUrl = movie.affiliateUrl;
    if (affiliateLinks && affiliateLinks.length > 0) {
      const randIndex = Math.floor(Math.random() * affiliateLinks.length);
      targetUrl = affiliateLinks[randIndex];
    }
    if (!targetUrl) {
      targetUrl = 'https://shopee.co.id';
    }

    // Tab Flipping technique:
    // 1. Save a temporary one-time unlock token in localStorage
    const tokenKey = `unlock_${movie.id}`;
    localStorage.setItem(tokenKey, 'true');
    // Save selected episode index to carry over to the new tab
    localStorage.setItem(`unlock_ep_${movie.id}`, currentEpisodeIdx.toString());

    // 2. Open the video player in a new tab (clean, suspicious-free URL)
    const playerUrl = `${window.location.origin}${window.location.pathname}#play=${movie.id}`;
    window.open(playerUrl, '_blank');

    // 3. Redirect the current tab (which goes to background) to the affiliate link
    window.location.href = targetUrl;
  };

  // Handle Time Update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      
      if (isLimited && time >= 180) {
        videoRef.current.currentTime = 180;
        videoRef.current.pause();
        setIsPlaying(false);
        setLimitReached(true);
        setCurrentTime(180);
        return;
      }

      setCurrentTime(time);
      
      const userId = currentUser ? currentUser.id : 'guest';
      const progressKey = `playback_progress_${userId}_${movie.id}_${currentEpisodeIdx}`;
      localStorage.setItem(progressKey, time.toString());

      // Save duration for calculating percentage in history
      if (videoRef.current.duration) {
        const durationKey = `playback_duration_${userId}_${movie.id}_${currentEpisodeIdx}`;
        localStorage.setItem(durationKey, videoRef.current.duration.toString());
      }
    }
  };

  // Handle Duration Change
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setPlayerError(''); // Clear any previous errors on successful metadata load
    }
  };

  // Handle when video is ready to play (reliable for seeking)
  const handleCanPlay = () => {
    setIsLoading(false);
    if (!hasResumedRef.current && videoRef.current) {
      hasResumedRef.current = true;
      const vidDuration = videoRef.current.duration;
      
      const userId = currentUser ? currentUser.id : 'guest';
      const progressKey = `playback_progress_${userId}_${movie.id}_${currentEpisodeIdx}`;
      const savedProgress = localStorage.getItem(progressKey);
      
      if (savedProgress) {
        const parsedProgress = parseFloat(savedProgress);
        // Only resume if progress is > 5s and not close to the end (less than duration - 10s)
        if (parsedProgress > 5 && parsedProgress < vidDuration - 10) {
          videoRef.current.currentTime = parsedProgress;
          setCurrentTime(parsedProgress);
          
          // Show resume toast/message overlay
          setResumeMessage(`Melanjutkan tontonan dari ${formatTime(parsedProgress)}`);
          setTimeout(() => {
            setResumeMessage('');
          }, 3000);
        }
      }
    }
  };

  // Handle video loading errors
  const handleVideoError = () => {
    setIsLoading(false);
    const errorCode = videoRef.current?.error?.code;
    let message = 'Gagal memuat video dari server streaming.';
    if (errorCode === 1) message = 'Proses pemutaran dibatalkan.';
    if (errorCode === 2) message = 'Koneksi jaringan terputus saat memuat video.';
    if (errorCode === 3) message = 'Format video tidak didukung atau gagal didekode.';
    if (errorCode === 4) {
      message = gdriveApiKey 
        ? 'Akses video ditolak. Pastikan API Key Google Drive Anda aktif dan file video disetel publik (anyone with link).'
        : 'File video tidak dapat diakses langsung. Anda membutuhkan API Key Google Drive di Admin Panel.';
    }
    setPlayerError(message);
  };

  // Handle Seekbar Change
  const handleSeekChange = (e) => {
    let newTime = parseFloat(e.target.value);
    if (isLimited && newTime >= 180) {
      newTime = 180;
      setLimitReached(true);
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle Volume Change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      videoRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  // Lock orientation to landscape
  const lockLandscape = () => {
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {
          console.log('Orientation lock rejected/unsupported:', err);
        });
      } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
      } else if (screen.mozLockOrientation) {
        screen.mozLockOrientation('landscape');
      } else if (screen.msLockOrientation) {
        screen.msLockOrientation('landscape');
      }
    } catch (e) {
      console.warn('Orientation lock failed:', e);
    }
  };

  // Unlock orientation
  const unlockOrientation = () => {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      } else if (screen.unlockOrientation) {
        screen.unlockOrientation();
      } else if (screen.mozUnlockOrientation) {
        screen.mozUnlockOrientation();
      } else if (screen.msUnlockOrientation) {
        screen.msUnlockOrientation();
      }
    } catch (e) {
      console.warn('Orientation unlock failed:', e);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    const video = videoRef.current;
    if (!container) return;

    const requestFS = container.requestFullscreen || 
                      container.webkitRequestFullscreen || 
                      container.mozRequestFullScreen || 
                      container.msRequestFullscreen;

    const exitFS = document.exitFullscreen || 
                   document.webkitExitFullscreen || 
                   document.mozCancelFullScreen || 
                   document.msExitFullscreen;

    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
      
      if (requestFS) {
        // Try container request first
        const promise = requestFS.call(container);
        if (promise) {
          promise.then(() => {
            setIsFullscreen(true);
            lockLandscape();
          }).catch(err => {
            // Fallback to video element fullscreen if container request fails
            if (video && video.webkitEnterFullscreen) {
              video.webkitEnterFullscreen();
            } else {
              console.error('Error entering fullscreen:', err);
            }
          });
        } else {
          setIsFullscreen(true);
          lockLandscape();
        }
      } else if (video && video.webkitEnterFullscreen) {
        // Direct iOS Safari fallback on video element
        video.webkitEnterFullscreen();
      }
    } else {
      if (exitFS) {
        const promise = exitFS.call(document);
        if (promise) {
          promise.then(() => {
            setIsFullscreen(false);
            unlockOrientation();
          }).catch(err => {
            console.error('Error exiting fullscreen:', err);
          });
        } else {
          setIsFullscreen(false);
          unlockOrientation();
        }
      }
    }
  };

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!(document.fullscreenElement || 
                     document.webkitFullscreenElement || 
                     document.mozFullScreenElement || 
                     document.msFullscreenElement);
      setIsFullscreen(isFS);
      if (!isFS) {
        unlockOrientation();
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Format Time (mm:ss)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Auto-hide controls on mouse idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);


  const handleClose = () => {
    window.location.hash = ''; // Clear hash router
    onClose();
  };

  return (
    <div className="player-section">
      {/* Control bar above player */}
      <div className="player-controls-top">
        <button className="back-btn" onClick={handleClose}>
          <ArrowLeft size={18} />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      {/* Responsive video container */}
      <div className="video-aspect-container glass-panel">
        {isLimited && limitReached ? (
          <div 
            className="player-loader" 
            style={{ 
              background: 'rgba(9, 13, 22, 0.96)',
              zIndex: 50,
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              inset: 0
            }}
          >
            <div 
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: '#ef4444'
              }}
            >
              <Lock size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
              Batas Waktu Pratinjau 3 Menit Habis
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '360px', marginBottom: '24px', lineHeight: '1.5' }}>
              Anda sedang menonton film full-length. Silakan berlangganan paket Premium untuk melanjutkan menonton film ini hingga selesai.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => {
                  if (onSubscribeClick) onSubscribeClick();
                }}
              >
                <Sparkles size={14} />
                <span>Berlangganan Sekarang</span>
              </button>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleClose}
              >
                <span>Kembali</span>
              </button>
            </div>
          </div>
        ) : !isUnlocked ? (
          <div 
            className="player-stealth-gate" 
            style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.55)), url(${movie.backdrop || movie.poster})`
            }}
            onClick={handleGateClick}
          >
            <button className="stealth-play-btn" aria-label="Play movie">
              <Play size={36} fill="currentColor" />
            </button>
          </div>
        ) : (
          <>
            {!useHtml5Player ? (
              <div className="iframe-player-wrapper">
                {isLoading && (
                  <div className="player-loader">
                    <div className="spinner"></div>
                    <p>Menghubungkan ke Server Streaming...</p>
                  </div>
                )}
                <iframe
                  key={`${currentEpisodeIdx}_${embedUrl}`}
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  allow="autoplay"
                  allowFullScreen
                  title={movie.title}
                  onLoad={() => setIsLoading(false)}
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  className="google-drive-iframe"
                ></iframe>
              </div>
            ) : (
              <div 
                ref={playerContainerRef}
                className="custom-player-container"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
              >
                {isLoading && (
                  <div className="player-loader">
                    <div className="spinner"></div>
                    <p>Menghubungkan ke Server Streaming...</p>
                  </div>
                )}

                {resumeMessage && (
                  <div 
                    className="glass-panel animate-fade-in" 
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '8px 16px',
                      borderRadius: '30px',
                      fontSize: '0.82rem',
                      fontWeight: '500',
                      color: '#f8fafc',
                      background: 'rgba(9, 13, 22, 0.85)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                      zIndex: 10,
                      pointerEvents: 'none'
                    }}
                  >
                    <span>{resumeMessage}</span>
                  </div>
                )}

                {/* Custom Video Element or Error Screen */}
                {playerError ? (
                  <div className="player-error-container">
                    <AlertTriangle size={40} className="error-icon" />
                    <p className="error-message">{playerError}</p>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => {
                        setPlayerError('');
                        setIsLoading(true);
                        if (videoRef.current) {
                          videoRef.current.load();
                        }
                      }}
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  <video
                    key={`${currentEpisodeIdx}_${videoSrc}`}
                    ref={videoRef}
                    src={videoSrc}
                    autoPlay
                    playsInline
                    className="custom-video-element"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onLoadStart={() => setIsLoading(true)}
                    onCanPlay={handleCanPlay}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={handleVideoError}
                    onClick={togglePlay}
                    onEnded={() => {
                      const userId = currentUser ? currentUser.id : 'guest';
                      const progressKey = `playback_progress_${userId}_${movie.id}_${currentEpisodeIdx}`;
                      localStorage.removeItem(progressKey);
                    }}
                  ></video>
                )}

                {/* Centered Large Play Button when Paused */}
                {!isPlaying && !isLoading && !playerError && (
                  <div className="center-play-overlay" onClick={togglePlay}>
                    <button className="center-play-button" aria-label="Play">
                      <Play size={40} fill="currentColor" />
                    </button>
                  </div>
                )}

                {/* Custom Control Bar (Glassmorphism design) */}
                <div className={`custom-player-controls ${showControls ? 'visible' : ''}`}>
                  <div className="controls-row-top">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeekChange}
                      className="custom-seekbar"
                    />
                  </div>

                  <div className="controls-row-bottom">
                    <div className="controls-left">
                      <button className="control-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                      </button>

                      <div className="volume-container">
                        <button className="control-btn" onClick={toggleMute} aria-label="Mute/Unmute">
                          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="volume-slider"
                        />
                      </div>

                      <span className="time-display">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="controls-right">
                      <button className="control-btn" onClick={toggleFullscreen} aria-label="Toggle Fullscreen">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Episode Selector List (if the movie has episodes) */}
      {hasEpisodes && (
        <div className="episode-selector-container glass-panel" style={{ marginTop: '16px', padding: '16px', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Pilih Episode:</span>
            <span className="accent-text" style={{ fontSize: '0.85rem', fontWeight: '400', background: 'rgba(124, 58, 237, 0.15)', padding: '2px 8px', borderRadius: '20px' }}>
              {activeEpisode ? activeEpisode.title : ''}
            </span>
          </h4>
          <div className="episode-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '8px' }}>
            {movie.episodes.map((ep, idx) => {
              const isPremiumUser = currentUser && (currentUser.role === 'member' || currentUser.role === 'superadmin' || currentUser.role === 'staf');
              const isEpisodeLocked = idx === 0 ? false : !isPremiumUser;

              return (
                <button
                  key={idx}
                  className={`btn ${currentEpisodeIdx === idx ? 'btn-primary' : 'btn-text'}`}
                  style={{ 
                    padding: '8px 4px', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: '0.85rem',
                    border: isEpisodeLocked 
                      ? '1px dashed rgba(239, 68, 68, 0.4)' 
                      : (currentEpisodeIdx === idx ? 'none' : '1px solid var(--border-color)'),
                    background: currentEpisodeIdx === idx 
                      ? 'var(--primary-color)' 
                      : 'rgba(255,255,255,0.02)',
                    color: isEpisodeLocked ? '#f87171' : 'var(--text-primary)',
                    opacity: isEpisodeLocked ? 0.8 : 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                  onClick={() => {
                    if (isEpisodeLocked) {
                      if (onSubscribeClick) {
                        onSubscribeClick();
                      }
                      return;
                    }
                    if (currentEpisodeIdx !== idx) {
                      setCurrentEpisodeIdx(idx);
                    }
                  }}
                  title={isEpisodeLocked ? `${ep.title} (Khusus Premium)` : ep.title}
                >
                  {isEpisodeLocked && <Lock size={12} />}
                  <span>{ep.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}    </div>
  );
}
