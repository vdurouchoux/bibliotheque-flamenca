import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { PALOS_DATA } from '../data/flamencoData';

interface TangosVariantsProps {
  onSelectVariant: (variantKey: string) => void;
  onBack: () => void;
}

export const TangosVariants: React.FC<TangosVariantsProps> = ({ onSelectVariant, onBack }) => {
  const tangos = PALOS_DATA['Tangos'];
  const variants = tangos?.variants || {};

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Introduction banner */}
      <div className="bg-[#1c1814] border border-[#383129] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={onBack}
            className="text-xs text-[#e5a93b] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tous les Palos</span>
          </button>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#f4efe6] font-serif">
          Tangos Flamencos – Variantes Régionales
        </h2>
        <p className="text-xs sm:text-sm text-[#a69c8f] mt-1.5 leading-relaxed">
          Le compás binaire des Tangos s'exprime avec des saveurs et accentuations bien distinctes selon les quartiers andalous et les grandes dynasties gitanes.
        </p>
      </div>

      {/* Variants List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {Object.entries(variants).map(([variantName, variantData]) => (
          <div
            key={variantName}
            onClick={() => onSelectVariant(variantName)}
            className="group bg-[#171412] hover:bg-[#1f1b17] border border-[#2f2821] hover:border-[#e5a93b]/70 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#29221b] text-[#e5a93b] border border-[#42372a]">
                  {variantData.tag}
                </span>
                <span className="text-[11px] text-[#706659]">
                  4 temps • {variantData.compas.defaultBpm} BPM
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#f4efe6] group-hover:text-[#e5a93b] transition-colors font-serif">
                  {variantName}
                </h3>
                <p className="text-xs text-[#a69c8f] mt-0.5">
                  {variantData.subtitle}
                </p>
              </div>

              <p className="text-xs text-[#7d7265] italic">
                « {variantData.character} »
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#26211b] flex items-center justify-between text-xs text-[#8c8173]">
              <span>Falsetas, cante & baile</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#e5a93b] group-hover:translate-x-0.5 transition-transform">
                <span>Étudier ce style</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Back Navigation */}
      <div className="pt-6 pb-2 border-t border-[#2a231b] flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1d1814] hover:bg-[#28211b] border border-[#3e3427] text-[#e5a93b] hover:text-[#f4efe6] font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Retour à la liste des palos</span>
        </button>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs text-[#8c8173] hover:text-[#e5a93b] transition-colors py-1.5 px-2 cursor-pointer"
        >
          Haut de page ↑
        </button>
      </div>
    </div>
  );
};
