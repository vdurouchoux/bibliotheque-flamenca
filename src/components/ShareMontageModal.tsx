import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, Share2, Mail, ExternalLink, MessageCircle, Facebook,
  ShieldCheck, User, Sparkles, Layers, Video
} from 'lucide-react';
import { MontageBlock, BlockVideoLink } from '../types';
import { 
  SharedMontagePayload, 
  getUserDisplayName, saveUserDisplayName 
} from '../utils/storage';
import { buildShareUrl, shareContent } from '../utils/shareUtils';
import { saveSharedMontageCloud } from '../utils/firebaseSync';

interface ShareMontageModalProps {
  isOpen: boolean;
  onClose: () => void;
  paloId: string;
  paloName: string;
  montageKey: string;
  montageCurrentLabel: string;
  blocks: MontageBlock[];
  blockLinks?: Record<string, BlockVideoLink>;
}

export const ShareMontageModal: React.FC<ShareMontageModalProps> = ({
  isOpen,
  onClose,
  paloId,
  paloName,
  montageKey,
  montageCurrentLabel,
  blocks,
  blockLinks = {}
}) => {
  const [authorName, setAuthorName] = useState<string>(() => {
    const saved = getUserDisplayName();
    if (saved) return saved;
    // Extract from current label if it already has "Montage de X"
    const match = montageCurrentLabel.match(/Montage de (.+)/i);
    return match ? match[1].trim() : '';
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [facebookCopied, setFacebookCopied] = useState<boolean>(false);
  const [nativeMessage, setNativeMessage] = useState<string | null>(null);

  // Identifiant court unique pour le lien (court et propre, sans pavé de texte incompréhensible)
  const [cloudMontageId, setCloudMontageId] = useState<string>(() => {
    const cleanPalo = (paloId || 'montage').toLowerCase().replace(/[^a-z0-9]/g, '');
    const rand = Math.random().toString(36).substring(2, 7);
    return `m_${cleanPalo.slice(0, 8)}_${rand}`;
  });

  useEffect(() => {
    if (authorName.trim()) {
      saveUserDisplayName(authorName.trim());
    }
  }, [authorName]);

  const cleanAuthor = authorName.trim();
  const targetTitle = cleanAuthor ? `Montage de ${cleanAuthor}` : montageCurrentLabel;

  // Sauvegarde automatique dans le Cloud pour générer un lien court et propre
  useEffect(() => {
    if (!isOpen) return;

    const payload: SharedMontagePayload = {
      v: 1,
      paloId,
      author: cleanAuthor,
      title: targetTitle,
      blocks: blocks.map(b => ({
        id: b.id,
        title: b.title,
        description: b.description || '',
        danceTips: b.danceTips || '',
        guitarCode: b.guitarCode || '',
        durationApprox: b.durationApprox || ''
      })),
      links: blockLinks,
      created: Date.now()
    };

    saveSharedMontageCloud(payload, cloudMontageId).catch(err => {
      console.warn('Erreur lors de la sauvegarde cloud du montage court:', err);
    });
  }, [isOpen, paloId, cleanAuthor, targetTitle, blocks, blockLinks, cloudMontageId]);

  if (!isOpen) return null;

  // Lien court et propre sans aucun encodage base64 visible
  const shareUrl = buildShareUrl({
    discipline: 'danse',
    palo: paloId,
    section: 'montages',
    montage_id: cloudMontageId
  });

  const shareTitle = `Montage Flamenco : ${targetTitle} (${paloName})`;
  const shareText = `Regarde mon montage de ${paloName} ("${targetTitle}") :`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedMailTitle = encodeURIComponent(shareTitle);
  const encodedMailBody = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
  const encodedWhatsapp = encodeURIComponent(`${shareText}\n${shareUrl}`);

  const links = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedWhatsapp}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedMailTitle}&body=${encodedMailBody}`,
    mailto: `mailto:?subject=${encodedMailTitle}&body=${encodedMailBody}`
  };

  const handleFacebookShare = async (e: React.MouseEvent) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      // ignore
    }

    setFacebookCopied(true);
    setTimeout(() => setFacebookCopied(false), 4000);

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

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
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

  const handleNativeShare = async () => {
    const res = await shareContent({
      title: shareTitle,
      text: shareText,
      url: shareUrl
    });
    if (res.method !== 'dismissed') {
      setNativeMessage(res.message);
      setTimeout(() => setNativeMessage(null), 3000);
    }
  };

  const linkedCount = Object.keys(blockLinks).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#181512] border border-[#3d3326] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-4 sm:p-5 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2e2720] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e5a93b]/15 text-[#e5a93b]">
              <Share2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#f4efe6] font-serif">
                Partager ce montage
              </h3>
              <p className="text-[11px] text-[#9c9183]">
                Lien intelligent avec synchronisation de vos blocs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#25201a] transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form: Nom de l'auteur */}
        <div className="bg-[#1f1913] border border-[#382d1e] rounded-xl p-3 sm:p-3.5 space-y-2">
          <label className="block text-xs font-bold text-[#f4efe6] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#e5a93b]" />
              <span>Votre prénom ou nom :</span>
            </span>
            <span className="text-[10px] text-[#a69c8f] font-normal">
              Ex : Vincent, Sophie, etc.
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="Ex : Vincent"
              className="w-full bg-[#14110d] border border-[#443623] focus:border-[#e5a93b] rounded-lg px-3 py-2 text-sm text-[#f4efe6] placeholder-[#665b4e] focus:outline-none transition-colors"
              maxLength={30}
            />
          </div>
        </div>

        {/* Aperçu en direct du destinataire */}
        <div className="bg-[#241d15] border border-[#4a3922] rounded-xl p-3 sm:p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#bdae9c]">
            <span className="flex items-center gap-1 font-semibold text-[#e5a93b]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aperçu chez votre destinataire :</span>
            </span>
            <span className="text-[10px] bg-[#1a140e] px-2 py-0.5 rounded-full border border-[#3a2d1d]">
              Nouvel onglet
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e5a93b] text-[#14110d] text-xs font-extrabold shadow-sm">
              <span>{targetTitle}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#14110d]/20 rounded-full">
                {blocks.length} bloc{blocks.length > 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-xs text-[#8c8072]">
              (apparaîtra directement à côté de son Montage n°1)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#9c9183]">
            <div className="flex items-center gap-1.5 bg-[#1a1510] px-2.5 py-1.5 rounded-lg border border-[#332719]">
              <Layers className="w-3 h-3 text-[#e5a93b]" />
              <span>{blocks.length} bloc{blocks.length > 1 ? 's' : ''} ordonné{blocks.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1a1510] px-2.5 py-1.5 rounded-lg border border-[#332719]">
              <Video className="w-3 h-3 text-[#e5a93b]" />
              <span>{linkedCount} repère{linkedCount > 1 ? 's' : ''} vidéo lié{linkedCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Note de réassurance : Vos originaux sont 100% en sécurité */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#141b16] border border-[#1f3825] text-xs text-[#9ed3ac]">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#bbf7d0]">
              Vos données restent 100% protégées :
            </p>
            <p className="text-[11px] text-[#86efac]/90 leading-relaxed">
              La personne recevra sa propre copie autonome. Ses modifications éventuelles n'écraseront <strong>jamais</strong> votre montage original. Si elle vous renvoie ses ajustements, vous recevrez à votre tour son montage sous un nouvel onglet indépendant sans rien perdre !
            </p>
          </div>
        </div>

        {/* Boutons d'envoi rapide */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c8072]">
            Envoyer directement via :
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
                <div className="text-[10px] text-[#a7f3d0]">Message avec lien</div>
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
              <span>Lien du montage copié dans votre presse-papier ! Fenêtre Facebook ouverte (vous pouvez aussi le coller directement dans une publication).</span>
            </div>
          )}
        </div>

        {/* Copie du lien direct */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c8072]">
            Ou copier le lien de partage :
          </p>

          <div className="flex items-center gap-2 bg-[#12100e] border border-[#332b21] p-1.5 rounded-xl">
            <input
              type="text"
              readOnly
              value={shareUrl}
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

        {/* Partage natif mobile */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <div className="pt-2 border-t border-[#2e2720]">
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#221c17] hover:bg-[#2c241d] border border-[#3e3223] text-xs font-bold text-[#e5a93b] hover:text-[#fff] transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Partager avec le menu de votre téléphone (SMS, AirDrop...)</span>
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
