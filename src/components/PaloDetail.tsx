import React, { useState } from 'react';
import { Play, Plus, Bookmark, Copy, Check, ExternalLink, Sparkles, ChevronRight, ChevronLeft, ArrowUp, Layers, Volume2, Info, Guitar, Quote, X, Share2 } from 'lucide-react';
import { PaloData, SectionTab, Level, VideoItem } from '../types';
import { CompasVisualizer } from './CompasVisualizer';
import { getBookmarks, toggleBookmark, getCustomVideos, extractYouTubeInfo } from '../utils/storage';
import { getVideoShareData, getSectionShareData, ShareOptions } from '../utils/shareUtils';
import { ShareModal } from './ShareModal';

interface PaloDetailProps {
  palo: PaloData;
  paloKey: string;
  isMetronomePlaying: boolean;
  onToggleMetronome: () => void;
  onPlayVideo: (video: VideoItem, sectionName: string) => void;
  onOpenAddVideo: (section: 'falsetas' | 'cante' | 'baile') => void;
  onBack?: () => void;
}

export const PaloDetail: React.FC<PaloDetailProps> = ({
  palo,
  paloKey,
  isMetronomePlaying,
  onToggleMetronome,
  onPlayVideo,
  onOpenAddVideo,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<SectionTab>(palo.intro ? 'intro' : 'falsetas');
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [copiedLetra, setCopiedLetra] = useState<boolean>(false);
  const [shareModalOptions, setShareModalOptions] = useState<ShareOptions | null>(null);

  const bookmarks = getBookmarks();
  const customStore = getCustomVideos();
  const paloCustom = customStore[paloKey] || {};

  const getIntroVideos = () => {
    const staticIntro = palo.intro?.videos || [];
    const customList = (paloCustom['intro'] || []) as VideoItem[];
    return [...staticIntro, ...customList];
  };

  // Combine static videos with custom videos for a given section
  const getSectionVideos = (section: 'falsetas' | 'cante') => {
    const staticGroup = palo[section] || {};
    const customList = (paloCustom[section] || []) as VideoItem[];

    const result: VideoItem[] = [];

    [1, 2, 3].forEach(lvl => {
      const lvlKey = lvl as Level;
      const staticVideos = (staticGroup[lvlKey] || []).map(v => ({ ...v, level: lvlKey }));
      const customVideos = customList.filter(v => v.level === lvlKey);
      result.push(...staticVideos, ...customVideos);
    });

    return result;
  };

  const getBaileVideos = () => {
    const staticBaile = palo.baile?.videos || {};
    const customList = (paloCustom['baile'] || []) as VideoItem[];
    const result: VideoItem[] = [];

    [1, 2, 3].forEach(lvl => {
      const lvlKey = lvl as Level;
      const staticVideos = (staticBaile[lvlKey] || []).map(v => ({ ...v, level: lvlKey }));
      const customVideos = customList.filter(v => v.level === lvlKey);
      result.push(...staticVideos, ...customVideos);
    });

    return result;
  };

  const copyLetraToClipboard = () => {
    if (palo.baile?.letraSpanish) {
      navigator.clipboard.writeText(palo.baile.letraSpanish);
      setCopiedLetra(true);
      setTimeout(() => setCopiedLetra(false), 2000);
    }
  };

  // Render video list card
  const renderVideoCard = (video: VideoItem, sectionName: string) => {
    const isSaved = !!bookmarks[video.id];
    const status = bookmarks[video.id]?.status;
    const ytInfo = extractYouTubeInfo(video.url);
    const videoId = ytInfo.videoId;
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    const isPreviewing = previewVideoId === video.id;

    return (
      <div
        key={video.id}
        className="group bg-[#171412] hover:bg-[#1f1b17] border border-[#2f2821] hover:border-[#e5a93b]/70 rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {isPreviewing && videoId ? (
            <div className="w-36 sm:w-48 aspect-video rounded-lg overflow-hidden bg-black border-2 border-[#e5a93b] shrink-0 relative shadow-md">
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
                className="absolute top-1 right-1 p-1 rounded-full bg-black/85 hover:bg-black text-white text-[10px] border border-white/20 transition-all cursor-pointer shadow z-10 hover:border-[#e5a93b]"
                title="Fermer l'aperçu"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : thumbUrl ? (
            <div
              className="w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-[#12100d] border border-[#2e261e] shrink-0 relative group/thumb cursor-pointer shadow-sm"
              onClick={() => setPreviewVideoId(video.id)}
              title="Cliquer pour prévisualiser la vidéo ici (sans changer de page)"
            >
              <img
                src={thumbUrl}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-[#e5a93b]/90 text-[#121110] flex items-center justify-center shadow">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          ) : null}

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onPlayVideo(video, sectionName)}
          >
            <div className="flex items-center gap-2 mb-1">
              {video.isCustom && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#e5a93b]/20 text-[#e5a93b] font-medium">
                  Personnalisé
                </span>
              )}

              {status && (
                <span className="text-[10px] text-[#a69c8f] italic">
                  • {status === 'mastered' ? 'Maîtrisé ✓' : status === 'learning' ? 'En cours' : 'À travailler'}
                </span>
              )}
            </div>

            <h4 className="text-sm sm:text-base font-bold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors truncate">
              {video.title}
            </h4>

            {video.description && (
              <p className="text-xs text-[#8c8173] line-clamp-1 mt-0.5">
                {video.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              const opts = getVideoShareData({
                video,
                paloName: `${palo.name} (Guitare)`,
                paloId: paloKey,
                sectionName,
                discipline: 'guitare'
              });
              setShareModalOptions(opts);
            }}
            className="p-2 rounded-xl border bg-[#221e1a] text-[#7a6f62] border-[#312a23] hover:text-[#e5a93b] hover:border-[#e5a93b]/50 transition-colors cursor-pointer"
            title="Partager cette vidéo"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              toggleBookmark({
                videoId: video.id,
                paloId: palo.id,
                paloName: palo.name,
                section: sectionName,
                title: video.title,
                url: video.url,
                level: video.level,
                status: 'learning',
                discipline: 'guitare'
              });
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-[#e5a93b]/20 text-[#e5a93b] border-[#e5a93b]/50'
                : 'bg-[#221e1a] text-[#7a6f62] border-[#312a23] hover:text-[#d4c9ba]'
            }`}
            title={isSaved ? 'Dans mes études' : 'Ajouter aux études'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => {
              setPreviewVideoId(null);
              onPlayVideo(video, sectionName);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#e5a93b] hover:bg-[#d4972c] text-[#121110] font-bold text-xs transition-colors cursor-pointer shadow-md shadow-[#e5a93b]/15"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Visionner & travailler</span>
          </button>
        </div>
      </div>
    );
  };

  // Render Traditional Letra Card (with Spanish, French, and Audio/Video button)
  const renderLetraCard = () => {
    if (!palo.baile?.letraSpanish) return null;

    return (
      <div className="bg-[#171412] border border-[#2f2821] rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e5a93b]/15 text-[#e5a93b]">
              <Quote className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#f4efe6] font-serif">
              {palo.baile.letraTitle || 'Letra traditionnelle chantée'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {palo.baile.letraVideo && (
              <button
                onClick={() => onPlayVideo(palo.baile.letraVideo!, 'Letra chantée')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e5a93b] hover:bg-[#d4972c] text-[#121110] text-xs font-bold transition-colors cursor-pointer shadow-sm"
                title="Écouter la letra chantée et accompagnée à la guitare"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Exemple chanté & guitare</span>
              </button>
            )}
            <button
              onClick={copyLetraToClipboard}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#221e1a] hover:bg-[#2d2721] border border-[#332c25] text-xs text-[#e5a93b] cursor-pointer transition-colors"
              title="Copier les paroles"
            >
              {copiedLetra ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLetra ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Spanish text */}
          <div className="p-4 rounded-xl bg-[#141210] border-l-4 border-[#e5a93b] space-y-1">
            <span className="text-[10px] font-bold text-[#e5a93b] tracking-wider uppercase">
              Paroles en Espagnol (Cante)
            </span>
            <p className="text-xs sm:text-sm font-serif italic text-[#f4efe6] whitespace-pre-line leading-relaxed">
              {palo.baile.letraSpanish}
            </p>
          </div>

          {/* French translation */}
          {palo.baile.letraFrench && (
            <div className="p-4 rounded-xl bg-[#141210] border-l-4 border-[#8c8173] space-y-1">
              <span className="text-[10px] font-bold text-[#a69c8f] tracking-wider uppercase">
                Traduction en Français
              </span>
              <p className="text-xs sm:text-sm italic text-[#d4c9ba] whitespace-pre-line leading-relaxed">
                {palo.baile.letraFrench}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Palo Title Card */}
      <div className="bg-[#1c1814] border border-[#383129] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3b2b1b] text-[#f5b742] border border-[#e5a93b]/40">
                {palo.tag}
              </span>
              {palo.origin && (
                <span className="text-xs text-[#a69c8f]">
                  📍 {palo.origin}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4efe6] font-serif mt-1">
              {palo.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#b5a99a] mt-0.5">
              {palo.subtitle}
            </p>
          </div>

          {/* Quick Compás button if metered */}
          {palo.compas.beats > 0 && (
            <button
              onClick={() => setActiveTab('compas')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#27211a] hover:bg-[#342c22] border border-[#44382c] text-xs font-semibold text-[#e5a93b] cursor-pointer transition-colors shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              <span>{palo.compas.beats} temps • {palo.compas.defaultBpm} BPM</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-[#141210] p-1.5 rounded-2xl border border-[#2e2720]">
        {[
          { key: 'intro', label: '🎬 Intro & Compás' },
          { key: 'falsetas', label: '🎸 Falsetas' },
          { key: 'cante', label: '🎤 Acomp. Cante' },
          { key: 'baile', label: '💃 Acomp. Baile' },
          { key: 'harmonie', label: '🎼 Harmonie' },
          { key: 'compas', label: '⏱️ Métronome' }
        ].map(tab => (
          <button
            key={tab.key}
            id={`tab-btn-${tab.key}`}
            onClick={() => setActiveTab(tab.key as SectionTab)}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center truncate ${
              activeTab === tab.key
                ? 'bg-[#e5a93b] text-[#121110] shadow-md shadow-[#e5a93b]/20'
                : 'text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#1f1b17]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Level filter for video tabs */}
      {(activeTab === 'intro' || activeTab === 'falsetas' || activeTab === 'cante' || activeTab === 'baile') && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-[#8c8173] mr-1 hidden sm:inline">Niveau :</span>
            {[
              { id: 'all', label: 'Tous' },
              { id: 1, label: 'Niv. 1 (Débutant)' },
              { id: 2, label: 'Niv. 2 (Moyen)' },
              { id: 3, label: 'Niv. 3 (Avancé)' }
            ].map(lvl => (
              <button
                key={String(lvl.id)}
                onClick={() => setSelectedLevelFilter(lvl.id as number | 'all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedLevelFilter === lvl.id
                    ? 'bg-[#e5a93b]/20 text-[#e5a93b] border-[#e5a93b]'
                    : 'bg-[#1a1714] text-[#8c8173] border-[#2e2720] hover:text-[#d4c9ba]'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenAddVideo((activeTab === 'intro' ? 'falsetas' : activeTab) as 'falsetas' | 'cante' | 'baile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#221d18] hover:bg-[#2e2720] border border-[#3b3228] text-xs font-semibold text-[#e5a93b] cursor-pointer transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Ajouter vidéo</span>
          </button>
        </div>
      )}

      {/* Tab 0: Intro & Compás (Démarrer à la guitare & mettre dans l'ambiance) */}
      {activeTab === 'intro' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Card Concept / Rôle de l'Intro */}
          <div className="bg-[#171412] border border-[#2f2821] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#2a231b] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#e5a93b]/15 text-[#e5a93b]">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#f4efe6]">
                    {palo.intro?.title || `Introduction & Mise en Compás : ${palo.name}`}
                  </h3>
                  <span className="text-xs text-[#a69c8f]">
                    Comment démarrer à la guitare, donner le compás et installer le climat
                  </span>
                </div>
              </div>

              {palo.compas && (
                <button
                  onClick={onToggleMetronome}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                    isMetronomePlaying
                      ? 'bg-[#c53d2d] text-white hover:bg-[#a63022]'
                      : 'bg-[#e5a93b]/20 hover:bg-[#e5a93b]/30 text-[#e5a93b] border border-[#e5a93b]/40'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isMetronomePlaying ? 'Arrêter métronome' : `Lancer métronome (${palo.compas.defaultBpm} BPM)`}</span>
                </button>
              )}
            </div>

            {/* Concept / Rôle musical */}
            {palo.intro?.concept && (
              <div className="p-4 rounded-xl bg-[#1d1814] border-l-4 border-[#e5a93b] text-xs sm:text-sm text-[#e8dfd3] leading-relaxed">
                <strong className="text-[#e5a93b] block mb-1 font-semibold uppercase tracking-wider text-[11px]">
                  Rôle musical de l'entrée :
                </strong>
                {palo.intro.concept}
              </div>
            )}

            {/* Step-by-step How to Start */}
            {palo.intro?.howToStart && (
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5a93b] flex items-center gap-1.5">
                  <Guitar className="w-4 h-4" />
                  <span>Comment démarrer à la guitare (pas à pas)</span>
                </h4>
                <div className="space-y-2">
                  {palo.intro.howToStart.split('\n').map((line, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#13110f] border border-[#2a241e] rounded-xl flex items-start gap-3 text-xs sm:text-sm text-[#d4c9ba]"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#e5a93b]/20 text-[#e5a93b] font-bold text-xs flex items-center justify-center shrink-0 border border-[#e5a93b]/30 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{line.replace(/^[0-9]+\.\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compás & Harmonie tips cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {palo.intro?.compasAdvice && (
                <div className="p-3.5 bg-[#14110f] border border-[#2b241d] rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-1">
                    ⏱️ Conseils de compás
                  </span>
                  <p className="text-xs text-[#b5a99a] leading-relaxed">
                    {palo.intro.compasAdvice}
                  </p>
                </div>
              )}

              {palo.intro?.tonalAmbience && (
                <div className="p-3.5 bg-[#14110f] border border-[#2b241d] rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-[#e5a93b] uppercase tracking-wider flex items-center gap-1">
                    🎨 Couleur & Ambiance sonore
                  </span>
                  <p className="text-xs text-[#b5a99a] leading-relaxed">
                    {palo.intro.tonalAmbience}
                  </p>
                  {palo.intro.chordsTips && (
                    <p className="text-[11px] font-mono text-[#e5a93b] bg-[#221c16] px-2 py-1 rounded border border-[#382d21]">
                      {palo.intro.chordsTips}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Videos de démonstration directe guitare en main */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-[#f4efe6] flex items-center gap-2">
                  <span>Exemples vidéo : Guitare en action</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e5a93b]/20 text-[#e5a93b] font-semibold border border-[#e5a93b]/30">
                    Jeu direct sans bavardage
                  </span>
                </h4>
                <p className="text-xs text-[#8c8173]">
                  Démonstrations de guitaristes : pose du compás, rasgueados d'ambiance et premières falsetas d'appel
                </p>
              </div>
            </div>

            {(() => {
              const allIntroVideos = getIntroVideos();
              const filtered = allIntroVideos.filter(
                v => selectedLevelFilter === 'all' || v.level === selectedLevelFilter
              );

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-8 bg-[#171412] rounded-2xl border border-[#2f2821] p-5">
                    <p className="text-sm text-[#a69c8f]">
                      Pas de vidéo d'entrée répertoriée pour ce niveau.
                    </p>
                  </div>
                );
              }

              return filtered.map(v => renderVideoCard(v, 'Intro & Compás'));
            })()}
          </div>
        </div>
      )}

      {/* Tab 1: Falsetas */}
      {activeTab === 'falsetas' && (
        <div className="space-y-3">
          {(() => {
            const allVideos = getSectionVideos('falsetas');
            const filtered = allVideos.filter(
              v => selectedLevelFilter === 'all' || v.level === selectedLevelFilter
            );

            if (filtered.length === 0) {
              return (
                <div className="text-center py-10 bg-[#171412] rounded-2xl border border-[#2f2821] p-5">
                  <p className="text-sm text-[#a69c8f]">
                    Pas encore de falsetas répertoriées pour ce niveau.
                  </p>
                  <button
                    onClick={() => onOpenAddVideo('falsetas')}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e5a93b] text-[#121110] text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter votre première falseta</span>
                  </button>
                </div>
              );
            }

            return filtered.map(v => renderVideoCard(v, 'Falsetas'));
          })()}
        </div>
      )}

      {/* Tab 2: Acomp. Cante */}
      {activeTab === 'cante' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#1a1714] border border-[#332c25] rounded-xl text-xs text-[#b5a99a] leading-relaxed">
            <strong className="text-[#e5a93b]">Conseil pour le cante :</strong> L'accompagnement du chant exige de respirer avec le cantaor. Restez sobre pendant les <em className="text-[#f4efe6]">tercios</em> (strophes) et placez des remates clairs lors des respirations.
          </div>

          {/* Traditional Letra chantée */}
          {renderLetraCard()}

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#f4efe6] font-serif">
              Tutoriels et enregistrements d'accompagnement du Cante
            </h3>
            {(() => {
              const allVideos = getSectionVideos('cante');
              const filtered = allVideos.filter(
                v => selectedLevelFilter === 'all' || v.level === selectedLevelFilter
              );

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-10 bg-[#171412] rounded-2xl border border-[#2f2821] p-5">
                    <p className="text-sm text-[#a69c8f]">
                      Pas encore de vidéos d'accompagnement de cante pour cette section.
                    </p>
                    <button
                      onClick={() => onOpenAddVideo('cante')}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e5a93b] text-[#121110] text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une vidéo de cante</span>
                    </button>
                  </div>
                );
              }

              return filtered.map(v => renderVideoCard(v, 'Acomp. cante'));
            })()}
          </div>
        </div>
      )}

      {/* Tab 3: Acomp. Baile */}
      {activeTab === 'baile' && (
        <div className="space-y-5">
          {/* Structure step-by-step */}
          {palo.baile?.structureSteps && palo.baile.structureSteps.length > 0 && (
            <div className="bg-[#171412] border border-[#2f2821] rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
              <h3 className="text-base font-bold text-[#f4efe6] font-serif flex items-center gap-2">
                <span>Structure pas à pas du Baile</span>
                <span className="text-xs font-sans font-normal text-[#a69c8f]">
                  ({palo.baile.structureSteps.length} étapes)
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {palo.baile.structureSteps.map(step => (
                  <div
                    key={step.step}
                    className="p-3 bg-[#1e1a16] border border-[#332c25] rounded-xl flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#e5a93b]/20 text-[#e5a93b] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-[#f4efe6]">
                        {step.name}
                      </h4>
                      <p className="text-xs text-[#a69c8f]">
                        {step.description}
                      </p>
                      {step.compasTips && (
                        <div className="text-[11px] text-[#e5a93b] font-medium pt-0.5">
                          ⏱️ {step.compasTips}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structure illustrative videos (Entrada, Llamada, Cierre, Escobilla...) */}
          {palo.baile?.structureVideos && palo.baile.structureVideos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#e5a93b]/15 text-[#e5a93b]">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#f4efe6] font-serif">
                  Éléments clés de structure (Entrada, Llamadas, Cierres...)
                </h3>
              </div>
              <div className="space-y-2.5">
                {palo.baile.structureVideos.map(v => renderVideoCard(v, 'Structure du baile'))}
              </div>
            </div>
          )}

          {/* Traditional Letra card */}
          {renderLetraCard()}

          {/* Videos de Baile */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#f4efe6] font-serif">
              Tutoriels vidéo d'accompagnement du Baile
            </h3>
            {(() => {
              const allVideos = getBaileVideos();
              const filtered = allVideos.filter(
                v => selectedLevelFilter === 'all' || v.level === selectedLevelFilter
              );

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-6 bg-[#171412] rounded-2xl border border-[#2f2821] p-4 text-xs text-[#a69c8f]">
                    Pas encore de vidéos de danse pour ce filtre. Utilisez le bouton « Ajouter vidéo » pour en insérer une.
                  </div>
                );
              }

              return filtered.map(v => renderVideoCard(v, 'Acomp. baile'));
            })()}
          </div>
        </div>
      )}

      {/* Tab 4: Harmonie & Accords */}
      {activeTab === 'harmonie' && (
        <div className="space-y-5">
          {/* Summary Box */}
          <div className="bg-[#171412] border border-[#2f2821] rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-base font-bold text-[#f4efe6] font-serif">
              Système Harmonique du Palo
            </h3>
            <div
              className="text-xs sm:text-sm text-[#d4c9ba] leading-relaxed space-y-2"
              dangerouslySetInnerHTML={{ __html: palo.harmonie.summary }}
            />

            {/* Cadence progression pills */}
            <div className="pt-2">
              <span className="text-xs text-[#a69c8f] block mb-1.5 font-medium">
                Cadence caractéristique :
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {palo.harmonie.cadence.map((chord, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-3 py-1.5 rounded-xl bg-[#221c16] border border-[#3b3124] text-xs sm:text-sm font-mono font-bold text-[#e5a93b]">
                      {chord}
                    </span>
                    {idx < palo.harmonie.cadence.length - 1 && (
                      <span className="text-[#706659] text-xs">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Cejilla recommendation */}
            <div className="p-3 bg-[#1c1814] rounded-xl border border-[#332c25] text-xs text-[#b5a99a] mt-2">
              <strong className="text-[#e5a93b]">Cejilla conseillée :</strong> {palo.harmonie.cejillaTips}
            </div>
          </div>

          {/* Chord Voicings Grid */}
          {palo.harmonie.chords && palo.harmonie.chords.length > 0 && (
            <div className="bg-[#171412] border border-[#2f2821] rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2">
                <Guitar className="w-5 h-5 text-[#e5a93b]" />
                <h3 className="text-base font-bold text-[#f4efe6] font-serif">
                  Positions & Voicings Flamencos Clés
                </h3>
              </div>
              <p className="text-xs text-[#8c8173]">
                Doigtés des cordes graves aux aiguës (E-A-D-G-B-e). Le « x » indique une corde étouffée, « 0 » une corde jouée à vide.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {palo.harmonie.chords.map(chord => (
                  <div
                    key={chord.name}
                    className="p-3.5 bg-[#1e1a16] border border-[#332c25] rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#f4efe6] font-serif">
                        {chord.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#e5a93b] px-2 py-0.5 rounded bg-[#2c241b]">
                        {chord.fretText}
                      </span>
                    </div>
                    <p className="text-xs text-[#a69c8f]">
                      {chord.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Compas Metronome */}
      {activeTab === 'compas' && (
        <CompasVisualizer
          compas={palo.compas}
          isPlaying={isMetronomePlaying}
          onTogglePlay={() => onToggleMetronome()}
        />
      )}

      {/* Bottom Navigation: Bouton retour en bas de page & retour haut */}
      <div className="pt-6 pb-2 border-t border-[#2a231b] flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1d1814] hover:bg-[#28211b] border border-[#3e3427] text-[#e5a93b] hover:text-[#f4efe6] font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
            title="Revenir à la page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← Retour à la liste des palos</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-1.5 text-xs text-[#8c8173] hover:text-[#e5a93b] transition-colors py-2 px-3 rounded-lg cursor-pointer"
          title="Remonter en haut de la page"
        >
          <span>Haut de page</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {shareModalOptions && (
        <ShareModal
          options={shareModalOptions}
          onClose={() => setShareModalOptions(null)}
        />
      )}
    </div>
  );
};
