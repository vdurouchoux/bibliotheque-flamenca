import React, { useState, useEffect } from 'react';
import { PALOS_DATA } from './data/flamencoData';
import { BAILE_PALOS_DATA } from './data/baileData';
import { PaloData, VideoItem, PaloCompas, DisciplineMode, DansePaloData, PracticeBookmark } from './types';
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
import { CompasVisualizer } from './components/CompasVisualizer';
import { InstallGuideModal } from './components/InstallGuideModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { flamencoMetronome } from './utils/audioMetronome';
import { getBookmarks } from './utils/storage';
import { Volume2, Square, Play } from 'lucide-react';

export default function App() {
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

  // Modals state
  const [activeVideoData, setActiveVideoData] = useState<{
    video: VideoItem;
    paloName: string;
    paloId: string;
    sectionName: string;
  } | null>(null);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(false);
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
      ['marcajes', 'zapateado', 'llamadas', 'maitres', 'structure'].includes(item.section.toLowerCase());
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

  const handleToggleDiscipline = (mode: DisciplineMode) => {
    setDiscipline(mode);
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
  const handleOpenPalo = (paloKey: string) => {
    setSelectedPaloKey(paloKey);
    setSelectedVariantKey(null);
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
    if (currentView === 'favorites') {
      if (selectedVariantKey) setCurrentView('palo-detail');
      else if (selectedPaloKey) setCurrentView('palo-detail');
      else setCurrentView('home');
    } else if (currentView === 'palo-detail') {
      if (selectedVariantKey) {
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

  // Compute header title & subtitle
  let headerTitle = "Bibliothèque Flamenca";
  let headerSubtitle = discipline === 'danse' 
    ? "Compagnon d'étude – Danse (Baile)" 
    : "Compagnon d'étude – Guitare";

  if (currentView === 'tangos-variants') {
    headerTitle = "Tangos";
    headerSubtitle = "Sélection de la variante";
  } else if (currentView === 'palo-detail') {
    if (discipline === 'danse') {
      headerTitle = `${activeDansePalo.name} (Danse)`;
      headerSubtitle = "Guide de montage & Technique";
    } else if (activePalo) {
      headerTitle = activePalo.name;
      headerSubtitle = activePalo.subtitle;
    }
  } else if (currentView === 'favorites') {
    headerTitle = discipline === 'danse' 
      ? "Mes Études & Chorégraphies" 
      : "Mes Études & Falsetas";
    headerSubtitle = discipline === 'danse'
      ? "Carnet personnel de danse (Baile)"
      : "Carnet personnel de guitare";
  }

  return (
    <div className="min-h-screen bg-[#0f0e0d] text-[#f4efe6] flex flex-col font-sans selection:bg-[#e5a93b]/30">
      {/* Top Header */}
      <Header
        title={headerTitle}
        subtitle={headerSubtitle}
        canGoBack={currentView !== 'home'}
        onBack={handleGoBack}
        discipline={discipline}
        onToggleDiscipline={handleToggleDiscipline}
        isMetronomePlaying={isMetronomePlaying}
        onToggleMetronome={handleToggleMetronome}
        onOpenTools={() => setIsToolsModalOpen(true)}
        onOpenFavorites={() => setCurrentView('favorites')}
        favoritesCount={bookmarksCount}
        onOpenInstall={() => setIsInstallGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 pb-24">
        {currentView === 'home' && (
          discipline === 'danse' ? (
            <DansePaloList
              onSelectPalo={handleOpenPalo}
              onOpenInstall={() => setIsInstallGuideOpen(true)}
            />
          ) : (
            <PaloList
              onSelectPalo={handleOpenPalo}
              onOpenTangosVariants={handleOpenTangosVariants}
              onOpenInstall={() => setIsInstallGuideOpen(true)}
            />
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
            />
          ) : activePalo ? (
            <PaloDetail
              palo={activePalo}
              paloKey={selectedVariantKey || selectedPaloKey || ''}
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

      {/* Video Player Modal with the new return button at the bottom */}
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
          onClose={() => setIsToolsModalOpen(false)}
        />
      )}

      {/* Mobile Install Guide & QR Code Modal */}
      {isInstallGuideOpen && (
        <InstallGuideModal
          onClose={() => setIsInstallGuideOpen(false)}
        />
      )}

      {/* Offline connectivity indicator */}
      <OfflineIndicator />
    </div>
  );
}

