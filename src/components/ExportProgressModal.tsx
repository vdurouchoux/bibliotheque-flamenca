import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Code, 
  Upload, 
  Sparkles, 
  Bookmark, 
  AlertCircle 
} from 'lucide-react';
import { 
  exportFavoritesAndNotesAsText, 
  exportFavoritesAndNotesAsJSON, 
  importFavoritesAndNotesFromJSON, 
  triggerFileDownload 
} from '../utils/storage';

interface ExportProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isOpen,
  onClose,
  onDataRestored
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'json' | 'import'>('text');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const textExport = exportFavoritesAndNotesAsText();
  const jsonExport = exportFavoritesAndNotesAsJSON();

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadText = () => {
    const filename = `mon-carnet-flamenco-${new Date().toISOString().slice(0, 10)}.txt`;
    triggerFileDownload(textExport, filename, 'text/plain;charset=utf-8');
  };

  const handleDownloadJSON = () => {
    const filename = `sauvegarde-flamenco-${new Date().toISOString().slice(0, 10)}.json`;
    triggerFileDownload(jsonExport, filename, 'application/json;charset=utf-8');
  };

  const handleImportJsonString = (rawJson: string) => {
    if (!rawJson.trim()) return;
    const res = importFavoritesAndNotesFromJSON(rawJson);
    setImportStatus({ success: res.success, message: res.message });
    if (res.success && onDataRestored) {
      onDataRestored();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        handleImportJsonString(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-[#181512] border border-[#3b3228] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#2d261f] shrink-0 bg-[#1f1a15]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#e5a93b]/20 text-[#e5a93b]">
              <Bookmark className="w-5 h-5 fill-current" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif">
                Sauvegarder & Exporter mon carnet d’étude
              </h3>
              <p className="text-xs text-[#a69c8f]">
                Vos favoris, progressions, notes personnelles et minutages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#2a231b] transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2d261f] bg-[#14120f] px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => { setActiveTab('text'); setImportStatus(null); }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'text'
                ? 'border-[#e5a93b] text-[#e5a93b] bg-[#1b1713]'
                : 'border-transparent text-[#8c8173] hover:text-[#c7bcaf]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Format Texte (.txt)</span>
          </button>

          <button
            onClick={() => { setActiveTab('json'); setImportStatus(null); }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'border-[#e5a93b] text-[#e5a93b] bg-[#1b1713]'
                : 'border-transparent text-[#8c8173] hover:text-[#c7bcaf]'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Sauvegarde JSON (.json)</span>
          </button>

          <button
            onClick={() => { setActiveTab('import'); setImportStatus(null); }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'import'
                ? 'border-[#e5a93b] text-[#e5a93b] bg-[#1b1713]'
                : 'border-transparent text-[#8c8173] hover:text-[#c7bcaf]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Restaurer / Importer</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: TEXT FORMAT */}
          {activeTab === 'text' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-[#221c16] border border-[#3d3326] text-xs text-[#c9bcaa] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#e5a93b] shrink-0 mt-0.5" />
                <span>
                  Ce document texte est idéal pour être imprimé, archivé dans vos notes personnelles (Notion, Word, bloc-notes) ou envoyé par e-mail.
                </span>
              </div>

              {/* Text Preview Box */}
              <div className="relative">
                <textarea
                  readOnly
                  value={textExport}
                  className="w-full h-64 sm:h-72 p-3.5 rounded-xl bg-[#110f0d] border border-[#2e261d] text-xs text-[#e2d8cc] font-mono leading-relaxed resize-none focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  onClick={() => handleCopy(textExport)}
                  className="px-4 py-2 rounded-xl bg-[#231d17] hover:bg-[#2f271f] border border-[#3e3427] text-xs font-semibold text-[#e5a93b] hover:text-[#f4efe6] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Texte copié !' : 'Copier dans le presse-papier'}</span>
                </button>
                <button
                  onClick={handleDownloadText}
                  className="px-4 py-2 rounded-xl bg-[#e5a93b] hover:bg-[#f3b749] text-[#121110] text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger le fichier .txt</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: JSON BACKUP FORMAT */}
          {activeTab === 'json' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-[#221c16] border border-[#3d3326] text-xs text-[#c9bcaa] flex items-start gap-2.5">
                <Code className="w-4 h-4 text-[#e5a93b] shrink-0 mt-0.5" />
                <span>
                  Format de sauvegarde technique contenant l'intégralité de vos favoris, statuts d'apprentissage, notes de vidéos et repères chronométrés.
                </span>
              </div>

              {/* JSON Preview Box */}
              <div className="relative">
                <textarea
                  readOnly
                  value={jsonExport}
                  className="w-full h-64 sm:h-72 p-3.5 rounded-xl bg-[#110f0d] border border-[#2e261d] text-[11px] text-[#b8ab9a] font-mono leading-relaxed resize-none focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  onClick={() => handleCopy(jsonExport)}
                  className="px-4 py-2 rounded-xl bg-[#231d17] hover:bg-[#2f271f] border border-[#3e3427] text-xs font-semibold text-[#e5a93b] hover:text-[#f4efe6] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'JSON copié !' : 'Copier le JSON'}</span>
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="px-4 py-2 rounded-xl bg-[#e5a93b] hover:bg-[#f3b749] text-[#121110] text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger la sauvegarde .json</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORT & RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#221c16] border border-[#3d3326] text-xs text-[#c9bcaa] flex items-start gap-2.5">
                <Upload className="w-4 h-4 text-[#e5a93b] shrink-0 mt-0.5" />
                <span>
                  Restaurez vos progrès sur un nouveau téléphone, un autre ordinateur ou après avoir vidé l’historique de votre navigateur.
                </span>
              </div>

              {/* Upload file card */}
              <div className="p-4 rounded-xl border border-dashed border-[#44382c] bg-[#14120f] hover:border-[#e5a93b]/60 transition-colors flex flex-col items-center justify-center text-center gap-2">
                <input
                  type="file"
                  accept=".json,application/json"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#241e17] hover:bg-[#312920] border border-[#3f3427] text-xs font-bold text-[#e5a93b] flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choisir un fichier de sauvegarde (.json)</span>
                </button>
                <span className="text-[11px] text-[#7a6f61]">
                  ou collez directement le contenu JSON ci-dessous
                </span>
              </div>

              {/* Manual Paste */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#c7bcaf] block">
                  Coller le contenu JSON de sauvegarde :
                </label>
                <textarea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder='{"version": "1.0", "bookmarks": { ... }}'
                  className="w-full h-32 p-3 rounded-xl bg-[#110f0d] border border-[#2e261d] text-xs text-[#e2d8cc] font-mono leading-relaxed resize-none focus:outline-hidden focus:border-[#e5a93b]/60"
                />
              </div>

              {/* Status Message */}
              {importStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                    importStatus.success
                      ? 'bg-green-950/40 text-green-300 border border-green-800/60'
                      : 'bg-red-950/40 text-red-300 border border-red-800/60'
                  }`}
                >
                  {importStatus.success ? (
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              {/* Import Action Button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleImportJsonString(importText)}
                  disabled={!importText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#e5a93b] hover:bg-[#f3b749] disabled:opacity-40 disabled:cursor-not-allowed text-[#121110] text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Importer & Fusionner mes données</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-[#2d261f] bg-[#14120f] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#221c17] hover:bg-[#2d251e] text-xs font-bold text-[#c9bcaa] hover:text-[#f4efe6] transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
