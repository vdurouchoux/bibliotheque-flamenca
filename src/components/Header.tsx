import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Square, Bookmark, BookOpen, Music2, Cloud, RefreshCw, Layers, Maximize, Minimize } from 'lucide-react';
import { DisciplineMode } from '../types';

interface HeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  canGoBack: boolean;
  backButtonLabel?: string;
  onBack: () => void;
  discipline: DisciplineMode;
  onToggleDiscipline: (mode: DisciplineMode) => void;
  isMetronomePlaying: boolean;
  onToggleMetronome: () => void;
  onOpenTools: () => void;
  onOpenLexique?: () => void;
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
  onOpenLexique,
  onOpenFavorites,
  favoritesCount,
  onOpenInstall,
  onOpenCloudSync,
  cloudSyncStatus = 'synced'
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' ? !!document.fullscreenElement : false;
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          root.requestFullscreen().catch(() => {});
        } else if ((root as any).webkitRequestFullscreen) {
          (root as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <header 
      className="sticky top-0 z-40 bg-[#141210]/95 backdrop-blur-md border-b border-[#2d251d] px-3 sm:px-6 py-2.5 transition-colors"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top, 0.625rem))' }}
    >
      <div className="max-w-4xl mx-auto space-y-2">
        {/* BANDEAU SUPÉRIEUR COMMUN : Logo + "Bibliothèque Flamenca" à gauche, et les 3 disciplines (Chant, Guitare, Danse) à droite */}
        <div className="flex items-center justify-between gap-3">
          {/* Gauche : Retour ou Logo Flamenco + Nom Permanent Bibliothèque Flamenca */}
          <div className="flex items-center gap-2.5 min-w-0">
            {canGoBack ? (
              <button
                id="header-back-btn"
                onClick={onBack}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#282119] hover:bg-[#362b20] active:scale-95 text-[#e5a93b] text-xs sm:text-sm font-bold transition-all cursor-pointer border-2 border-[#e5a93b]/70 hover:border-[#e5a93b] shadow-md shrink-0"
                title={backButtonLabel ? `Retourner vers : ${backButtonLabel}` : "Retourner à la vue précédente"}
              >
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                <span className="inline">{backButtonLabel || 'Retour'}</span>
              </button>
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#e5a93b]/25 to-[#b93826]/25 border border-[#e5a93b]/40 flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-base sm:text-lg">
                  {discipline === 'danse' ? '💃' : discipline === 'guitare' ? '🎸' : '🎤'}
                </span>
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-sm xs:text-base sm:text-lg font-bold tracking-tight text-[#f4efe6] whitespace-nowrap font-serif leading-tight">
                Bibliothèque Flamenca
              </h1>
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-[#a69c8f] truncate font-sans">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Droite : Les 3 disciplines permanentes (Chant, Guitare, Danse) avec l'onglet actif bien en jaune */}
          <div className="flex items-center bg-[#1c1712] p-1 rounded-xl border border-[#3e3224] shadow-inner text-xs shrink-0">
            {/* 1. Chant (futur / préparation) */}
            <button
              type="button"
              onClick={() => onToggleDiscipline('chant')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                discipline === 'chant'
                  ? 'bg-[#e5a93b] text-[#121110] shadow-sm font-extrabold'
                  : 'text-[#8c8173] hover:text-[#d4c9ba]'
              }`}
              title="Chant flamenco (Cante)"
            >
              <span>🎤</span>
              <span className="hidden xs:inline">Chant</span>
            </button>

            {/* 2. Guitare */}
            <button
              type="button"
              onClick={() => onToggleDiscipline('guitare')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                discipline === 'guitare'
                  ? 'bg-[#e5a93b] text-[#121110] shadow-sm font-extrabold'
                  : 'text-[#8c8173] hover:text-[#d4c9ba]'
              }`}
              title="Guitare flamenca (Toque)"
            >
              <span>🎸</span>
              <span className="hidden xs:inline">Guitare</span>
            </button>

            {/* 3. Danse (en jaune en haut à droite quand sélectionné) */}
            <button
              type="button"
              onClick={() => onToggleDiscipline('danse')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                discipline === 'danse'
                  ? 'bg-[#e5a93b] text-[#121110] shadow-sm font-extrabold'
                  : 'text-[#8c8173] hover:text-[#d4c9ba]'
              }`}
              title="Danse flamenca (Baile)"
            >
              <span>💃</span>
              <span className="hidden xs:inline">Danse</span>
            </button>
          </div>
        </div>

        {/* BANDEAU COMMUN INFÉRIEUR : Les petites icônes d'outils et actions communes aux trois disciplines */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 pt-1.5 border-t border-[#251f18]/70 overflow-x-auto no-scrollbar">
          {/* Metronome toggle */}
          <button
            id="header-metronome-btn"
            onClick={onToggleMetronome}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border shrink-0 ${
              isMetronomePlaying
                ? 'bg-[#e5a93b] text-[#121110] border-[#f5c363] shadow-md shadow-[#e5a93b]/20 font-bold animate-pulse'
                : 'bg-[#211b16] text-[#d4c9ba] border-[#382e24] hover:bg-[#2d251d] hover:text-[#f4efe6]'
            }`}
            title={isMetronomePlaying ? 'Arrêter le compás' : 'Ouvrir / Démarrer le compás'}
          >
            {isMetronomePlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="text-[11px] sm:text-xs">Compás On</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-[#e5a93b]" />
                <span className="text-[11px] sm:text-xs">Compás</span>
              </>
            )}
          </button>

          {/* Tools / Arborescence / Cejilla / Techniques */}
          <button
            id="header-tools-btn"
            onClick={onOpenTools}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#211b16] hover:bg-[#2d251d] text-[#d4c9ba] hover:text-[#e5a93b] text-xs font-medium transition-colors cursor-pointer border border-[#382e24] flex items-center gap-1.5 shrink-0"
            title="Arborescence des Palos, capodastre et techniques"
          >
            <Layers className="w-3.5 h-3.5 text-[#e5a93b]" />
            <span className="text-[11px] sm:text-xs">Arborescence</span>
          </button>

          {/* Lexique du Flamenco direct button */}
          {onOpenLexique && (
            <button
              id="header-lexique-btn"
              onClick={onOpenLexique}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#211b16] hover:bg-[#2d251d] text-[#d4c9ba] hover:text-[#e5a93b] text-xs font-medium transition-colors cursor-pointer border border-[#382e24] flex items-center gap-1.5 shrink-0"
              title="Lexique des termes techniques et vocabulaire flamenco"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#e5a93b]" />
              <span className="text-[11px] sm:text-xs">Lexique</span>
            </button>
          )}

          {/* Practice & Favorites */}
          <button
            id="header-favorites-btn"
            onClick={onOpenFavorites}
            className="relative px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#211b16] hover:bg-[#2d251d] text-[#d4c9ba] hover:text-[#e5a93b] text-xs font-medium transition-colors cursor-pointer border border-[#382e24] flex items-center gap-1.5 shrink-0"
            title={discipline === 'danse' ? "Mes chorégraphies et études de danse" : "Mes falsetas en cours et favoris"}
          >
            <Bookmark className="w-3.5 h-3.5 text-[#e5a93b]" />
            <span className="text-[11px] sm:text-xs">Mes Études</span>
            {favoritesCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-[#121110] bg-[#e5a93b] rounded-full">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cloud Sync Status Indicator & Mobile Pairing */}
          {onOpenCloudSync && (
            <button
              id="header-cloud-sync-btn"
              onClick={onOpenCloudSync}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-sm shrink-0 ${
                cloudSyncStatus === 'saving'
                  ? 'bg-[#2b2214] text-[#e5a93b] border-[#e5a93b]/50'
                  : cloudSyncStatus === 'offline'
                  ? 'bg-[#241f1c] text-[#8c8072] border-[#383028]'
                  : 'bg-[#15231a] hover:bg-[#1c3024] text-emerald-400 border-emerald-600/40 hover:border-emerald-500'
              }`}
              title="Synchronisation automatique Cloud (PC & Téléphone reliés)"
            >
              <div className="relative flex items-center">
                <Cloud className="w-3.5 h-3.5" />
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
              <span className="hidden sm:inline text-[11px]">
                {cloudSyncStatus === 'saving' ? 'Sauvegarde...' : 'Cloud'}
              </span>
            </button>
          )}

          {/* Fullscreen Toggle - Supprime immédiatement toute barre de navigation de navigateur */}
          <button
            id="header-fullscreen-btn"
            onClick={handleToggleFullscreen}
            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
              isFullscreen
                ? 'bg-[#e5a93b]/20 text-[#e5a93b] border-[#e5a93b]/50 shadow-sm font-bold'
                : 'bg-[#211b16] hover:bg-[#2d251d] text-[#d4c9ba] hover:text-[#e5a93b] border-[#382e24]'
            }`}
            title={isFullscreen ? "Quitter le plein écran" : "Afficher en plein écran (masquer les barres du navigateur)"}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5 text-[#e5a93b]" />
                <span className="text-[11px] sm:text-xs">Fenêtre</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5 text-[#e5a93b]" />
                <span className="text-[11px] sm:text-xs">Plein écran</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
