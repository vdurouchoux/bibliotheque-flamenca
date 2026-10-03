import React, { useState, useRef } from 'react';
import { X, Plus, Video, Sparkles, Lightbulb, AlertTriangle, Laptop, Smartphone, Upload, FileVideo, ExternalLink, Loader2 } from 'lucide-react';
import { Level } from '../types';
import { saveCustomVideo } from '../utils/storage';
import { isLocalVideoUrl, isMobileDevice, getCurrentDeviceType, detectDeviceFromUrl } from '../utils/deviceUtils';
import { FlamencoGuitarIcon } from './FlamencoGuitarIcon';
import { FlamencoCantaorIcon } from './FlamencoCantaorIcon';
import { FlamencoBailaoraIcon } from './FlamencoBailaoraIcon';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="none" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface AddVideoModalProps {
  paloId: string;
  paloName: string;
  initialSection: string;
  onClose: () => void;
  onAdded: () => void;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  paloId,
  paloName,
  initialSection,
  onClose,
  onAdded
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [section, setSection] = useState<string>(initialSection);
  const [level, setLevel] = useState<Level>(1);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isFetchingTitle, setIsFetchingTitle] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const currentDevice = getCurrentDeviceType();
  const isLocal = isLocalVideoUrl(url) || !!selectedFileName;
  const detectedDevice = detectDeviceFromUrl(url) || currentDevice;

  const isDanceSection = ['danses', 'maitres', 'cours', 'structure', 'marcajes', 'zapateado', 'llamadas'].includes(initialSection) || initialSection.startsWith('folder_') || paloName.includes('Danse');

  const baseCategories = isDanceSection
    ? [
        { key: 'cours', label: 'Mes Cours & Stages', icon: '🎓' },
        { key: 'maitres', label: 'Danses & Maîtres', icon: 'bailaora' },
        { key: 'structure', label: 'Chorégraphie & Montage', icon: '📑' }
      ]
    : [
        { key: 'falsetas', label: 'Falsetas', icon: 'flamenco-guitar' },
        { key: 'cante', label: 'Cante', icon: 'cantaor' },
        { key: 'baile', label: 'Baile', icon: 'bailaora' }
      ];

  const categories = initialSection.startsWith('folder_')
    ? [{ key: initialSection, label: 'Dossier personnalisé', icon: '📁' }, ...baseCategories]
    : baseCategories;

  // Récupère automatiquement le titre d'origine (YouTube oEmbed ou nom de fichier URL)
  const fetchOriginalTitle = async (mediaUrl: string): Promise<string | null> => {
    const trimmed = mediaUrl.trim();
    if (!trimmed) return null;

    // 1. YouTube via oEmbed
    if (/youtube\.com|youtu\.be/i.test(trimmed)) {
      try {
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            return data.title;
          }
        }
      } catch {}

      try {
        const res2 = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`);
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.title) {
            return data2.title;
          }
        }
      } catch {}
    }

    // 2. Fichier direct (ex: mp4, webm, mov, mp3)
    try {
      const urlObj = new URL(trimmed);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const last = parts[parts.length - 1];
        const decoded = decodeURIComponent(last).replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
        if (decoded && decoded.length > 2 && !decoded.startsWith('watch') && !decoded.startsWith('video')) {
          return decoded;
        }
      }
    } catch {}

    return null;
  };

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    setSelectedFileName('');
    setError('');

    const trimmed = newUrl.trim();
    if (trimmed.length > 8) {
      setIsFetchingTitle(true);
      const originalTitle = await fetchOriginalTitle(trimmed);
      setIsFetchingTitle(false);
      if (originalTitle) {
        setTitle(originalTitle);
      }
    }
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && pasted.trim()) {
      handleUrlChange(pasted.trim());
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      // Strip extension from title
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      setTitle(baseName);
      const localBlobUrl = URL.createObjectURL(file);
      setUrl(localBlobUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !selectedFileName) {
      setError('Veuillez coller un lien vidéo ou choisir un fichier.');
      return;
    }

    const finalTitle = title.trim() || 'Média importé';

    try {
      saveCustomVideo(paloId, section, {
        title: finalTitle,
        url: url.trim(),
        level,
        description: description.trim() || undefined,
        isLocalFile: isLocal,
        sourceDevice: isLocal ? detectedDevice : undefined
      });
      onAdded();
      onClose();
    } catch {
      setError('Erreur lors de l’enregistrement de la vidéo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181512] border border-[#383129] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 bg-[#1e1a16] border-b border-[#2e2720]">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#e5a93b]/20 text-[#e5a93b]">
              <Video className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#f4efe6] font-serif">
              Ajouter un média
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#a69c8f] hover:text-[#f4efe6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-[#a69c8f]">
            Ajoutée à : <strong className="text-[#e5a93b]">{paloName}</strong>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Section choice */}
          <div>
            <label className="block text-xs font-semibold text-[#d4c9ba] mb-1.5">
              Catégorie
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSection(cat.key)}
                  className={`py-2 px-2 text-xs rounded-xl border font-medium transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    section === cat.key
                      ? 'bg-[#e5a93b]/20 text-[#e5a93b] border-[#e5a93b]'
                      : 'bg-[#221e1a] text-[#8c8173] border-[#383129] hover:text-[#d4c9ba]'
                  }`}
                >
                  {cat.icon === 'flamenco-guitar' ? (
                    <FlamencoGuitarIcon className="w-3.5 h-3.5 inline-block shrink-0 -mt-0.5" />
                  ) : cat.icon === 'cantaor' ? (
                    <FlamencoCantaorIcon className="w-3.5 h-3.5 inline-block shrink-0 -mt-0.5" />
                  ) : cat.icon === 'bailaora' ? (
                    <FlamencoBailaoraIcon className="w-3.5 h-3.5 inline-block shrink-0 -mt-0.5" />
                  ) : (
                    <span>{cat.icon}</span>
                  )}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Video URL or Local file */}
          <div>
            <label className="block text-xs font-semibold text-[#d4c9ba] mb-1.5">
              Lien du média ou fichier *
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/*,audio/*"
              className="hidden"
            />

            <div className="relative flex items-center">
              <input
                ref={urlInputRef}
                type="text"
                value={url}
                onChange={e => handleUrlChange(e.target.value)}
                onPaste={handlePasteEvent}
                placeholder="Coller le lien (YouTube, Drive, Vimeo, WhatsApp...)"
                className="w-full bg-[#141210] border border-[#332c25] focus:border-[#e5a93b] rounded-xl pl-3.5 pr-28 py-2.5 text-sm text-[#f4efe6] placeholder-[#6b6256] outline-none"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-[#221c17] hover:bg-[#2c241e] border border-[#3d3225] hover:border-[#e5a93b]/50 text-xs font-semibold text-[#ded3c5] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                title={`Parcourir les fichiers (${currentDevice === 'pc' ? 'PC' : 'Téléphone'})`}
              >
                <Upload className="w-3.5 h-3.5 text-[#e5a93b]" />
                <span>Parcourir</span>
              </button>
            </div>

            {selectedFileName && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#e5a93b]">
                <FileVideo className="w-3.5 h-3.5" />
                <span>Fichier sélectionné : <strong>{selectedFileName}</strong></span>
              </div>
            )}
          </div>

          {/* Title - Auto-filled from media */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#d4c9ba]">
                Titre du média
              </label>
              {isFetchingTitle && (
                <span className="text-[11px] text-[#e5a93b] flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-[#e5a93b]" />
                  <span>Récupération du titre d'origine...</span>
                </span>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={isFetchingTitle ? "Recherche du titre d'origine..." : "Titre détecté automatiquement ou à saisir"}
              className="w-full bg-[#141210] border border-[#332c25] focus:border-[#e5a93b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4efe6] placeholder-[#6b6256] outline-none"
            />
            <p className="mt-1.5 text-[11px] text-[#8c8173] leading-relaxed">
              💡 Le titre d'origine est renseigné automatiquement dès le collage du lien. Vous pourrez le renommer à tout moment grâce aux 3 petits points.
            </p>
          </div>

            {/* Proposition d'accès à WhatsApp */}
            <div className="mt-3 p-3 sm:p-3.5 rounded-2xl bg-[#111c14] border border-[#234b2c] space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-xl bg-[#25D366] text-[#0b1b10] shrink-0 shadow-sm">
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#f4efe6]">
                    Chercher un média sur WhatsApp
                  </h4>
                  <p className="text-[11px] text-[#97cca3] leading-tight">
                    Retrouvez votre vidéo ou audio, copiez le lien ou enregistrez le fichier.
                  </p>
                </div>
              </div>

              {/* Deux boutons directs pour garantir l'ouverture sur tout type d'appareil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <a
                  href="https://web.whatsapp.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-[#0b1b10] font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 text-center"
                  title="Ouvrir WhatsApp Web dans votre navigateur"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Web (PC/Mac)</span>
                </a>

                <a
                  href="https://api.whatsapp.com/send?text=%20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1a2d1f] hover:bg-[#233c2a] border border-[#25D366]/40 text-[#42e87e] hover:text-white font-semibold text-xs transition-all cursor-pointer active:scale-95 text-center"
                  title="Ouvrir WhatsApp sur smartphone ou application"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>WhatsApp (Smartphone)</span>
                </a>
              </div>
              <p className="text-[10px] text-[#7ea886] leading-tight pt-0.5">
                💡 Dans WhatsApp, ouvrez votre vidéo &gt; Partager &gt; Copier le lien (ou enregistrez la vidéo sur votre appareil puis cliquez sur « Parcourir » ci-dessus).
              </p>
            </div>

            {/* Avertissement explicite si fichier local */}
            {isLocal ? (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Vidéo stockée localement sur votre {detectedDevice === 'pc' ? 'PC' : 'smartphone'}</span>
                </div>
                <p className="text-[11px] text-amber-200/85 leading-relaxed">
                  Cette vidéo sera lisible sur cet appareil. Sur votre {detectedDevice === 'pc' ? 'smartphone' : 'PC'}, l’application indiquera clairement :
                </p>
                <div className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-700/60 font-semibold text-amber-300 text-[11px]">
                  « Vidéo non disponible car stockée sur votre {detectedDevice === 'pc' ? 'PC' : 'téléphone'} »
                </div>
                <p className="text-[10px] text-amber-300/80">
                  💡 Pour la visionner sur tous vos appareils, préférez un lien YouTube en mode non répertorié.
                </p>
              </div>
            ) : null}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#d4c9ba] mb-1">
              Notes ou indications (facultatif)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="ex: Bonne falseta pour travailler le trémolo, accord Fa#7..."
              rows={2}
              className="w-full bg-[#141210] border border-[#332c25] focus:border-[#e5a93b] rounded-xl p-3 text-xs text-[#f4efe6] placeholder-[#6b6256] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#e5a93b] hover:bg-[#d4972c] text-[#121110] transition-colors cursor-pointer shadow-md shadow-[#e5a93b]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer dans mon recueil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
