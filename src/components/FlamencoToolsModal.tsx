import React, { useState } from 'react';
import { X, BookOpen, Layers, Guitar, Info } from 'lucide-react';
import { FLAMENCO_TECHNIQUES, CEJILLA_CHART } from '../data/flamencoData';
import { ArborescenceViewer } from './ArborescenceViewer';
import { FlamencoLexiqueViewer } from './FlamencoLexiqueViewer';

interface FlamencoToolsModalProps {
  onClose: () => void;
  initialTab?: 'arborescence' | 'cejilla' | 'techniques' | 'lexique';
}

export const FlamencoToolsModal: React.FC<FlamencoToolsModalProps> = ({ onClose, initialTab = 'arborescence' }) => {
  const [activeTab, setActiveTab] = useState<'arborescence' | 'cejilla' | 'techniques' | 'lexique'>(initialTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181512] border border-[#383129] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1e1a16] border-b border-[#2e2720] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#e5a93b]/20 text-[#e5a93b] border border-[#e5a93b]/30">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif">
                Arborescence des Palos & Outils Flamenco
              </h2>
              <p className="text-xs text-[#a69c8f]">
                Arbre des styles, capodastre, techniques de jeu et lexique des termes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#2a241e] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2e2720] bg-[#141210] px-3 sm:px-4 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('arborescence')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'arborescence'
                ? 'border-[#e5a93b] text-[#e5a93b] font-bold'
                : 'border-transparent text-[#8c8173] hover:text-[#d4c9ba]'
            }`}
          >
            🌳 Arborescence des Palos
          </button>
          <button
            onClick={() => setActiveTab('cejilla')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'cejilla'
                ? 'border-[#e5a93b] text-[#e5a93b]'
                : 'border-transparent text-[#8c8173] hover:text-[#d4c9ba]'
            }`}
          >
            🎯 Cejilla (Capodastre)
          </button>
          <button
            onClick={() => setActiveTab('techniques')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'techniques'
                ? 'border-[#e5a93b] text-[#e5a93b]'
                : 'border-transparent text-[#8c8173] hover:text-[#d4c9ba]'
            }`}
          >
            🖐️ Techniques de main droite
          </button>
          <button
            onClick={() => setActiveTab('lexique')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'lexique'
                ? 'border-[#e5a93b] text-[#e5a93b] font-bold'
                : 'border-transparent text-[#8c8173] hover:text-[#d4c9ba]'
            }`}
          >
            📖 Lexique Flamenco
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'arborescence' && (
            <ArborescenceViewer />
          )}

          {activeTab === 'cejilla' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#221c17] border border-[#3d3326] text-xs text-[#d4c9ba] leading-relaxed">
                <strong className="text-[#e5a93b]">Règle d'or du flamenco :</strong> On conserve toujours les doigtés ouverts traditionnels (<em className="text-[#f4efe6]">por arriba</em> ou <em className="text-[#f4efe6]">por medio</em>) et on déplace la <strong className="text-[#e5a93b]">cejilla</strong> pour caler la guitare sur la hauteur vocale du cantaor.
              </div>

              {/* Transposition Table */}
              <div className="overflow-x-auto rounded-xl border border-[#2f2923]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#1f1b17] text-[#a69c8f] border-b border-[#2f2923]">
                      <th className="py-2.5 px-3 font-semibold">Case (Traste)</th>
                      <th className="py-2.5 px-3 font-semibold text-[#e5a93b]">Toque Por Arriba</th>
                      <th className="py-2.5 px-3 font-semibold text-[#f5c363]">Toque Por Medio</th>
                      <th className="py-2.5 px-3 font-semibold">Usage cante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26211b]">
                    {CEJILLA_CHART.map(row => (
                      <tr key={row.fret} className="hover:bg-[#1f1a16] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#f4efe6]">
                          {row.fret === 0 ? 'Al aire (0)' : `Case ${row.fret}`}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#f4efe6]">
                          {row.porArriba}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#f4efe6]">
                          {row.porMedio}
                        </td>
                        <td className="py-2.5 px-3 text-[#a69c8f]">
                          {row.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'techniques' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FLAMENCO_TECHNIQUES.map(tech => (
                <div
                  key={tech.name}
                  className="bg-[#1c1814] border border-[#332c25] rounded-xl p-4 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tech.icon}</span>
                    <h3 className="text-sm font-bold text-[#f4efe6] font-serif">
                      {tech.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#a69c8f] leading-relaxed">
                    {tech.definition}
                  </p>
                  <div className="pt-1 text-[11px] text-[#e5a93b] font-medium">
                    💡 Conseil : {tech.tips}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'lexique' && (
            <FlamencoLexiqueViewer />
          )}
        </div>

        {/* Bottom Close Button */}
        <div className="p-3 bg-[#1e1a16] border-t border-[#2e2720] shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#28211b] hover:bg-[#342b22] text-[#e5a93b] hover:text-[#f4efe6] border border-[#3e3325] text-xs sm:text-sm font-bold transition-all text-center cursor-pointer shadow-sm"
          >
            ← Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
