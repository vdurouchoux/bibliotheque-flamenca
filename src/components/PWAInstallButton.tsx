import React, { useState } from 'react';
import { Smartphone, Download, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallGuideModal } from './InstallGuideModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'pill';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed and launched from home screen, hide
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2a2217] hover:bg-[#382d1c] border border-[#e5a93b]/40 hover:border-[#e5a93b] text-xs font-semibold text-[#e5a93b] transition-all cursor-pointer shadow-sm ${className}`}
          title="Installer sur mobile"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sur mon tél</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className={`p-4 rounded-2xl bg-gradient-to-r from-[#2a2217] via-[#201a14] to-[#171411] border border-[#e5a93b]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e5a93b]/20 border border-[#e5a93b]/40 flex items-center justify-center text-[#e5a93b] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#f4efe6]">
                Installez l'application sur votre smartphone
              </h4>
              <p className="text-[11px] sm:text-xs text-[#a69c8f]">
                Accès direct depuis votre écran d'accueil, plein écran et métronome fluide.
              </p>
            </div>
          </div>

          <button
            onClick={handleClick}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#e5a93b] hover:bg-[#d4972c] text-[#121110] font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-md shadow-[#e5a93b]/20"
          >
            <Download className="w-4 h-4" />
            <span>Installer l'application</span>
          </button>
        </div>
      )}

      {showModal && (
        <InstallGuideModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
};
