import React, { useState } from 'react';
import { 
  Play, Plus, Bookmark, ChevronLeft, ArrowUp, Layers, Volume2, 
  Sparkles, CheckCircle2, Circle, Clock, Flame, ShieldAlert, Award, Footprints, 
  Activity, Video, Music, ExternalLink, BookOpen, Quote, Languages, Trash2, RefreshCw, RotateCcw
} from 'lucide-react';
import { DansePaloData, DanseSectionTab, VideoItem } from '../types';
import { CompasVisualizer } from './CompasVisualizer';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ReplaceVideoModal } from './ReplaceVideoModal';
import { 
  getBookmarks, toggleBookmark, getCustomVideos, 
  getChoreographyChecklist, toggleChoreographyStep,
  getDeletedVideoIds, getReplacedVideos, deleteAnyVideo, resetAllDeletedVideos,
  getVideoCustomLandmarks
} from '../utils/storage';

interface DansePaloDetailProps {
  palo: DansePaloData;
  isMetronomePlaying: boolean;
  onToggleMetronome: () => void;
  onPlayVideo: (video: VideoItem, sectionName: string) => void;
  onOpenAddVideo: (section: string) => void;
  onBack: () => void;
}

export const DansePaloDetail: React.FC<DansePaloDetailProps> = ({
  palo,
  isMetronomePlaying,
  onToggleMetronome,
  onPlayVideo,
  onOpenAddVideo,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<DanseSectionTab>('structure');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [videoVersion, setVideoVersion] = useState<number>(0);
  const [videoToDelete, setVideoToDelete] = useState<{ id: string; title: string; sectionKey: string } | null>(null);
  const [videoToReplace, setVideoToReplace] = useState<{ video: VideoItem; sectionKey: string } | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => 
    getChoreographyChecklist(palo.id)
  );

  const bookmarks = getBookmarks();
  const customStore = getCustomVideos();
  const paloCustom = customStore[palo.id] || {};

  const handleToggleStep = (stepNumber: number) => {
    const updated = toggleChoreographyStep(palo.id, stepNumber);
    setCompletedSteps(updated);
  };

  const getSectionVideos = (section: 'marcajes' | 'zapateado' | 'llamadas') => {
    const deletedIds = getDeletedVideoIds();
    const replacedVideos = getReplacedVideos();

    const staticGroup = palo[section] || {};
    const rawStaticList = Object.values(staticGroup).flat() as VideoItem[];
    const staticList = rawStaticList
      .filter(v => !deletedIds.includes(v.id))
      .map(v => replacedVideos[v.id] || v);

    const customList = ((paloCustom[section] || []) as VideoItem[])
      .filter(v => !deletedIds.includes(v.id))
      .map(v => replacedVideos[v.id] || v);

    return [...staticList, ...customList];
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
      },
      {
        name: 'Marquages',
        key: 'marcajes',
        videos: [
          ...Object.values(palo.marcajes || {}).flat(),
          ...((paloCustom['marcajes'] || []) as VideoItem[])
        ]
      },
      {
        name: 'Zapateado',
        key: 'zapateado',
        videos: [
          ...Object.values(palo.zapateado || {}).flat(),
          ...((paloCustom['zapateado'] || []) as VideoItem[])
        ]
      },
      {
        name: 'Llamadas',
        key: 'llamadas',
        videos: [
          ...Object.values(palo.llamadas || {}).flat(),
          ...((paloCustom['llamadas'] || []) as VideoItem[])
        ]
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
    const customLandmarks = getVideoCustomLandmarks(video.id);
    const activeLandmarks = customLandmarks !== null ? customLandmarks : (video.landmarks || []);

    return (
      <div
        key={video.id}
        className="p-4 rounded-xl bg-[#1a1713] border border-[#302820] hover:border-[#e5a93b]/60 transition-all group flex flex-col justify-between gap-3 shadow-md"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  video.level === 1
                    ? 'bg-[#1b2b1d] text-[#71d28c] border-[#294c2e]'
                    : video.level === 2
                    ? 'bg-[#332b17] text-[#e5a93b] border-[#4d3e1d]'
                    : 'bg-[#3b1c1c] text-[#ff7b7b] border-[#572727]'
                }`}
              >
                Niveau {video.level}
              </span>
              {video.isCustom && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2a1c38] text-[#c99eff] border border-[#432b5e]">
                  Ajouté par vous
                </span>
              )}
              {video.danceInterval && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e5a93b]/20 text-[#e5a93b] border border-[#e5a93b]/50 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#e5a93b]" />
                  <span>{video.danceInterval.label}</span>
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
            onClick={() => onPlayVideo(video, sectionTitle)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Visionner & Travailler</span>
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

  return (
    <div className="space-y-5">
      {/* Hero Card Palo Danse */}
      <div className="bg-gradient-to-br from-[#1a1612] via-[#141210] to-[#1a1210] border border-[#382d22] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#c53d2d]/20 text-[#ff8f82] border border-[#c53d2d]/40">
                💃 Danse Flamenca (Baile)
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2a231b] text-[#e5a93b] border border-[#3d3326]">
                {palo.tag}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4efe6] font-serif tracking-tight">
              {palo.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#b8ada0] mt-0.5">
              {palo.subtitle}
            </p>
          </div>

          <button
            onClick={onToggleMetronome}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md shrink-0 ${
              isMetronomePlaying
                ? 'bg-[#c53d2d] text-white hover:bg-[#a63022]'
                : 'bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isMetronomePlaying ? 'Arrêter compás' : `Métronome 4 temps (${palo.compas.defaultBpm} BPM)`}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
          <div className="p-3 bg-[#171410] border border-[#2b2219] rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Caractère de la danse</span>
            </span>
            <p className="text-[#a69c8f] leading-relaxed">
              {palo.character}
            </p>
          </div>

          <div className="p-3 bg-[#171410] border border-[#2b2219] rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Costume & Posture</span>
            </span>
            <p className="text-[#a69c8f] leading-relaxed">
              {palo.costumeAdvice}
            </p>
          </div>

          <div className="p-3 bg-[#171410] border border-[#2b2219] rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Compás & Dynamique</span>
            </span>
            <p className="text-[#a69c8f] leading-relaxed">
              {palo.compas.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation (Danse-specific rubriques) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 bg-[#141210] p-1.5 rounded-2xl border border-[#2e2720]">
        {[
          { key: 'structure', label: '📑 Structure' },
          { key: 'marcajes', label: '👣 Marcajes' },
          { key: 'zapateado', label: '⚡ Zapateado' },
          { key: 'llamadas', label: '🛑 Llamadas' },
          { key: 'letras', label: '🎤 Letras & Textes' },
          { key: 'maitres', label: '🌟 Grands Maîtres' },
          { key: 'compas', label: '⏱️ Compás (4t)' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as DanseSectionTab)}
            className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center truncate ${
              activeTab === tab.key
                ? 'bg-[#e5a93b] text-[#121110] shadow-md shadow-[#e5a93b]/20'
                : 'text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#1f1b17]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter / Action Bar for video tabs */}
      {(activeTab === 'marcajes' || activeTab === 'zapateado' || activeTab === 'llamadas') && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-[#8c8173] mr-1 hidden sm:inline">Niveau :</span>
            {(['all', 1, 2, 3] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevelFilter(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedLevelFilter === lvl
                    ? 'bg-[#e5a93b] text-[#121110] border-[#e5a93b] shadow-sm'
                    : 'bg-[#1a1713] text-[#a69c8f] border-[#2e2720] hover:text-[#f4efe6]'
                }`}
              >
                {lvl === 'all' ? 'Tous niveaux' : `Niveau ${lvl}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenAddVideo(activeTab)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#221d18] hover:bg-[#2e2720] border border-[#3b3228] text-xs font-semibold text-[#e5a93b] cursor-pointer transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une vidéo</span>
          </button>
        </div>
      )}

      {/* TAB 1: Structure & Montage de la Farruca */}
      {activeTab === 'structure' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Card Guide Global */}
          <div className="bg-[#171411] border border-[#302820] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#29221b] pb-3">
              <span className="p-2 rounded-xl bg-[#e5a93b]/15 text-[#e5a93b]">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#f4efe6]">
                  L'Architecture d'une Farruca complète (6 Blocs de Montage)
                </h3>
                <p className="text-xs text-[#a69c8f]">
                  Le guide étape par étape pour comprendre la logique dramaturgique et construire votre chorégraphie
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#d4c9ba] leading-relaxed bg-[#1f1a15] p-3.5 rounded-xl border border-[#332a21]">
              {palo.choreographyGuide.overview}
            </p>

            {/* Visual Stepper with Interactive Checklist */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5a93b] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mon Carnet de Montage ({completedSteps.length}/{palo.choreographyGuide.structureSteps.length} blocs validés)</span>
                </h4>
                <span className="text-[11px] text-[#8c8173]">
                  Cochez chaque bloc intégré à votre danse
                </span>
              </div>

              <div className="space-y-3">
                {palo.choreographyGuide.structureSteps.map(step => {
                  const isDone = completedSteps.includes(step.stepNumber);

                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-[#152318] border-[#2d4d33]'
                          : 'bg-[#14120f] border-[#29221b]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleStep(step.stepNumber)}
                            className={`p-1 rounded-lg border transition-colors cursor-pointer mt-0.5 shrink-0 ${
                              isDone
                                ? 'bg-[#71d28c] text-[#121110] border-[#71d28c]'
                                : 'bg-[#221c17] text-[#6b6256] border-[#382e22] hover:text-[#e5a93b]'
                            }`}
                            title={isDone ? 'Marquer comme non fait' : 'Valider ce bloc dans ma chorégraphie'}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#e5a93b]/20 text-[#e5a93b]">
                                Bloc {step.stepNumber}
                              </span>
                              <span className="text-xs font-mono text-[#a69c8f] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#e5a93b]" />
                                <span>{step.durationApprox}</span>
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-[#f4efe6] mt-1">
                              {step.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-[#b8ada0] mt-1 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Details Box: Dance Tips & Guitar Code */}
                      <div className="mt-3 pt-3 border-t border-[#261f18] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-[#1a1612] border border-[#2b2219]">
                          <strong className="text-[#e5a93b] block mb-1 font-semibold flex items-center gap-1">
                            <Footprints className="w-3.5 h-3.5" />
                            <span>Conseils de danse :</span>
                          </strong>
                          <ul className="space-y-1 text-[#a69c8f]">
                            {step.danceTips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-[#e5a93b]">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#1a1612] border border-[#2b2219]">
                          <strong className="text-[#70b1ff] block mb-1 font-semibold flex items-center gap-1">
                            <Music className="w-3.5 h-3.5" />
                            <span>Code avec le guitariste :</span>
                          </strong>
                          <p className="text-[#a69c8f] leading-relaxed">
                            {step.communicationWithGuitar}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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

      {/* TAB 2: Marquages & Paseos */}
      {activeTab === 'marcajes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-[#171411] border border-[#2e261f]">
            <h4 className="text-sm font-bold text-[#f4efe6] flex items-center gap-2">
              <span>Marquages & Paseos por {palo.name}</span>
            </h4>
            <p className="text-xs text-[#8c8173] mt-1">
              Les déplacements nobles en 4 temps, ports de bras géométriques, suspensions et préparation aux giros.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(() => {
              const allVideos = getSectionVideos('marcajes');
              const filtered = allVideos.filter(
                v => selectedLevelFilter === 'all' || v.level === selectedLevelFilter
              );

              if (filtered.length === 0) {
                return (
                  <div className="col-span-full text-center py-8 bg-[#171411] rounded-2xl border border-[#2b241d] p-5">
                    <p className="text-sm text-[#a69c8f]">
                      Aucun marquage répertorié pour ce niveau.
                    </p>
                  </div>
                );
              }

              return filtered.map(v => renderVideoCard(v, 'Marquages & Bras', 'marcajes'));
            })()}
          </div>
        </div>
      )}

      {/* TAB 3: Technique de Pieds & Escobillas */}
      {activeTab === 'zapateado' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-[#171411] border border-[#2e261f]">
            <h4 className="text-sm font-bold text-[#f4efe6] flex items-center gap-2">
              <span>Technique de Pieds & Escobillas (Zapateado)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#e5a93b]/20 text-[#e5a93b] font-normal">
                Frappes & Subida
              </span>
            </h4>
            <p className="text-xs text-[#8c8173] mt-1">
              Travail de frappe planta-tacón, doubles talons, contratiempos et accélération progressive (subida de tempo).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(() => {
              const allVideos = getSectionVideos('zapateado');
              const filtered = allVideos.filter(
                v => selectedLevelFilter === 'all' || v.level === selectedLevelFilter
              );

              if (filtered.length === 0) {
                return (
                  <div className="col-span-full text-center py-8 bg-[#171411] rounded-2xl border border-[#2b241d] p-5">
                    <p className="text-sm text-[#a69c8f]">
                      Aucun exercice de pieds répertorié pour ce niveau.
                    </p>
                  </div>
                );
              }

              return filtered.map(v => renderVideoCard(v, 'Pieds & Escobillas', 'zapateado'));
            })()}
          </div>
        </div>
      )}

      {/* TAB 4: Llamadas, Remates & Cierres */}
      {activeTab === 'llamadas' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-[#171411] border border-[#2e261f]">
            <h4 className="text-sm font-bold text-[#f4efe6] flex items-center gap-2">
              <span>Llamadas & Remates de Farruca</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#e5a93b]/20 text-[#e5a93b] font-normal">
                Codes de communication
              </span>
            </h4>
            <p className="text-xs text-[#8c8173] mt-1">
              Les appels indispensables pour guider le guitariste, annoncer les transitions et poser les arrêts nets (cierres).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(() => {
              const allVideos = getSectionVideos('llamadas');
              const filtered = allVideos.filter(
                v => selectedLevelFilter === 'all' || v.level === selectedLevelFilter
              );

              if (filtered.length === 0) {
                return (
                  <div className="col-span-full text-center py-8 bg-[#171411] rounded-2xl border border-[#2b241d] p-5">
                    <p className="text-sm text-[#a69c8f]">
                      Aucune llamada répertoriée pour ce niveau.
                    </p>
                  </div>
                );
              }

              return filtered.map(v => renderVideoCard(v, 'Llamadas & Remates', 'llamadas'));
            })()}
          </div>
        </div>
      )}

      {/* TAB 5: Grands Maîtres & Références */}
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

            <button
              onClick={() => onOpenAddVideo('maitres')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#221d18] hover:bg-[#2c241c] border border-[#e5a93b]/50 hover:border-[#e5a93b] text-xs font-semibold text-[#e5a93b] cursor-pointer transition-all shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une vidéo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {getMaitresVideos().map(v => renderVideoCard(v, 'Grands Maîtres', 'maitres'))}
          </div>
        </div>
      )}

      {/* TAB: Letras & Textes Traditionnels */}
      {activeTab === 'letras' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card Letras */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#171411] border border-[#2e261f] shadow-lg space-y-3">
            <div className="flex items-center justify-between gap-3">
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
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201912] border border-[#3d2f1f] text-xs font-semibold text-[#e5a93b]">
                <Languages className="w-3.5 h-3.5" />
                <span>Bilingue ES / FR</span>
              </span>
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
          <div className="p-4 rounded-xl bg-[#171411] border border-[#2e261f]">
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

      {/* Bouton retour en bas de page pour navigation aisée sur mobile */}
      <div className="pt-6 pb-2 border-t border-[#2a231b] flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1d1814] hover:bg-[#28211b] border border-[#3e3427] text-[#e5a93b] hover:text-[#f4efe6] font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
            title="Revenir à la sélection des palos"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← Retour à la sélection</span>
          </button>

          {getDeletedVideoIds().length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Voulez-vous restaurer toutes les vidéos masquées ou supprimées ?')) {
                  resetAllDeletedVideos();
                  setVideoVersion(v => v + 1);
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#a69c8f] hover:text-[#e5a93b] py-2 px-3 rounded-xl bg-[#1a1713] border border-[#302820] cursor-pointer transition-colors"
              title="Restaurer les vidéos initiales masquées"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurer les vidéos masquées</span>
            </button>
          )}
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-1.5 text-xs text-[#8c8173] hover:text-[#e5a93b] transition-colors py-2 px-3 rounded-lg cursor-pointer"
          title="Remonter en haut de la page"
        >
          <span>Haut de page</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>

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
    </div>
  );
};
