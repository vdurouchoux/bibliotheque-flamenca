import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Flame, Layers, BookOpen, Smartphone } from 'lucide-react';
import { PALOS_DATA } from '../data/flamencoData';
import { FlamencoGuitarIcon } from './FlamencoGuitarIcon';

interface PaloListProps {
  onSelectPalo: (paloKey: string) => void;
  onOpenTangosVariants: () => void;
  onOpenInstall?: () => void;
  onOpenArborescence?: () => void;
  onOpenLexique?: () => void;
  onPlayVideo?: (video: any, paloName: string, paloKey: string, sectionName: string) => void;
}

export const PaloList: React.FC<PaloListProps> = ({
  onSelectPalo,
  onOpenTangosVariants,
  onOpenInstall,
  onOpenArborescence,
  onOpenLexique
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const palos = useMemo(() => {
    return Object.keys(PALOS_DATA).map(key => ({
      key,
      ...PALOS_DATA[key]
    })).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, []);

  // Filter palos
  const filteredPalos = useMemo(() => {
    return palos.filter(palo => {
      const matchesSearch =
        palo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        palo.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        palo.character.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (palo.origin && palo.origin.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTag =
        selectedTag === 'all' ||
        (selectedTag === '12-temps' && palo.compas.rhythmType === '12-temps') ||
        (selectedTag === '4-temps' && palo.compas.rhythmType === '4-temps') ||
        (selectedTag === '3-temps' && palo.compas.rhythmType === '3-temps') ||
        (selectedTag === 'libre' && palo.compas.rhythmType === 'libre');

      return matchesSearch && matchesTag;
    });
  }, [palos, searchTerm, selectedTag]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#221c17] via-[#1a1714] to-[#161311] border border-[#3b3228] p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e5a93b]/15 text-[#e5a93b] text-xs font-semibold border border-[#e5a93b]/30 mb-2.5">
            <Flame className="w-3.5 h-3.5" />
            <span>Répertoire & Étude de la Guitare Flamenca</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#f4efe6] tracking-tight font-serif">
            Bibliothèque Flamenca
          </h2>
          <p className="text-xs sm:text-sm text-[#b5a99a] mt-1.5 leading-relaxed">
            Choisissez un palo pour explorer ses falsetas par niveau (1, 2, 3), l'accompagnement du cante et du baile, ses cadences harmoniques et son compás interactif.
          </p>

          <div className="pt-3 flex items-center gap-2.5 flex-wrap">
            {onOpenArborescence && (
              <button
                type="button"
                onClick={onOpenArborescence}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>🌳 Arborescence des Palos</span>
              </button>
            )}
            {onOpenLexique && (
              <button
                type="button"
                onClick={onOpenLexique}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#282119] hover:bg-[#382d22] text-[#e5a93b] border border-[#e5a93b]/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>📖 Lexique Flamenco</span>
              </button>
            )}
            {onOpenInstall && (
              <button
                type="button"
                onClick={onOpenInstall}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#e5a93b]/20 hover:bg-[#e5a93b]/30 text-[#e5a93b] border border-[#e5a93b]/50 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Installer sur mon téléphone</span>
              </button>
            )}
          </div>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute -right-2 -bottom-4 opacity-15 pointer-events-none select-none">
          <FlamencoGuitarIcon className="w-36 h-36" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8173]" />
          <input
            id="palo-search-input"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un palo, une ville (Cádiz, Jerez, Triana)..."
            className="w-full bg-[#171412] border border-[#312a23] focus:border-[#e5a93b] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#f4efe6] placeholder-[#6b6256] outline-none transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8c8173] hover:text-[#f4efe6]"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {[
            { id: 'all', label: 'Tous' },
            { id: '12-temps', label: '12 temps (Bulerías, Soleá, Guajiras…)' },
            { id: '4-temps', label: '4 temps (Tangos, Rumba, Taranto…)' },
            { id: '3-temps', label: '3 temps (Sevillanas, Fandangos, Verdiales…)' },
            { id: 'libre', label: 'Toque Libre (Taranta, Minera, Granaínas…)' }
          ].map(tag => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedTag === tag.id
                  ? 'bg-[#e5a93b] text-[#121110] border-[#e5a93b]'
                  : 'bg-[#1e1a16] text-[#8c8173] border-[#312a23] hover:text-[#d4c9ba]'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Palos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredPalos.map(palo => {
          const isTangos = palo.name === 'Tangos';

          return (
            <div
              key={palo.key}
              id={`palo-card-${palo.id}`}
              onClick={() => {
                if (isTangos) {
                  onOpenTangosVariants();
                } else {
                  onSelectPalo(palo.key);
                }
              }}
              className="group relative bg-[#171412] hover:bg-[#1f1b17] border border-[#2f2821] hover:border-[#e5a93b]/70 rounded-2xl p-4 sm:p-5 transition-all duration-150 cursor-pointer shadow-lg hover:shadow-[#e5a93b]/5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    palo.compas.rhythmType === '12-temps'
                      ? 'bg-[#3b2b1b] text-[#f5b742] border-[#e5a93b]/40'
                      : palo.compas.rhythmType === '4-temps'
                      ? 'bg-[#2b3524] text-[#8ae096] border-[#8ae096]/30'
                      : 'bg-[#292238] text-[#c0a2ff] border-[#c0a2ff]/30'
                  }`}>
                    {palo.tag}
                  </span>

                  {palo.origin && (
                    <span className="text-[11px] text-[#8c8173] font-medium">
                      📍 {palo.origin}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors font-serif">
                    {palo.name}
                  </h3>
                  <p className="text-xs text-[#a69c8f] mt-0.5 line-clamp-1">
                    {palo.subtitle}
                  </p>
                </div>

                <p className="text-xs text-[#7d7265] italic line-clamp-1">
                  « {palo.character} »
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#26211b] flex items-center justify-between text-xs text-[#8c8173]">
                <span>
                  {isTangos ? '5 variantes de styles' : `${palo.harmonie.tonality.split('(')[0].trim()}`}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#e5a93b] group-hover:translate-x-0.5 transition-transform">
                  <span>{isTangos ? 'Voir les variantes' : 'Ouvrir'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPalos.length === 0 && (
        <div className="text-center py-12 bg-[#171412] rounded-2xl border border-[#2f2821] p-6">
          <p className="text-sm text-[#a69c8f]">
            Aucun palo trouvé pour « {searchTerm} ».
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedTag('all'); }}
            className="mt-3 text-xs text-[#e5a93b] underline font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Footer info note */}
      <div className="text-center text-xs text-[#6e6355] pt-4 pb-2">
        Bibliothèque Flamenca
      </div>
    </div>
  );
};
