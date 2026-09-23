import React, { useState, useRef } from 'react';
import { X, Plus, Video, Sparkles, Lightbulb, AlertTriangle, Laptop, Smartphone, Upload, FileVideo } from 'lucide-react';
import { Level } from '../types';
import { saveCustomVideo } from '../utils/storage';
import { isLocalVideoUrl, isMobileDevice, getCurrentDeviceType, detectDeviceFromUrl } from '../utils/deviceUtils';
import { FlamencoGuitarIcon } from './FlamencoGuitarIcon';
import { FlamencoCantaorIcon } from './FlamencoCantaorIcon';
import { FlamencoBailaoraIcon } from './FlamencoBailaoraIcon';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDevice = getCurrentDeviceType();
  const isLocal = isLocalVideoUrl(url) || !!selectedFileName;
  const detectedDevice = detectDeviceFromUrl(url) || currentDevice;

  const isDanceSection = ['danses', 'maitres', 'cours', 'structure', 'marcajes', 'zapateado', 'llamadas'].includes(initialSection) || paloName.includes('Danse');

  const categories = isDanceSection
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      if (!title) {
        // Strip extension from title
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        setTitle(baseName);
      }
      const localBlobUrl = URL.createObjectURL(file);
      setUrl(localBlobUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Veuillez entrer un titre pour la vidéo.');
      return;
    }
    if (!url.trim() && !selectedFileName) {
      setError('Veuillez entrer un lien vidéo ou choisir un fichier.');
      return;
    }

    try {
      saveCustomVideo(paloId, section, {
        title: title.trim(),
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
              Ajouter une vidéo personnalisée
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

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#d4c9ba] mb-1">
              Titre de la vidéo *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ex: Falseta por medio de Morón..."
              className="w-full bg-[#141210] border border-[#332c25] focus:border-[#e5a93b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4efe6] placeholder-[#6b6256] outline-none"
              required
            />
          </div>

          {/* Video URL or Local file */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#d4c9ba]">
                Lien vidéo ou fichier local *
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-[#e5a93b] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Parcourir fichier ({currentDevice === 'pc' ? 'PC' : 'Téléphone'})</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/*"
              className="hidden"
            />

            <input
              type="text"
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                setSelectedFileName('');
              }}
              placeholder="https://www.youtube.com/watch?v=... ou Vimeo / Drive / fichier local"
              className="w-full bg-[#141210] border border-[#332c25] focus:border-[#e5a93b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4efe6] placeholder-[#6b6256] outline-none"
            />

            {selectedFileName && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#e5a93b]">
                <FileVideo className="w-3.5 h-3.5" />
                <span>Fichier sélectionné : <strong>{selectedFileName}</strong></span>
              </div>
            )}

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
            ) : (
              <div className="mt-2 p-2.5 rounded-xl bg-[#1c1813] border border-[#382d20] flex items-start gap-2 text-[11px] text-[#a69c8f] leading-relaxed">
                <Lightbulb className="w-3.5 h-3.5 text-[#e5a93b] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#e5a93b]">Conseil synchronisation :</strong> Privilégiez les liens web (ex. YouTube en « Non répertorié » <em>(invisible au public et au moteur de recherche)</em>, Vimeo ou Google Drive) pour visionner vos répétitions indifféremment sur votre PC et votre smartphone.
                </span>
              </div>
            )}
          </div>

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
