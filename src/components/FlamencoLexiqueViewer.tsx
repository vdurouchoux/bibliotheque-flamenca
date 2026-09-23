import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Sparkles, Filter, ChevronRight, Info, ExternalLink } from 'lucide-react';
import { FLAMENCO_LEXIQUE, LEXIQUE_CATEGORIES, LexiqueCategory, LexiqueTerm } from '../data/flamencoLexiqueData';
import { FlamencoGuitarIcon } from './FlamencoGuitarIcon';
import { FlamencoGuitaristeIcon } from './FlamencoGuitaristeIcon';
import { FlamencoBailaoraIcon } from './FlamencoBailaoraIcon';
import { FlamencoCantaorIcon } from './FlamencoCantaorIcon';

interface FlamencoLexiqueViewerProps {
  onSelectTerm?: (term: LexiqueTerm) => void;
}

export const FlamencoLexiqueViewer: React.FC<FlamencoLexiqueViewerProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LexiqueCategory>('all');
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FLAMENCO_LEXIQUE.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;

      const inTerm = item.term.toLowerCase().includes(q);
      const inSpanish = item.spanish.toLowerCase().includes(q);
      const inShortDef = item.shortDef.toLowerCase().includes(q);
      const inDetailedDef = item.detailedDef.toLowerCase().includes(q);
      const inAppContext = item.appContext ? item.appContext.toLowerCase().includes(q) : false;
      const inRelated = item.relatedTerms ? item.relatedTerms.some(r => r.toLowerCase().includes(q)) : false;

      return inTerm || inSpanish || inShortDef || inDetailedDef || inAppContext || inRelated;
    });
  }, [searchQuery, selectedCategory]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: FLAMENCO_LEXIQUE.length };
    FLAMENCO_LEXIQUE.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedTermId(prev => (prev === id ? null : id));
  };

  const handleRelatedClick = (relatedName: string) => {
    setSearchQuery(relatedName);
    setSelectedCategory('all');
  };

  return (
    <div className="space-y-4 font-sans text-[#f4efe6]">
      {/* Intro Header Card */}
      <div className="rounded-2xl bg-gradient-to-r from-[#241c15] via-[#1c1713] to-[#171310] border border-[#3e3224] p-4 sm:p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e5a93b]/15 text-[#e5a93b] text-xs font-semibold border border-[#e5a93b]/30">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Vocabulaire & Notions Clés</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif">
              Lexique des termes techniques du Flamenco
            </h3>
            <p className="text-xs text-[#b5a99a] leading-relaxed max-w-2xl">
              Retrouvez ici la signification exacte des termes espagnols et techniques employés dans l’application : structures de danse, techniques de guitare, cycles de compás et traditions du tablao.
            </p>
          </div>
          <span className="hidden sm:flex px-3 py-1 rounded-xl bg-[#2b2219] border border-[#443627] text-xs font-mono font-bold text-[#e5a93b] shrink-0">
            {FLAMENCO_LEXIQUE.length} termes expliqués
          </span>
        </div>
      </div>

      {/* Search Bar & Quick Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8c8173] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un terme (ex: Llamada, Falseta, Compás, Cejilla, Desplante)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#1a1612] border border-[#382f25] focus:border-[#e5a93b] focus:outline-none text-xs sm:text-sm text-[#f4efe6] placeholder-[#7a7063] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8c8173] hover:text-[#f4efe6] cursor-pointer"
              title="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {LEXIQUE_CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#e5a93b] text-[#121110] border-[#e5a93b] shadow-sm font-bold'
                    : 'bg-[#1e1914] text-[#a69c8f] border-[#362b20] hover:text-[#f4efe6] hover:bg-[#28221b]'
                }`}
                title={cat.description}
              >
                {cat.id === 'guitare' ? (
                  <FlamencoGuitaristeIcon className="w-3.5 h-3.5 inline-block shrink-0 -mt-0.5" />
                ) : cat.id === 'danse' ? (
                  <FlamencoBailaoraIcon className="w-3.5 h-3.5 inline-block shrink-0 -mt-0.5" />
                ) : cat.id === 'cante' ? (
                  <FlamencoCantaorIcon className="w-3.5 h-3.5 inline-block shrink-0 -mt-0.5" />
                ) : (
                  <span>{cat.icon}</span>
                )}
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-[#121110]/20 text-[#121110]' : 'bg-[#2b2219] text-[#8c8173]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-[#8c8173] px-1">
        <span>
          Affichage de <strong className="text-[#e5a93b]">{filteredTerms.length}</strong> {filteredTerms.length > 1 ? 'termes' : 'terme'}
          {searchQuery && (
            <span> pour « <em className="text-[#f4efe6]">{searchQuery}</em> »</span>
          )}
        </span>
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="text-[#e5a93b] hover:underline cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Terms List Grid */}
      {filteredTerms.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#191512] border border-[#2e261e] space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#2a2219] flex items-center justify-center text-xl">
            🔍
          </div>
          <h4 className="text-sm font-bold text-[#f4efe6]">Aucun terme trouvé</h4>
          <p className="text-xs text-[#a69c8f] max-w-sm mx-auto">
            Aucun résultat pour « {searchQuery} ». Essayez avec un mot-clé plus court ou réinitialisez la recherche.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e5a93b] text-[#121110] text-xs font-bold transition-all cursor-pointer"
          >
            Voir tous les termes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTerms.map(term => {
            const isExpanded = expandedTermId === term.id;
            return (
              <div
                key={term.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isExpanded
                    ? 'bg-[#201a15] border-[#e5a93b]/70 shadow-xl'
                    : 'bg-[#1a1612] border-[#312921] hover:border-[#4d3e2f]'
                }`}
              >
                <div className="p-4 space-y-2.5">
                  {/* Top Bar with Term, Spanish, Icon & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-[#282119] border border-[#3b3024] flex items-center justify-center text-base shrink-0">
                        {term.icon === '🎸' ? (
                          <FlamencoGuitaristeIcon className="w-5 h-5 drop-shadow-sm" />
                        ) : term.icon === '💃' ? (
                          <FlamencoBailaoraIcon className="w-5 h-5 drop-shadow-sm" />
                        ) : term.icon === '🎤' ? (
                          <FlamencoCantaorIcon className="w-5 h-5 drop-shadow-sm" />
                        ) : (
                          term.icon
                        )}
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#f4efe6] font-serif leading-snug">
                          {term.term}
                        </h4>
                        {term.spanish && term.spanish !== term.term && (
                          <div className="text-[11px] text-[#a69c8f] italic">
                            Espagnol : « {term.spanish} »
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border border-[#3d3123]"
                      style={{
                        backgroundColor: `${term.badgeColor}15`,
                        color: term.badgeColor,
                        borderColor: `${term.badgeColor}30`
                      }}
                    >
                      {term.categoryLabel}
                    </span>
                  </div>

                  {/* Short Definition */}
                  <p className="text-xs text-[#ded3c5] leading-relaxed">
                    {term.shortDef}
                  </p>

                  {/* Detailed explanation when expanded */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-[#2e261e] space-y-2.5 animate-in fade-in duration-150">
                      <div className="text-xs text-[#a69c8f] leading-relaxed">
                        <strong className="text-[#f4efe6] block mb-0.5">Détail & Rôle :</strong>
                        {term.detailedDef}
                      </div>

                      {/* Application Context Highlight */}
                      {term.appContext && (
                        <div className="p-2.5 rounded-xl bg-[#261f18] border border-[#e5a93b]/30 text-xs flex items-start gap-2">
                          <span className="text-[#e5a93b] shrink-0 mt-0.5">💡</span>
                          <div className="text-[#e5a93b]/90 leading-tight">
                            <span className="font-bold text-[#e5a93b]">Dans cette application : </span>
                            <span className="text-[#f4efe6]">{term.appContext}</span>
                          </div>
                        </div>
                      )}

                      {/* Related terms */}
                      {term.relatedTerms && term.relatedTerms.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[11px] text-[#8c8173]">Voir aussi :</span>
                          {term.relatedTerms.map(rel => (
                            <button
                              key={rel}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRelatedClick(rel);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded-lg bg-[#2e251b] hover:bg-[#3d3123] text-[#e5a93b] font-medium transition-colors cursor-pointer border border-[#443627]"
                            >
                              {rel}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Toggle Button */}
                <div className="px-4 py-2 bg-[#16120e] border-t border-[#29221b] flex items-center justify-between">
                  <button
                    onClick={() => toggleExpand(term.id)}
                    className="text-[11px] font-semibold text-[#e5a93b] hover:text-[#f5b84c] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{isExpanded ? 'Moins de détails' : 'En savoir plus & Contexte app'}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  <span className="text-[10px] text-[#73685c] font-mono">
                    ID: {term.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
