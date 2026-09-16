import React, { useState, useEffect } from 'react';
import { X, Smartphone, QrCode, Copy, Check, Download, Share2, PlusSquare, Sparkles, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallGuideModalProps {
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [platform, setPlatform] = useState<'ios' | 'android'>(isIOS ? 'ios' : 'android');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Get current app URL or fallback shared URL
  const appUrl = typeof window !== 'undefined' && window.location.href.startsWith('http')
    ? window.location.href.split('?')[0].split('#')[0]
    : 'https://ais-pre-sprsm3bon22f72k6lwu3za-118125602394.europe-west2.run.app';

  useEffect(() => {
    QRCode.toDataURL(appUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#141210',
        light: '#ffffff'
      }
    }).then(url => {
      setQrDataUrl(url);
    }).catch(err => {
      console.error('Error generating QR code:', err);
    });
  }, [appUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#181512] border border-[#3b3228] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1e1a16] border-b border-[#2e2720]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#e5a93b]/20 text-[#e5a93b]">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif">
                Installer sur votre téléphone
              </h3>
              <p className="text-xs text-[#a69c8f]">
                Application web autonome (PWA), plein écran et sans téléchargement store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#2a241e] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Direct Install button if browser supports beforeinstallprompt */}
          {isInstallable && (
            <div className="p-4 rounded-xl bg-[#2a2217] border border-[#e5a93b]/50 flex items-center justify-between gap-3 shadow-lg">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#e5a93b]">
                  Installation en un clic disponible
                </h4>
                <p className="text-xs text-[#c9bcaa]">
                  Votre navigateur peut installer l'application directement.
                </p>
              </div>
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e5a93b] hover:bg-[#d4972c] text-[#121110] font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Installer</span>
              </button>
            </div>
          )}

          {/* QR Code & Direct Link */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#13110f] border border-[#2c2620]">
            {qrDataUrl ? (
              <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
                <img
                  src={qrDataUrl}
                  alt="QR Code d'accès mobile"
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                />
              </div>
            ) : (
              <div className="w-28 h-28 bg-[#221e1a] rounded-xl flex items-center justify-center shrink-0">
                <QrCode className="w-8 h-8 text-[#8c8173]" />
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#f4efe6]">
                1. Scannez avec l'appareil photo de votre téléphone
              </h4>
              <p className="text-xs text-[#a69c8f] leading-relaxed">
                Pointez l'appareil photo de votre smartphone vers ce QR Code pour ouvrir directement la Bibliothèque Flamenca.
              </p>

              {/* Copy URL */}
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#221e1a] hover:bg-[#2e2823] border border-[#383027] text-xs font-semibold text-[#e5a93b] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Lien copié !' : 'Copier l\'adresse'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Add to Home Screen Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#f4efe6]">
              2. Ajoutez l'icône sur votre écran d'accueil
            </h4>

            {/* Platform tabs */}
            <div className="flex rounded-xl bg-[#141210] p-1 border border-[#2b251f]">
              <button
                onClick={() => setPlatform('ios')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                  platform === 'ios'
                    ? 'bg-[#e5a93b] text-[#121110]'
                    : 'text-[#8c8173] hover:text-[#d4c9ba]'
                }`}
              >
                🍏 iPhone / iPad (Safari)
              </button>
              <button
                onClick={() => setPlatform('android')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                  platform === 'android'
                    ? 'bg-[#e5a93b] text-[#121110]'
                    : 'text-[#8c8173] hover:text-[#d4c9ba]'
                }`}
              >
                🤖 Android (Chrome / Samsung)
              </button>
            </div>

            {/* iOS Instructions */}
            {platform === 'ios' && (
              <div className="bg-[#1c1814] border border-[#2e2720] rounded-xl p-4 space-y-3 text-xs text-[#d4c9ba]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2a241e] text-[#e5a93b] font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    1
                  </span>
                  <p>
                    Ouvrez le lien dans le navigateur <strong>Safari</strong> (navigateur officiel Apple).
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2a241e] text-[#e5a93b] font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    2
                  </span>
                  <p>
                    Appuyez sur le bouton de <strong>Partage</strong> <Share2 className="inline w-3.5 h-3.5 text-[#e5a93b] mx-0.5" /> (le carré avec la flèche vers le haut, en bas de votre écran).
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2a241e] text-[#e5a93b] font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    3
                  </span>
                  <p>
                    Faites défiler la liste vers le bas et touchez <strong>« Sur l'écran d'accueil »</strong> <PlusSquare className="inline w-3.5 h-3.5 text-[#e5a93b] mx-0.5" />.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2a241e] text-[#e5a93b] font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    4
                  </span>
                  <p>
                    Appuyez sur <strong>« Ajouter »</strong> en haut à droite. L'icône de la guitare flamenca apparaîtra directement sur votre écran comme une vraie application !
                  </p>
                </div>
              </div>
            )}

            {/* Android Instructions */}
            {platform === 'android' && (
              <div className="bg-[#1c1814] border border-[#2e2720] rounded-xl p-4 space-y-3 text-xs text-[#d4c9ba]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2a241e] text-[#e5a93b] font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    1
                  </span>
                  <p>
                    Ouvrez le lien dans <strong>Google Chrome</strong> sur votre téléphone Android.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2a241e] text-[#e5a93b] font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    2
                  </span>
                  <p>
                    Appuyez sur le menu <strong className="font-mono">⋮</strong> (les 3 petits points en haut à droite).
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2a241e] text-[#e5a93b] font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    3
                  </span>
                  <p>
                    Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2a241e] text-[#e5a93b] font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    4
                  </span>
                  <p>
                    Confirmez : l'application s'installe instantanément et se lance en plein écran sans barre d'adresse.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#241e18] hover:bg-[#2f2820] text-xs font-bold text-[#f4efe6] transition-colors cursor-pointer"
            >
              Compris, fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
