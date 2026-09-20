import React, { useState, useRef, useEffect } from 'react';
import { 
  GripVertical, Play, ArrowLeft, ArrowRight, Clock, Plus, 
  Pencil, Trash2, Link2, Sparkles, Footprints, Music, Check, 
  RotateCcw, Film, Layers, ChevronRight, Volume2, AlertCircle, Maximize2
} from 'lucide-react';
import { MontageBlock, BlockVideoLink } from '../types';

export const getShortSpanishTitle = (rawTitle: string): string => {
  if (!rawTitle) return '';
  const clean = rawTitle.split('(')[0].trim();
  const lower = clean.toLowerCase();
  if (lower.includes('salida') && lower.includes('entrada')) return 'Salida & Entrada';
  if (lower.includes('primera letra') || lower.includes('marcajes')) return 'Primera Letra & Marcajes';
  if (lower.includes('llamada')) return 'Llamada de Transición';
  if (lower.includes('silencio')) return 'Silencio / Falseta';
  if (lower.includes('escobilla')) return 'Escobilla & Subida';
  if (lower.includes('remate') || lower.includes('cierre')) return 'Remate Final & Cierre';
  return clean;
};

// Estimation du temps moyen par bloc en secondes pour la frise
const parseApproxSeconds = (durationStr?: string): number => {
  if (!durationStr) return 60;
  const str = durationStr.toLowerCase();
  
  // Format "Xmin à Ymin" ou "Xmin Ys"
  const minMatches = str.match(/(\d+)\s*min/g);
  const secMatches = str.match(/(\d+)\s*s/g);
  
  let totalSec = 0;
  if (minMatches && minMatches.length > 0) {
    const mins = minMatches.map(m => parseInt(m, 10)).filter(n => !isNaN(n));
    const avgMin = mins.reduce((a, b) => a + b, 0) / mins.length;
    totalSec += avgMin * 60;
  }
  if (secMatches && secMatches.length > 0) {
    const secs = secMatches.map(s => parseInt(s, 10)).filter(n => !isNaN(n));
    const avgSec = secs.reduce((a, b) => a + b, 0) / secs.length;
    totalSec += avgSec;
  }
  return totalSec > 0 ? totalSec : 60;
};

const formatSecondsToMmSs = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// Tag d'énergie / rôle dramatique pour guider la timeline chorégraphique
const getChoreographyTag = (shortTitle: string) => {
  const lower = shortTitle.toLowerCase();
  if (lower.includes('salida') || lower.includes('entrada')) {
    return { label: 'Entrée & Paseo', color: 'text-amber-400 bg-amber-400/10 border-amber-500/20' };
  }
  if (lower.includes('letra') || lower.includes('marcajes')) {
    return { label: 'Chant & Corps', color: 'text-orange-400 bg-orange-400/10 border-orange-500/20' };
  }
  if (lower.includes('llamada')) {
    return { label: 'Appel & Signal', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20' };
  }
  if (lower.includes('silencio') || lower.includes('falseta')) {
    return { label: 'Lyrisme & Giros', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' };
  }
  if (lower.includes('escobilla') || lower.includes('subida')) {
    return { label: 'Climax & Pieds', color: 'text-red-400 bg-red-400/10 border-red-500/20' };
  }
  if (lower.includes('remate') || lower.includes('cierre')) {
    return { label: 'Coupure Finale', color: 'text-purple-400 bg-purple-400/10 border-purple-500/20' };
  }
  return { label: 'Chorégraphie', color: 'text-[#e5a93b] bg-[#e5a93b]/10 border-[#e5a93b]/20' };
};

interface MontageTimelineProps {
  blocks: MontageBlock[];
  activeMontageKey: string;
  activeMontageLabel: string;
  selectedBlockId?: string | null;
  onSelectBlock: (blockId: string) => void;
  onReorderBlocks: (sourceIndex: number, targetIndex: number) => void;
  onEditBlock: (block: MontageBlock, index: number) => void;
  onDeleteBlock: (blockId: string, title: string) => void;
  onCreateBlock: () => void;
  onResetOrder?: () => void;
  blockLinks?: Record<string, BlockVideoLink>;
  onPlayLinkedVideo?: (link: BlockVideoLink) => void;
  onOpenLinkPicker?: (blockId: string, spanishTitle: string) => void;
  variant?: 'strip' | 'full';
  onSwitchToFullView?: () => void;
}

export const MontageTimeline: React.FC<MontageTimelineProps> = ({
  blocks,
  activeMontageKey,
  activeMontageLabel,
  selectedBlockId,
  onSelectBlock,
  onReorderBlocks,
  onEditBlock,
  onDeleteBlock,
  onCreateBlock,
  onResetOrder,
  blockLinks = {},
  onPlayLinkedVideo,
  onOpenLinkPicker,
  variant = 'strip',
  onSwitchToFullView
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after'>('before');
  const trackRef = useRef<HTMLDivElement>(null);
  const touchSourceIndexRef = useRef<number | null>(null);

  // Calcul du timing cumulé pour chaque bloc
  const cumulativeTimings = React.useMemo(() => {
    let currentSec = 0;
    return blocks.map((b) => {
      const start = currentSec;
      const duration = parseApproxSeconds(b.durationApprox);
      currentSec += duration;
      return {
        startSeconds: start,
        endSeconds: currentSec,
        startFormatted: formatSecondsToMmSs(start),
        endFormatted: formatSecondsToMmSs(currentSec),
      };
    });
  }, [blocks]);

  const totalDurationSeconds = cumulativeTimings[cumulativeTimings.length - 1]?.endSeconds || 0;
  const totalDurationFormatted = formatSecondsToMmSs(totalDurationSeconds);

  // Scroll horizontal buttons
  const handleScroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = 320;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Déterminer si le curseur est dans la première ou deuxième moitié de la cible
    const targetRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isAfter = (e.clientX - targetRect.left) > (targetRect.width / 2);
    
    setDropPosition(isAfter ? 'after' : 'before');
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    if (dragOverIndex === index) {
      // Uniquement si on quitte l'élément
      const related = e.relatedTarget as Node | null;
      if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
        setDragOverIndex(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedIndex !== null 
      ? draggedIndex 
      : parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (!isNaN(sourceIndex) && sourceIndex >= 0 && sourceIndex < blocks.length) {
      let finalTarget = targetIndex;
      if (dropPosition === 'after' && sourceIndex < targetIndex) {
        finalTarget = targetIndex;
      } else if (dropPosition === 'after' && sourceIndex > targetIndex) {
        finalTarget = targetIndex + 1;
      } else if (dropPosition === 'before' && sourceIndex < targetIndex) {
        finalTarget = Math.max(0, targetIndex - 1);
      }
      onReorderBlocks(sourceIndex, Math.min(blocks.length - 1, Math.max(0, finalTarget)));
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch Drag Support for Mobile
  const handleTouchStart = (index: number) => {
    touchSourceIndexRef.current = index;
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchSourceIndexRef.current === null) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const card = target?.closest('[data-timeline-block-index]');
    if (card) {
      const idx = parseInt(card.getAttribute('data-timeline-block-index') || '-1', 10);
      if (idx !== -1 && idx !== dragOverIndex) {
        setDragOverIndex(idx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchSourceIndexRef.current !== null && dragOverIndex !== null && touchSourceIndexRef.current !== dragOverIndex) {
      onReorderBlocks(touchSourceIndexRef.current, dragOverIndex);
    }
    touchSourceIndexRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Move buttons
  const moveLeft = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index > 0) {
      onReorderBlocks(index, index - 1);
    }
  };

  const moveRight = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index < blocks.length - 1) {
      onReorderBlocks(index, index + 1);
    }
  };

  if (blocks.length === 0) {
    return null;
  }

  return (
    <section 
      aria-label="Frise chronologique du montage de danse"
      className="bg-[#15120f] border border-[#2e261e] rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3 relative overflow-hidden"
    >
      {/* En-tête de la Timeline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#282017]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-[#e5a93b]/15 flex items-center justify-center border border-[#e5a93b]/30 text-[#e5a93b] shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-[#f4efe6] font-serif flex items-center gap-1.5">
                <span>Timeline · Glisser-Déposer</span>
                <span className="text-xs font-sans text-[#e5a93b] font-semibold px-2 py-0.5 rounded-full bg-[#e5a93b]/10 border border-[#e5a93b]/20">
                  {blocks.length} blocs
                </span>
              </h4>
              <span className="text-[11px] text-[#8c8173] hidden sm:inline">
                Titres en espagnol & enchaînement
              </span>
            </div>
            <p className="text-[11px] text-[#a69c8f] mt-0.5">
              Glissez-déposez les cartes pour réordonner la structure de votre chorégraphie.
            </p>
          </div>
        </div>

        {/* Info durée cumulée & actions d'aide */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <div className="px-2.5 py-1 rounded-lg bg-[#1f1913] border border-[#382d20] flex items-center gap-1.5 text-xs text-[#f4efe6] font-mono">
            <Clock className="w-3.5 h-3.5 text-[#e5a93b]" />
            <span>Durée totale : ~{totalDurationFormatted}</span>
          </div>

          {onResetOrder && (
            <button
              type="button"
              onClick={onResetOrder}
              className="px-2 py-1 rounded-lg bg-[#1d1712] hover:bg-[#282019] text-[#8c8173] hover:text-[#e5a93b] border border-[#2e241b] text-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Rétablir l'ordre canonique des 6 blocs de la Farruca"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Ordre initial</span>
            </button>
          )}

          {variant === 'strip' && onSwitchToFullView && (
            <button
              type="button"
              onClick={onSwitchToFullView}
              className="px-2.5 py-1 rounded-lg bg-[#271e16] hover:bg-[#382b1f] text-[#e5a93b] border border-[#443422] text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              title="Basculer vers la vue Timeline complète"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Plein écran</span>
            </button>
          )}

          {/* Boutons de défilement horizontal */}
          <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-[#2e261e]">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-1.5 rounded-lg bg-[#1c1712] hover:bg-[#2a2219] text-[#8c8173] hover:text-[#f4efe6] border border-[#2d2319] transition-colors cursor-pointer"
              title="Défiler vers la gauche"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-1.5 rounded-lg bg-[#1c1712] hover:bg-[#2a2219] text-[#8c8173] hover:text-[#f4efe6] border border-[#2d2319] transition-colors cursor-pointer"
              title="Défiler vers la droite"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Track de la Frise Chronologique */}
      <div 
        ref={trackRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 px-1 no-scrollbar select-none scroll-smooth relative"
      >
        {blocks.map((block, index) => {
          const shortSpanishTitle = getShortSpanishTitle(block.title);
          const isSelected = selectedBlockId === block.id;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          const timing = cumulativeTimings[index];
          const tag = getChoreographyTag(shortSpanishTitle);
          const link = blockLinks[block.id];

          return (
            <div
              key={block.id}
              data-timeline-block-index={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={(e) => handleDragLeave(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onTouchStart={() => handleTouchStart(index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => onSelectBlock(block.id)}
              className={`group/card shrink-0 w-[240px] sm:w-[260px] rounded-xl border p-3 flex flex-col justify-between transition-all duration-150 cursor-pointer relative ${
                isSelected
                  ? 'bg-[#251d14] border-[#e5a93b] shadow-lg shadow-[#e5a93b]/15 ring-1 ring-[#e5a93b]/50'
                  : 'bg-[#181410] border-[#2e251c] hover:border-[#4d3d29] hover:bg-[#1f1913]'
              } ${isDragging ? 'opacity-40 scale-95 border-dashed border-[#e5a93b]' : ''} ${
                isDragOver ? (dropPosition === 'after' ? 'border-r-4 border-r-[#e5a93b]' : 'border-l-4 border-l-[#e5a93b]') : ''
              }`}
            >
              {/* Connecteur temporel visuel en haut */}
              <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-[#261f18]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span 
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-[#e5a93b] text-[#121110]'
                        : 'bg-[#221b14] text-[#a69c8f] border border-[#33281d]'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border truncate ${tag.color}`}>
                    {tag.label}
                  </span>
                </div>

                {/* Handle Glisser-Déposer visuel */}
                <div 
                  className="flex items-center gap-1 text-[#6e6355] group-hover/card:text-[#e5a93b] transition-colors cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-[#282119]"
                  title="Maintenez cliqué pour glisser-déposer"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Titre COURT EN ESPAGNOL */}
              <div className="my-2.5 space-y-1">
                <h5 
                  className={`text-sm sm:text-[15px] font-bold font-serif leading-snug tracking-wide line-clamp-2 ${
                    isSelected ? 'text-[#f4efe6]' : 'text-[#ded6cb] group-hover/card:text-[#f4efe6]'
                  }`}
                  title={block.title}
                >
                  {shortSpanishTitle}
                </h5>

                {/* Heure repère dans la timeline (ex: 0:00 -> ~1:00) */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8c8173] pt-0.5">
                  <span className="flex items-center gap-1 text-[#e5a93b]">
                    <Clock className="w-3 h-3" />
                    <span>~{timing.startFormatted}</span>
                  </span>
                  <span className="text-[#6e6355]">
                    {block.durationApprox || `${Math.round(parseApproxSeconds(block.durationApprox))}s`}
                  </span>
                </div>
              </div>

              {/* Statut vidéo liée ou action repère */}
              <div className="pt-2 border-t border-[#261f18] flex items-center justify-between gap-1">
                {link ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPlayLinkedVideo) onPlayLinkedVideo(link);
                    }}
                    className="flex-1 px-2 py-1 rounded-lg bg-[#271e16] hover:bg-[#3b2d1d] border border-[#e5a93b]/60 text-[#e5a93b] hover:text-[#fff] text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer truncate"
                    title={`Lire la vidéo au repère : ${link.landmarkLabel}`}
                  >
                    <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                    <span className="truncate">{link.landmarkLabel}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenLinkPicker) onOpenLinkPicker(block.id, shortSpanishTitle);
                    }}
                    className="flex-1 px-2 py-1 rounded-lg bg-[#1b1713] hover:bg-[#251f18] text-[#8c8173] hover:text-[#e5a93b] border border-[#2d241a] text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
                    title="Associer une vidéo de cours ou de maître"
                  >
                    <Link2 className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">Lier une vidéo</span>
                  </button>
                )}

                {/* Micro-boutons de déplacement rapide (très utile sur mobile et tactile) */}
                <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={(e) => moveLeft(e, index)}
                    className="p-1 rounded hover:bg-[#2b2218] disabled:opacity-20 text-[#8c8173] hover:text-[#e5a93b] transition-colors cursor-pointer"
                    title="Déplacer vers la gauche (plus tôt)"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={index === blocks.length - 1}
                    onClick={(e) => moveRight(e, index)}
                    className="p-1 rounded hover:bg-[#2b2218] disabled:opacity-20 text-[#8c8173] hover:text-[#e5a93b] transition-colors cursor-pointer"
                    title="Déplacer vers la droite (plus tard)"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditBlock(block, index + 1);
                    }}
                    className="p-1 rounded hover:bg-[#2b2218] text-[#8c8173] hover:text-[#e5a93b] transition-colors cursor-pointer"
                    title="Modifier ce bloc"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Puce d'enchaînement vers le bloc suivant */}
              {index < blocks.length - 1 && (
                <div className="hidden sm:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-[#15120f] border border-[#3e3223] text-[#e5a93b] items-center justify-center pointer-events-none text-[9px] shadow-sm">
                  ›
                </div>
              )}
            </div>
          );
        })}

        {/* Bouton Ajouter un bloc à la fin de la timeline */}
        <button
          type="button"
          onClick={onCreateBlock}
          className="shrink-0 w-[140px] rounded-xl border-2 border-dashed border-[#33291e] hover:border-[#e5a93b] bg-[#14110e]/60 hover:bg-[#1c1712] p-3 flex flex-col items-center justify-center gap-2 text-[#8c8173] hover:text-[#e5a93b] transition-all cursor-pointer group"
          title="Ajouter un bloc personnalisé à la suite de la frise"
        >
          <div className="w-8 h-8 rounded-full bg-[#221b14] group-hover:bg-[#e5a93b] text-[#8c8173] group-hover:text-[#121110] flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold text-center leading-tight">
            Nouveau bloc
          </span>
        </button>
      </div>

      {/* Guide visuel de l'enchaînement en bas de la timeline */}
      <div className="pt-2 border-t border-[#231c15] flex items-center justify-between text-[11px] text-[#8c8173] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#e5a93b] font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Progression flamenca :</span>
          </span>
          <span className="text-[#a69c8f] truncate max-w-[280px] sm:max-w-none">
            {blocks.map((b, i) => `${i + 1}. ${getShortSpanishTitle(b.title)}`).join('  ➔  ')}
          </span>
        </div>

        <div className="text-[10px] text-[#73685a]">
          Ordre dynamique sauvegardé automatiquement
        </div>
      </div>
    </section>
  );
};
