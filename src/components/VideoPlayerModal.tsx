import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Bookmark, FileText, ChevronRight, ChevronLeft, Play, Pause, RotateCcw, FastForward, Rewind, Music, Sparkles, Edit3, Plus, Trash2, Check, Clock, Gauge, Smartphone, Copy, QrCode, Share2, AlertTriangle, Laptop, RefreshCw, MoreVertical, Volume2, Volume1, VolumeX, Search, Repeat } from 'lucide-react';
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
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newLmTitle, setNewLmTitle] = useState<string>('');
  const [newLmStartTime, setNewLmStartTime] = useState<string>('');
  const [newLmEndTime, setNewLmEndTime] = useState<string>('');
  const [editingLmIndex, setEditingLmIndex] = useState<number | null>(null);
  const [editLmTitle, setEditLmTitle] = useState<string>('');
  const [editLmStartTime, setEditLmStartTime] = useState<string>('');
  const [editLmEndTime, setEditLmEndTime] = useState<string>('');
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [selectedLandmarkIndex, setSelectedLandmarkIndex] = useState<number | null>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);

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

  const pauseVideo = () => {
    if (htmlVideoRef.current) {
      htmlVideoRef.current.pause();
    } else if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      );
    }
    setIsPlaying(false);
  };

  const resumeVideo = () => {
    if (htmlVideoRef.current) {
      htmlVideoRef.current.play().catch(() => {});
    } else if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
    }
    setIsPlaying(true);
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
      setShowAddForm(false);
      setEditingLmIndex(null);
      setActiveDropdownIndex(null);
      setSelectedLandmarkIndex(0);
      setIsLooping(false);

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

  useEffect(() => {
    if (activeDropdownIndex === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.landmark-dropdown-area')) {
        setActiveDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownIndex]);

  // Repère sélectionné ou actif pour la lecture en boucle
  const currentLandmarkIndex = selectedLandmarkIndex !== null && landmarks[selectedLandmarkIndex]
    ? selectedLandmarkIndex
    : (landmarks.length > 0 ? 0 : null);

  const activeLoopLandmark = currentLandmarkIndex !== null ? landmarks[currentLandmarkIndex] : null;

  const canLoop = Boolean(
    activeLoopLandmark &&
    typeof activeLoopLandmark.endTimeSeconds === 'number' &&
    activeLoopLandmark.endTimeSeconds > activeLoopLandmark.timeSeconds
  );

  const handleToggleLoopForLandmark = (idx: number) => {
    const lm = landmarks[idx];
    if (!lm || typeof lm.endTimeSeconds !== 'number' || lm.endTimeSeconds <= lm.timeSeconds) {
      return;
    }

    // Si la boucle est déjà active pour CE repère, on la désactive
    if (isLooping && selectedLandmarkIndex === idx) {
      setIsLooping(false);
      return;
    }

    // Sinon, on active la boucle pour ce repère
    setSelectedLandmarkIndex(idx);
    setIsLooping(true);

    const curTime = htmlVideoRef.current 
      ? htmlVideoRef.current.currentTime 
      : (currentTimeRef.current ?? currentPosition);

    if (curTime < lm.timeSeconds || curTime >= lm.endTimeSeconds) {
      handleJumpToTime(lm.timeSeconds);
    } else if (!isPlaying) {
      resumeVideo();
    }
  };

  // Surveillance continue du repère pour boucler instantanément au temps de fin
  useEffect(() => {
    if (!isLooping || !activeLoopLandmark || !activeLoopLandmark.endTimeSeconds) return;
    const interval = setInterval(() => {
      const curTime = htmlVideoRef.current 
        ? htmlVideoRef.current.currentTime 
        : currentTimeRef.current;
      if (curTime >= activeLoopLandmark.endTimeSeconds!) {
        handleJumpToTime(activeLoopLandmark.timeSeconds);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isLooping, activeLoopLandmark]);

  const handleSaveLandmarks = (updated: VideoLandmark[]) => {
    // Sort by timestamp
    const sorted = [...updated].sort((a, b) => a.timeSeconds - b.timeSeconds);
    setLandmarks(sorted);
    saveVideoCustomLandmarks(video.id, sorted, video.url);
  };

  const handleAddLandmark = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newLmTitle.trim()) return;
    const startSec = newLmStartTime.trim() ? parseTimeToSeconds(newLmStartTime) : currentPosition;
    const endSec = newLmEndTime.trim() ? parseTimeToSeconds(newLmEndTime) : undefined;
    const formattedStart = formatSecondsToMinutes(startSec);
    const cleanTitle = newLmTitle.trim();
    const label = `${formattedStart} - ${cleanTitle}`;
    
    const newLm: VideoLandmark = {
      timeSeconds: startSec,
      endTimeSeconds: endSec !== undefined && endSec > 0 ? endSec : undefined,
      label: label
    };
    const updated = [...landmarks, newLm];
    handleSaveLandmarks(updated);
    setNewLmTitle('');
    setNewLmStartTime('');
    setNewLmEndTime('');
    setShowAddForm(false);
  };

  const handleStartEditLandmark = (index: number) => {
    setEditingLmIndex(index);
    const lm = landmarks[index];
    setEditLmStartTime(formatSecondsToMinutes(lm.timeSeconds));
    setEditLmEndTime(lm.endTimeSeconds ? formatSecondsToMinutes(lm.endTimeSeconds) : '');
    const titleOnly = lm.label.includes(' - ') ? lm.label.split(' - ').slice(1).join(' - ') : lm.label;
    setEditLmTitle(titleOnly);
  };

  const handleSaveEditLandmark = (index: number) => {
    if (!editLmTitle.trim()) return;
    const startSec = parseTimeToSeconds(editLmStartTime);
    const endSec = editLmEndTime.trim() ? parseTimeToSeconds(editLmEndTime) : undefined;
    const formattedStart = formatSecondsToMinutes(startSec);
    const cleanTitle = editLmTitle.trim() || 'Repère';
    const label = `${formattedStart} - ${cleanTitle}`;

    const updated = [...landmarks];
    updated[index] = {
      ...updated[index],
      timeSeconds: startSec,
      endTimeSeconds: endSec !== undefined && endSec > 0 ? endSec : undefined,
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
      setShowAddForm(false);
      setEditingLmIndex(null);
      setActiveDropdownIndex(null);
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

  // Détection du type de vidéo et génération de l'URL d'intégration directe (YouTube, Drive, Vimeo, Dailymotion, HTML5)
  const getEmbedInfo = (url: string) => {
    if (!url) return { type: 'none', embedSrc: '', isDirect: false };

    // 1. YouTube
    if (videoId) {
      const origin = typeof window !== 'undefined' && window.location?.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
      return {
        type: 'youtube',
        embedSrc: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=${initialStartSecondsRef.current}&enablejsapi=1&rel=0&playsinline=1&controls=1&iv_load_policy=3${origin}`,
        isDirect: false
      };
    }

    // 2. Google Drive preview embed
    const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return {
        type: 'drive',
        embedSrc: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
        isDirect: false
      };
    }

    // 3. Vimeo embed
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        embedSrc: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
        isDirect: false
      };
    }

    // 4. Dailymotion embed
    const dmMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    if (dmMatch) {
      return {
        type: 'dailymotion',
        embedSrc: `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=1`,
        isDirect: false
      };
    }

    // 5. Fichiers vidéo directs (MP4, WebM, OGG, MOV, blob, base64)
    const isDirect = Boolean(
      url.startsWith('blob:') ||
      url.startsWith('data:video') ||
      url.startsWith('/') ||
      /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url)
    );

    if (isDirect) {
      return {
        type: 'html5',
        embedSrc: url,
        isDirect: true
      };
    }

    // 6. Autre lien web : on tente l'intégration dans l'iframe
    return {
      type: 'generic_iframe',
      embedSrc: url,
      isDirect: false
    };
  };

  const embedInfo = getEmbedInfo(currentVideo.url);
  const isHtml5Video = embedInfo.isDirect;
  const iframeSrc = embedInfo.embedSrc;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
      <div className="bg-[#181512] border border-[#383129] rounded-2xl w-full max-w-3xl max-h-[96vh] sm:max-h-[94vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-[#1e1a16] border-b border-[#2e2720] gap-2 shrink-0">
          {/* Gauche : Bouton Retour et Titre de la vidéo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            {/* Bouton retour (remplace la croix pour fermer le lecteur) */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2b2216] hover:bg-[#3d301f] text-[#f4efe6] hover:text-[#10b981] border border-[#443522] hover:border-[#10b981]/50 text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
              title="Retour (fermer le lecteur)"
            >
              <ChevronLeft className="w-4 h-4 text-[#10b981]" />
              <span className="text-xs">Retour</span>
            </button>

            {/* Titre de la vidéo */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <h1 className="text-xs sm:text-sm font-bold text-[#f4efe6] font-serif truncate" title={video.title}>
                {video.title}
              </h1>
              <span className="text-[11px] sm:text-xs text-[#a69c8f] truncate font-medium hidden md:inline shrink-0">
                • {paloName}
              </span>
            </div>
          </div>

          {/* Droite : Menu 3 petits points avec Enregistrer, Partager, YouTube... */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-[#2b2216] hover:bg-[#3d301f] text-[#10b981] hover:text-[#fff] border border-[#4d3a24] text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center"
              title="Options (Enregistrer, Partager, YouTube...)"
              aria-label="Options"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-[#1e1a16] border border-[#4a3c2b] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Option 1 : Enregistrer / Ajouter à mes études */}
                <button
                  onClick={() => {
                    handleBookmarkToggle();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-[#2b2218] flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isSaved ? 'text-[#10b981]' : 'text-[#f4efe6] hover:text-[#10b981]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 text-[#10b981] shrink-0 ${isSaved ? 'fill-current' : ''}`} />
                  <div className="flex flex-col">
                    <span>{isSaved ? 'Enregistré dans mes études' : 'Ajouter à mes études'}</span>
                    <span className="text-[10px] text-[#8c8173] font-normal">
                      {isSaved ? 'Cliquer pour retirer de vos études' : 'Enregistrer pour vos sessions de pratique'}
                    </span>
                  </div>
                </button>

                <div className="my-1 border-t border-[#332a20]" />

                {/* Option 2 : Partager */}
                <button
                  onClick={handleShareVideo}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#f4efe6] hover:text-[#10b981] hover:bg-[#2b2218] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#10b981] shrink-0" />
                  <div className="flex flex-col">
                    <span>Partager la vidéo</span>
                    <span className="text-[10px] text-[#8c8173] font-normal">Lien web, QR code, WhatsApp...</span>
                  </div>
                </button>

                <div className="my-1 border-t border-[#332a20]" />

                {/* Option 3 : Lire sur YouTube à la position actuelle */}
                {video.url ? (
                  <a
                    href={currentPosition > 0 ? `${video.url}${video.url.includes('?') ? '&' : '?'}t=${currentPosition}s` : video.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#f4efe6] hover:text-[#10b981] hover:bg-[#2b2218] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-[#10b981] shrink-0" />
                    <div className="flex flex-col">
                      <span>
                        Lire sur YouTube à la position actuelle ({Math.floor(currentPosition / 60)}:{(currentPosition % 60).toString().padStart(2, '0')})
                      </span>
                      <span className="text-[10px] text-[#8c8173] font-mono">
                        {currentPosition > 0 ? `Minutage : ${Math.floor(currentPosition / 60)}:${(currentPosition % 60).toString().padStart(2, '0')}` : 'Depuis le début'}
                      </span>
                    </div>
                  </a>
                ) : null}

                <div className="my-1 border-t border-[#332a20]" />

                {/* Option 4 : Rechercher des vidéos similaires */}
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchKeywords)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#f4efe6] hover:text-[#10b981] hover:bg-[#2b2218] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#10b981] shrink-0" />
                  <div className="flex flex-col">
                    <span>Rechercher des vidéos similaires</span>
                    <span className="text-[10px] text-[#8c8173] font-normal">Sur YouTube</span>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Share notification toast */}
        {shareToastMessage && (
          <div className="px-4 py-2 bg-[#0d2217] border-b border-[#10b981]/50 text-[#10b981] text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10b981] shrink-0" />
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
        <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center shrink-0">
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
                  className="px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#34d399] text-[#061a0e] font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Remplacer par un lien YouTube / web</span>
                </button>
              </div>
            </div>
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
              src={embedInfo.embedSrc || currentVideo.url}
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
          ) : iframeSrc ? (
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
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-[#a69c8f]">
              <p className="text-sm">Vidéo externe.</p>
              {currentVideo.url && (
                <a
                  href={currentVideo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10b981] text-[#061a0e] font-bold text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir le lien</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Playback Controls Bar */}
        <div className="px-2.5 sm:px-4 py-2 bg-[#171410] border-b border-[#2d261e] flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
          {/* Boutons d'avance / recul rapide */}
          <button
            onClick={() => handleRewind(10)}
            className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322a22] text-[#d4c9ba] border border-[#3b3228] transition-colors cursor-pointer text-[11px] sm:text-xs shrink-0"
            title="Reculer de 10s"
          >
            <Rewind className="w-3.5 h-3.5 text-[#10b981]" />
            <span>-10s</span>
          </button>

          <button
            onClick={() => handleSkipForward(10)}
            className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322a22] text-[#d4c9ba] border border-[#3b3228] transition-colors cursor-pointer text-[11px] sm:text-xs shrink-0"
            title="Avancer de 10s"
          >
            <FastForward className="w-3.5 h-3.5 text-[#10b981]" />
            <span>+10s</span>
          </button>

          <button
            onClick={() => handleSkipForward(30)}
            className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg bg-[#25201b] hover:bg-[#322a22] text-[#b8ada0] border border-[#352e25] transition-colors cursor-pointer text-[11px] sm:text-xs shrink-0"
            title="Avancer de 30s"
          >
            <FastForward className="w-3.5 h-3.5 text-[#10b981]" />
            <span>+30s</span>
          </button>

          {/* Bouton Copier le temps diminué / compact */}
          <button
            type="button"
            onClick={handleCopyTime}
            className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer shadow-sm select-none shrink-0 ${
              timeCopied
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-400/40'
                : !isPlaying
                ? 'bg-gradient-to-r from-[#0d2818] to-[#133d24] hover:from-[#113520] hover:to-[#1a4d2e] text-[#6ee7b7] border border-[#10b981]'
                : 'bg-[#1e1913] hover:bg-[#282119] text-[#d4c9ba] border border-[#3b3024]'
            }`}
            title={
              timeCopied
                ? "Temps copié dans le presse-papier !"
                : !isPlaying
                ? "Vidéo en pause : Cliquer pour copier ce temps"
                : "Position actuelle (cliquer pour copier)"
            }
          >
            {timeCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="font-mono text-emerald-300 font-bold text-[11px]">
                  {Math.floor(currentPosition / 60)}:{(currentPosition % 60).toString().padStart(2, '0')}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#10b981] shrink-0" />
                <span className="font-mono text-[#6ee7b7] font-bold text-[11px]">
                  {Math.floor(currentPosition / 60)}:{(currentPosition % 60).toString().padStart(2, '0')}
                </span>
              </>
            )}
          </button>

          {/* Bouton Lecture / Pause ramené sur la gauche (sans ml-auto pour éviter d'être tronqué à droite) */}
          <button
            onClick={togglePlayPause}
            className={`flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-md shrink-0 active:scale-95 px-3 h-8.5 min-w-[80px] ${
              isPlaying
                ? 'bg-[#261f18] hover:bg-[#34291f] text-[#f4efe6] border-[#483726]'
                : 'bg-[#10b981] hover:bg-[#34d399] text-[#061a0e] border-[#10b981]'
            }`}
            title={isPlaying ? "Mettre en pause la vidéo" : "Lancer la vidéo"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current text-[#f4efe6]" />
                <span className="text-[11px] font-bold text-[#f4efe6]">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span className="text-[11px] font-bold">Lecture</span>
              </>
            )}
          </button>
        </div>

        {/* Ligne 1 : Régulateur de Volume */}
        <div className="px-3 sm:px-4 py-1 bg-[#15120e] border-b border-[#29221a] flex items-center text-xs w-full shrink-0">
          <div className="w-full flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={toggleMute}
              className="text-[#10b981] hover:text-[#34d399] p-0.5 rounded hover:bg-[#25201b] transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title={isMuted || volume === 0 ? "Réactiver le son" : "Couper le son (Muet)"}
              aria-label={isMuted || volume === 0 ? "Réactiver le son" : "Couper le son"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : volume < 50 ? (
                <Volume1 className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="flex-1 w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none range-slider-green-translucent"
              aria-label="Volume"
            />
            <span className="font-mono text-[11px] text-[#10b981] font-semibold min-w-[34px] text-right select-none shrink-0">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
        </div>

        {/* Ligne 2 : Régulateur de Vitesse */}
        <div className="px-3 sm:px-4 py-1 bg-[#13100d] border-b border-[#29221a] flex items-center text-xs w-full shrink-0">
          <div className="w-full flex items-center gap-2 sm:gap-2.5">
            <div className="flex items-center shrink-0 text-[#10b981]" title="Vitesse de lecture">
              <Gauge className="w-3.5 h-3.5 text-[#10b981]" />
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
                const finalVal = Math.abs(val - 1) <= 0.06 ? 1 : val;
                changePlaybackSpeed(finalVal);
              }}
              className="flex-1 w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none range-slider-green-translucent"
              aria-label="Vitesse"
              title="Glisser pour ajuster la vitesse (double-clic pour 1x)"
            />
            <datalist id="speed-ticks">
              <option value="1"></option>
            </datalist>

            <button
              type="button"
              onClick={() => changePlaybackSpeed(1)}
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer select-none shrink-0 ${
                playbackSpeed !== 1
                  ? 'bg-[#10b981] hover:bg-[#34d399] text-[#061a0e] active:scale-95'
                  : 'bg-[#221c16] hover:bg-[#2c241c] text-[#a89b8c] border border-[#382d22]'
              }`}
              title="Remettre à 1x"
            >
              <RotateCcw className="w-2.5 h-2.5 mr-0.5" />
              <span>1x</span>
            </button>
            <span className="font-mono text-[11px] text-[#10b981] font-semibold min-w-[34px] text-right select-none shrink-0">
              {Number(playbackSpeed.toFixed(2))}x
            </span>
          </div>
        </div>

        {/* Ligne blanche fine et plus basse pour séparer les contrôles de la vidéo et la liste des repères */}
        <div className="w-full px-3 sm:px-4 mt-3 mb-1 shrink-0">
          <div className="w-full h-[1px] bg-white/40" aria-hidden="true" />
        </div>

        {/* Video Info & Practice Tools (Liste des repères, Notes, etc. - défilement indépendant) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 overscroll-contain">
          {/* Interactive Landmarks (Liste des repères) */}
          <div className="p-3 bg-[#171410] border border-[#302820] rounded-xl space-y-2.5">
            {/* Header of landmarks section */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#f4efe6]">
                <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Liste des repères</span>
                <span className="text-[11px] font-normal text-[#8c8173] ml-0.5">
                  ({landmarks.length})
                </span>
              </div>

              {/* Bouton Ajouter un repère (carré avec un plus au milieu et fond vert) */}
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(prev => !prev);
                  setNewLmStartTime(formatSecondsToMinutes(currentPosition));
                  setNewLmEndTime('');
                  setNewLmTitle('');
                }}
                className="w-7 h-7 rounded-lg bg-[#10b981] hover:bg-[#34d399] text-[#061a0e] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                title="Ajouter un repère"
                aria-label="Ajouter un repère"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Formulaire d'ajout d'un repère (Début + Fin optionnelle) */}
            {showAddForm && (
              <form onSubmit={handleAddLandmark} className="p-3 rounded-xl bg-[#0e2117] border border-[#10b981]/60 space-y-2.5 animate-in fade-in duration-150">
                <div className="text-xs font-bold text-[#10b981] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouveau repère</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-[#8c8173] hover:text-[#f4efe6] p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] text-[#a69c8f] mb-0.5">Nom du repère *</label>
                    <input
                      type="text"
                      required
                      value={newLmTitle}
                      onChange={e => setNewLmTitle(e.target.value)}
                      placeholder="ex: Primera Letra, Llamada du milieu, Marcaje..."
                      className="w-full px-2.5 py-1.5 bg-[#14110e] border border-[#382d22] rounded-lg text-xs text-[#f4efe6] focus:outline-none focus:border-[#10b981]"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#a69c8f] mb-0.5">Temps de début *</label>
                      <input
                        type="text"
                        value={newLmStartTime}
                        onChange={e => setNewLmStartTime(e.target.value)}
                        placeholder={formatSecondsToMinutes(currentPosition)}
                        className="w-full px-2.5 py-1.5 bg-[#14110e] border border-[#382d22] rounded-lg text-xs text-[#f4efe6] font-mono focus:outline-none focus:border-[#10b981]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#a69c8f] mb-0.5">Temps de fin (optionnel)</label>
                      <input
                        type="text"
                        value={newLmEndTime}
                        onChange={e => setNewLmEndTime(e.target.value)}
                        placeholder="ex: 2:05 (laisser vide si aucun)"
                        className="w-full px-2.5 py-1.5 bg-[#14110e] border border-[#382d22] rounded-lg text-xs text-[#f4efe6] font-mono focus:outline-none focus:border-[#10b981]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-2.5 py-1 rounded-lg bg-[#28211a] hover:bg-[#332b22] text-[#a69c8f] hover:text-[#f4efe6] text-xs cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!newLmTitle.trim()}
                    className="px-3 py-1 rounded-lg bg-[#10b981] hover:bg-[#34d399] disabled:opacity-50 text-[#061a0e] font-bold text-xs cursor-pointer shadow-sm"
                  >
                    Valider le repère
                  </button>
                </div>
              </form>
            )}

            {/* Liste des repères avec menu 3 petits points */}
            {landmarks.length > 0 ? (
              <div className="space-y-1.5 pt-0.5">
                {landmarks.map((lm, idx) => {
                  const isEditingThis = editingLmIndex === idx;
                  const isCurrent = Math.abs(currentPosition - lm.timeSeconds) < 4;
                  const curTime = htmlVideoRef.current 
                    ? htmlVideoRef.current.currentTime 
                    : (currentTimeRef.current ?? currentPosition);
                  const hasEndTime = typeof lm.endTimeSeconds === 'number' && lm.endTimeSeconds > lm.timeSeconds;
                  const isWithinLandmark = hasEndTime 
                    ? (curTime >= lm.timeSeconds && curTime < lm.endTimeSeconds)
                    : true;
                  const startMin = Math.floor(lm.timeSeconds / 60);
                  const startSec = (lm.timeSeconds % 60).toString().padStart(2, '0');
                  const timeDisplay = lm.endTimeSeconds
                    ? `${startMin}:${startSec} - ${Math.floor(lm.endTimeSeconds / 60)}:${(lm.endTimeSeconds % 60).toString().padStart(2, '0')}`
                    : `${startMin}:${startSec}`;
                  const displayTitle = lm.label.includes(' - ') ? lm.label.split(' - ').slice(1).join(' - ') : lm.label;

                  const isThisLandmarkLooping = isLooping && selectedLandmarkIndex === idx;

                  if (isEditingThis) {
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-[#0e2117] border-2 border-[#10b981] space-y-2.5 animate-in fade-in duration-100">
                        <div className="text-xs font-bold text-[#10b981] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Modifier le repère</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingLmIndex(null)}
                            className="text-[#8c8173] hover:text-[#f4efe6]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] text-[#a69c8f] mb-0.5">Nom du repère *</label>
                            <input
                              type="text"
                              value={editLmTitle}
                              onChange={e => setEditLmTitle(e.target.value)}
                              placeholder="Nom du repère"
                              className="w-full px-2.5 py-1.5 bg-[#14110e] border border-[#382d22] rounded-lg text-xs text-[#f4efe6] focus:outline-none focus:border-[#10b981]"
                              autoFocus
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-[#a69c8f] mb-0.5">Temps de début *</label>
                              <input
                                type="text"
                                value={editLmStartTime}
                                onChange={e => setEditLmStartTime(e.target.value)}
                                placeholder="ex: 1:24"
                                className="w-full px-2.5 py-1.5 bg-[#14110e] border border-[#382d22] rounded-lg text-xs text-[#f4efe6] font-mono focus:outline-none focus:border-[#10b981]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-[#a69c8f] mb-0.5">Temps de fin (optionnel)</label>
                              <input
                                type="text"
                                value={editLmEndTime}
                                onChange={e => setEditLmEndTime(e.target.value)}
                                placeholder="ex: 2:05 (laisser vide si aucun)"
                                className="w-full px-2.5 py-1.5 bg-[#14110e] border border-[#382d22] rounded-lg text-xs text-[#f4efe6] font-mono focus:outline-none focus:border-[#10b981]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => setEditingLmIndex(null)}
                            className="px-2.5 py-1 rounded-lg bg-[#28211a] hover:bg-[#332b22] text-[#a69c8f] hover:text-[#f4efe6] text-xs cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditLandmark(idx)}
                            disabled={!editLmTitle.trim()}
                            className="px-3 py-1 rounded-lg bg-[#10b981] hover:bg-[#34d399] disabled:opacity-50 text-[#061a0e] font-bold text-xs cursor-pointer shadow-sm"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className={`group relative flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-xs transition-all ${
                        isCurrent
                          ? 'bg-[#10b981]/15 border-[#10b981] text-[#f4efe6] shadow-sm'
                          : 'bg-[#1b1612] border-[#2f271f] hover:border-[#4a3926] text-[#d4c9ba]'
                      }`}
                    >
                      {/* Bouton Boucle pour ce repère (à gauche de chaque repère, remplace R1, R2...) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLoopForLandmark(idx);
                        }}
                        disabled={!hasEndTime}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 mr-1 flex items-center justify-center ${
                          isThisLandmarkLooping
                            ? 'bg-[#10b981] text-[#061a0e] border-[#10b981] shadow-sm active:scale-95'
                            : hasEndTime
                            ? 'bg-[#241c14] hover:bg-[#34291f] text-[#10b981] hover:text-[#34d399] border-[#3f3122] hover:border-[#10b981]/60'
                            : 'bg-[#1a1612] text-[#6b6052] border-[#29221b] opacity-40 cursor-not-allowed'
                        }`}
                        title={
                          !hasEndTime
                            ? "Définissez un temps de fin pour activer la lecture en boucle"
                            : isThisLandmarkLooping
                            ? `Boucle active (${formatSecondsToMinutes(lm.timeSeconds)} - ${formatSecondsToMinutes(lm.endTimeSeconds!)}) - Cliquer pour désactiver`
                            : `Lire ce repère en boucle (${formatSecondsToMinutes(lm.timeSeconds)} - ${formatSecondsToMinutes(lm.endTimeSeconds!)})`
                        }
                        aria-label={isThisLandmarkLooping ? "Désactiver la boucle" : "Activer la boucle"}
                      >
                        <Repeat className={`w-3.5 h-3.5 ${isThisLandmarkLooping ? 'text-[#061a0e]' : hasEndTime ? 'text-[#10b981]' : 'text-[#6b6052]'}`} />
                      </button>

                      {/* Clic sur le repère pour lancer la lecture ou mettre en pause / reprendre / réinitialiser au début si dépassé */}
                      <button
                        type="button"
                        onClick={() => {
                          // Si ce repère est déjà sélectionné ET qu'on est encore dans l'intervalle du repère (avant le temps de fin) :
                          if (selectedLandmarkIndex === idx && isWithinLandmark) {
                            if (isPlaying) {
                              // En cours de lecture : mettre sur pause
                              pauseVideo();
                            } else {
                              // En pause : reprendre là où elle s'est arrêtée (pas au début du repère !)
                              resumeVideo();
                            }
                            return;
                          }

                          // Nouveau repère sélectionné, OU temps de fin dépassé : on revient au début du repère
                          handleJumpToTime(lm.timeSeconds);
                          setSelectedLandmarkIndex(idx);
                          // Si ce repère n'a pas de temps de fin, désactiver la boucle
                          if (!lm.endTimeSeconds || lm.endTimeSeconds <= lm.timeSeconds) {
                            setIsLooping(false);
                          }
                        }}
                        className="flex-1 flex items-center gap-2 overflow-hidden text-left cursor-pointer min-w-0 pr-2"
                        title={
                          selectedLandmarkIndex === idx && isWithinLandmark
                            ? isPlaying
                              ? "Mettre en pause la vidéo"
                              : "Reprendre la lecture là où elle s'est arrêtée"
                            : `Aller à ${timeDisplay} et lancer la lecture`
                        }
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? 'bg-[#10b981] text-[#061a0e]'
                            : 'bg-[#251e18] text-[#10b981] group-hover:bg-[#10b981] group-hover:text-[#061a0e] transition-colors'
                        }`}>
                          {selectedLandmarkIndex === idx && isPlaying && isWithinLandmark ? (
                            <Pause className="w-2.5 h-2.5 fill-current" />
                          ) : (
                            <Play className="w-2.5 h-2.5 fill-current ml-0.2" />
                          )}
                        </div>

                        <span className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold shrink-0 ${
                          isCurrent
                            ? 'bg-[#10b981] text-[#061a0e]'
                            : 'bg-[#261f18] text-[#10b981] border border-[#3e3223]'
                        }`}>
                          {timeDisplay}
                        </span>

                        <span className="truncate font-medium text-[#f4efe6] group-hover:text-[#10b981] transition-colors">
                          {displayTitle}
                        </span>
                      </button>

                      {/* Menu déroulant avec 3 petits points */}
                      <div className="relative shrink-0 landmark-dropdown-area">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownIndex(activeDropdownIndex === idx ? null : idx);
                          }}
                          className="p-1 rounded-lg text-[#8c8173] hover:text-[#f4efe6] hover:bg-[#282119] transition-colors cursor-pointer"
                          title="Options du repère (Modifier, Supprimer)"
                          aria-label="Options du repère"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Menu contextuel Modifier / Supprimer */}
                        {activeDropdownIndex === idx && (
                          <div 
                            className="absolute right-0 top-7 z-40 w-32 bg-[#1b1713] border border-[#3d3326] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleStartEditLandmark(idx);
                                setActiveDropdownIndex(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-[#f4efe6] hover:bg-[#2a221a] hover:text-[#10b981] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#10b981]" />
                              <span>Modifier</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteLandmark(idx);
                                setActiveDropdownIndex(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              !showAddForm && (
                <p className="text-xs text-[#8c8173] italic py-1">
                  Aucun repère défini pour cette vidéo. Cliquez sur "Ajouter un repère" ci-dessus pour en créer un.
                </p>
              )
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
                    ? 'bg-[#132c1c] text-[#10b981] border-[#10b981]'
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
                <FileText className="w-3.5 h-3.5 text-[#10b981]" />
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
              className="w-full bg-[#141210] border border-[#332c25] focus:border-[#10b981] rounded-xl p-3 text-xs sm:text-sm text-[#f4efe6] placeholder-[#6b6256] outline-none transition-colors"
            />
          </div>

          {/* Navigation between videos if available */}
          {(onPrevious || onNext) && (
            <div className="flex items-center justify-between pt-2 border-t border-[#2d2721]">
              {onPrevious ? (
                <button
                  onClick={onPrevious}
                  className="flex items-center gap-1 text-xs text-[#a69c8f] hover:text-[#10b981] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Vidéo précédente</span>
                </button>
              ) : <div />}

              {onNext ? (
                <button
                  onClick={onNext}
                  className="flex items-center gap-1 text-xs text-[#a69c8f] hover:text-[#10b981] transition-colors cursor-pointer"
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#221c17] hover:bg-[#2d241d] active:bg-[#1b1612] text-[#10b981] hover:text-[#f4efe6] border border-[#3e3224] text-xs sm:text-sm font-bold transition-all shadow-md active:scale-98 cursor-pointer"
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
