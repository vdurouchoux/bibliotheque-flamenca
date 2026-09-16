import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Volume2, VolumeX, Sparkles, RefreshCw, Music } from 'lucide-react';
import { flamencoMetronome, SoundType } from '../utils/audioMetronome';
import { PaloCompas } from '../types';

interface CompasVisualizerProps {
  compas: PaloCompas;
  isPlaying: boolean;
  onTogglePlay: (playing: boolean) => void;
  compact?: boolean;
}

export const CompasVisualizer: React.FC<CompasVisualizerProps> = ({
  compas,
  isPlaying,
  onTogglePlay,
  compact = false
}) => {
  const [bpm, setBpm] = useState<number>(compas.defaultBpm || 120);
  const [currentBeat, setCurrentBeat] = useState<number>(compas.beats === 12 ? 12 : 1);
  const [isAccentBeat, setIsAccentBeat] = useState<boolean>(false);
  const [soundType, setSoundType] = useState<SoundType>('cajon_palmas');
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Tap tempo state
  const tapTimesRef = useRef<number[]>([]);

  // Update metronome settings when props or local state change
  useEffect(() => {
    flamencoMetronome.setPattern(compas.beats, compas.accents, bpm);
  }, [compas.beats, compas.accents, bpm]);

  useEffect(() => {
    flamencoMetronome.setSoundType(soundType);
  }, [soundType]);

  useEffect(() => {
    flamencoMetronome.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Hook into onBeat callback
  useEffect(() => {
    flamencoMetronome.setOnBeat((beat, isAccent) => {
      setCurrentBeat(beat);
      setIsAccentBeat(isAccent);
    });

    return () => {
      flamencoMetronome.setOnBeat(null);
    };
  }, []);

  // Update default BPM when palo changes
  useEffect(() => {
    setBpm(compas.defaultBpm || 120);
  }, [compas]);

  const togglePlay = () => {
    if (isPlaying) {
      flamencoMetronome.stop();
      onTogglePlay(false);
    } else {
      const start = compas.beats === 12 ? 12 : 1;
      flamencoMetronome.start(start);
      onTogglePlay(true);
    }
  };

  const handleTapTempo = useCallback(() => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    
    // Filter out taps older than 2 seconds
    const recentTaps = taps.filter(t => now - t < 2000);
    recentTaps.push(now);
    tapTimesRef.current = recentTaps;

    if (recentTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < recentTaps.length; i++) {
        intervals.push(recentTaps[i] - recentTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval > 150 && avgInterval < 2000) {
        const calculatedBpm = Math.round(60000 / avgInterval);
        const clamped = Math.max(compas.minBpm || 40, Math.min(compas.maxBpm || 260, calculatedBpm));
        setBpm(clamped);
        flamencoMetronome.setTempo(clamped);
      }
    }
  }, [compas.minBpm, compas.maxBpm]);

  // If Palo is libre (no beats)
  if (compas.beats === 0 || compas.rhythmType === 'libre') {
    return (
      <div className="bg-[#1b1815] border border-[#332c25] rounded-xl p-5 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e5a93b]/10 text-[#e5a93b] mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-[#f4efe6] font-serif">Toque libre (Sin compás métrique)</h4>
        <p className="text-sm text-[#a69c8f] mt-1.5 max-w-md mx-auto leading-relaxed">
          Ce palo ne possède pas de mesure stricte au métronome. Le rythme respire librement selon la poésie du chant et la vibration expressive de la guitare.
        </p>
      </div>
    );
  }

  // Generate 12-beat clock positions (12 at top, then 1..11 clockwise)
  const render12Clock = () => {
    const beatsOrder = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const radius = compact ? 85 : 110;
    const center = compact ? 100 : 130;

    return (
      <div className="relative mx-auto flex items-center justify-center select-none" style={{ width: center * 2, height: center * 2 }}>
        {/* Background decorative track */}
        <div className="absolute inset-4 rounded-full border border-[#383129] pointer-events-none" />
        <div className="absolute inset-10 rounded-full border border-[#26211c] pointer-events-none" />

        {/* Center Display */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none z-10">
          <span className={`font-mono text-3xl font-extrabold transition-all duration-100 ${
            isAccentBeat
              ? 'text-[#e5a93b] scale-125 drop-shadow-[0_0_12px_rgba(229,169,59,0.5)]'
              : 'text-[#f4efe6]'
          }`}>
            {currentBeat}
          </span>
          <span className="text-[11px] font-medium text-[#a69c8f] tracking-wider uppercase mt-0.5">
            {isAccentBeat ? 'Accent' : 'Temps'}
          </span>
          <span className="text-[10px] text-[#706659] mt-0.5">
            {bpm} BPM
          </span>
        </div>

        {/* 12 Beats on the circle */}
        {beatsOrder.map((beatNumber, idx) => {
          // Angle in radians (12 is at top = -PI/2)
          const angle = (idx * (360 / 12) - 90) * (Math.PI / 180);
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const isAccent = compas.accents.includes(beatNumber);
          const isActive = currentBeat === beatNumber;

          return (
            <div
              key={beatNumber}
              style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
              className={`absolute flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer ${
                isActive
                  ? isAccent
                    ? 'w-9 h-9 bg-[#e5a93b] text-[#121110] font-black shadow-[0_0_15px_rgba(229,169,59,0.7)] scale-110 ring-2 ring-white z-20'
                    : 'w-8 h-8 bg-[#f4efe6] text-[#121110] font-bold shadow-md scale-105 ring-1 ring-[#e5a93b] z-20'
                  : isAccent
                  ? 'w-7 h-7 bg-[#34291c] text-[#e5a93b] border-2 border-[#e5a93b]/70 font-bold hover:bg-[#433524]'
                  : 'w-6 h-6 bg-[#211d19] text-[#8c8173] border border-[#383129] text-xs hover:text-[#d4c9ba]'
              }`}
              onClick={() => setCurrentBeat(beatNumber)}
              title={`Temps ${beatNumber} ${isAccent ? '(accent)' : ''}`}
            >
              <span className="text-xs font-mono">{beatNumber}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Generate linear beat bar layout for 3-beat, 4-beat, etc.
  const renderLinearBar = () => {
    const totalBeats = compas.beats || 4;
    const beatList = Array.from({ length: totalBeats }, (_, i) => i + 1);

    return (
      <div className="py-4">
        <div className={`grid gap-2.5 max-w-sm mx-auto ${totalBeats === 3 ? 'grid-cols-3' : totalBeats === 4 ? 'grid-cols-4' : 'grid-cols-6'}`}>
          {beatList.map(beat => {
            const isAccent = compas.accents.includes(beat);
            const isActive = currentBeat === beat;

            let label = isAccent ? 'Accent' : 'Temps';
            if (compas.rhythmType === '4-temps' && beat === 1) {
              label = 'Silencieux';
            }

            return (
              <div
                key={beat}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-100 ${
                  isActive
                    ? isAccent
                      ? 'bg-[#e5a93b] text-[#121110] border-[#f5c363] shadow-[0_0_18px_rgba(229,169,59,0.5)] scale-105 font-bold'
                      : 'bg-[#f4efe6] text-[#121110] border-white scale-102 font-bold'
                    : isAccent
                    ? 'bg-[#29221a] text-[#e5a93b] border-[#e5a93b]/40 font-semibold'
                    : 'bg-[#1e1b17] text-[#8c8173] border-[#383129]'
                }`}
              >
                <span className="text-2xl font-mono font-bold">{beat}</span>
                <span className="text-[10px] uppercase tracking-wider mt-1 opacity-80">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-3 text-xs text-[#a69c8f]">
          {compas.rhythmType === '4-temps' && (
            <span>Compás à 4 temps : pulsations accentuées sur <span className="text-[#e5a93b] font-semibold">{compas.accents.join(', ')}</span>.</span>
          )}
          {compas.rhythmType === '3-temps' && (
            <span>Compás à 3 temps : pulsation ternaire vive accentuée sur <span className="text-[#e5a93b] font-semibold">{compas.accents.join(', ')}</span>.</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-[#171412] border border-[#312a23] rounded-2xl p-4 sm:p-5 shadow-xl ${compact ? '' : 'my-4'}`}>
      {/* Header with Title & Rhythm info */}
      <div className="flex items-center justify-between border-b border-[#2d2721] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#e5a93b]/15 text-[#e5a93b]">
              <Music className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#f4efe6] font-serif">
              Métronome Flamenco ({compas.beats} temps)
            </h3>
          </div>
          <p className="text-xs text-[#9d9284] mt-0.5">
            {compas.description}
          </p>
        </div>

        {/* Play / Stop Master Button */}
        <button
          id="metronome-play-toggle"
          onClick={togglePlay}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-lg ${
            isPlaying
              ? 'bg-[#c53d2d] hover:bg-[#a63022] text-white shadow-[#c53d2d]/30'
              : 'bg-[#e5a93b] hover:bg-[#d4972c] text-[#121110] shadow-[#e5a93b]/25'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Arrêter</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Démarrer</span>
            </>
          )}
        </button>
      </div>

      {/* Visualizer Display */}
      {compas.beats === 12 ? render12Clock() : renderLinearBar()}

      {/* Controls Bar */}
      <div className="mt-5 pt-4 border-t border-[#2d2721] flex flex-col gap-4">
        {/* Tempo controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a69c8f] font-medium">Tempo :</span>
            <button
              onClick={() => {
                const next = Math.max(compas.minBpm || 40, bpm - 5);
                setBpm(next);
                flamencoMetronome.setTempo(next);
              }}
              className="w-7 h-7 rounded bg-[#26211c] hover:bg-[#342e26] text-[#e5a93b] font-bold text-sm border border-[#3b342c] cursor-pointer"
            >
              -5
            </button>
            <span className="font-mono text-base font-bold text-[#f4efe6] min-w-[50px] text-center">
              {bpm} <span className="text-xs text-[#a69c8f] font-normal">BPM</span>
            </span>
            <button
              onClick={() => {
                const next = Math.min(compas.maxBpm || 260, bpm + 5);
                setBpm(next);
                flamencoMetronome.setTempo(next);
              }}
              className="w-7 h-7 rounded bg-[#26211c] hover:bg-[#342e26] text-[#e5a93b] font-bold text-sm border border-[#3b342c] cursor-pointer"
            >
              +5
            </button>

            {/* Reset to default BPM */}
            {bpm !== compas.defaultBpm && (
              <button
                onClick={() => {
                  setBpm(compas.defaultBpm);
                  flamencoMetronome.setTempo(compas.defaultBpm);
                }}
                className="text-[11px] text-[#e5a93b] hover:underline flex items-center gap-1 ml-1"
                title="Rétablir le tempo par défaut du palo"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Défaut ({compas.defaultBpm})</span>
              </button>
            )}
          </div>

          {/* Tap tempo button */}
          <button
            onClick={handleTapTempo}
            className="px-3 py-1.5 rounded-lg bg-[#27221d] hover:bg-[#383129] active:bg-[#e5a93b] active:text-black border border-[#3d362e] text-xs font-semibold text-[#f4efe6] transition-all cursor-pointer select-none"
          >
            👆 Tap Tempo
          </button>
        </div>

        {/* Slider for smooth BPM adjustment */}
        <input
          type="range"
          min={compas.minBpm || 50}
          max={compas.maxBpm || 240}
          value={bpm}
          onChange={e => {
            const val = Number(e.target.value);
            setBpm(val);
            flamencoMetronome.setTempo(val);
          }}
          className="w-full accent-[#e5a93b] cursor-pointer bg-[#26211c] h-1.5 rounded-lg"
        />

        {/* Sound Selection & Volume */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Sound choice */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#a69c8f]">Sonorité :</span>
            {(['cajon_palmas', 'cajon', 'palmas', 'golpe', 'woodblock'] as SoundType[]).map(type => (
              <button
                key={type}
                onClick={() => setSoundType(type)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
                  soundType === type
                    ? 'bg-[#e5a93b]/20 text-[#e5a93b] border-[#e5a93b]/50 font-semibold shadow-sm'
                    : 'bg-[#221e1a] text-[#8c8173] border-[#332c25] hover:text-[#d4c9ba]'
                }`}
                title={
                  type === 'cajon_palmas'
                    ? 'Cajón et Palmas simultanés : basse & slap + palmas sordas & secas'
                    : type === 'cajon'
                    ? 'Cajón flamenco : basse au centre et slap aigu avec timbre sur les accents'
                    : type === 'palmas'
                    ? 'Palmas seules : sorda étouffée et seca claquée'
                    : type === 'golpe'
                    ? 'Golpe sur la table de guitare'
                    : 'Clic métronome classique'
                }
              >
                {type === 'cajon_palmas'
                  ? '🥁👏 Cajón + Palmas'
                  : type === 'cajon'
                  ? '🪘 Cajón'
                  : type === 'palmas'
                  ? '👏 Palmas'
                  : type === 'golpe'
                  ? '🪵 Golpe'
                  : '🔔 Clic'}
              </button>
            ))}
          </div>

          {/* Volume toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 rounded text-[#a69c8f] hover:text-[#f4efe6] cursor-pointer"
              title={isMuted ? 'Rétablir le son' : 'Couper le son'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={e => {
                const val = Number(e.target.value);
                setVolume(val);
                setIsMuted(false);
              }}
              className="w-16 sm:w-20 accent-[#e5a93b] cursor-pointer h-1 bg-[#26211c] rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
