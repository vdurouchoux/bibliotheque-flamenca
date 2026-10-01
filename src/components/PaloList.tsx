import React, { useState, useRef, useMemo } from 'react';
import {
  Activity,
  Search,
  X,
  BookOpen,
  Film
} from 'lucide-react';
import { PALOS_DATA } from '../data/flamencoData';
import { GuitareArborescenceTree } from './GuitareArborescenceTree';
import { VideoItem } from '../types';

interface PaloListProps {
  onSelectPalo: (paloKey: string) => void;
  onOpenTangosVariants?: () => void;
  onOpenInstall?: () => void;
  onOpenArborescence?: () => void;
  onOpenLexique?: () => void;
  onPlayVideo?: (video: VideoItem, paloName: string, paloKey: string, sectionName: string) => void;
  onOpenBibliotheque?: (paloKey: string) => void;
  onOpenAtelier?: (paloKey: string) => void;
}

export const PaloList: React.FC<PaloListProps> = ({
  onSelectPalo,
  onOpenLexique,
  onOpenBibliotheque,
  onOpenAtelier
}) => {
  const [bgImageSrc, setBgImageSrc] = useState<string>('/guitariste_flamenco.jpg');

  // Recherche dédiée au catalogue des palos de guitare
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

  const palos = useMemo(() => {
    return Object.keys(PALOS_DATA).map(key => ({
      key,
      ...PALOS_DATA[key]
    })).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, []);

  // Filtrage du catalogue des palos de guitare
  const filteredPalos = useMemo(() => {
    if (!catalogSearchTerm.trim()) {
      return palos;
    }
    const cleanSearch = catalogSearchTerm
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    return palos.filter(item => {
      const matchName = item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchSubtitle = (item.subtitle || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchTag = (item.tag || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      const matchCharacter = (item.character || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(cleanSearch);
      return matchName || matchSubtitle || matchTag || matchCharacter;
    });
  }, [palos, catalogSearchTerm]);

  return (
    <div className="space-y-6">
      {/* Hero Guitare */}
      <div className="relative overflow-hidden bg-[#161310] border border-[#3e3022] rounded-2xl p-4 sm:p-6 shadow-xl min-h-[175px]">
        {/* Image de fond guitariste flamenco */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src={bgImageSrc}
            alt="Guitariste Flamenco"
            referrerPolicy="no-referrer"
            onError={() => {
              if (bgImageSrc !== '/guitare_flamenca_penchee.jpg') {
                setBgImageSrc('/guitare_flamenca_penchee.jpg');
              }
            }}
            style={{ objectPosition: 'center 45%' }}
            className="w-full h-full object-cover opacity-72 sm:opacity-76 transition-opacity duration-300 filter brightness-110 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-black/20" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[8.5px] sm:text-[9.5px] font-bold tracking-wider text-white/90 uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pt-0.5 leading-tight">
              Présentation<br />générale
            </span>

            <h2 className="text-right text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] leading-tight shrink-0 max-w-[120px] sm:max-w-[140px] pt-0.5">
              Étudier la<br />guitare flamenca
            </h2>
          </div>

          {/* Arborescence réelle reprenant fidèlement le design avec cadre translucide */}
          <GuitareArborescenceTree 
            onOpenLexique={onOpenLexique} 
            defaultExpanded={false}
            translucent={true}
          />
        </div>
      </div>

      {/* Liste des Palos de Guitare */}
      <div className="space-y-3">
        {/* RECHERCHE DÉDIÉE AU CATALOGUE DES PALOS DE GUITARE */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>Liste des palos (guitare)</span>
            </h3>

            {/* Symbole loupe à côté de Palos de Guitare */}
            <button
              type="button"
              id="btn-search-guitare-palos"
              onClick={handleToggleCatalogSearch}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isCatalogSearchOpen || catalogSearchTerm
                  ? 'bg-white text-[#121110] shadow-sm'
                  : 'text-white hover:text-white/80 hover:bg-white/10 bg-[#201a14] border border-[#3e3022]'
              }`}
              title={isCatalogSearchOpen ? "Fermer la recherche" : "Filtrer la liste des palos"}
              aria-label="Filtrer la liste des palos de guitare"
            >
              <Search className="w-4 h-4 text-white" />
              <span className="text-[11px] font-medium hidden xs:inline">Filtrer</span>
            </button>
          </div>

          {catalogSearchTerm && (
            <span className="text-xs text-[#a69c8f]">
              {filteredPalos.length} résultat{filteredPalos.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Champ de recherche déroulant */}
        {isCatalogSearchOpen && (
          <div className="relative animate-in fade-in slide-in-from-top-1 duration-150">
            <input
              ref={catalogSearchInputRef}
              type="text"
              id="guitare-search-input"
              value={catalogSearchTerm}
              onChange={e => setCatalogSearchTerm(e.target.value)}
              placeholder="Rechercher un palo de guitare (ex: Soleá, Bulerías, Alegrías, Tangos...)"
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

        {filteredPalos.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#171410] border border-[#2b2219] text-center space-y-3">
            <p className="text-sm text-[#a69c8f]">
              Aucun palo de guitare ne correspond à « <span className="text-[#e5a93b] font-medium">{catalogSearchTerm}</span> »
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
            {filteredPalos.map(item => {
              return (
                <div
                  key={item.key}
                  id={`guitare-palo-card-${item.id}`}
                  className="bg-[#171410] border rounded-2xl p-4 sm:p-5 transition-all shadow-xl relative overflow-hidden border-[#3e3022] hover:border-[#e5a93b]/70 hover:shadow-[#e5a93b]/5"
                >
                  <div className="space-y-3">
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

                      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                        {/* Bouton Médiathèque */}
                        <button
                          type="button"
                          onClick={() => onOpenBibliotheque ? onOpenBibliotheque(item.key) : onSelectPalo(item.key)}
                          className="w-[84px] sm:w-[96px] h-[70px] sm:h-[76px] px-1.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 hover:text-emerald-100 border border-emerald-500/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 group shrink-0"
                          title={`Ouvrir la Médiathèque de la ${item.name}`}
                          aria-label={`Ouvrir la Médiathèque de la ${item.name}`}
                        >
                          <BookOpen className="w-5 h-5 text-[#86efac] group-hover:scale-110 transition-transform shrink-0" />
                          <span className="text-[10.5px] sm:text-[11.5px] font-bold leading-tight whitespace-nowrap">
                            Médiathèque
                          </span>
                        </button>

                        {/* Bouton Atelier */}
                        <button
                          type="button"
                          onClick={() => onOpenAtelier ? onOpenAtelier(item.key) : onSelectPalo(item.key)}
                          className="w-[84px] sm:w-[96px] h-[70px] sm:h-[76px] px-1.5 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/90 text-blue-300 hover:text-blue-100 border border-blue-500/40 flex flex-col items-center justify-center gap-1.5 text-center transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 group shrink-0"
                          title={`Ouvrir l'Atelier de la ${item.name}`}
                          aria-label={`Ouvrir l'Atelier de la ${item.name}`}
                        >
                          <Film className="w-5 h-5 text-[#60a5fa] group-hover:scale-110 transition-transform shrink-0" />
                          <span className="text-[10.5px] sm:text-[11.5px] font-bold leading-tight whitespace-nowrap">
                            Atelier
                          </span>
                        </button>
                      </div>
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
