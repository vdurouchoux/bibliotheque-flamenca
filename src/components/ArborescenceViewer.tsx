import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Download, Info, Layers, Check } from 'lucide-react';
import { ARBORESCENCE_DATA } from '../data/arborescenceData';

export const ArborescenceViewer: React.FC = () => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentImgSrc, setCurrentImgSrc] = useState<string>(ARBORESCENCE_DATA.imageUrl);
  const [hasError, setHasError] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleImageError = () => {
    // Cascade de fallbacks si l'importation Vite ou le chemin web direct échoue
    if (currentImgSrc === ARBORESCENCE_DATA.imageUrl) {
      setCurrentImgSrc(ARBORESCENCE_DATA.publicWebPath);
    } else if (currentImgSrc === ARBORESCENCE_DATA.publicWebPath) {
      setCurrentImgSrc(ARBORESCENCE_DATA.rootWebPath);
    } else {
      setHasError(true);
    }
  };

  const copyPath = (path: string) => {
    try {
      navigator.clipboard.writeText(path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Overview Card */}
      <div className="p-4 rounded-xl bg-[#221c17] border border-[#3e3427] space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#e5a93b]/20 text-[#e5a93b]">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#f4efe6] font-serif">
              {ARBORESCENCE_DATA.title}
            </h3>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#342a1f] text-[#e5a93b] border border-[#52412d]">
            Généalogie des Palos
          </span>
        </div>
        <p className="text-xs text-[#b8ada0] leading-relaxed">
          {ARBORESCENCE_DATA.description}
        </p>

        {/* Server compatibility info bar */}
        <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#8c8173] border-t border-[#31271d]">
          <span className="text-[#a69c8f] font-medium">Chemin web serveur PC & Mobile :</span>
          <code className="px-2 py-0.5 rounded bg-[#15120f] text-[#e5a93b] font-mono text-[11px] border border-[#382c20]">
            {ARBORESCENCE_DATA.publicWebPath}
          </code>
          <button
            type="button"
            onClick={() => copyPath(ARBORESCENCE_DATA.publicWebPath)}
            className="text-[10px] text-[#e5a93b] hover:text-[#ffd68a] underline inline-flex items-center gap-1 cursor-pointer"
          >
            {copiedPath ? <Check className="w-3 h-3 text-emerald-400" /> : null}
            <span>{copiedPath ? 'Copié !' : 'Copier le chemin'}</span>
          </button>
        </div>
      </div>

      {/* Image Viewer Frame */}
      <div 
        ref={containerRef}
        className={`relative rounded-2xl bg-[#0f0d0b] border-2 border-[#382d22] overflow-hidden flex flex-col transition-all ${
          isFullscreen ? 'fixed inset-3 z-50 shadow-2xl' : 'min-h-[380px] sm:min-h-[460px] max-h-[70vh]'
        }`}
      >
        {/* Floating Controls Bar */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-[#1c1712]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#443729] shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-[#d4c9ba] hover:text-[#e5a93b] hover:bg-[#2b2219] transition-colors cursor-pointer"
            title="Zoomer (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-[#d4c9ba] hover:text-[#e5a93b] hover:bg-[#2b2219] transition-colors cursor-pointer"
            title="Dézoomer (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-lg text-xs font-mono font-bold text-[#d4c9ba] hover:text-[#e5a93b] hover:bg-[#2b2219] transition-colors cursor-pointer"
            title="Réinitialiser à 100%"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <div className="w-px h-4 bg-[#3d3224] mx-0.5" />
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-[#d4c9ba] hover:text-[#e5a93b] hover:bg-[#2b2219] transition-colors cursor-pointer"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <a
            href={ARBORESCENCE_DATA.publicWebPath}
            download="arborescence_palos_flamencos.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-[#d4c9ba] hover:text-[#e5a93b] hover:bg-[#2b2219] transition-colors cursor-pointer"
            title="Télécharger l'arborescence HD"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>

        {/* Image Container with Pan / Scroll */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[340px]">
          {hasError ? (
            <div className="text-center p-8 max-w-md space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center mx-auto text-red-400">
                <Info className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#f4efe6]">
                Image de l'arborescence indisponible
              </h4>
              <p className="text-xs text-[#a69c8f]">
                Le fichier d'image n'a pas pu être chargé à l'adresse <code>{currentImgSrc}</code>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setHasError(false);
                  setCurrentImgSrc(ARBORESCENCE_DATA.imageUrl);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#2b2219] hover:bg-[#382c20] text-[#e5a93b] text-xs font-bold transition-colors cursor-pointer border border-[#483827]"
              >
                Réessayer le chargement
              </button>
            </div>
          ) : (
            <div 
              className="transition-transform duration-200 ease-out origin-center flex items-center justify-center w-full"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={currentImgSrc}
                alt="Arborescence des Palos Flamencos – Arbre généalogique"
                onError={handleImageError}
                className="max-w-full h-auto object-contain rounded-lg shadow-2xl border border-[#2b221a]"
                style={{ maxHeight: isFullscreen ? '85vh' : '65vh' }}
                loading="eager"
              />
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-[#171310] border-t border-[#292017] flex items-center justify-between text-[11px] text-[#8c8173]">
          <span>💡 Utilisez les boutons de zoom ou déplacez l'image pour explorer les détails des branches.</span>
          <span className="font-mono text-[#e5a93b]">1376 × 768 px</span>
        </div>
      </div>

      {/* Guide des grandes familles flamencas */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5a93b]">
          Les Grandes Branches de l'Arbre Flamenco
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ARBORESCENCE_DATA.families.map(family => (
            <div
              key={family.id}
              className="p-3 rounded-xl bg-[#1a1613] border border-[#31271e] hover:border-[#48392a] transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-bold text-[#f4efe6] font-serif">
                  {family.name}
                </h5>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${family.color}20`, color: family.color, border: `1px solid ${family.color}40` }}
                >
                  {family.compasType}
                </span>
              </div>
              <p className="text-[11px] text-[#a69c8f] leading-relaxed">
                {family.description}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {family.palos.map(palo => (
                  <span
                    key={palo}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#241e18] text-[#ded3c5] border border-[#382d23]"
                  >
                    {palo}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
