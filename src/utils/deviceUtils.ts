import { VideoItem } from '../types';

export type DeviceType = 'pc' | 'mobile';

/**
 * Détecte si l'appareil actuel est un mobile (smartphone ou tablette) ou un ordinateur
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouchScreen = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024;
  return isMobileUA || isTouchScreen;
}

export function getCurrentDeviceType(): DeviceType {
  return isMobileDevice() ? 'mobile' : 'pc';
}

/**
 * Détecte si une URL ou un chemin correspond à un fichier local (disque dur PC ou mémoire téléphone)
 */
export function isLocalVideoUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('content://') ||
    /^[a-zA-Z]:[\\\/]/.test(trimmed) || // C:\ ou C:/ etc.
    trimmed.startsWith('/storage/') ||
    trimmed.startsWith('/sdcard/') ||
    trimmed.startsWith('/Users/') ||
    trimmed.startsWith('/home/') ||
    trimmed.startsWith('\\\\') ||
    /^(https?:\/\/)?(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?/i.test(trimmed)
  );
}

/**
 * Tente de déduire si le fichier local provient d'un PC (Windows/Mac/Linux) ou d'un smartphone
 */
export function detectDeviceFromUrl(url?: string): DeviceType | null {
  if (!url) return null;
  const trimmed = url.trim().toLowerCase();
  if (
    /^[a-z]:[\\\/]/.test(trimmed) ||
    trimmed.startsWith('file:///c:') ||
    trimmed.startsWith('file:///d:') ||
    trimmed.startsWith('/users/') ||
    trimmed.startsWith('/home/') ||
    trimmed.startsWith('\\\\')
  ) {
    return 'pc';
  }
  if (
    trimmed.startsWith('content://') ||
    trimmed.startsWith('/storage/') ||
    trimmed.startsWith('/sdcard/') ||
    trimmed.includes('emulated')
  ) {
    return 'mobile';
  }
  return null;
}

export interface VideoDeviceStatus {
  isLocal: boolean;
  sourceDevice: DeviceType | 'unknown';
  isAvailableOnCurrentDevice: boolean;
  badgeText?: string;
  message?: string;
  subMessage?: string;
}

/**
 * Vérifie la disponibilité d'une vidéo selon l'appareil actuel (PC vs Téléphone)
 */
export function checkVideoDeviceAvailability(video: VideoItem): VideoDeviceStatus {
  const isLocal = !!video.isLocalFile || isLocalVideoUrl(video.url);
  if (!isLocal) {
    return {
      isLocal: false,
      sourceDevice: 'unknown',
      isAvailableOnCurrentDevice: true,
    };
  }

  // Détermination de l'appareil source ayant enregistré la vidéo
  let source: DeviceType = video.sourceDevice || detectDeviceFromUrl(video.url) || 'pc';
  const currentDevice = getCurrentDeviceType();

  // Cas 1 : Vidéo stockée sur PC, mais visionnée depuis un smartphone / tablette
  if (source === 'pc' && currentDevice === 'mobile') {
    return {
      isLocal: true,
      sourceDevice: 'pc',
      isAvailableOnCurrentDevice: false,
      badgeText: 'Stockée sur votre PC',
      message: 'Vidéo non disponible car stockée sur votre PC',
      subMessage: 'Ce fichier se trouve sur le disque dur de votre ordinateur et ne peut pas être lu depuis votre téléphone. Pour y accéder partout, déposez-la sur YouTube (en non répertorié), Vimeo ou Google Drive.'
    };
  }

  // Cas 2 : Vidéo stockée sur téléphone, mais visionnée depuis un PC
  if (source === 'mobile' && currentDevice === 'pc') {
    return {
      isLocal: true,
      sourceDevice: 'mobile',
      isAvailableOnCurrentDevice: false,
      badgeText: 'Stockée sur votre téléphone',
      message: 'Vidéo non disponible car stockée sur votre téléphone',
      subMessage: 'Ce fichier se trouve sur la mémoire de votre smartphone et ne peut pas être lu depuis votre ordinateur. Pour y accéder partout, déposez-la sur YouTube (en non répertorié), Vimeo ou Google Drive.'
    };
  }

  // Cas 3 : Vidéo locale visionnée sur le même appareil que celui d'origine
  return {
    isLocal: true,
    sourceDevice: source,
    isAvailableOnCurrentDevice: true,
    badgeText: source === 'pc' ? 'Fichier local PC' : 'Fichier local téléphone',
    message: source === 'pc' ? 'Fichier stocké localement sur ce PC' : 'Fichier stocké localement sur ce téléphone',
    subMessage: 'Ce fichier est accessible sur cet appareil, mais ne pourra pas être lu sur votre autre appareil sans lien web (YouTube en non répertorié, Vimeo ou Drive).'
  };
}
