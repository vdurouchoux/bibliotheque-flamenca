import React, { useState, useEffect } from 'react';
import { 
  X, Cloud, Check, Smartphone, Monitor, Copy, CheckCircle2, ShieldCheck, 
  ExternalLink, Users, HardDrive, Search, ArrowUpRight, UploadCloud, 
  Download, Laptop, RefreshCw, AlertTriangle, FileVideo, Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';
import { 
  getOrCreateWorkspaceId, setWorkspaceId, subscribeToSyncStatus, 
  buildPairingUrl, SyncStatusInfo 
} from '../utils/firebaseSync';
import { 
  getAllLocalMedia, updateLocalMediaUrl, LocalMediaItem 
} from '../utils/storage';

interface CloudSyncModalProps {
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ onClose }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo>({
    state: 'connecting',
    workspaceId: getOrCreateWorkspaceId(),
    lastSyncedAt: null,
  });

  const [activeTab, setActiveTab] = useState<'pairing' | 'local_media'>('pairing');
  const [localMediaList, setLocalMediaList] = useState<LocalMediaItem[]>(() => getAllLocalMedia());
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Migration state for editing an item
  const [editingItem, setEditingItem] = useState<LocalMediaItem | null>(null);
  const [migratedUrl, setMigratedUrl] = useState<string>('');
  const [migratedTitle, setMigratedTitle] = useState<string>('');
  const [migrationFeedback, setMigrationFeedback] = useState<string | null>(null);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCleanLink, setCopiedCleanLink] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [customStudioId, setCustomStudioId] = useState<string>(getOrCreateWorkspaceId());
  const [isEditingId, setIsEditingId] = useState<boolean>(false);

  // Refresh local media list
  const refreshLocalMedia = () => {
    setLocalMediaList(getAllLocalMedia());
  };

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
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
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

  // Open migration editor for a specific local media item
  const handleStartMigration = (item: LocalMediaItem) => {
    setEditingItem(item);
    setMigratedTitle(item.title);
    setMigratedUrl('');
    setMigrationFeedback(null);
  };

  const handleSaveMigration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !migratedUrl.trim()) return;

    const ok = updateLocalMediaUrl(editingItem, migratedUrl.trim(), migratedTitle.trim());
    if (ok) {
      setMigrationFeedback(`"${editingItem.title}" a été migré avec succès vers le web !`);
      setTimeout(() => {
        setEditingItem(null);
        setMigrationFeedback(null);
        refreshLocalMedia();
      }, 1500);
    }
  };

  // Filtered local media list
  const filteredLocalMedia = localMediaList.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.paloName.toLowerCase().includes(q) ||
      item.sectionName.toLowerCase().includes(q) ||
      item.url.toLowerCase().includes(q)
    );
  });

  // Export report to clipboard or download file
  const generateExportText = () => {
    const header = `=== RAPPORT D'EXPORTATION DES MÉDIAS LOCAUX FLAMENCO (${localMediaList.length} vidéos) ===\n`;
    const date = `Date : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n\n`;
    const notice = `Pour lire ces vidéos sur votre smartphone, hébergez-les sur YouTube (en mode "Non répertorié") ou sur Google Drive, puis collez le lien dans l'application.\n\n`;

    const body = localMediaList.map((m, idx) => {
      return `${idx + 1}. [${m.paloName} • ${m.sectionName}]\n` +
             `   Titre : ${m.title}\n` +
             `   Emplacement local : ${m.url}\n` +
             `   Appareil source : ${m.sourceDevice === 'pc' ? 'PC' : m.sourceDevice === 'mobile' ? 'Smartphone' : 'Non déterminé'}\n` +
             `   Repères chronométrés : ${m.landmarksCount} repère(s)\n` +
             `   Notes : ${m.hasNotes ? 'Oui' : 'Non'}\n`;
    }).join('\n');

    return header + date + notice + body;
  };

  const handleCopyReport = async () => {
    const text = generateExportText();
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 3000);
    }
  };

  const handleDownloadReport = () => {
    const text = generateExportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flamenco_medias_locaux_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#181512] border border-[#3d3326] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 p-4 sm:p-6"
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
                Synchronisation & Médias Cloud
                <span className="text-[10px] font-sans uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-400">
                  Temps Réel
                </span>
              </h3>
              <p className="text-xs text-[#a69c8f]">
                Vos cours, repères et notes restent synchronisés entre PC et Téléphone.
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#12100d] border border-[#2b241c] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pairing')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === 'pairing'
                ? 'bg-[#2b2216] text-[#e5a93b] border border-[#4d3a24] shadow-sm font-bold'
                : 'text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#1a1714]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Relier Téléphone & PC</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('local_media');
              refreshLocalMedia();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === 'local_media'
                ? 'bg-[#2b2216] text-[#e5a93b] border border-[#4d3a24] shadow-sm font-bold'
                : 'text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#1a1714]'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Médias Locaux à Migrer</span>
            {localMediaList.length > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300">
                {localMediaList.length}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                0
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: PAIRING & STATUS */}
        {activeTab === 'pairing' && (
          <div className="space-y-4 animate-in fade-in duration-150">
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
          </div>
        )}

        {/* TAB 2: LOCAL MEDIA AUDIT & EXPORT */}
        {activeTab === 'local_media' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Explanation Guide Banner */}
            <div className="bg-[#211a13] border border-amber-900/40 rounded-xl p-3.5 space-y-2 text-xs text-[#d4c9ba]">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Pourquoi migrer vos médias locaux vers le Cloud ?</span>
              </div>
              <p className="leading-relaxed text-[#b8ada0]">
                Un fichier situé sur le disque dur de votre PC (ex: <code className="text-[#e5a93b] font-mono text-[11px]">C:\...</code>) ou dans la mémoire de votre téléphone ne peut pas être lu par votre autre appareil.
                En le remplaçant par un lien hébergé (<strong>YouTube en mode Non répertorié</strong>, <strong>Google Drive</strong> ou <strong>Vimeo</strong>), la vidéo devient accessible <strong>partout</strong>, et tous vos repères chronométrés et notes sont 100% conservés !
              </p>
            </div>

            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#8c8072] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, palo, dossier..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#14120f] border border-[#332b21] rounded-xl pl-8 pr-3 py-2 text-xs text-[#f4efe6] placeholder-[#6e6355] focus:outline-none focus:border-[#e5a93b]"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#221c16] hover:bg-[#2e261f] border border-[#3b3023] text-xs font-semibold text-[#f4efe6] transition-all cursor-pointer"
                  title="Copier la liste complète des fichiers locaux dans le presse-papier"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#e5a93b]" />}
                  <span>{copiedReport ? 'Copié !' : 'Copier la liste'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#221c16] hover:bg-[#2e261f] border border-[#3b3023] text-xs font-semibold text-[#f4efe6] transition-all cursor-pointer"
                  title="Télécharger un fichier récapitulatif TXT"
                >
                  <Download className="w-3.5 h-3.5 text-[#e5a93b]" />
                  <span>Rapport TXT</span>
                </button>
              </div>
            </div>

            {/* In-place Migration Editor Modal / Card */}
            {editingItem && (
              <div className="bg-[#1b1510] border-2 border-[#e5a93b] rounded-xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-[#3d2e1d] pb-2">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-[#e5a93b]" />
                    <span className="text-xs font-bold text-[#f4efe6]">
                      Migrer vers le web : <span className="text-[#e5a93b] font-serif">{editingItem.title}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="text-[#a69c8f] hover:text-[#f4efe6] p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {migrationFeedback ? (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-lg text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{migrationFeedback}</span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveMigration} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#d4c9ba] mb-1">
                        Nouveau lien web hébergé (YouTube, Google Drive, Vimeo, MP4...) *
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://www.youtube.com/watch?v=... ou youtu.be/... ou drive.google.com/..."
                        value={migratedUrl}
                        onChange={e => setMigratedUrl(e.target.value)}
                        className="w-full bg-[#12100d] border border-[#3b3023] rounded-lg px-3 py-2 text-xs text-[#f4efe6] placeholder-[#6e6355] focus:outline-none focus:border-[#e5a93b]"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#d4c9ba] mb-1">
                        Titre du média (modifiable)
                      </label>
                      <input
                        type="text"
                        value={migratedTitle}
                        onChange={e => setMigratedTitle(e.target.value)}
                        className="w-full bg-[#12100d] border border-[#3b3023] rounded-lg px-3 py-2 text-xs text-[#f4efe6] focus:outline-none focus:border-[#e5a93b]"
                      />
                    </div>

                    <div className="bg-[#14110e] border border-[#2e251b] rounded-lg p-2.5 text-[11px] text-[#8c8072] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#e5a93b] font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recommandation pratique :</span>
                      </div>
                      <p>
                        Déposez votre vidéo sur YouTube en cochant le mode <strong>« Non répertorié »</strong>. C'est 100% gratuit, illimité, invisible des autres utilisateurs et lisible immédiatement sur PC & smartphone !
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="px-3 py-1.5 rounded-lg bg-[#25201a] hover:bg-[#322b23] text-xs text-[#d4c9ba] font-semibold cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#e5a93b] hover:bg-[#f5b84c] text-xs text-[#121110] font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Enregistrer et synchroniser</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* List of Local Media Items */}
            <div className="space-y-2.5">
              {filteredLocalMedia.length === 0 ? (
                localMediaList.length === 0 ? (
                  <div className="bg-[#14120e] border border-emerald-900/40 rounded-xl p-6 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-[#f4efe6] font-serif">
                      Tous vos médias sont hébergés sur le web !
                    </h4>
                    <p className="text-xs text-[#a69c8f] max-w-md mx-auto leading-relaxed">
                      Aucun fichier local n'a été détecté. Toutes vos vidéos sont hébergées sur le Cloud (YouTube / Drive / Web) et sont lisibles indifféremment sur votre PC et votre smartphone.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#8c8072] bg-[#14120e] border border-[#2b241c] rounded-xl">
                    Aucun média local ne correspond à votre recherche « {searchQuery} ».
                  </div>
                )
              ) : (
                filteredLocalMedia.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-[#14120f] border border-[#2d251d] hover:border-[#4d3a24] rounded-xl space-y-2.5 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-[#f4efe6] font-serif truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#251e17] text-[#e5a93b] border border-[#3d2e1d]">
                            {item.paloName} • {item.sectionName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#8c8072] flex-wrap">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-400/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                            {item.sourceDevice === 'pc' ? (
                              <>
                                <Laptop className="w-3 h-3" />
                                <span>Fichier local PC</span>
                              </>
                            ) : (
                              <>
                                <Smartphone className="w-3 h-3" />
                                <span>Fichier smartphone</span>
                              </>
                            )}
                          </span>

                          {item.landmarksCount > 0 && (
                            <span className="text-[#a69c8f]">
                              📍 {item.landmarksCount} repère{item.landmarksCount > 1 ? 's' : ''} chronométré{item.landmarksCount > 1 ? 's' : ''}
                            </span>
                          )}

                          {item.hasNotes && (
                            <span className="text-[#a69c8f]">
                              📝 Notes enregistrées
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartMigration(item)}
                        className="px-3 py-1.5 rounded-lg bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Migrer vers le web</span>
                      </button>
                    </div>

                    {/* Path display with copy */}
                    <div className="flex items-center gap-2 bg-[#0e0c0a] border border-[#231d16] rounded-lg px-2.5 py-1 text-[11px] font-mono text-[#8c8072]">
                      <FileVideo className="w-3.5 h-3.5 text-[#e5a93b] shrink-0" />
                      <span className="truncate flex-1" title={item.url}>
                        {item.url}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          await copyToClipboard(item.url);
                        }}
                        className="text-[#a69c8f] hover:text-[#e5a93b] text-[10px] underline cursor-pointer shrink-0 ml-1"
                        title="Copier le chemin local"
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2 border-t border-[#261f18]">
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
