import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ArrowRight, Lightbulb, UploadCloud, CheckCircle2, Sparkles, Compass, List, LayoutGrid, Play, Video as VideoIcon, Film, Folder, FolderOpen, ArrowDownAZ, ArrowUpAZ, ArrowUpDown } from 'lucide-react';
import { VideoItem } from '../types';
import { extractYouTubeInfo } from '../utils/storage';

export interface DanseArborescenceTreeProps {
  onNavigate?: (key: 'structure' | 'maitres' | 'letras' | 'compas' | 'cours' | 'montages') => void;
  onOpenBibliotheque?: () => void;
  onOpenLexique?: () => void;
  defaultExpanded?: boolean;
  initialOpenFolder?: 'biblio' | 'studio' | null;
  title?: React.ReactNode;
  translucent?: boolean;
  borderedFolders?: boolean;
  counts?: {
    maitres?: number;
    cours?: number;
    letras?: number;
    montages?: number;
    structure?: number;
    compas?: string;
  };
  maitresVideos?: VideoItem[];
  coursVideos?: VideoItem[];
  onPlayVideo?: (video: VideoItem, sectionTitle: string) => void;
  bottomContent?: React.ReactNode;
}

export const DanseArborescenceTree: React.FC<DanseArborescenceTreeProps> = ({
  onNavigate,
  onOpenLexique,
  defaultExpanded = false,
  initialOpenFolder = null,
  title,
  translucent = false,
  borderedFolders = false,
  counts,
  maitresVideos,
  coursVideos,
  onPlayVideo,
  bottomContent
}) => {
  // Mode d'affichage des médias dans les dossiers de l'arbre
  const [treeMaitresViewMode, setTreeMaitresViewMode] = useState<'list' | 'icons'>('list');
  const [treeCoursViewMode, setTreeCoursViewMode] = useState<'list' | 'icons'>('list');
  const [treeSortOrder, setTreeSortOrder] = useState<'default' | 'alpha-asc' | 'alpha-desc'>('default');

  const toggleTreeSort = () => {
    setTreeSortOrder(prev => prev === 'default' ? 'alpha-asc' : prev === 'alpha-asc' ? 'alpha-desc' : 'default');
  };

  const sortTreeVideos = (videos?: VideoItem[]): VideoItem[] => {
    if (!videos || videos.length === 0) return [];
    if (treeSortOrder === 'default') return videos;
    return [...videos].sort((a, b) => {
      const titleA = (a.title || '').trim();
      const titleB = (b.title || '').trim();
      return treeSortOrder === 'alpha-asc'
        ? titleA.localeCompare(titleB, 'fr', { sensitivity: 'base', numeric: true })
        : titleB.localeCompare(titleA, 'fr', { sensitivity: 'base', numeric: true });
    });
  };

  // État d'ouverture des dossiers (par défaut tous repliés, sauf si explicitement demandé)
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({
    biblio: defaultExpanded || initialOpenFolder === 'biblio',
    maitres: false,
    cours: false,
    letras: false,
    compas: false,
    studio: defaultExpanded || initialOpenFolder === 'studio',
    structure: false,
    carnet: false
  });

  const studioScrollOriginRef = useRef<number | null>(null);
  const studioHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialOpenFolder === 'studio') {
      setOpenFolders(prev => ({ ...prev, studio: true, biblio: false }));
      setTimeout(() => {
        studioHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else if (initialOpenFolder === 'biblio') {
      setOpenFolders(prev => ({ ...prev, biblio: true, studio: false }));
    }
  }, [initialOpenFolder]);

  const [openTips, setOpenTips] = useState<boolean>(false);
  const tipsScrollOriginRef = useRef<number | null>(null);
  const tipsContainerRef = useRef<HTMLDivElement>(null);

  const toggleTips = () => {
    setOpenTips(prev => {
      const nextIsOpen = !prev;
      if (nextIsOpen) {
        tipsScrollOriginRef.current = window.scrollY;
      }
      return nextIsOpen;
    });
  };

  const handleCollapseTips = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetScrollY = tipsScrollOriginRef.current;

    setOpenTips(false);

    const scrollToOrigin = () => {
      if (targetScrollY !== null) {
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      } else if (tipsContainerRef.current) {
        tipsContainerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    };

    requestAnimationFrame(scrollToOrigin);
    setTimeout(scrollToOrigin, 40);
  };

  // Quand defaultExpanded change (ou à la navigation), synchroniser pour que tout soit bien replié
  React.useEffect(() => {
    setOpenFolders({
      biblio: defaultExpanded,
      maitres: false,
      cours: false,
      letras: false,
      compas: false,
      studio: defaultExpanded,
      structure: false,
      carnet: false
    });
  }, [defaultExpanded]);

  const toggleFolder = (key: string) => {
    setOpenFolders(prev => {
      const nextIsOpen = !prev[key];
      if (key === 'studio' && nextIsOpen) {
        studioScrollOriginRef.current = window.scrollY;
      }
      return {
        ...prev,
        [key]: nextIsOpen
      };
    });
  };

  const handleCollapseStudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetScrollY = studioScrollOriginRef.current;

    setOpenFolders(prev => ({
      ...prev,
      studio: false
    }));

    const scrollToOrigin = () => {
      if (targetScrollY !== null) {
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      } else if (studioHeaderRef.current) {
        studioHeaderRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    requestAnimationFrame(() => {
      scrollToOrigin();
    });
    setTimeout(() => {
      scrollToOrigin();
    }, 40);
  };

  return (
    <div className={`rounded-2xl border p-4 sm:p-6 shadow-2xl relative space-y-4 transition-all duration-200 ${
      translucent
        ? 'bg-black/15 border-[#382d22] shadow-black/80'
        : 'bg-[#0f0d0b] border-[#382d22]'
    }`}>
      {/* Contrôle supérieur : Titre d'invitation au travail */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#2b2118]/80 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Sparkles className="w-4 h-4 text-[#e5a93b] shrink-0" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#e5a93b] font-sans break-words whitespace-normal leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {title ?? "Commencer à travailler, explorer et créer"}
          </span>
        </div>
      </div>

      {/* ARBRE DES DOSSIERS AVEC BRANCHES VISUELLES */}
      <div className="relative pl-1 sm:pl-2 space-y-4 font-sans text-xs sm:text-sm">
        
        {/* ========================================================================= */}
        {/* DEUX CARRÉS L'UN À CÔTÉ DE L'AUTRE : MÉDIATHÈQUE FLAMENCA & ATELIER DE CRÉATION */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 select-none">
          {/* CARRÉ GAUCHE : MÉDIATHÈQUE FLAMENCA SUR DEUX LIGNES */}
          <div
            onClick={() => toggleFolder('biblio')}
            className={`rounded-2xl transition-all p-3 sm:p-4 md:p-5 flex flex-col items-center justify-center text-center cursor-pointer relative shadow-lg group aspect-square ${
              openFolders['biblio']
                ? 'border-2 border-emerald-400 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.22)]'
                : 'border border-[#382d22] hover:border-emerald-500/60 bg-[#141210]/90 hover:bg-[#1a1714]'
            }`}
            title={openFolders['biblio'] ? 'Replier Médiathèque Flamenca' : 'Déplier Médiathèque Flamenca'}
          >
            <h4 className="font-serif text-xs sm:text-base md:text-lg font-bold text-[#86efac] leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              MÉDIATHÈQUE<br />FLAMENCA
            </h4>

            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded bg-[#86efac]/20 text-[#bbf7d0] font-medium border border-[#86efac]/30 mt-1.5 hidden xs:inline">
              Ressources & Références
            </span>

            <div className="flex items-center gap-1 mt-1.5 text-[#8c8173] group-hover:text-[#86efac] text-[10px] sm:text-[11px] font-medium transition-colors">
              <span>{openFolders['biblio'] ? 'Replier' : 'Déplier'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openFolders['biblio'] ? 'rotate-180 text-[#86efac]' : ''
                }`}
              />
            </div>
          </div>

          {/* CARRÉ DROITE : ATELIER DE CRÉATION SUR DEUX LIGNES */}
          <div
            ref={studioHeaderRef}
            onClick={() => toggleFolder('studio')}
            className={`rounded-2xl transition-all p-3 sm:p-4 md:p-5 flex flex-col items-center justify-center text-center cursor-pointer relative shadow-lg group aspect-square ${
              openFolders['studio']
                ? 'border-2 border-blue-400 bg-blue-950/40 shadow-[0_0_15px_rgba(59,130,246,0.22)]'
                : 'border border-[#382d22] hover:border-blue-500/60 bg-[#141210]/90 hover:bg-[#1a1714]'
            }`}
            title={openFolders['studio'] ? "Replier l'Atelier de création" : "Déplier l'Atelier de création"}
          >
            <h4 className="font-serif text-xs sm:text-base md:text-lg font-bold text-[#60a5fa] leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              ATELIER<br />DE CRÉATION
            </h4>

            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded bg-[#60a5fa]/20 text-[#93c5fd] font-medium border border-[#60a5fa]/30 mt-1.5 hidden xs:inline">
              Danse & Chorégraphie
            </span>

            <div className="flex items-center gap-1 mt-1.5 text-[#8c8173] group-hover:text-[#60a5fa] text-[10px] sm:text-[11px] font-medium transition-colors">
              <span>{openFolders['studio'] ? 'Replier' : 'Déplier'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openFolders['studio'] ? 'rotate-180 text-[#60a5fa]' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DÉPLIAGE MÉDIATHÈQUE FLAMENCA (TEXTE EXPLICATIF ET SOUS-DOSSIERS)        */}
        {/* ========================================================================= */}
        {openFolders['biblio'] && (
          <div className="rounded-2xl border-2 border-emerald-500/50 bg-[#12100d] p-3.5 sm:p-5 shadow-2xl space-y-4 animate-in fade-in duration-200">
            {/* Barre d'en-tête du dépliage */}
            <div className="flex items-center justify-between pb-2 border-b border-[#2b2118]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                <span className="font-serif text-xs sm:text-sm font-bold text-[#86efac]">
                  Médiathèque Flamenca
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#86efac]/20 text-[#bbf7d0] font-medium border border-[#86efac]/30 hidden xs:inline">
                  Ressources & Références
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFolder('biblio')}
                className="text-xs text-[#8c8173] hover:text-[#86efac] flex items-center gap-1 cursor-pointer"
              >
                <span>Fermer</span>
                <ChevronUp className="w-3.5 h-3.5 text-[#86efac]" />
              </button>
            </div>

            {/* Instructions du dossier Médiathèque Flamenca */}
            <div className="px-3.5 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-[#ded3c5] leading-relaxed">
              <p>
                C'est la base de votre travail. Commencez sans attendre à alimenter votre médiathèque, palo par palo, en y classant vos sources de référence : Grands Maîtres, cours et stages, letras poétiques et compás.
              </p>
            </div>

            {/* SOUS-DOSSIERS DE LA MÉDIATHÈQUE FLAMENCA */}
            <div className="ml-2 sm:ml-5 pl-3 sm:pl-5 border-l-2 border-[#382d22] space-y-3 pt-1">
              
              {/* --- SOUS-DOSSIER : GRANDS MAÎTRES --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#382d22]" />

                <div className="rounded-xl bg-[#171310] border border-[#2b2118] hover:border-[#4a3a2a] overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('maitres');
                      } else {
                        toggleFolder('maitres');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1c1713] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {borderedFolders && (
                        openFolders['maitres'] ? (
                          <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-emerald-400 shrink-0" />
                        )
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#86efac] group-hover:text-white transition-colors">
                            Grands maîtres
                          </span>
                          {counts?.maitres !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#86efac]/15 text-[#86efac] border border-[#86efac]/30 font-medium">
                              {counts.maitres} média{counts.maitres > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('maitres');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#86efac]/15 hover:bg-[#86efac] text-[#86efac] hover:text-[#0b1710] border border-[#86efac]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder aux Grands Maîtres"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('maitres');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#86efac] hover:bg-[#86efac]/10 transition-colors cursor-pointer"
                        title={openFolders['maitres'] ? "Masquer les vidéos" : "Voir les vidéos"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['maitres'] ? 'rotate-180 text-[#86efac]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['maitres'] && (
                    <div className="px-3 sm:px-4 pb-3.5 pt-2 border-t border-[#2b2118] bg-[#120f0d] space-y-3 animate-in fade-in duration-150">
                      <p className="text-xs text-[#a69c8f] leading-relaxed">
                        Interprétations de référence pour nourrir le regard, la posture et l'énergie du baile.
                      </p>

                      {/* Commutateur de vue : Liste minimaliste (nom seul) / Icônes (vignette & nom) */}
                      {maitresVideos && maitresVideos.length > 0 && (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#241c15]">
                          <span className="text-[11px] text-[#8c8173] font-medium">
                            {maitresVideos.length} interprétation{maitresVideos.length > 1 ? 's' : ''} disponible{maitresVideos.length > 1 ? 's' : ''} :
                          </span>
                          <div className="flex items-center rounded-lg bg-[#181410] p-0.5 border border-[#2b2118]">
                            <button
                              type="button"
                              onClick={() => setTreeMaitresViewMode('list')}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                treeMaitresViewMode === 'list'
                                  ? 'bg-[#86efac] text-[#0b1710] font-bold shadow-xs'
                                  : 'text-[#8c8173] hover:text-[#f4efe6]'
                              }`}
                              title="Affichage liste (seulement les noms)"
                            >
                              <List className="w-3 h-3" />
                              <span>Liste</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setTreeMaitresViewMode('icons')}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                treeMaitresViewMode === 'icons'
                                  ? 'bg-[#86efac] text-[#0b1710] font-bold shadow-xs'
                                  : 'text-[#8c8173] hover:text-[#f4efe6]'
                              }`}
                              title="Affichage icônes (vignettes & noms)"
                            >
                              <LayoutGrid className="w-3 h-3" />
                              <span>Icônes</span>
                            </button>
                            <div className="w-px h-3 bg-[#2b2118] mx-0.5" />
                            <button
                              type="button"
                              onClick={toggleTreeSort}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                treeSortOrder !== 'default'
                                  ? 'bg-[#86efac] text-[#0b1710] font-bold shadow-xs'
                                  : 'text-[#8c8173] hover:text-[#f4efe6]'
                              }`}
                              title={
                                treeSortOrder === 'alpha-asc'
                                  ? "Tri alphabétique A → Z actif (cliquer pour Z → A)"
                                  : treeSortOrder === 'alpha-desc'
                                  ? "Tri alphabétique Z → A actif (cliquer pour ordre initial)"
                                  : "Trier par ordre alphabétique A-Z"
                              }
                            >
                              {treeSortOrder === 'alpha-asc' ? (
                                <>
                                  <ArrowDownAZ className="w-3 h-3" />
                                  <span>A-Z</span>
                                </>
                              ) : treeSortOrder === 'alpha-desc' ? (
                                <>
                                  <ArrowUpAZ className="w-3 h-3" />
                                  <span>Z-A</span>
                                </>
                              ) : (
                                <>
                                  <ArrowUpDown className="w-3 h-3" />
                                  <span>A-Z</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* VUE 1 : LISTE MINIMALISTE (SEULEMENT LES NOMS) */}
                      {maitresVideos && maitresVideos.length > 0 && treeMaitresViewMode === 'list' && (
                        <div className="space-y-1">
                          {sortTreeVideos(maitresVideos).map((video) => (
                            <div
                              key={video.id}
                              onClick={() => {
                                if (onPlayVideo) {
                                  onPlayVideo(video, 'Grands Maîtres');
                                } else if (onNavigate) {
                                  onNavigate('maitres');
                                }
                              }}
                              className="group/item flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg bg-[#181410] hover:bg-[#221c16] border border-[#261f18] hover:border-[#86efac]/60 transition-all cursor-pointer select-none"
                              title="Cliquer pour visionner et travailler cette vidéo"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-5 h-5 rounded-md bg-[#221c16] group-hover/item:bg-[#86efac] text-[#86efac] group-hover/item:text-[#0b1710] flex items-center justify-center shrink-0 transition-colors">
                                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                </div>
                                <span className="text-xs font-semibold text-[#ded3c5] group-hover/item:text-[#86efac] transition-colors truncate">
                                  {video.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#8c8173] group-hover/item:text-[#ded3c5] shrink-0 font-medium">
                                Visionner ›
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* VUE 2 : GRILLE D'ICÔNES (VIGNETTES AVEC NOM EN DESSOUS) */}
                      {maitresVideos && maitresVideos.length > 0 && treeMaitresViewMode === 'icons' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {sortTreeVideos(maitresVideos).map((video) => {
                            const ytInfo = extractYouTubeInfo(video.url);
                            const thumbUrl = ytInfo.videoId ? `https://img.youtube.com/vi/${ytInfo.videoId}/mqdefault.jpg` : null;

                            return (
                              <div
                                key={video.id}
                                onClick={() => {
                                  if (onPlayVideo) {
                                    onPlayVideo(video, 'Grands Maîtres');
                                  } else if (onNavigate) {
                                    onNavigate('maitres');
                                  }
                                }}
                                className="group/thumb flex flex-col p-2 rounded-lg bg-[#181410] hover:bg-[#221c16] border border-[#261f18] hover:border-[#86efac]/70 transition-all cursor-pointer shadow-xs select-none"
                                title="Cliquer pour visionner cette vidéo"
                              >
                                <div className="relative w-full aspect-video rounded overflow-hidden bg-black/60 border border-[#2e261e] mb-1.5 flex items-center justify-center">
                                  {thumbUrl ? (
                                    <img
                                      src={thumbUrl}
                                      alt={video.title}
                                      className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Film className="w-6 h-6 text-[#86efac]/50" />
                                  )}
                                  <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/15 transition-colors flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-[#86efac] text-[#0b1710] flex items-center justify-center shadow">
                                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[11px] font-semibold text-[#ded3c5] group-hover/thumb:text-[#86efac] line-clamp-2 leading-tight text-center font-serif">
                                  {video.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {(!maitresVideos || maitresVideos.length === 0) && (
                        <p className="text-xs text-[#8c8173] italic">
                          Consultez l'espace complet pour voir toutes les versions.
                        </p>
                      )}

                      {onNavigate && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('maitres')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#86efac] hover:bg-[#a7f3d0] text-[#0b1710] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir l'espace Grands Maîtres</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- SOUS-DOSSIER : COURS ET STAGES --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#382d22]" />

                <div className="rounded-xl bg-[#171310] border border-[#2b2118] hover:border-[#4a3a2a] overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('cours');
                      } else {
                        toggleFolder('cours');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1c1713] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {borderedFolders && (
                        openFolders['cours'] ? (
                          <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-emerald-400 shrink-0" />
                        )
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#86efac] group-hover:text-white transition-colors">
                            Cours et stages
                          </span>
                          {counts?.cours !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#86efac]/15 text-[#86efac] border border-[#86efac]/30 font-medium">
                              {counts.cours} vidéo{counts.cours > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('cours');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#86efac]/15 hover:bg-[#86efac] text-[#86efac] hover:text-[#0b1710] border border-[#86efac]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder aux Cours et Stages"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('cours');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#86efac] hover:bg-[#86efac]/10 transition-colors cursor-pointer"
                        title={openFolders['cours'] ? "Masquer les vidéos" : "Voir les vidéos"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['cours'] ? 'rotate-180 text-[#86efac]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['cours'] && (
                    <div className="px-3 sm:px-4 pb-3.5 pt-2 border-t border-[#2b2118] bg-[#120f0d] space-y-3 animate-in fade-in duration-150">
                      <p className="text-xs text-[#a69c8f] leading-relaxed">
                        Ajoutez vos vidéos de cours, stages et entraînements personnels pour travailler pas à pas.
                      </p>

                      {/* Commutateur de vue pour les cours : Liste (nom seul) / Icônes */}
                      {coursVideos && coursVideos.length > 0 && (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#241c15]">
                          <span className="text-[11px] text-[#8c8173] font-medium">
                            {coursVideos.length} vidéo{coursVideos.length > 1 ? 's' : ''} personnelle{coursVideos.length > 1 ? 's' : ''} :
                          </span>
                          <div className="flex items-center rounded-lg bg-[#181410] p-0.5 border border-[#2b2118]">
                            <button
                              type="button"
                              onClick={() => setTreeCoursViewMode('list')}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                treeCoursViewMode === 'list'
                                  ? 'bg-[#86efac] text-[#0b1710] font-bold shadow-xs'
                                  : 'text-[#8c8173] hover:text-[#f4efe6]'
                              }`}
                              title="Affichage liste (seulement les noms)"
                            >
                              <List className="w-3 h-3" />
                              <span>Liste</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setTreeCoursViewMode('icons')}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                treeCoursViewMode === 'icons'
                                  ? 'bg-[#86efac] text-[#0b1710] font-bold shadow-xs'
                                  : 'text-[#8c8173] hover:text-[#f4efe6]'
                              }`}
                              title="Affichage icônes (vignettes & noms)"
                            >
                              <LayoutGrid className="w-3 h-3" />
                              <span>Icônes</span>
                            </button>
                            <div className="w-px h-3 bg-[#2b2118] mx-0.5" />
                            <button
                              type="button"
                              onClick={toggleTreeSort}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                treeSortOrder !== 'default'
                                  ? 'bg-[#86efac] text-[#0b1710] font-bold shadow-xs'
                                  : 'text-[#8c8173] hover:text-[#f4efe6]'
                              }`}
                              title={
                                treeSortOrder === 'alpha-asc'
                                  ? "Tri alphabétique A → Z actif (cliquer pour Z → A)"
                                  : treeSortOrder === 'alpha-desc'
                                  ? "Tri alphabétique Z → A actif (cliquer pour ordre initial)"
                                  : "Trier par ordre alphabétique A-Z"
                              }
                            >
                              {treeSortOrder === 'alpha-asc' ? (
                                <>
                                  <ArrowDownAZ className="w-3 h-3" />
                                  <span>A-Z</span>
                                </>
                              ) : treeSortOrder === 'alpha-desc' ? (
                                <>
                                  <ArrowUpAZ className="w-3 h-3" />
                                  <span>Z-A</span>
                                </>
                              ) : (
                                <>
                                  <ArrowUpDown className="w-3 h-3" />
                                  <span>A-Z</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* VUE 1 : LISTE MINIMALISTE DES COURS (SEULEMENT LES NOMS) */}
                      {coursVideos && coursVideos.length > 0 && treeCoursViewMode === 'list' && (
                        <div className="space-y-1">
                          {sortTreeVideos(coursVideos).map((video) => (
                            <div
                              key={video.id}
                              onClick={() => {
                                if (onPlayVideo) {
                                  onPlayVideo(video, 'Mes Cours & Stages');
                                } else if (onNavigate) {
                                  onNavigate('cours');
                                }
                              }}
                              className="group/item flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg bg-[#181410] hover:bg-[#221c16] border border-[#261f18] hover:border-[#86efac]/60 transition-all cursor-pointer select-none"
                              title="Cliquer pour visionner et travailler cette vidéo"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-5 h-5 rounded-md bg-[#221c16] group-hover/item:bg-[#86efac] text-[#86efac] group-hover/item:text-[#0b1710] flex items-center justify-center shrink-0 transition-colors">
                                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                </div>
                                <span className="text-xs font-semibold text-[#ded3c5] group-hover/item:text-[#86efac] transition-colors truncate">
                                  {video.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#8c8173] group-hover/item:text-[#ded3c5] shrink-0 font-medium">
                                Visionner ›
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* VUE 2 : GRILLE D'ICÔNES DES COURS (VIGNETTES AVEC NOM EN DESSOUS) */}
                      {coursVideos && coursVideos.length > 0 && treeCoursViewMode === 'icons' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {sortTreeVideos(coursVideos).map((video) => {
                            const ytInfo = extractYouTubeInfo(video.url);
                            const thumbUrl = ytInfo.videoId ? `https://img.youtube.com/vi/${ytInfo.videoId}/mqdefault.jpg` : null;

                            return (
                              <div
                                key={video.id}
                                onClick={() => {
                                  if (onPlayVideo) {
                                    onPlayVideo(video, 'Mes Cours & Stages');
                                  } else if (onNavigate) {
                                    onNavigate('cours');
                                  }
                                }}
                                className="group/thumb flex flex-col p-2 rounded-lg bg-[#181410] hover:bg-[#221c16] border border-[#261f18] hover:border-[#86efac]/70 transition-all cursor-pointer shadow-xs select-none"
                                title="Cliquer pour visionner cette vidéo"
                              >
                                <div className="relative w-full aspect-video rounded overflow-hidden bg-black/60 border border-[#2e261e] mb-1.5 flex items-center justify-center">
                                  {thumbUrl ? (
                                    <img
                                      src={thumbUrl}
                                      alt={video.title}
                                      className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Film className="w-6 h-6 text-[#86efac]/50" />
                                  )}
                                  <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/15 transition-colors flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-[#86efac] text-[#0b1710] flex items-center justify-center shadow">
                                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[11px] font-semibold text-[#ded3c5] group-hover/thumb:text-[#86efac] line-clamp-2 leading-tight text-center font-serif">
                                  {video.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {(!coursVideos || coursVideos.length === 0) && (
                        <p className="text-xs text-[#8c8173] italic">
                          Aucune vidéo ajoutée pour l'instant. Ajoutez vos vidéos dans l'espace complet.
                        </p>
                      )}

                      {onNavigate && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('cours')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#86efac] hover:bg-[#a7f3d0] text-[#0b1710] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir l'espace Cours & Stages</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- SOUS-DOSSIER : LETRAS --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#382d22]" />

                <div className="rounded-xl bg-[#171310] border border-[#2b2118] hover:border-[#4a3a2a] overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('letras');
                      } else {
                        toggleFolder('letras');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1c1713] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {borderedFolders && (
                        openFolders['letras'] ? (
                          <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-emerald-400 shrink-0" />
                        )
                      )}
                      <div className="min-w-0">
                        <span className="font-serif text-xs sm:text-sm font-bold text-[#86efac] group-hover:text-white transition-colors">
                          Letras
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('letras');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#86efac]/15 hover:bg-[#86efac] text-[#86efac] hover:text-[#0b1710] border border-[#86efac]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder aux Letras"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('letras');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#86efac] hover:bg-[#86efac]/10 transition-colors cursor-pointer"
                        title={openFolders['letras'] ? "Masquer les détails" : "Voir les détails"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['letras'] ? 'rotate-180 text-[#86efac]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['letras'] && (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-[#ded3c5] leading-relaxed border-t border-[#2b2118] bg-[#120f0d] space-y-2 animate-in fade-in duration-150">
                      <p>
                        Poésie, textes originaux et traductions françaises pour comprendre le sens des vers et marquer le chant avec justesse.
                      </p>
                      {onNavigate && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('letras')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#86efac] hover:bg-[#a7f3d0] text-[#0b1710] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir l'espace Letras</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- SOUS-DOSSIER : COMPÁS --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#382d22]" />

                <div className="rounded-xl bg-[#171310] border border-[#2b2118] hover:border-[#4a3a2a] overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('compas');
                      } else {
                        toggleFolder('compas');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1c1713] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {borderedFolders && (
                        openFolders['compas'] ? (
                          <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-emerald-400 shrink-0" />
                        )
                      )}
                      <div className="min-w-0">
                        <span className="font-serif text-xs sm:text-sm font-bold text-[#86efac] group-hover:text-white transition-colors">
                          Compás
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('compas');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#86efac]/15 hover:bg-[#86efac] text-[#86efac] hover:text-[#0b1710] border border-[#86efac]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder au Compás"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('compas');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#86efac] hover:bg-[#86efac]/10 transition-colors cursor-pointer"
                        title={openFolders['compas'] ? "Masquer les détails" : "Voir les détails"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['compas'] ? 'rotate-180 text-[#86efac]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['compas'] && (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-[#ded3c5] leading-relaxed border-t border-[#2b2118] bg-[#120f0d] space-y-2 animate-in fade-in duration-150">
                      <p>
                        Métronome visuel et sonore (palmas & cajón réels) sur le compás binaire pour répéter et caler le zapateado.
                      </p>
                      {onNavigate && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('compas')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#86efac] hover:bg-[#a7f3d0] text-[#0b1710] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir l'espace Compás</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DÉPLIAGE ATELIER DE CRÉATION (TEXTE EXPLICATIF ET SOUS-DOSSIERS)           */}
        {/* ========================================================================= */}
        {openFolders['studio'] && (
          <div className="rounded-2xl border-2 border-blue-500/50 bg-[#12100d] p-3.5 sm:p-5 shadow-2xl space-y-4 animate-in fade-in duration-200">
            {/* Barre d'en-tête du dépliage */}
            <div className="flex items-center justify-between pb-2 border-b border-[#2b2118]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                <span className="font-serif text-xs sm:text-sm font-bold text-[#60a5fa]">
                  Atelier de création
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#60a5fa]/20 text-[#93c5fd] font-medium border border-[#60a5fa]/30 hidden xs:inline">
                  Danse & Chorégraphie
                </span>
              </div>
              <button
                type="button"
                onClick={handleCollapseStudio}
                className="text-xs text-[#8c8173] hover:text-[#60a5fa] flex items-center gap-1 cursor-pointer"
              >
                <span>Fermer</span>
                <ChevronUp className="w-3.5 h-3.5 text-[#60a5fa]" />
              </button>
            </div>

            {/* Instructions du dossier Atelier de création */}
            <div className="px-3.5 py-2.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-[#ded3c5] leading-relaxed">
              <p>
                L'Atelier de création est votre outil de travail principal. C'est ici que vous structurez votre danse, et que vous reliez les différentes parties à vos médias, grâce à des repères temporels.
              </p>
            </div>

            {/* SOUS-DOSSIERS DE L'ATELIER DE CRÉATION */}
            <div className="ml-2 sm:ml-5 pl-3 sm:pl-5 border-l-2 border-[#382d22] space-y-3 pt-1">
              
              {/* --- SOUS-DOSSIER : STRUCTURE TRADITIONNELLE --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#382d22]" />

                <div className="rounded-xl bg-[#171310] border border-[#2b2118] hover:border-[#4a3a2a] overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('structure');
                      } else {
                        toggleFolder('structure');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1c1713] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {borderedFolders && (
                        openFolders['structure'] ? (
                          <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                        )
                      )}
                      <div className="min-w-0">
                        <span className="font-serif text-xs sm:text-sm font-bold text-[#60a5fa] group-hover:text-[#93c5fd] transition-colors">
                          Structure traditionnelle
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('structure');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#60a5fa]/15 hover:bg-[#60a5fa] text-[#93c5fd] hover:text-[#0b1120] border border-[#60a5fa]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder à la Structure traditionnelle"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('structure');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors cursor-pointer"
                        title={openFolders['structure'] ? "Masquer les détails" : "Voir les détails"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['structure'] ? 'rotate-180 text-[#60a5fa]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['structure'] && (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-[#ded3c5] leading-relaxed border-t border-[#2b2118] bg-[#120f0d] space-y-2.5 animate-in fade-in duration-150">
                      <p className="text-[#f4efe6] leading-relaxed bg-[#1a1511] p-3 rounded-lg border border-[#33261a]">
                        Vous trouverez ici la structure traditionnelle de la danse sur laquelle vous voulez travailler. Cette structure est modifiable. Elle constituera la base de vos montages. Vous pourrez la modifier à nouveau dans chacun de vos montages.
                      </p>
                      {onNavigate && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('structure')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#60a5fa] hover:bg-[#93c5fd] text-[#0b1120] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir la Structure traditionnelle</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- SOUS-DOSSIER : CARNET DE MONTAGE --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#382d22]" />

                <div className="rounded-xl bg-[#171310] border border-[#2b2118] hover:border-[#4a3a2a] overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('montages');
                      } else {
                        toggleFolder('carnet');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1c1713] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {borderedFolders && (
                        openFolders['carnet'] ? (
                          <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                        )
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#60a5fa] group-hover:text-[#93c5fd] transition-colors">
                            Carnet de montage
                          </span>
                          {counts?.montages !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#60a5fa]/15 text-[#93c5fd] border border-[#60a5fa]/30 font-medium">
                              {counts.montages} montage{counts.montages > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('montages');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#60a5fa]/15 hover:bg-[#60a5fa] text-[#93c5fd] hover:text-[#0b1120] border border-[#60a5fa]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder au Carnet de montage"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('carnet');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors cursor-pointer"
                        title={openFolders['carnet'] ? "Masquer les détails" : "Voir les détails"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['carnet'] ? 'rotate-180 text-[#60a5fa]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['carnet'] && (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-[#ded3c5] leading-relaxed border-t border-[#2b2118] bg-[#120f0d] space-y-1.5 animate-in fade-in duration-150">
                      <p>
                        C'est ici que tout se joue : construisez votre chorégraphie sur mesure, en associant chaque segment à vos médias favoris :
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#ded3c5]">
                        <li>Définissez l'ordre exact de vos blocs (ex: Salida ➔ Falseta 1 ➔ Letra ➔ Escobilla).</li>
                        <li>Placez des repères à la seconde près et lier vos blocs à vos médias.</li>
                        <li>Associez des annotations personnelles.</li>
                        <li>Créez, dupliquez, effacez, et partagez vos montages avec d'autres utilisateurs.</li>
                      </ul>
                      {onNavigate && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('montages')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#60a5fa] hover:bg-[#93c5fd] text-[#0b1120] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir l'espace Carnet de montage</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- SECTION SOUS LE CARNET DE MONTAGE : CONSEILS & ASTUCES --- */}
              <div className="relative group" ref={tipsContainerRef}>
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#382d22]" />

                <div className="rounded-xl bg-[#141210] border border-[#2b2118] hover:border-[#4a3a2a] overflow-hidden transition-all shadow-md">
                  <div
                    onClick={toggleTips}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#16233b] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="p-1 rounded-md bg-[#60a5fa]/20 text-[#93c5fd] shrink-0">
                        <Lightbulb className="w-4 h-4 text-[#93c5fd]" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#93c5fd] group-hover:text-white transition-colors">
                            Conseils & astuces : méthode de travail et gestion des vidéos
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8c8173] block truncate">
                          Stockage vidéo en ligne & découpage chorégraphique par blocs
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTips();
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors cursor-pointer"
                        title={openTips ? "Masquer les conseils" : "Voir les conseils"}
                        aria-label={openTips ? "Masquer les conseils" : "Voir les conseils"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openTips ? 'rotate-180 text-[#60a5fa]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openTips && (
                    <div className="px-4 pb-3.5 pt-3 text-xs text-[#ded3c5] leading-relaxed border-t border-[#1e2d47] bg-[#0c1322] space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Colonne 1 : Mettre ses vidéos en ligne plutôt que sur le téléphone */}
                        <div className="p-3 rounded-lg bg-[#0a1120] border border-[#1d2d47] space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-[#60a5fa]">
                            <UploadCloud className="w-4 h-4 text-[#60a5fa] shrink-0" />
                            <span>Mettre ses vidéos en ligne plutôt que sur le téléphone</span>
                          </div>
                          <p className="text-[#cbd5e1] leading-relaxed">
                            Pour travailler efficacement et sereinement, <strong>privilégiez le stockage en ligne</strong> plutôt que de conserver de lourds fichiers vidéo dans la mémoire de votre téléphone :
                          </p>
                          <ul className="space-y-1.5 text-[#94a3b8] leading-relaxed">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                              <span><strong>Ne saturez pas votre téléphone :</strong> Les enregistrements vidéo HD/4K de cours ou répétitions pèsent plusieurs gigaoctets et encombrent vite le stockage local.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                              <span><strong>Hébergement simple & privé :</strong> Déposez vos vidéos sur <strong>YouTube en mode « Non répertorié »</strong> (seules les personnes disposant du lien peuvent la visionner) ou sur Google Drive / Vimeo.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                              <span><strong>Accès partout & pérennité :</strong> Vos chorégraphies et repères temporels sont accessibles sur n'importe quel écran (smartphone en salle, tablette, ordinateur) sans risque de perte en cas de changement ou panne de mobile.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                              <span><strong>Partage immédiat :</strong> Vous pouvez transmettre en un clic vos montages et vos timecodes à votre professeur, guitariste ou partenaire de baile.</span>
                            </li>
                          </ul>
                        </div>

                        {/* Colonne 2 : La façon de travailler dans l'Atelier de création */}
                        <div className="p-3 rounded-lg bg-[#0a1120] border border-[#1d2d47] space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-[#60a5fa]">
                            <Sparkles className="w-4 h-4 text-[#60a5fa] shrink-0" />
                            <span>La façon de travailler sa chorégraphie</span>
                          </div>
                          <p className="text-[#cbd5e1] leading-relaxed">
                            L'Atelier de création a été conçu pour reproduire la rigueur de travail des danseurs professionnels :
                          </p>
                          <ul className="space-y-1.5 text-[#94a3b8] leading-relaxed">
                            <li className="flex items-start gap-2">
                              <span className="text-[#60a5fa] font-bold shrink-0">1.</span>
                              <span><strong>Découpez par blocs cohérents :</strong> Ne travaillez pas toute la danse d'un trait. Isolez chaque partie clé (Salida, Letra, Falseta, Escobilla, Subida, Remate).</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#60a5fa] font-bold shrink-0">2.</span>
                              <span><strong>Fixez des repères temporels (Timecodes) :</strong> Notez la seconde précise du début et de fin de chaque séquence pour pouvoir la revoir, l'écouter et la répéter en boucle.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#60a5fa] font-bold shrink-0">3.</span>
                              <span><strong>Consignez vos notes et codes musicaux :</strong> Ajoutez vos annotations techniques (posture du torse, direction du regard, zapateado) et les signaux indispensables donnés au guitariste et au chant.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#60a5fa] font-bold shrink-0">4.</span>
                              <span><strong>Ajustez votre conducteur scénique :</strong> Dans le carnet de montage, réordonnez vos blocs, testez différentes structures et peaufinez vos transitions.</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Bouton flèche ⌃ pour replier et remonter au niveau de départ */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleCollapseTips}
                          className="p-1.5 sm:p-2 rounded-lg bg-[#10192b] hover:bg-[#1e293b] text-[#60a5fa] hover:text-[#93c5fd] border border-[#233857] hover:border-[#60a5fa]/50 transition-all cursor-pointer shadow-sm group flex items-center justify-center"
                          title="Replier"
                          aria-label="Replier"
                        >
                          <ChevronUp className="w-4 h-4 text-[#60a5fa] group-hover:text-[#93c5fd] transition-transform group-hover:-translate-y-0.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Zone noire du bas : Rubriques optionnelles (Caractère, Costume & Posture, Compás & Dynamique) */}
        {bottomContent && (
          <div className="pt-4 mt-6 border-t border-[#2b2118]/80">
            {bottomContent}
          </div>
        )}
      </div>
    </div>
  );
};
