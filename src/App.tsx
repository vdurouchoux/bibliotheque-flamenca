import React, { useState, useEffect } from 'react';
import { PALOS_DATA } from './data/flamencoData';
import { BAILE_PALOS_DATA } from './data/baileData';
import { PaloData, VideoItem, PaloCompas, DisciplineMode, DansePaloData, PracticeBookmark, DanseSectionTab } from './types';
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
    setDanseTab('hub');
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
      if (discipline === 'danse') {
        if (danseTab !== 'hub') {
          // Si on est dans un des 6 blocs (ex: Grands Maîtres, Mes montages), on retourne directement aux 6 carrés !
          setDanseTab('hub');
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
          return;
        } else {
          // Déjà sur les 6 blocs, on revient à la liste des palos
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
      if (danseTab === 'hub') {
        headerTitle = `${activeDansePalo.name} (Danse)`;
        headerSubtitle = "Les 6 espaces d'étude";
      } else if (danseTab === 'maitres') {
        headerTitle = `${activeDansePalo.name} – Grands Maîtres`;
        headerSubtitle = "Chorégraphies intégrales de référence";
      } else if (danseTab === 'structure') {
        headerTitle = `${activeDansePalo.name} – Structure traditionnelle`;
        headerSubtitle = "Chorégraphie canonique en 6 blocs";
      } else if (danseTab === 'letras') {
        headerTitle = `${activeDansePalo.name} – Letras & Textes`;
        headerSubtitle = "Poésie flamenca & couplets";
      } else if (danseTab === 'compas') {
        headerTitle = `${activeDansePalo.name} – Compás`;
        headerSubtitle = "Rythme binaire 4 temps";
      } else if (danseTab === 'cours') {
        headerTitle = `${activeDansePalo.name} – Cours & Stages`;
        headerSubtitle = "Tutoriels & vidéos personnelles";
      } else if (danseTab === 'montages') {
        headerTitle = `${activeDansePalo.name} – Mon studio de montage`;
        headerSubtitle = "Montages chorégraphiques personnalisables";
      }
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
        backButtonLabel="Retour"
        onBack={handleGoBack}
        discipline={discipline}
        onToggleDiscipline={handleToggleDiscipline}
        isMetronomePlaying={isMetronomePlaying}
        onToggleMetronome={handleToggleMetronome}
        onOpenTools={() => setIsToolsModalOpen(true)}
        onOpenFavorites={() => setCurrentView('favorites')}
        favoritesCount={bookmarksCount}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        cloudSyncStatus={cloudSyncState}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 pb-24">
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
              activeTab={danseTab}
              onTabChange={tab => {
                setDanseTab(tab);
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

