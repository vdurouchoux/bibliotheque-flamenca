import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil } from 'lucide-react';

interface RenameDanseFolderModalProps {
  isOpen: boolean;
  folderName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export const RenameDanseFolderModal: React.FC<RenameDanseFolderModalProps> = ({
  isOpen,
  folderName,
  onClose,
  onRename
}) => {
  const [name, setName] = useState(folderName);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(folderName);
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, folderName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Veuillez saisir un nom pour ce dossier.');
      return;
    }
    onRename(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#161310] border border-[#382d22] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2e241c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#e5a93b]">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f4efe6] font-serif">
                Renommer le dossier
              </h3>
              <p className="text-xs text-[#a69c8f]">
                Modifiez l'intitulé de <span className="text-[#ded3c5] font-semibold">{folderName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c8173] hover:text-[#f4efe6] hover:bg-white/5 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#ded3c5] mb-1.5">
              Nouveau nom du dossier *
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Nom du dossier..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f1b16] border border-[#382d22] focus:border-[#e5a93b] focus:outline-none text-[#f4efe6] text-sm placeholder-[#73685a] transition-colors"
            />
            {error && (
              <p className="text-rose-400 text-xs mt-1.5">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#261e16]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#201a14] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
