import React, { useState } from 'react';
import { 
  X, Copy, Check, Share2, Mail, ExternalLink, MessageCircle, Facebook
} from 'lucide-react';
import { ShareOptions, getSocialShareLinks, shareContent } from '../utils/shareUtils';

interface ShareModalProps {
  options: ShareOptions;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ options, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [facebookCopied, setFacebookCopied] = useState<boolean>(false);
  const [nativeMessage, setNativeMessage] = useState<string | null>(null);

  const links = getSocialShareLinks(options);
  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(options.url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = options.url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleFacebookShare = async (e: React.MouseEvent) => {
    // 1. Toujours copier automatiquement le lien dans le presse-papier
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(options.url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = options.url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      // ignore fallback
    }

    setFacebookCopied(true);
    setTimeout(() => setFacebookCopied(false), 4000);

    // 2. Ouvrir la fenêtre de dialogue officielle Facebook
    const width = 640;
    const height = 500;
    const left = typeof window !== 'undefined' ? Math.max(0, (window.innerWidth - width) / 2 + window.screenX) : 100;
    const top = typeof window !== 'undefined' ? Math.max(0, (window.innerHeight - height) / 2 + window.screenY) : 100;
    
    try {
      const fbPopup = window.open(
        links.facebook,
        'fbShareWindow',
        `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`
      );
      if (fbPopup) {
        e.preventDefault();
        fbPopup.focus();
      }
    } catch {
      // Si la popup est bloquée par le navigateur, le lien href standard target="_blank" prend le relais
    }
  };

  const handleNativeShare = async () => {
    const res = await shareContent(options);
    if (res.method !== 'dismissed') {
      setNativeMessage(res.message);
      setTimeout(() => setNativeMessage(null), 3000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#181512] border border-[#3d3326] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-4 sm:p-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2e2720] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e5a93b]/15 text-[#e5a93b]">
              <Share2 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#f4efe6] font-serif">
              Partager
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#25201a] transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Title Preview */}
        <div className="bg-[#201a14] border border-[#362b1e] rounded-xl p-3 space-y-1">
          <p className="text-xs font-bold text-[#e5a93b] line-clamp-1">
            {options.title}
          </p>
          {options.text && (
            <p className="text-[11px] text-[#b8ada0] line-clamp-2">
              {options.text}
            </p>
          )}
        </div>

        {/* Direct Destination Buttons */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c8072]">
            Choisir une application :
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1b2a1f] hover:bg-[#233829] border border-[#2e4d36] text-[#6ee7b7] font-semibold text-xs transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
            >
              <span className="p-1.5 rounded-lg bg-[#25d366]/20 text-[#25d366] shrink-0">
                <MessageCircle className="w-4 h-4" />
              </span>
              <div className="text-left">
                <div className="font-bold text-[#f4efe6]">WhatsApp</div>
                <div className="text-[10px] text-[#a7f3d0]">Message direct</div>
              </div>
            </a>

            {/* Gmail */}
            <a
              href={links.gmail}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#2a1a1a] hover:bg-[#382222] border border-[#4d2d2d] text-[#fca5a5] font-semibold text-xs transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
            >
              <span className="p-1.5 rounded-lg bg-[#ea4335]/20 text-[#ea4335] shrink-0">
                <Mail className="w-4 h-4" />
              </span>
              <div className="text-left">
                <div className="font-bold text-[#f4efe6]">Gmail</div>
                <div className="text-[10px] text-[#fecaca]">E-mail pré-rempli</div>
              </div>
            </a>

            {/* Facebook */}
            <a
              href={links.facebook}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleFacebookShare}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border font-semibold text-xs transition-all shadow-sm hover:scale-[1.02] cursor-pointer ${
                facebookCopied
                  ? 'bg-[#18324f] border-[#3b82f6] text-[#bfdbfe]'
                  : 'bg-[#162233] hover:bg-[#1e2f47] border-[#273c5c] text-[#93c5fd]'
              }`}
            >
              <span className="p-1.5 rounded-lg bg-[#1877f2]/25 text-[#60a5fa] shrink-0">
                <Facebook className="w-4 h-4" />
              </span>
              <div className="text-left">
                <div className="font-bold text-[#f4efe6]">Facebook</div>
                <div className="text-[10px] text-[#bfdbfe]">
                  {facebookCopied ? '✓ Lien copié !' : 'Partager / Coller'}
                </div>
              </div>
            </a>

            {/* Email (Mailto classique) */}
            <a
              href={links.mailto}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#241f1a] hover:bg-[#302922] border border-[#3e342a] text-[#f4efe6] font-semibold text-xs transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
            >
              <span className="p-1.5 rounded-lg bg-[#e5a93b]/20 text-[#e5a93b] shrink-0">
                <Mail className="w-4 h-4" />
              </span>
              <div className="text-left">
                <div className="font-bold text-[#f4efe6]">Autre e-mail</div>
                <div className="text-[10px] text-[#b8ada0]">Client par défaut</div>
              </div>
            </a>
          </div>

          {facebookCopied && (
            <div className="p-2.5 rounded-xl bg-[#132338] border border-[#1f3f6b] text-xs text-[#93c5fd] flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Lien copié dans votre presse-papier ! Fenêtre Facebook ouverte (ou collez-le directement dans votre publication).</span>
            </div>
          )}
        </div>

        {/* Copy Link Section */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c8072]">
            Ou copier le lien direct :
          </p>

          <div className="flex items-center gap-2 bg-[#12100e] border border-[#332b21] p-1.5 rounded-xl">
            <input
              type="text"
              readOnly
              value={options.url}
              className="bg-transparent text-xs text-[#a69c8f] px-2 flex-1 focus:outline-none truncate select-all"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Native mobile share button (if supported on device) */}
        {hasNativeShare && (
          <div className="pt-2 border-t border-[#2e2720]">
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#221c17] hover:bg-[#2c241d] border border-[#3e3223] text-xs font-bold text-[#e5a93b] hover:text-[#fff] transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Plus d'options (partage système de votre téléphone)</span>
            </button>
          </div>
        )}

        {nativeMessage && (
          <p className="text-center text-xs text-[#e5a93b] font-medium animate-in fade-in">
            {nativeMessage}
          </p>
        )}
      </div>
    </div>
  );
};
