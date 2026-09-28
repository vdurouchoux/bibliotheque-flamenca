import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Bookmark, FileText, ChevronRight, ChevronLeft, Play, Pause, RotateCcw, FastForward, Rewind, Music, Sparkles, Edit3, Plus, Trash2, Check, Clock, Gauge, Smartphone, Copy, QrCode, Share2, AlertTriangle, Laptop, RefreshCw, MoreVertical, Volume2, Volume1, VolumeX } from 'lucide-react';
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

  const availability = checkVideoDeviceAvailability(currentVideo);
  const currentDevice = getCurrentDeviceType();

  const [notes, setNotes] = useState<string>(() => getVideoNotes(video.id));
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    const bookmarks = getBookmarks();
    return Boolean(bookmarks[video.id]);
  });
  const [status, setStatus] = useState<'to_learn' | 'learning' | 'mastered'>(() => {
    const bookmarks = getBookmarks();
    return bookmarks[video.id]?.status || 'learning';
  });
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
  
  // Stable starting timestamp (in seconds) for the video embed, preserved during playback
  const initialStartSecondsRef = useRef<number>(initialStart);
  // Current playback position for UI display (in seconds)
  const [currentPosition, setCurrentPosition] = useState<number>(initialStart);
  const currentTimeRef = useRef<number>(initialStart);
  const [playerKey, setPlayerKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlVideoRef = useRef<HTMLVideoElement>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [shareToastMessage, setShareToastMessage] = useState<string | null>(null);
  const [shareModalOptions, setShareModalOptions] = useState<ShareOptions | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isFromMontage = sectionName.toLowerCase().includes('montage');
  const [timeCopied, setTimeCopied] = useState<boolean>(false);

  const handleCopyTime = async () => {
    const mins = Math.floor(currentPosition / 60);
    const secs = (currentPosition % 60).toString().padStart(2, '0');
    const formatted = `${mins}:${secs}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formatted);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = formatted;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setTimeCopied(true);
      setTimeout(() => setTimeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy time to clipboard:', err);
    }
  };

  // Volume control state (persisted in localStorage)
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('flamenco_player_volume');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
      }
    } catch {}
    return 100;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const prevVolumeBeforeMute = useRef<number>(100);

  const applyVolume = (vol: number, muted: boolean) => {
    const effectiveVol = muted ? 0 : vol;
    if (htmlVideoRef.current) {
      htmlVideoRef.current.volume = effectiveVol / 100;
      htmlVideoRef.current.muted = muted || effectiveVol === 0;
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      if (muted || effectiveVol === 0) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'mute', args: [] }),
          '*'
        );
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
          '*'
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [effectiveVol] }),
          '*'
        );
      }
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    const willMute = newVol === 0;
    setIsMuted(willMute);
    applyVolume(newVol, willMute);
    try {
      localStorage.setItem('flamenco_player_volume', String(newVol));
    } catch {}
  };

  const toggleMute = () => {
    if (isMuted) {
      const restored = prevVolumeBeforeMute.current > 0 ? prevVolumeBeforeMute.current : 80;
      setIsMuted(false);
      setVolume(restored);
      applyVolume(restored, false);
      try {
        localStorage.setItem('flamenco_player_volume', String(restored));
      } catch {}
    } else {
      prevVolumeBeforeMute.current = volume > 0 ? volume : 80;
      setIsMuted(true);
      applyVolume(volume, true);
    }
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleShareVideo = () => {
    setIsMenuOpen(false);
    const opts = getVideoShareData({
      video,
      paloName,
      paloId,
      sectionName,
      currentTime: currentPosition,
      discipline: discipline || (isDance ? 'danse' : 'guitare')
    });
    setShareModalOptions(opts);
  };

  const tryPlayVideo = () => {
    if (htmlVideoRef.current) {
      htmlVideoRef.current.play().catch(() => {});
    } else if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
    }
  };

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'listening' }),
        '*'
      );
      applyVolume(volume, isMuted);
    }
    tryPlayVideo();
  };

  const changePlaybackSpeed = (rate: number) => {
    setPlaybackSpeed(rate);
    if (htmlVideoRef.current) {
      htmlVideoRef.current.playbackRate = rate;
    }
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
    if (htmlVideoRef.current) {
      if (htmlVideoRef.current.paused) {
        htmlVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        htmlVideoRef.current.pause();
        setIsPlaying(false);
      }
    } else if (iframeRef.current && iframeRef.current.contentWindow) {
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

  // Listen to YouTube player state events and progress without triggering iframe reloads
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'onReady') {
            tryPlayVideo();
            applyVolume(volume, isMuted);
          } else if (data.event === 'onStateChange') {
            if (data.info === 1) setIsPlaying(true);
            else if (data.info === 2 || data.info === 0) setIsPlaying(false);
          } else if (data.event === 'infoDelivery' && data.info) {
            if (data.info.playerState === 1) setIsPlaying(true);
            else if (data.info.playerState === 2 || data.info.playerState === 0) setIsPlaying(false);
            if (typeof data.info.currentTime === 'number') {
              const sec = Math.floor(data.info.currentTime);
              currentTimeRef.current = sec;
              if (Math.abs(sec - currentPosition) >= 1) {
                setCurrentPosition(sec);
              }
            }
          }
        }
      } catch {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentPosition]);

  // Stable tracking of active video ID & URL to prevent unnecessary resets
  const prevVideoIdRef = useRef(video.id);
  const prevUrlRef = useRef(video.url);

  useEffect(() => {
    if (prevVideoIdRef.current !== video.id || prevUrlRef.current !== video.url) {
      prevVideoIdRef.current = video.id;
      prevUrlRef.current = video.url;
      setCurrentVideo(video);

      const start = video.startSeconds !== undefined ? Math.max(0, video.startSeconds) : 0;
      initialStartSecondsRef.current = start;
      currentTimeRef.current = start;
      setCurrentPosition(start);
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
  }, [video]);

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
    currentTimeRef.current = sec;
    setCurrentPosition(sec);
    setIsPlaying(true);
    if (htmlVideoRef.current) {
      htmlVideoRef.current.currentTime = sec;
      htmlVideoRef.current.play().catch(() => {});
    } else if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [sec, true] }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
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
    const secs = newLmTime ? parseTimeToSeconds(newLmTime) : currentPosition;
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
    const currentActualTime = htmlVideoRef.current 
      ? htmlVideoRef.current.currentTime 
      : currentTimeRef.current;
    const newTime = Math.max(0, currentActualTime + deltaSeconds);
    handleJumpToTime(Math.floor(newTime));
  };

  const handleRewind = (deltaSeconds: number) => {
    const currentActualTime = htmlVideoRef.current 
      ? htmlVideoRef.current.currentTime 
      : currentTimeRef.current;
    const newTime = Math.max(0, currentActualTime - deltaSeconds);
    handleJumpToTime(Math.floor(newTime));
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

  const isHtml5Video = !videoId && Boolean(
    currentVideo.url && (
      currentVideo.url.startsWith('blob:') ||
      currentVideo.url.startsWith('data:video') ||
      currentVideo.url.startsWith('/') ||
      /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(currentVideo.url) ||
      (!currentVideo.url.includes('youtube.com') && !currentVideo.url.includes('youtu.be'))
    )
  );

  const handleLoadedMetadata = () => {
    if (htmlVideoRef.current) {
      if (initialStartSecondsRef.current > 0) {
        htmlVideoRef.current.currentTime = initialStartSecondsRef.current;
      }
      if (playbackSpeed !== 1) {
        htmlVideoRef.current.playbackRate = playbackSpeed;
      }
      htmlVideoRef.current.volume = isMuted ? 0 : volume / 100;
      htmlVideoRef.current.muted = isMuted || volume === 0;
    }
  };

  const handleNativeTimeUpdate = () => {
    if (htmlVideoRef.current) {
      const sec = Math.floor(htmlVideoRef.current.currentTime);
      currentTimeRef.current = sec;
      if (Math.abs(sec - currentPosition) >= 1) {
        setCurrentPosition(sec);
      }
    }
  };

  // The iframe src remains completely stable during playback so it never reloads the video automatically
  const iframeSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=${initialStartSecondsRef.current}&enablejsapi=1&rel=0&playsinline=1&controls=1&iv_load_policy=3${typeof window !== 'undefined' && window.location?.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : ''}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181512] border border-[#383129] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-[#1e1a16] border-b border-[#2e2720] gap-2">
          {/* Gauche : Bouton Retour, Nom du fichier actif et détails */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            {/* Bouton retour (remplace la croix pour fermer le lecteur) */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2b2216] hover:bg-[#3d301f] text-[#f4efe6] hover:text-[#e5a93b] border border-[#443522] hover:border-[#e5a93b]/50 text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
              title="Retour (fermer le lecteur)"
            >
              <ChevronLeft className="w-4 h-4 text-[#e5a93b]" />
              <span className="text-xs">Retour</span>
            </button>

            {/* Nom du fichier de la page */}
            <div
              className="px-2 py-1 rounded bg-[#14110e] border border-[#e5a93b]/70 text-[#e5a93b] font-mono text-[10px] sm:text-xs font-bold tracking-tight shadow-sm flex items-center gap-1 shrink-0 whitespace-nowrap"
              title="Fichier de ce composant : VideoPlayerModal.tsx"
            >
              <span className="text-[10px] sm:text-xs opacity-90 select-none">📄</span>
              <span>VideoPlayerModal.tsx</span>
            </div>

            {/* Titre du palo et de la section */}
            <span className="text-[11px] sm:text-xs text-[#a69c8f] truncate font-medium hidden md:inline ml-1">
              {paloName} • {sectionName}
            </span>
          </div>

          {/* Droite : Menu 3 petits points avec Partager et Lire sur YouTube */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-[#2b2216] hover:bg-[#3d301f] text-[#e5a93b] hover:text-[#fff] border border-[#4d3a24] text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center"
              title="Options (Partager, YouTube...)"
              aria-label="Options"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-[#1e1a16] border border-[#4a3c2b] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Option 1 : Partager */}
                <button
                  onClick={handleShareVideo}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#f4efe6] hover:text-[#e5a93b] hover:bg-[#2b2218] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#e5a93b] shrink-0" />
                  <div className="flex flex-col">
                    <span>Partager la vidéo</span>
                    <span className="text-[10px] text-[#8c8173] font-normal">Lien web, QR code, WhatsApp...</span>
                  </div>
                </button>

                <div className="my-1 border-t border-[#332a20]" />

                {/* Option 2 : Lire sur YouTube à la position du repère */}
                {video.url ? (
                  <a
                    href={currentPosition > 0 ? `${video.url}${video.url.includes('?') ? '&' : '?'}t=${currentPosition}s` : video.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#f4efe6] hover:text-[#e5a93b] hover:bg-[#2b2218] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-[#e5a93b] shrink-0" />
                    <div className="flex flex-col">
                      <span>Lire sur YouTube à la position du repère</span>
                      <span className="text-[10px] text-[#8c8173] font-mono">
                        {currentPosition > 0 ? `Minutage : ${Math.floor(currentPosition / 60)}:${(currentPosition % 60).toString().padStart(2, '0')}` : 'Depuis le début'}
                      </span>
                    </div>
                  </a>
                ) : null}
              </div>
            )}
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
              src={iframeSrc}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : isHtml5Video ? (
            <video
              ref={htmlVideoRef}
              controls
              playsInline
              autoPlay
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleNativeTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
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
        <div className="px-2.5 sm:px-4 py-2 bg-[#171410] border-b border-[#2d261e] flex items-center gap-1.5 sm:gap-2 text-xs">
          {/* Boutons d'avance / recul rapide */}
          <button
            onClick={() => handleRewind(10)}
            className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322a22] text-[#d4c9ba] border border-[#3b3228] transition-colors cursor-pointer text-[11px] sm:text-xs shrink-0"
            title="Reculer de 10s"
          >
            <Rewind className="w-3.5 h-3.5 text-[#e5a93b]" />
            <span>-10s</span>
          </button>

          <button
            onClick={() => handleSkipForward(10)}
            className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322a22] text-[#d4c9ba] border border-[#3b3228] transition-colors cursor-pointer text-[11px] sm:text-xs shrink-0"
            title="Avancer de 10s"
          >
            <FastForward className="w-3.5 h-3.5 text-[#e5a93b]" />
            <span>+10s</span>
          </button>

          <button
            onClick={() => handleSkipForward(30)}
            className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322a22] text-[#b8ada0] border border-[#352e25] transition-colors cursor-pointer text-[11px] sm:text-xs shrink-0"
            title="Avancer de 30s"
          >
            <FastForward className="w-3.5 h-3.5 text-[#e5a93b]" />
            <span>+30s</span>
          </button>

          {/* Bouton Copier le temps compact */}
          <button
            type="button"
            onClick={handleCopyTime}
            className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer shadow-sm select-none shrink-0 ${
              timeCopied
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-400/40'
                : !isPlaying
                ? 'bg-gradient-to-r from-[#332414] to-[#453018] hover:from-[#3f2c18] hover:to-[#543b1e] text-[#fcd34d] border border-[#e5a93b]'
                : 'bg-[#1e1913] hover:bg-[#282119] text-[#d4c9ba] border border-[#3b3024]'
            }`}
            title={
              timeCopied
                ? "Temps copié dans le presse-papier !"
                : !isPlaying
                ? "Vidéo en pause : Cliquer pour copier ce temps"
                : "Position actuelle"
            }
          >
            {timeCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="font-mono text-emerald-300 font-bold text-[11px]">
                  {Math.floor(currentPosition / 60)}:{(currentPosition % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] bg-emerald-500/25 text-emerald-300 px-1 py-0.5 rounded font-extrabold uppercase tracking-wide">
                  Copié !
                </span>
              </>
            ) : !isPlaying ? (
              <>
                <Copy className="w-3 h-3 text-[#e5a93b] shrink-0" />
                <span className="font-mono text-[#fcd34d] font-bold text-[11px]">
                  {Math.floor(currentPosition / 60)}:{(currentPosition % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] bg-[#e5a93b] text-[#121110] px-1 py-0.5 rounded font-extrabold uppercase tracking-wide">
                  Copier
                </span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-[#e5a93b] shrink-0" />
                <span className="font-mono text-[#e5a93b] font-medium text-[11px]">
                  {Math.floor(currentPosition / 60)}:{(currentPosition % 60).toString().padStart(2, '0')}
                </span>
              </>
            )}
          </button>

          {/* Bouton Lecture / Pause : Pause serré à droite lors de la lecture avec sa taille conservée */}
          <button
            onClick={togglePlayPause}
            className={`flex flex-col items-center justify-center rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-md shrink-0 active:scale-95 ${
              isPlaying
                ? 'bg-[#261f18] hover:bg-[#34291f] text-[#f4efe6] border-[#483726] w-20 sm:w-26 h-13 sm:h-14 ml-auto'
                : 'bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] border-[#e5a93b] w-14 h-13 sm:w-16 sm:h-14'
            }`}
            title={isPlaying ? "Mettre en pause la vidéo" : "Lancer la vidéo"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-[#f4efe6]" />
                <span className="text-[10px] sm:text-[11px] font-bold leading-none mt-0.5 text-[#f4efe6]">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                <span className="text-[10px] sm:text-[11px] font-bold leading-none mt-0.5">Lecture</span>
              </>
            )}
          </button>
        </div>

        {/* Bouton / Régulateur de volume au-dessus de Ralenti et sur toute la largeur de la page */}
        <div className="px-3 sm:px-4 py-2 bg-[#15120e] border-b border-[#2d261e] flex items-center gap-2.5 text-xs w-full">
          <button
            type="button"
            onClick={toggleMute}
            className="text-[#e5a93b] hover:text-[#f5b84c] p-1 rounded-lg hover:bg-[#25201b] transition-colors cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
            title={isMuted || volume === 0 ? "Réactiver le son" : "Couper le son (Muet)"}
            aria-label={isMuted || volume === 0 ? "Réactiver le son" : "Couper le son"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : volume < 50 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
            className="flex-1 w-full h-2 bg-[#332a20] rounded-lg appearance-none cursor-pointer accent-[#e5a93b] focus:outline-none"
            aria-label="Régulateur de volume sonore pleine largeur"
          />

          <span className="font-mono text-xs text-[#e5a93b] font-semibold min-w-[34px] text-right select-none shrink-0">
            {isMuted ? '0%' : `${volume}%`}
          </span>
        </div>

        {/* Régulateur de vitesse de lecture pleine largeur (remplace Ralenti) */}
        <div className="px-3 sm:px-4 py-2 bg-[#13100d] border-b border-[#29221a] flex items-center gap-2 sm:gap-2.5 text-xs w-full">
          <div className="flex items-center gap-1.5 shrink-0 text-[#e5a93b]">
            <Gauge className="w-4 h-4 text-[#e5a93b]" />
            <span className="font-semibold text-xs text-[#e5a93b] hidden xs:inline">Vitesse :</span>
          </div>

          <input
            type="range"
            min="0.25"
            max="2"
            step="0.05"
            list="speed-ticks"
            value={playbackSpeed}
            onDoubleClick={() => changePlaybackSpeed(1)}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              // Aimant automatique sur 1x entre 0.94 et 1.06
              const finalVal = Math.abs(val - 1) <= 0.06 ? 1 : val;
              changePlaybackSpeed(finalVal);
            }}
            className="flex-1 w-full h-2 bg-[#332a20] rounded-lg appearance-none cursor-pointer accent-[#e5a93b] focus:outline-none"
            aria-label="Régulateur de vitesse de lecture pleine largeur"
            title="Glisser pour ajuster la vitesse (double-clic pour 1x)"
          />
          <datalist id="speed-ticks">
            <option value="1"></option>
          </datalist>

          {/* Bouton remise à 1x rapide */}
          <button
            type="button"
            onClick={() => changePlaybackSpeed(1)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${
              playbackSpeed !== 1
                ? 'bg-[#e5a93b] hover:bg-[#f5b84c] text-[#121110] shadow-sm active:scale-95 animate-pulse'
                : 'bg-[#221c16] hover:bg-[#2c241c] text-[#a89b8c] border border-[#382d22]'
            }`}
            title="Remettre immédiatement la vitesse normale (1x)"
            aria-label="Remettre à 1x"
          >
            <RotateCcw className={`w-3 h-3 ${playbackSpeed !== 1 ? 'text-[#121110]' : 'text-[#a89b8c]'}`} />
            <span>1x</span>
          </button>

          <button
            type="button"
            onClick={() => changePlaybackSpeed(1)}
            className="font-mono text-xs text-[#e5a93b] hover:text-[#fcd34d] font-semibold min-w-[38px] text-right select-none shrink-0 cursor-pointer"
            title="Cliquer pour réinitialiser à 1x"
          >
            {Number(playbackSpeed.toFixed(2))}x
          </button>
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
                  const isCurrent = Math.abs(currentPosition - lm.timeSeconds) < 4;
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
                        placeholder={formatSecondsToMinutes(currentPosition)}
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
                    💡 Astuce : laissez le temps vide pour utiliser automatiquement la position courante du lecteur ({formatSecondsToMinutes(currentPosition)}).
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
              title={isFromMontage ? "Fermer le lecteur et revenir à l'atelier de création" : "Fermer le lecteur et revenir à la liste des vidéos"}
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
