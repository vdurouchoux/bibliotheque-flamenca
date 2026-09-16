import React, { useState } from 'react';
import { X, Plus, Video, Sparkles } from 'lucide-react';
import { Level } from '../types';
import { saveCustomVideo } from '../utils/storage';

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

  const isDanceSection = ['danses', 'maitres', 'structure', 'marcajes', 'zapateado', 'llamadas'].includes(initialSection) || paloName.includes('Danse');

  const categories = isDanceSection
    ? [
        { key: 'maitres', label: '💃 Danses Complètes & Maîtres' },
        { key: 'structure', label: '📑 Chorégraphie & Montage' }
      ]
    : [
        { key: 'falsetas', label: '🎸 Falsetas' },
        { key: 'cante', label: '🎤 Cante' },
        { key: 'baile', label: '💃 Baile' }
      ];

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
      saveCustomVideo(paloId, section, {
        title: title.trim(),
        url: url.trim(),
        level,
        description: description.trim() || undefined
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
                  className={`py-2 px-2 text-xs rounded-xl border font-medium transition-colors cursor-pointer text-center ${
                    section === cat.key
                      ? 'bg-[#e5a93b]/20 text-[#e5a93b] border-[#e5a93b]'
                      : 'bg-[#221e1a] text-[#8c8173] border-[#383129] hover:text-[#d4c9ba]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level choice */}
          <div>
            <label className="block text-xs font-semibold text-[#d4c9ba] mb-1.5">
              Niveau de difficulté
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { lvl: 1, label: 'Niveau 1 (Débutant)' },
                { lvl: 2, label: 'Niveau 2 (Moyen)' },
                { lvl: 3, label: 'Niveau 3 (Avancé)' }
              ].map(item => (
                <button
                  key={item.lvl}
                  type="button"
                  onClick={() => setLevel(item.lvl as Level)}
                  className={`py-2 px-2 text-xs rounded-xl border font-medium transition-colors cursor-pointer text-center ${
                    level === item.lvl
                      ? 'bg-[#e5a93b]/20 text-[#e5a93b] border-[#e5a93b]'
                      : 'bg-[#221e1a] text-[#8c8173] border-[#383129] hover:text-[#d4c9ba]'
                  }`}
                >
                  {item.label}
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

          {/* YouTube URL */}
          <div>
            <label className="block text-xs font-semibold text-[#d4c9ba] mb-1">
              Lien YouTube *
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-[#141210] border border-[#332c25] focus:border-[#e5a93b] rounded-xl px-3.5 py-2.5 text-sm text-[#f4efe6] placeholder-[#6b6256] outline-none"
              required
            />
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
