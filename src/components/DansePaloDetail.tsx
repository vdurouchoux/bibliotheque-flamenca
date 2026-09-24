import React, { useState, useEffect } from 'react';
import { 
  Play, Plus, Bookmark, ChevronLeft, ArrowLeft, ArrowUp, ArrowDown, Layers, Volume2, 
  Sparkles, CheckCircle2, Circle, Clock, Flame, ShieldAlert, Award, Footprints, 
  Activity, Video, Music, ExternalLink, BookOpen, Quote, Languages, Trash2, RefreshCw, RotateCcw, X,
  LayoutGrid, List, ArrowRight, GraduationCap, Film, Pencil, ChevronRight, ChevronDown, ChevronUp, AlignLeft, Eye, Link2, Search, Share2, GripVertical, Lightbulb,
  AlertTriangle, Laptop, Smartphone
} from 'lucide-react';
import { DansePaloData, DanseSectionTab, VideoItem, MontageBlock, BlockVideoLink, VideoLandmark } from '../types';
import { CompasVisualizer } from './CompasVisualizer';
import { DanseArborescenceTree } from './DanseArborescenceTree';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ReplaceVideoModal } from './ReplaceVideoModal';
import { MontageBlockModal } from './MontageBlockModal';
import { MontageTimeline, getShortSpanishTitle } from './MontageTimeline';
import { checkVideoDeviceAvailability, getCurrentDeviceType } from '../utils/deviceUtils';
import { 
  getBookmarks, toggleBookmark, getCustomVideos, 
  getChoreographyChecklist, toggleChoreographyStep,
  getDeletedVideoIds, getReplacedVideos, deleteAnyVideo, resetAllDeletedVideos,
  getVideoCustomLandmarks, extractYouTubeInfo,
  getDanseMontages, saveDanseMontage, resetDanseMontage, getDefaultFarrucaBlocks,
  getDanseMontageKeys, saveDanseMontageKeys, deleteDanseMontage,
  getDanseBlockLinks, saveDanseBlockLink, deleteDanseBlockLink,
  getDanseSpacesOrder, saveDanseSpacesOrder, resetDanseSpacesOrder,
  getDanseMontageTitles, saveDanseMontageTitle, deleteDanseMontageTitle
} from '../utils/storage';
import { shareSection, shareVideoItem, getVideoShareData, getSectionShareData, ShareOptions } from '../utils/shareUtils';
import { ShareModal } from './ShareModal';
import { ShareMontageModal } from './ShareMontageModal';
import { FlamencoCantaorIcon } from './FlamencoCantaorIcon';
import { FlamencoBailaoraIcon } from './FlamencoBailaoraIcon';

interface DansePaloDetailProps {
  palo: DansePaloData;
  isMetronomePlaying: boolean;
  onToggleMetronome: () => void;
  onPlayVideo: (video: VideoItem, sectionName: string) => void;
  onOpenAddVideo: (section: string) => void;
  onBack: () => void;
  activeTab?: DanseSectionTab;
  onTabChange?: (tab: DanseSectionTab) => void;
}

const ESPACE_INFO_MAP: Record<Exclude<DanseSectionTab, 'hub'>, { title: string; subtitle: string; icon: string }> = {
  structure: {
    title: "Structure traditionnelle",
    subtitle: "Architecture de référence en 6 blocs",
    icon: "📑"
  },
  maitres: {
    title: "Grands Maîtres",
    subtitle: "Interprétations de référence & inspiration",
    icon: "🌟"
  },
  letras: {
    title: "Letras & Textes",
    subtitle: "Poésie, paroles bilingues & couplets",
    icon: "✍️"
  },
  compas: {
    title: "Compás & Palmas",
    subtitle: "Rythme binaire 4 temps & métronome",
    icon: "⏱️"
  },
  cours: {
    title: "Mes Cours & Stages",
    subtitle: "Tutoriels & vidéos personnelles",
    icon: "🎓"
  },
  montages: {
    title: "Mon carnet de montage",
    subtitle: "Montages chorégraphiques personnalisés",
    icon: "🎬"
  }
};

const DEFAULT_STUDY_SPACES: Array<Exclude<DanseSectionTab, 'hub'>> = [
  'structure',
  'montages',
  'maitres',
  'letras',
  'compas',
  'cours'
];

export const DansePaloDetail: React.FC<DansePaloDetailProps> = ({
  palo,
  isMetronomePlaying,
  onToggleMetronome,
  onPlayVideo,
  onOpenAddVideo,
  onBack,
  activeTab: activeTabProp,
  onTabChange
}) => {
  const [internalTab, setInternalTab] = useState<DanseSectionTab>('hub');
  const activeTab = activeTabProp !== undefined ? activeTabProp : internalTab;

  const scrollToEspacesEtude = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById('danse-espaces-etude');
        if (el) {
          const headerOffset = 70;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    });
  };

  const setActiveTab = (tab: DanseSectionTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
      if (tab === 'hub') {
        scrollToEspacesEtude();
      }
    }
  };
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [videoVersion, setVideoVersion] = useState<number>(0);
  const [videoToDelete, setVideoToDelete] = useState<{ id: string; title: string; sectionKey: string } | null>(null);
  const [videoToReplace, setVideoToReplace] = useState<{ video: VideoItem; sectionKey: string } | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => 
    getChoreographyChecklist(palo.id)
  );
  const [landmarksVersion, setLandmarksVersion] = useState<number>(0);
  const [shareToastMessage, setShareToastMessage] = useState<string | null>(null);
  const [shareModalOptions, setShareModalOptions] = useState<ShareOptions | null>(null);

  // Mode d'affichage des médias : liste minimaliste (seulement les noms), icônes (vignettes & noms) ou cartes détaillées
  const [mediaViewMode, setMediaViewMode] = useState<'list' | 'icons' | 'cards'>(() => {
    try {
      const saved = localStorage.getItem('flamenco_danse_media_view_mode');
      if (saved === 'list' || saved === 'icons' || saved === 'cards') return saved;
    } catch {}
    return 'list'; // Par défaut liste minimaliste comme demandé
  });

  const handleSetMediaViewMode = (mode: 'list' | 'icons' | 'cards') => {
    setMediaViewMode(mode);
    try {
      localStorage.setItem('flamenco_danse_media_view_mode', mode);
    } catch {}
  };

  // Menus déroulants pour les 3 rubriques fondamentales du palo (Caractère de la danse, Costume & Posture, Compás & Dynamique)
  // Repliés par défaut quand on arrive sur la page
  const [openInfoSections, setOpenInfoSections] = useState<{ character: boolean; costume: boolean; compas: boolean }>({
    character: false,
    costume: false,
    compas: false
  });

  const toggleInfoSection = (key: 'character' | 'costume' | 'compas') => {
    setOpenInfoSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Menus déroulants pour l'espace "Structure traditionnelle" :
  // openStructureSteps : état d'ouverture de chaque bloc (au début fermé, seul le titre est visible)
  const [openStructureSteps, setOpenStructureSteps] = useState<Record<number, boolean>>({});
  // openStructureDetails : état d'ouverture des conseils de danse et du code guitariste (au début fermé)
  const [openStructureDetails, setOpenStructureDetails] = useState<Record<string, boolean>>({});

  const toggleStructureStep = (stepNumber: number) => {
    setOpenStructureSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const toggleStructureDetail = (key: string) => {
    setOpenStructureDetails(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // État de l'ordre personnalisé des 6 espaces d'étude (avec glisser-déposer et persistance cloud)
  const [spacesOrder, setSpacesOrder] = useState<Array<Exclude<DanseSectionTab, 'hub'>>>(() => {
    try {
      const saved = getDanseSpacesOrder(palo.id);
      if (saved && Array.isArray(saved) && saved.length === DEFAULT_STUDY_SPACES.length) {
        const allValid = DEFAULT_STUDY_SPACES.every(k => (saved as any[]).includes(k));
        if (allValid) return saved as Array<Exclude<DanseSectionTab, 'hub'>>;
      }
    } catch (e) {
      console.error('Error loading spaces order', e);
    }
    return DEFAULT_STUDY_SPACES;
  });

  // Écouter les mises à jour en direct depuis le Cloud (ex: modification faite sur mobile reçue sur le PC)
  useEffect(() => {
    const handleSpacesUpdate = () => {
      try {
        const saved = getDanseSpacesOrder(palo.id);
        if (saved && Array.isArray(saved) && saved.length === DEFAULT_STUDY_SPACES.length) {
          const allValid = DEFAULT_STUDY_SPACES.every(k => (saved as any[]).includes(k));
          if (allValid) {
            setSpacesOrder(saved as Array<Exclude<DanseSectionTab, 'hub'>>);
            return;
          }
        }
        setSpacesOrder(DEFAULT_STUDY_SPACES);
      } catch (e) {
        console.error('Error handling spaces update event', e);
      }
    };

    window.addEventListener('flamenco_spaces_order_updated', handleSpacesUpdate);
    window.addEventListener('flamenco_data_imported', handleSpacesUpdate);
    return () => {
      window.removeEventListener('flamenco_spaces_order_updated', handleSpacesUpdate);
      window.removeEventListener('flamenco_data_imported', handleSpacesUpdate);
    };
  }, [palo.id]);

  const [draggedSpace, setDraggedSpace] = useState<Exclude<DanseSectionTab, 'hub'> | null>(null);
  const [dragOverSpace, setDragOverSpace] = useState<Exclude<DanseSectionTab, 'hub'> | null>(null);
  const isDragActiveRef = React.useRef(false);
  const touchSourceRef = React.useRef<Exclude<DanseSectionTab, 'hub'> | null>(null);

  const reorderSpaces = (sourceKey: Exclude<DanseSectionTab, 'hub'>, targetKey: Exclude<DanseSectionTab, 'hub'>) => {
    if (sourceKey === targetKey) return;
    setSpacesOrder(prev => {
      const next = [...prev];
      const sourceIdx = next.indexOf(sourceKey);
      const targetIdx = next.indexOf(targetKey);
      if (sourceIdx > -1 && targetIdx > -1) {
        next.splice(sourceIdx, 1);
        next.splice(targetIdx, 0, sourceKey);
        saveDanseSpacesOrder(palo.id, next);
      }
      return next;
    });
  };

  const handleResetSpacesOrder = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSpacesOrder(DEFAULT_STUDY_SPACES);
    resetDanseSpacesOrder(palo.id, DEFAULT_STUDY_SPACES);
  };

  const handleDragStartSpace = (e: React.DragEvent, key: Exclude<DanseSectionTab, 'hub'>) => {
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSpace(key);
    isDragActiveRef.current = true;
  };

  const handleDragOverSpace = (e: React.DragEvent, key: Exclude<DanseSectionTab, 'hub'>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSpace !== key) {
      setDragOverSpace(key);
    }
  };

  const handleDragLeaveSpace = (_e: React.DragEvent, key: Exclude<DanseSectionTab, 'hub'>) => {
    if (dragOverSpace === key) {
      setDragOverSpace(null);
    }
  };

  const handleDropSpace = (e: React.DragEvent, targetKey: Exclude<DanseSectionTab, 'hub'>) => {
    e.preventDefault();
    const sourceKey = draggedSpace || (e.dataTransfer.getData('text/plain') as Exclude<DanseSectionTab, 'hub'>);
    if (sourceKey) {
      reorderSpaces(sourceKey, targetKey);
    }
    setDraggedSpace(null);
    setDragOverSpace(null);
    setTimeout(() => {
      isDragActiveRef.current = false;
    }, 120);
  };

  const handleDragEndSpace = () => {
    setDraggedSpace(null);
    setDragOverSpace(null);
    setTimeout(() => {
      isDragActiveRef.current = false;
    }, 120);
  };

  const handleTouchStartSpace = (key: Exclude<DanseSectionTab, 'hub'>) => {
    touchSourceRef.current = key;
    setDraggedSpace(key);
    isDragActiveRef.current = true;
  };

  const handleTouchMoveSpace = (e: React.TouchEvent) => {
    if (!touchSourceRef.current) return;
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const cardElem = elem?.closest('[data-space-key]');
    if (cardElem) {
      const targetKey = cardElem.getAttribute('data-space-key') as Exclude<DanseSectionTab, 'hub'>;
      if (targetKey && targetKey !== dragOverSpace) {
        setDragOverSpace(targetKey);
      }
    }
  };

  const handleTouchEndSpace = () => {
    if (touchSourceRef.current && dragOverSpace && touchSourceRef.current !== dragOverSpace) {
      reorderSpaces(touchSourceRef.current, dragOverSpace);
    }
    touchSourceRef.current = null;
    setDraggedSpace(null);
    setDragOverSpace(null);
    setTimeout(() => {
      isDragActiveRef.current = false;
    }, 120);
  };

  const isCustomSpacesOrder = JSON.stringify(spacesOrder) !== JSON.stringify(DEFAULT_STUDY_SPACES);

  const handleShareSpace = () => {
    if (activeTab === 'hub') {
      const opts = getSectionShareData({
        discipline: 'danse',
        paloName: palo.name,
        paloId: palo.id,
        sectionKey: 'hub',
        sectionTitle: "Les 6 espaces d'étude"
      });
      setShareModalOptions(opts);
      return;
    }

    const info = ESPACE_INFO_MAP[activeTab as Exclude<DanseSectionTab, 'hub'>];
    const opts = getSectionShareData({
      discipline: 'danse',
      paloName: palo.name,
      paloId: palo.id,
      sectionKey: activeTab,
      sectionTitle: info?.title || activeTab,
      montageId: activeTab === 'montages' ? activeMontageKey : undefined
    });
    setShareModalOptions(opts);
  };

  // Montages workspace state
  const referenceFarrucaBlocks = getDefaultFarrucaBlocks();
  const [montageKeys, setMontageKeys] = useState<string[]>(() => {
    const keys = getDanseMontageKeys(palo.id);
    return keys.length > 0 ? keys : ['montage-1'];
  });
  const [montageTitles, setMontageTitles] = useState<Record<string, string>>(() => getDanseMontageTitles(palo.id));
  const [activeMontageKey, setActiveMontageKey] = useState<string>(() => {
    try {
      const imported = sessionStorage.getItem('flamenco_active_imported_montage');
      if (imported) {
        sessionStorage.removeItem('flamenco_active_imported_montage');
        return imported;
      }
    } catch {}
    return 'montage-1';
  });
  const [montagesData, setMontagesData] = useState<Record<string, MontageBlock[]>>(() => getDanseMontages(palo.id));
  const [showShareMontageModal, setShowShareMontageModal] = useState<boolean>(false);
  const [editingMontageKey, setEditingMontageKey] = useState<string | null>(null);
  const [editingMontageTitleValue, setEditingMontageTitleValue] = useState<string>('');
  
  // Validation state: per montage, determines whether we show the 6-block selector or full text
  const [montagesValidated, setMontagesValidated] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('flamenco_montages_validated_v3');
      if (raw) return JSON.parse(raw);
    } catch {}
    return { 'montage-1': true };
  });

  // Selected block IDs for each montage during selection
  const [selectedBlockIds, setSelectedBlockIds] = useState<Record<string, string[]>>(() => {
    try {
      const raw = localStorage.getItem('flamenco_montage_selected_blocks_v3');
      if (raw) return JSON.parse(raw);
    } catch {}
    const allIds = getDefaultFarrucaBlocks().map(b => b.id);
    return {
      'montage-1': allIds
    };
  });

  const [montageToDelete, setMontageToDelete] = useState<string | null>(null);

  const [montageModalState, setMontageModalState] = useState<{
    isOpen: boolean;
    block: MontageBlock | null;
    blockIndex?: number;
  }>({
    isOpen: false,
    block: null
  });

  // Custom in-app confirmation modals (guaranteed to work in iframe)
  const [blockToDelete, setBlockToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showResetMontageModal, setShowResetMontageModal] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setLandmarksVersion(v => v + 1);
    };
    window.addEventListener('flamenco_landmarks_updated', handleUpdate);
    return () => window.removeEventListener('flamenco_landmarks_updated', handleUpdate);
  }, []);

  useEffect(() => {
    const handleMontageUpdate = () => {
      setMontagesData(getDanseMontages(palo.id));
      setMontageKeys(getDanseMontageKeys(palo.id));
      setMontageTitles(getDanseMontageTitles(palo.id));
    };
    window.addEventListener('flamenco_montages_updated', handleMontageUpdate);
    return () => window.removeEventListener('flamenco_montages_updated', handleMontageUpdate);
  }, [palo.id]);

  const bookmarks = getBookmarks();
  const customStore = getCustomVideos();
  const paloCustom = customStore[palo.id] || {};

  // Active montage helpers
  const getMontageLabel = (key: string): string => {
    if (montageTitles[key]) {
      return montageTitles[key];
    }
    const match = key.match(/montage-(\d+)/);
    if (match) {
      return `Montage n°${match[1]}`;
    }
    return key;
  };

  const handleSaveMontageTitle = () => {
    if (!editingMontageKey) return;
    const clean = editingMontageTitleValue.trim();
    if (clean) {
      saveDanseMontageTitle(palo.id, editingMontageKey, clean);
      setMontageTitles(getDanseMontageTitles(palo.id));
    }
    setEditingMontageKey(null);
  };

  const currentMontageBlocks = montagesData[activeMontageKey] || [];
  const activeMontageLabel = getMontageLabel(activeMontageKey);
  const isCurrentMontageValidated = !!montagesValidated[activeMontageKey];
  const currentSelectedIds = selectedBlockIds[activeMontageKey] !== undefined
    ? selectedBlockIds[activeMontageKey]
    : (activeMontageKey === 'montage-1' ? referenceFarrucaBlocks.map(b => b.id) : []);

  // Ajouter un nouveau montage : par défaut un nouveau montage n'a pas de bloc, zéro bloc
  const handleAddMontage = () => {
    let maxNum = 1;
    montageKeys.forEach(k => {
      const m = k.match(/montage-(\d+)/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextNum = maxNum + 1;
    const newKey = `montage-${nextNum}`;

    // Par défaut, un nouveau montage a 0 bloc :
    const newBlocks: MontageBlock[] = [];

    // Sauvegarder dans le stockage
    saveDanseMontage(palo.id, newKey, newBlocks);
    const updatedKeys = [...montageKeys, newKey];
    saveDanseMontageKeys(palo.id, updatedKeys);

    // Mettre à jour les états
    setMontageKeys(updatedKeys);
    setMontagesData(prev => ({ ...prev, [newKey]: newBlocks }));
    setSelectedBlockIds(prev => {
      const next = { ...prev, [newKey]: [] };
      try {
        localStorage.setItem('flamenco_montage_selected_blocks_v3', JSON.stringify(next));
      } catch {}
      return next;
    });
    setMontagesValidated(prev => {
      const next = { ...prev, [newKey]: false };
      try {
        localStorage.setItem('flamenco_montages_validated_v3', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Basculer directement sur le nouveau montage créé
    setActiveMontageKey(newKey);
  };

  const confirmDeleteMontage = () => {
    if (!montageToDelete) {
      setMontageToDelete(null);
      return;
    }
    const targetKey = montageToDelete;
    deleteDanseMontage(palo.id, targetKey);
    const updatedKeys = montageKeys.filter(k => k !== targetKey);
    let safeKeys: string[];
    let nextActive: string;

    if (updatedKeys.length > 0) {
      safeKeys = updatedKeys;
      nextActive = safeKeys.includes(activeMontageKey) && activeMontageKey !== targetKey
        ? activeMontageKey
        : safeKeys[0];
    } else {
      // Si on a supprimé le dernier montage restant, on réinitialise un montage n°1 vide (0 bloc)
      safeKeys = ['montage-1'];
      nextActive = 'montage-1';
      saveDanseMontage(palo.id, 'montage-1', []);
    }

    saveDanseMontageKeys(palo.id, safeKeys);
    setMontageKeys(safeKeys);
    setMontagesData(prev => {
      const next = { ...prev };
      delete next[targetKey];
      if (safeKeys.length === 1 && safeKeys[0] === 'montage-1' && !next['montage-1']) {
        next['montage-1'] = [];
      }
      return next;
    });
    setSelectedBlockIds(prev => {
      const next = { ...prev };
      delete next[targetKey];
      if (safeKeys.length === 1 && safeKeys[0] === 'montage-1' && !next['montage-1']) {
        next['montage-1'] = [];
      }
      try {
        localStorage.setItem('flamenco_montage_selected_blocks_v3', JSON.stringify(next));
      } catch {}
      return next;
    });
    setMontagesValidated(prev => {
      const next = { ...prev };
      delete next[targetKey];
      if (safeKeys.length === 1 && safeKeys[0] === 'montage-1' && next['montage-1'] === undefined) {
        next['montage-1'] = false;
      }
      try {
        localStorage.setItem('flamenco_montages_validated_v3', JSON.stringify(next));
      } catch {}
      return next;
    });

    setActiveMontageKey(nextActive);
    setMontageToDelete(null);
  };

  // Liens des repères vidéos pour chaque bloc de chaque montage
  const [blockLinks, setBlockLinks] = useState<Record<string, Record<string, BlockVideoLink>>>(() => getDanseBlockLinks(palo.id));
  const [linkingBlockModal, setLinkingBlockModal] = useState<{ blockId: string; spanishTitle: string } | null>(null);
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');
  const [videoFilterCategory, setVideoFilterCategory] = useState<'all' | 'maitres' | 'cours'>('all');
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

  // Helper pour extraire uniquement le titre court en espagnol d'un bloc
  const getSpanishTitle = (rawTitle: string): string => {
    return getShortSpanishTitle(rawTitle);
  };

  const handleOpenLinkPicker = (blockId: string, spanishTitle: string) => {
    setLinkingBlockModal({ blockId, spanishTitle });
    setVideoSearchQuery('');
    setExpandedVideoId(null);
  };

  const handleSelectLandmarkForBlock = (video: VideoItem, landmark: VideoLandmark) => {
    if (!linkingBlockModal) return;
    const newLink: BlockVideoLink = {
      videoId: video.id,
      videoTitle: video.title,
      videoUrl: video.url,
      landmarkTime: landmark.timeSeconds,
      landmarkLabel: landmark.label
    };
    saveDanseBlockLink(palo.id, activeMontageKey, linkingBlockModal.blockId, newLink);
    setBlockLinks(prev => ({
      ...prev,
      [activeMontageKey]: {
        ...(prev[activeMontageKey] || {}),
        [linkingBlockModal.blockId]: newLink
      }
    }));
    setLinkingBlockModal(null);
  };

  const handleDeleteBlockLink = (blockId: string) => {
    deleteDanseBlockLink(palo.id, activeMontageKey, blockId);
    setBlockLinks(prev => {
      const next = { ...prev };
      if (next[activeMontageKey]) {
        const updatedMontageLinks = { ...next[activeMontageKey] };
        delete updatedMontageLinks[blockId];
        next[activeMontageKey] = updatedMontageLinks;
      }
      return next;
    });
  };

  const getFullVideoForLink = (link: BlockVideoLink): VideoItem => {
    const deletedIds = getDeletedVideoIds();
    const replacedVideos = getReplacedVideos();

    // 1. Grands Maîtres
    const maitresClean = (palo.maitres || [])
      .filter(v => !deletedIds.includes(v.id))
      .map(v => replacedVideos[v.id] || v);

    // 2. Sections personnalisées
    const customSections = ['maitres', 'cours', 'baile', 'letras', 'autre'];
    const customVideos: VideoItem[] = [];
    for (const sec of customSections) {
      const list = ((paloCustom[sec] || []) as VideoItem[])
        .filter(v => !deletedIds.includes(v.id))
        .map(v => replacedVideos[v.id] || v);
      customVideos.push(...list);
    }

    const allPaloVideos = [...maitresClean, ...customVideos];
    const targetYtId = extractVideoId(link.videoUrl);

    // Chercher la vidéo correspondante
    let foundVideo = allPaloVideos.find(v => v.id === link.videoId);
    if (!foundVideo && targetYtId) {
      foundVideo = allPaloVideos.find(v => extractVideoId(v.url) === targetYtId);
    }

    // Récupérer les repères : soit customisés s'ils existent, soit ceux de la vidéo originale
    const customLm = getVideoCustomLandmarks(link.videoId, link.videoUrl);
    let effectiveLandmarks: VideoLandmark[] = [];
    if (customLm !== null && customLm.length > 0) {
      effectiveLandmarks = customLm;
    } else if (foundVideo?.landmarks && foundVideo.landmarks.length > 0) {
      effectiveLandmarks = foundVideo.landmarks;
    }

    return {
      id: foundVideo ? foundVideo.id : link.videoId,
      title: foundVideo ? foundVideo.title : link.videoTitle,
      url: foundVideo ? foundVideo.url : link.videoUrl,
      level: foundVideo?.level ?? 3,
      description: foundVideo?.description,
      landmarks: effectiveLandmarks,
      startSeconds: link.landmarkTime
    };
  };

  const handlePlayLinkedVideo = (link: BlockVideoLink) => {
    const fullVideo = getFullVideoForLink(link);
    onPlayVideo(fullVideo, `Mon atelier de création · ${activeMontageLabel}`);
  };

  // Selected block ID for the interactive 2-column view (Left: chosen blocks list, Right: explanatory text & tips)
  const [selectedBlockIdByMontage, setSelectedBlockIdByMontage] = useState<Record<string, string>>({});
  const [montageViewMode, setMontageViewMode] = useState<'split' | 'timeline' | 'expanded' | 'links'>('split');
  const [mobileExpandedBlockId, setMobileExpandedBlockId] = useState<string | null>(null);
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);
  const [draggedListBlockIndex, setDraggedListBlockIndex] = useState<number | null>(null);
  const [dragOverListBlockIndex, setDragOverListBlockIndex] = useState<number | null>(null);

  const activeSelectedBlockId = selectedBlockIdByMontage[activeMontageKey] || currentMontageBlocks[0]?.id;
  const activeSelectedBlock = currentMontageBlocks.find(b => b.id === activeSelectedBlockId) || currentMontageBlocks[0] || null;
  const activeSelectedBlockIndex = activeSelectedBlock ? currentMontageBlocks.findIndex(b => b.id === activeSelectedBlock.id) : 0;

  // Toggle selection of a block in 6-block picker
  const handleToggleBlockSelection = (blockId: string) => {
    const prev = selectedBlockIds[activeMontageKey] || [];
    const updated = prev.includes(blockId)
      ? prev.filter(id => id !== blockId)
      : [...prev, blockId];
    
    const newStore = { ...selectedBlockIds, [activeMontageKey]: updated };
    setSelectedBlockIds(newStore);
    try {
      localStorage.setItem('flamenco_montage_selected_blocks_v3', JSON.stringify(newStore));
    } catch {}
  };

  const handleSelectAllBlocks = () => {
    const allIds = referenceFarrucaBlocks.map(b => b.id);
    const newStore = { ...selectedBlockIds, [activeMontageKey]: allIds };
    setSelectedBlockIds(newStore);
    try {
      localStorage.setItem('flamenco_montage_selected_blocks_v3', JSON.stringify(newStore));
    } catch {}
  };

  const handleDeselectAllBlocks = () => {
    const newStore = { ...selectedBlockIds, [activeMontageKey]: [] };
    setSelectedBlockIds(newStore);
    try {
      localStorage.setItem('flamenco_montage_selected_blocks_v3', JSON.stringify(newStore));
    } catch {}
  };

  // Validate the chosen 6 blocks to enter detailed full-text view
  const handleValidateMontageSelection = () => {
    const selectedIds = selectedBlockIds[activeMontageKey] || [];
    if (selectedIds.length === 0) return;

    // Filter reference or current blocks in natural sequence
    const existing = montagesData[activeMontageKey] || [];
    const newBlocks: MontageBlock[] = [];
    
    referenceFarrucaBlocks.forEach(refBlock => {
      if (selectedIds.includes(refBlock.id)) {
        const found = existing.find(e => e.id === refBlock.id);
        newBlocks.push(found || refBlock);
      }
    });

    // Also include any custom blocks that might have been added previously
    existing.forEach(b => {
      if (!referenceFarrucaBlocks.some(r => r.id === b.id) && selectedIds.includes(b.id)) {
        newBlocks.push(b);
      }
    });

    saveDanseMontage(palo.id, activeMontageKey, newBlocks);
    setMontagesData(prev => ({ ...prev, [activeMontageKey]: newBlocks }));

    // Set first block as active in 2-column view
    if (newBlocks.length > 0) {
      setSelectedBlockIdByMontage(prev => ({ ...prev, [activeMontageKey]: newBlocks[0].id }));
    }

    const updatedVal = { ...montagesValidated, [activeMontageKey]: true };
    setMontagesValidated(updatedVal);
    try {
      localStorage.setItem('flamenco_montages_validated_v3', JSON.stringify(updatedVal));
    } catch {}
  };

  // Return back to 6-block selection screen
  const handleEditSelection = () => {
    const updatedVal = { ...montagesValidated, [activeMontageKey]: false };
    setMontagesValidated(updatedVal);
    try {
      localStorage.setItem('flamenco_montages_validated_v3', JSON.stringify(updatedVal));
    } catch {}
  };

  // Select active block and toggle expansion
  const handleSelectBlock = (blockId: string) => {
    setSelectedBlockIdByMontage(prev => ({ ...prev, [activeMontageKey]: blockId }));
    setMobileExpandedBlockId(prev => (prev === blockId ? null : blockId));
  };

  // Switch to expanded (déroulée) view and scroll smoothly to the target block
  const handleViewBlockInExpanded = (blockId: string) => {
    setMontageViewMode('expanded');
    setSelectedBlockIdByMontage(prev => ({ ...prev, [activeMontageKey]: blockId }));
    setHighlightedBlockId(blockId);
    // Give time for DOM to render the expanded view, then scroll to the corresponding block
    setTimeout(() => {
      const el = document.getElementById(`montage-block-${blockId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    // Remove temporary highlight ring after 2.8 seconds
    setTimeout(() => {
      setHighlightedBlockId(null);
    }, 2800);
  };

  const handleSaveMontageBlock = (data: { title: string; description: string; danceTips: string; guitarCode: string; durationApprox?: string }) => {
    let updated: MontageBlock[];
    if (montageModalState.block) {
      updated = currentMontageBlocks.map(b => b.id === montageModalState.block!.id ? { ...b, ...data } : b);
    } else {
      const newBlock: MontageBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ...data
      };
      updated = [...currentMontageBlocks, newBlock];
      // ensure the new block ID is also in selectedBlockIds
      const newSel = [...(selectedBlockIds[activeMontageKey] || []), newBlock.id];
      setSelectedBlockIds(prev => ({ ...prev, [activeMontageKey]: newSel }));
      // select this new block in detail view
      setSelectedBlockIdByMontage(prev => ({ ...prev, [activeMontageKey]: newBlock.id }));
    }
    saveDanseMontage(palo.id, activeMontageKey, updated);
    setMontagesData(prev => ({ ...prev, [activeMontageKey]: updated }));
  };

  // Trigger custom in-app delete modal
  const handleDeleteClick = (blockId: string) => {
    const block = currentMontageBlocks.find(b => b.id === blockId);
    if (block) {
      setBlockToDelete({ id: block.id, title: block.title });
    }
  };

  // Confirm delete block inside in-app modal
  const confirmDeleteBlock = () => {
    if (!blockToDelete) return;
    const updated = currentMontageBlocks.filter(b => b.id !== blockToDelete.id);
    saveDanseMontage(palo.id, activeMontageKey, updated);
    setMontagesData(prev => ({ ...prev, [activeMontageKey]: updated }));
    
    // Update selected block IDs
    const updatedSel = (selectedBlockIds[activeMontageKey] || []).filter(id => id !== blockToDelete.id);
    setSelectedBlockIds(prev => ({ ...prev, [activeMontageKey]: updatedSel }));

    // Fallback active block if deleted block was the selected one
    if (selectedBlockIdByMontage[activeMontageKey] === blockToDelete.id) {
      setSelectedBlockIdByMontage(prev => ({
        ...prev,
        [activeMontageKey]: updated[0]?.id || ''
      }));
    }
    
    setBlockToDelete(null);
  };

  const handleMoveMontageBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentMontageBlocks.length) return;
    const updated = [...currentMontageBlocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    saveDanseMontage(palo.id, activeMontageKey, updated);
    setMontagesData(prev => ({ ...prev, [activeMontageKey]: updated }));
  };

  const handleReorderMontageBlocks = (sourceIndex: number, targetIndex: number) => {
    if (
      sourceIndex === targetIndex ||
      sourceIndex < 0 ||
      targetIndex < 0 ||
      sourceIndex >= currentMontageBlocks.length ||
      targetIndex >= currentMontageBlocks.length
    ) {
      return;
    }
    const updated = [...currentMontageBlocks];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    saveDanseMontage(palo.id, activeMontageKey, updated);
    setMontagesData(prev => ({ ...prev, [activeMontageKey]: updated }));
  };

  const handleResetMontageOrder = () => {
    const refIds = referenceFarrucaBlocks.map(b => b.id);
    const sorted = [...currentMontageBlocks].sort((a, b) => {
      const idxA = refIds.indexOf(a.id);
      const idxB = refIds.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
    saveDanseMontage(palo.id, activeMontageKey, sorted);
    setMontagesData(prev => ({ ...prev, [activeMontageKey]: sorted }));
  };

  // Confirm reset inside in-app modal
  const confirmResetMontage = () => {
    const resetBlocks = resetDanseMontage(palo.id, activeMontageKey);
    setMontagesData(prev => ({ ...prev, [activeMontageKey]: resetBlocks }));
    const allIds = resetBlocks.map(b => b.id);
    setSelectedBlockIds(prev => ({ ...prev, [activeMontageKey]: allIds }));
    setShowResetMontageModal(false);
  };

  const handleToggleStep = (stepNumber: number) => {
    const updated = toggleChoreographyStep(palo.id, stepNumber);
    setCompletedSteps(updated);
  };

  const getMaitresVideos = () => {
    const deletedIds = getDeletedVideoIds();
    const replacedVideos = getReplacedVideos();

    const rawStaticList = palo.maitres || [];
    const staticList = rawStaticList
      .filter(v => !deletedIds.includes(v.id))
      .map(v => replacedVideos[v.id] || v);

    const customList = ((paloCustom['maitres'] || []) as VideoItem[])
      .filter(v => !deletedIds.includes(v.id))
      .map(v => replacedVideos[v.id] || v);

    return [...staticList, ...customList];
  };

  const getCoursVideos = () => {
    const deletedIds = getDeletedVideoIds();
    const replacedVideos = getReplacedVideos();
    const customList = ((paloCustom['cours'] || []) as VideoItem[])
      .filter(v => !deletedIds.includes(v.id))
      .map(v => replacedVideos[v.id] || v);
    return customList;
  };

  const extractVideoId = (url: string) => {
    if (!url) return '';
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return m ? m[1] : url.trim();
  };

  const getCrossSectionReference = (videoUrl: string, currentSection: string): string | null => {
    const targetId = extractVideoId(videoUrl);
    if (!targetId) return null;

    const sections: Array<{ name: string; key: string; videos: VideoItem[] }> = [
      {
        name: 'Grands Maîtres',
        key: 'maitres',
        videos: [...(palo.maitres || []), ...((paloCustom['maitres'] || []) as VideoItem[])]
      }
    ];

    for (const sec of sections) {
      if (
        currentSection.toLowerCase().includes(sec.key) ||
        currentSection.toLowerCase().includes(sec.name.toLowerCase())
      ) {
        continue;
      }
      const match = sec.videos.some(v => extractVideoId(v.url) === targetId);
      if (match) {
        return sec.name;
      }
    }

    return null;
  };

  const renderVideoCard = (video: VideoItem, sectionTitle: string, sectionKey: string) => {
    const isBookmarked = !!bookmarks[video.id];
    const crossRef = getCrossSectionReference(video.url, sectionTitle);
    const customLandmarks = getVideoCustomLandmarks(video.id, video.url);
    const activeLandmarks = customLandmarks !== null ? customLandmarks : (video.landmarks || []);
    const ytInfo = extractYouTubeInfo(video.url);
    const videoId = ytInfo.videoId;
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    const isPreviewing = previewVideoId === video.id;
    const availability = checkVideoDeviceAvailability(video);

    return (
      <div
        key={video.id}
        className="p-4 rounded-xl bg-[#1a1713] border border-[#302820] hover:border-[#e5a93b]/60 transition-all group flex flex-col justify-between gap-3 shadow-md"
      >
        <div className="space-y-2.5">
          {/* Miniature / Prévisualisation directe dans la carte (sans changer de page) */}
          {isPreviewing && videoId ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border-2 border-[#e5a93b] shadow-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={video.title}
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
                className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/85 hover:bg-black text-[#f4efe6] text-[11px] font-semibold border border-white/20 transition-all cursor-pointer shadow flex items-center gap-1 z-10 hover:border-[#e5a93b]"
                title="Fermer la prévisualisation"
              >
                <X className="w-3 h-3" />
                <span>Fermer aperçu</span>
              </button>
            </div>
          ) : thumbUrl ? (
            <div
              onClick={() => setPreviewVideoId(video.id)}
              className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#110f0d] border border-[#2e261e] cursor-pointer group/thumb shadow-inner"
              title="Cliquer pour prévisualiser la vidéo ici (sans changer de page)"
            >
              <img
                src={thumbUrl}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover/thumb:from-black/30 transition-colors flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-[#e5a93b]/90 text-[#121110] flex items-center justify-center shadow-lg group-hover/thumb:scale-110 group-hover/thumb:bg-[#e5a93b] transition-all">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-[#f4efe6] font-medium backdrop-blur-xs border border-white/15 flex items-center gap-1">
                <span>▶ Prévisualiser</span>
              </div>
            </div>
          ) : null}

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {!availability.isAvailableOnCurrentDevice ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{availability.badgeText}</span>
                </span>
              ) : availability.isLocal ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2a2217] text-[#e5a93b] border border-[#4a3824] flex items-center gap-1">
                  {availability.sourceDevice === 'pc' ? <Laptop className="w-3 h-3 shrink-0" /> : <Smartphone className="w-3 h-3 shrink-0" />}
                  <span>{availability.badgeText}</span>
                </span>
              ) : null}
              {video.isCustom && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2a1c38] text-[#c99eff] border border-[#432b5e]">
                  Ajouté par vous
                </span>
              )}
              {crossRef && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#e5a93b]/15 text-[#e5a93b] border border-[#e5a93b]/35">
                  (Également dans {crossRef})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  const opts = getVideoShareData({
                    video,
                    paloName: `${palo.name} (Danse)`,
                    paloId: palo.id,
                    sectionName: sectionTitle,
                    discipline: 'danse'
                  });
                  setShareModalOptions(opts);
                }}
                className="p-1.5 rounded-lg border bg-[#221c17] text-[#a69c8f] border-[#362c21] hover:text-[#e5a93b] hover:border-[#e5a93b]/50 transition-colors cursor-pointer"
                title="Partager cette vidéo avec vos camarades"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleBookmark({
                    videoId: video.id,
                    paloId: palo.id,
                    paloName: `${palo.name} (Danse)`,
                    section: sectionTitle,
                    title: video.title,
                    url: video.url,
                    level: video.level,
                    status: 'learning',
                    discipline: 'danse'
                  });
                }}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-[#e5a93b]/20 text-[#e5a93b] border-[#e5a93b]/50'
                    : 'bg-[#221c17] text-[#7a6f61] border-[#362c21] hover:text-[#f4efe6]'
                }`}
                title={isBookmarked ? 'Enregistré dans mes études' : 'Ajouter à mes études'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors leading-snug">
            {video.title}
          </h4>

          {video.description && (
            <p className="text-xs text-[#a69c8f] leading-relaxed line-clamp-2">
              {video.description}
            </p>
          )}

          {/* Alerte si vidéo stockée sur un autre appareil (PC vs Mobile) */}
          {!availability.isAvailableOnCurrentDevice && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{availability.message}</span>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                {availability.subMessage}
              </p>
            </div>
          )}

          {/* Mini repères rapides sur la carte */}
          {activeLandmarks && activeLandmarks.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-[#8c8173] font-medium">Repères :</span>
              {activeLandmarks.slice(0, 3).map((lm, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-[#201a14] border border-[#332b21] text-[10px] text-[#b8ada0]"
                >
                  {lm.label.includes(' - ') ? lm.label.split(' - ')[0] : lm.label}
                </span>
              ))}
              {activeLandmarks.length > 3 && (
                <span className="text-[10px] text-[#8c8173]">+{activeLandmarks.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[#29221b] flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setPreviewVideoId(null);
              onPlayVideo(video, sectionTitle);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-sm ${
              !availability.isAvailableOnCurrentDevice
                ? 'bg-[#261d15] hover:bg-[#322519] text-amber-300 border border-amber-700/50 hover:border-amber-600'
                : 'bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110]'
            }`}
          >
            {!availability.isAvailableOnCurrentDevice ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Voir statut & Remplacer</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Visionner & Travailler</span>
              </>
            )}
            {crossRef && <span className="text-[10px] font-normal opacity-85">({crossRef})</span>}
          </button>

          <button
            onClick={e => {
              e.stopPropagation();
              setVideoToReplace({ video, sectionKey });
            }}
            className="px-2.5 py-2 rounded-lg bg-[#221c17] hover:bg-[#2c241d] border border-[#362c21] hover:border-[#e5a93b]/50 text-[#a69c8f] hover:text-[#e5a93b] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Remplacer le lien ou le titre"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Remplacer</span>
          </button>

          <button
            onClick={e => {
              e.stopPropagation();
              setVideoToDelete({ id: video.id, title: video.title, sectionKey });
            }}
            className="p-2 rounded-lg bg-[#221c17] hover:bg-red-950/50 border border-[#362c21] hover:border-red-900/50 text-[#8c8173] hover:text-red-400 transition-colors cursor-pointer"
            title="Supprimer cette vidéo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // VUE 1 : LISTE MINIMALISTE (avec seulement leur nom, épurée et sobre)
  const renderVideoListMinimal = (video: VideoItem, sectionTitle: string, sectionKey: string, index: number) => {
    const isBookmarked = !!bookmarks[video.id];
    const availability = checkVideoDeviceAvailability(video);

    return (
      <div
        key={video.id}
        onClick={() => {
          setPreviewVideoId(null);
          onPlayVideo(video, sectionTitle);
        }}
        className="group flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#161310] hover:bg-[#201a14] border border-[#272018] hover:border-[#e5a93b]/70 transition-all cursor-pointer select-none shadow-xs"
        title="Cliquer sur le nom pour visionner et travailler ce média"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-[#221b14] group-hover:bg-[#e5a93b] text-[#e5a93b] group-hover:text-[#121110] flex items-center justify-center shrink-0 transition-colors shadow-xs">
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors truncate">
                {video.title}
              </span>
              {video.isCustom && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2a1c38] text-[#c99eff] border border-[#432b5e] shrink-0 font-medium">
                  Ajouté
                </span>
              )}
              {!availability.isAvailableOnCurrentDevice && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 inline-flex items-center gap-1 shrink-0">
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                  <span>{availability.badgeText}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions discrètes à droite */}
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              const opts = getVideoShareData({
                video,
                paloName: `${palo.name} (Danse)`,
                paloId: palo.id,
                sectionName: sectionTitle,
                discipline: 'danse'
              });
              setShareModalOptions(opts);
            }}
            className="p-1.5 rounded-lg text-[#7a6f61] hover:text-[#e5a93b] hover:bg-[#2a221b] transition-colors cursor-pointer"
            title="Partager ce média"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              toggleBookmark({
                videoId: video.id,
                paloId: palo.id,
                paloName: `${palo.name} (Danse)`,
                section: sectionTitle,
                title: video.title,
                url: video.url,
                level: video.level,
                status: 'learning',
                discipline: 'danse'
              });
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-[#e5a93b] bg-[#e5a93b]/15'
                : 'text-[#7a6f61] hover:text-[#f4efe6] hover:bg-[#2a221b]'
            }`}
            title={isBookmarked ? 'Dans mes études' : 'Ajouter à mes études'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setVideoToReplace({ video, sectionKey });
            }}
            className="p-1.5 rounded-lg text-[#7a6f61] hover:text-[#e5a93b] hover:bg-[#2a221b] transition-colors cursor-pointer"
            title="Remplacer le lien ou titre"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setVideoToDelete({ id: video.id, title: video.title, sectionKey });
            }}
            className="p-1.5 rounded-lg text-[#7a6f61] hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // VUE 2 : GRILLE D'ICÔNES (vignette/icône média avec le nom centré en dessous)
  const renderVideoGridIcons = (video: VideoItem, sectionTitle: string, sectionKey: string) => {
    const isBookmarked = !!bookmarks[video.id];
    const ytInfo = extractYouTubeInfo(video.url);
    const videoId = ytInfo.videoId;
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    const availability = checkVideoDeviceAvailability(video);

    return (
      <div
        key={video.id}
        onClick={() => {
          setPreviewVideoId(null);
          onPlayVideo(video, sectionTitle);
        }}
        className="group relative flex flex-col justify-between p-2.5 sm:p-3 rounded-xl bg-[#161310] hover:bg-[#221c16] border border-[#2b2219] hover:border-[#e5a93b]/70 transition-all cursor-pointer shadow-sm text-center select-none"
        title="Cliquer pour visionner et travailler ce média"
      >
        <div className="space-y-2">
          {/* Vignette / Icône média */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#100d0b] border border-[#292017] group-hover:border-[#e5a93b]/40 transition-colors shadow-inner flex items-center justify-center">
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <Video className="w-8 h-8 text-[#e5a93b]/60" />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-[#e5a93b]/90 text-[#121110] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#e5a93b] transition-all">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Badge icône média */}
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 border border-white/10 text-[9px] font-mono text-[#f4efe6] flex items-center gap-1">
              <Film className="w-2.5 h-2.5 text-[#e5a93b]" />
              <span>Média</span>
            </div>

            {!availability.isAvailableOnCurrentDevice && (
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-600 text-[9px] font-bold text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                <span>{availability.badgeText}</span>
              </div>
            )}
          </div>

          {/* Titre centré sous l'icône */}
          <h5 className="text-xs sm:text-sm font-bold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors line-clamp-2 leading-snug px-1 text-center font-serif">
            {video.title}
          </h5>
        </div>

        {/* Barre d'actions discrète */}
        <div className="mt-2.5 pt-2 border-t border-[#261f18] flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              toggleBookmark({
                videoId: video.id,
                paloId: palo.id,
                paloName: `${palo.name} (Danse)`,
                section: sectionTitle,
                title: video.title,
                url: video.url,
                level: video.level,
                status: 'learning',
                discipline: 'danse'
              });
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked ? 'text-[#e5a93b] bg-[#e5a93b]/15' : 'text-[#73685a] hover:text-[#f4efe6] hover:bg-[#251f18]'
            }`}
            title={isBookmarked ? 'Dans mes favoris' : 'Favori'}
          >
            <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              const opts = getVideoShareData({
                video,
                paloName: `${palo.name} (Danse)`,
                paloId: palo.id,
                sectionName: sectionTitle,
                discipline: 'danse'
              });
              setShareModalOptions(opts);
            }}
            className="p-1.5 rounded-lg text-[#73685a] hover:text-[#e5a93b] hover:bg-[#251f18] transition-colors cursor-pointer"
            title="Partager"
          >
            <Share2 className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setVideoToReplace({ video, sectionKey });
            }}
            className="p-1.5 rounded-lg text-[#73685a] hover:text-[#e5a93b] hover:bg-[#251f18] transition-colors cursor-pointer"
            title="Remplacer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setVideoToDelete({ id: video.id, title: video.title, sectionKey });
            }}
            className="p-1.5 rounded-lg text-[#73685a] hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Toast notification de partage */}
      {shareToastMessage && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#261e15] border-2 border-[#e5a93b] text-[#f4efe6] shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 rounded-lg bg-[#e5a93b]/20 text-[#e5a93b] shrink-0">
              <Share2 className="w-4 h-4" />
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#e5a93b]">
              {shareToastMessage}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShareToastMessage(null)}
            className="p-1 text-[#a69c8f] hover:text-[#f4efe6] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Card Palo Danse compact : affiché UNIQUEMENT sur la vue hub des 6 espaces */}
      {activeTab === 'hub' && (
        <div className="bg-gradient-to-br from-[#1a1612] via-[#141210] to-[#1a1210] border border-[#382d22] rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e5a93b]/15 text-[#e5a93b] border border-[#e5a93b]/30 font-bold text-xs uppercase tracking-wider shrink-0 shadow-xs">
              <FlamencoBailaoraIcon className="w-4 h-4 inline-block shrink-0 -mt-0.5 text-[#e5a93b]" />
              <span>BAILE</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#f4efe6] font-serif tracking-tight">
              {palo.name}
            </h2>
          </div>
        </div>
      )}

      {/* VUE 1 : DIRECTEMENT LES 2 ARBORESCENCES CLIQUABLES (BIBLIOTHÈQUE FLAMENCA ET ATELIER DE CRÉATION) */}
      {activeTab === 'hub' && (
        <div id="danse-espaces-etude" className="space-y-4 animate-in fade-in duration-200 scroll-mt-16 sm:scroll-mt-20">
          {/* Arborescence réelle cliquable pointant vers les mêmes pages */}
          <DanseArborescenceTree
            title="Commencer à travailler, explorer et créer"
            borderedFolders={true}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            defaultExpanded={false}
            counts={{
              maitres: getMaitresVideos().length,
              cours: getCoursVideos().length,
              letras: 3,
              compas: 'Binaire 4t',
              structure: 6,
              montages: montageKeys.length
            }}
            maitresVideos={getMaitresVideos()}
            coursVideos={getCoursVideos()}
            onPlayVideo={onPlayVideo}
            bottomContent={
              <div className="space-y-3 pt-1">
                {/* En-tête des 3 rubriques fondamentales */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#2b2118]/80 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#e5a93b] font-sans flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#e5a93b]" />
                    <span>Fondamentaux du Baile · {palo.name}</span>
                  </span>
                </div>

                {/* Les 3 rubriques du fichier DansePaloList.tsx : caractère de la danse, costume et posture, compas et dynamique */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Section 1 : Caractère de la danse */}
                  <div className="bg-[#171410] border border-[#2b2219] rounded-xl overflow-hidden transition-colors flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleInfoSection('character')}
                      className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-[#201a14] transition-colors cursor-pointer group"
                      title="Cliquer pour dérouler ou fermer le caractère de la danse"
                    >
                      <span className="text-xs sm:text-sm font-bold text-[#e5a93b] flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#e5a93b] shrink-0" />
                        <span>Caractère de la danse</span>
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 text-[#8c8173] group-hover:text-[#e5a93b] transition-transform duration-200 ${
                          openInfoSections.character ? 'rotate-180 text-[#e5a93b]' : ''
                        }`} 
                      />
                    </button>
                    {openInfoSections.character && (
                      <div className="px-3 sm:px-3.5 pb-3.5 pt-1 border-t border-[#251e16] text-xs sm:text-sm text-[#ded3c5] leading-relaxed animate-in fade-in duration-150 flex-1 flex flex-col justify-between">
                        <p>{palo.character}</p>
                        <div className="pt-2 text-right">
                          <button
                            type="button"
                            onClick={() => toggleInfoSection('character')}
                            className="text-[10px] text-[#8c8173] hover:text-[#e5a93b] font-medium underline cursor-pointer"
                          >
                            Fermer ▲
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 2 : Costume & Posture */}
                  <div className="bg-[#171410] border border-[#2b2219] rounded-xl overflow-hidden transition-colors flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleInfoSection('costume')}
                      className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-[#201a14] transition-colors cursor-pointer group"
                      title="Cliquer pour dérouler ou fermer costume et posture"
                    >
                      <span className="text-xs sm:text-sm font-bold text-[#e5a93b] flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#e5a93b] shrink-0" />
                        <span>Costume & Posture</span>
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 text-[#8c8173] group-hover:text-[#e5a93b] transition-transform duration-200 ${
                          openInfoSections.costume ? 'rotate-180 text-[#e5a93b]' : ''
                        }`} 
                      />
                    </button>
                    {openInfoSections.costume && (
                      <div className="px-3 sm:px-3.5 pb-3.5 pt-1 border-t border-[#251e16] text-xs sm:text-sm text-[#ded3c5] leading-relaxed animate-in fade-in duration-150 flex-1 flex flex-col justify-between">
                        <p>{palo.costumeAdvice}</p>
                        <div className="pt-2 text-right">
                          <button
                            type="button"
                            onClick={() => toggleInfoSection('costume')}
                            className="text-[10px] text-[#8c8173] hover:text-[#e5a93b] font-medium underline cursor-pointer"
                          >
                            Fermer ▲
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3 : Compás & Dynamique */}
                  <div className="bg-[#171410] border border-[#2b2219] rounded-xl overflow-hidden transition-colors flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleInfoSection('compas')}
                      className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-[#201a14] transition-colors cursor-pointer group"
                      title="Cliquer pour dérouler ou fermer compás et dynamique"
                    >
                      <span className="text-xs sm:text-sm font-bold text-[#e5a93b] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#e5a93b] shrink-0" />
                        <span>Compás & Dynamique</span>
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 text-[#8c8173] group-hover:text-[#e5a93b] transition-transform duration-200 ${
                          openInfoSections.compas ? 'rotate-180 text-[#e5a93b]' : ''
                        }`} 
                      />
                    </button>
                    {openInfoSections.compas && (
                      <div className="px-3 sm:px-3.5 pb-3.5 pt-1 border-t border-[#251e16] text-xs sm:text-sm text-[#ded3c5] leading-relaxed animate-in fade-in duration-150 flex-1 flex flex-col justify-between">
                        <p>{palo.compas.description}</p>
                        <div className="pt-2 text-right">
                          <button
                            type="button"
                            onClick={() => toggleInfoSection('compas')}
                            className="text-[10px] text-[#8c8173] hover:text-[#e5a93b] font-medium underline cursor-pointer"
                          >
                            Fermer ▲
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            }
          />
        </div>
      )}



      {/* TAB 1: Structure traditionnelle de la Farruca */}
      {activeTab === 'structure' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Card Guide Global */}
          <div className="bg-[#171411] border border-[#302820] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#29221b] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#e5a93b]/15 text-[#e5a93b]">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#f4efe6]">
                    L'Architecture d'une Farruca complète (Structure traditionnelle en 6 blocs)
                  </h3>
                </div>
              </div>

              {/* Bouton Partager */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleShareSpace}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#201a14] hover:bg-[#2b2219] text-[#9c9183] hover:text-[#e5a93b] border border-[#33291f] hover:border-[#4d3d2a] text-xs font-medium transition-colors cursor-pointer"
                  title="Partager un lien direct vers la structure traditionnelle"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Partager</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1813] border border-[#382c20] text-xs sm:text-sm text-[#ded3c5] leading-relaxed">
              <p>
                Vous trouverez ici la structure traditionnelle de la danse sur laquelle vous voulez travailler. Cette structure est modifiable. Elle constituera la base de vos montages. Vous pourrez la modifier à nouveau dans chacun de vos montages.
              </p>
            </div>

            {/* Visual Stepper : Blocs en menus déroulants (seul le titre est lisible au début) */}
            <div className="space-y-2.5 pt-1">
              {palo.choreographyGuide.structureSteps.map(step => {
                const isBlockOpen = !!openStructureSteps[step.stepNumber];
                const areTipsOpen = !!openStructureDetails[`${step.stepNumber}-tips`];
                const isGuitarOpen = !!openStructureDetails[`${step.stepNumber}-guitar`];

                return (
                  <div
                    key={step.stepNumber}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isBlockOpen
                        ? 'bg-[#181410] border-[#e5a93b]/50 shadow-md'
                        : 'bg-[#14120f] border-[#29221b] hover:border-[#3d3326]'
                    }`}
                  >
                    {/* En-tête du bloc cliquable : AU DÉBUT, SEUL LE TITRE EST LISIBLE */}
                    <button
                      type="button"
                      onClick={() => toggleStructureStep(step.stepNumber)}
                      className="w-full p-3.5 sm:p-4 flex items-start sm:items-center justify-between text-left hover:bg-[#1f1913]/60 transition-colors cursor-pointer group gap-3"
                      title={isBlockOpen ? "Cliquer pour replier ce bloc" : "Cliquer pour dérouler ce bloc"}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors mt-0.5 sm:mt-0 ${
                          isBlockOpen 
                            ? 'bg-[#e5a93b] text-[#121110] shadow-sm' 
                            : 'bg-[#e5a93b]/15 border border-[#e5a93b]/30 text-[#e5a93b]'
                        }`}>
                          {step.stepNumber}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-[#e5a93b]/20 text-[#e5a93b]">
                              Bloc {step.stepNumber}
                            </span>
                            <span className="text-[10px] sm:text-xs font-mono text-[#a69c8f] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#e5a93b]" />
                              <span>{step.durationApprox}</span>
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors font-serif leading-snug break-words">
                            {step.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-center sm:self-auto">
                        <span className="text-[11px] text-[#8c8173] group-hover:text-[#e5a93b] hidden sm:inline font-medium">
                          {isBlockOpen ? 'Replier' : 'Dérouler'}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#8c8173] group-hover:text-[#e5a93b] transition-transform duration-200 ${
                            isBlockOpen ? 'rotate-180 text-[#e5a93b]' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Contenu déroulant du bloc */}
                    {isBlockOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-[#261f18] space-y-3 animate-in fade-in duration-150">
                        {/* Description du bloc */}
                        <div className="p-3 rounded-xl bg-[#1b1713] border border-[#2c231a] text-xs sm:text-sm text-[#d4c9ba] leading-relaxed">
                          {step.description}
                        </div>

                        {/* Sous-menus déroulants : Conseils de danse et Code guitariste (titres seuls visibles au début) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* 1. Menu déroulant : Conseils de danse */}
                          <div className="rounded-xl border bg-[#15120f] border-[#2a2219] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => toggleStructureDetail(`${step.stepNumber}-tips`)}
                              className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-[#1e1812] transition-colors cursor-pointer group/tips"
                              title="Cliquer pour afficher ou masquer les conseils de danse"
                            >
                              <span className="text-xs font-semibold text-[#e5a93b] flex items-center gap-1.5">
                                <Footprints className="w-3.5 h-3.5 shrink-0" />
                                <span>Conseils de danse</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#e5a93b]/15 text-[#e5a93b] font-mono">
                                  {step.danceTips.length}
                                </span>
                              </span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-[#8c8173] group-hover/tips:text-[#e5a93b] transition-transform duration-200 ${
                                  areTipsOpen ? 'rotate-180 text-[#e5a93b]' : ''
                                }`}
                              />
                            </button>

                            {areTipsOpen && (
                              <div className="px-3 pb-3 pt-1 border-t border-[#231c15] text-xs text-[#a69c8f] animate-in fade-in duration-150 space-y-2">
                                <ul className="space-y-1.5 pt-1">
                                  {step.danceTips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                                      <span className="text-[#e5a93b] font-bold shrink-0">•</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="pt-1 text-right">
                                  <button
                                    type="button"
                                    onClick={() => toggleStructureDetail(`${step.stepNumber}-tips`)}
                                    className="text-[10px] text-[#8c8173] hover:text-[#e5a93b] font-medium underline cursor-pointer"
                                  >
                                    Fermer ▲
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. Menu déroulant : Code avec le guitariste */}
                          <div className="rounded-xl border bg-[#15120f] border-[#2a2219] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => toggleStructureDetail(`${step.stepNumber}-guitar`)}
                              className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-[#1e1812] transition-colors cursor-pointer group/guitar"
                              title="Cliquer pour afficher ou masquer le code guitariste"
                            >
                              <span className="text-xs font-semibold text-[#70b1ff] flex items-center gap-1.5">
                                <Music className="w-3.5 h-3.5 shrink-0" />
                                <span>Code avec le guitariste</span>
                              </span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-[#8c8173] group-hover/guitar:text-[#70b1ff] transition-transform duration-200 ${
                                  isGuitarOpen ? 'rotate-180 text-[#70b1ff]' : ''
                                }`}
                              />
                            </button>

                            {isGuitarOpen && (
                              <div className="px-3 pb-3 pt-1 border-t border-[#231c15] text-xs text-[#a69c8f] animate-in fade-in duration-150 space-y-2">
                                <p className="leading-relaxed pt-1">
                                  {step.communicationWithGuitar}
                                </p>
                                <div className="pt-1 text-right">
                                  <button
                                    type="button"
                                    onClick={() => toggleStructureDetail(`${step.stepNumber}-guitar`)}
                                    className="text-[10px] text-[#8c8173] hover:text-[#70b1ff] font-medium underline cursor-pointer"
                                  >
                                    Fermer ▲
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bouton pour replier ce bloc */}
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => toggleStructureStep(step.stepNumber)}
                            className="text-[11px] text-[#8c8173] hover:text-[#e5a93b] font-medium transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>Replier ce bloc</span>
                            <span>▲</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Conseils pour réussir le montage */}
            <div className="p-4 rounded-xl bg-[#1b1713] border border-[#30271f] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5a93b] flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Règles d'or pour monter sa chorégraphie</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-[#a69c8f] leading-relaxed">
                {palo.choreographyGuide.mountingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#e5a93b] font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Grands Maîtres & Références */}
      {activeTab === 'maitres' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#171411] border border-[#2e261f] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[#f4efe6] flex items-center gap-2">
                <span>Interprétations de Référence & Grands Maîtres</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#e5a93b]/20 text-[#e5a93b] font-normal">
                  Inspiration & Caractère
                </span>
              </h4>
              <p className="text-xs text-[#8c8173] mt-1">
                Les versions d'anthologie d'Iván Vargas, El Güito, Antonio Gades, Sara Baras et Farruquito pour imprégner son regard et sa ligne de corps.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
              {/* Commutateur de vue : Liste (minimaliste nom seul) / Icônes / Cartes */}
              <div className="flex items-center rounded-lg bg-[#14120f] p-0.5 border border-[#302820]">
                <button
                  type="button"
                  onClick={() => handleSetMediaViewMode('list')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    mediaViewMode === 'list'
                      ? 'bg-[#e5a93b] text-[#121110] font-bold shadow-xs'
                      : 'text-[#8c8173] hover:text-[#f4efe6]'
                  }`}
                  title="Vue liste minimaliste (seulement les noms)"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Liste</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetMediaViewMode('icons')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    mediaViewMode === 'icons'
                      ? 'bg-[#e5a93b] text-[#121110] font-bold shadow-xs'
                      : 'text-[#8c8173] hover:text-[#f4efe6]'
                  }`}
                  title="Vue icônes (vignettes & noms)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Icônes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetMediaViewMode('cards')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    mediaViewMode === 'cards'
                      ? 'bg-[#e5a93b] text-[#121110] font-bold shadow-xs'
                      : 'text-[#8c8173] hover:text-[#f4efe6]'
                  }`}
                  title="Vue cartes détaillées"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Détaillée</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleShareSpace}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#201a14] hover:bg-[#2b2219] text-[#9c9183] hover:text-[#e5a93b] border border-[#33291f] hover:border-[#4d3d2a] text-xs font-medium transition-colors cursor-pointer"
                title="Partager un lien direct vers les Grands Maîtres"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Partager</span>
              </button>
              <button
                onClick={() => onOpenAddVideo('maitres')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#221d18] hover:bg-[#2c241c] border border-[#e5a93b]/50 hover:border-[#e5a93b] text-xs font-semibold text-[#e5a93b] cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une vidéo</span>
              </button>
            </div>
          </div>

          {/* Rendu dynamique des médias selon le mode choisi */}
          {mediaViewMode === 'list' ? (
            <div className="space-y-1.5">
              {getMaitresVideos().map((v, i) => renderVideoListMinimal(v, 'Grands Maîtres', 'maitres', i))}
            </div>
          ) : mediaViewMode === 'icons' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {getMaitresVideos().map(v => renderVideoGridIcons(v, 'Grands Maîtres', 'maitres'))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getMaitresVideos().map(v => renderVideoCard(v, 'Grands Maîtres', 'maitres'))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Letras & Textes Traditionnels */}
      {activeTab === 'letras' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card Letras */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#171411] border border-[#2e261f] shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#e5a93b]/15 text-[#e5a93b]">
                  <Quote className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#f4efe6]">
                    Letras Traditionnelles por Farruca
                  </h3>
                  <p className="text-xs text-[#a69c8f]">
                    Poésie, textes espagnols originaux, traductions françaises et interprétations de référence
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201912] border border-[#3d2f1f] text-xs font-semibold text-[#e5a93b]">
                  <Languages className="w-3.5 h-3.5" />
                  <span>Bilingue ES / FR</span>
                </span>
                <button
                  type="button"
                  onClick={handleShareSpace}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#201a14] hover:bg-[#2b2219] text-[#9c9183] hover:text-[#e5a93b] border border-[#33291f] hover:border-[#4d3d2a] text-xs font-medium transition-colors cursor-pointer"
                  title="Partager un lien direct vers les Letras traditionnelles"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Partager</span>
                </button>
              </div>
            </div>

            <div className="bg-[#1f1a14] border border-[#332a20] rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-[#d4c9ba] leading-relaxed space-y-2">
              <p>
                <strong className="text-[#e5a93b]">L'âme du chant dans la danse :</strong> Même si la Farruca est célèbre pour ses frappes de pieds tranchantes, la <strong className="text-[#f4efe6]">Letra</strong> en constitue le cœur émotionnel. C'est le moment sacré où les pieds cessent de claquer pour laisser résonner la voix et permettre au corps de sculpter l'espace.
              </p>
              <p className="text-[11px] sm:text-xs text-[#8c8173]">
                💡 <em>Règle d'or pour la danseuse ou le danseur :</em> Ne marchez ou ne tournez que pour soutenir la ligne mélodique. Écoutez la chute des rimes pour préparer votre remate ou votre llamada.
              </p>
            </div>
          </div>

          {/* List of Letras */}
          <div className="space-y-6">
            {palo.letras && palo.letras.length > 0 ? (
              palo.letras.map((letra, index) => {
                const isBookmarked = !!bookmarks[letra.video.id];

                return (
                  <div
                    key={letra.id}
                    className="rounded-2xl bg-[#171411] border border-[#2e261f] hover:border-[#e5a93b]/50 transition-all shadow-md overflow-hidden"
                  >
                    {/* Top Bar with category and bookmark button */}
                    <div className="p-4 sm:p-5 border-b border-[#262019] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1c1813]/60">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2e2213] text-[#e5a93b] border border-[#4d3a20]">
                            {letra.category}
                          </span>
                          <span className="text-xs text-[#8c8173]">
                            Letra #{index + 1}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-[#f4efe6]">
                          {letra.title}
                        </h4>
                        <p className="text-xs text-[#a69c8f]">
                          Interprétations de référence : <span className="text-[#d4c9ba] font-medium">{letra.cantaorReference}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(() => {
                          const crossRef = letra.video?.url ? getCrossSectionReference(letra.video.url, 'Letras') : null;
                          return (
                            <button
                              onClick={() => onPlayVideo(letra.video, `Letra: ${letra.title}`)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#e5a93b] text-[#121110] hover:bg-[#f0b952] font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98"
                              title="Écouter le chant en vidéo"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Écouter le Cante</span>
                              {crossRef && <span className="text-[10px] opacity-85 font-normal">({crossRef})</span>}
                            </button>
                          );
                        })()}

                        <button
                          onClick={() => {
                            toggleBookmark({
                              videoId: letra.video.id,
                              paloId: palo.id,
                              paloName: `${palo.name} (Danse - Letra)`,
                              section: "Letras & Textes",
                              title: letra.video.title,
                              url: letra.video.url,
                              level: letra.video.level,
                              status: 'learning',
                              discipline: 'danse'
                            });
                          }}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isBookmarked
                              ? 'bg-[#e5a93b]/20 text-[#e5a93b] border-[#e5a93b]/50'
                              : 'bg-[#221c17] text-[#7a6f61] border-[#362c21] hover:text-[#f4efe6]'
                          }`}
                          title={isBookmarked ? 'Enregistré dans mes études' : 'Ajouter à mes études de danse'}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Bilingual Text Grid */}
                    <div className="p-4 sm:p-5 space-y-5">
                      {/* Salida (if exists) */}
                      {letra.salidaText && letra.salidaText.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-[#14110e] border border-[#2b2219] space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#e5a93b] uppercase tracking-wider">
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Salida Vocale (Lancement au compás)</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                            <div className="space-y-1 font-serif italic text-[#f4efe6]">
                              {letra.salidaText.map((line, lIdx) => (
                                <p key={lIdx} className="leading-relaxed">{line}</p>
                              ))}
                            </div>
                            <div className="space-y-1 text-[#a69c8f] border-t md:border-t-0 md:border-l border-[#262018] pt-2 md:pt-0 md:pl-3">
                              {letra.salidaTranslation?.map((line, lIdx) => (
                                <p key={lIdx} className="leading-relaxed">{line}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Main Copla */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#1b1712] p-4 rounded-xl border border-[#302820]">
                        {/* Col 1: Spanish original */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#e5a93b] flex items-center gap-1.5">
                            <span>🇪🇸 Texte Original Espagnol</span>
                          </span>
                          <div className="space-y-1 text-sm sm:text-base font-serif font-medium text-[#f4efe6] bg-[#14120f] p-3 rounded-lg border border-[#262018]">
                            {letra.coplaText.map((line, lIdx) => (
                              <p key={lIdx} className="leading-relaxed tracking-wide">
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Col 2: French Translation */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#71d28c] flex items-center gap-1.5">
                            <span>🇫🇷 Traduction Française</span>
                          </span>
                          <div className="space-y-1 text-sm sm:text-base text-[#d4c9ba] bg-[#14120f] p-3 rounded-lg border border-[#262018]">
                            {letra.coplaTranslation.map((line, lIdx) => (
                              <p key={lIdx} className="leading-relaxed italic">
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Estribillo (if exists) */}
                      {letra.estribilloText && letra.estribilloText.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-[#201811] border border-[#382b1c] space-y-2">
                          <span className="text-[11px] font-bold text-[#e5a93b] uppercase tracking-wider block">
                            Estribillo (Refrain traditionnel)
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                            <div className="space-y-1 font-serif text-[#f4efe6]">
                              {letra.estribilloText.map((line, lIdx) => (
                                <p key={lIdx} className="leading-relaxed font-semibold">{line}</p>
                              ))}
                            </div>
                            <div className="space-y-1 text-[#a69c8f] border-t md:border-t-0 md:border-l border-[#302416] pt-2 md:pt-0 md:pl-3">
                              {letra.estribilloTranslation?.map((line, lIdx) => (
                                <p key={lIdx} className="leading-relaxed">{line}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Context & Meaning */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-[#14120f] border border-[#262018] space-y-1">
                          <span className="font-bold text-[#e5a93b] uppercase tracking-wider block text-[10px]">
                            📜 Contexte Poétique & Origines
                          </span>
                          <p className="text-[#a69c8f] leading-relaxed">
                            {letra.contextAndMeaning}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#14120f] border border-[#262018] space-y-1">
                          <span className="font-bold text-[#71d28c] uppercase tracking-wider block text-[10px]">
                            👣 Conseils pour le Baile & le Compás
                          </span>
                          <p className="text-[#d4c9ba] leading-relaxed">
                            {letra.danceCompasTips}
                          </p>
                        </div>
                      </div>

                      {/* Audio / Video reference pill */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#1b1712] border border-[#2b221a] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-[#e5a93b]/20 text-[#e5a93b]">
                            <Music className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="font-bold text-[#f4efe6] block">
                              {letra.video.title}
                            </span>
                            <span className="text-[#8c8173] text-[11px] line-clamp-1">
                              {letra.video.description}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onPlayVideo(letra.video, `Letra: ${letra.title}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262019] hover:bg-[#332b21] text-[#e5a93b] font-semibold text-xs border border-[#3d3225] shrink-0 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Lire l'extrait</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-[#171411] border border-[#2e261f] rounded-2xl text-[#8c8173]">
                Aucune letra enregistrée pour ce palo.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Compás & Métronome (4 temps) */}
      {activeTab === 'compas' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-[#171411] border border-[#2e261f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-[#f4efe6] flex items-center gap-2">
                <span>Compás Binaire & Métronome de Farruca</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#e5a93b]/20 text-[#e5a93b] font-normal">
                  4 Temps
                </span>
              </h4>
              <p className="text-xs text-[#8c8173] mt-1">
                Pulsation régulière à 4 temps. Vous pouvez écouter et vous entraîner au tempo exact avec <strong className="text-[#e5a93b]">Cajón + Palmas réels</strong> (recommandé pour la danse), <strong className="text-[#e5a93b]">Cajón seul</strong> (basse & slap) ou <strong className="text-[#e5a93b]">Palmas seules</strong> (sordas & secas).
              </p>
            </div>
            <div className="shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleShareSpace}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#201a14] hover:bg-[#2b2219] text-[#9c9183] hover:text-[#e5a93b] border border-[#33291f] hover:border-[#4d3d2a] text-xs font-medium transition-colors cursor-pointer"
                title="Partager un lien direct vers le Compás"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Partager</span>
              </button>
            </div>
          </div>

          <CompasVisualizer
            compas={palo.compas}
            isPlaying={isMetronomePlaying}
            onTogglePlay={onToggleMetronome}
          />

          {/* Guide Rythmique Baile : Cajón & Palmas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="p-4 rounded-xl bg-[#171411] border border-[#2e261f] space-y-2">
              <h5 className="text-xs font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-2">
                <span>🥁 Dialogue Cajón & Palmas pour la Danse</span>
              </h5>
              <div className="space-y-2 text-xs text-[#a69c8f]">
                <div className="p-2.5 rounded-lg bg-[#201a15] border border-[#2e251e]">
                  <strong className="text-[#f4efe6] block mb-1">Temps 1 & 3 (Accents majeurs) :</strong>
                  Frappe de <span className="text-[#e5a93b]">Slap aigu</span> en haut du cajón (avec le timbre métallique des cordes) combinée à la <span className="text-[#e5a93b]">Palma seca</span> claquée. C'est l'assise du pied d'appui ou la chute du marcaje.
                </div>
                <div className="p-2.5 rounded-lg bg-[#201a15] border border-[#2e251e]">
                  <strong className="text-[#f4efe6] block mb-1">Temps 2 & 4 (Temps légers / Passage) :</strong>
                  Frappe <span className="text-[#d4c9ba]">Basse ronde</span> au centre de la tapa du cajón et <span className="text-[#d4c9ba]">Palma sorda</span> feutrée (mains en creux), assurant le souffle et la respiration du mouvement.
                </div>
                <div className="p-2.5 rounded-lg bg-[#201a15] border border-[#2e251e]">
                  <strong className="text-[#f4efe6] block mb-1">Subida & Escobilla :</strong>
                  Le cajón et les palmas doublent en croches ou doubles-croches pour porter le zapateado vers le sommet d'énergie (remate).
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#171411] border border-[#2e261f] space-y-3">
              <h5 className="text-xs font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-2">
                <span>🎧 Bases Rythmiques Réelles (Studio & Live)</span>
              </h5>
              <p className="text-xs text-[#8c8173]">
                Pour répéter dans les conditions d'un tablao avec de vrais musiciens palmeros et cajoneros :
              </p>
              <div className="space-y-2">
                <a
                  href="https://www.youtube.com/results?search_query=solo+compas+farruca+cajon+palmas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#201a15] hover:bg-[#2a221b] border border-[#2e251e] text-xs transition-colors group cursor-pointer"
                >
                  <div>
                    <span className="font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] block">
                      Album de référence « Sólo Compás Farruca »
                    </span>
                    <span className="text-[11px] text-[#8c8173]">
                      Enregistrements cultes avec palmas et cajón réels à tous tempos (80, 100, 120, 140 BPM)
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#8c8173] group-hover:text-[#e5a93b] shrink-0 ml-2" />
                </a>

                <a
                  href="https://www.youtube.com/results?search_query=base+ritmica+farruca+120+bpm+cajon+palmas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#201a15] hover:bg-[#2a221b] border border-[#2e251e] text-xs transition-colors group cursor-pointer"
                >
                  <div>
                    <span className="font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] block">
                      Bases rythmiques de Farruca à 120 BPM
                    </span>
                    <span className="text-[11px] text-[#8c8173]">
                      Accompagnement continu avec 2 palmeros et cajón flamenco pour travail du zapateado
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#8c8173] group-hover:text-[#e5a93b] shrink-0 ml-2" />
                </a>

                <a
                  href="https://www.youtube.com/results?search_query=metronomo+flamenco+oscar+herrero+farruca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#201a15] hover:bg-[#2a221b] border border-[#2e251e] text-xs transition-colors group cursor-pointer"
                >
                  <div>
                    <span className="font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] block">
                      Flamencómetro Oscar Herrero - Farruca
                    </span>
                    <span className="text-[11px] text-[#8c8173]">
                      Vraies pistes d'études avec percussions flamencas et marquages traditionnels
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#8c8173] group-hover:text-[#e5a93b] shrink-0 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Cours/Tutoriels/Stages/Vidéos personnelles */}
      {activeTab === 'cours' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Card & Actions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#171411] border border-[#2e261f] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#e5a93b]/15 text-[#e5a93b]">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#f4efe6]">
                  Mes Cours & Stages
                </h3>
              </div>
              <p className="text-xs text-[#a69c8f]">
                Vos vidéos de répétitions, retours de stages, cours réguliers et entraînements personnels pour la Farruca.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
              {/* Commutateur de vue : Liste (minimaliste nom seul) / Icônes / Cartes */}
              <div className="flex items-center rounded-lg bg-[#14120f] p-0.5 border border-[#302820]">
                <button
                  type="button"
                  onClick={() => handleSetMediaViewMode('list')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    mediaViewMode === 'list'
                      ? 'bg-[#e5a93b] text-[#121110] font-bold shadow-xs'
                      : 'text-[#8c8173] hover:text-[#f4efe6]'
                  }`}
                  title="Vue liste minimaliste (seulement les noms)"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Liste</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetMediaViewMode('icons')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    mediaViewMode === 'icons'
                      ? 'bg-[#e5a93b] text-[#121110] font-bold shadow-xs'
                      : 'text-[#8c8173] hover:text-[#f4efe6]'
                  }`}
                  title="Vue icônes (vignettes & noms)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Icônes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetMediaViewMode('cards')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    mediaViewMode === 'cards'
                      ? 'bg-[#e5a93b] text-[#121110] font-bold shadow-xs'
                      : 'text-[#8c8173] hover:text-[#f4efe6]'
                  }`}
                  title="Vue cartes détaillées"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Détaillée</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleShareSpace}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#201a14] hover:bg-[#2b2219] text-[#9c9183] hover:text-[#e5a93b] border border-[#33291f] hover:border-[#4d3d2a] text-xs font-medium transition-colors cursor-pointer"
                title="Partager un lien direct vers Cours & Stages"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Partager</span>
              </button>
              <button
                onClick={() => onOpenAddVideo('cours')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#221d18] hover:bg-[#2c241c] border border-[#e5a93b]/50 hover:border-[#e5a93b] text-xs font-semibold text-[#e5a93b] cursor-pointer transition-all shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une vidéo</span>
              </button>
            </div>
          </div>

          {/* Bandeau Conseil Synchronisation Multi-écrans */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#1c1813] border border-[#382d20] flex items-start gap-3 text-xs text-[#c9bcaa] shadow-sm">
            <Lightbulb className="w-4 h-4 text-[#e5a93b] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#f4efe6]">Conseil synchronisation :</strong> Privilégiez les liens web (ex. <span className="text-[#e5a93b] font-semibold">YouTube en « Non répertorié »</span> <span className="text-[#8c8173]">(invisible au public et au moteur de recherche)</span>, <span className="text-[#e5a93b] font-semibold">Vimeo</span> ou <span className="text-[#e5a93b] font-semibold">Google Drive</span>) pour visionner vos répétitions indifféremment sur votre PC et votre smartphone.
            </p>
          </div>

          {/* Affichage des vidéos de cours selon le mode choisi */}
          {getCoursVideos().length > 0 ? (
            mediaViewMode === 'list' ? (
              <div className="space-y-1.5">
                {getCoursVideos().map((v, i) => renderVideoListMinimal(v, 'Mes Cours & Stages', 'cours', i))}
              </div>
            ) : mediaViewMode === 'icons' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {getCoursVideos().map(v => renderVideoGridIcons(v, 'Mes Cours & Stages', 'cours'))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getCoursVideos().map(v => renderVideoCard(v, 'Mes Cours & Stages', 'cours'))}
              </div>
            )
          ) : (
            <div className="bg-[#171411] border border-[#302820] rounded-2xl p-6 sm:p-8 shadow-lg text-center max-w-2xl mx-auto space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#e5a93b]/15 border border-[#e5a93b]/30 flex items-center justify-center text-[#e5a93b]">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif">
                  Votre carnet d'entraînement est prêt
                </h4>
                <p className="text-xs sm:text-sm text-[#a69c8f] max-w-lg mx-auto leading-relaxed">
                  Ajoutez ici vos vidéos de cours réguliers, retours de stages, tutoriels et enregistrements de répétitions pour la Farruca.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1f1a15] border border-[#332a21] text-xs text-[#c9bcaa] max-w-md mx-auto space-y-2 text-left">
                <div className="flex items-center gap-2 text-[#e5a93b] font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Fonctionnalités incluses :</span>
                </div>
                <ul className="space-y-1 pl-1 text-[11px] text-[#9b9082]">
                  <li>• Importation immédiate de vos liens de cours et stages</li>
                  <li>• Repères chronométrés personnalisés (ralentis, boucles)</li>
                  <li>• Liaison directe possible avec les blocs de votre atelier de création</li>
                  <li>• Synchronisation instantanée entre votre PC et votre mobile</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => onOpenAddVideo('cours')}
                  className="px-4 py-2.5 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une première vidéo de cours</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Mon carnet de montage */}
      {activeTab === 'montages' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Sub-sections tabs: Mon atelier de création dynamique */}
          <div className="bg-[#171411] border border-[#2e261e] p-3 sm:p-3.5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between gap-2.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-[#f4efe6] font-serif flex items-center gap-2">
                <Film className="w-4 h-4 text-[#e5a93b]" />
                <span>Mon atelier de création</span>
              </h3>

              <button
                type="button"
                onClick={() => setShowShareMontageModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241d15] hover:bg-[#302519] text-[#e5a93b] hover:text-[#fff] border border-[#443622] hover:border-[#e5a93b] text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Partager un lien intelligent vers ce montage chorégraphique"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Partager ce montage</span>
              </button>
            </div>

            {/* Navigation pills for dynamic montages + Ajouter un montage */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar flex-wrap sm:flex-nowrap">
              {montageKeys.map(key => {
                const label = getMontageLabel(key);
                const count = (montagesData[key] || []).length;
                const isActive = activeMontageKey === key;
                const isVal = !!montagesValidated[key];
                const canDelete = true;

                return (
                  <div
                    key={key}
                    className={`inline-flex items-center rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#e5a93b] text-[#121110] shadow-md shadow-[#e5a93b]/20 scale-102 font-bold'
                        : 'bg-[#1e1914] text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#27201a] border border-[#332a20]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveMontageKey(key)}
                      className="px-3.5 py-2 text-xs sm:text-sm font-bold cursor-pointer flex items-center gap-2 whitespace-nowrap"
                    >
                      <span>{label}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-[#121110]/25 text-[#121110]'
                            : 'bg-[#14120f] text-[#8c8173]'
                        }`}
                      >
                        {isVal && count > 0 ? `${count} ${count > 1 ? 'blocs' : 'bloc'}` : 'Choisir les blocs'}
                      </span>
                    </button>

                    {isActive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMontageKey(key);
                          setEditingMontageTitleValue(label);
                        }}
                        className="px-1.5 py-2 cursor-pointer transition-colors text-[#121110]/70 hover:text-[#121110]"
                        title={`Renommer ${label}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMontageToDelete(key);
                        }}
                        className={`pr-2.5 pl-1 py-2 cursor-pointer transition-colors ${
                          isActive
                            ? 'text-[#121110]/70 hover:text-red-900'
                            : 'text-[#8c8173] hover:text-red-400'
                        }`}
                        title={`Supprimer ${label}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                id="danse-btn-ajouter-montage"
                onClick={handleAddMontage}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2a2219] hover:bg-[#382d21] active:scale-95 border border-[#e5a93b]/60 hover:border-[#e5a93b] text-[#e5a93b] hover:text-[#fff] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
                title="Créer un nouveau montage (0 bloc par défaut)"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Ajouter un montage</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* MODE 1: SÉLECTION INITIALE DES 6 BLOCS (Numéro et Titre) */}
          {/* ========================================================= */}
          {!isCurrentMontageValidated ? (
            <div className="bg-[#15120f] border border-[#2e261e] p-4 sm:p-6 rounded-2xl space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292119]">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif flex items-center gap-2 flex-wrap">
                    <Layers className="w-5 h-5 text-[#e5a93b]" />
                    <span className="text-[#f4efe6]">{activeMontageLabel}</span>
                    <span className="text-[#73685a] font-normal text-sm sm:text-base">·</span>
                    <span className="text-[#e5a93b] font-medium text-sm sm:text-base">Choisir les blocs</span>
                  </h4>
                  <p className="text-xs text-[#b8ada0] mt-1">
                    Cochez les blocs que vous souhaitez intégrer dans votre montage, puis cliquez sur « Valider » pour afficher tous les textes et détails.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleSelectAllBlocks}
                    className="px-2.5 py-1 rounded-lg bg-[#221c17] hover:bg-[#2e261f] text-xs font-semibold text-[#e5a93b] border border-[#3d3224] transition-colors cursor-pointer"
                  >
                    Tout cocher
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllBlocks}
                    className="px-2.5 py-1 rounded-lg bg-[#221c17] hover:bg-[#2e261f] text-xs font-semibold text-[#8c8173] hover:text-[#b8ada0] border border-[#332a21] transition-colors cursor-pointer"
                  >
                    Tout décocher
                  </button>
                </div>
              </div>

              {/* Grid des 6 blocs : UNIQUEMENT LE NUMÉRO ET LE TITRE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {referenceFarrucaBlocks.map((refBlock, idx) => {
                  const isSelected = currentSelectedIds.includes(refBlock.id);
                  return (
                    <div
                      key={refBlock.id}
                      onClick={() => handleToggleBlockSelection(refBlock.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 select-none active:scale-99 ${
                        isSelected
                          ? 'bg-[#221a12] border-[#e5a93b] text-[#f4efe6] shadow-md shadow-[#e5a93b]/10'
                          : 'bg-[#14120f] border-[#29221b] text-[#8c8173] hover:border-[#3d3122] hover:text-[#c7baa8]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#e5a93b] text-[#121110]'
                              : 'bg-[#1e1914] text-[#73685a] border border-[#2e261f]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className={`block font-bold text-sm sm:text-base leading-snug truncate ${
                            isSelected ? 'text-[#f4efe6]' : 'text-[#8c8173]'
                          }`}>
                            {refBlock.title}
                          </span>
                          <span className="text-[11px] text-[#73685a]">
                            Bloc {idx + 1} de la Farruca
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#e5a93b] border-[#e5a93b] text-[#121110]'
                            : 'border-[#382e22] bg-[#1a1612]'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barre de validation */}
              <div className="pt-3 border-t border-[#292119] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#a69c8f]">
                  <strong className="text-[#e5a93b] font-bold text-sm">
                    {currentSelectedIds.length}
                  </strong> bloc{currentSelectedIds.length > 1 ? 's' : ''} sélectionné{currentSelectedIds.length > 1 ? 's' : ''} sur 6
                </div>

                <button
                  onClick={handleValidateMontageSelection}
                  disabled={currentSelectedIds.length === 0}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] disabled:opacity-30 disabled:pointer-events-none text-[#121110] font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-[#e5a93b]/20 transition-all active:scale-98 cursor-pointer"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                  <span>Valider {activeMontageLabel} ({currentSelectedIds.length} blocs)</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* MODE 2: VUE VALIDÉE AVEC TOUS LES TEXTES ET CONTRÔLES     */
            /* ========================================================= */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header Banner Mode Validé */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#15120f] border border-[#2b231b] p-3 sm:p-3.5 rounded-xl">
                {/* Nom du montage + Choisir les blocs à côté à droite */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-[#f4efe6] font-serif flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-[#e5a93b]" />
                      <span>{activeMontageLabel}</span>
                    </span>

                    {/* Choisir les blocs à côté à droite du nom du montage */}
                    <button
                      type="button"
                      onClick={handleEditSelection}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#221c17] hover:bg-[#2c241e] text-[#e5a93b] hover:text-[#f5b84c] text-xs font-semibold inline-flex items-center gap-1.5 border border-[#3e3223] transition-colors cursor-pointer shrink-0"
                      title="Modifier les blocs choisis pour ce montage"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Choisir les blocs ({currentMontageBlocks.length}/6)</span>
                    </button>
                  </div>

                  {/* Commutateur de vue : Vue rapide / Timeline / Vue déroulée / Mes liens */}
                  <div className="flex items-center rounded-xl bg-[#1e1914] p-1 border border-[#332a21] shrink-0 self-start sm:self-auto flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setMontageViewMode('split')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        montageViewMode === 'split'
                          ? 'bg-[#e5a93b] text-[#121110]'
                          : 'text-[#a69c8f] hover:text-[#f4efe6]'
                      }`}
                      title="Vue rapide : liste des blocs et détails interactifs"
                    >
                      Vue rapide
                    </button>
                    <button
                      type="button"
                      id="montage-tab-timeline"
                      onClick={() => setMontageViewMode('timeline')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        montageViewMode === 'timeline'
                          ? 'bg-[#e5a93b] text-[#121110]'
                          : 'text-[#a69c8f] hover:text-[#f4efe6]'
                      }`}
                      title="Timeline : frise chronologique avec glisser-déposer des blocs"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Timeline</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMontageViewMode('expanded')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        montageViewMode === 'expanded'
                          ? 'bg-[#e5a93b] text-[#121110]'
                          : 'text-[#a69c8f] hover:text-[#f4efe6]'
                      }`}
                      title="Vue déroulée : tous les blocs les uns sous les autres"
                    >
                      Vue déroulée
                    </button>
                    <button
                      type="button"
                      id="montage-tab-mes-liens"
                      onClick={() => setMontageViewMode('links')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        montageViewMode === 'links'
                          ? 'bg-[#e5a93b] text-[#121110]'
                          : 'text-[#a69c8f] hover:text-[#f4efe6]'
                      }`}
                      title="Mes liens : associer des repères de vidéos à chaque bloc"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Mes liens</span>
                    </button>
                  </div>
                </div>

                {/* Actions alignées PLUS À DROITE sur mobile et sur desktop */}
                <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                  {/* Créer un bloc */}
                  <button
                    onClick={() => {
                      setMontageModalState({ isOpen: true, block: null });
                    }}
                    className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] text-xs font-bold inline-flex items-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
                    <span>Créer un bloc</span>
                  </button>
                </div>
              </div>

              {currentMontageBlocks.length === 0 ? (
                <div className="bg-[#171411] border border-[#302820] rounded-2xl p-8 text-center space-y-3">
                  <p className="text-sm text-[#a69c8f]">
                    <strong className="text-[#f4efe6]">{activeMontageLabel}</strong> ne contient aucun bloc pour l'instant (0 bloc).
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handleEditSelection}
                      className="px-4 py-2 rounded-xl bg-[#e5a93b] text-[#121110] font-bold text-xs inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Choisir les blocs</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Frise chronologique interactive avec glisser-déposer des blocs */}
                  {montageViewMode !== 'links' && (
                    <MontageTimeline
                      blocks={currentMontageBlocks}
                      activeMontageKey={activeMontageKey}
                      activeMontageLabel={activeMontageLabel}
                      selectedBlockId={activeSelectedBlock?.id}
                      onSelectBlock={(id) => handleSelectBlock(id)}
                      onReorderBlocks={handleReorderMontageBlocks}
                      onEditBlock={(block, idx) => setMontageModalState({ isOpen: true, block, blockIndex: idx })}
                      onDeleteBlock={(id, title) => setBlockToDelete({ id, title })}
                      onCreateBlock={() => setMontageModalState({ isOpen: true, block: null })}
                      onResetOrder={handleResetMontageOrder}
                      blockLinks={blockLinks[activeMontageKey] || {}}
                      onPlayLinkedVideo={handlePlayLinkedVideo}
                      onOpenLinkPicker={handleOpenLinkPicker}
                      variant={montageViewMode === 'timeline' ? 'full' : 'strip'}
                      onSwitchToFullView={() => setMontageViewMode('timeline')}
                    />
                  )}

                  {montageViewMode === 'split' ? (
                /* ========================================================= */
                /* VUE RAPIDE : BLOCS & DÉTAILS AVEC ADAPTATION ÉCRAN        */
                /* ========================================================= */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 items-start">
                  {/* COLONNE GAUCHE : LISTE DES BLOCS AVEC TITRES EN PLUS PETIT */}
                  <div id="montage-blocks-list-container" className="md:col-span-5 lg:col-span-4 space-y-3">
                    <div className="bg-[#15120f] border border-[#2b221a] rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-md">
                      <div className="flex items-center justify-between pb-2 border-b border-[#261f18]">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#e5a93b] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Blocs choisis ({currentMontageBlocks.length})</span>
                        </span>
                        <span className="text-[11px] text-[#8c8173]">
                          Glisser pour réordonner
                        </span>
                      </div>

                      {/* Liste verticale compacte avec glisser-déposer */}
                      <div className="space-y-1.5 max-h-[calc(100vh-240px)] md:overflow-y-auto pr-0.5 custom-scrollbar">
                        {currentMontageBlocks.map((block, index) => {
                          const isSelected = activeSelectedBlock?.id === block.id;
                          const isExpandedOnMobile = mobileExpandedBlockId === block.id;
                          const shortSpanishTitle = getShortSpanishTitle(block.title);
                          const frenchSubtitle = block.title.includes('(')
                            ? block.title.split('(')[1]?.replace(')', '')
                            : '';
                          const isListDragging = draggedListBlockIndex === index;
                          const isListOver = dragOverListBlockIndex === index;

                          return (
                            <div
                              key={block.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', index.toString());
                                e.dataTransfer.effectAllowed = 'move';
                                setDraggedListBlockIndex(index);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                if (dragOverListBlockIndex !== index) {
                                  setDragOverListBlockIndex(index);
                                }
                              }}
                              onDragLeave={() => {
                                if (dragOverListBlockIndex === index) {
                                  setDragOverListBlockIndex(null);
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const sourceIdx = draggedListBlockIndex !== null 
                                  ? draggedListBlockIndex 
                                  : parseInt(e.dataTransfer.getData('text/plain'), 10);
                                if (!isNaN(sourceIdx)) {
                                  handleReorderMontageBlocks(sourceIdx, index);
                                }
                                setDraggedListBlockIndex(null);
                                setDragOverListBlockIndex(null);
                              }}
                              onDragEnd={() => {
                                setDraggedListBlockIndex(null);
                                setDragOverListBlockIndex(null);
                              }}
                              onClick={() => handleSelectBlock(block.id)}
                              className={`group w-full p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                                isSelected
                                  ? 'bg-[#251d14] border-[#e5a93b] text-[#f4efe6] shadow-md shadow-[#e5a93b]/15'
                                  : 'bg-[#181410] border-[#292119] text-[#9c9183] hover:border-[#3e3223] hover:text-[#d4c9ba] hover:bg-[#1e1913]'
                              } ${isListDragging ? 'opacity-40 scale-95 border-dashed border-[#e5a93b]' : ''} ${
                                isListOver ? 'border-t-2 border-t-[#e5a93b]' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                {/* Numéro, poignée et Titre court en espagnol */}
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div 
                                    className="p-1 text-[#6b5f51] group-hover:text-[#e5a93b] transition-colors cursor-grab active:cursor-grabbing shrink-0"
                                    title="Glisser-déposer pour réordonner"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </div>

                                  <span
                                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                      isSelected
                                        ? 'bg-[#e5a93b] text-[#121110]'
                                        : 'bg-[#221b14] text-[#8c8173] border border-[#2e251b] group-hover:text-[#c4b7a6]'
                                    }`}
                                  >
                                    {index + 1}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`block font-bold text-xs sm:text-[13px] leading-snug break-words ${
                                        isSelected ? 'text-[#f4efe6]' : 'text-[#d8cdbf]'
                                      }`}>
                                        {shortSpanishTitle}
                                      </span>
                                    </div>
                                    {frenchSubtitle && (
                                      <span className="block text-[10px] text-[#8c8173] truncate">
                                        {frenchSubtitle}
                                      </span>
                                    )}
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {block.durationApprox && (
                                        <span className="text-[10px] font-mono text-[#8c8173] flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5 text-[#e5a93b]" />
                                          <span>{block.durationApprox}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Micro-actions Monter / Descendre & Bouton Voir */}
                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => handleMoveMontageBlock(index, 'up')}
                                    className="p-1 rounded-md hover:bg-[#2e251d] disabled:opacity-20 text-[#8c8173] hover:text-[#f4efe6] transition-colors cursor-pointer"
                                    title="Monter ce bloc"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === currentMontageBlocks.length - 1}
                                    onClick={() => handleMoveMontageBlock(index, 'down')}
                                    className="p-1 rounded-md hover:bg-[#2e251d] disabled:opacity-20 text-[#8c8173] hover:text-[#f4efe6] transition-colors cursor-pointer"
                                    title="Descendre ce bloc"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>

                                  {/* Bouton d'action Voir avec flèche vers la vue déroulée */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewBlockInExpanded(block.id);
                                    }}
                                    className="px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer bg-[#221c16] hover:bg-[#e5a93b] text-[#e5a93b] hover:text-[#121110] border border-[#3b3022] hover:border-[#e5a93b] shadow-sm font-semibold group/btn"
                                    title={`Ouvrir la vue déroulée au niveau du Bloc ${index + 1} : ${block.title}`}
                                  >
                                    <span className="text-[10px] font-bold">
                                      Voir
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Détails du bloc visibles directement sous le bloc cliqué sur mobile */}
                              {isExpandedOnMobile && (
                                <div
                                  className="md:hidden mt-3 pt-3 border-t border-[#382d21] space-y-2.5 animate-in fade-in duration-150 text-left"
                                  onClick={e => e.stopPropagation()}
                                >
                                  {block.description ? (
                                    <div className="p-2.5 rounded-lg bg-[#14110e] border border-[#2b2219] space-y-1">
                                      <strong className="text-[11px] font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-1.5">
                                        <AlignLeft className="w-3 h-3" />
                                        <span>Texte explicatif & Description</span>
                                      </strong>
                                      <p className="text-xs text-[#c4b7a6] leading-relaxed whitespace-pre-line">
                                        {block.description}
                                      </p>
                                    </div>
                                  ) : null}

                                  {block.danceTips ? (
                                    <div className="p-2.5 rounded-lg bg-[#14110e] border border-[#2b2219] space-y-1">
                                      <strong className="text-[11px] font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-1.5">
                                        <Footprints className="w-3 h-3" />
                                        <span>Conseils de danse & Posture</span>
                                      </strong>
                                      <p className="text-xs text-[#c4b7a6] leading-relaxed whitespace-pre-line">
                                        {block.danceTips}
                                      </p>
                                    </div>
                                  ) : null}

                                  {block.guitarCode ? (
                                    <div className="p-2.5 rounded-lg bg-[#14110e] border border-[#2b2219] space-y-1">
                                      <strong className="text-[11px] font-bold text-[#70b1ff] uppercase tracking-wider flex items-center gap-1.5">
                                        <Music className="w-3 h-3" />
                                        <span>Code avec le guitariste & Signaux</span>
                                      </strong>
                                      <p className="text-xs text-[#c4b7a6] leading-relaxed whitespace-pre-line">
                                        {block.guitarCode}
                                      </p>
                                    </div>
                                  ) : null}

                                  <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setMontageModalState({ isOpen: true, block, blockIndex: index + 1 })}
                                      className="px-2.5 py-1 rounded-lg bg-[#221c16] hover:bg-[#2c231b] text-[#e5a93b] text-xs font-bold inline-flex items-center gap-1 border border-[#3e3223]"
                                    >
                                      <Pencil className="w-3 h-3" />
                                      <span>Modifier</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteClick(block.id)}
                                      className="px-2.5 py-1 rounded-lg bg-[#251614] hover:bg-[#361c1a] text-[#ff8075] text-xs font-semibold inline-flex items-center gap-1 border border-[#4a2220]"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Supprimer</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Boutons d'action sous la liste alignés à droite */}
                      <div className="pt-2 border-t border-[#261f18] flex items-center justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleEditSelection}
                          className="py-1.5 px-3 rounded-xl bg-[#201a14] hover:bg-[#2c241c] text-[#a69c8f] hover:text-[#e5a93b] border border-[#33291e] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Modifier le choix ({currentMontageBlocks.length}/6)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMontageModalState({ isOpen: true, block: null })}
                          className="py-1.5 px-3 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Créer un bloc</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COLONNE DROITE : FICHE DÉTAILLÉE DU BLOC SÉLECTIONNÉ (VISIBLE SUR ÉCRAN ORDINATEUR / TABLETTE) */}
                  <div id="montage-block-detail-panel" className="hidden md:block md:col-span-7 lg:col-span-8 scroll-mt-20">
                    {activeSelectedBlock ? (
                      <div className="rounded-2xl border bg-[#161310] border-[#2e251d] p-4 sm:p-5 lg:p-6 space-y-4 shadow-xl animate-in fade-in duration-150">
                        {/* En-tête du bloc sélectionné */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#282017]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e5a93b]/15 text-[#e5a93b] border border-[#e5a93b]/30">
                                Bloc {activeSelectedBlockIndex + 1} sur {currentMontageBlocks.length}
                              </span>
                              {activeSelectedBlock.durationApprox && (
                                <span className="text-xs font-mono text-[#e5a93b] flex items-center gap-1 bg-[#201a14] px-2.5 py-0.5 rounded-md border border-[#3a2f22]">
                                  <Clock className="w-3 h-3 text-[#e5a93b]" />
                                  <span>{activeSelectedBlock.durationApprox}</span>
                                </span>
                              )}
                              {/* Raccourci vers la liste sur écran mobile */}
                              <button
                                type="button"
                                onClick={() => {
                                  document.getElementById('montage-blocks-list-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="md:hidden text-[11px] text-[#a69c8f] hover:text-[#e5a93b] inline-flex items-center gap-1 bg-[#1e1914] px-2 py-0.5 rounded-md border border-[#2e261f]"
                              >
                                <ArrowUp className="w-3 h-3" />
                                <span>Remonter aux blocs</span>
                              </button>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold font-serif text-[#f4efe6]">
                              {activeSelectedBlock.title}
                            </h3>
                          </div>

                          {/* Actions du bloc : Vue déroulée, Modifier & Supprimer */}
                          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleViewBlockInExpanded(activeSelectedBlock.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#221c16] hover:bg-[#2c231b] text-[#e5a93b] hover:text-[#f5b84c] border border-[#3e3223] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Afficher ce bloc dans la vue déroulée complète"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Vue déroulée</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setMontageModalState({ isOpen: true, block: activeSelectedBlock, blockIndex: activeSelectedBlockIndex + 1 })}
                              className="px-3 py-1.5 rounded-xl bg-[#221c16] hover:bg-[#2c231b] text-[#e5a93b] hover:text-[#f5b84c] border border-[#3e3223] text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                              title="Modifier le titre, le temps (durée), les textes et conseils de ce bloc"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteClick(activeSelectedBlock.id)}
                              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-300 border border-red-900/40 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                              title="Supprimer ce bloc du montage"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Supprimer</span>
                            </button>
                          </div>
                        </div>

                        {/* Description & Rôle */}
                        <div className="p-3.5 sm:p-4 rounded-xl bg-[#1b1712] border border-[#2b2219] space-y-1.5">
                          <span className="text-xs font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Description & Rôle scénique</span>
                          </span>
                          {activeSelectedBlock.description ? (
                            <p className="text-xs sm:text-sm text-[#ded3c5] leading-relaxed whitespace-pre-line font-sans">
                              {activeSelectedBlock.description}
                            </p>
                          ) : (
                            <p className="text-xs text-[#73685a] italic">
                              Aucune description renseignée. Cliquez sur « Modifier » pour en ajouter une.
                            </p>
                          )}
                        </div>

                        {/* Conseils de danse & Code avec le guitariste */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                          {/* Conseils de danse */}
                          <div className="p-3.5 sm:p-4 rounded-xl bg-[#1b1712] border border-[#2c231a] space-y-1.5">
                            <strong className="text-xs font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-1.5">
                              <Footprints className="w-3.5 h-3.5" />
                              <span>Conseils de danse & Posture</span>
                            </strong>
                            {activeSelectedBlock.danceTips ? (
                              <div className="text-xs sm:text-sm text-[#c4b7a6] leading-relaxed whitespace-pre-line font-sans">
                                {activeSelectedBlock.danceTips}
                              </div>
                            ) : (
                              <p className="text-[11px] text-[#73685a] italic">
                                Non renseigné (cliquez sur « Modifier » pour ajouter vos conseils de danse).
                              </p>
                            )}
                          </div>

                          {/* Code avec le guitariste */}
                          <div className="p-3.5 sm:p-4 rounded-xl bg-[#1b1712] border border-[#2c231a] space-y-1.5">
                            <strong className="text-xs font-bold text-[#70b1ff] uppercase tracking-wider flex items-center gap-1.5">
                              <Music className="w-3.5 h-3.5" />
                              <span>Code avec le guitariste & Signaux</span>
                            </strong>
                            {activeSelectedBlock.guitarCode ? (
                              <div className="text-xs sm:text-sm text-[#c4b7a6] leading-relaxed whitespace-pre-line font-sans">
                                {activeSelectedBlock.guitarCode}
                              </div>
                            ) : (
                              <p className="text-[11px] text-[#73685a] italic">
                                Non renseigné (cliquez sur « Modifier » pour ajouter vos signaux musicaux).
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Barre de navigation séquentielle entre les blocs */}
                        <div className="pt-3 border-t border-[#261f18] flex items-center justify-between gap-3">
                          <button
                            type="button"
                            disabled={activeSelectedBlockIndex === 0}
                            onClick={() => {
                              const prevBlock = currentMontageBlocks[activeSelectedBlockIndex - 1];
                              if (prevBlock) {
                                handleSelectBlock(prevBlock.id);
                              }
                            }}
                            className="px-3 py-2 rounded-xl bg-[#1e1914] hover:bg-[#2b221a] disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] border border-[#2f251c] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Bloc précédent</span>
                            <span className="sm:hidden">Précédent</span>
                          </button>

                          <span className="text-[11px] text-[#786e62] font-mono">
                            Bloc {activeSelectedBlockIndex + 1} / {currentMontageBlocks.length}
                          </span>

                          <button
                            type="button"
                            disabled={activeSelectedBlockIndex === currentMontageBlocks.length - 1}
                            onClick={() => {
                              const nextBlock = currentMontageBlocks[activeSelectedBlockIndex + 1];
                              if (nextBlock) {
                                handleSelectBlock(nextBlock.id);
                              }
                            }}
                            className="px-3 py-2 rounded-xl bg-[#1e1914] hover:bg-[#2b221a] disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-[#e5a93b] hover:text-[#f5b84c] border border-[#2f251c] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span className="hidden sm:inline">Bloc suivant</span>
                            <span className="sm:hidden">Suivant</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#171411] border border-[#302820] rounded-2xl p-8 text-center text-xs text-[#a69c8f]">
                        Sélectionnez un bloc ci-dessus pour afficher ses détails.
                      </div>
                    )}
                  </div>
                </div>
              ) : montageViewMode === 'timeline' ? (
                /* ========================================================= */
                /* VUE TIMELINE : FRISE DÉTAILLÉE CHORÉGRAPHIQUE             */
                /* ========================================================= */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-[#15120f] border border-[#2e261e] p-4 sm:p-5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#282017]">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#f4efe6] font-serif flex items-center gap-2">
                          <Film className="w-4 h-4 text-[#e5a93b]" />
                          <span>Storyboard chorégraphique séquentiel</span>
                        </h4>
                        <p className="text-xs text-[#a69c8f] mt-0.5">
                          Enchaînement chronologique des {currentMontageBlocks.length} blocs avec titres en espagnol, repères vidéo et dynamiques scéniques.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setMontageModalState({ isOpen: true, block: null })}
                          className="px-3 py-1.5 rounded-xl bg-[#e5a93b] text-[#121110] font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all hover:bg-[#f5b84c] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Nouveau bloc</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {currentMontageBlocks.map((block, index) => {
                        const shortSpanishTitle = getShortSpanishTitle(block.title);
                        const frenchSubtitle = block.title.includes('(')
                          ? block.title.split('(')[1]?.replace(')', '')
                          : '';
                        const link = blockLinks[activeMontageKey]?.[block.id];
                        const isHighlighted = highlightedBlockId === block.id;

                        return (
                          <div
                            key={block.id}
                            id={`timeline-card-${block.id}`}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative ${
                              isHighlighted
                                ? 'bg-[#251d14] border-[#e5a93b] ring-2 ring-[#e5a93b]/40 shadow-xl'
                                : 'bg-[#171310] border-[#2c241c] hover:border-[#3e3225]'
                            }`}
                          >
                            {/* En-tête de carte : Étape, Titre en espagnol, Minutage, Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#261f18]">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-8 h-8 rounded-xl bg-[#e5a93b] text-[#121110] font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                                  {index + 1}
                                </span>
                                <div className="min-w-0">
                                  <h5 className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif tracking-wide truncate">
                                    {shortSpanishTitle}
                                  </h5>
                                  {frenchSubtitle && (
                                    <span className="text-xs text-[#8c8173] block truncate">
                                      {frenchSubtitle}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
                                {block.durationApprox && (
                                  <span className="text-xs font-mono text-[#e5a93b] bg-[#221b14] px-2.5 py-1 rounded-lg border border-[#382d20] flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-[#e5a93b]" />
                                    <span>{block.durationApprox}</span>
                                  </span>
                                )}

                                {/* Boutons monter / descendre */}
                                <div className="flex items-center gap-1 bg-[#1e1914] p-0.5 rounded-lg border border-[#2e261f]">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => handleMoveMontageBlock(index, 'up')}
                                    className="p-1 rounded hover:bg-[#2b2218] disabled:opacity-20 text-[#8c8173] hover:text-[#f4efe6] transition-colors cursor-pointer"
                                    title="Monter ce bloc"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === currentMontageBlocks.length - 1}
                                    onClick={() => handleMoveMontageBlock(index, 'down')}
                                    className="p-1 rounded hover:bg-[#2b2218] disabled:opacity-20 text-[#8c8173] hover:text-[#f4efe6] transition-colors cursor-pointer"
                                    title="Descendre ce bloc"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setMontageModalState({ isOpen: true, block, blockIndex: index + 1 })}
                                  className="p-1.5 rounded-lg bg-[#221c16] hover:bg-[#2d241c] text-[#e5a93b] border border-[#3d3122] transition-colors cursor-pointer"
                                  title="Modifier ce bloc"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBlockToDelete({ id: block.id, title: block.title })}
                                  className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-900/30 transition-colors cursor-pointer"
                                  title="Supprimer ce bloc"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Contenu et repère vidéo */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3.5">
                              {/* Rôle & description */}
                              <div className="lg:col-span-2 space-y-3">
                                {block.description && (
                                  <div className="text-xs sm:text-sm text-[#c4b7a6] leading-relaxed whitespace-pre-line bg-[#13100d] p-3 rounded-xl border border-[#261f18]">
                                    {block.description}
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {block.danceTips && (
                                    <div className="bg-[#13100d] p-3 rounded-xl border border-[#261f18] space-y-1.5">
                                      <strong className="text-[11px] font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-1.5">
                                        <Footprints className="w-3.5 h-3.5" />
                                        <span>Conseils de danse</span>
                                      </strong>
                                      <p className="text-xs text-[#a69c8f] leading-relaxed whitespace-pre-line font-sans">
                                        {block.danceTips}
                                      </p>
                                    </div>
                                  )}

                                  {block.guitarCode && (
                                    <div className="bg-[#13100d] p-3 rounded-xl border border-[#261f18] space-y-1.5">
                                      <strong className="text-[11px] font-bold text-[#70b1ff] uppercase tracking-wider flex items-center gap-1.5">
                                        <Music className="w-3.5 h-3.5" />
                                        <span>Code guitariste</span>
                                      </strong>
                                      <p className="text-xs text-[#a69c8f] leading-relaxed whitespace-pre-line font-sans">
                                        {block.guitarCode}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Repère vidéo associé */}
                              <div className="bg-[#13100d] p-3.5 rounded-xl border border-[#261f18] flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#a69c8f] flex items-center gap-1.5">
                                    <Video className="w-3.5 h-3.5 text-[#e5a93b]" />
                                    <span>Repère vidéo lié</span>
                                  </span>

                                  {link ? (
                                    <div className="space-y-2 pt-1">
                                      <div className="text-xs text-[#f4efe6] font-medium leading-snug">
                                        {link.videoTitle}
                                      </div>
                                      <div className="text-xs font-mono text-[#e5a93b] flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        <span>{link.landmarkLabel}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-[#73685a] pt-1">
                                      Aucun repère vidéo n'est encore lié à ce bloc.
                                    </p>
                                  )}
                                </div>

                                <div>
                                  {link ? (
                                    <button
                                      type="button"
                                      onClick={() => handlePlayLinkedVideo(link)}
                                      className="w-full py-2 px-3 rounded-xl bg-[#271e16] hover:bg-[#382b1f] border border-[#e5a93b] text-[#e5a93b] hover:text-[#fff] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-current" />
                                      <span>Lire au repère ({link.landmarkLabel})</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenLinkPicker(block.id, shortSpanishTitle)}
                                      className="w-full py-2 px-3 rounded-xl bg-[#1d1712] hover:bg-[#282019] border border-[#33291e] hover:border-[#e5a93b] text-[#8c8173] hover:text-[#e5a93b] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Link2 className="w-3.5 h-3.5" />
                                      <span>Lier un repère vidéo</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : montageViewMode === 'expanded' ? (
                /* ========================================================= */
                /* VUE DÉROULÉE : TOUS LES BLOCS EN LIGNES 2 COLONNES        */
                /* ========================================================= */
                <div className="space-y-4">
                  {currentMontageBlocks.map((block, index) => {
                    const isHighlighted = highlightedBlockId === block.id;
                    return (
                      <div
                        key={block.id}
                        id={`montage-block-${block.id}`}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 gap-4 shadow-md scroll-mt-24 ${
                          isHighlighted
                            ? 'bg-[#271e15] border-[#e5a93b] ring-2 ring-[#e5a93b]/50 shadow-xl shadow-[#e5a93b]/20 scale-[1.01]'
                            : 'bg-[#161310] border-[#2c241c] hover:border-[#3e3225]'
                        }`}
                      >
                        {/* Colonne gauche du bloc : Numéro, Titre en plus petit, Actions */}
                        <div className="lg:col-span-4 space-y-3 pb-3 lg:pb-0 lg:border-r border-[#261f18] lg:pr-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="w-6 h-6 rounded-md bg-[#e5a93b] text-[#121110] flex items-center justify-center font-bold text-xs shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#241e17] text-[#e5a93b] border border-[#3b3023]">
                                Bloc {index + 1}
                              </span>
                              {block.durationApprox && (
                                <span className="text-[11px] font-mono text-[#8c8173] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#e5a93b]" />
                                  <span>{block.durationApprox}</span>
                                </span>
                              )}
                              {isHighlighted && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e5a93b] text-[#121110] animate-pulse">
                                  Bloc sélectionné
                                </span>
                              )}
                            </div>
                            {/* Titre écrit en plus petit */}
                            <h4 className="text-sm sm:text-base font-bold text-[#f4efe6] font-serif leading-snug">
                              {block.title}
                            </h4>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 pt-2 border-t border-[#261f18]">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveMontageBlock(index, 'up')}
                              className="p-1.5 rounded-lg bg-[#201a14] hover:bg-[#2c241c] disabled:opacity-25 text-[#a69c8f] hover:text-[#f4efe6] border border-[#33291e] transition-colors cursor-pointer"
                              title="Monter ce bloc"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === currentMontageBlocks.length - 1}
                              onClick={() => handleMoveMontageBlock(index, 'down')}
                              className="p-1.5 rounded-lg bg-[#201a14] hover:bg-[#2c241c] disabled:opacity-25 text-[#a69c8f] hover:text-[#f4efe6] border border-[#33291e] transition-colors cursor-pointer"
                              title="Descendre ce bloc"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setMontageModalState({ isOpen: true, block, blockIndex: index + 1 })}
                              className="px-2.5 py-1.5 rounded-lg bg-[#221c16] hover:bg-[#2c231b] text-[#e5a93b] hover:text-[#f5b84c] border border-[#3a2e20] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBlockIdByMontage(prev => ({ ...prev, [activeMontageKey]: block.id }));
                                setMontageViewMode('split');
                              }}
                              className="px-2 py-1.5 rounded-lg bg-[#201a14] hover:bg-[#2c241c] text-[#a69c8f] hover:text-[#f4efe6] border border-[#33291e] text-[11px] font-medium transition-colors cursor-pointer"
                              title="Afficher en vue rapide (liste & détails)"
                            >
                              Vue rapide
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(block.id)}
                              className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-300 border border-red-900/40 transition-colors cursor-pointer active:scale-95 ml-auto"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      {/* Colonne droite du bloc : Textes, Conseils et Code guitare */}
                      <div className="lg:col-span-8 space-y-3">
                        {/* Description */}
                        {block.description ? (
                          <div className="bg-[#1b1712] p-3 rounded-xl border border-[#2a2219]">
                            <span className="text-[11px] font-semibold text-[#8c8173] block mb-1 uppercase tracking-wider">
                              Description & Rôle :
                            </span>
                            <p className="text-xs sm:text-sm text-[#d4c9ba] leading-relaxed whitespace-pre-line">
                              {block.description}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-[#1b1712] p-2.5 rounded-xl border border-[#2a2219] text-xs text-[#73685a] italic">
                            Aucune description.
                          </div>
                        )}

                        {/* Conseils de danse & Code guitariste */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-[#1b1712] border border-[#2c231a] space-y-1">
                            <strong className="text-[#e5a93b] block font-semibold flex items-center gap-1.5">
                              <Footprints className="w-3.5 h-3.5" />
                              <span>Conseils de danse :</span>
                            </strong>
                            <p className="text-[#b8ada0] leading-relaxed whitespace-pre-line text-xs font-sans">
                              {block.danceTips || <span className="text-[#73685a] italic">Non renseigné</span>}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-[#1b1712] border border-[#2c231a] space-y-1">
                            <strong className="text-[#70b1ff] block font-semibold flex items-center gap-1.5">
                              <Music className="w-3.5 h-3.5" />
                              <span>Code guitariste :</span>
                            </strong>
                            <p className="text-[#b8ada0] leading-relaxed whitespace-pre-line text-xs font-sans">
                              {block.guitarCode || <span className="text-[#73685a] italic">Non renseigné</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              ) : (
                /* ========================================================= */
                /* VUE MES LIENS : BLOCS AVEC TITRE EN ESPAGNOL & LIENS VIDÉO */
                /* ========================================================= */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-[#171411] border border-[#2e261e] p-4 sm:p-5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#29221b]">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#f4efe6] font-serif flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-[#e5a93b]" />
                          <span>Mes liens vidéo · {activeMontageLabel}</span>
                        </h4>
                        <p className="text-xs text-[#a69c8f] mt-0.5">
                          Associez un repère vidéo précis extrait des vidéos d'étude à chaque bloc de votre montage.
                        </p>
                      </div>
                      <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#201a14] border border-[#382d21] text-[#e5a93b] self-start sm:self-auto">
                        {Object.keys(blockLinks[activeMontageKey] || {}).length} sur {currentMontageBlocks.length} repère{Object.keys(blockLinks[activeMontageKey] || {}).length > 1 ? 's' : ''} lié{Object.keys(blockLinks[activeMontageKey] || {}).length > 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {currentMontageBlocks.map((block, index) => {
                        const spanishTitle = getSpanishTitle(block.title);
                        const currentMontageLinks = blockLinks[activeMontageKey] || {};
                        const link = currentMontageLinks[block.id];

                        return (
                          <div
                            key={block.id}
                            className="bg-[#14110e] hover:bg-[#1a1612] border border-[#2a221a] hover:border-[#3d3125] p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                          >
                            {/* Titre UNIQUEMENT en espagnol */}
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-7 h-7 rounded-lg bg-[#221b14] border border-[#33281d] text-[#e5a93b] font-bold text-xs flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <div className="min-w-0">
                                <span className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif tracking-wide block truncate">
                                  {spanishTitle}
                                </span>
                              </div>
                            </div>

                            {/* En face à droite : Bouton Créer un lien OU Lien cliquable vers la vidéo */}
                            <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
                              {!link ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLinkPicker(block.id, spanishTitle)}
                                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#241d15] hover:bg-[#32271c] active:scale-95 text-[#e5a93b] hover:text-[#fff] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 border border-[#e5a93b]/60 hover:border-[#e5a93b] transition-all cursor-pointer shadow-sm"
                                  title={`Créer un lien vers un repère vidéo pour ${spanishTitle}`}
                                >
                                  <Plus className="w-4 h-4 stroke-[2.5]" />
                                  <span>Créer un lien</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
                                  {/* Clic sur le lien = ouverture de la vidéo au repère et auto-play */}
                                  <button
                                    type="button"
                                    onClick={() => handlePlayLinkedVideo(link)}
                                    className="group/link flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#271e16] hover:bg-[#36291e] border border-[#e5a93b] text-left transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-98"
                                    title={`Lancer la vidéo à ${link.landmarkLabel} (lecture automatique)`}
                                  >
                                    <div className="w-7 h-7 rounded-lg bg-[#e5a93b] text-[#121110] flex items-center justify-center shrink-0 group-hover/link:bg-[#f5b84c] shadow-sm">
                                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                    </div>
                                    <div className="min-w-0 max-w-[190px] sm:max-w-[280px]">
                                      <div className="text-xs font-bold text-[#e5a93b] flex items-center gap-1.5 truncate">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        <span>{link.landmarkLabel}</span>
                                      </div>
                                      <div className="text-[11px] text-[#a69c8f] truncate font-normal">
                                        {link.videoTitle}
                                      </div>
                                    </div>
                                  </button>

                                  {/* Modifier */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenLinkPicker(block.id, spanishTitle)}
                                    className="p-2 rounded-xl bg-[#1f1913] hover:bg-[#2c2219] text-[#a69c8f] hover:text-[#e5a93b] border border-[#33271b] transition-colors cursor-pointer shrink-0"
                                    title="Changer de repère vidéo"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Supprimer le lien */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBlockLink(block.id)}
                                    className="p-2 rounded-xl bg-red-950/25 hover:bg-red-950/50 text-red-400 hover:text-red-300 border border-red-900/30 transition-colors cursor-pointer shrink-0"
                                    title="Supprimer ce lien"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              </div>
            )}
          </div>
        )}

        </div>
      )}

      {/* BARRE DE NAVIGATION EN BAS DE PAGE (STRUCTURE, GRANDS MAÎTRES, LETRAS, COMPÁS, COURS, MES MONTAGES) */}
      {activeTab !== 'hub' && (
        <div className="pt-6 mt-8 border-t border-[#29221b] space-y-3">
          <div className="flex items-center justify-center p-1.5 sm:p-2 rounded-2xl bg-[#141210] border border-[#2e2720] shadow-xl overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs py-0.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('hub');
                  scrollToEspacesEtude();
                }}
                className="px-3 sm:px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-[#e5a93b] bg-[#221c16] hover:bg-[#2c241e] border border-[#e5a93b]/50 shadow-sm flex items-center gap-1.5 shrink-0"
                title="Retourner aux 6 espaces d'étude"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#e5a93b]" />
                <span>6 Espaces</span>
              </button>
              {[
                { key: 'structure', label: 'Structure traditionnelle', icon: '📑' },
                { key: 'maitres', label: 'Grands Maîtres', icon: '🌟' },
                { key: 'letras', label: 'Letras & Textes', icon: 'cantaor' },
                { key: 'compas', label: 'Compás (4t)', icon: '⏱️' },
                { key: 'cours', label: 'Cours & Stages', icon: '🎓' },
                { key: 'montages', label: 'Mon carnet de montage', icon: '🎬' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key as DanseSectionTab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 sm:px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.key
                      ? 'bg-[#e5a93b] text-[#121110] shadow-sm'
                      : 'text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#1f1a16]'
                  }`}
                >
                  {tab.icon === 'cantaor' ? (
                    <FlamencoCantaorIcon className="w-3.5 h-3.5 inline-block shrink-0 -mt-0.5" />
                  ) : (
                    <span>{tab.icon}</span>
                  )}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#8c8173] px-1">
            {getDeletedVideoIds().length > 0 ? (
              <button
                onClick={() => {
                  if (window.confirm('Voulez-vous restaurer toutes les vidéos masquées ou supprimées ?')) {
                    resetAllDeletedVideos();
                    setVideoVersion(v => v + 1);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#a69c8f] hover:text-[#e5a93b] py-1.5 px-2.5 rounded-lg bg-[#1a1713] border border-[#302820] cursor-pointer transition-colors"
                title="Restaurer les vidéos initiales masquées"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurer les vidéos masquées</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 text-xs text-[#8c8173] hover:text-[#e5a93b] transition-colors py-1.5 px-2.5 rounded-lg cursor-pointer ml-auto"
              title="Remonter en haut de la page"
            >
              <span>Haut de page</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {videoToDelete && (
        <ConfirmDeleteModal
          title="Supprimer cette vidéo"
          videoTitle={videoToDelete.title}
          onConfirm={() => {
            deleteAnyVideo(palo.id, videoToDelete.sectionKey, videoToDelete.id);
            setVideoToDelete(null);
            setVideoVersion(v => v + 1);
          }}
          onCancel={() => setVideoToDelete(null)}
        />
      )}

      {/* Replacement Modal */}
      {videoToReplace && (
        <ReplaceVideoModal
          paloId={palo.id}
          paloName={`${palo.name} (Danse)`}
          sectionKey={videoToReplace.sectionKey}
          video={videoToReplace.video}
          onClose={() => setVideoToReplace(null)}
          onReplaced={() => {
            setVideoToReplace(null);
            setVideoVersion(v => v + 1);
          }}
        />
      )}

      {/* Montage Block Add/Edit Modal */}
      <MontageBlockModal
        isOpen={montageModalState.isOpen}
        initialBlock={montageModalState.block}
        montageTitle={activeMontageLabel}
        blockIndex={montageModalState.blockIndex || currentMontageBlocks.length + 1}
        onClose={() => setMontageModalState({ isOpen: false, block: null })}
        onSave={handleSaveMontageBlock}
      />

      {/* Confirmation Modal for Montage Block Delete */}
      {blockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181512] border border-red-900/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-[#2e2720] flex items-center justify-between bg-[#14120f]">
              <div className="flex items-center gap-2.5 text-red-400">
                <div className="w-8 h-8 rounded-lg bg-red-950/60 flex items-center justify-center border border-red-800/40">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#f4efe6]">
                  Supprimer ce bloc
                </h3>
              </div>
              <button
                onClick={() => setBlockToDelete(null)}
                className="p-1.5 rounded-lg text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#f4efe6]">
                    Voulez-vous vraiment supprimer ce bloc du {activeMontageLabel} ?
                  </p>
                  <p className="text-xs text-[#b8ada0] line-clamp-2 italic bg-[#221d17] p-2.5 rounded-lg border border-[#332b21] mt-2">
                    « {blockToDelete.title} »
                  </p>
                  <p className="text-xs text-[#8c8173] mt-2">
                    Ce bloc sera retiré de votre chorégraphie. Vous pourrez toujours le rajouter ou modifier votre sélection à tout moment.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#29221b]">
                <button
                  type="button"
                  onClick={() => setBlockToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteBlock}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer définitivement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset Montage */}
      {showResetMontageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181512] border border-[#443828] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-[#2e2720] flex items-center justify-between bg-[#14120f]">
              <div className="flex items-center gap-2.5 text-[#e5a93b]">
                <div className="w-8 h-8 rounded-lg bg-[#e5a93b]/15 flex items-center justify-center border border-[#e5a93b]/30">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#f4efe6]">
                  Rétablir les 6 blocs initiaux
                </h3>
              </div>
              <button
                onClick={() => setShowResetMontageModal(false)}
                className="p-1.5 rounded-lg text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-sm">
              <p className="text-[#d4c9ba] leading-relaxed">
                Voulez-vous réinitialiser le <strong className="text-[#e5a93b]">{activeMontageLabel}</strong> aux 6 blocs de référence de la Farruca ?
              </p>
              <p className="text-xs text-[#8c8173] bg-[#201a15] p-2.5 rounded-lg border border-[#30261d]">
                Les personnalisations actuelles sur ce montage seront remplacées par les blocs initiaux avec leurs descriptions, conseils et repères d'origine.
              </p>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#29221b]">
                <button
                  type="button"
                  onClick={() => setShowResetMontageModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmResetMontage}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] font-bold text-xs shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirmer et rétablir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression d'un montage */}
      {montageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1a1612] border border-[#382d22] rounded-2xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-amber-500 font-bold text-base">
              <Trash2 className="w-5 h-5 text-red-400 shrink-0" />
              <span>Supprimer {getMontageLabel(montageToDelete)} ?</span>
            </div>
            <p className="text-xs text-[#b8ada0] leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-[#f4efe6]">{getMontageLabel(montageToDelete)}</strong> ? Tous ses blocs et personnalisations seront effacés.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2d241c]">
              <button
                type="button"
                onClick={() => setMontageToDelete(null)}
                className="px-3.5 py-2 rounded-xl bg-[#221c17] hover:bg-[#2e261f] text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteMontage}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors cursor-pointer shadow-md"
              >
                Supprimer le montage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Navigation dans toutes les vidéos et choix d'un repère pour un bloc */}
      {linkingBlockModal && (() => {
        const deletedIds = getDeletedVideoIds();
        const replacedVideos = getReplacedVideos();

        // 1. Grands Maîtres
        const maitresRaw = palo.maitres || [];
        const maitresClean = maitresRaw
          .filter(v => !deletedIds.includes(v.id))
          .map(v => replacedVideos[v.id] || v);
        const maitresCustom = ((paloCustom['maitres'] || []) as VideoItem[])
          .filter(v => !deletedIds.includes(v.id))
          .map(v => replacedVideos[v.id] || v);
        const allMaitres = [...maitresClean, ...maitresCustom];

        // 2. Cours & Stages
        const allCours = ((paloCustom['cours'] || []) as VideoItem[])
          .filter(v => !deletedIds.includes(v.id))
          .map(v => replacedVideos[v.id] || v);

        // 3. Autres vidéos custom
        const otherSections = ['baile', 'letras', 'autre'];
        const otherVideos: VideoItem[] = [];
        for (const sec of otherSections) {
          const list = ((paloCustom[sec] || []) as VideoItem[])
            .filter(v => !deletedIds.includes(v.id))
            .map(v => replacedVideos[v.id] || v);
          for (const item of list) {
            if (
              !otherVideos.some(v => v.id === item.id) && 
              !allMaitres.some(v => v.id === item.id) && 
              !allCours.some(v => v.id === item.id)
            ) {
              otherVideos.push(item);
            }
          }
        }

        interface SearchableVideoItem {
          video: VideoItem;
          category: 'maitres' | 'cours' | 'autre';
          categoryLabel: string;
          landmarks: VideoLandmark[];
        }

        const candidateList: SearchableVideoItem[] = [];

        allMaitres.forEach(v => {
          const custom = getVideoCustomLandmarks(v.id, v.url);
          const lms = custom !== null ? custom : (v.landmarks || []);
          candidateList.push({ video: v, category: 'maitres', categoryLabel: 'Grands Maîtres', landmarks: lms });
        });

        allCours.forEach(v => {
          const custom = getVideoCustomLandmarks(v.id, v.url);
          const lms = custom !== null ? custom : (v.landmarks || []);
          candidateList.push({ video: v, category: 'cours', categoryLabel: 'Cours & Stages', landmarks: lms });
        });

        otherVideos.forEach(v => {
          const custom = getVideoCustomLandmarks(v.id, v.url);
          const lms = custom !== null ? custom : (v.landmarks || []);
          candidateList.push({ video: v, category: 'autre', categoryLabel: 'Vidéo ajoutée', landmarks: lms });
        });

        // Filtrage
        const filteredVideos = candidateList.filter(item => {
          if (videoFilterCategory !== 'all' && item.category !== videoFilterCategory) {
            return false;
          }
          if (videoSearchQuery.trim()) {
            const q = videoSearchQuery.toLowerCase();
            const matchesTitle = item.video.title.toLowerCase().includes(q);
            const matchesLandmarks = item.landmarks.some(lm => lm.label.toLowerCase().includes(q));
            return matchesTitle || matchesLandmarks;
          }
          return true;
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#181410] border border-[#3d3022] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
              {/* En-tête du sélecteur */}
              <div className="p-4 sm:p-5 border-b border-[#2d241c] flex items-center justify-between bg-[#14110e] gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#a69c8f]">
                    <Link2 className="w-3.5 h-3.5 text-[#e5a93b]" />
                    <span>Lier un repère vidéo au bloc</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif truncate mt-0.5">
                    {linkingBlockModal.spanishTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkingBlockModal(null)}
                  className="p-1.5 rounded-lg text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Barre de recherche et filtres de catégories */}
              <div className="p-3 sm:p-4 bg-[#1b1712] border-b border-[#2d241c] space-y-2.5">
                {/* Champ de recherche */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8c8173] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={videoSearchQuery}
                    onChange={(e) => setVideoSearchQuery(e.target.value)}
                    placeholder="Rechercher une vidéo ou un repère (ex: Vargas, Güito, Escobilla...)"
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#14110e] border border-[#33281c] focus:border-[#e5a93b] text-xs text-[#f4efe6] placeholder-[#73685a] outline-none transition-colors"
                  />
                  {videoSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setVideoSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c8173] hover:text-[#f4efe6]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtres par catégorie */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { key: 'all', label: `Toutes (${candidateList.length})` },
                    { key: 'maitres', label: `Grands Maîtres (${candidateList.filter(c => c.category === 'maitres').length})` },
                    { key: 'cours', label: `Cours & Stages (${candidateList.filter(c => c.category === 'cours').length})` }
                  ].map(cat => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setVideoFilterCategory(cat.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        videoFilterCategory === cat.key
                          ? 'bg-[#e5a93b] text-[#121110]'
                          : 'bg-[#14110e] text-[#a69c8f] hover:text-[#f4efe6] border border-[#2d241c]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste des vidéos et repères */}
              <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                {filteredVideos.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#8c8173] space-y-2">
                    <p>Aucune vidéo ne correspond à votre recherche.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoSearchQuery('');
                        setVideoFilterCategory('all');
                      }}
                      className="text-xs text-[#e5a93b] hover:underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                ) : (
                  filteredVideos.map((item) => {
                    const parsed = extractYouTubeInfo(item.video.url, 0);
                    const videoId = parsed.videoId;
                    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
                    const isExpanded = expandedVideoId === item.video.id;

                    return (
                      <div
                        key={item.video.id}
                        className="bg-[#14110e] border border-[#2a221a] rounded-xl overflow-hidden shadow-sm"
                      >
                        {/* Barre principale de la vidéo */}
                        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {thumbUrl && (
                              <img
                                src={thumbUrl}
                                alt={item.video.title}
                                className="w-14 sm:w-16 h-10 sm:h-11 rounded-lg object-cover bg-black shrink-0 border border-[#2c2219]"
                                loading="lazy"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#221b14] text-[#e5a93b] border border-[#33281d]">
                                  {item.categoryLabel}
                                </span>
                                <span className="text-[11px] text-[#8c8173]">
                                  {item.landmarks.length} repère{item.landmarks.length > 1 ? 's' : ''}
                                </span>
                              </div>
                              <h5 className="text-xs sm:text-sm font-bold text-[#f4efe6] truncate">
                                {item.video.title}
                              </h5>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Bouton rapide lier au début */}
                            <button
                              type="button"
                              onClick={() => handleSelectLandmarkForBlock(item.video, { timeSeconds: 0, label: '0:00 - Début' })}
                              className="px-2.5 py-1.5 rounded-lg bg-[#221c16] hover:bg-[#2c231b] border border-[#382b1e] text-[11px] font-semibold text-[#a69c8f] hover:text-[#f4efe6] transition-colors cursor-pointer hidden sm:inline-flex items-center gap-1"
                              title="Lier directement au début de la vidéo (0:00)"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Début (0:00)</span>
                            </button>

                            {/* Déplier / Replier les repères */}
                            <button
                              type="button"
                              onClick={() => setExpandedVideoId(isExpanded ? null : item.video.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                isExpanded
                                  ? 'bg-[#e5a93b] text-[#121110]'
                                  : 'bg-[#221b14] hover:bg-[#2e241b] text-[#e5a93b] border border-[#e5a93b]/50'
                              }`}
                            >
                              <span>{isExpanded ? 'Masquer repères' : 'Voir repères'}</span>
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Liste des repères cliquables (dépliés) */}
                        {isExpanded && (
                          <div className="border-t border-[#261f18] bg-[#100d0b] p-3 sm:p-3.5 space-y-2 animate-in fade-in">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-[#a69c8f] flex items-center justify-between pb-1">
                              <span>Cliquez sur un repère pour lier au bloc :</span>
                              <button
                                type="button"
                                onClick={() => handleSelectLandmarkForBlock(item.video, { timeSeconds: 0, label: '0:00 - Début' })}
                                className="sm:hidden text-xs text-[#e5a93b] underline"
                              >
                                Début (0:00)
                              </button>
                            </div>

                            {item.landmarks.length === 0 ? (
                              <div className="py-4 text-center text-xs text-[#73685a] space-y-2">
                                <p>Aucun repère prédéfini sur cette vidéo.</p>
                                <button
                                  type="button"
                                  onClick={() => handleSelectLandmarkForBlock(item.video, { timeSeconds: 0, label: '0:00 - Début de la vidéo' })}
                                  className="px-3 py-1.5 rounded-lg bg-[#241c15] text-[#e5a93b] border border-[#3b2e20] text-xs font-semibold inline-flex items-center gap-1.5"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>Lier à 0:00 (début de la vidéo)</span>
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {item.landmarks.map((lm, lmIdx) => {
                                  const mins = Math.floor(lm.timeSeconds / 60);
                                  const secs = Math.floor(lm.timeSeconds % 60);
                                  const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

                                  return (
                                    <button
                                      key={lmIdx}
                                      type="button"
                                      onClick={() => handleSelectLandmarkForBlock(item.video, lm)}
                                      className="group/lm flex items-center justify-between p-2.5 rounded-xl bg-[#181410] hover:bg-[#251d15] border border-[#2d241c] hover:border-[#e5a93b] transition-all text-left cursor-pointer active:scale-[0.98]"
                                      title={`Lier ${lm.label} à ce bloc`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-6 h-6 rounded-md bg-[#241c15] group-hover/lm:bg-[#e5a93b] text-[#e5a93b] group-hover/lm:text-[#121110] flex items-center justify-center font-mono font-bold text-[11px] shrink-0 transition-colors">
                                          <Play className="w-3 h-3 fill-current ml-0.5" />
                                        </div>
                                        <div className="min-w-0">
                                          <span className="text-xs font-bold text-[#f4efe6] group-hover/lm:text-[#e5a93b] transition-colors block truncate">
                                            {lm.label}
                                          </span>
                                          <span className="text-[10px] font-mono text-[#8c8173]">
                                            {formattedTime} ({lm.timeSeconds}s)
                                          </span>
                                        </div>
                                      </div>
                                      <span className="text-[10px] px-2 py-1 rounded bg-[#e5a93b] text-[#121110] font-bold opacity-0 group-hover/lm:opacity-100 transition-opacity shrink-0 ml-2">
                                        Lier
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pied de modal */}
              <div className="p-3 sm:p-4 border-t border-[#2d241c] flex items-center justify-between bg-[#14110e]">
                <span className="text-xs text-[#8c8173]">
                  {candidateList.length} vidéos disponibles pour la Farruca
                </span>
                <button
                  type="button"
                  onClick={() => setLinkingBlockModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#221c17] hover:bg-[#2e261f] text-xs font-semibold text-[#a69c8f] hover:text-[#f4efe6] transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de renommage de montage */}
      {editingMontageKey && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setEditingMontageKey(null)}
        >
          <div 
            className="bg-[#181512] border border-[#3d3326] rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2e261e]">
              <h4 className="text-base font-bold text-[#f4efe6] font-serif flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#e5a93b]" />
                <span>Renommer ce montage</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingMontageKey(null)}
                className="p-1 rounded-lg text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#25201a] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#9c9183]">
              Personnalisez le titre affiché sur cet onglet (ex : "Montage de Vincent", "Chorégraphie Concours", etc.) :
            </p>

            <input
              type="text"
              autoFocus
              value={editingMontageTitleValue}
              onChange={e => setEditingMontageTitleValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveMontageTitle();
                if (e.key === 'Escape') setEditingMontageKey(null);
              }}
              placeholder="Ex : Montage de Vincent"
              className="w-full bg-[#120f0c] border border-[#443623] focus:border-[#e5a93b] rounded-lg px-3 py-2 text-sm text-[#f4efe6] focus:outline-none"
              maxLength={40}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMontageKey(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#a69c8f] hover:bg-[#25201a] transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveMontageTitle}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] transition-colors cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Intelligent Shared Montage Modal */}
      <ShareMontageModal
        isOpen={showShareMontageModal}
        onClose={() => setShowShareMontageModal(false)}
        paloId={palo.id}
        paloName={palo.name}
        montageKey={activeMontageKey}
        montageCurrentLabel={activeMontageLabel}
        blocks={currentMontageBlocks}
        blockLinks={blockLinks[activeMontageKey] || {}}
      />

      {/* Direct Social & Universal Share Modal */}
      {shareModalOptions && (
        <ShareModal
          options={shareModalOptions}
          onClose={() => setShareModalOptions(null)}
        />
      )}
    </div>
  );
};
