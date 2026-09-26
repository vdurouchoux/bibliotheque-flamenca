import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Play,
  Square,
  Bookmark,
  BookOpen,
  Cloud,
  Layers,
  Maximize,
  Minimize,
  Search,
  X,
  Film,
  Folder,
  ChevronRight
} from 'lucide-react';
import { DisciplineMode, VideoItem, DanseSectionTab, SectionTab } from '../types';
import { buildUniversalIndex, searchUniversalItems, UniversalSearchItem } from '../utils/universalSearch';
import { FlamencoGuitarIcon } from './FlamencoGuitarIcon';
import { FlamencoGuitaristeIcon } from './FlamencoGuitaristeIcon';
import { FlamencoBailaoraIcon } from './FlamencoBailaoraIcon';
import { FlamencoCantaorIcon } from './FlamencoCantaorIcon';

interface HeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  canGoBack: boolean;
  backButtonLabel?: string;
  onBack: () => void;
  onNavigateHome?: () => void;
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
  activeFileName?: string;
  // Fonctions de navigation et de lecture globale depuis la recherche
  onPlayVideo?: (video: VideoItem, paloName: string, paloKey: string, sectionName: string) => void;
  onNavigatePalo?: (paloKey: string, discipline: DisciplineMode, danseTab?: DanseSectionTab, guitarTab?: SectionTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  canGoBack,
  backButtonLabel,
  onBack,
  onNavigateHome,
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
  cloudSyncStatus = 'synced',
  activeFileName,
  onPlayVideo,
  onNavigatePalo
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' ? !!document.fullscreenElement : false;
  });

  // Gestion de la recherche intégrée dans le bandeau supérieur
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'palos' | 'videos' | 'textes' | 'lexique'>('all');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Construction mémorisée de l'index universel
  const allSearchItems = useMemo(() => buildUniversalIndex(), []);

  // Résultats de la recherche
  const searchResults = useMemo(() => {
    return searchUniversalItems(allSearchItems, searchTerm);
  }, [allSearchItems, searchTerm]);

  // Groupement des résultats
  const groupedResults = useMemo(() => {
    const palos: UniversalSearchItem[] = [];
    const videos: UniversalSearchItem[] = [];
    const textes: UniversalSearchItem[] = [];
    const lexique: UniversalSearchItem[] = [];

    searchResults.forEach(item => {
      if (item.type === 'palo') {
        palos.push(item);
      } else if (item.type === 'video') {
        videos.push(item);
      } else if (item.type === 'letra') {
        textes.push(item);
      } else if (item.type === 'lexique') {
        lexique.push(item);
      }
    });

    return { palos, videos, textes, lexique };
  }, [searchResults]);

  // Fermer le menu déroulant si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  const handleItemClick = (item: UniversalSearchItem) => {
    setIsDropdownOpen(false);

    if (item.type === 'video' && item.video && onPlayVideo) {
      onPlayVideo(
        item.video,
        item.paloName || (item.discipline === 'danse' ? 'Farruca (Danse)' : 'Flamenco'),
        item.paloKey || '',
        item.sectionName || ''
      );
    } else if (item.type === 'lexique') {
      if (onOpenLexique) {
        onOpenLexique();
      }
    } else if (item.paloKey && onNavigatePalo) {
      onNavigatePalo(
        item.paloKey,
        item.discipline === 'danse' ? 'danse' : 'guitare',
        item.danseTab,
        item.guitarTab
      );
    }
  };

  const renderSearchDropdown = () => {
    if (!isDropdownOpen || !searchTerm.trim()) return null;
    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-[75vh] overflow-y-auto bg-[#171410] border border-[#3e3224] rounded-2xl shadow-2xl p-3 sm:p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
        {/* Entête du panneau : compteur & filtres rapides */}
        <div className="flex items-center justify-between gap-2 border-b border-[#2b2219] pb-2 text-xs text-[#a69c8f] flex-wrap">
          <div>
            <strong className="text-[#f4efe6]">{searchResults.length}</strong> résultat{searchResults.length > 1 ? 's' : ''} pour « <span className="text-[#e5a93b] font-medium">{searchTerm}</span> »
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                activeCategoryFilter === 'all'
                  ? 'bg-[#e5a93b] text-[#121110]'
                  : 'text-[#8c8173] hover:text-[#f4efe6] bg-[#221c17]'
              }`}
            >
              Tous ({searchResults.length})
            </button>
            {groupedResults.palos.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('palos')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                  activeCategoryFilter === 'palos'
                    ? 'bg-[#e5a93b] text-[#121110]'
                    : 'text-[#8c8173] hover:text-[#f4efe6] bg-[#221c17]'
                }`}
              >
                Palos ({groupedResults.palos.length})
              </button>
            )}
            {groupedResults.videos.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('videos')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                  activeCategoryFilter === 'videos'
                    ? 'bg-[#e5a93b] text-[#121110]'
                    : 'text-[#8c8173] hover:text-[#f4efe6] bg-[#221c17]'
                }`}
              >
                Vidéos ({groupedResults.videos.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(false)}
              className="text-[#e5a93b] hover:underline cursor-pointer text-xs ml-1"
            >
              Fermer
            </button>
          </div>
        </div>

        {searchResults.length === 0 ? (
          <div className="text-center py-6 text-xs sm:text-sm text-[#8c8173]">
            Aucun résultat ne correspond à votre recherche. Essayez avec un nom de palo (ex: <span className="text-[#e5a93b]">Farruca</span>, <span className="text-[#e5a93b]">Soleá</span>, <span className="text-[#e5a93b]">Bulerías</span>), un mot de danse (<span className="text-[#e5a93b]">Zapateado</span>, <span className="text-[#e5a93b]">Marcaje</span>), ou un terme du lexique.
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* 1. PALOS & DOSSIERS */}
            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'palos') && groupedResults.palos.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8c8173] flex items-center gap-1.5 px-1">
                  <Folder className="w-3.5 h-3.5 text-[#e5a93b]" />
                  <span>Palos & Dossiers ({groupedResults.palos.length})</span>
                </div>
                <div className="space-y-1">
                  {groupedResults.palos.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#1b1713] hover:bg-[#251f18] border border-[#2d241c] hover:border-[#e5a93b]/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="select-none shrink-0" title={item.discipline === 'danse' ? 'Danse' : 'Guitare'}>
                          {item.discipline === 'danse' ? (
                            <FlamencoBailaoraIcon className="w-4 h-4 inline-block shrink-0" />
                          ) : (
                            <FlamencoGuitaristeIcon className="w-4 h-4 inline-block shrink-0" />
                          )}
                        </span>
                        <Folder className="w-3.5 h-3.5 text-[#e5a93b]" shrink-0 />
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors truncate block">
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="text-[10px] sm:text-[11px] text-[#8c8173] truncate block">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#8c8173] group-hover:text-[#e5a93b] shrink-0">
                        <span>Ouvrir</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. VIDÉOS & DÉMONSTRATIONS */}
            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'videos') && groupedResults.videos.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8c8173] flex items-center gap-1.5 px-1">
                  <Film className="w-3.5 h-3.5 text-[#e5a93b]" />
                  <span>Vidéos & Pratiques ({groupedResults.videos.length})</span>
                </div>
                <div className="space-y-1">
                  {groupedResults.videos.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#1b1713] hover:bg-[#251f18] border border-[#2d241c] hover:border-[#e5a93b]/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="select-none shrink-0" title={item.discipline === 'danse' ? 'Danse' : 'Guitare'}>
                          {item.discipline === 'danse' ? (
                            <FlamencoBailaoraIcon className="w-4 h-4 inline-block shrink-0" />
                          ) : (
                            <FlamencoGuitaristeIcon className="w-4 h-4 inline-block shrink-0" />
                          )}
                        </span>
                        <Film className="w-3.5 h-3.5 text-[#e5a93b]" shrink-0 />
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors truncate block">
                            {item.title}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-[#8c8173] truncate block">
                            {item.paloName} • {item.sectionName} {item.subtitle ? `• ${item.subtitle}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] font-bold text-xs transition-all shadow-sm cursor-pointer"
                          title="Lire la vidéo"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Lire</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. TEXTES & LETRAS */}
            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'textes') && groupedResults.textes.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8c8173] flex items-center gap-1.5 px-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#e5a93b]" />
                  <span>Letras & Chant ({groupedResults.textes.length})</span>
                </div>
                <div className="space-y-1">
                  {groupedResults.textes.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#1b1713] hover:bg-[#251f18] border border-[#2d241c] hover:border-[#e5a93b]/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FlamencoCantaorIcon className="w-4 h-4 inline-block shrink-0" />
                        <BookOpen className="w-3.5 h-3.5 text-[#e5a93b]" shrink-0 />
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors truncate block">
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="text-[10px] sm:text-[11px] text-[#8c8173] italic truncate block">
                              « {item.subtitle} »
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#8c8173] group-hover:text-[#e5a93b] shrink-0">
                        <span>Consulter</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TERMES DU LEXIQUE */}
            {(activeCategoryFilter === 'all' || activeCategoryFilter === 'lexique') && groupedResults.lexique.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8c8173] flex items-center gap-1.5 px-1">
                  <span className="text-sm select-none">💡</span>
                  <span>Lexique Flamenco ({groupedResults.lexique.length})</span>
                </div>
                <div className="space-y-1">
                  {groupedResults.lexique.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#1b1713] hover:bg-[#251f18] border border-[#2d241c] hover:border-[#e5a93b]/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base select-none shrink-0">{item.lexiqueTerm?.icon || '📖'}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors truncate">
                              {item.title}
                            </span>
                            {item.subtitle && (
                              <span className="text-[10px] text-[#8c8173] px-1.5 py-0.5 rounded bg-[#241c15] border border-[#382d22]">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <span className="text-[10px] sm:text-[11px] text-[#a69c8f] truncate block">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#8c8173] group-hover:text-[#e5a93b] shrink-0">
                        <span>Voir définition</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <header 
      className="sticky top-0 z-40 bg-[#141210]/95 backdrop-blur-md border-b border-[#2d251d] px-2 xs:px-3 sm:px-6 py-2 xs:py-2.5 sm:py-3.5 transition-colors shadow-lg"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))' }}
    >
      <div className="max-w-5xl mx-auto space-y-2 sm:space-y-3">
        {/* ========================================================================= */}
        {/* 1. LIGNE SUPÉRIEURE : Titre COFLAM APP & 3 Disciplines (Cante, Guitarra, Baile) */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-1.5 xs:gap-2 sm:gap-4">
          {/* Gauche : Logo COFLAM APP et nom du fichier actif en dessous */}
          <div className="flex flex-col justify-center min-w-0">
            <div 
              onClick={onNavigateHome}
              role={onNavigateHome ? "button" : undefined}
              tabIndex={onNavigateHome ? 0 : undefined}
              className={`min-w-0 flex flex-col justify-center shrink-0 ${onNavigateHome ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
              title={onNavigateHome ? "Retourner à l'accueil" : undefined}
            >
              <h1 
                className="text-xs sm:text-sm font-bold uppercase tracking-wider leading-tight select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                <span className="block text-white font-bold uppercase tracking-wider leading-none">
                  COFLAM
                </span>
                <span className="block text-[#e5a93b] font-bold uppercase tracking-wider text-[9px] xs:text-[10px] sm:text-xs leading-none mt-0.5">
                  APP
                </span>
              </h1>
              {subtitle && (
                <p className="text-[9px] sm:text-xs text-[#a69c8f] truncate font-sans mt-0.5 max-w-[90px] xs:max-w-[140px] sm:max-w-none">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Fichier actif temporaire (affiché en dessous de COFLAM APP) */}
            {activeFileName && (
              <div 
                className="mt-1 px-1.5 sm:px-2 py-0.5 rounded bg-[#221a13] border border-[#e5a93b]/70 text-[#e5a93b] font-mono text-[9px] sm:text-xs font-bold tracking-tight shadow-md flex items-center gap-1 w-fit whitespace-nowrap"
                title={`Fichier correspondant à la page actuelle : ${activeFileName}`}
              >
                <span className="text-[10px] sm:text-xs opacity-80 select-none">📄</span>
                <span>{activeFileName}</span>
              </div>
            )}
          </div>

          {/* Droite : Les 3 disciplines permanentes (Cante, Guitarra, Baile) parfaitement visibles sur mobile */}
          <div className="flex items-center bg-[#17130f] p-0.5 xs:p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-[#3e3124] shadow-md gap-0.5 xs:gap-1 sm:gap-1.5 shrink-0">
            {/* 1. Cante (Chant flamenco) */}
            <button
              type="button"
              onClick={() => onToggleDiscipline('chant')}
              className={`px-1.5 xs:px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] xs:text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1 xs:gap-1.5 sm:gap-2 ${
                discipline === 'chant'
                  ? 'bg-[#e5a93b] text-[#121110] shadow-md font-extrabold ring-1 ring-[#f5b84c]'
                  : 'text-[#a89c8d] hover:text-white hover:bg-[#251e17]'
              }`}
              title="Cante flamenco"
            >
              <FlamencoCantaorIcon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 shrink-0 rounded-full shadow-sm" />
              <span className="font-bold tracking-tight xs:tracking-wide">Cante</span>
            </button>

            {/* 2. Guitarra (Guitare flamenca) */}
            <button
              type="button"
              onClick={() => onToggleDiscipline('guitare')}
              className={`px-1.5 xs:px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] xs:text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1 xs:gap-1.5 sm:gap-2 ${
                discipline === 'guitare'
                  ? 'bg-[#e5a93b] text-[#121110] shadow-md font-extrabold ring-1 ring-[#f5b84c]'
                  : 'text-[#a89c8d] hover:text-white hover:bg-[#251e17]'
              }`}
              title="Guitarra flamenca"
            >
              <FlamencoGuitaristeIcon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 shrink-0 rounded-full shadow-sm" />
              <span className="font-bold tracking-tight xs:tracking-wide">Guitarra</span>
            </button>

            {/* 3. Baile (Danse flamenca) */}
            <button
              type="button"
              onClick={() => onToggleDiscipline('danse')}
              className={`px-1.5 xs:px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] xs:text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1 xs:gap-1.5 sm:gap-2 ${
                discipline === 'danse'
                  ? 'bg-[#e5a93b] text-[#121110] shadow-md font-extrabold ring-1 ring-[#f5b84c]'
                  : 'text-[#a89c8d] hover:text-white hover:bg-[#251e17]'
              }`}
              title="Baile flamenco"
            >
              <FlamencoBailaoraIcon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 shrink-0 rounded-full shadow-sm" />
              <span className="font-bold tracking-tight xs:tracking-wide">Baile</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUR LES PAGES DANSE (DansePaloList & DansePaloDetail) :                    */}
        {/* Suppression de : compas, arborescence, lexique, plein écran                */}
        {/* Uniquement : recherche avec la loupe (à gauche de Mes Études) + Mes Études + Cloud */}
        {/* ========================================================================= */}
        {discipline === 'danse' ? (
          <div ref={searchContainerRef} className="relative pt-0.5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {canGoBack && (
                <button
                  id="header-back-btn"
                  onClick={onBack}
                  className="flex items-center gap-1 xs:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#282119] hover:bg-[#362b20] active:scale-95 text-[#e5a93b] text-xs sm:text-sm font-bold transition-all cursor-pointer border border-[#e5a93b]/70 hover:border-[#e5a93b] shadow-md shrink-0 h-[38px] sm:h-[40px]"
                  title={backButtonLabel ? `Retourner vers : ${backButtonLabel}` : "Retourner à la vue précédente"}
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span className="inline font-bold">{backButtonLabel || 'Retour'}</span>
                </button>
              )}

              {/* Recherche avec la loupe (remontée à gauche de Mes Études) */}
              <div className="relative flex-1 flex items-center min-w-0">
                <input
                  ref={searchInputRef}
                  id="header-universal-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (searchTerm.trim()) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  placeholder="Rechercher un palo, une vidéo, une letra, un compás..."
                  className="w-full bg-[#181410] border-2 border-[#3e3123] focus:border-[#e5a93b] focus:ring-2 focus:ring-[#e5a93b]/30 rounded-xl sm:rounded-2xl pl-3.5 sm:pl-4 pr-14 sm:pr-16 py-1.5 sm:py-2 text-xs sm:text-sm text-[#f4efe6] placeholder-[#948676] outline-none transition-all shadow-md hover:border-[#52412e] h-[38px] sm:h-[40px]"
                />

                {/* Loupe & bouton effacer */}
                <div className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-auto">
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setIsDropdownOpen(false);
                      }}
                      className="p-1 rounded-lg text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
                      title="Effacer la recherche"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                  <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#e5a93b] pointer-events-none drop-shadow-sm shrink-0" />
                </div>
              </div>

              {/* Mes Études */}
              <button
                id="header-favorites-btn"
                onClick={onOpenFavorites}
                className="relative px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#211b16] hover:bg-[#2d251d] text-[#d4c9ba] hover:text-[#e5a93b] text-xs font-medium transition-colors cursor-pointer border border-[#382e24] flex items-center gap-1.5 shrink-0 h-[38px] sm:h-[40px]"
                title="Mes chorégraphies et études de danse"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#e5a93b]" />
                <span className="text-[11px] sm:text-xs">Mes Études</span>
                {favoritesCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-[#121110] bg-[#e5a93b] rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Cloud */}
              {onOpenCloudSync && (
                <button
                  id="header-cloud-sync-btn"
                  onClick={onOpenCloudSync}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border shadow-sm shrink-0 h-[38px] sm:h-[40px] ${
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
            </div>

            {/* Panneau déroulant flottant des résultats de recherche sous la barre */}
            {renderSearchDropdown()}
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* 2. LIGNE INTERMÉDIAIRE : OUTILS & ACTIONS COMMUNES (POUR LES AUTRES DISCIPLINES) */}
            {/* ========================================================================= */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 pt-0.5 overflow-x-auto no-scrollbar">
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

              {/* Fullscreen Toggle */}
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

            {/* ========================================================================= */}
            {/* 3. LIGNE INFÉRIEURE : RETOUR + CHAMP DE RECHERCHE AVEC LOUPE À DROITE     */}
            {/* ========================================================================= */}
            <div ref={searchContainerRef} className="relative pt-0.5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {canGoBack && (
                  <button
                    id="header-back-btn"
                    onClick={onBack}
                    className="flex items-center gap-1 xs:gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#282119] hover:bg-[#362b20] active:scale-95 text-[#e5a93b] text-xs sm:text-sm font-bold transition-all cursor-pointer border border-[#e5a93b]/70 hover:border-[#e5a93b] shadow-md shrink-0 h-[40px] sm:h-[44px]"
                    title={backButtonLabel ? `Retourner vers : ${backButtonLabel}` : "Retourner à la vue précédente"}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                    <span className="inline font-bold">{backButtonLabel || 'Retour'}</span>
                  </button>
                )}

                <div className="relative flex-1 flex items-center">
                  <input
                    ref={searchInputRef}
                    id="header-universal-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (searchTerm.trim()) {
                        setIsDropdownOpen(true);
                      }
                    }}
                    placeholder="Rechercher un palo, une vidéo, une letra, un compás, un terme..."
                    className="w-full bg-[#181410] border-2 border-[#3e3123] focus:border-[#e5a93b] focus:ring-2 focus:ring-[#e5a93b]/30 rounded-xl sm:rounded-2xl pl-3.5 sm:pl-4 pr-16 sm:pr-20 py-2 sm:py-2.5 text-xs sm:text-sm text-[#f4efe6] placeholder-[#948676] outline-none transition-all shadow-md hover:border-[#52412e] h-[40px] sm:h-[44px]"
                  />

                  {/* Loupe déplacée à droite & bouton d'effacement */}
                  <div className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-auto">
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setIsDropdownOpen(false);
                        }}
                        className="p-1 rounded-lg text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
                        title="Effacer la recherche"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    )}
                    <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#e5a93b] pointer-events-none drop-shadow-sm shrink-0" />
                  </div>
                </div>
              </div>

              {/* Panneau déroulant flottant des résultats de recherche sous la barre */}
              {renderSearchDropdown()}
            </div>
          </>
        )}


      </div>
    </header>
  );
};
