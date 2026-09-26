import React, { useState, useEffect, useRef } from 'react';
import { X, FolderPlus, Folder } from 'lucide-react';

interface AddDanseFolderModalProps {
  isOpen: boolean;
  parentId: string | null;
  parentName: string;
  onClose: () => void;
  onAdd: (name: string, parentId: string | null) => void;
}

export const AddDanseFolderModal: React.FC<AddDanseFolderModalProps> = ({
  isOpen,
  parentId,
  parentName,
  onClose,
  onAdd
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = folderName.trim();
    if (!trimmed) {
      setError('Veuillez saisir un nom pour ce dossier.');
      return;
    }
    onAdd(trimmed, parentId);
    onClose();
  };

  const isSubFolder = parentId !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#161310] border border-[#382d22] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2e241c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f4efe6] font-serif">
                {isSubFolder ? 'Ajouter un sous-dossier' : 'Ajouter un dossier'}
              </h3>
              <p className="text-xs text-[#a69c8f]">
                {isSubFolder ? (
                  <>Niveau inférieur dans <span className="text-emerald-400 font-semibold">{parentName}</span></>
                ) : (
                  <>À la suite des dossiers existants de <span className="text-emerald-400 font-semibold">{parentName}</span></>
                )}
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
              Nom du {isSubFolder ? 'sous-dossier' : 'dossier'} *
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={folderName}
                onChange={e => {
                  setFolderName(e.target.value);
                  if (error) setError('');
                }}
                placeholder={isSubFolder ? "ex : Farruquito, Antonio Gades, Stages été..." : "ex : Mes créations, Technique de pieds, Répétitions..."}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f1b16] border border-[#382d22] focus:border-emerald-500 focus:outline-none text-[#f4efe6] text-sm placeholder-[#73685a] transition-colors"
              />
              <Folder className="w-4 h-4 text-[#73685a] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                {error}
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#261e16]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#201a14] border border-transparent hover:border-[#382d22] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-[#09150e] shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Créer le dossier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
