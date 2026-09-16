import React, { useState } from 'react';
import { X, BookOpen, Layers, Guitar, Info } from 'lucide-react';
import { FLAMENCO_TECHNIQUES, CEJILLA_CHART } from '../data/flamencoData';

interface FlamencoToolsModalProps {
  onClose: () => void;
}

export const FlamencoToolsModal: React.FC<FlamencoToolsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'cejilla' | 'techniques' | 'lexique'>('cejilla');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181512] border border-[#383129] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1e1a16] border-b border-[#2e2720] shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e5a93b]/20 text-[#e5a93b]">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#f4efe6] font-serif">
                Outils & Lexique du Guitariste Flamenco
              </h2>
              <p className="text-xs text-[#a69c8f]">
                Transposition au capodastre, techniques fondamentales et vocabulaire
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
        <div className="flex border-b border-[#2e2720] bg-[#141210] px-4 shrink-0">
          <button
            onClick={() => setActiveTab('cejilla')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'cejilla'
                ? 'border-[#e5a93b] text-[#e5a93b]'
                : 'border-transparent text-[#8c8173] hover:text-[#d4c9ba]'
            }`}
          >
            🎯 Cejilla (Capodastre)
          </button>
          <button
            onClick={() => setActiveTab('techniques')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'techniques'
                ? 'border-[#e5a93b] text-[#e5a93b]'
                : 'border-transparent text-[#8c8173] hover:text-[#d4c9ba]'
            }`}
          >
            🖐️ Techniques de main droite
          </button>
          <button
            onClick={() => setActiveTab('lexique')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'lexique'
                ? 'border-[#e5a93b] text-[#e5a93b]'
                : 'border-transparent text-[#8c8173] hover:text-[#d4c9ba]'
            }`}
          >
            📖 Lexique du Tablao
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4">
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
            <div className="space-y-2.5 text-xs">
              {[
                { term: "Compás", def: "Le cycle rythmique de base, la pulsation sacrée du flamenco (généralement 12 temps ou 4 temps)." },
                { term: "Falseta", def: "Mélodie instrumentale improvisée ou composée jouée par le guitariste entre les couplets du cante." },
                { term: "Letra / Copla", def: "Strophe poétique chantée par le cantaor, généralement en 3 ou 4 vers." },
                { term: "Tercio", def: "Chacune des lignes mélodiques ou versets composant une letra de cante." },
                { term: "Llamada", def: "Appel rythmique percutant exécuté par la guitare ou le danseur pour annoncer une entrée de cante ou un changement de section." },
                { term: "Remate", def: "Clôture rythmique franche d'une phrase musicale ou d'un tercio (souvent au temps 10 dans le 12-temps)." },
                { term: "Cierre", def: "Fermeture nette d'un bloc ou de tout le morceau, marquant le silence absolu." },
                { term: "Escobilla", def: "Partie centrale du baile où le danseur développe ses jeux de talons (zapateado) soutenus par la guitare." },
                { term: "Subida", def: "Montée progressive en vitesse et en intensité sonore emmenée par le danseur pour emmener le groupe vers l'apogée." },
                { term: "Desplante", def: "Arrêt sculptural et théâtral du danseur pour toiser la salle et affirmer sa présence dans l'immobilité." },
                { term: "Planta & Tacón", def: "Technique fondamentale de frappe : frappe de l'avant du pied (planta) suivie ou précédée du talon (tacón)." },
                { term: "Braceo & Giros", def: "Ports de bras géométriques ou arrondis et tours sculptés dans l'espace avec point fixe du regard." },
                { term: "Silencio", def: "Passage lent et mélancolique en mineur, caractéristique des Alegrías de Cádiz ou pause lyrique de Farruca." },
                { term: "Marcaje", def: "Pas feutrés et mouvements de corps du danseur pour marquer le compás pendant les couplets." }
              ].map(item => (
                <div
                  key={item.term}
                  className="p-3 rounded-xl bg-[#1c1814] border border-[#2e2720] flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3"
                >
                  <strong className="text-sm font-bold text-[#e5a93b] sm:min-w-[110px] font-serif">
                    {item.term}
                  </strong>
                  <span className="text-[#c7bdb0] leading-relaxed">
                    {item.def}
                  </span>
                </div>
              ))}
            </div>
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
