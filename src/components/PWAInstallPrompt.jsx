import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install banner after a short delay
      const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already running as standalone (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-prompt-banner glass-panel animate-fade-in-up">
      <div className="pwa-prompt-content">
        <div className="pwa-icon-container">
          <Download size={20} className="pwa-download-icon" />
        </div>
        <div className="pwa-text">
          <h4>Instal Aplikasi Web</h4>
          <p>Instal untuk menikmati streaming lebih cepat, hemat data, dan akses langsung dari homescreen Anda!</p>
        </div>
      </div>
      
      <div className="pwa-prompt-actions">
        <button className="btn btn-primary btn-sm" onClick={handleInstallClick}>
          Instal Sekarang
        </button>
        <button className="btn-close-pwa" onClick={handleDismiss} aria-label="Tutup banner">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
