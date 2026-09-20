import React, { useState } from 'react';
import { Bookmark, Play, Trash2, FileText, X, Download } from 'lucide-react';
import { PracticeBookmark, VideoItem, DisciplineMode } from '../types';
import { getBookmarks, toggleBookmark, updateBookmarkStatus, extractYouTubeInfo } from '../utils/storage';
import { ExportProgressModal } from './ExportProgressModal';

interface FavoritesViewProps {
  discipline: DisciplineMode;
  onPlayVideo: (video: VideoItem, paloName: string, paloId: string, sectionName: string) => void;
  onClose: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ discipline, onPlayVideo }) => {
  const [bookmarks, setBookmarks] = useState<Record<string, PracticeBookmark>>(getBookmarks());
  const [filter, setFilter] = useState<'all' | 'to_learn' | 'learning' | 'mastered'>('all');
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [disciplineScope, setDisciplineScope] = useState<'current' | 'all' | 'guitare' | 'danse'>('current');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const allItems = (Object.values(bookmarks) as PracticeBookmark[]).sort((a, b) => b.savedAt - a.savedAt);

  const isItemDanse = (item: PracticeBookmark): boolean => {
    return item.discipline === 'danse' ||
      item.paloName.toLowerCase().includes('danse') ||
      item.paloName.toLowerCase().includes('baile') ||
      ['marcajes', 'zapateado', 'llamadas', 'maitres', 'structure'].includes(item.section.toLowerCase());
  };

  // Scope items
  const scopedItems = allItems.filter(item => {
    if (disciplineScope === 'all') return true;
    if (disciplineScope === 'current') {
      return discipline === 'danse' ? isItemDanse(item) : !isItemDanse(item);
    }
    if (disciplineScope === 'danse') return isItemDanse(item);
    if (disciplineScope === 'guitare') return !isItemDanse(item);
    return true;
  });

  const filtered = scopedItems.filter(item => filter === 'all' || item.status === filter);

  const totalGuitare = allItems.filter(i => !isItemDanse(i)).length;
  const totalDanse = allItems.filter(i => isItemDanse(i)).length;

  const handleRemove = (item: PracticeBookmark) => {
    toggleBookmark(item);
    setBookmarks(getBookmarks());
  };

  const handleStatusChange = (videoId: string, status: PracticeBookmark['status']) => {
    updateBookmarkStatus(videoId, status);
    setBookmarks(getBookmarks());
  };

  const isDanseActiveView = (disciplineScope === 'current' && discipline === 'danse') || disciplineScope === 'danse';

  const viewTitle = isDanseActiveView
    ? "Mon Carnet d'Étude & Chorégraphie"
    : disciplineScope === 'all'
    ? "Mon Carnet d'Étude Flamenca"
    : "Mon Carnet d'Étude & Falsetas";

  const viewSubtitle = isDanseActiveView
    ? "Suivez votre progression sur vos montages, marcajes, zapateados et variations de danse"
    : disciplineScope === 'all'
    ? "Toutes vos pièces et chorégraphies enregistrées (Guitare & Danse)"
    : "Suivez votre progression sur vos falsetas et pièces favorites de guitare";

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* View Header */}
      <div className="flex flex-col gap-4 border-b border-[#2d2721] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#e5a93b]/20 text-[#e5a93b]">
                <Bookmark className="w-5 h-5 fill-current" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#f4efe6] font-serif">
                {viewTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#a69c8f] mt-1">
              {viewSubtitle}
            </p>
          </div>

          {/* Discipline Switcher tabs if both or either has content */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#181512] border border-[#2d2721] self-start sm:self-center">
            <button
              onClick={() => setDisciplineScope('current')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                disciplineScope === 'current'
                  ? 'bg-[#e5a93b] text-[#121110]'
                  : 'text-[#8c8173] hover:text-[#d4c9ba]'
              }`}
            >
              {discipline === 'danse' ? `💃 Danse (${totalDanse})` : `🎸 Guitare (${totalGuitare})`}
            </button>
            <button
              onClick={() => setDisciplineScope(discipline === 'danse' ? 'guitare' : 'danse')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                (discipline === 'danse' && disciplineScope === 'guitare') || (discipline === 'guitare' && disciplineScope === 'danse')
                  ? 'bg-[#e5a93b] text-[#121110]'
                  : 'text-[#8c8173] hover:text-[#d4c9ba]'
              }`}
            >
              {discipline === 'danse' ? `🎸 Guitare (${totalGuitare})` : `💃 Danse (${totalDanse})`}
            </button>
            <button
              onClick={() => setDisciplineScope('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                disciplineScope === 'all'
                  ? 'bg-[#e5a93b] text-[#121110]'
                  : 'text-[#8c8173] hover:text-[#d4c9ba]'
              }`}
            >
              Tout ({allItems.length})
            </button>
          </div>
        </div>

        {/* Status Filter Pills & Export Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'all', label: `Toutes (${scopedItems.length})` },
              { key: 'learning', label: `En cours (${scopedItems.filter(i => i.status === 'learning').length})` },
              { key: 'to_learn', label: `À faire (${scopedItems.filter(i => i.status === 'to_learn').length})` },
              { key: 'mastered', label: `Maîtrisées (${scopedItems.filter(i => i.status === 'mastered').length})` }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  filter === f.key
                    ? 'bg-[#e5a93b] text-[#121110] border-[#e5a93b]'
                    : 'bg-[#221e1a] text-[#8c8173] border-[#383129] hover:text-[#d4c9ba]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#251f18] hover:bg-[#312920] border border-[#e5a93b]/40 text-[#e5a93b] hover:text-[#f4efe6] text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Exporter ou sauvegarder mon carnet d'étude et mes notes"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter mes progrès</span>
          </button>
        </div>
      </div>

      {/* Content List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#181512] rounded-2xl border border-[#2d2721]">
          <div className="w-12 h-12 rounded-full bg-[#26211c] flex items-center justify-center mx-auto text-[#e5a93b] mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#f4efe6] font-serif">
            {isDanseActiveView
              ? "Aucune vidéo de danse enregistrée"
              : "Aucune falseta enregistrée"}
          </h3>
          <p className="text-xs text-[#a69c8f] mt-1.5 max-w-md mx-auto leading-relaxed">
            {isDanseActiveView
              ? "Lorsque vous visionnez un marcaje, zapateado ou appel de danse, cliquez sur « Ajouter à mes études » pour le retrouver ici avec vos notes chorégraphiques personnelles."
              : "Lorsque vous visionnez une falseta ou un cours de guitare, cliquez sur « Ajouter à mes études » pour la retrouver ici avec vos notes personnelles."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const itemIsDanse = isItemDanse(item);
            const ytInfo = extractYouTubeInfo(item.url);
            const videoId = ytInfo.videoId;
            const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

            const isPreviewing = previewVideoId === item.videoId;

            return (
              <div
                key={item.videoId}
                className="bg-[#181512] border border-[#312a23] hover:border-[#42372c] rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {isPreviewing && videoId ? (
                    <div className="w-36 sm:w-48 aspect-video rounded-lg overflow-hidden bg-black border-2 border-[#e5a93b] shrink-0 relative shadow-md">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                        title={item.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewVideoId(null);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/85 hover:bg-black text-white text-[10px] border border-white/20 transition-all cursor-pointer shadow z-10 hover:border-[#e5a93b]"
                        title="Fermer l'aperçu"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : thumbUrl ? (
                    <div
                      className="w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-[#12100d] border border-[#2e261e] shrink-0 relative group/thumb cursor-pointer shadow-sm"
                      onClick={() => setPreviewVideoId(item.videoId)}
                      title="Cliquer pour prévisualiser la vidéo ici (sans changer de page)"
                    >
                      <img
                        src={thumbUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-[#e5a93b]/90 text-[#121110] flex items-center justify-center shadow">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        itemIsDanse
                          ? 'bg-[#2a1b18] text-[#ff9e80] border-[#592c23]'
                          : 'bg-[#1a232a] text-[#80d4ff] border-[#234559]'
                      }`}>
                        {itemIsDanse ? '💃 Danse' : '🎸 Guitare'}
                      </span>
                      <span className="text-xs font-semibold text-[#d4c9ba]">
                        {item.paloName}
                      </span>
                      <span className="text-[11px] text-[#706659]">
                        • {item.section}
                      </span>
                    </div>

                    <h3
                      className="text-sm sm:text-base font-bold text-[#f4efe6] hover:text-[#e5a93b] transition-colors cursor-pointer truncate"
                      onClick={() => {
                        setPreviewVideoId(null);
                        onPlayVideo(
                          { id: item.videoId, title: item.title, url: item.url, level: item.level },
                          item.paloName,
                          item.paloId,
                          item.section
                        );
                      }}
                    >
                      {item.title}
                    </h3>

                    {item.notes && (
                      <div className="flex items-start gap-1.5 text-xs text-[#c0b4a4] bg-[#12100e] rounded-lg p-2 border border-[#26211b] mt-1">
                        <FileText className="w-3.5 h-3.5 text-[#e5a93b] shrink-0 mt-0.5" />
                        <span className="italic line-clamp-2">{item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status pills + Play & Delete */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Status selector */}
                  <select
                    value={item.status}
                    onChange={e => handleStatusChange(item.videoId, e.target.value as PracticeBookmark['status'])}
                    className="bg-[#221e1a] text-xs font-semibold text-[#f4efe6] border border-[#383129] rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="to_learn">À travailler</option>
                    <option value="learning">En cours</option>
                    <option value="mastered">Maîtrisé ✓</option>
                  </select>

                  {/* Play Button */}
                  <button
                    onClick={() => {
                      setPreviewVideoId(null);
                      onPlayVideo(
                        { id: item.videoId, title: item.title, url: item.url, level: item.level },
                        item.paloName,
                        item.paloId,
                        item.section
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e5a93b] hover:bg-[#d4972c] text-[#121110] font-bold text-xs transition-colors cursor-pointer"
                    title="Visionner & travailler"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Visionner & travailler</span>
                  </button>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item)}
                    className="p-1.5 rounded-xl text-[#7a6f62] hover:text-red-400 hover:bg-[#25201b] transition-colors cursor-pointer"
                    title="Retirer des études"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'exportation & sauvegarde des progrès */}
      <ExportProgressModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onDataRestored={() => setBookmarks(getBookmarks())}
      />
    </div>
  );
};
