import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  title: string;
  videoTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  title,
  videoTitle,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#181512] border border-red-900/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-[#2e2720] flex items-center justify-between bg-[#14120f]">
          <div className="flex items-center gap-2.5 text-red-400">
            <div className="w-8 h-8 rounded-lg bg-red-950/60 flex items-center justify-center border border-red-800/40">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#f4efe6]">
              {title || 'Supprimer cette vidéo'}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[#f4efe6]">
                Êtes-vous sûr de vouloir supprimer cette vidéo ?
              </p>
              <p className="text-xs text-[#b8ada0] line-clamp-2 italic bg-[#221d17] p-2 rounded-lg border border-[#332b21] mt-2">
                « {videoTitle} »
              </p>
              <p className="text-xs text-[#8c8173] mt-2">
                Cette vidéo ne sera plus visible dans cette section. Vous pourrez toujours en ajouter une nouvelle ou réinitialiser les vidéos initiales.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#29221b]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer définitivement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
