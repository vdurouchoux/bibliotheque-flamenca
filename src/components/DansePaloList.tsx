import React, { useState, useRef, useMemo } from 'react';
import { ArrowRight, Lock, ChevronDown, Flame, ShieldAlert, Activity, Layers, Search, X } from 'lucide-react';
import { BAILE_PALOS_CATALOG, BAILE_PALOS_DATA, DansePaloPreview } from '../data/baileData';
import { DanseArborescenceTree } from './DanseArborescenceTree';

interface DansePaloListProps {
  onSelectPalo: (paloKey: string) => void;
  onOpenInstall?: () => void;
  onOpenLibrary?: () => void;
  onOpenArborescence?: () => void;
  onOpenLexique?: () => void;
}

export const DansePaloList: React.FC<DansePaloListProps> = ({
  onSelectPalo,
  onOpenInstall,
  onOpenLibrary,
  onOpenArborescence,
  onOpenLexique
}) => {
  const [openInfoSections, setOpenInfoSections] = useState<{
    character?: boolean;
    costume?: boolean;
    compas?: boolean;
  }>({});

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleInfoSection = (section: 'character' | 'costume' | 'compas') => {
    setOpenInfoSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleToggleSearch = () => {
    setIsSearchOpen(prev => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 60);
      } else {
        setSearchTerm('');
      }
      return nextState;
    });
  };

  const filteredPalos = useMemo(() => {
    if (!searchTerm.trim()) {
      return BAILE_PALOS_CATALOG;
    }
    const cleanSearch = searchTerm
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
  }, [searchTerm]);

  return (
    <div className="space-y-6">
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
              onClick={handleToggleSearch}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isSearchOpen || searchTerm
                  ? 'bg-white text-[#121110] shadow-sm'
                  : 'text-white hover:text-white/80 hover:bg-white/10 bg-[#201a14] border border-[#3e3022]'
              }`}
              title={isSearchOpen ? "Fermer la recherche" : "Rechercher un palo de danse"}
              aria-label="Rechercher un palo de danse"
            >
              <Search className="w-4 h-4 text-white" />
              <span className="text-[11px] font-medium hidden xs:inline">Rechercher</span>
            </button>
          </div>

          {searchTerm && (
            <span className="text-xs text-[#a69c8f]">
              {filteredPalos.length} résultat{filteredPalos.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Champ de recherche déroulant affiché au clic sur la loupe */}
        {isSearchOpen && (
          <div className="relative animate-in fade-in slide-in-from-top-1 duration-150">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8173]" />
            <input
              ref={searchInputRef}
              type="text"
              id="danse-search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher un palo de la liste (ex: Farruca, Alegrías, Soleá, Bulerías, compás...)"
              className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#171410] border border-[#e5a93b]/60 text-[#f4efe6] placeholder-[#73685a] text-sm focus:outline-none focus:border-[#e5a93b] focus:ring-1 focus:ring-[#e5a93b] transition-all shadow-inner"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    searchInputRef.current?.focus();
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
                  setIsSearchOpen(false);
                  setSearchTerm('');
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
              Aucun palo de danse ne correspond à « <span className="text-[#e5a93b] font-medium">{searchTerm}</span> »
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 rounded-xl bg-[#2e241a] text-[#e5a93b] hover:bg-[#3d3023] text-xs font-semibold transition-colors cursor-pointer"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPalos.map((item: DansePaloPreview) => {
              if (item.isAvailable) {
                const paloData = BAILE_PALOS_DATA[item.id] || BAILE_PALOS_DATA["Farruca"];
                return (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#201a14] via-[#1a1612] to-[#241914] border-2 border-[#e5a93b]/50 shadow-xl relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e5a93b] text-[#121110]">
                            Disponible immédiatement
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2e241a] text-[#e5a93b] border border-[#483724]">
                            {item.compasSummary}
                          </span>
                        </div>

                        <h4 className="text-2xl font-black text-[#f4efe6] font-serif">
                          {item.name}
                        </h4>

                        {/* Menus déroulants accordéon en orange pour Caractère, Costume, Compás */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {/* Section 1 : Caractère de la danse */}
                          <div className="bg-[#171410] border border-[#2b2219] rounded-xl overflow-hidden transition-colors">
                            <button
                              type="button"
                              onClick={() => toggleInfoSection('character')}
                              className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-[#201a14] transition-colors cursor-pointer group"
                              title="Cliquer pour dérouler ou fermer le caractère de la danse"
                            >
                              <span className="text-xs font-bold text-[#e5a93b] flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 shrink-0" />
                                <span>Caractère de la danse</span>
                              </span>
                              <ChevronDown 
                                className={`w-3.5 h-3.5 text-[#8c8173] group-hover:text-[#e5a93b] transition-transform duration-200 ${
                                  openInfoSections.character ? 'rotate-180 text-[#e5a93b]' : ''
                                }`} 
                              />
                            </button>
                            {openInfoSections.character && (
                              <div className="px-3 pb-3 pt-1 border-t border-[#251e16] text-xs text-[#a69c8f] leading-relaxed animate-in fade-in duration-150">
                                <p>{paloData?.character}</p>
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
                          <div className="bg-[#171410] border border-[#2b2219] rounded-xl overflow-hidden transition-colors">
                            <button
                              type="button"
                              onClick={() => toggleInfoSection('costume')}
                              className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-[#201a14] transition-colors cursor-pointer group"
                              title="Cliquer pour dérouler ou fermer costume et posture"
                            >
                              <span className="text-xs font-bold text-[#e5a93b] flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                <span>Costume & Posture</span>
                              </span>
                              <ChevronDown 
                                className={`w-3.5 h-3.5 text-[#8c8173] group-hover:text-[#e5a93b] transition-transform duration-200 ${
                                  openInfoSections.costume ? 'rotate-180 text-[#e5a93b]' : ''
                                }`} 
                              />
                            </button>
                            {openInfoSections.costume && (
                              <div className="px-3 pb-3 pt-1 border-t border-[#251e16] text-xs text-[#a69c8f] leading-relaxed animate-in fade-in duration-150">
                                <p>{paloData?.costumeAdvice}</p>
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
                          <div className="bg-[#171410] border border-[#2b2219] rounded-xl overflow-hidden transition-colors">
                            <button
                              type="button"
                              onClick={() => toggleInfoSection('compas')}
                              className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-[#201a14] transition-colors cursor-pointer group"
                              title="Cliquer pour dérouler ou fermer compás et dynamique"
                            >
                              <span className="text-xs font-bold text-[#e5a93b] flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 shrink-0" />
                                <span>Compás & Dynamique</span>
                              </span>
                              <ChevronDown 
                                className={`w-3.5 h-3.5 text-[#8c8173] group-hover:text-[#e5a93b] transition-transform duration-200 ${
                                  openInfoSections.compas ? 'rotate-180 text-[#e5a93b]' : ''
                                }`} 
                              />
                            </button>
                            {openInfoSections.compas && (
                              <div className="px-3 pb-3 pt-1 border-t border-[#251e16] text-xs text-[#a69c8f] leading-relaxed animate-in fade-in duration-150">
                                <p>{paloData?.compas.description}</p>
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

                      <div className="shrink-0 flex sm:flex-col items-center justify-end gap-2 pt-1 sm:pt-0">
                        <button 
                          type="button"
                          onClick={() => onSelectPalo(item.id)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] font-bold text-sm transition-all shadow-md cursor-pointer"
                        >
                          <span>Ouvrir {item.name === 'Farruca' ? 'la Farruca' : item.name}</span>
                          <ArrowRight className="w-4 h-4 hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#14120f] border border-[#26201a] opacity-60 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-[#f4efe6]">{item.name}</h5>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#221c17] text-[#8c8173] flex items-center gap-1 border border-[#30271f]">
                        <Lock className="w-3 h-3" />
                        <span>À venir</span>
                      </span>
                    </div>
                    <p className="text-[#8c8173] mt-0.5">{item.subtitle} • {item.compasSummary}</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#8c8173]">
                    {item.highlights.slice(0, 2).join(' • ')}
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
