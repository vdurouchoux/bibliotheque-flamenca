import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ArrowRight, Folder, FolderOpen, ArrowDownAZ, ArrowUpAZ, List, LayoutGrid, Lightbulb } from 'lucide-react';
import { VideoItem } from '../types';

export interface GuitareArborescenceTreeProps {
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

export const GuitareArborescenceTree: React.FC<GuitareArborescenceTreeProps> = ({
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
  const [treeMaitresViewMode, setTreeMaitresViewMode] = useState<'list' | 'icons'>('list');
  const [treeCoursViewMode, setTreeCoursViewMode] = useState<'list' | 'icons'>('list');
  const [treeSortOrder, setTreeSortOrder] = useState<'default' | 'alpha-asc' | 'alpha-desc'>('default');

  const toggleTreeSort = () => {
    setTreeSortOrder(prev => prev === 'default' ? 'alpha-asc' : prev === 'alpha-asc' ? 'alpha-desc' : 'default');
  };

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
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      } else if (tipsContainerRef.current) {
        tipsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };
    requestAnimationFrame(scrollToOrigin);
    setTimeout(scrollToOrigin, 40);
  };

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
      return { ...prev, [key]: nextIsOpen };
    });
  };

  return (
    <div className={`rounded-2xl transition-all duration-200 relative space-y-4 ${
      translucent
        ? 'border-0 bg-transparent p-0 sm:p-1 shadow-none'
        : 'border border-[#382d22] bg-[#0f0d0b] p-4 sm:p-6 shadow-2xl'
    }`}>
      {title && (
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#2b2118]/80 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider font-sans break-words whitespace-normal leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${
              translucent ? 'text-white' : 'text-[#e5a93b]'
            }`}>
              {title}
            </span>
          </div>
        </div>
      )}

      {/* ARBRE DES DOSSIERS AVEC BRANCHES VISUELLES */}
      <div className="relative pl-1 sm:pl-2 space-y-4 font-sans text-xs sm:text-sm">
        {/* DEUX CARRÉS L'UN À CÔTÉ DE L'AUTRE : MÉDIATHÈQUE FLAMENCA & ATELIER DE CRÉATION */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 select-none">
          {/* CARRÉ GAUCHE : MÉDIATHÈQUE FLAMENCA SUR DEUX LIGNES */}
          <div
            onClick={() => toggleFolder('biblio')}
            className={`rounded-2xl transition-all p-3 sm:p-4 md:p-5 flex flex-col items-center justify-center text-center cursor-pointer relative shadow-lg group aspect-square ${
              openFolders['biblio']
                ? 'bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : translucent
                  ? 'border-0 bg-transparent hover:bg-black/15'
                  : 'border border-[#382d22] hover:border-emerald-500/60 bg-[#141210]/90 hover:bg-[#1a1714]'
            }`}
            title={openFolders['biblio'] ? 'Replier Médiathèque Flamenca' : 'Déplier Médiathèque Flamenca'}
          >
            <h4 className="font-serif text-xs sm:text-base md:text-lg font-bold text-[#86efac] leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              MÉDIATHÈQUE<br />FLAMENCA
            </h4>

            <span className="text-[9px] sm:text-[10px] text-[#bbf7d0]/90 font-medium mt-1.5 hidden xs:inline">
              Ressources & Références
            </span>

            <span className="text-[9px] sm:text-[10px] text-[#ded3c5]/75 italic mt-1 font-sans">
              à lire attentivement
            </span>

            <div className="mt-1.5 flex items-center justify-center">
              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 text-[#86efac] group-hover:text-emerald-300 transition-transform duration-200 ${
                  openFolders['biblio'] ? 'rotate-180' : ''
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
                ? 'bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : translucent
                  ? 'border-0 bg-transparent hover:bg-black/15'
                  : 'border border-[#382d22] hover:border-blue-500/60 bg-[#141210]/90 hover:bg-[#1a1714]'
            }`}
            title={openFolders['studio'] ? "Replier l'Atelier de création" : "Déplier l'Atelier de création"}
          >
            <h4 className="font-serif text-xs sm:text-base md:text-lg font-bold text-[#60a5fa] leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              ATELIER<br />DE CRÉATION
            </h4>

            <span className="text-[9px] sm:text-[10px] text-[#93c5fd]/90 font-medium mt-1.5 hidden xs:inline">
              Guitare & Falsetas
            </span>

            <span className="text-[9px] sm:text-[10px] text-[#ded3c5]/75 italic mt-1 font-sans">
              à lire attentivement
            </span>

            <div className="mt-1.5 flex items-center justify-center">
              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 text-[#60a5fa] group-hover:text-blue-300 transition-transform duration-200 ${
                  openFolders['studio'] ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* DÉPLIAGE MÉDIATHÈQUE FLAMENCA */}
        {openFolders['biblio'] && (
          <div className={`rounded-2xl border-2 border-emerald-500/50 p-3.5 sm:p-5 shadow-2xl space-y-4 animate-in fade-in duration-200 ${
            translucent ? 'bg-black/35' : 'bg-[#12100d]'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-[#2b2118]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#86efac] shrink-0" />
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

            <div className="px-3.5 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-[#ded3c5] leading-relaxed">
              <p>
                C'est la base de votre travail. Commencez dès à présent à alimenter votre médiathèque, palo par palo, en y classant vos sources de référence : Grands Maîtres, cours et tutoriels, letras et accompagnement du chant, compás et métronome.
              </p>
            </div>
          </div>
        )}

        {/* DÉPLIAGE ATELIER DE CRÉATION */}
        {openFolders['studio'] && (
          <div className={`rounded-2xl border-2 border-blue-500/50 p-3.5 sm:p-5 shadow-2xl space-y-4 animate-in fade-in duration-200 ${
            translucent ? 'bg-black/35' : 'bg-[#12100d]'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-[#2b2118]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#60a5fa] shrink-0" />
                <span className="font-serif text-xs sm:text-sm font-bold text-[#60a5fa]">
                  Atelier de Création
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#60a5fa]/20 text-[#bfdbfe] font-medium border border-[#60a5fa]/30 hidden xs:inline">
                  Guitare & Pratique
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFolder('studio')}
                className="text-xs text-[#8c8173] hover:text-[#60a5fa] flex items-center gap-1 cursor-pointer"
              >
                <span>Fermer</span>
                <ChevronUp className="w-3.5 h-3.5 text-[#60a5fa]" />
              </button>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-[#ded3c5] leading-relaxed">
              <p>
                L'Atelier est votre espace personnel de création et de pratique : classez vos falsetas, structurez vos morceaux complets, notez vos variations techniques et travaillez vos repères au compás.
              </p>
            </div>
          </div>
        )}
      </div>

      {bottomContent}
    </div>
  );
};
