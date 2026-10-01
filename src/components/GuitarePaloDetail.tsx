import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Plus, Bookmark, ChevronLeft, ArrowLeft, Volume2, 
  Sparkles, CheckCircle2, Circle, Clock, Flame, ExternalLink, BookOpen, 
  Trash2, RotateCcw, X, LayoutGrid, List, ArrowRight, Film, Pencil, 
  ChevronRight, ChevronDown, ChevronUp, Search, Share2, MoreVertical, 
  Folder, FolderOpen, ArrowDownAZ, ArrowUpAZ, ArrowUpDown, Music
} from 'lucide-react';
import { PaloData, VideoItem, Level, PracticeBookmark } from '../types';
import { 
  getBookmarks, toggleBookmark, getCustomVideos, deleteCustomVideo, 
  extractYouTubeInfo,
  getGuitareFolders, saveGuitareFolder, renameGuitareFolder, deleteGuitareFolder,
  DanseFolderNode
} from '../utils/storage';
import { CompasVisualizer } from './CompasVisualizer';

export type GuitareSectionTab = 'hub' | 'maitres' | 'cours' | 'falsetas' | 'cante' | 'compas';

interface GuitarePaloDetailProps {
  palo: PaloData;
  paloKey?: string;
  isMetronomePlaying: boolean;
  onToggleMetronome: () => void;
  onPlayVideo: (video: VideoItem, sectionName: string) => void;
  onOpenAddVideo: (section: string) => void;
  onBack?: () => void;
  activeTab?: GuitareSectionTab;
  isBiblioPageOpen?: boolean;
  onToggleBiblioPage?: (open: boolean) => void;
  isStudioPageOpen?: boolean;
  onToggleStudioPage?: (open: boolean) => void;
  activeCustomFolderId?: string | null;
  onCustomFolderChange?: (folderId: string | null) => void;
  onTabChange?: (tab: GuitareSectionTab) => void;
}

export const GuitarePaloDetail: React.FC<GuitarePaloDetailProps> = ({
  palo,
  paloKey: paloKeyProp,
  isMetronomePlaying,
  onToggleMetronome,
  onPlayVideo,
  onOpenAddVideo,
  onBack,
  activeTab: activeTabProp,
  isBiblioPageOpen: isBiblioPageOpenProp,
  onToggleBiblioPage,
  isStudioPageOpen: isStudioPageOpenProp,
  onToggleStudioPage,
  activeCustomFolderId: activeCustomFolderIdProp,
  onCustomFolderChange,
  onTabChange
}) => {
  const paloKey = paloKeyProp || palo.id;
  const [internalTab, setInternalTab] = useState<GuitareSectionTab>('hub');
  const activeTab = activeTabProp !== undefined ? activeTabProp : internalTab;
  const setActiveTab = (tab: GuitareSectionTab) => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  const [internalBiblioOpen, setInternalBiblioOpen] = useState(true);
  const isBiblioPageOpen = isBiblioPageOpenProp !== undefined ? isBiblioPageOpenProp : internalBiblioOpen;
  const setIsBiblioPageOpen = (val: boolean) => {
    if (onToggleBiblioPage) onToggleBiblioPage(val);
    else setInternalBiblioOpen(val);
  };

  const [internalStudioOpen, setInternalStudioOpen] = useState(false);
  const isStudioPageOpen = isStudioPageOpenProp !== undefined ? isStudioPageOpenProp : internalStudioOpen;
  const setIsStudioPageOpen = (val: boolean) => {
    if (onToggleStudioPage) onToggleStudioPage(val);
    else setInternalStudioOpen(val);
  };

  const [internalCustomFolderId, setInternalCustomFolderId] = useState<string | null>(null);
  const activeCustomFolderId = activeCustomFolderIdProp !== undefined ? activeCustomFolderIdProp : internalCustomFolderId;
  const setActiveCustomFolderId = (folderId: string | null | ((prev: string | null) => string | null)) => {
    const nextVal = typeof folderId === 'function' ? folderId(activeCustomFolderId) : folderId;
    if (onCustomFolderChange) onCustomFolderChange(nextVal);
    else setInternalCustomFolderId(nextVal);
  };

  // Folders state
  const [folders, setFolders] = useState<DanseFolderNode[]>(() => getGuitareFolders(palo.id));
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [addFolderModal, setAddFolderModal] = useState<{ isOpen: boolean; parentId: string | null; parentName: string; isStudio?: boolean } | null>(null);
  const [folderToRename, setFolderToRename] = useState<{ id: string; name: string } | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string } | null>(null);

  // Sorting & view mode
  const [mediaViewMode, setMediaViewMode] = useState<'list' | 'icons'>('list');
  const [mediaSortOrder, setMediaSortOrder] = useState<'default' | 'alpha-asc' | 'alpha-desc'>('default');
  const [folderSortOrder, setFolderSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [isSubfoldersOpen, setIsSubfoldersOpen] = useState(true);

  // Memorization of positions for switching seamlessly
  const lastBiblioFolderIdRef = useRef<string | null>(null);
  const lastBiblioTabRef = useRef<GuitareSectionTab>('hub');
  const lastStudioFolderIdRef = useRef<string | null>(null);

  const isFolderStudio = (folderId: string | null | undefined): boolean => {
    if (!folderId) return false;
    const f = folders.find(item => item.id === folderId);
    if (!f) return folderId.includes('studio') || folderId.includes('falsetas') || folderId.includes('morceaux');
    if (f.category === 'studio') return true;
    if (f.parentId) return isFolderStudio(f.parentId);
    return false;
  };

  // Tree collapse state
  const [collapsedFolderIds, setCollapsedFolderIds] = useState<Record<string, boolean>>({});

  const toggleFolderCollapse = (folderId: string) => {
    setCollapsedFolderIds(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  // Sync memory when user navigates
  useEffect(() => {
    if (activeCustomFolderId) {
      if (isFolderStudio(activeCustomFolderId)) {
        lastStudioFolderIdRef.current = activeCustomFolderId;
      } else {
        lastBiblioFolderIdRef.current = activeCustomFolderId;
      }
    } else {
      if (isStudioPageOpen) {
        lastStudioFolderIdRef.current = null;
      } else if (isBiblioPageOpen) {
        lastBiblioFolderIdRef.current = null;
        lastBiblioTabRef.current = activeTab;
      }
    }
  }, [activeCustomFolderId, isStudioPageOpen, isBiblioPageOpen, activeTab]);

  const handleSwitchToBiblio = () => {
    setIsBiblioPageOpen(true);
    setIsStudioPageOpen(false);
    const targetFolder = lastBiblioFolderIdRef.current;
    const targetTab = lastBiblioTabRef.current || 'hub';
    setActiveCustomFolderId(targetFolder);
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchToStudio = () => {
    setIsStudioPageOpen(true);
    setIsBiblioPageOpen(false);
    const targetFolder = lastStudioFolderIdRef.current;
    setActiveCustomFolderId(targetFolder);
    setActiveTab('hub');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to storage update events
  useEffect(() => {
    const handleUpdate = () => {
      setFolders(getGuitareFolders(palo.id));
    };
    window.addEventListener('flamenco_guitare_folders_updated', handleUpdate);
    return () => window.removeEventListener('flamenco_guitare_folders_updated', handleUpdate);
  }, [palo.id]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-menu-trigger') && !target.closest('.dropdown-menu-content')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bookmarks = getBookmarks();
  const customStore = getCustomVideos();
  const paloCustom = customStore[palo.id] || customStore[paloKey] || {};

  // Standard videos extraction
  const getFalsetasVideos = (): VideoItem[] => {
    const staticGroup = palo.falsetas || {};
    const customList = (paloCustom['falsetas'] || []) as VideoItem[];
    const result: VideoItem[] = [];
    [1, 2, 3].forEach(lvl => {
      const lvlKey = lvl as Level;
      const staticVideos = (staticGroup[lvlKey] || []).map(v => ({ ...v, level: lvlKey }));
      const customs = customList.filter(v => v.level === lvlKey);
      result.push(...staticVideos, ...customs);
    });
    return result;
  };

  const getCoursVideos = (): VideoItem[] => {
    const staticIntro = palo.intro?.videos || [];
    const customIntro = (paloCustom['intro'] || []) as VideoItem[];
    const customCours = (paloCustom['cours'] || []) as VideoItem[];
    return [...staticIntro, ...customIntro, ...customCours];
  };

  const getCanteVideos = (): VideoItem[] => {
    const staticGroup = palo.cante || {};
    const customList = (paloCustom['cante'] || []) as VideoItem[];
    const result: VideoItem[] = [];
    [1, 2, 3].forEach(lvl => {
      const lvlKey = lvl as Level;
      const staticVideos = (staticGroup[lvlKey] || []).map(v => ({ ...v, level: lvlKey }));
      const customs = customList.filter(v => v.level === lvlKey);
      result.push(...staticVideos, ...customs);
    });
    return result;
  };

  const getFolderVideos = (folderId: string): VideoItem[] => {
    const customList = (paloCustom[`folder_${folderId}`] || []) as VideoItem[];
    return customList;
  };

  // Folders filtering
  const biblioRootFolders = useMemo(() => {
    return folders.filter(f => !f.parentId && f.category !== 'studio');
  }, [folders]);

  const studioRootFolders = useMemo(() => {
    return folders.filter(f => !f.parentId && f.category === 'studio');
  }, [folders]);

  const getSubfoldersOf = (parentId: string) => {
    return folders.filter(f => f.parentId === parentId);
  };

  const currentFolder = folders.find(f => f.id === activeCustomFolderId);
  const isStudioFolder = isFolderStudio(activeCustomFolderId);

  // Dual paves header
  const renderDualPaves = (isCurrentStudio: boolean) => (
    <div className="w-full bg-black border-0 rounded-2xl p-3 sm:p-4 shadow-xl grid grid-cols-2 divide-x divide-neutral-800/70 select-none">
      {/* Pavé gauche : Médiathèque */}
      <button
        type="button"
        onClick={handleSwitchToBiblio}
        className="px-3 py-2 text-center transition-all cursor-pointer flex items-center justify-center border-0 bg-transparent"
        title={`Afficher la Médiathèque de la ${palo.name}`}
      >
        <span className={`text-xs sm:text-sm md:text-base font-serif uppercase tracking-wider transition-all duration-200 ${
          !isCurrentStudio
            ? 'text-[#86efac] font-extrabold drop-shadow-[0_0_12px_rgba(134,239,172,0.95)]'
            : 'text-[#86efac]/40 hover:text-[#86efac]/80 font-bold'
        }`}>
          MÉDIATHÈQUE DE LA {palo.name.toUpperCase()}
        </span>
      </button>

      {/* Pavé droite : Atelier */}
      <button
        type="button"
        onClick={handleSwitchToStudio}
        className="px-3 py-2 text-center transition-all cursor-pointer flex items-center justify-center border-0 bg-transparent"
        title={`Afficher l'Atelier de la ${palo.name}`}
      >
        <span className={`text-xs sm:text-sm md:text-base font-serif uppercase tracking-wider transition-all duration-200 ${
          isCurrentStudio
            ? 'text-[#60a5fa] font-extrabold drop-shadow-[0_0_12px_rgba(96,165,250,0.95)]'
            : 'text-[#60a5fa]/40 hover:text-[#60a5fa]/80 font-bold'
        }`}>
          ATELIER DE LA {palo.name.toUpperCase()}
        </span>
      </button>
    </div>
  );

  // View mode control
  const renderViewModeControl = (isStudio: boolean = false) => (
    <div className={`flex items-center bg-[#15120f] border ${isStudio ? 'border-[#60a5fa]/40' : 'border-[#86efac]/30'} rounded-xl p-0.5 shadow-xs shrink-0`}>
      <button
        type="button"
        onClick={() => setMediaViewMode('list')}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
          mediaViewMode === 'list'
            ? isStudio
              ? 'bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/45 shadow-xs'
              : 'bg-[#86efac]/20 text-[#86efac] border border-[#86efac]/40 shadow-xs'
            : 'text-[#8c8173] hover:text-[#ded3c5] hover:bg-white/5 border border-transparent'
        }`}
        title="Afficher en vue liste"
      >
        <List className="w-3.5 h-3.5 shrink-0" />
        <span>Vue liste</span>
      </button>
      <button
        type="button"
        onClick={() => setMediaViewMode('icons')}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
          mediaViewMode === 'icons'
            ? isStudio
              ? 'bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/45 shadow-xs'
              : 'bg-[#86efac]/20 text-[#86efac] border border-[#86efac]/40 shadow-xs'
            : 'text-[#8c8173] hover:text-[#ded3c5] hover:bg-white/5 border border-transparent'
        }`}
        title="Afficher en vue icônes"
      >
        <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
        <span>Vue icônes</span>
      </button>
    </div>
  );

  // Video card rendering
  const renderVideoCard = (video: VideoItem, sectionName: string, i: number) => {
    const isBookmarked = !!bookmarks[video.id];
    const yt = extractYouTubeInfo(video.url);
    const thumbUrl = yt.videoId ? `https://img.youtube.com/vi/${yt.videoId}/mqdefault.jpg` : null;

    return (
      <div 
        key={`${video.id}-${i}`}
        className="group relative bg-[#171410] hover:bg-[#1d1915] border border-[#2b2118] hover:border-[#423324] rounded-2xl p-3.5 sm:p-4 transition-all shadow-md flex flex-col justify-between"
      >
        <div className="space-y-2.5">
          {thumbUrl && (
            <div 
              onClick={() => onPlayVideo(video, sectionName)}
              className="relative aspect-video rounded-xl overflow-hidden bg-black/60 cursor-pointer group/thumb"
            >
              <img 
                src={thumbUrl} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/10 flex items-center justify-center transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#e5a93b]/90 text-[#121110] flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <h4 
              onClick={() => onPlayVideo(video, sectionName)}
              className="text-sm font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] cursor-pointer line-clamp-2 transition-colors"
            >
              {video.title}
            </h4>
            <button
              type="button"
              onClick={() => toggleBookmark({
                videoId: video.id,
                paloId: palo.id,
                paloName: palo.name,
                section: sectionName,
                title: video.title,
                url: video.url,
                level: video.level,
                status: 'to_learn'
              })}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isBookmarked 
                  ? 'bg-[#e5a93b]/20 border-[#e5a93b]/40 text-[#e5a93b]' 
                  : 'border-[#33281d] text-[#73685a] hover:text-[#f4efe6] hover:bg-white/5'
              }`}
              title={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {video.description && (
            <p className="text-xs text-[#a69c8f] line-clamp-2 leading-relaxed">
              {video.description}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#261f18] flex items-center justify-between text-[11px] text-[#7d7162]">
          <span className="font-medium text-[#e5a93b]">Niveau {video.level}</span>
          <button
            type="button"
            onClick={() => onPlayVideo(video, sectionName)}
            className="flex items-center gap-1 text-[#e5a93b] hover:underline font-semibold cursor-pointer"
          >
            <span>Lire</span>
            <Play className="w-3 h-3 fill-current" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* VUE RACINE : MÉDIATHÈQUE */}
      {activeTab === 'hub' && isBiblioPageOpen && !activeCustomFolderId && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {renderDualPaves(false)}

          <div className="bg-[#141210] border border-[#2b2118] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            {/* Titre Farruca / Palo */}
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#2b2118]/80">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <FolderOpen className="w-6 h-6 text-[#86efac] shrink-0" />
                <span className="text-lg sm:text-xl font-bold font-serif text-[#f4efe6] truncate">
                  {palo.name}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-[#86efac] border border-emerald-500/30 hidden xs:inline font-medium">
                  Médiathèque
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAddFolderModal({ isOpen: true, parentId: null, parentName: palo.name, isStudio: false })}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-[#86efac] border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Nouveau dossier</span>
                </button>
              </div>
            </div>

            {/* Arborescence des dossiers standards & personnalisés */}
            <div className="ml-3 sm:ml-4 pl-4 sm:pl-6 border-l-2 border-[#382d22] space-y-3 pt-1">
              {/* Grands Maîtres */}
              <div 
                onClick={() => setActiveTab('maitres')}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#171310] hover:bg-[#1f1914] border border-[#2b2118] hover:border-emerald-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className="w-4 h-4 text-[#86efac] shrink-0" />
                  <span className="text-sm font-semibold text-[#ded3c5] group-hover:text-white truncate">
                    Grands Maîtres & Références
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#73685a] group-hover:text-[#86efac] group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

              {/* Cours & Tutoriels */}
              <div 
                onClick={() => setActiveTab('cours')}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#171310] hover:bg-[#1f1914] border border-[#2b2118] hover:border-emerald-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className="w-4 h-4 text-[#86efac] shrink-0" />
                  <span className="text-sm font-semibold text-[#ded3c5] group-hover:text-white truncate">
                    Cours & Tutoriels
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#73685a] group-hover:text-[#86efac] group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

              {/* Falsetas & Répertoire */}
              <div 
                onClick={() => setActiveTab('falsetas')}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#171310] hover:bg-[#1f1914] border border-[#2b2118] hover:border-emerald-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className="w-4 h-4 text-[#86efac] shrink-0" />
                  <span className="text-sm font-semibold text-[#ded3c5] group-hover:text-white truncate">
                    Falsetas & Répertoire
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#73685a] group-hover:text-[#86efac] group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

              {/* Accompagnement Cante */}
              <div 
                onClick={() => setActiveTab('cante')}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#171310] hover:bg-[#1f1914] border border-[#2b2118] hover:border-emerald-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className="w-4 h-4 text-[#86efac] shrink-0" />
                  <span className="text-sm font-semibold text-[#ded3c5] group-hover:text-white truncate">
                    Accompagnement du Chant (Cante)
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#73685a] group-hover:text-[#86efac] group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

              {/* Compás & Métronome */}
              <div 
                onClick={() => setActiveTab('compas')}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#171310] hover:bg-[#1f1914] border border-[#2b2118] hover:border-emerald-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className="w-4 h-4 text-[#86efac] shrink-0" />
                  <span className="text-sm font-semibold text-[#ded3c5] group-hover:text-white truncate">
                    Compás & Métronome
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#73685a] group-hover:text-[#86efac] group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

              {/* Dossiers personnalisés Médiathèque */}
              {biblioRootFolders.map(folderItem => {
                const subfolders = getSubfoldersOf(folderItem.id);
                return (
                  <div key={folderItem.id} className="space-y-2">
                    <div 
                      onClick={() => setActiveCustomFolderId(folderItem.id)}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#171310] hover:bg-[#1f1914] border border-[#2b2118] hover:border-emerald-500/40 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder className="w-4 h-4 text-[#86efac] shrink-0" />
                        <span className="text-sm font-semibold text-[#ded3c5] group-hover:text-white truncate">
                          {folderItem.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#73685a] group-hover:text-[#86efac] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VUE RACINE : ATELIER */}
      {activeTab === 'hub' && isStudioPageOpen && !activeCustomFolderId && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {renderDualPaves(true)}

          <div className="bg-[#141210] border border-[#2b2118] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#2b2118]/80">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <FolderOpen className="w-6 h-6 text-[#60a5fa] shrink-0" />
                <span className="text-lg sm:text-xl font-bold font-serif text-[#f4efe6] truncate">
                  {palo.name}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-950/60 text-[#60a5fa] border border-blue-500/30 hidden xs:inline font-medium">
                  Atelier de création
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAddFolderModal({ isOpen: true, parentId: null, parentName: palo.name, isStudio: true })}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-[#60a5fa] border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Nouveau dossier</span>
                </button>
              </div>
            </div>

            {/* Arborescence Atelier */}
            <div className="ml-3 sm:ml-4 pl-4 sm:pl-6 border-l-2 border-[#382d22] space-y-3 pt-1">
              {studioRootFolders.map(folderItem => {
                const subfolders = getSubfoldersOf(folderItem.id);
                return (
                  <div key={folderItem.id} className="space-y-2">
                    <div 
                      onClick={() => setActiveCustomFolderId(folderItem.id)}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#171310] hover:bg-[#1f1914] border border-[#2b2118] hover:border-[#60a5fa]/40 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder className="w-4 h-4 text-[#60a5fa] shrink-0" />
                        <span className="text-sm font-semibold text-[#ded3c5] group-hover:text-white truncate">
                          {folderItem.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#73685a] group-hover:text-[#60a5fa] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VUE CONTENU D'UN DOSSIER OU SOUS-DOSSIER */}
      {activeCustomFolderId && currentFolder && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {renderDualPaves(isStudioFolder)}

          <div className="bg-[#141210] border border-[#2b2118] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            {/* Ligne d'en-tête du dossier */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#2b2118]">
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderOpen className={`w-5 h-5 shrink-0 ${isStudioFolder ? 'text-[#60a5fa]' : 'text-[#86efac]'}`} />
                <span className="text-lg font-bold font-serif text-[#f4efe6] truncate">
                  {currentFolder.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 justify-end">
                {renderViewModeControl(isStudioFolder)}
                <button
                  type="button"
                  onClick={() => onOpenAddVideo(`folder_${currentFolder.id}`)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ${
                    isStudioFolder
                      ? 'bg-[#60a5fa]/20 hover:bg-[#60a5fa]/35 text-[#60a5fa] hover:text-[#93c5fd] border border-[#60a5fa]/40 shadow-[0_0_10px_rgba(96,165,250,0.3)]'
                      : 'bg-[#86efac]/20 hover:bg-[#86efac]/35 text-[#86efac] hover:text-[#bbf7d0] border border-[#86efac]/40 shadow-[0_0_10px_rgba(134,239,172,0.3)]'
                  }`}
                  title="Ajouter une vidéo"
                  aria-label="Ajouter une vidéo"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Sous-dossiers */}
            {getSubfoldersOf(currentFolder.id).length > 0 && (
              <div className={`p-3 rounded-xl bg-[#14120f] border ${isStudioFolder ? 'border-[#60a5fa]/30' : 'border-[#86efac]/30'} space-y-2`}>
                <span className={`text-xs font-bold uppercase tracking-wider ${isStudioFolder ? 'text-[#60a5fa]' : 'text-[#86efac]'}`}>
                  Sous-dossiers
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getSubfoldersOf(currentFolder.id).map(sub => (
                    <div
                      key={sub.id}
                      onClick={() => setActiveCustomFolderId(sub.id)}
                      className={`p-2 rounded-xl bg-[#1a1713] hover:bg-[#231e18] border border-[#33281d] ${
                        isStudioFolder ? 'hover:border-[#60a5fa]/60' : 'hover:border-[#86efac]/60'
                      } flex items-center gap-2 cursor-pointer transition-all group`}
                    >
                      <Folder className={`w-4 h-4 shrink-0 ${isStudioFolder ? 'text-[#60a5fa]' : 'text-[#86efac]'}`} />
                      <span className="text-xs text-[#ded3c5] group-hover:text-white truncate">
                        {sub.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des vidéos */}
            {getFolderVideos(currentFolder.id).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
                {getFolderVideos(currentFolder.id).map((video, idx) => 
                  renderVideoCard(video, currentFolder.name, idx)
                )}
              </div>
            ) : (
              <div className="text-center py-10 rounded-xl bg-[#161310] border border-[#2b2118] space-y-3">
                <p className="text-xs text-[#8c8173]">Ce dossier est vide.</p>
                <button
                  type="button"
                  onClick={() => onOpenAddVideo(`folder_${currentFolder.id}`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    isStudioFolder 
                      ? 'bg-[#60a5fa]/20 text-[#60a5fa] hover:bg-[#60a5fa]/30 border border-[#60a5fa]/40' 
                      : 'bg-[#86efac]/20 text-[#86efac] hover:bg-[#86efac]/30 border border-[#86efac]/40'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une première vidéo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VUE SECTION : FALSETAS & RÉPERTOIRE */}
      {activeTab === 'falsetas' && !activeCustomFolderId && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {renderDualPaves(false)}

          <div className="bg-[#141210] border border-[#2b2118] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2118]">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-[#86efac]" />
                <h3 className="text-lg font-bold font-serif text-[#f4efe6]">
                  Falsetas & Répertoire
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onOpenAddVideo('falsetas')}
                className="w-8 h-8 rounded-xl bg-[#86efac]/20 hover:bg-[#86efac]/35 text-[#86efac] border border-[#86efac]/40 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {getFalsetasVideos().map((v, i) => renderVideoCard(v, 'Falsetas', i))}
            </div>
          </div>
        </div>
      )}

      {/* VUE SECTION : COURS & TUTORIELS */}
      {activeTab === 'cours' && !activeCustomFolderId && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {renderDualPaves(false)}

          <div className="bg-[#141210] border border-[#2b2118] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2118]">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-[#86efac]" />
                <h3 className="text-lg font-bold font-serif text-[#f4efe6]">
                  Cours & Tutoriels
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onOpenAddVideo('cours')}
                className="w-8 h-8 rounded-xl bg-[#86efac]/20 hover:bg-[#86efac]/35 text-[#86efac] border border-[#86efac]/40 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {getCoursVideos().map((v, i) => renderVideoCard(v, 'Cours', i))}
            </div>
          </div>
        </div>
      )}

      {/* VUE SECTION : CHANT & ACCOMPAGNEMENT */}
      {activeTab === 'cante' && !activeCustomFolderId && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {renderDualPaves(false)}

          <div className="bg-[#141210] border border-[#2b2118] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2118]">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-[#86efac]" />
                <h3 className="text-lg font-bold font-serif text-[#f4efe6]">
                  Accompagnement du Chant
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onOpenAddVideo('cante')}
                className="w-8 h-8 rounded-xl bg-[#86efac]/20 hover:bg-[#86efac]/35 text-[#86efac] border border-[#86efac]/40 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {getCanteVideos().map((v, i) => renderVideoCard(v, 'Cante', i))}
            </div>
          </div>
        </div>
      )}

      {/* VUE SECTION : COMPÁS & MÉTRONOME */}
      {activeTab === 'compas' && !activeCustomFolderId && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {renderDualPaves(false)}

          <div className="bg-[#141210] border border-[#2b2118] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2118]">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-[#86efac]" />
                <h3 className="text-lg font-bold font-serif text-[#f4efe6]">
                  Compás & Métronome
                </h3>
              </div>
            </div>

            <CompasVisualizer 
              compas={palo.compas}
              isPlaying={isMetronomePlaying}
              onTogglePlay={onToggleMetronome}
            />
          </div>
        </div>
      )}

      {/* MODAL CRÉATION DE DOSSIER */}
      {addFolderModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#171411] border border-[#3e3226] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-serif text-[#f4efe6]">
              Nouveau dossier dans {addFolderModal.parentName}
            </h3>
            <input
              type="text"
              id="new-folder-name"
              placeholder="Nom du dossier..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120f0d] border border-[#3e3226] text-sm text-[#f4efe6] focus:outline-none focus:border-[#e5a93b]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget.value.trim();
                  if (input) {
                    saveGuitareFolder(palo.id, input, addFolderModal.parentId, addFolderModal.isStudio ? 'studio' : 'biblio');
                    setAddFolderModal(null);
                  }
                }
              }}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddFolderModal(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('new-folder-name') as HTMLInputElement;
                  if (el?.value.trim()) {
                    saveGuitareFolder(palo.id, el.value.trim(), addFolderModal.parentId, addFolderModal.isStudio ? 'studio' : 'biblio');
                    setAddFolderModal(null);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  addFolderModal.isStudio
                    ? 'bg-[#60a5fa] hover:bg-blue-400 text-black'
                    : 'bg-[#86efac] hover:bg-emerald-300 text-black'
                }`}
              >
                Créer le dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
