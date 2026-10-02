import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  Lock,
  Activity,
  Search,
  X,
  BookOpen,
  Film
} from 'lucide-react';
import { BAILE_PALOS_CATALOG, BAILE_PALOS_DATA } from '../data/baileData';
import { GUITARE_PALOS_CATALOG, GUITARE_PALOS_DATA } from '../data/guitareData';
import { DanseArborescenceTree } from './DanseArborescenceTree';
import { VideoItem, DanseSectionTab, DisciplineMode } from '../types';
import baileBgImg from '../assets/images/danseuse_guitariste_parquet_1790850568980.jpg';
import guitareBgImg from '../assets/images/guitare_flamenco_bois_1790931284235.jpg';

interface DansePaloListProps {
  onSelectPalo: (paloKey: string) => void;
  onBack?: () => void;
  onOpenInstall?: () => void;
  onOpenLibrary?: () => void;
  onOpenArborescence?: () => void;
  onOpenLexique?: () => void;
  onPlayVideo?: (video: VideoItem, paloName: string, paloKey: string, sectionName: string) => void;
  onNavigateDanseTab?: (paloKey: string, tab: DanseSectionTab) => void;
  onOpenBibliotheque?: (paloKey: string) => void;
  onOpenAtelier?: (paloKey: string) => void;
  discipline?: DisciplineMode;
}

export const DansePaloList: React.FC<DansePaloListProps> = ({
  onSelectPalo,
  onOpenInstall,
  onOpenLibrary,
  onOpenArborescence,
  onOpenLexique,
  onPlayVideo,
  onNavigateDanseTab,
  onOpenBibliotheque,
  onOpenAtelier,
  discipline = 'danse'
}) => {
  // Image d'arrière-plan du bloc avec fallback automatique (guitare flamenca avec mains sur cordes pour guitare, danseuse pour danse)
  const defaultBgImg = discipline === 'guitare' ? guitareBgImg : baileBgImg;
  const [bgImageSrc, setBgImageSrc] = useState<string>(defaultBgImg);

  // Synchronisation si la discipline change
  useEffect(() => {
    setBgImageSrc(discipline === 'guitare' ? guitareBgImg : baileBgImg);
  }, [discipline]);

  const currentCatalog = discipline === 'guitare' ? GUITARE_PALOS_CATALOG : BAILE_PALOS_CATALOG;

  // Recherche Dédiée au Catalogue des Palos (à côté du titre Liste des palos)
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

  // Filtrage du catalogue des palos
  const filteredCatalogPalos = useMemo(() => {
    if (!catalogSearchTerm.trim()) {
      return currentCatalog;
    }
    const cleanSearch = catalogSearchTerm
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    return currentCatalog.filter(item => {
      const matchName = item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchSubtitle = item.subtitle.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchTag = item.tag.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchCompas = item.compasSummary.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchHighlights = item.highlights.some(h =>
        h.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch)
      );
      return matchName || matchSubtitle || matchTag || matchCompas || matchHighlights;
    });
  }, [catalogSearchTerm, currentCatalog]);

  return (
    <div className="space-y-6">
      {/* Hero Danse / Guitare */}
      <div className="relative overflow-hidden bg-[#161310] border border-[#3e3022] rounded-2xl p-4 sm:p-6 shadow-xl min-h-[175px]">
        {/* Image de fond avec équilibre parfait entre présence visuelle et lisibilité */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src={bgImageSrc}
            alt={discipline === 'guitare' ? "Guitare Flamenca" : "Danseuse Flamenco - Baile"}
            referrerPolicy="no-referrer"
            onError={() => {
              if (discipline === 'guitare') {
                if (bgImageSrc !== '/guitare_flamenco_bois.jpg') {
                  setBgImageSrc('/guitare_flamenco_bois.jpg');
                }
              } else {
                if (bgImageSrc !== '/danseuse_guitariste_parquet.jpg') {
                  setBgImageSrc('/danseuse_guitariste_parquet.jpg');
                }
              }
            }}
            style={{ objectPosition: 'center 50%' }}
            className="w-full h-full object-cover opacity-72 sm:opacity-76 transition-opacity duration-300 filter brightness-112 contrast-108"
          />
          {/* Voile protecteur modéré pour un contraste idéal */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/28 to-black/15" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[8.5px] sm:text-[9.5px] font-bold tracking-wider text-white/90 uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pt-0.5 leading-tight">
              Présentation<br />générale
            </span>

            <h2 className="text-right text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] leading-tight shrink-0 max-w-[120px] sm:max-w-[140px] pt-0.5">
              {discipline === 'guitare' ? (
                <>
                  Étudier la<br />guitare flamenca
                </>
              ) : (
                <>
                  Monter sa<br />danse flamenca
                </>
              )}
            </h2>
          </div>

          {/* Arborescence réelle reprenant fidèlement le design avec cadre translucide */}
          <DanseArborescenceTree 
            onOpenLexique={onOpenLexique} 
            defaultExpanded={false}
            translucent={true}
            maitresVideos={discipline === 'guitare' ? GUITARE_PALOS_DATA['Farruca']?.maitres : BAILE_PALOS_DATA['Farruca']?.maitres}
            coursVideos={discipline === 'guitare' ? GUITARE_PALOS_DATA['Farruca']?.cours : undefined}
            onPlayVideo={onPlayVideo ? (video, section) => onPlayVideo(video, 'Farruca', 'Farruca', section) : undefined}
          />
        </div>
      </div>

      {/* Palo Farruca Featured Card */}
      <div className="space-y-3">
        {/* RECHERCHE DÉDIÉE AU CATALOGUE DES PALOS (À CÔTÉ DU TITRE) */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>{discipline === 'guitare' ? 'Liste des palos (guitare)' : 'Liste des palos (baile)'}</span>
              <span className="text-xs text-[#8c8173] font-normal lowercase hidden sm:inline">(commençons avec la Farruca)</span>
            </h3>

            {/* Symbole loupe à côté de Palos */}
            <button
              type="button"
              id="btn-search-danse-palos"
              onClick={handleToggleCatalogSearch}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isCatalogSearchOpen || catalogSearchTerm
                  ? 'bg-white text-[#121110] shadow-sm'
                  : 'text-white hover:text-white/80 hover:bg-white/10 bg-[#201a14] border border-[#3e3022]'
              }`}
              title={isCatalogSearchOpen ? "Fermer la recherche" : "Filtrer la liste des palos"}
              aria-label="Filtrer la liste des palos"
            >
              <Search className="w-4 h-4 text-white" />
              <span className="text-[11px] font-medium hidden xs:inline">Filtrer</span>
            </button>
          </div>

          {catalogSearchTerm && (
            <span className="text-xs text-[#a69c8f]">
              {filteredCatalogPalos.length} résultat{filteredCatalogPalos.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Champ de recherche déroulant affiché au clic sur la loupe */}
        {isCatalogSearchOpen && (
          <div className="relative animate-in fade-in slide-in-from-top-1 duration-150">
            <input
              ref={catalogSearchInputRef}
              type="text"
              id="danse-search-input"
              value={catalogSearchTerm}
              onChange={e => setCatalogSearchTerm(e.target.value)}
              placeholder={discipline === 'guitare' ? "Rechercher un palo de guitare (ex: Farruca, Alegrías, Soleá, Bulerías, compás...)" : "Rechercher un palo de la liste (ex: Farruca, Alegrías, Soleá, Bulerías, compás...)"}
              className="w-full pl-3.5 pr-24 py-2.5 rounded-xl bg-[#171410] border border-[#e5a93b]/60 text-[#f4efe6] placeholder-[#73685a] text-sm focus:outline-none focus:border-[#e5a93b] focus:ring-1 focus:ring-[#e5a93b] transition-all shadow-inner"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
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
              {/* Loupe à droite */}
              <Search className="w-4 h-4 text-[#e5a93b] pointer-events-none drop-shadow-sm shrink-0" />
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
              Aucun palo ne correspond à « <span className="text-[#e5a93b] font-medium">{catalogSearchTerm}</span> »
            </p>
            <button
              type="button"
              onClick={() => setCatalogSearchTerm('')}
              className="text-xs text-[#e5a93b] underline font-medium cursor-pointer"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCatalogPalos.map(item => {
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
                    <div className="flex items-center justify-end gap-2">
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

                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <h4 className="text-xl sm:text-2xl font-bold font-serif text-[#f4efe6]">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#e5a93b] font-medium flex items-center gap-1.5 mt-1">
                          <Activity className="w-3.5 h-3.5 text-[#e5a93b] shrink-0" />
                          <span>{item.tag}</span>
                        </p>
                      </div>

                      {item.isAvailable ? (
                        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                          {/* Bouton Médiathèque élargi pour afficher le mot entier */}
                          <button
                            type="button"
                            onClick={() => onOpenBibliotheque ? onOpenBibliotheque(item.id) : onSelectPalo(item.id)}
                            className="w-[84px] sm:w-[96px] h-[70px] sm:h-[76px] px-1.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 hover:text-emerald-100 border border-emerald-500/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 group shrink-0"
                            title="Ouvrir la médiathèque"
                            aria-label="Ouvrir la médiathèque"
                          >
                            <BookOpen className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                            <span className="text-[10.5px] sm:text-[11.5px] font-bold leading-tight whitespace-nowrap">
                              Médiathèque
                            </span>
                          </button>

                          {/* Bouton Atelier */}
                          <button
                            type="button"
                            onClick={() => onOpenAtelier ? onOpenAtelier(item.id) : onSelectPalo(item.id)}
                            className="w-[84px] sm:w-[96px] h-[70px] sm:h-[76px] px-1.5 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/90 text-blue-300 hover:text-blue-100 border border-blue-500/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 group shrink-0"
                            title="Ouvrir l'atelier"
                            aria-label="Ouvrir l'atelier"
                          >
                            <Film className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                            <span className="text-[10.5px] sm:text-[11.5px] font-bold leading-tight whitespace-nowrap">
                              Atelier
                            </span>
                          </button>
                        </div>
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
