import React, { useState, useRef, useMemo } from 'react';
import {
  ArrowRight,
  Lock,
  ChevronDown,
  Flame,
  ShieldAlert,
  Activity,
  Layers,
  Search,
  X,
  Play,
  Film,
  Folder,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { BAILE_PALOS_CATALOG, BAILE_PALOS_DATA, DansePaloPreview } from '../data/baileData';
import { PALOS_DATA } from '../data/flamencoData';
import { DanseArborescenceTree } from './DanseArborescenceTree';
import { VideoItem, DanseSectionTab } from '../types';

interface DansePaloListProps {
  onSelectPalo: (paloKey: string) => void;
  onOpenInstall?: () => void;
  onOpenLibrary?: () => void;
  onOpenArborescence?: () => void;
  onOpenLexique?: () => void;
  onPlayVideo?: (video: VideoItem, paloName: string, paloKey: string, sectionName: string) => void;
  onNavigateDanseTab?: (paloKey: string, tab: DanseSectionTab) => void;
}

interface UniversalSearchItem {
  id: string;
  type: 'video' | 'palo' | 'letra';
  title: string;
  subtitle?: string;
  description?: string;
  paloKey: string;
  paloName: string;
  discipline: 'danse' | 'guitare';
  sectionName: string;
  danseTab?: DanseSectionTab;
  video?: VideoItem;
}

export const DansePaloList: React.FC<DansePaloListProps> = ({
  onSelectPalo,
  onOpenInstall,
  onOpenLibrary,
  onOpenArborescence,
  onOpenLexique,
  onPlayVideo,
  onNavigateDanseTab
}) => {
  // 1. Recherche Générale Globale (en haut)
  const [generalSearchTerm, setGeneralSearchTerm] = useState('');

  // 2. Recherche Dédiée au Catalogue des Palos de Danse (à côté de Palos de Danse)
  const [isCatalogSearchOpen, setIsCatalogSearchOpen] = useState(false);
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const catalogSearchInputRef = useRef<HTMLInputElement>(null);

  const handleToggleCatalogSearch = () => {
    setIsCatalogSearchOpen(prev => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => {
          catalogSearchInputRef.current?.focus();
        }, 60);
      } else {
        setCatalogSearchTerm('');
      }
      return nextState;
    });
  };

  // ---------------------------------------------------------------------------
  // Indexation globale de TOUS les dossiers et fichiers/vidéos de l'application
  // ---------------------------------------------------------------------------
  const allSearchItems = useMemo<UniversalSearchItem[]>(() => {
    const items: UniversalSearchItem[] = [];

    // --- A. Modules & Palos de Danse ---
    BAILE_PALOS_CATALOG.forEach(palo => {
      items.push({
        id: `danse-palo-${palo.id}`,
        type: 'palo',
        title: palo.name,
        subtitle: `${palo.tag} • ${palo.compasSummary}`,
        description: palo.highlights.join(' • '),
        paloKey: palo.id,
        paloName: palo.name,
        discipline: 'danse',
        sectionName: 'Dossier de Danse'
      });
    });

    // Vidéos des Maîtres & démonstrations Danse
    Object.entries(BAILE_PALOS_DATA).forEach(([paloKey, palo]) => {
      // Maîtres de la danse (ex: Iván Vargas, El Güito, Sara Baras...)
      palo.maitres?.forEach(v => {
        items.push({
          id: v.id,
          type: 'video',
          title: v.title,
          description: v.description,
          paloKey,
          paloName: palo.name,
          discipline: 'danse',
          sectionName: 'Maîtres de la danse',
          danseTab: 'maitres',
          video: v
        });
      });

      // Marcajes
      if (palo.marcajes) {
        Object.values(palo.marcajes).forEach(list => {
          list?.forEach(v => {
            items.push({
              id: v.id,
              type: 'video',
              title: v.title,
              description: v.description,
              paloKey,
              paloName: palo.name,
              discipline: 'danse',
              sectionName: 'Marcajes & Pieds',
              danseTab: 'structure',
              video: v
            });
          });
        });
      }

      // Zapateado & Escobilla
      if (palo.zapateado) {
        Object.values(palo.zapateado).forEach(list => {
          list?.forEach(v => {
            items.push({
              id: v.id,
              type: 'video',
              title: v.title,
              description: v.description,
              paloKey,
              paloName: palo.name,
              discipline: 'danse',
              sectionName: 'Zapateado & Escobilla',
              danseTab: 'structure',
              video: v
            });
          });
        });
      }

      // Llamadas & Remates
      if (palo.llamadas) {
        Object.values(palo.llamadas).forEach(list => {
          list?.forEach(v => {
            items.push({
              id: v.id,
              type: 'video',
              title: v.title,
              description: v.description,
              paloKey,
              paloName: palo.name,
              discipline: 'danse',
              sectionName: 'Llamadas & Remates',
              danseTab: 'structure',
              video: v
            });
          });
        });
      }

      // Letras
      palo.letras?.forEach(l => {
        items.push({
          id: l.id,
          type: 'letra',
          title: l.title,
          subtitle: l.coplaText?.join(' '),
          description: `${l.cantaorReference || ''} • ${l.contextAndMeaning || ''}`,
          paloKey,
          paloName: palo.name,
          discipline: 'danse',
          sectionName: 'Letras & Chant',
          danseTab: 'letras',
          video: l.video
        });
      });
    });

    // --- B. Palos & Vidéos de Guitare Flamenca ---
    Object.entries(PALOS_DATA).forEach(([paloKey, palo]) => {
      // Dossier Palo Guitare
      items.push({
        id: `guitare-palo-${paloKey}`,
        type: 'palo',
        title: palo.name,
        subtitle: `${palo.tag} • ${palo.subtitle}`,
        description: palo.character,
        paloKey,
        paloName: palo.name,
        discipline: 'guitare',
        sectionName: 'Dossier Guitare'
      });

      // Intro
      palo.intro?.videos?.forEach(v => {
        items.push({
          id: v.id,
          type: 'video',
          title: v.title,
          description: v.description,
          paloKey,
          paloName: palo.name,
          discipline: 'guitare',
          sectionName: 'Compás & Intro',
          video: v
        });
      });

      // Falsetas
      if (palo.falsetas) {
        Object.entries(palo.falsetas).forEach(([lvl, list]) => {
          list?.forEach(f => {
            items.push({
              id: f.id,
              type: 'video',
              title: f.title,
              subtitle: `Niveau ${lvl}`,
              description: f.description,
              paloKey,
              paloName: palo.name,
              discipline: 'guitare',
              sectionName: 'Falseta',
              video: f
            });
          });
        });
      }

      // Accompagnement Cante
      if (palo.cante) {
        Object.entries(palo.cante).forEach(([lvl, list]) => {
          list?.forEach(c => {
            items.push({
              id: c.id,
              type: 'video',
              title: c.title,
              subtitle: `Niveau ${lvl}`,
              description: c.description,
              paloKey,
              paloName: palo.name,
              discipline: 'guitare',
              sectionName: 'Accompagnement Chant',
              video: c
            });
          });
        });
      }

      // Accompagnement Baile (côté guitare)
      if (palo.baile) {
        palo.baile.structureVideos?.forEach(b => {
          items.push({
            id: b.id,
            type: 'video',
            title: b.title,
            description: b.description,
            paloKey,
            paloName: palo.name,
            discipline: 'guitare',
            sectionName: 'Structure Baile (Guitare)',
            video: b
          });
        });
        if (palo.baile.videos) {
          Object.entries(palo.baile.videos).forEach(([lvl, list]) => {
            list?.forEach(b => {
              items.push({
                id: b.id,
                type: 'video',
                title: b.title,
                subtitle: `Niveau ${lvl}`,
                description: b.description,
                paloKey,
                paloName: palo.name,
                discipline: 'guitare',
                sectionName: 'Accompagnement Baile (Guitare)',
                video: b
              });
            });
          });
        }
      }
    });

    return items;
  }, []);

  // Résultats de la recherche générale
  const generalSearchResults = useMemo(() => {
    const q = generalSearchTerm
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    if (!q) return [];

    return allSearchItems.filter(item => {
      const matchTitle = item.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q);
      const matchDesc = item.description?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q);
      const matchSub = item.subtitle?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q);
      const matchPalo = item.paloName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q);
      const matchSec = item.sectionName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q);

      return matchTitle || matchDesc || matchSub || matchPalo || matchSec;
    });
  }, [generalSearchTerm, allSearchItems]);

  // Regroupement par typologie pour un affichage minimaliste et ordonné
  const groupedResults = useMemo(() => {
    const palos: UniversalSearchItem[] = [];
    const videos: UniversalSearchItem[] = [];
    const texts: UniversalSearchItem[] = [];

    generalSearchResults.forEach(item => {
      if (item.type === 'palo') {
        palos.push(item);
      } else if (item.type === 'video') {
        videos.push(item);
      } else {
        texts.push(item);
      }
    });

    return { palos, videos, texts };
  }, [generalSearchResults]);

  // Filtrage du catalogue des palos de danse (recherche dédiée du catalogue)
  const filteredCatalogPalos = useMemo(() => {
    if (!catalogSearchTerm.trim()) {
      return BAILE_PALOS_CATALOG;
    }
    const cleanSearch = catalogSearchTerm
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    return BAILE_PALOS_CATALOG.filter(item => {
      const matchName = item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchSubtitle = item.subtitle.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchTag = item.tag.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchCompas = item.compasSummary.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchHighlights = item.highlights.some(h =>
        h.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch)
      );
      return matchName || matchSubtitle || matchTag || matchCompas || matchHighlights;
    });
  }, [catalogSearchTerm]);

  const handleOpenItem = (item: UniversalSearchItem) => {
    if (item.type === 'video' && item.video && onPlayVideo) {
      onPlayVideo(item.video, item.paloName, item.paloKey, item.sectionName);
    } else if (item.discipline === 'danse' && item.danseTab && onNavigateDanseTab) {
      onNavigateDanseTab(item.paloKey, item.danseTab);
    } else {
      onSelectPalo(item.paloKey);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. BARRE DE RECHERCHE GÉNÉRALE MINIMALISTE (TOUT EN HAUT)                 */}
      {/* ========================================================================= */}
      <div className="relative space-y-2">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e5a93b]" />
          <input
            id="danse-general-search-input"
            type="text"
            value={generalSearchTerm}
            onChange={e => setGeneralSearchTerm(e.target.value)}
            placeholder="Recherche générale..."
            className="w-full bg-[#171411] border border-[#342a20] focus:border-[#e5a93b] focus:ring-1 focus:ring-[#e5a93b]/30 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#f4efe6] placeholder-[#7d7162] outline-none transition-all shadow-inner"
          />
          {generalSearchTerm && (
            <button
              type="button"
              onClick={() => setGeneralSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#25201b] transition-colors cursor-pointer"
              title="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Panneau de résultats de la Recherche Générale */}
        {generalSearchTerm.trim() && (
          <div className="p-3.5 rounded-2xl bg-[#171411] border border-[#3d3224] shadow-2xl space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-[#a69c8f] border-b border-[#2b2219] pb-2">
              <span>
                Recherche générale : <strong className="text-[#f4efe6]">{generalSearchResults.length}</strong> résultat{generalSearchResults.length > 1 ? 's' : ''} pour « <span className="text-[#e5a93b] font-medium">{generalSearchTerm}</span> »
              </span>
              <button
                type="button"
                onClick={() => setGeneralSearchTerm('')}
                className="text-[#e5a93b] hover:underline cursor-pointer text-xs"
              >
                Fermer
              </button>
            </div>

            {generalSearchResults.length === 0 ? (
              <div className="text-center py-5 text-xs text-[#8c8173]">
                Aucun fichier ni vidéo ne correspond à votre recherche.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {/* 1. TYPOLOGIE : PALOS & DOSSIERS */}
                {groupedResults.palos.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8c8173] flex items-center gap-1.5 px-1">
                      <Folder className="w-3.5 h-3.5 text-[#e5a93b]" />
                      <span>Palos & Dossiers ({groupedResults.palos.length})</span>
                    </div>
                    <div className="space-y-1">
                      {groupedResults.palos.map(item => (
                        <div
                          key={`${item.discipline}-${item.id}`}
                          onClick={() => handleOpenItem(item)}
                          className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#1a1612] hover:bg-[#241e18] border border-[#2d231a] hover:border-[#e5a93b]/60 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm select-none shrink-0" title={item.discipline === 'danse' ? 'Danse' : 'Guitare'}>
                              {item.discipline === 'danse' ? '💃' : '🎸'}
                            </span>
                            <Folder className="w-3.5 h-3.5 text-[#e5a93b] shrink-0" />
                            <span className="text-xs sm:text-sm font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-[#7d7162] shrink-0 hidden xs:inline">
                              ({item.discipline === 'danse' ? 'Danse' : 'Guitare'})
                            </span>
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

                {/* 2. TYPOLOGIE : VIDÉOS */}
                {groupedResults.videos.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8c8173] flex items-center gap-1.5 px-1">
                      <Film className="w-3.5 h-3.5 text-[#e5a93b]" />
                      <span>Vidéos ({groupedResults.videos.length})</span>
                    </div>
                    <div className="space-y-1">
                      {groupedResults.videos.map(item => (
                        <div
                          key={`${item.discipline}-${item.id}`}
                          onClick={() => {
                            if (item.video && onPlayVideo) {
                              onPlayVideo(item.video, item.paloName, item.paloKey, item.sectionName);
                            } else {
                              handleOpenItem(item);
                            }
                          }}
                          className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#1a1612] hover:bg-[#241e18] border border-[#2d231a] hover:border-[#e5a93b]/60 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm select-none shrink-0" title={item.discipline === 'danse' ? 'Danse' : 'Guitare'}>
                              {item.discipline === 'danse' ? '💃' : '🎸'}
                            </span>
                            <Film className="w-3.5 h-3.5 text-[#e5a93b] shrink-0" />
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-xs sm:text-sm font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors truncate">
                                {item.title}
                              </span>
                              <span className="text-[11px] text-[#7d7162] shrink-0 hidden sm:inline">
                                • {item.paloName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.video && onPlayVideo) {
                                  onPlayVideo(item.video, item.paloName, item.paloKey, item.sectionName);
                                } else {
                                  handleOpenItem(item);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] font-bold text-xs transition-all shadow-sm cursor-pointer"
                              title="Lire la vidéo"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span className="hidden xs:inline">Lire</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. TYPOLOGIE : TEXTES & LETRAS */}
                {groupedResults.texts.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8c8173] flex items-center gap-1.5 px-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#e5a93b]" />
                      <span>Textes & Letras ({groupedResults.texts.length})</span>
                    </div>
                    <div className="space-y-1">
                      {groupedResults.texts.map(item => (
                        <div
                          key={`${item.discipline}-${item.id}`}
                          onClick={() => handleOpenItem(item)}
                          className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#1a1612] hover:bg-[#241e18] border border-[#2d231a] hover:border-[#e5a93b]/60 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm select-none shrink-0" title={item.discipline === 'danse' ? 'Danse' : 'Guitare'}>
                              {item.discipline === 'danse' ? '💃' : '🎸'}
                            </span>
                            <BookOpen className="w-3.5 h-3.5 text-[#e5a93b] shrink-0" />
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-xs sm:text-sm font-semibold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors truncate">
                                {item.title}
                              </span>
                              <span className="text-[11px] text-[#7d7162] shrink-0 hidden sm:inline">
                                • {item.paloName}
                              </span>
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hero Danse */}
      <div className="bg-gradient-to-br from-[#1e1713] via-[#161310] to-[#1e1310] border border-[#3e3022] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#c53d2d]/25 text-[#ff8f82] border border-[#c53d2d]/40 flex items-center gap-1.5">
            <span>💃</span>
            <span>Nouveau module Baile</span>
          </span>
          <span className="text-xs text-[#a69c8f]">
            Danse Flamenca
          </span>
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wider text-[#e5a93b]">
          Comprendre, travailler, et monter sa danse flamenca
        </h2>

        {/* Arborescence réelle reprenant fidèlement le design avec instructions déroulables sous chaque rubrique */}
        <DanseArborescenceTree title="Présentation générale" onOpenLexique={onOpenLexique} defaultExpanded={false} />
      </div>

      {/* Palo Farruca Featured Card */}
      <div className="space-y-3">
        {/* ========================================================================= */}
        {/* 2. RECHERCHE DÉDIÉE AU CATALOGUE DES PALOS DE DANSE (À CÔTÉ DU TITRE)     */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>Palos de Danse</span>
              <span className="text-xs text-[#8c8173] font-normal lowercase hidden sm:inline">(commençons avec la Farruca)</span>
            </h3>

            {/* Symbole loupe à côté de Palos de Danse */}
            <button
              type="button"
              id="btn-search-danse-palos"
              onClick={handleToggleCatalogSearch}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isCatalogSearchOpen || catalogSearchTerm
                  ? 'bg-white text-[#121110] shadow-sm'
                  : 'text-white hover:text-white/80 hover:bg-white/10 bg-[#201a14] border border-[#3e3022]'
              }`}
              title={isCatalogSearchOpen ? "Fermer la recherche" : "Rechercher un palo de danse"}
              aria-label="Rechercher un palo de danse"
            >
              <Search className="w-4 h-4 text-white" />
              <span className="text-[11px] font-medium hidden xs:inline">Rechercher</span>
            </button>
          </div>

          {catalogSearchTerm && (
            <span className="text-xs text-[#a69c8f]">
              {filteredCatalogPalos.length} résultat{filteredCatalogPalos.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Champ de recherche déroulant affiché au clic sur la loupe de Palos de Danse */}
        {isCatalogSearchOpen && (
          <div className="relative animate-in fade-in slide-in-from-top-1 duration-150">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8173]" />
            <input
              ref={catalogSearchInputRef}
              type="text"
              id="danse-search-input"
              value={catalogSearchTerm}
              onChange={e => setCatalogSearchTerm(e.target.value)}
              placeholder="Rechercher un palo de la liste (ex: Farruca, Alegrías, Soleá, Bulerías, compás...)"
              className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#171410] border border-[#e5a93b]/60 text-[#f4efe6] placeholder-[#73685a] text-sm focus:outline-none focus:border-[#e5a93b] focus:ring-1 focus:ring-[#e5a93b] transition-all shadow-inner"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {catalogSearchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setCatalogSearchTerm('');
                    catalogSearchInputRef.current?.focus();
                  }}
                  className="px-2 py-1 text-xs text-[#8c8173] hover:text-[#f4efe6] rounded bg-[#241c15] hover:bg-[#2e241c] transition-colors cursor-pointer"
                  title="Effacer le texte"
                >
                  Effacer
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsCatalogSearchOpen(false);
                  setCatalogSearchTerm('');
                }}
                className="p-1 text-[#8c8173] hover:text-[#e5a93b] rounded transition-colors cursor-pointer"
                title="Fermer la recherche"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {filteredCatalogPalos.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#171410] border border-[#2b2219] text-center space-y-3">
            <p className="text-sm text-[#a69c8f]">
              Aucun palo de danse ne correspond à « <span className="text-[#e5a93b] font-medium">{catalogSearchTerm}</span> »
            </p>
            <button
              type="button"
              onClick={() => setCatalogSearchTerm('')}
              className="text-xs text-[#e5a93b] underline font-medium"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCatalogPalos.map(item => {
              const paloData = BAILE_PALOS_DATA[item.id];
              const isFarruca = item.id === 'Farruca';

              return (
                <div
                  key={item.id}
                  id={`baile-palo-card-${item.id}`}
                  className={`bg-[#171410] border rounded-2xl p-4 sm:p-5 transition-all shadow-xl relative overflow-hidden ${
                    item.isAvailable
                      ? 'border-[#3e3022] hover:border-[#e5a93b]/70 hover:shadow-[#e5a93b]/5'
                      : 'border-[#26201a] opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e5a93b]/15 text-[#e5a93b] border border-[#e5a93b]/30">
                        {item.tag}
                      </span>
                      {item.isAvailable ? (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Module complet disponible</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#7d7162] bg-[#1a1612] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#2b2219]">
                          <Lock className="w-3 h-3" />
                          <span>Bientôt disponible</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-bold font-serif text-[#f4efe6]">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#a69c8f] flex items-center gap-1.5 mt-0.5">
                          <Activity className="w-3.5 h-3.5 text-[#e5a93b]" />
                          <span>{item.compasSummary}</span>
                        </p>
                      </div>

                      {item.isAvailable ? (
                        <button
                          type="button"
                          onClick={() => onSelectPalo(item.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] text-xs font-bold transition-all shadow-md cursor-pointer hover:translate-x-0.5 shrink-0"
                        >
                          <span>Ouvrir la Farruca</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-xs text-[#6e6355] italic shrink-0">
                          Prochainement
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
