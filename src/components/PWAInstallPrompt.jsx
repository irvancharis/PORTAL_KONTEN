import React, { useState, useEffect } from 'react';
import { Download, X, Share, MoreVertical, Plus, Info } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  };

  const isIOS = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  useEffect(() => {
    // If already running as standalone app, don't show prompt
    if (isStandalone()) {
      setIsVisible(false);
      return;
    }

    const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
    
    // Automatically show install banner on mobile browsers if not dismissed
    if (isMobileDevice() && !isDismissed) {
      setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Ensure banner is visible on browser support
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the native browser install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      
      // We've used the prompt, and can't use it again
      setDeferredPrompt(null);
      setIsVisible(false);
    } else {
      // Fallback for browsers that don't support automated prompts (like iOS Safari)
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal to not annoy the user
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const getDeviceDetails = () => {
    if (isIOS()) {
      return {
        type: 'ios',
        title: 'Instal Aplikasi iOS',
        description: 'Instal untuk akses lebih cepat, buat & ikuti kampanye kreatif, serta temukan solusi industri kreatif Anda langsung dari homescreen iOS!',
      };
    } else if (/Android/i.test(navigator.userAgent)) {
      return {
        type: 'android',
        title: 'Instal Aplikasi Android',
        description: 'Instal untuk akses lebih cepat, buat & ikuti kampanye kreatif, serta temukan solusi industri kreatif Anda langsung dari homescreen Android!',
      };
    } else {
      return {
        type: 'pc',
        title: 'Instal Aplikasi PC',
        description: 'Instal untuk akses lebih cepat, buat & ikuti kampanye kreatif, serta temukan solusi industri kreatif Anda langsung dari desktop PC!',
      };
    }
  };

  const device = getDeviceDetails();

  if (!isVisible) return null;

  return (
    <>
      <div className="pwa-prompt-banner">
        <div className="pwa-prompt-content">
          <div className="pwa-icon-container">
            <Download size={20} className="pwa-download-icon" />
          </div>
          <div className="pwa-text">
            <h4>{device.title}</h4>
            <p>{device.description}</p>
          </div>
        </div>
        
        <div className="pwa-prompt-actions">
          <button className="btn btn-primary" onClick={handleInstallClick}>
            Instal Sekarang
          </button>
          <button className="btn-close-pwa" onClick={handleDismiss} aria-label="Tutup banner">
            <X size={18} />
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className="pwa-instructions-overlay" onClick={() => setShowInstructions(false)}>
          <div className="pwa-instructions-card" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-modal-header">
              <h3 className="pwa-modal-title">
                <Info size={18} />
                <span>Petunjuk Instalasi</span>
              </h3>
              <button className="pwa-modal-close-btn" onClick={() => setShowInstructions(false)}>
                <X size={20} />
              </button>
            </div>

            {device.type === 'ios' && (
              <div className="pwa-instructions-body">
                <p>Aplikasi ini dapat diinstal di iOS menggunakan browser <strong>Safari</strong>:</p>
                <ol className="pwa-instructions-list">
                  <li>
                    Ketuk tombol <strong>Bagikan</strong> (<Share size={16} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} />) di toolbar Safari.
                  </li>
                  <li>
                    Gulir menu ke bawah dan pilih <strong>Tambahkan ke Layar Utama</strong> (<Plus size={16} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} />).
                  </li>
                  <li>
                    Ketuk <strong>Tambah</strong> di pojok kanan atas untuk mengonfirmasi.
                  </li>
                </ol>
              </div>
            )}

            {device.type === 'android' && (
              <div className="pwa-instructions-body">
                <p>Untuk browser Android selain Chrome atau jika tombol otomatis tidak muncul:</p>
                <ol className="pwa-instructions-list">
                  <li>
                    Ketuk ikon <strong>Menu</strong> (<MoreVertical size={16} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} />) di browser Anda.
                  </li>
                  <li>
                    Pilih menu <strong>Instal aplikasi</strong> atau <strong>Tambahkan ke Layar Utama</strong>.
                  </li>
                  <li>
                    Ikuti petunjuk di layar untuk menyelesaikan instalasi.
                  </li>
                </ol>
              </div>
            )}

            {device.type === 'pc' && (
              <div className="pwa-instructions-body">
                <p>Aplikasi ini dapat diinstal di PC/Desktop Anda:</p>
                <ol className="pwa-instructions-list">
                  <li>
                    Cari ikon <strong>Instal</strong> (<Download size={16} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} />) di bilah alamat (address bar) browser Anda di kanan atas.
                  </li>
                  <li>
                    Atau ketuk menu browser (<MoreVertical size={16} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} />) dan pilih <strong>Instal Aplikasi</strong>.
                  </li>
                  <li>
                    Klik <strong>Instal</strong> pada dialog konfirmasi yang muncul.
                  </li>
                </ol>
              </div>
            )}

            <button className="btn btn-primary" onClick={() => setShowInstructions(false)}>
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
