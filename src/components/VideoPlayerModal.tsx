import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Bookmark, FileText, ChevronRight, ChevronLeft, Play, Pause, RotateCcw, FastForward, Rewind, Music, Sparkles, Edit3, Plus, Trash2, Check, Clock, Gauge, Smartphone, Copy, QrCode, Share2, AlertTriangle, Laptop, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { VideoItem, Level, VideoLandmark } from '../types';
import { FARRUCA_BAILE } from '../data/baile/farrucaBaile';
import { 
  extractYouTubeInfo, getVideoNotes, saveVideoNotes, toggleBookmark, 
  getBookmarks, updateBookmarkStatus, getVideoCustomLandmarks, 
  saveVideoCustomLandmarks, resetVideoCustomLandmarks,
  exportAllSyncData, formatLandmarksAsText
} from '../utils/storage';
import { shareVideoItem, getVideoShareData, ShareOptions } from '../utils/shareUtils';
import { ShareModal } from './ShareModal';
import { ReplaceVideoModal } from './ReplaceVideoModal';
import { checkVideoDeviceAvailability, getCurrentDeviceType } from '../utils/deviceUtils';

interface VideoPlayerModalProps {
  video: VideoItem;
  paloName: string;
  paloId: string;
  sectionName: string;
  discipline?: 'guitare' | 'danse';
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  paloName,
  paloId,
  sectionName,
  discipline,
  onClose,
  onNext,
  onPrevious
}) => {
  const [currentVideo, setCurrentVideo] = useState<VideoItem>(video);
  const [showReplaceModal, setShowReplaceModal] = useState<boolean>(false);

  useEffect(() => {
    setCurrentVideo(video);
  }, [video]);

  const availability = checkVideoDeviceAvailability(currentVideo);
  const currentDevice = getCurrentDeviceType();

  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [status, setStatus] = useState<'to_learn' | 'learning' | 'mastered'>('learning');
  const [notesSavedFeedback, setNotesSavedFeedback] = useState<boolean>(false);

  const resolveInitialLandmarks = (v: VideoItem): VideoLandmark[] => {
    const custom = getVideoCustomLandmarks(v.id, v.url);
    if (custom !== null && custom.length > 0) return custom;
    if (v.landmarks && v.landmarks.length > 0) return v.landmarks;

    // Fallback de sécurité sur les Grands Maîtres connus (Iván Vargas, El Güito, Sara Baras)
    const ytId = extractYouTubeInfo(v.url, 0).videoId;
    const matchedMaitre = FARRUCA_BAILE.maitres?.find(
      m => m.id === v.id || (ytId && extractYouTubeInfo(m.url, 0).videoId === ytId)
    );
    if (matchedMaitre?.landmarks && matchedMaitre.landmarks.length > 0) {
      return matchedMaitre.landmarks;
    }
    return [];
  };

  // Editable landmarks state
  const [landmarks, setLandmarks] = useState<VideoLandmark[]>(() => resolveInitialLandmarks(video));
  const [isEditingLandmarks, setIsEditingLandmarks] = useState<boolean>(false);
  const [newLmTime, setNewLmTime] = useState<string>('');
  const [newLmTitle, setNewLmTitle] = useState<string>('');
  const [editingLmIndex, setEditingLmIndex] = useState<number | null>(null);
  const [editLmTime, setEditLmTime] = useState<string>('');
  const [editLmTitle, setEditLmTitle] = useState<string>('');

  const parsedInfo = extractYouTubeInfo(currentVideo.url, 0);
  const videoId = parsedInfo.videoId;
  const initialStart = currentVideo.startSeconds !== undefined ? Math.max(0, currentVideo.startSeconds) : 0;
  const [currentStart, setCurrentStart] = useState<number>(initialStart);
  const [playerKey, setPlayerKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [shareToastMessage, setShareToastMessage] = useState<string | null>(null);
  const [shareModalOptions, setShareModalOptions] = useState<ShareOptions | null>(null);
  const isFromMontage = sectionName.toLowerCase().includes('montage');

  const handleShareVideo = () => {
    const opts = getVideoShareData({
      video,
      paloName,
      paloId,
      sectionName,
      currentTime: currentStart,
      discipline: discipline || (isDance ? 'danse' : 'guitare')
    });
    setShareModalOptions(opts);
  };

  const tryPlayVideo = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
    }
  };

  const handleIframeLoad = () => {
    tryPlayVideo();
    setTimeout(tryPlayVideo, 350);
    setTimeout(tryPlayVideo, 800);
    setTimeout(tryPlayVideo, 1400);
  };

  const changePlaybackSpeed = (rate: number) => {
    setPlaybackSpeed(rate);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setPlaybackRate',
          args: [rate]
        }),
        '*'
      );
    }
  };

  const togglePlayPause = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      if (isPlaying) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
        setIsPlaying(false);
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
        setIsPlaying(true);
      }
    }
  };

  // Listen to YouTube player state events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'onReady') {
            tryPlayVideo();
          } else if (data.event === 'onStateChange') {
            if (data.info === 1) setIsPlaying(true);
            else if (data.info === 2 || data.info === 0) setIsPlaying(false);
          } else if (data.event === 'infoDelivery' && data.info) {
            if (data.info.playerState === 1) setIsPlaying(true);
            else if (data.info.playerState === 2 || data.info.playerState === 0) setIsPlaying(false);
          }
        }
      } catch {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const isFirstMount = useRef(true);
  const prevVideoIdRef = useRef(video.id);
  const prevStartRef = useRef(video.startSeconds);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const t1 = setTimeout(tryPlayVideo, 350);
      const t2 = setTimeout(tryPlayVideo, 800);
      const t3 = setTimeout(tryPlayVideo, 1400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    if (prevVideoIdRef.current !== video.id || prevStartRef.current !== video.startSeconds) {
      prevVideoIdRef.current = video.id;
      prevStartRef.current = video.startSeconds;

      const start = video.startSeconds !== undefined ? Math.max(0, video.startSeconds) : 0;
      setCurrentStart(start);
      setPlaybackSpeed(1);
      setIsPlaying(true);
      setPlayerKey(k => k + 1);

      setLandmarks(resolveInitialLandmarks(video));
      setIsEditingLandmarks(false);
      setEditingLmIndex(null);

      // Load existing notes
      setNotes(getVideoNotes(video.id));

      // Load existing bookmark
      const bookmarks = getBookmarks();
      if (bookmarks[video.id]) {
        setIsSaved(true);
        setStatus(bookmarks[video.id].status);
      } else {
        setIsSaved(false);
        setStatus('learning');
      }
    }
  }, [video.id, video.url, video.startSeconds]);

  const isCanteOrLetra = 
    sectionName.toLowerCase().includes('letra') || 
    sectionName.toLowerCase().includes('cante') || 
    sectionName.toLowerCase().includes('chant') ||
    video.title.toLowerCase().includes('letra') ||
    video.title.toLowerCase().includes('cantaor');

  const isDance = !isCanteOrLetra && (
    discipline === 'danse' ||
    paloName.toLowerCase().includes('danse') || 
    paloName.toLowerCase().includes('baile') || 
    ['marcajes', 'zapateado', 'llamadas', 'maitres', 'structure'].includes(sectionName.toLowerCase())
  );

  const cleanTitleForSearch = video.title
    .replace(/^Letra\s*#?\d+\s*[-:]?\s*/i, '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .trim();

  const searchKeywords = isCanteOrLetra
    ? `${paloName.replace('(Danse)', '').trim()} flamenco cante cantaor ${cleanTitleForSearch}`
    : isDance
    ? `${video.title} ${paloName.replace('(Danse)', '').trim()} flamenco baile`
    : `${video.title} ${paloName} flamenco guitarra`;

  const searchButtonLabel = isCanteOrLetra
    ? "🔍 Rechercher d'autres interprètes (Cantaores)"
    : isDance
    ? "🔍 Rechercher d'autres versions (Danse)"
    : "🔍 Rechercher d'autres versions (Guitare)";

  const handleJumpToTime = (seconds: number) => {
    const sec = Math.max(0, seconds);
    setCurrentStart(sec);
    setIsPlaying(true);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [sec, true] }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
    } else {
      setPlayerKey(k => k + 1);
    }
  };

  const parseTimeToSeconds = (input: string): number => {
    const trimmed = input.trim();
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
    const parts = trimmed.split(':').map(p => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const formatSecondsToMinutes = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSaveLandmarks = (updated: VideoLandmark[]) => {
    // Sort by timestamp
    const sorted = [...updated].sort((a, b) => a.timeSeconds - b.timeSeconds);
    setLandmarks(sorted);
    saveVideoCustomLandmarks(video.id, sorted, video.url);
  };

  const handleAddLandmark = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newLmTitle.trim()) return;
    const secs = newLmTime ? parseTimeToSeconds(newLmTime) : currentStart;
    const formattedTime = formatSecondsToMinutes(secs);
    const label = `${formattedTime} - ${newLmTitle.trim()}`;
    const newLm: VideoLandmark = {
      timeSeconds: secs,
      label: label
    };
    const updated = [...landmarks, newLm];
    handleSaveLandmarks(updated);
    setNewLmTitle('');
    setNewLmTime('');
  };

  const handleStartEditLandmark = (index: number) => {
    setEditingLmIndex(index);
    const lm = landmarks[index];
    setEditLmTime(formatSecondsToMinutes(lm.timeSeconds));
    const titleOnly = lm.label.includes(' - ') ? lm.label.split(' - ').slice(1).join(' - ') : lm.label;
    setEditLmTitle(titleOnly);
  };

  const handleSaveEditLandmark = (index: number) => {
    const secs = parseTimeToSeconds(editLmTime);
    const formattedTime = formatSecondsToMinutes(secs);
    const label = `${formattedTime} - ${editLmTitle.trim() || 'Repère'}`;
    const updated = [...landmarks];
    updated[index] = {
      ...updated[index],
      timeSeconds: secs,
      label: label
    };
    handleSaveLandmarks(updated);
    setEditingLmIndex(null);
  };

  const handleDeleteLandmark = (index: number) => {
    const updated = landmarks.filter((_, i) => i !== index);
    handleSaveLandmarks(updated);
    if (editingLmIndex === index) setEditingLmIndex(null);
  };

  const [copiedLandmarksText, setCopiedLandmarksText] = useState<boolean>(false);

  const handleCopyLandmarksText = () => {
    const text = formatLandmarksAsText(video.title, landmarks);
    navigator.clipboard.writeText(text);
    setCopiedLandmarksText(true);
    setTimeout(() => setCopiedLandmarksText(false), 3500);
  };

  const handleResetLandmarks = () => {
    if (window.confirm('Rétablir les repères d’origine de cette vidéo ?')) {
      resetVideoCustomLandmarks(video.id, video.url);
      setLandmarks(video.landmarks || []);
      setIsEditingLandmarks(false);
      setEditingLmIndex(null);
    }
  };

  const handleSkipForward = (deltaSeconds: number) => {
    setCurrentStart(prev => prev + deltaSeconds);
    setIsPlaying(true);
    setPlayerKey(k => k + 1);
  };

  const handleRewind = (deltaSeconds: number) => {
    setCurrentStart(prev => Math.max(0, prev - deltaSeconds));
    setIsPlaying(true);
    setPlayerKey(k => k + 1);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    saveVideoNotes(video.id, val);
    setNotesSavedFeedback(true);
    setTimeout(() => setNotesSavedFeedback(false), 2000);
  };

  const handleBookmarkToggle = () => {
    const nextSaved = toggleBookmark({
      videoId: video.id,
      paloId,
      paloName,
      section: sectionName,
      title: video.title,
      url: video.url,
      level: video.level,
      status: status,
      notes: notes,
      discipline: isDance ? 'danse' : 'guitare'
    });
    setIsSaved(nextSaved);
  };

  const handleStatusChange = (newStatus: 'to_learn' | 'learning' | 'mastered') => {
    setStatus(newStatus);
    if (!isSaved) {
      toggleBookmark({
        videoId: video.id,
        paloId,
        paloName,
        section: sectionName,
        title: video.title,
        url: video.url,
        level: video.level,
        status: newStatus,
        notes: notes,
        discipline: isDance ? 'danse' : 'guitare'
      });
      setIsSaved(true);
    } else {
      updateBookmarkStatus(video.id, newStatus);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181512] border border-[#383129] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1a16] border-b border-[#2e2720]">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xs text-[#a69c8f] truncate font-medium">
              {paloName} • {sectionName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareVideo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2b2216] hover:bg-[#3d301f] text-[#e5a93b] hover:text-[#fff] border border-[#4d3a24] text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Partager cette vidéo avec vos camarades (Web Share ou presse-papier)"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Partager</span>
            </button>
            {video.url && (
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-[#a69c8f] hover:text-[#e5a93b] hover:bg-[#2a241e] transition-colors"
                title="Ouvrir sur YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#a69c8f] hover:text-[#f4efe6] hover:bg-[#2a241e] transition-colors cursor-pointer"
              title="Fermer le lecteur"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Share notification toast */}
        {shareToastMessage && (
          <div className="px-4 py-2 bg-[#2a2217] border-b border-[#e5a93b]/50 text-[#e5a93b] text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e5a93b] shrink-0" />
              <span>{shareToastMessage}</span>
            </div>
            <button
              onClick={() => setShareToastMessage(null)}
              className="text-[#a69c8f] hover:text-[#f4efe6] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
          {!availability.isAvailableOnCurrentDevice ? (
            <div className="absolute inset-0 bg-[#171410] border-b border-[#30271e] flex flex-col items-center justify-center text-center p-6 text-[#f4efe6]">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/70 border border-amber-700/60 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
                {availability.sourceDevice === 'pc' ? (
                  <Laptop className="w-7 h-7" />
                ) : (
                  <Smartphone className="w-7 h-7" />
                )}
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-700/70 text-amber-300 text-xs font-bold mb-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{availability.message}</span>
              </div>

              <p className="text-xs sm:text-sm text-[#d4c9ba] max-w-md leading-relaxed mb-4">
                {availability.subMessage}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Remplacer par un lien YouTube / web</span>
                </button>
              </div>
            </div>
          ) : videoId ? (
            <iframe
              ref={iframeRef}
              key={playerKey}
              onLoad={handleIframeLoad}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=${currentStart}&enablejsapi=1&rel=0&playsinline=1&controls=1&iv_load_policy=3${typeof window !== 'undefined' && window.location?.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : ''}`}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : currentVideo.url && (currentVideo.url.startsWith('blob:') || currentVideo.url.match(/\.(mp4|webm|mov|m4v)$/i)) ? (
            <video
              controls
              autoPlay
              src={currentVideo.url}
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-[#a69c8f]">
              <p className="text-sm">Vidéo externe.</p>
              {currentVideo.url && (
                <a
                  href={currentVideo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e5a93b] text-[#121110] font-bold text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir le lien</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Playback Controls Bar */}
        <div className="px-3 sm:px-4 py-2.5 bg-[#171410] border-b border-[#2d261e] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleRewind(10)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322a22] text-[#d4c9ba] border border-[#3b3228] transition-colors cursor-pointer"
              title="Reculer de 10s"
            >
              <Rewind className="w-3.5 h-3.5 text-[#e5a93b]" />
              <span>-10s</span>
            </button>

            <button
              onClick={() => handleSkipForward(10)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322a22] text-[#d4c9ba] border border-[#3b3228] transition-colors cursor-pointer"
              title="Avancer de 10s"
            >
              <FastForward className="w-3.5 h-3.5 text-[#e5a93b]" />
              <span>+10s</span>
            </button>

            <button
              onClick={() => handleSkipForward(30)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322a22] text-[#b8ada0] border border-[#352e25] transition-colors cursor-pointer"
              title="Avancer de 30s"
            >
              <FastForward className="w-3.5 h-3.5 text-[#e5a93b]" />
              <span>+30s</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#8c8173]">
            {currentStart > 0 && (
              <span className="text-[#e5a93b] font-mono bg-[#241e17] px-2 py-0.5 rounded border border-[#3d3326]">
                Position : {Math.floor(currentStart / 60)}:{(currentStart % 60).toString().padStart(2, '0')}
              </span>
            )}
            {video.url && (
              <a
                href={currentStart > 0 ? `${video.url}${video.url.includes('?') ? '&' : '?'}t=${currentStart}s` : video.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#25201b] hover:bg-[#322c25] text-[#b8ada0] hover:text-[#f4efe6] transition-colors"
                title="Ouvrir avec le minutage exact sur YouTube"
              >
                <ExternalLink className="w-3 h-3" />
                <span>YouTube ↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Slow-motion / Ralenti & Playback Speed Bar with Play/Pause */}
        <div className="px-3 sm:px-4 py-2 bg-[#13100d] border-b border-[#29221a] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-[#e5a93b] font-semibold text-xs">
              <Gauge className="w-3.5 h-3.5" />
              <span>Ralenti :</span>
            </span>
            <div className="inline-flex items-center bg-[#1e1914] p-0.5 rounded-lg border border-[#382d21]">
              {[
                { label: '0.25x', value: 0.25 },
                { label: '0.5x', value: 0.5 },
                { label: '0.75x', value: 0.75 },
                { label: '1x (Normal)', value: 1 },
                { label: '1.25x', value: 1.25 }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => changePlaybackSpeed(opt.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    playbackSpeed === opt.value
                      ? 'bg-[#e5a93b] text-[#121110] shadow-sm font-bold'
                      : 'text-[#9e9284] hover:text-[#f4efe6] hover:bg-[#282119]'
                  }`}
                  title={`Vitesse de lecture à ${opt.label}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Bouton Pause / Play à droite du ralenti */}
            <button
              onClick={togglePlayPause}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                isPlaying
                  ? 'bg-[#261f18] hover:bg-[#34291f] text-[#f4efe6] border-[#483726]'
                  : 'bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] border-[#e5a93b]'
              }`}
              title={isPlaying ? "Mettre en pause (image nette sans barre rouge)" : "Lancer la vidéo"}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lancer la vidéo</span>
                </>
              )}
            </button>
          </div>
          <span className="text-[11px] text-[#7a6f62] italic hidden sm:inline">
            Pratique pour décomposer le zapateado, les compás et les falsetas
          </span>
        </div>

        {/* Other versions search */}
        <div className="px-4 py-2 bg-[#14120e] border-b border-[#252019] flex items-center justify-end gap-2 text-xs">
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchKeywords)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[#e5a93b] hover:underline font-medium"
          >
            <span>{searchButtonLabel}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Video Info & Practice Tools */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-[#f4efe6] font-serif">
                {video.title}
              </h2>
              {video.description && (
                <p className="text-sm text-[#b8ada0]">
                  {video.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Share button */}
              <button
                onClick={handleShareVideo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#221c17] hover:bg-[#2c241d] text-[#e5a93b] border border-[#3e3223] hover:border-[#e5a93b]/60 transition-all cursor-pointer shadow-sm"
                title="Partager cette vidéo et son minutage avec des étudiants"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Partager</span>
              </button>

              {/* Bookmark button */}
              <button
                onClick={handleBookmarkToggle}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-[#e5a93b]/20 text-[#e5a93b] border-[#e5a93b]/60'
                    : 'bg-[#25201b] text-[#a69c8f] border-[#383129] hover:text-[#f4efe6]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Enregistré' : 'Ajouter à mes études'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Landmarks (Repères clés chronométrés & Modifiables) */}
          <div className="p-3.5 bg-[#171410] border border-[#302820] rounded-xl space-y-2.5">
            {/* Header of landmarks section */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#f4efe6] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#e5a93b]" />
                <span>Repères & Découpage de la danse :</span>
                <span className="text-[11px] font-normal text-[#8c8173] ml-1">
                  ({landmarks.length} repère{landmarks.length > 1 ? 's' : ''})
                </span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Copy landmarks button */}
                {landmarks.length > 0 && (
                  <button
                    onClick={handleCopyLandmarksText}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      copiedLandmarksText
                        ? 'bg-green-600/20 text-green-300 border-green-500/50'
                        : 'bg-[#221c17] text-[#c9bcaa] hover:text-[#f4efe6] border-[#382e22]'
                    }`}
                    title="Copier la liste des repères pour sauvegarde ou pour me les transmettre"
                  >
                    {copiedLandmarksText ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-[#e5a93b]" />}
                    <span>{copiedLandmarksText ? 'Repères copiés !' : 'Copier mes repères'}</span>
                  </button>
                )}

                {/* Toggle edit button */}
                <button
                  onClick={() => setIsEditingLandmarks(!isEditingLandmarks)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    isEditingLandmarks
                      ? 'bg-[#e5a93b] text-[#121110] border-[#e5a93b] font-bold'
                      : 'bg-[#221c17] text-[#a69c8f] hover:text-[#f4efe6] border-[#382e22]'
                  }`}
                  title="Modifier ou ajouter des repères et minutages"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingLandmarks ? 'Terminer' : 'Modifier'}</span>
                </button>
              </div>
            </div>

            {/* Quick-Jump Buttons (Normal Mode) */}
            {!isEditingLandmarks && landmarks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                {landmarks.map((lm, idx) => {
                  const minutes = Math.floor(lm.timeSeconds / 60);
                  const secs = (lm.timeSeconds % 60).toString().padStart(2, '0');
                  const isCurrent = Math.abs(currentStart - lm.timeSeconds) < 4;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleJumpToTime(lm.timeSeconds)}
                      className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-[#e5a93b]/20 border-[#e5a93b] text-[#f4efe6] shadow-sm'
                          : 'bg-[#201a14] border-[#332b21] text-[#c7bcaf] hover:border-[#e5a93b]/50 hover:text-[#f4efe6]'
                      }`}
                      title={`Aller à ${minutes}:${secs}`}
                    >
                      <span className="truncate">{lm.label}</span>
                      <Play className="w-3 h-3 text-[#e5a93b] shrink-0 fill-current opacity-80" />
                    </button>
                  );
                })}
              </div>
            )}

            {!isEditingLandmarks && landmarks.length === 0 && (
              <p className="text-xs text-[#8c8173] italic py-1">
                Aucun repère défini pour cette vidéo. Cliquez sur "Ajouter et modifier des repères" pour en créer.
              </p>
            )}

            {/* Editing Interface (Edit Mode) */}
            {isEditingLandmarks && (
              <div className="pt-2 space-y-3 border-t border-[#2d251d]">
                <div className="flex items-center justify-between text-[11px] text-[#8c8173]">
                  <span>Modifiez les temps (format 1:24 ou secondes) et les intitulés des passages :</span>
                  {getVideoCustomLandmarks(video.id, video.url) !== null && (
                    <button
                      onClick={handleResetLandmarks}
                      className="text-[#e5a93b] hover:underline cursor-pointer flex items-center gap-1"
                      title="Rétablir les repères initiaux"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rétablir défaut</span>
                    </button>
                  )}
                </div>

                {/* List of current landmarks with direct inline edit */}
                <div className="space-y-2">
                  {landmarks.map((lm, idx) => {
                    const isEditingThis = editingLmIndex === idx;

                    if (isEditingThis) {
                      return (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#241c14] border border-[#e5a93b] flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={editLmTime}
                            onChange={e => setEditLmTime(e.target.value)}
                            placeholder="ex: 1:30"
                            className="w-20 px-2 py-1 bg-[#171410] border border-[#3d3326] rounded text-xs text-[#f4efe6] font-mono focus:outline-none focus:border-[#e5a93b]"
                          />
                          <input
                            type="text"
                            value={editLmTitle}
                            onChange={e => setEditLmTitle(e.target.value)}
                            placeholder="Nom du passage (ex: Primera Letra)"
                            className="flex-1 min-w-[140px] px-2 py-1 bg-[#171410] border border-[#3d3326] rounded text-xs text-[#f4efe6] focus:outline-none focus:border-[#e5a93b]"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSaveEditLandmark(idx)}
                              className="px-2.5 py-1 rounded bg-[#e5a93b] text-[#121110] text-xs font-bold hover:bg-[#f5b84c] cursor-pointer"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setEditingLmIndex(null)}
                              className="px-2 py-1 rounded bg-[#201a14] text-[#8c8173] hover:text-[#f4efe6] text-xs cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#1f1913] border border-[#332a20] text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="px-1.5 py-0.5 rounded bg-[#2a2219] font-mono text-[11px] text-[#e5a93b] border border-[#3d3124] shrink-0">
                            {formatSecondsToMinutes(lm.timeSeconds)}
                          </span>
                          <span className="text-[#d4c9ba] truncate">
                            {lm.label.includes(' - ') ? lm.label.split(' - ').slice(1).join(' - ') : lm.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            onClick={() => handleJumpToTime(lm.timeSeconds)}
                            className="p-1 rounded text-[#8c8173] hover:text-[#e5a93b] cursor-pointer"
                            title="Tester la position"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                          <button
                            onClick={() => handleStartEditLandmark(idx)}
                            className="p-1 rounded text-[#8c8173] hover:text-[#f4efe6] cursor-pointer"
                            title="Modifier ce repère"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteLandmark(idx)}
                            className="p-1 rounded text-[#8c8173] hover:text-red-400 cursor-pointer"
                            title="Supprimer ce repère"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add new landmark form */}
                <form onSubmit={handleAddLandmark} className="p-2.5 rounded-lg bg-[#1a1510] border border-[#382d21] space-y-2">
                  <div className="text-[11px] font-bold text-[#e5a93b] flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span>Ajouter un nouveau repère à cette vidéo :</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#14110e] px-2 py-1 rounded border border-[#302820]">
                      <Clock className="w-3 h-3 text-[#e5a93b]" />
                      <input
                        type="text"
                        value={newLmTime}
                        onChange={e => setNewLmTime(e.target.value)}
                        placeholder={formatSecondsToMinutes(currentStart)}
                        className="w-16 bg-transparent text-xs text-[#f4efe6] font-mono focus:outline-none"
                        title="Entrez le minutage (ex: 1:45 ou 105)"
                      />
                    </div>

                    <input
                      type="text"
                      value={newLmTitle}
                      onChange={e => setNewLmTitle(e.target.value)}
                      placeholder="Titre (ex: Llamada du milieu, Marcaje 2, Subida...)"
                      className="flex-1 min-w-[160px] px-2.5 py-1 bg-[#14110e] border border-[#302820] rounded text-xs text-[#f4efe6] focus:outline-none focus:border-[#e5a93b]"
                    />

                    <button
                      type="submit"
                      disabled={!newLmTitle.trim()}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#e5a93b] hover:bg-[#f5b84c] disabled:opacity-50 disabled:cursor-not-allowed text-[#121110] font-bold text-xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-[#8c8173]">
                    💡 Astuce : laissez le temps vide pour utiliser automatiquement la position courante du lecteur ({formatSecondsToMinutes(currentStart)}).
                  </p>
                </form>
              </div>
            )}
          </div>

          {/* Practice Status Selector (if saved or active) */}
          <div className="p-3 bg-[#1f1b17] border border-[#332c25] rounded-xl flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#a69c8f] font-medium">Statut d'apprentissage :</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleStatusChange('to_learn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  status === 'to_learn'
                    ? 'bg-[#433524] text-[#e5a93b] border-[#e5a93b]'
                    : 'bg-[#26211c] text-[#8c8173] border-transparent hover:text-[#d4c9ba]'
                }`}
              >
                À travailler
              </button>
              <button
                onClick={() => handleStatusChange('learning')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  status === 'learning'
                    ? 'bg-[#2c3746] text-[#70b1ff] border-[#70b1ff]'
                    : 'bg-[#26211c] text-[#8c8173] border-transparent hover:text-[#d4c9ba]'
                }`}
              >
                En cours d'étude
              </button>
              <button
                onClick={() => handleStatusChange('mastered')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  status === 'mastered'
                    ? 'bg-[#213b29] text-[#71d28c] border-[#71d28c]'
                    : 'bg-[#26211c] text-[#8c8173] border-transparent hover:text-[#d4c9ba]'
                }`}
              >
                Maîtrisé ✓
              </button>
            </div>
          </div>

          {/* Practice Notes Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#a69c8f]">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#e5a93b]" />
                <span className="font-semibold text-[#f4efe6]">
                  {isDance
                    ? 'Mes notes de travail (posture, pieds, repères chorégraphiques) :'
                    : 'Mes notes de travail (doigtés, mesure, repères) :'}
                </span>
              </div>
              {notesSavedFeedback && (
                <span className="text-[#71d28c] font-medium">Enregistré !</span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder={
                isDance
                  ? "Exemple : bien marquer l'accent sur le 3ème temps, soigner le port de bras à 0:45, contratiempo du talon gauche, appel net avant la subida..."
                  : "Exemple : ralentir le passage à 0:45, faire attention au compás sur le 3ème temps, capo case 2..."
              }
              rows={2}
              className="w-full bg-[#141210] border border-[#332c25] focus:border-[#e5a93b] rounded-xl p-3 text-xs sm:text-sm text-[#f4efe6] placeholder-[#6b6256] outline-none transition-colors"
            />
          </div>

          {/* Navigation between videos if available */}
          {(onPrevious || onNext) && (
            <div className="flex items-center justify-between pt-2 border-t border-[#2d2721]">
              {onPrevious ? (
                <button
                  onClick={onPrevious}
                  className="flex items-center gap-1 text-xs text-[#a69c8f] hover:text-[#e5a93b] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Vidéo précédente</span>
                </button>
              ) : <div />}

              {onNext ? (
                <button
                  onClick={onNext}
                  className="flex items-center gap-1 text-xs text-[#a69c8f] hover:text-[#e5a93b] transition-colors cursor-pointer"
                >
                  <span>Vidéo suivante</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : <div />}
            </div>
          )}

          {/* Bottom Back Button - easily accessible on mobile without scrolling up */}
          <div className="pt-4 border-t border-[#2e261f]">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#221c17] hover:bg-[#2d241d] active:bg-[#1b1612] text-[#e5a93b] hover:text-[#f4efe6] border border-[#3e3224] text-xs sm:text-sm font-bold transition-all shadow-md active:scale-98 cursor-pointer"
              title={isFromMontage ? "Fermer le lecteur et revenir au studio de montage" : "Fermer le lecteur et revenir à la liste des vidéos"}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>← {isFromMontage ? 'Revenir au montage' : 'Revenir à la liste des vidéos'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct Social & Universal Share Modal */}
      {shareModalOptions && (
        <ShareModal
          options={shareModalOptions}
          onClose={() => setShareModalOptions(null)}
        />
      )}

      {/* Replace Video Modal */}
      {showReplaceModal && (
        <ReplaceVideoModal
          paloId={paloId}
          paloName={paloName}
          sectionKey={sectionName.toLowerCase()}
          video={currentVideo}
          onClose={() => setShowReplaceModal(false)}
          onReplaced={() => {
            setShowReplaceModal(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};
