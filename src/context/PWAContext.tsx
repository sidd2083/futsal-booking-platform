import React, { createContext, useContext, useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import { Share, PlusSquare, Smartphone, Check } from 'lucide-react';

interface PWAContextType {
  canInstall: boolean;
  isInstalled: boolean;
  promptInstall: () => void;
}

const PWAContext = createContext<PWAContextType>({
  canInstall: false,
  isInstalled: false,
  promptInstall: () => {},
});

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    // Check if iOS Safari
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General prompt modal explaining how to install
      setShowIOSModal(true);
    }
  };

  return (
    <PWAContext.Provider
      value={{
        canInstall: Boolean(deferredPrompt) || !isInstalled,
        isInstalled,
        promptInstall,
      }}
    >
      {children}

      {/* PWA Installation Guidance Modal */}
      <Modal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        title="Install Maya Sports App"
        description="Add Maya Sports Centre to your device home screen for 1-tap bookings and offline pass access."
      >
        <div className="space-y-5 text-surface-700 text-xs sm:text-sm">
          <div className="flex items-center justify-center py-2">
            <Logo size="lg" />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-emerald-950 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              How to Install as an App:
            </h4>

            <div className="space-y-2 text-xs text-emerald-900 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap the <strong>Share</strong> button in Safari <Share className="w-3.5 h-3.5 inline text-emerald-700" /> or the <strong>Three Dots (⋮)</strong> menu in Chrome.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-700" /> or <strong>"Install App"</strong>.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> in the top right corner. The Maya Sports icon will appear on your phone home screen!
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-surface-500 pt-1">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fast launch, zero app store downloads, full-screen native mobile experience.</span>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold"
              onClick={() => setShowIOSModal(false)}
            >
              Got It
            </Button>
          </div>
        </div>
      </Modal>
    </PWAContext.Provider>
  );
};

export const usePWA = () => useContext(PWAContext);
