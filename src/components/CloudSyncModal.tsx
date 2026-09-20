import React, { useState, useEffect } from 'react';
import { 
  X, Cloud, Check, Smartphone, Monitor, Copy, CheckCircle2, ShieldCheck, Sparkles, ExternalLink, Users
} from 'lucide-react';
import QRCode from 'qrcode';
import { 
  getOrCreateWorkspaceId, setWorkspaceId, subscribeToSyncStatus, 
  buildPairingUrl, SyncStatusInfo 
} from '../utils/firebaseSync';

interface CloudSyncModalProps {
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ onClose }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo>({
    state: 'connecting',
    workspaceId: getOrCreateWorkspaceId(),
    lastSyncedAt: null,
  });

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCleanLink, setCopiedCleanLink] = useState<boolean>(false);
  const [customStudioId, setCustomStudioId] = useState<string>(getOrCreateWorkspaceId());
  const [isEditingId, setIsEditingId] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeToSyncStatus((st) => {
      setSyncStatus(st);
      if (!isEditingId) {
        setCustomStudioId(st.workspaceId);
      }
    });
    return unsub;
  }, [isEditingId]);

  const pairingUrl = buildPairingUrl();
  const cleanAppUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';

  useEffect(() => {
    if (pairingUrl) {
      QRCode.toDataURL(pairingUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#181512',
          light: '#f5efe6'
        }
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [pairingUrl, syncStatus.workspaceId]);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyPairingLink = async () => {
    const ok = await copyToClipboard(pairingUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleCopyCleanLink = async () => {
    const ok = await copyToClipboard(cleanAppUrl);
    if (ok) {
      setCopiedCleanLink(true);
      setTimeout(() => setCopiedCleanLink(false), 3000);
    }
  };

  const handleApplyCustomId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStudioId.trim()) return;
    setWorkspaceId(customStudioId.trim());
    setIsEditingId(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#181512] border border-[#3d3326] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 p-4 sm:p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2e2720] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Cloud className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif flex items-center gap-2">
                Synchronisation Automatique Cloud
                <span className="text-[10px] font-sans uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-400">
                  Temps Réel
                </span>
              </h3>
              <p className="text-xs text-[#a69c8f]">
                Vos modifications sur PC et Téléphone restent toujours synchronisées sans rien faire.
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

        {/* Status Card */}
        <div className="bg-[#1d1813] border border-[#362b1e] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0"></div>
            <div>
              <div className="text-sm font-bold text-[#f4efe6] flex items-center gap-1.5">
                <span>Espace de travail connecté</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs text-[#8c8072]">
                Code studio unique : <span className="font-mono text-[#e5a93b] font-bold">{syncStatus.workspaceId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sauvegarde active en continu</span>
          </div>
        </div>

        {/* How it works Banner */}
        <div className="bg-[#241c14]/70 border border-[#3d2f21] rounded-xl p-3.5 space-y-2 text-xs text-[#b8ada0]">
          <div className="flex items-center gap-2 text-[#e5a93b] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Comment fonctionne votre synchronisation zéro-effort ?</span>
          </div>
          <p className="leading-relaxed">
            Dès que vous ajoutez ou supprimez une vidéo, modifiez un montage ou placez un repère, l'application sauvegarde <strong>instantanément</strong> dans votre base de données Cloud. 
            Il vous suffit d'ouvrir l'application sur votre téléphone pour retrouver l'intégralité de vos cours et notes à la seconde près.
          </p>
        </div>

        {/* Pairing Section (How to connect Mobile) */}
        <div className="border border-[#2f271f] bg-[#141210] rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#f4efe6] font-serif">
            <Smartphone className="w-4 h-4 text-[#e5a93b]" />
            <span>Relier votre téléphone en 1 seconde (à ne faire qu'une seule fois)</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="bg-white p-2 rounded-xl shadow-lg shrink-0 border border-[#e5a93b]/40">
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code de synchronisation"
                  className="w-36 h-36 sm:w-40 sm:h-40"
                />
                <div className="text-center text-[10px] font-bold text-[#181512] mt-1">
                  Scanner avec votre téléphone
                </div>
              </div>
            )}

            {/* Explanation & direct link button */}
            <div className="space-y-3 flex-1 text-xs">
              <div className="space-y-1 text-[#b8ada0]">
                <p className="font-semibold text-[#f4efe6]">
                  Option 1 (Le plus rapide) :
                </p>
                <p>
                  Scannez le QR code ci-contre avec l'appareil photo de votre smartphone. Votre téléphone sera immédiatement relié à ce PC pour toujours !
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="font-semibold text-[#f4efe6]">
                  Option 2 : Copier ou vous envoyer le lien magique
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pairingUrl}
                    className="bg-[#1f1a14] border border-[#332b21] rounded-lg px-2.5 py-1.5 text-xs text-[#a69c8f] flex-1 truncate select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyPairingLink}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110]'
                    }`}
                  >
                    {copiedLink ? (
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
                <p className="text-[11px] text-[#7a6f62]">
                  Collez ce lien sur WhatsApp ou dans un e-mail pour l'ouvrir sur votre téléphone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Inviter un ami / élève (Espace indépendant) */}
        <div className="border border-[#2f271f] bg-[#141210] rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#f4efe6] font-serif">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Créer un espace indépendant pour un élève ou ami</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-600/30 text-emerald-400">
              Espace séparé
            </span>
          </div>

          <p className="text-xs text-[#a69c8f] leading-relaxed">
            Par défaut, vos appareils (ordinateur et téléphone) partagent automatiquement votre <strong>Studio Principal</strong> en continu.
            Pour qu'un élève ou ami travaille sur son propre carnet sans toucher à vos montages, envoyez-lui un lien avec son nom de studio dédié :
          </p>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              readOnly
              value={`${cleanAppUrl}?workspace=eleve-${syncStatus.workspaceId.slice(-4)}`}
              className="bg-[#1f1a14] border border-[#332b21] rounded-lg px-2.5 py-1.5 text-xs text-[#a69c8f] flex-1 truncate select-all focus:outline-none"
            />
            <button
              onClick={async () => {
                const eleveUrl = `${cleanAppUrl}?workspace=eleve-${syncStatus.workspaceId.slice(-4)}`;
                const ok = await copyToClipboard(eleveUrl);
                if (ok) {
                  setCopiedCleanLink(true);
                  setTimeout(() => setCopiedCleanLink(false), 3000);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                copiedCleanLink
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#292219] hover:bg-[#382e22] text-[#f4efe6] border border-[#4d3d2c]'
              }`}
            >
              {copiedCleanLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Lien copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier lien élève</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Astuce d'installation sur téléphone (Icône écran d'accueil) */}
        <div className="bg-[#1b1713] border border-[#2e261d] rounded-xl p-3 text-xs text-[#a69c8f] space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#f4efe6]">
            <span>📲</span>
            <span>Astuce : Utiliser comme une vraie application sur votre téléphone</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#8c8072]">
            Une fois la page ouverte sur votre téléphone : sur <strong>iPhone (Safari)</strong>, appuyez sur <span className="text-[#d4c9ba]">Partager</span> puis <span className="text-[#d4c9ba]">« Sur l'écran d'accueil »</span>. Sur <strong>Android (Chrome)</strong>, appuyez sur les <span className="text-[#d4c9ba]">3 points</span> puis <span className="text-[#d4c9ba]">« Installer l'application »</span>.
          </p>
        </div>

        {/* Custom Studio Code (Advanced) */}
        <div className="border-t border-[#261f18] pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8c8072]">
          <div className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-[#a69c8f]" />
            <span>Code du studio actuel :</span>
            {!isEditingId ? (
              <span className="font-mono text-[#f4efe6] bg-[#221c17] px-2 py-0.5 rounded border border-[#362b1e]">
                {syncStatus.workspaceId}
              </span>
            ) : (
              <form onSubmit={handleApplyCustomId} className="flex items-center gap-1">
                <input
                  type="text"
                  value={customStudioId}
                  onChange={e => setCustomStudioId(e.target.value)}
                  placeholder="ex: mon-studio-perso"
                  className="bg-[#141210] border border-[#e5a93b] rounded px-2 py-0.5 text-xs text-[#f4efe6] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 bg-[#e5a93b] text-[#121110] font-bold rounded text-[11px]"
                >
                  OK
                </button>
              </form>
            )}
          </div>

          {!isEditingId ? (
            <button
              onClick={() => setIsEditingId(true)}
              className="text-[11px] text-[#e5a93b] hover:underline cursor-pointer text-left"
            >
              Changer ou rejoindre un autre code de studio
            </button>
          ) : (
            <button
              onClick={() => setIsEditingId(false)}
              className="text-[11px] text-[#a69c8f] hover:underline cursor-pointer text-left"
            >
              Annuler
            </button>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            Fermer et continuer à travailler
          </button>
        </div>
      </div>
    </div>
  );
};
