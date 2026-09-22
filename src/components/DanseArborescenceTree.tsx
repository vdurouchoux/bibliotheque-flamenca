import React, { useState, useRef } from 'react';
import { Folder, FolderOpen, ChevronDown, ChevronUp, ChevronsUpDown, ArrowRight, Lightbulb, UploadCloud, CheckCircle2, Sparkles, Compass } from 'lucide-react';

export interface DanseArborescenceTreeProps {
  onNavigate?: (key: 'structure' | 'maitres' | 'letras' | 'compas' | 'cours' | 'montages') => void;
  onOpenLexique?: () => void;
  defaultExpanded?: boolean;
  title?: React.ReactNode;
  counts?: {
    maitres?: number;
    cours?: number;
    letras?: number;
    montages?: number;
    structure?: number;
    compas?: string;
  };
  bottomContent?: React.ReactNode;
}

export const DanseArborescenceTree: React.FC<DanseArborescenceTreeProps> = ({
  onNavigate,
  onOpenLexique,
  defaultExpanded = false,
  title,
  counts,
  bottomContent
}) => {
  // État d'ouverture des dossiers (par défaut tous repliés, sauf si explicitement demandé)
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({
    biblio: defaultExpanded,
    maitres: false,
    cours: false,
    letras: false,
    compas: false,
    studio: defaultExpanded,
    structure: false,
    carnet: false
  });

  const studioScrollOriginRef = useRef<number | null>(null);
  const studioHeaderRef = useRef<HTMLDivElement>(null);

  const [openTips, setOpenTips] = useState<boolean>(false);
  const tipsScrollOriginRef = useRef<number | null>(null);
  const tipsContainerRef = useRef<HTMLDivElement>(null);

  const toggleTips = () => {
    setOpenTips(prev => {
      const nextIsOpen = !prev;
      if (nextIsOpen) {
        tipsScrollOriginRef.current = window.scrollY;
      }
      return nextIsOpen;
    });
  };

  const handleCollapseTips = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetScrollY = tipsScrollOriginRef.current;

    setOpenTips(false);

    const scrollToOrigin = () => {
      if (targetScrollY !== null) {
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      } else if (tipsContainerRef.current) {
        tipsContainerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    };

    requestAnimationFrame(scrollToOrigin);
    setTimeout(scrollToOrigin, 40);
  };

  // Quand defaultExpanded change (ou à la navigation), synchroniser pour que tout soit bien replié
  React.useEffect(() => {
    setOpenFolders({
      biblio: defaultExpanded,
      maitres: false,
      cours: false,
      letras: false,
      compas: false,
      studio: defaultExpanded,
      structure: false,
      carnet: false
    });
  }, [defaultExpanded]);

  const toggleFolder = (key: string) => {
    setOpenFolders(prev => {
      const nextIsOpen = !prev[key];
      if (key === 'studio' && nextIsOpen) {
        studioScrollOriginRef.current = window.scrollY;
      }
      return {
        ...prev,
        [key]: nextIsOpen
      };
    });
  };

  const handleCollapseStudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetScrollY = studioScrollOriginRef.current;

    setOpenFolders(prev => ({
      ...prev,
      studio: false
    }));

    const scrollToOrigin = () => {
      if (targetScrollY !== null) {
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      } else if (studioHeaderRef.current) {
        studioHeaderRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    requestAnimationFrame(() => {
      scrollToOrigin();
    });
    setTimeout(() => {
      scrollToOrigin();
    }, 40);
  };

  return (
    <div className="rounded-2xl bg-[#0f0d0b] border-2 border-[#382d22] p-4 sm:p-6 shadow-2xl relative space-y-4">
      {/* Contrôle supérieur : Titre d'invitation au travail */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#2b2118]/80 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-[#e5a93b] shrink-0" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#e5a93b] font-sans truncate">
            {title ?? "Commencer à travailler · Explorer & Créer"}
          </span>
        </div>
      </div>

      {/* ARBRE DES DOSSIERS AVEC BRANCHES VISUELLES */}
      <div className="relative pl-1 sm:pl-2 space-y-4 font-sans text-xs sm:text-sm">
        
        {/* ========================================================================= */}
        {/* DOSSIER 1 (AU-DESSUS) : BIBLIOTHÈQUE FLAMENCA (AVEC SES SOUS-DOSSIERS ENFANTS) */}
        {/* ========================================================================= */}
        <div className="relative">
          <div className="rounded-xl bg-[#131c15] border-2 border-[#86efac]/70 overflow-hidden shadow-lg transition-all">
            <div
              onClick={() => toggleFolder('biblio')}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-3 text-left cursor-pointer hover:bg-[#1a261c] transition-colors select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[#86efac] transition-transform duration-200">
                  {openFolders['biblio'] ? (
                    <FolderOpen className="w-5 h-5 text-[#bbf7d0] fill-[#86efac]/30" />
                  ) : (
                    <Folder className="w-5 h-5 text-[#86efac] fill-[#86efac]/20" />
                  )}
                </span>
                <span className="font-serif text-sm sm:text-base font-bold text-[#86efac]">
                  Bibliothèque Flamenca
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#86efac]/20 text-[#bbf7d0] font-medium border border-[#86efac]/30 hidden xs:inline">
                  Ressources & Références
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#8c8173] hidden sm:inline">
                  {openFolders['biblio'] ? 'Fermer le dossier' : 'Ouvrir'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#86efac] transition-transform duration-200 ${
                    openFolders['biblio'] ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Instructions du dossier Bibliothèque Flamenca */}
            {openFolders['biblio'] && (
              <div className="px-4 py-2.5 text-xs text-[#ded3c5] leading-relaxed border-t border-[#233526] bg-[#0f1711] animate-in fade-in duration-150">
                <p>
                  C'est la base de votre travail. Commencez sans attendre à alimenter votre bibliothèque, palo par palo, en y classant vos sources de référence : Grands Maîtres, cours et stages, letras poétiques et compás.
                </p>
              </div>
            )}
          </div>

          {/* SOUS-DOSSIERS DE LA BIBLIOTHÈQUE FLAMENCA (Ligne de branche vert émeraude) */}
          {openFolders['biblio'] && (
            <div className="ml-4 sm:ml-7 pl-4 sm:pl-6 border-l-2 border-[#86efac]/40 space-y-3 pt-3">
              
              {/* --- SOUS-DOSSIER : LES GRANDS MAÎTRES --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#86efac]/40" />

                <div className="rounded-xl bg-[#141914] border border-[#2b392d] hover:border-[#86efac]/70 overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('maitres');
                      } else {
                        toggleFolder('maitres');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1a231b] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-[#86efac] shrink-0">
                        {openFolders['maitres'] ? (
                          <FolderOpen className="w-4 h-4 text-[#bbf7d0] fill-[#86efac]/30" />
                        ) : (
                          <Folder className="w-4 h-4 text-[#86efac] fill-[#86efac]/20" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#bbf7d0] group-hover:text-[#fff] transition-colors">
                            Les Grands Maîtres
                          </span>
                          {counts?.maitres !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#86efac]/15 text-[#86efac] border border-[#86efac]/30 font-medium">
                              {counts.maitres} vidéo{counts.maitres > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8c8173] block truncate">
                          Vidéos, archives & références historiques
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('maitres');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#86efac]/15 hover:bg-[#86efac] text-[#86efac] hover:text-[#0f1711] border border-[#86efac]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder aux Grands Maîtres"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('maitres');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#86efac] hover:bg-[#86efac]/10 transition-colors cursor-pointer"
                        title={openFolders['maitres'] ? "Masquer les détails" : "Voir les détails"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['maitres'] ? 'rotate-180 text-[#86efac]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['maitres'] && (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-[#ded3c5] leading-relaxed border-t border-[#233325] bg-[#0e140f] space-y-2 animate-in fade-in duration-150">
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#ded3c5]">
                        <li>Observez le style, la posture et les nuances d'interprétation des figures de référence (Carmen Amaya, Antonio Gades, Vicente Escudero, Matilde Coral...).</li>
                        <li>Étudiez les appels (llamadas) et sorties de scène historiques pour nourrir votre propre gestuelle.</li>
                        <li>Intégrez vos vidéos d'archives et captations favorites palo par palo.</li>
                      </ul>
                      {onNavigate && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('maitres')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#86efac] hover:bg-[#a7f3d0] text-[#0f1711] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir l'espace Les Grands Maîtres</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- SOUS-DOSSIER : MES COURS & STAGES --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#86efac]/40" />

                <div className="rounded-xl bg-[#141914] border border-[#2b392d] hover:border-[#86efac]/70 overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('cours');
                      } else {
                        toggleFolder('cours');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1a231b] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-[#86efac] shrink-0">
                        {openFolders['cours'] ? (
                          <FolderOpen className="w-4 h-4 text-[#bbf7d0] fill-[#86efac]/30" />
                        ) : (
                          <Folder className="w-4 h-4 text-[#86efac] fill-[#86efac]/20" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#bbf7d0] group-hover:text-[#fff] transition-colors">
                            Mes Cours & Stages
                          </span>
                          {counts?.cours !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#86efac]/15 text-[#86efac] border border-[#86efac]/30 font-medium">
                              {counts.cours} vidéo{counts.cours > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8c8173] block truncate">
                          Prises de vue atelier & chorégraphies apprises
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('cours');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#86efac]/15 hover:bg-[#86efac] text-[#86efac] hover:text-[#0f1711] border border-[#86efac]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder à Mes Cours & Stages"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('cours');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#86efac] hover:bg-[#86efac]/10 transition-colors cursor-pointer"
                        title={openFolders['cours'] ? "Masquer les détails" : "Voir les détails"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['cours'] ? 'rotate-180 text-[#86efac]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['cours'] && (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-[#ded3c5] leading-relaxed border-t border-[#233325] bg-[#0e140f] space-y-2 animate-in fade-in duration-150">
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#ded3c5]">
                        <li>Centralisez les vidéos prises à la fin de vos cours et stages hebdomadaires ou intensifs.</li>
                        <li>Archivez les consignes de vos professeurs et les variations de bras, buste et zapateado.</li>
                        <li>Découpez vos séquences vidéo pour les rattacher directement aux blocs de votre carnet de montage.</li>
                      </ul>
                      {onNavigate && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('cours')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#86efac] hover:bg-[#a7f3d0] text-[#0f1711] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir l'espace Mes Cours & Stages</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- SOUS-DOSSIER : LETRAS & TEXTES --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#86efac]/40" />

                <div className="rounded-xl bg-[#141914] border border-[#2b392d] hover:border-[#86efac]/70 overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('letras');
                      } else {
                        toggleFolder('letras');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1a231b] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-[#86efac] shrink-0">
                        {openFolders['letras'] ? (
                          <FolderOpen className="w-4 h-4 text-[#bbf7d0] fill-[#86efac]/30" />
                        ) : (
                          <Folder className="w-4 h-4 text-[#86efac] fill-[#86efac]/20" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#bbf7d0] group-hover:text-[#fff] transition-colors">
                            Letras & Textes poétiques
                          </span>
                          {counts?.letras !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#86efac]/15 text-[#86efac] border border-[#86efac]/30 font-medium">
                              {counts.letras} chants
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8c8173] block truncate">
                          Paroles, sens & traductions
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('letras');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#86efac]/15 hover:bg-[#86efac] text-[#86efac] hover:text-[#0f1711] border border-[#86efac]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder aux Letras & Textes"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('letras');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#86efac] hover:bg-[#86efac]/10 transition-colors cursor-pointer"
                        title={openFolders['letras'] ? "Masquer les détails" : "Voir les détails"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['letras'] ? 'rotate-180 text-[#86efac]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['letras'] && (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-[#ded3c5] leading-relaxed border-t border-[#233325] bg-[#0e140f] space-y-2 animate-in fade-in duration-150">
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#ded3c5]">
                        <li>Comprenez le sens littéral et émotionnel du cante pour ajuster votre interprétation et votre corporalité.</li>
                        <li>Repérez la structure poétique (couplets de 3 ou 4 vers) et les respirations du chanteur pour placer vos marcajes.</li>
                      </ul>
                      {onNavigate && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('letras')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#86efac] hover:bg-[#a7f3d0] text-[#0f1711] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir l'espace Letras & Textes</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- SOUS-DOSSIER : COMPÁS & PALMAS --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#86efac]/40" />

                <div className="rounded-xl bg-[#141914] border border-[#2b392d] hover:border-[#86efac]/70 overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('compas');
                      } else {
                        toggleFolder('compas');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1a231b] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-[#86efac] shrink-0">
                        {openFolders['compas'] ? (
                          <FolderOpen className="w-4 h-4 text-[#bbf7d0] fill-[#86efac]/30" />
                        ) : (
                          <Folder className="w-4 h-4 text-[#86efac] fill-[#86efac]/20" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#bbf7d0] group-hover:text-[#fff] transition-colors">
                            Compás & Palmas
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#86efac]/15 text-[#86efac] border border-[#86efac]/30 font-medium">
                            {counts?.compas || '4 temps'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8c8173] block truncate">
                          Cadence, accents rythmiques & vitesse
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('compas');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#86efac]/15 hover:bg-[#86efac] text-[#86efac] hover:text-[#0f1711] border border-[#86efac]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder au Compás & Palmas"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('compas');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#86efac] hover:bg-[#86efac]/10 transition-colors cursor-pointer"
                        title={openFolders['compas'] ? "Masquer les détails" : "Voir les détails"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['compas'] ? 'rotate-180 text-[#86efac]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['compas'] && (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-[#ded3c5] leading-relaxed border-t border-[#233325] bg-[#0e140f] space-y-2 animate-in fade-in duration-150">
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#ded3c5]">
                        <li>Intégrez le patron rythmique propre au palo (ex: 4 temps pour la Farruca, 12 temps pour la Solea ou l'Alegría).</li>
                        <li>Travaillez la précision des palmas (sordas pour accompagner le cante, abiertas pour les accélérations et remates).</li>
                      </ul>
                      {onNavigate && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('compas')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#86efac] hover:bg-[#a7f3d0] text-[#0f1711] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir l'espace Compás & Palmas</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DOSSIER 2 (DESSOUS) : ATELIER DE CRÉATION (AVEC SES SOUS-DOSSIERS ENFANTS) */}
        {/* ========================================================================= */}
        <div className="relative pt-2">
          <div 
            ref={studioHeaderRef}
            className="rounded-xl bg-[#0f172a]/60 border-2 border-[#60a5fa]/70 overflow-hidden shadow-lg transition-all"
          >
            <div
              onClick={() => toggleFolder('studio')}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-3 text-left cursor-pointer hover:bg-[#1e293b]/60 transition-colors select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Icône dossier stylisée en bleu */}
                <span className="text-[#60a5fa] transition-transform duration-200">
                  {openFolders['studio'] ? (
                    <FolderOpen className="w-5 h-5 text-[#93c5fd] fill-[#60a5fa]/30" />
                  ) : (
                    <Folder className="w-5 h-5 text-[#60a5fa] fill-[#60a5fa]/20" />
                  )}
                </span>
                <span className="font-serif text-sm sm:text-base font-bold text-[#60a5fa]">
                  Atelier de création
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#60a5fa]/20 text-[#93c5fd] font-medium border border-[#60a5fa]/30 hidden xs:inline">
                  Danse & Chorégraphie
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#8c8173] hidden sm:inline">
                  {openFolders['studio'] ? 'Fermer le dossier' : 'Ouvrir'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#60a5fa] transition-transform duration-200 ${
                    openFolders['studio'] ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Instructions du dossier Atelier de création */}
            {openFolders['studio'] && (
              <div className="px-4 py-2.5 text-xs text-[#ded3c5] leading-relaxed border-t border-[#1e293b] bg-[#0c1322] animate-in fade-in duration-150">
                <p>
                  L'Atelier de création est votre outil de travail principal. C'est ici que vous structurez votre danse, et que vous reliez les différentes parties à vos médias, grâce à des repères temporels.
                </p>
              </div>
            )}
          </div>

          {/* SOUS-DOSSIERS DE L'ATELIER DE CRÉATION (Ligne de branche bleue) */}
          {openFolders['studio'] && (
            <div className="ml-4 sm:ml-7 pl-4 sm:pl-6 border-l-2 border-[#60a5fa]/40 space-y-3 pt-3">
              
              {/* --- SOUS-DOSSIER : STRUCTURE TRADITIONNELLE --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#60a5fa]/40" />

                <div className="rounded-xl bg-[#171310] border border-[#382b20] hover:border-[#60a5fa]/70 overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('structure');
                      } else {
                        toggleFolder('structure');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1c1713] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-[#60a5fa] shrink-0">
                        {openFolders['structure'] ? (
                          <FolderOpen className="w-4 h-4 text-[#93c5fd] fill-[#60a5fa]/30" />
                        ) : (
                          <Folder className="w-4 h-4 text-[#60a5fa] fill-[#60a5fa]/20" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <span className="font-serif text-xs sm:text-sm font-bold text-[#60a5fa] group-hover:text-[#93c5fd] transition-colors">
                          Structure traditionnelle
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('structure');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#60a5fa]/15 hover:bg-[#60a5fa] text-[#93c5fd] hover:text-[#0b1120] border border-[#60a5fa]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder à la Structure traditionnelle"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('structure');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors cursor-pointer"
                        title={openFolders['structure'] ? "Masquer les détails" : "Voir les détails"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['structure'] ? 'rotate-180 text-[#60a5fa]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['structure'] && (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-[#ded3c5] leading-relaxed border-t border-[#2b2118] bg-[#120f0d] space-y-2.5 animate-in fade-in duration-150">
                      <p className="text-[#f4efe6] leading-relaxed bg-[#1a1511] p-3 rounded-lg border border-[#33261a]">
                        Vous trouverez ici la structure traditionnelle de la danse sur laquelle vous voulez travailler. Cette structure est modifiable. Elle constituera la base de vos montages. Vous pourrez la modifier à nouveau dans chacun de vos montages.
                      </p>
                      {onNavigate && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('structure')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#60a5fa] hover:bg-[#93c5fd] text-[#0b1120] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir la Structure traditionnelle</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- SOUS-DOSSIER : CARNET DE MONTAGE --- */}
              <div className="relative group">
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#60a5fa]/40" />

                <div className="rounded-xl bg-[#171310] border border-[#382b20] hover:border-[#60a5fa]/70 overflow-hidden transition-all shadow-md">
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('montages');
                      } else {
                        toggleFolder('carnet');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#1c1713] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-[#60a5fa] shrink-0">
                        {openFolders['carnet'] ? (
                          <FolderOpen className="w-4 h-4 text-[#93c5fd] fill-[#60a5fa]/30" />
                        ) : (
                          <Folder className="w-4 h-4 text-[#60a5fa] fill-[#60a5fa]/20" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#60a5fa] group-hover:text-[#93c5fd] transition-colors">
                            Carnet de montage
                          </span>
                          {counts?.montages !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#60a5fa]/15 text-[#93c5fd] border border-[#60a5fa]/30 font-medium">
                              {counts.montages} montage{counts.montages > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('montages');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#60a5fa]/15 hover:bg-[#60a5fa] text-[#93c5fd] hover:text-[#0b1120] border border-[#60a5fa]/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Accéder au Carnet de montage"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder('carnet');
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors cursor-pointer"
                        title={openFolders['carnet'] ? "Masquer les détails" : "Voir les détails"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openFolders['carnet'] ? 'rotate-180 text-[#60a5fa]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openFolders['carnet'] && (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-[#ded3c5] leading-relaxed border-t border-[#2b2118] bg-[#120f0d] space-y-1.5 animate-in fade-in duration-150">
                      <p>
                        C'est ici que tout se joue : construisez votre chorégraphie sur mesure, en associant chaque segment à vos médias favoris :
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#ded3c5]">
                        <li>Définissez l'ordre exact de vos blocs (ex: Salida ➔ Falseta 1 ➔ Letra ➔ Escobilla).</li>
                        <li>Placez des repères à la seconde près et lier vos blocs à vos médias.</li>
                        <li>Associez des annotations personnelles.</li>
                        <li>Créez, dupliquez, effacez, et partagez vos montages avec d'autres utilisateurs.</li>
                      </ul>
                      {onNavigate && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onNavigate('montages')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#60a5fa] hover:bg-[#93c5fd] text-[#0b1120] font-bold text-xs transition-colors cursor-pointer shadow"
                          >
                            <span>Ouvrir l'espace Carnet de montage</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* --- SECTION SOUS LE CARNET DE MONTAGE : CONSEILS & ASTUCES --- */}
              <div className="relative group" ref={tipsContainerRef}>
                <div className="absolute -left-4 sm:-left-6 top-5 w-4 sm:w-6 h-0.5 bg-[#60a5fa]/40" />

                <div className="rounded-xl bg-[#10192b]/95 border border-[#233857] hover:border-[#60a5fa]/70 overflow-hidden transition-all shadow-md">
                  <div
                    onClick={toggleTips}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#16233b] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="p-1 rounded-md bg-[#60a5fa]/20 text-[#93c5fd] shrink-0">
                        <Lightbulb className="w-4 h-4 text-[#93c5fd]" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#93c5fd] group-hover:text-white transition-colors">
                            Conseils & astuces : méthode de travail et gestion des vidéos
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8c8173] block truncate">
                          Stockage vidéo en ligne & découpage chorégraphique par blocs
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTips();
                        }}
                        className="p-1 rounded text-[#a69c8f] hover:text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors cursor-pointer"
                        title={openTips ? "Masquer les conseils" : "Voir les conseils"}
                        aria-label={openTips ? "Masquer les conseils" : "Voir les conseils"}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-[#a69c8f] transition-transform duration-200 ${
                            openTips ? 'rotate-180 text-[#60a5fa]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {openTips && (
                    <div className="px-4 pb-3.5 pt-3 text-xs text-[#ded3c5] leading-relaxed border-t border-[#1e2d47] bg-[#0c1322] space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Colonne 1 : Mettre ses vidéos en ligne plutôt que sur le téléphone */}
                        <div className="p-3 rounded-lg bg-[#0a1120] border border-[#1d2d47] space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-[#60a5fa]">
                            <UploadCloud className="w-4 h-4 text-[#60a5fa] shrink-0" />
                            <span>Mettre ses vidéos en ligne plutôt que sur le téléphone</span>
                          </div>
                          <p className="text-[#cbd5e1] leading-relaxed">
                            Pour travailler efficacement et sereinement, <strong>privilégiez le stockage en ligne</strong> plutôt que de conserver de lourds fichiers vidéo dans la mémoire de votre téléphone :
                          </p>
                          <ul className="space-y-1.5 text-[#94a3b8] leading-relaxed">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                              <span><strong>Ne saturez pas votre téléphone :</strong> Les enregistrements vidéo HD/4K de cours ou répétitions pèsent plusieurs gigaoctets et encombrent vite le stockage local.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                              <span><strong>Hébergement simple & privé :</strong> Déposez vos vidéos sur <strong>YouTube en mode « Non répertorié »</strong> (seules les personnes disposant du lien peuvent la visionner) ou sur Google Drive / Vimeo.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                              <span><strong>Accès partout & pérennité :</strong> Vos chorégraphies et repères temporels sont accessibles sur n'importe quel écran (smartphone en salle, tablette, ordinateur) sans risque de perte en cas de changement ou panne de mobile.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#60a5fa] shrink-0 mt-0.5" />
                              <span><strong>Partage immédiat :</strong> Vous pouvez transmettre en un clic vos montages et vos timecodes à votre professeur, guitariste ou partenaire de baile.</span>
                            </li>
                          </ul>
                        </div>

                        {/* Colonne 2 : La façon de travailler dans l'Atelier de création */}
                        <div className="p-3 rounded-lg bg-[#0a1120] border border-[#1d2d47] space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-[#60a5fa]">
                            <Sparkles className="w-4 h-4 text-[#60a5fa] shrink-0" />
                            <span>La façon de travailler sa chorégraphie</span>
                          </div>
                          <p className="text-[#cbd5e1] leading-relaxed">
                            L'Atelier de création a été conçu pour reproduire la rigueur de travail des danseurs professionnels :
                          </p>
                          <ul className="space-y-1.5 text-[#94a3b8] leading-relaxed">
                            <li className="flex items-start gap-2">
                              <span className="text-[#60a5fa] font-bold shrink-0">1.</span>
                              <span><strong>Découpez par blocs cohérents :</strong> Ne travaillez pas toute la danse d'un trait. Isolez chaque partie clé (Salida, Letra, Falseta, Escobilla, Subida, Remate).</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#60a5fa] font-bold shrink-0">2.</span>
                              <span><strong>Fixez des repères temporels (Timecodes) :</strong> Notez la seconde précise du début et de fin de chaque séquence pour pouvoir la revoir, l'écouter et la répéter en boucle.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#60a5fa] font-bold shrink-0">3.</span>
                              <span><strong>Consignez vos notes et codes musicaux :</strong> Ajoutez vos annotations techniques (posture du torse, direction du regard, zapateado) et les signaux indispensables donnés au guitariste et au chant.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#60a5fa] font-bold shrink-0">4.</span>
                              <span><strong>Ajustez votre conducteur scénique :</strong> Dans le carnet de montage, réordonnez vos blocs, testez différentes structures et peaufinez vos transitions.</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Bouton flèche ⌃ pour replier et remonter au niveau de départ */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleCollapseTips}
                          className="p-1.5 sm:p-2 rounded-lg bg-[#10192b] hover:bg-[#1e293b] text-[#60a5fa] hover:text-[#93c5fd] border border-[#233857] hover:border-[#60a5fa]/50 transition-all cursor-pointer shadow-sm group flex items-center justify-center"
                          title="Replier"
                          aria-label="Replier"
                        >
                          <ChevronUp className="w-4 h-4 text-[#60a5fa] group-hover:text-[#93c5fd] transition-transform group-hover:-translate-y-0.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Zone noire du bas : Rubriques optionnelles (Caractère, Costume & Posture, Compás & Dynamique) */}
        {bottomContent && (
          <div className="pt-4 mt-6 border-t border-[#2b2118]/80">
            {bottomContent}
          </div>
        )}
      </div>
    </div>
  );
};
