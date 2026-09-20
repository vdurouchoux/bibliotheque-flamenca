import React, { useState } from 'react';
import { X, RefreshCw, Video, AlertCircle, Lightbulb } from 'lucide-react';
import { VideoItem, Level } from '../types';
import { replaceAnyVideo } from '../utils/storage';

interface ReplaceVideoModalProps {
  paloId: string;
  paloName: string;
  sectionKey: string;
  video: VideoItem;
  onClose: () => void;
  onReplaced: () => void;
}

export const ReplaceVideoModal: React.FC<ReplaceVideoModalProps> = ({
  paloId,
  paloName,
  sectionKey,
  video,
  onClose,
  onReplaced
}) => {
  const [title, setTitle] = useState(video.title);
  const [url, setUrl] = useState(video.url);
  const [level, setLevel] = useState<Level>(video.level);
  const [description, setDescription] = useState(video.description || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Veuillez entrer un titre pour la vidéo.');
      return;
    }
    if (!url.trim()) {
      setError('Veuillez entrer une URL YouTube valide.');
      return;
    }

    try {
      replaceAnyVideo(paloId, sectionKey, video, {
        title: title.trim(),
        url: url.trim(),
        level,
        description: description.trim() || undefined
      });
      onReplaced();
      onClose();
    } catch {
      setError('Erreur lors du remplacement de la vidéo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#181512] border border-[#383129] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2e2720] flex items-center justify-between bg-[#14120f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e5a93b]/20 flex items-center justify-center text-[#e5a93b] border border-[#e5a93b]/40">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f4efe6]">
                Remplacer cette vidéo
              </h3>
              <p className="text-xs text-[#8c8173] truncate max-w-[260px] sm:max-w-xs">
                {video.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#a69c8f] mb-1.5">
              Nouveau Titre de la vidéo <span className="text-[#e5a93b]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Marquage en 4 temps - Variante José Maya"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#221d17] border border-[#383129] focus:border-[#e5a93b] text-[#f4efe6] text-sm focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a69c8f] mb-1.5">
              Nouvelle URL YouTube ou Identifiant <span className="text-[#e5a93b]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ou youtu.be/..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#221d17] border border-[#383129] focus:border-[#e5a93b] text-[#f4efe6] text-sm focus:outline-none transition-colors font-mono text-xs"
              />
              <Video className="w-4 h-4 text-[#8c8173] absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-[#8c8173] mt-1">
              Les liens avec minutage (?t=120) ou URL normales sont pris en charge.
            </p>
            <div className="mt-2 p-2.5 rounded-xl bg-[#1c1813] border border-[#382d20] flex items-start gap-2 text-[11px] text-[#a69c8f] leading-relaxed">
              <Lightbulb className="w-3.5 h-3.5 text-[#e5a93b] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#e5a93b]">Conseil synchronisation :</strong> Privilégiez les liens web (ex. YouTube en « Non répertorié » <em>(invisible au public et au moteur de recherche)</em>, Vimeo ou Google Drive) pour visionner vos répétitions indifféremment sur votre PC et votre smartphone.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a69c8f] mb-1.5">
              Description pédagogique & repères (optionnel)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Conseils de posture, compás, dynamique des pieds, repères d'écoute..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#221d17] border border-[#383129] focus:border-[#e5a93b] text-[#f4efe6] text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e5a93b] hover:bg-[#f0b952] text-[#121110] font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Enregistrer le remplacement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
