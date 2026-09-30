import React, { useState, useEffect, useMemo } from 'react';
import { PALOS_DATA } from './data/flamencoData';
import { BAILE_PALOS_DATA } from './data/baileData';
import { PaloData, VideoItem, PaloCompas, DisciplineMode, DansePaloData, PracticeBookmark, DanseSectionTab, SectionTab } from './types';
import { Header } from './components/Header';
import { PaloList } from './components/PaloList';
import { DansePaloList } from './components/DansePaloList';
import { DansePaloDetail } from './components/DansePaloDetail';
import { TangosVariants } from './components/TangosVariants';
import { PaloDetail } from './components/PaloDetail';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AddVideoModal } from './components/AddVideoModal';
import { FlamencoToolsModal } from './components/FlamencoToolsModal';
import { FavoritesView } from './components/FavoritesView';
import { FlamencoGuitarIcon } from './components/FlamencoGuitarIcon';
import { FlamencoGuitaristeIcon } from './components/FlamencoGuitaristeIcon';
import { FlamencoBailaoraIcon } from './components/FlamencoBailaoraIcon';
import { FlamencoCantaorIcon } from './components/FlamencoCantaorIcon';
import { CompasVisualizer } from './components/CompasVisualizer';
import { InstallGuideModal } from './components/InstallGuideModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { flamencoMetronome } from './utils/audioMetronome';
import { getBookmarks, importAllSyncData, decodeSharedMontage, importSharedMontage } from './utils/storage';
import { startCloudSync, subscribeToSyncStatus, SyncState, loadSharedMontageCloud } from './utils/firebaseSync';
import { Volume2, Square, Play, CheckCircle2, Sparkles, X } from 'lucide-react';

export default function App() {
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);
  const [cloudSyncState, setCloudSyncState] = useState<SyncState>('connecting');

  // Discipline Mode (Guitare or Danse) - default to Danse as requested
  const [discipline, setDiscipline] = useState<DisciplineMode>(() => {
    try {
      const saved = localStorage.getItem('flamenco_discipline');
      return (saved === 'guitare' || saved === 'danse') ? saved : 'danse';
    } catch {
      return 'danse';
    }
  });

  // Navigation stack & current view
  const [currentView, setCurrentView] = useState<'home' | 'tangos-variants' | 'palo-detail' | 'favorites'>('home');
  const [selectedPaloKey, setSelectedPaloKey] = useState<string | null>(null);
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null);
  const [danseTab, setDanseTab] = useState<DanseSectionTab>('hub');
  const [isBiblioPageOpen, setIsBiblioPageOpen] = useState<boolean>(false);
  const [isStudioPageOpen, setIsStudioPageOpen] = useState<boolean>(false);
  const [danseCustomFolderId, setDanseCustomFolderId] = useState<string | null>(null);
  const [danseInitialTreeFolder, setDanseInitialTreeFolder] = useState<'biblio' | 'studio' | null>(null);

  // Modals state
  const [activeVideoData, setActiveVideoData] = useState<{
    video: VideoItem;
    paloName: string;
    paloId: string;
    sectionName: string;
  } | null>(null);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);
  const [toolsInitialTab, setToolsInitialTab] = useState<'arborescence' | 'cejilla' | 'techniques' | 'lexique'>('arborescence');
  const [paloInitialTab, setPaloInitialTab] = useState<SectionTab | undefined>(undefined);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(false);

  const handleOpenTools = (tab: 'arborescence' | 'cejilla' | 'techniques' | 'lexique' = 'arborescence') => {
    setToolsInitialTab(tab);
    setIsToolsModalOpen(true);
  };
  const [addVideoSection, setAddVideoSection] = useState<string | null>(null);
  const [customVideosVersion, setCustomVideosVersion] = useState<number>(0);

  // Metronome global state
  const [isMetronomePlaying, setIsMetronomePlaying] = useState<boolean>(false);
  const [showFloatingMetronome, setShowFloatingMetronome] = useState<boolean>(false);

  // Helper to distinguish Danse vs Guitare bookmarks
  const isBookmarkForDiscipline = (item: PracticeBookmark, targetDiscipline: DisciplineMode) => {
    const isDance = item.discipline === 'danse' ||
      item.paloName.toLowerCase().includes('danse') ||
      item.paloName.toLowerCase().includes('baile') ||
      ['maitres', 'structure', 'letras & textes'].includes(item.section.toLowerCase());
    return targetDiscipline === 'danse' ? isDance : !isDance;
  };

  // Bookmarks count (discipline-aware)
  const [bookmarksCount, setBookmarksCount] = useState<number>(() => {
    const all = Object.values(getBookmarks()) as PracticeBookmark[];
    return all.filter(item => isBookmarkForDiscipline(item, discipline)).length;
  });

  const refreshBookmarksCount = () => {
    const all = Object.values(getBookmarks()) as PracticeBookmark[];
    setBookmarksCount(all.filter(item => isBookmarkForDiscipline(item, discipline)).length);
  };

  useEffect(() => {
    const all = Object.values(getBookmarks()) as PracticeBookmark[];
    setBookmarksCount(all.filter(item => isBookmarkForDiscipline(item, discipline)).length);
  }, [discipline]);

  // Initialisation de la synchronisation continue Cloud Firestore (PC <-> Mobile)
  useEffect(() => {
    const unsubSync = startCloudSync();
    const unsubStatus = subscribeToSyncStatus((info) => {
      setCloudSyncState(info.state);
    });

    const handleRemoteUpdate = () => {
      setCustomVideosVersion(v => v + 1);
      refreshBookmarksCount();
    };

    window.addEventListener('flamenco_data_imported', handleRemoteUpdate);
    window.addEventListener('flamenco_landmarks_updated', handleRemoteUpdate);
    window.addEventListener('flamenco_montages_updated', handleRemoteUpdate);

    return () => {
      unsubSync();
      unsubStatus();
      window.removeEventListener('flamenco_data_imported', handleRemoteUpdate);
      window.removeEventListener('flamenco_landmarks_updated', handleRemoteUpdate);
      window.removeEventListener('flamenco_montages_updated', handleRemoteUpdate);
    };
  }, []);

  // Automatic synchronization from URL (when scanning QR code from PC to mobile)
  useEffect(() => {
    try {
      let syncPayload = '';
      if (window.location.hash && window.location.hash.startsWith('#sync=')) {
        syncPayload = window.location.hash.replace('#sync=', '');
      } else if (window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        syncPayload = urlParams.get('sync') || '';
      }

      if (syncPayload) {
        const success = importAllSyncData(syncPayload);
        if (success) {
          setSyncToast('Vos repères et réglages personnalisés ont été synchronisés avec succès sur ce téléphone !');
          // Clean the URL without reload
          try {
            window.history.replaceState(null, '', window.location.pathname);
          } catch {
            // ignore
          }
          refreshBookmarksCount();
          setTimeout(() => {
            setSyncToast(null);
          }, 8000);
        }
      }

      // Deep link sharing resolution (?discipline=...&palo=...&section=...&video=...&t=...)
      if (window.location.search || window.location.hash) {
        const urlParams = new URLSearchParams(window.location.search);
        
        // 1. Montage partagé moderne via lien court Cloud (?montage_id=... ou ?sm=...)
        const cloudMontageId = urlParams.get('montage_id') || urlParams.get('sm');
        if (cloudMontageId) {
          loadSharedMontageCloud(cloudMontageId).then((payload) => {
            if (payload) {
              const result = importSharedMontage(payload);
              setDiscipline('danse');
              setSelectedPaloKey(payload.paloId || 'Farruca');
              setCurrentView('palo-detail');
              setDanseTab('montages');
              try {
                sessionStorage.setItem('flamenco_active_imported_montage', result.key);
              } catch {}
              setSyncToast(
                result.isUpdate
                  ? `🔄 ${result.title} a été mis à jour avec les modifications reçues !`
                  : `🎉 ${result.title} a été importé avec succès dans vos montages !`
              );
              setTimeout(() => setSyncToast(null), 8000);

              // Nettoyage de l'URL pour éviter de réimporter à chaque rafraîchissement
              try {
                urlParams.delete('montage_id');
                urlParams.delete('sm');
                const newSearch = urlParams.toString();
                const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
                window.history.replaceState(null, '', newUrl);
              } catch {}
            }
          }).catch(err => {
            console.warn('Erreur chargement cloud montage:', err);
          });
        }

        // 2. Rétrocompatibilité : Montage partagé encodé legacy (?shared_montage=... ou #shared_montage=...)
        let sharedMontageEncoded = urlParams.get('shared_montage');
        if (!sharedMontageEncoded && window.location.hash && window.location.hash.includes('shared_montage=')) {
          const match = window.location.hash.match(/shared_montage=([^&]+)/);
          if (match) sharedMontageEncoded = decodeURIComponent(match[1]);
        }

        if (sharedMontageEncoded) {
          const payload = decodeSharedMontage(sharedMontageEncoded);
          if (payload) {
            const result = importSharedMontage(payload);
            setDiscipline('danse');
            setSelectedPaloKey(payload.paloId || 'Farruca');
            setCurrentView('palo-detail');
            setDanseTab('montages');
            try {
              sessionStorage.setItem('flamenco_active_imported_montage', result.key);
            } catch {}
            setSyncToast(
              result.isUpdate
                ? `🔄 ${result.title} a été mis à jour avec les modifications reçues !`
                : `🎉 ${result.title} a été importé avec succès dans vos montages !`
            );
            setTimeout(() => setSyncToast(null), 8000);

            // Nettoyage de l'URL pour éviter de réimporter à chaque rafraîchissement
            try {
              urlParams.delete('shared_montage');
              const newSearch = urlParams.toString();
              const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
              window.history.replaceState(null, '', newUrl);
            } catch {}
          }
        }

        const shareDiscipline = urlParams.get('discipline') as DisciplineMode | null;
        const sharePalo = urlParams.get('palo');
        const shareSection = urlParams.get('section');

        if (shareDiscipline && (shareDiscipline === 'danse' || shareDiscipline === 'guitare')) {
          setDiscipline(shareDiscipline);
        }

        if (sharePalo) {
          setSelectedPaloKey(sharePalo);
          setCurrentView('palo-detail');
          if (shareSection) {
            setDanseTab(shareSection as DanseSectionTab);
          }
          if (!sharedMontageEncoded) {
            setSyncToast(`Ouverture via lien partagé : ${sharePalo}${shareSection ? ` • ${shareSection}` : ''}`);
            setTimeout(() => setSyncToast(null), 4000);
          }
        }
      }
    } catch (err) {
      console.error('Error during auto-sync from URL:', err);
    }
  }, []);

  const handleToggleDiscipline = (mode: DisciplineMode) => {
    setDiscipline(mode);
    setDanseTab('hub');
    setIsBiblioPageOpen(false);
    setIsStudioPageOpen(false);
    try {
      localStorage.setItem('flamenco_discipline', mode);
    } catch (e) {
      console.error(e);
    }
    // Return to home of this discipline
    setCurrentView('home');
    setSelectedPaloKey(null);
    setSelectedVariantKey(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine current Palo object
  const getCurrentPalo = (): PaloData | null => {
    if (selectedVariantKey && PALOS_DATA['Tangos']?.variants?.[selectedVariantKey]) {
      return PALOS_DATA['Tangos'].variants[selectedVariantKey];
    }
    if (selectedPaloKey && PALOS_DATA[selectedPaloKey]) {
      return PALOS_DATA[selectedPaloKey];
    }
    return null;
  };

  const activePalo = getCurrentPalo();
  const activeDansePalo: DansePaloData = BAILE_PALOS_DATA[selectedPaloKey || 'Farruca'] || BAILE_PALOS_DATA['Farruca'];

  // Handle Metronome toggle
  const handleToggleMetronome = () => {
    if (isMetronomePlaying) {
      flamencoMetronome.stop();
      setIsMetronomePlaying(false);
    } else {
      let compasToUse: PaloCompas;
      if (discipline === 'danse') {
        compasToUse = activeDansePalo.compas;
      } else {
        compasToUse = activePalo?.compas && activePalo.compas.beats > 0
          ? activePalo.compas
          : PALOS_DATA['Bulerias'].compas;
      }

      flamencoMetronome.setPattern(compasToUse.beats, compasToUse.accents, compasToUse.defaultBpm);
      flamencoMetronome.start(compasToUse.beats === 12 ? 12 : 1);
      setIsMetronomePlaying(true);
    }
  };

  // Navigation handlers
  const handleOpenPalo = (paloKey: string, initialTab?: SectionTab) => {
    setSelectedPaloKey(paloKey);
    setSelectedVariantKey(null);
    setPaloInitialTab(initialTab);
    setDanseTab('hub');
    setDanseCustomFolderId(null);
    setIsBiblioPageOpen(false);
    setIsStudioPageOpen(false);
    setDanseInitialTreeFolder(null);
    setCurrentView('palo-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBibliotheque = (paloKey: string) => {
    setSelectedPaloKey(paloKey);
    setSelectedVariantKey(null);
    setDanseTab('hub');
    setDanseCustomFolderId(null);
    setIsBiblioPageOpen(true);
    setIsStudioPageOpen(false);
    setDanseInitialTreeFolder('biblio');
    setCurrentView('palo-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAtelier = (paloKey: string) => {
    setSelectedPaloKey(paloKey);
    setSelectedVariantKey(null);
    setDanseTab('hub');
    setDanseCustomFolderId(null);
    setIsBiblioPageOpen(false);
    setIsStudioPageOpen(true);
    setDanseInitialTreeFolder('studio');
    setCurrentView('palo-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateDanseTab = (paloKey: string, tab: DanseSectionTab) => {
    setSelectedPaloKey(paloKey);
    setSelectedVariantKey(null);
    setDanseTab(tab);
    setDanseCustomFolderId(null);
    setDanseInitialTreeFolder(null);
    if (tab === 'maitres' || tab === 'cours' || tab === 'letras' || tab === 'compas') {
      setIsBiblioPageOpen(true);
    }
    setCurrentView('palo-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTangosVariants = () => {
    setSelectedPaloKey('Tangos');
    setSelectedVariantKey(null);
    setCurrentView('tangos-variants');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTangosVariantDetail = (variantName: string) => {
    setSelectedVariantKey(variantName);
    setCurrentView('palo-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    if (activeVideoData) {
      setActiveVideoData(null);
      refreshBookmarksCount();
      return;
    }
    if (currentView === 'favorites') {
      if (selectedVariantKey) setCurrentView('palo-detail');
      else if (selectedPaloKey) setCurrentView('palo-detail');
      else setCurrentView('home');
    } else if (currentView === 'palo-detail') {
      if (discipline === 'danse') {
        if (danseCustomFolderId) {
          // Si on est dans un dossier au même niveau que essai dans l'arborescence (ou sous-dossier),
          // on revient sur l'arborescence de la farruca en vert
          setDanseCustomFolderId(null);
          setDanseTab('hub');
          setIsBiblioPageOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        } else if (danseTab !== 'hub') {
          // Si on est dans un dossier (ex: Grands Maîtres, Cours, Letras, Compás, etc.), on retourne à l'arborescence de la Farruca
          setDanseCustomFolderId(null);
          setDanseTab('hub');
          if (!isStudioPageOpen) {
            setIsBiblioPageOpen(true);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        } else if (isStudioPageOpen) {
          // Si on est sur l'arborescence bleue de l'Atelier, on retourne à la vue principale du palo
          setIsStudioPageOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        } else if (isBiblioPageOpen) {
          // Si on est sur l'arborescence verte de la Médiathèque, on retourne à la vue principale du palo
          setIsBiblioPageOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        } else {
          // Déjà sur la vue principale du palo, on revient à la liste des palos
          setSelectedPaloKey(null);
          setCurrentView('home');
        }
      } else if (selectedVariantKey) {
        setSelectedVariantKey(null);
        setCurrentView('tangos-variants');
      } else {
        setSelectedPaloKey(null);
        setCurrentView('home');
      }
    } else if (currentView === 'tangos-variants') {
      setSelectedPaloKey(null);
      setCurrentView('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation depuis la recherche universelle du bandeau supérieur
  const handleNavigateFromSearch = (
    paloKey: string,
    targetDiscipline: DisciplineMode,
    danseTargetTab?: DanseSectionTab,
    guitarTargetTab?: SectionTab
  ) => {
    setDiscipline(targetDiscipline);
    setSelectedPaloKey(paloKey);
    setSelectedVariantKey(null);
    setDanseCustomFolderId(null);
    setCurrentView('palo-detail');
    if (targetDiscipline === 'danse' && danseTargetTab) {
      setDanseTab(danseTargetTab);
    }
    if (targetDiscipline === 'guitare' && guitarTargetTab) {
      setPaloInitialTab(guitarTargetTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setSelectedPaloKey(null);
    setSelectedVariantKey(null);
    setDanseTab('hub');
    setDanseCustomFolderId(null);
    setIsBiblioPageOpen(false);
    setIsStudioPageOpen(false);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute header title & subtitle: "COFLAM APP" remains permanently as application title
  const headerTitle: React.ReactNode = "COFLAM APP";
  let headerSubtitle: React.ReactNode = undefined;

  if (activeVideoData) {
    headerSubtitle = `${activeVideoData.paloName} · ${activeVideoData.sectionName}`;
  } else if (currentView === 'tangos-variants') {
    headerSubtitle = "Tangos · Sélection de la variante";
  } else if (currentView === 'palo-detail') {
    if (discipline === 'danse') {
      if (danseCustomFolderId) {
        headerSubtitle = `${activeDansePalo.name} · Arborescence`;
      } else if (danseTab === 'hub') {
        headerSubtitle = isBiblioPageOpen
          ? `${activeDansePalo.name} · Arborescence`
          : `${activeDansePalo.name} · Danse · Les 6 espaces d'étude`;
      } else if (danseTab === 'maitres') {
        headerSubtitle = `${activeDansePalo.name} · Grands Maîtres (Chorégraphies intégrales)`;
      } else if (danseTab === 'structure') {
        headerSubtitle = `${activeDansePalo.name} · Structure traditionnelle (6 blocs)`;
      } else if (danseTab === 'letras') {
        headerSubtitle = `${activeDansePalo.name} · Letras & Couplets`;
      } else if (danseTab === 'compas') {
        headerSubtitle = `${activeDansePalo.name} · Compás & Rythmique`;
      } else if (danseTab === 'cours') {
        headerSubtitle = `${activeDansePalo.name} · Cours & Stages`;
      } else if (danseTab === 'montages') {
        headerSubtitle = `${activeDansePalo.name} · Mon atelier de création`;
      }
    } else if (activePalo) {
      headerSubtitle = `${activePalo.name} · ${activePalo.subtitle || 'Guitare'}`;
    }
  } else if (currentView === 'favorites') {
    headerSubtitle = discipline === 'danse' 
      ? "Mes Études & Chorégraphies (Carnet personnel)" 
      : "Mes Études & Falsetas (Carnet personnel)";
  } else if (currentView === 'home') {
    // Pas de sous-titre sur l'accueil pour laisser le bandeau supérieur épuré et lisible
    headerSubtitle = undefined;
  }

  // Fichier actif affiché temporairement en haut à droite de COFLAM (Kofun)
  const activeFileName = useMemo(() => {
    if (activeVideoData) return 'VideoPlayerModal.tsx';
    if (addVideoSection) return 'AddVideoModal.tsx';
    if (isToolsModalOpen) {
      if (toolsInitialTab === 'arborescence') return 'ArborescenceViewer.tsx';
      if (toolsInitialTab === 'lexique') return 'FlamencoLexiqueViewer.tsx';
      return 'FlamencoToolsModal.tsx';
    }
    if (isInstallGuideOpen) return 'InstallGuideModal.tsx';
    if (isCloudSyncOpen) return 'CloudSyncModal.tsx';
    if (showFloatingMetronome) return 'CompasVisualizer.tsx';
    if (currentView === 'favorites') return 'FavoritesView.tsx';
    if (currentView === 'tangos-variants') return 'TangosVariants.tsx';
    if (currentView === 'palo-detail') {
      return discipline === 'danse' ? 'DansePaloDetail.tsx' : 'PaloDetail.tsx';
    }
    if (currentView === 'home') {
      if (discipline === 'danse') return 'DansePaloList.tsx';
      if (discipline === 'guitare') return 'PaloList.tsx';
      return 'App.tsx (Cante)';
    }
    return 'App.tsx';
  }, [
    activeVideoData,
    addVideoSection,
    isToolsModalOpen,
    toolsInitialTab,
    isInstallGuideOpen,
    isCloudSyncOpen,
    showFloatingMetronome,
    currentView,
    discipline
  ]);

  return (
    <div className="min-h-screen bg-[#0f0e0d] text-[#f4efe6] flex flex-col font-sans selection:bg-[#e5a93b]/30">
      {/* Top Header */}
      <Header
        title={headerTitle}
        subtitle={headerSubtitle}
        canGoBack={currentView !== 'home'}
        backButtonLabel="Retour"
        onBack={handleGoBack}
        onNavigateHome={handleNavigateHome}
        discipline={discipline}
        onToggleDiscipline={handleToggleDiscipline}
        isMetronomePlaying={isMetronomePlaying}
        onToggleMetronome={handleToggleMetronome}
        onOpenTools={() => handleOpenTools('arborescence')}
        onOpenLexique={() => handleOpenTools('lexique')}
        onOpenFavorites={() => setCurrentView('favorites')}
        favoritesCount={bookmarksCount}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        cloudSyncStatus={cloudSyncState}
        activeFileName={activeFileName}
        onPlayVideo={(video, paloName, paloKey, sectionName) => {
          setActiveVideoData({
            video,
            paloName,
            paloId: paloKey,
            sectionName
          });
        }}
        onNavigatePalo={handleNavigateFromSearch}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto p-3 sm:p-6 pb-24 ${isBiblioPageOpen || isStudioPageOpen ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {/* Sync notification toast */}
        {syncToast && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-[#261f17] border-2 border-[#e5a93b] text-[#f4efe6] shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-2 rounded-xl bg-[#e5a93b]/20 text-[#e5a93b] shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
              <div className="text-xs sm:text-sm font-semibold">
                {syncToast}
              </div>
            </div>
            <button
              onClick={() => setSyncToast(null)}
              className="p-1.5 rounded-lg text-[#a69c8f] hover:text-[#f4efe6] cursor-pointer shrink-0"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentView === 'home' && (
          discipline === 'danse' ? (
            <DansePaloList
              onSelectPalo={handleOpenPalo}
              onBack={() => handleToggleDiscipline('guitare')}
              onOpenInstall={() => setIsInstallGuideOpen(true)}
              onOpenLibrary={() => handleToggleDiscipline('guitare')}
              onOpenArborescence={() => handleOpenTools('arborescence')}
              onOpenLexique={() => handleOpenTools('lexique')}
              onPlayVideo={(video, paloName, paloKey, sectionName) => {
                setActiveVideoData({
                  video,
                  paloName,
                  paloId: paloKey,
                  sectionName
                });
              }}
              onNavigateDanseTab={handleNavigateDanseTab}
              onOpenBibliotheque={handleOpenBibliotheque}
              onOpenAtelier={handleOpenAtelier}
            />
          ) : discipline === 'guitare' ? (
            <PaloList
              onSelectPalo={handleOpenPalo}
              onOpenTangosVariants={handleOpenTangosVariants}
              onOpenInstall={() => setIsInstallGuideOpen(true)}
              onOpenArborescence={() => handleOpenTools('arborescence')}
              onOpenLexique={() => handleOpenTools('lexique')}
              onPlayVideo={(video, paloName, paloKey, sectionName) => {
                setActiveVideoData({
                  video,
                  paloName,
                  paloId: paloKey,
                  sectionName
                });
              }}
            />
          ) : (
            <div className="bg-[#171410] border-2 border-[#382d22] rounded-2xl p-6 sm:p-10 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e5a93b]/20 to-[#b93826]/20 border border-[#e5a93b]/40 flex items-center justify-center mx-auto shadow-inner p-1">
                <FlamencoCantaorIcon className="w-14 h-14" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#f4efe6]">
                  Chant Flamenco (Cante)
                </h2>
                <p className="text-sm text-[#a69c8f] leading-relaxed">
                  L'espace dédié au chant flamenco (styles, letras, tercios, tonalités et accompagnement) est préparé dans le bandeau supérieur commun et sera enrichi très prochainement.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleDiscipline('danse')}
                  className="px-4 py-2 rounded-xl bg-[#e5a93b] hover:bg-[#d4972a] text-[#121110] font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <FlamencoBailaoraIcon className="w-4 h-4 inline-block" />
                  <span>Accéder à la Danse</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDiscipline('guitare')}
                  className="px-4 py-2 rounded-xl bg-[#25201b] hover:bg-[#322c25] text-[#d4c9ba] border border-[#3e3428] font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <FlamencoGuitaristeIcon className="w-4 h-4 inline-block" />
                  <span>Accéder à la Guitare</span>
                </button>
              </div>
            </div>
          )
        )}

        {currentView === 'tangos-variants' && discipline === 'guitare' && (
          <TangosVariants
            onSelectVariant={handleOpenTangosVariantDetail}
            onBack={() => {
              setSelectedPaloKey(null);
              setCurrentView('home');
            }}
          />
        )}

        {currentView === 'palo-detail' && (
          discipline === 'danse' ? (
            <DansePaloDetail
              key={`${activeDansePalo.id}-${customVideosVersion}`}
              palo={activeDansePalo}
              isMetronomePlaying={isMetronomePlaying}
              onToggleMetronome={handleToggleMetronome}
              onPlayVideo={(video, sectionName) => {
                setActiveVideoData({
                  video,
                  paloName: `${activeDansePalo.name} (Danse)`,
                  paloId: activeDansePalo.id,
                  sectionName
                });
              }}
              onOpenAddVideo={section => setAddVideoSection(section)}
              onBack={handleGoBack}
              activeTab={danseTab}
              isBiblioPageOpen={isBiblioPageOpen}
              onToggleBiblioPage={setIsBiblioPageOpen}
              isStudioPageOpen={isStudioPageOpen}
              onToggleStudioPage={setIsStudioPageOpen}
              activeCustomFolderId={danseCustomFolderId}
              onCustomFolderChange={setDanseCustomFolderId}
              initialTreeFolder={danseInitialTreeFolder}
              onTabChange={tab => {
                setDanseTab(tab);
                if (tab === 'maitres' || tab === 'cours' || tab === 'letras' || tab === 'compas') {
                  setIsBiblioPageOpen(true);
                }
                if (tab === 'hub') {
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
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />
          ) : activePalo ? (
            <PaloDetail
              palo={activePalo}
              paloKey={selectedVariantKey || selectedPaloKey || ''}
              initialTab={paloInitialTab}
              isMetronomePlaying={isMetronomePlaying}
              onToggleMetronome={handleToggleMetronome}
              onPlayVideo={(video, sectionName) => {
                setActiveVideoData({
                  video,
                  paloName: activePalo.name,
                  paloId: activePalo.id,
                  sectionName
                });
              }}
              onOpenAddVideo={section => setAddVideoSection(section)}
              onBack={handleGoBack}
            />
          ) : null
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            discipline={discipline}
            onPlayVideo={(video, paloName, paloId, sectionName) => {
              setActiveVideoData({ video, paloName, paloId, sectionName });
            }}
            onClose={handleGoBack}
          />
        )}
      </main>

      {/* Floating Metronome Bar (when metronome is active or minimized) */}
      {isMetronomePlaying && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-[#181512]/95 backdrop-blur-md border border-[#e5a93b]/60 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-3 h-3 rounded-full bg-[#e5a93b] animate-ping shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#f4efe6] block truncate">
                Compás {discipline === 'danse' ? 'Farruca (Danse)' : 'Flamenco'} en cours
              </span>
              <span className="text-[11px] text-[#a69c8f]">
                {discipline === 'danse' 
                  ? '4 temps (Accents 1 & 3)' 
                  : (activePalo?.compas?.beats ? `${activePalo.compas.beats} temps` : '12 temps')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFloatingMetronome(!showFloatingMetronome)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#26211c] text-[#e5a93b] border border-[#3b342c] hover:bg-[#342e26] cursor-pointer"
            >
              {showFloatingMetronome ? 'Masquer cadrant' : 'Régler'}
            </button>
            <button
              onClick={handleToggleMetronome}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#c53d2d] text-white hover:bg-[#a63022] cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Metronome Modal overlay when 'Régler' is clicked */}
      {showFloatingMetronome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#181512] border border-[#383129] rounded-2xl w-full max-w-md p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-[#f4efe6]">
                Réglage du Compás {discipline === 'danse' ? '(Farruca 4 temps)' : ''}
              </h3>
              <button
                onClick={() => setShowFloatingMetronome(false)}
                className="text-xs text-[#a69c8f] hover:text-white"
              >
                Fermer
              </button>
            </div>
            <CompasVisualizer
              compas={discipline === 'danse' ? activeDansePalo.compas : (activePalo?.compas || PALOS_DATA['Bulerias'].compas)}
              isPlaying={isMetronomePlaying}
              onTogglePlay={handleToggleMetronome}
              compact
            />
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideoData && (
        <VideoPlayerModal
          video={activeVideoData.video}
          paloName={activeVideoData.paloName}
          paloId={activeVideoData.paloId}
          sectionName={activeVideoData.sectionName}
          discipline={discipline}
          onClose={() => {
            setActiveVideoData(null);
            refreshBookmarksCount();
          }}
        />
      )}

      {/* Add Custom Video Modal */}
      {addVideoSection && (
        <AddVideoModal
          paloId={discipline === 'danse' ? activeDansePalo.id : (selectedVariantKey || selectedPaloKey || '')}
          paloName={discipline === 'danse' ? `${activeDansePalo.name} (Danse)` : (activePalo?.name || 'Guitare')}
          initialSection={addVideoSection}
          onClose={() => setAddVideoSection(null)}
          onAdded={() => {
            setCustomVideosVersion(v => v + 1);
          }}
        />
      )}

      {/* Cejilla & Techniques Modal */}
      {isToolsModalOpen && (
        <FlamencoToolsModal
          initialTab={toolsInitialTab}
          onClose={() => setIsToolsModalOpen(false)}
        />
      )}

      {/* Mobile Install Guide & QR Code Modal */}
      {isInstallGuideOpen && (
        <InstallGuideModal
          onClose={() => setIsInstallGuideOpen(false)}
        />
      )}

      {/* Real-time Cloud Synchronization & Pairing Modal */}
      {isCloudSyncOpen && (
        <CloudSyncModal
          onClose={() => setIsCloudSyncOpen(false)}
        />
      )}

      {/* Offline connectivity indicator */}
      <OfflineIndicator />
    </div>
  );
}

