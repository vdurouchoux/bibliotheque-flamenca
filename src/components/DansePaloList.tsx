import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { BAILE_PALOS_CATALOG, DansePaloPreview } from '../data/baileData';

interface DansePaloListProps {
  onSelectPalo: (paloKey: string) => void;
  onOpenInstall?: () => void;
}

export const DansePaloList: React.FC<DansePaloListProps> = ({
  onSelectPalo,
  onOpenInstall
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Danse */}
      <div className="bg-gradient-to-br from-[#1e1713] via-[#161310] to-[#1e1310] border border-[#3e3022] rounded-2xl p-4 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#c53d2d]/25 text-[#ff8f82] border border-[#c53d2d]/40 flex items-center gap-1.5">
            <span>💃</span>
            <span>Nouveau module Baile</span>
          </span>
          <span className="text-xs text-[#a69c8f]">
            Danse Flamenca
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#f4efe6] font-serif">
          Comprendre et Monter sa Danse Flamenca
        </h2>

        <div className="space-y-2 pt-1 max-w-2xl">
          <div className="flex items-start gap-2 text-xs sm:text-sm text-[#ded3c5] leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-[#e5a93b] shrink-0 mt-1.5 shadow-sm shadow-[#e5a93b]/50"></span>
            <span><strong className="text-[#f4efe6]">Comprenez l'architecture scénique :</strong> décryptez chaque bloc, du silence initial à l'explosion finale.</span>
          </div>
          <div className="flex items-start gap-2 text-xs sm:text-sm text-[#ded3c5] leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-[#c53d2d] shrink-0 mt-1.5 shadow-sm shadow-[#c53d2d]/50"></span>
            <span><strong className="text-[#f4efe6]">Maîtrisez les codes scéniques :</strong> synchronisez vos signaux et vos appels (llamadas) avec le guitariste.</span>
          </div>
          <div className="flex items-start gap-2 text-xs sm:text-sm text-[#ded3c5] leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-[#70b1ff] shrink-0 mt-1.5 shadow-sm shadow-[#70b1ff]/50"></span>
            <span><strong className="text-[#f4efe6]">Sculptez votre geste :</strong> alliez la précision des marquages de bras à la clarté du zapateado.</span>
          </div>
        </div>
      </div>

      {/* Palo Farruca Featured Card */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#e5a93b] flex items-center gap-2">
          <span>Palos de Danse</span>
          <span className="text-xs text-[#8c8173] font-normal lowercase">(commençons avec la Farruca)</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {BAILE_PALOS_CATALOG.map((item: DansePaloPreview) => {
            if (item.isAvailable) {
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectPalo(item.id)}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#201a14] via-[#1a1612] to-[#241914] border-2 border-[#e5a93b]/50 hover:border-[#e5a93b] transition-all cursor-pointer group shadow-xl relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e5a93b] text-[#121110]">
                          Disponible immédiatement
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2e241a] text-[#e5a93b] border border-[#483724]">
                          {item.compasSummary}
                        </span>
                      </div>

                      <h4 className="text-2xl font-black text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors font-serif">
                        {item.name}
                      </h4>

                      <p className="text-base sm:text-lg font-bold text-[#e5a93b] tracking-wide">
                        Studio de montage
                      </p>

                      <div className="space-y-1.5 pt-1.5 max-w-xl">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#ded3c5]">
                          <span className="w-2 h-2 rounded-full bg-[#e5a93b] shrink-0"></span>
                          <span><strong className="text-[#f4efe6]">Chorégraphie sur mesure :</strong> assemblez vos blocs dans l'ordre de votre choix.</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#ded3c5]">
                          <span className="w-2 h-2 rounded-full bg-[#70b1ff] shrink-0"></span>
                          <span><strong className="text-[#f4efe6]">Repères vidéo pas à pas :</strong> reliez vos vidéos de référence à chaque passage clé.</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#ded3c5]">
                          <span className="w-2 h-2 rounded-full bg-[#52c41a] shrink-0"></span>
                          <span><strong className="text-[#f4efe6]">Mémoire complète :</strong> conservez conseils, comptes et signaux sans rien oublier.</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-center justify-end gap-2">
                      <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#e5a93b] group-hover:bg-[#f5b84c] text-[#121110] font-bold text-sm transition-all shadow-md">
                        <span>Ouvrir la Farruca</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
      </div>
    </div>
  );
};
