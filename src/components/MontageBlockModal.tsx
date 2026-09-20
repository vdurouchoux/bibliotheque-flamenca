import React, { useState, useEffect } from 'react';
import { X, Save, Footprints, Music, AlignLeft, Tag, Layers, Clock } from 'lucide-react';
import { MontageBlock } from '../types';

interface MontageBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string; danceTips: string; guitarCode: string; durationApprox?: string }) => void;
  initialBlock?: MontageBlock | null;
  blockNumber?: number;
  blockIndex?: number;
  montageName?: string;
  montageTitle?: string;
}

export const MontageBlockModal: React.FC<MontageBlockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBlock,
  blockNumber,
  blockIndex,
  montageName,
  montageTitle
}) => {
  const displayName = montageTitle || montageName || 'Montage Farruca';
  const displayIndex = blockIndex !== undefined ? blockIndex : blockNumber;

  const [title, setTitle] = useState('');
  const [durationApprox, setDurationApprox] = useState('');
  const [description, setDescription] = useState('');
  const [danceTips, setDanceTips] = useState('');
  const [guitarCode, setGuitarCode] = useState('');

  useEffect(() => {
    if (initialBlock) {
      setTitle(initialBlock.title || '');
      setDurationApprox(initialBlock.durationApprox || '');
      setDescription(initialBlock.description || '');
      setDanceTips(initialBlock.danceTips || '');
      setGuitarCode(initialBlock.guitarCode || '');
    } else {
      setTitle('');
      setDurationApprox('');
      setDescription('');
      setDanceTips('');
      setGuitarCode('');
    }
  }, [initialBlock, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      durationApprox: durationApprox.trim(),
      description: description.trim(),
      danceTips: danceTips.trim(),
      guitarCode: guitarCode.trim()
    });
    onClose();
  };

  const isEditing = !!initialBlock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#181512] border border-[#3e3427] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2e2720] flex items-center justify-between bg-[#14120f]">
          <div className="flex items-center gap-2.5 text-[#e5a93b]">
            <div className="w-8 h-8 rounded-lg bg-[#e5a93b]/15 flex items-center justify-center border border-[#e5a93b]/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f4efe6]">
                {isEditing ? `Modifier le Bloc ${displayIndex !== undefined ? displayIndex : ''}` : `Créer un bloc`}
              </h3>
              <p className="text-xs text-[#a69c8f]">
                {displayName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* 1. Titre du bloc et Durée */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-[#f4efe6] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#e5a93b]" />
                <span>Titre du bloc *</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="ex: Salida & Entrada, Llamada, Escobilla..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#201a15] border border-[#382e22] text-[#f4efe6] placeholder-[#6e6355] focus:outline-none focus:border-[#e5a93b] font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#f4efe6] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#e5a93b]" />
                <span>Durée approx.</span>
              </label>
              <input
                type="text"
                value={durationApprox}
                onChange={e => setDurationApprox(e.target.value)}
                placeholder="ex: 1min à 1min 30"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#201a15] border border-[#382e22] text-[#f4efe6] placeholder-[#6e6355] focus:outline-none focus:border-[#e5a93b] font-medium"
              />
            </div>
          </div>

          {/* 2. Texte dessous (Description / Rôle scénique) */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#f4efe6] flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-[#e5a93b]" />
              <span>Texte dessous (Description & Rôle du bloc)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez l'enchaînement, le style ou la dynamique scénique de ce bloc..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#201a15] border border-[#382e22] text-[#f4efe6] placeholder-[#6e6355] focus:outline-none focus:border-[#e5a93b] leading-relaxed resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* 3. Texte sous "Conseils de danse" */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#e5a93b] flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5" />
                <span>Conseils de danse</span>
              </label>
              <textarea
                rows={4}
                value={danceTips}
                onChange={e => setDanceTips(e.target.value)}
                placeholder="• Posture fière, cambre sobre&#10;• Pas marchés sur les temps 1 et 3&#10;• Déplacement ample..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1813] border border-[#33291e] text-[#f4efe6] placeholder-[#6e6355] focus:outline-none focus:border-[#e5a93b] text-xs leading-relaxed resize-y font-sans"
              />
              <span className="text-[10px] text-[#8c8173] block">
                Astuce : Vous pouvez utiliser des puces (•) pour lister vos points clés.
              </span>
            </div>

            {/* 4. Texte sous "Code avec le guitariste" */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#e5a93b] flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                <span>Code avec le guitariste</span>
              </label>
              <textarea
                rows={4}
                value={guitarCode}
                onChange={e => setGuitarCode(e.target.value)}
                placeholder="ex: Le premier remate net donne le départ. Connexion visuelle obligatoire..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1813] border border-[#33291e] text-[#f4efe6] placeholder-[#6e6355] focus:outline-none focus:border-[#e5a93b] text-xs leading-relaxed resize-y font-sans"
              />
              <span className="text-[10px] text-[#8c8173] block">
                Signaux d'appel, remates, changements de tempo ou silences partagés.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#29221b] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#221c17] hover:bg-[#2c241e] text-[#a69c8f] hover:text-[#f4efe6] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] disabled:opacity-50 text-[#121110] font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Enregistrer les modifications' : 'Créer le bloc'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
