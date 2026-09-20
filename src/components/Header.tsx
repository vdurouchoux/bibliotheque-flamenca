import React from 'react';
import { ArrowLeft, Play, Square, Bookmark, BookOpen, Music2, Cloud, RefreshCw } from 'lucide-react';
import { DisciplineMode } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  canGoBack: boolean;
  backButtonLabel?: string;
  onBack: () => void;
  discipline: DisciplineMode;
  onToggleDiscipline: (mode: DisciplineMode) => void;
  isMetronomePlaying: boolean;
  onToggleMetronome: () => void;
  onOpenTools: () => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
  onOpenInstall?: () => void;
  onOpenCloudSync?: () => void;
  cloudSyncStatus?: 'synced' | 'saving' | 'offline' | 'connecting' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  canGoBack,
  backButtonLabel,
  onBack,
  discipline,
  onToggleDiscipline,
  isMetronomePlaying,
  onToggleMetronome,
  onOpenTools,
  onOpenFavorites,
  favoritesCount,
  onOpenInstall,
  onOpenCloudSync,
  cloudSyncStatus = 'synced'
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#161412]/95 backdrop-blur-md border-b border-[#2d2823] px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        {/* Left side: Back button or Logo + Title */}
        <div className="flex items-center justify-between gap-2.5 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {canGoBack ? (
              <button
                id="header-back-btn"
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#282119] hover:bg-[#362b20] active:scale-95 text-[#e5a93b] text-xs sm:text-sm font-bold transition-all cursor-pointer border-2 border-[#e5a93b]/70 hover:border-[#e5a93b] shadow-md shrink-0"
                title={backButtonLabel ? `Retourner vers : ${backButtonLabel}` : "Retourner à la vue précédente"}
              >
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                <span className="inline">{backButtonLabel || 'Retour'}</span>
              </button>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e5a93b]/20 to-[#b93826]/20 border border-[#e5a93b]/40 flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-lg">{discipline === 'danse' ? '💃' : '🎸'}</span>
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[#f4efe6] truncate font-serif">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[#a69c8f] truncate font-sans">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Discipline Switcher (Visible on mobile right next to title) */}
          <div className="flex sm:hidden items-center bg-[#1c1712] p-0.5 rounded-lg border border-[#382f24] text-xs shrink-0">
            <button
              onClick={() => onToggleDiscipline('guitare')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                discipline === 'guitare'
                  ? 'bg-[#e5a93b] text-[#121110] shadow-sm'
                  : 'text-[#8c8173] hover:text-[#d4c9ba]'
              }`}
            >
              🎸 Guitare
            </button>
            <button
              onClick={() => onToggleDiscipline('danse')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                discipline === 'danse'
                  ? 'bg-[#e5a93b] text-[#121110] shadow-sm'
                  : 'text-[#8c8173] hover:text-[#d4c9ba]'
              }`}
            >
              💃 Danse
            </button>
          </div>
        </div>

        {/* Right side: Discipline toggle (Desktop) + Actions */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
          {/* Discipline Switcher (Desktop) */}
          <div className="hidden sm:flex items-center bg-[#1e1914] p-0.5 rounded-lg border border-[#382f24] text-xs mr-1">
            <button
              onClick={() => onToggleDiscipline('guitare')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                discipline === 'guitare'
                  ? 'bg-[#e5a93b] text-[#121110] shadow-sm'
                  : 'text-[#8c8173] hover:text-[#d4c9ba]'
              }`}
            >
              🎸 Guitare
            </button>
            <button
              onClick={() => onToggleDiscipline('danse')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                discipline === 'danse'
                  ? 'bg-[#e5a93b] text-[#121110] shadow-sm'
                  : 'text-[#8c8173] hover:text-[#d4c9ba]'
              }`}
            >
              💃 Danse
            </button>
          </div>
          {/* Metronome toggle */}
          <button
            id="header-metronome-btn"
            onClick={onToggleMetronome}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
              isMetronomePlaying
                ? 'bg-[#e5a93b] text-[#121110] border-[#f5c363] shadow-md shadow-[#e5a93b]/20 font-bold animate-pulse'
                : 'bg-[#25201b] text-[#d4c9ba] border-[#3b342c] hover:bg-[#322c25] hover:text-[#f4efe6]'
            }`}
            title={isMetronomePlaying ? 'Arrêter le compás' : 'Ouvrir / Démarrer le compás'}
          >
            {isMetronomePlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Compás On</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-[#e5a93b]" />
                <span className="hidden sm:inline">Compás</span>
              </>
            )}
          </button>

          {/* Tools / Cejilla / Techniques */}
          <button
            id="header-tools-btn"
            onClick={onOpenTools}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322c25] text-[#d4c9ba] hover:text-[#e5a93b] text-xs sm:text-sm font-medium transition-colors cursor-pointer border border-[#3b342c] flex items-center gap-1.5"
            title="Cejilla, accords et techniques"
          >
            <BookOpen className="w-4 h-4 text-[#e5a93b]" />
            <span className="hidden md:inline">Cejilla & Lexique</span>
          </button>

          {/* Practice & Favorites */}
          <button
            id="header-favorites-btn"
            onClick={onOpenFavorites}
            className="relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322c25] text-[#d4c9ba] hover:text-[#e5a93b] text-xs sm:text-sm font-medium transition-colors cursor-pointer border border-[#3b342c] flex items-center gap-1.5"
            title={discipline === 'danse' ? "Mes chorégraphies et études de danse" : "Mes falsetas en cours et favoris"}
          >
            <Bookmark className="w-4 h-4 text-[#e5a93b]" />
            <span className="hidden md:inline">Mes Études</span>
            {favoritesCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-[#121110] bg-[#e5a93b] rounded-full">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cloud Sync Status Indicator & Mobile Pairing */}
          {onOpenCloudSync && (
            <button
              id="header-cloud-sync-btn"
              onClick={onOpenCloudSync}
              className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
                cloudSyncStatus === 'saving'
                  ? 'bg-[#2b2214] text-[#e5a93b] border-[#e5a93b]/50'
                  : cloudSyncStatus === 'offline'
                  ? 'bg-[#241f1c] text-[#8c8072] border-[#383028]'
                  : 'bg-[#15231a] hover:bg-[#1c3024] text-emerald-400 border-emerald-600/40 hover:border-emerald-500'
              }`}
              title="Synchronisation automatique Cloud (PC & Téléphone reliés)"
            >
              <div className="relative flex items-center">
                <Cloud className="w-4 h-4" />
                <span 
                  className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                    cloudSyncStatus === 'saving'
                      ? 'bg-[#e5a93b]'
                      : cloudSyncStatus === 'offline'
                      ? 'bg-zinc-500'
                      : 'bg-emerald-400'
                  }`}
                />
              </div>
              <span className="hidden lg:inline text-[11px]">
                {cloudSyncStatus === 'saving' ? 'Sauvegarde...' : 'Synchro Cloud'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
