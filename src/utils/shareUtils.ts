import { VideoItem } from '../types';

export interface ShareUrlParams {
  discipline?: 'danse' | 'guitare';
  palo?: string;
  variant?: string;
  section?: string;
  video?: string;
  t?: number;
  montage?: string;
  montage_id?: string;
  shared_montage?: string;
}

/**
 * Construit une URL absolue partageable basée sur l'hôte courant et les paramètres.
 */
export function buildShareUrl(params: ShareUrlParams): string {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.origin + window.location.pathname);

  if (params.discipline) url.searchParams.set('discipline', params.discipline);
  if (params.palo) url.searchParams.set('palo', params.palo);
  if (params.variant) url.searchParams.set('variant', params.variant);
  if (params.section) url.searchParams.set('section', params.section);
  if (params.video) url.searchParams.set('video', params.video);
  if (params.t !== undefined && params.t > 0) url.searchParams.set('t', Math.round(params.t).toString());
  if (params.montage) url.searchParams.set('montage', params.montage);
  if (params.montage_id) url.searchParams.set('montage_id', params.montage_id);
  if (params.shared_montage) url.searchParams.set('shared_montage', params.shared_montage);

  return url.toString();
}

export interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

export interface ShareResult {
  success: boolean;
  method: 'share' | 'clipboard' | 'dismissed';
  message: string;
}

/**
 * Déclenche le partage via navigator.share (Web Share API) ou repli automatique sur le presse-papier.
 * Formaté pour être compatible avec Gmail (qui requiert l'URL dans le corps du texte) et Facebook.
 */
export async function shareContent(options: ShareOptions): Promise<ShareResult> {
  const { title, text, url } = options;

  // 1. Tenter l'API Web Share native si supportée
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      // Pour Gmail et d'autres apps mobiles qui ignorent le paramètre 'url' et n'affichent que 'text',
      // on concatène l'URL dans le texte pour garantir qu'elle soit présente dans le message.
      const textWithUrl = text ? `${text}\n${url}` : url;

      const shareData: ShareData = {
        title,
        text: textWithUrl,
        url,
      };

      // Vérifier si navigator.canShare est supporté
      if (typeof navigator.canShare !== 'function' || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return {
          success: true,
          method: 'share',
          message: 'Partagé avec succès !'
        };
      }
    } catch (err: unknown) {
      // Si l'utilisateur a annulé la boîte de dialogue de partage native (AbortError), on ne considère pas cela comme une erreur bloquante
      if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('Abort'))) {
        return {
          success: false,
          method: 'dismissed',
          message: 'Partage annulé'
        };
      }
      console.warn('Échec de navigator.share, bascule sur la copie dans le presse-papier :', err);
    }
  }

  // 2. Repli automatique (fallback) sur la copie dans le presse-papier
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return {
        success: true,
        method: 'clipboard',
        message: 'Lien copié dans le presse-papier ! Vous pouvez le coller dans Gmail, Facebook ou vos messages.'
      };
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (copied) {
        return {
          success: true,
          method: 'clipboard',
          message: 'Lien copié dans le presse-papier !'
        };
      }
    }
  } catch (clipErr) {
    console.error('Erreur lors de la copie du lien dans le presse-papier :', clipErr);
  }

  return {
    success: false,
    method: 'dismissed',
    message: 'Impossible de copier automatiquement. URL : ' + url
  };
}

/**
 * Génère des liens directs de partage pour Gmail, Facebook, WhatsApp et Mail standard,
 * garantis sans blocage applicatif.
 */
export function getSocialShareLinks(options: ShareOptions) {
  const { title, text = '', url } = options;
  const fullBody = text ? `${text}\n\n${url}` : url;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedBody = encodeURIComponent(fullBody);
  const encodedWhatsapp = encodeURIComponent(text ? `${text}\n${url}` : url);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedWhatsapp}`,
    // Gmail Web direct composer
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedTitle}&body=${encodedBody}`,
    // Client mail natif
    mailto: `mailto:?subject=${encodedTitle}&body=${encodedBody}`,
    // Boîte de dialogue officielle Facebook
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
}

/**
 * Prépare les données de partage pour une vidéo.
 */
export function getVideoShareData(params: {
  video: VideoItem;
  paloName: string;
  paloId?: string;
  sectionName?: string;
  currentTime?: number;
  discipline?: 'danse' | 'guitare';
}): ShareOptions {
  const { video, paloName, paloId = 'Farruca', sectionName = '', currentTime = 0, discipline = 'danse' } = params;

  const timeFormatted = currentTime > 0 
    ? ` à ${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`
    : '';

  const shareUrl = buildShareUrl({
    discipline,
    palo: paloId,
    section: sectionName,
    video: video.id || encodeURIComponent(video.title),
    t: currentTime > 0 ? currentTime : (video.startSeconds || 0)
  });

  const title = `Flamenco : ${video.title} (${paloName})`;
  const text = `Regarde cette vidéo d'étude flamenca : "${video.title}" (${paloName} • ${sectionName})${timeFormatted}.`;

  return {
    title,
    text,
    url: shareUrl
  };
}

/**
 * Prépare les données de partage pour une section ou espace.
 */
export function getSectionShareData(params: {
  discipline: 'danse' | 'guitare';
  paloName: string;
  paloId: string;
  sectionKey: string;
  sectionTitle: string;
  montageId?: string;
}): ShareOptions {
  const { discipline, paloName, paloId, sectionKey, sectionTitle, montageId } = params;

  const shareUrl = buildShareUrl({
    discipline,
    palo: paloId,
    section: sectionKey,
    montage: montageId
  });

  const title = `Flamenco ${discipline === 'danse' ? 'Danse' : 'Guitare'} – ${paloName} : ${sectionTitle}`;
  const text = `Consulte l'espace d'étude "${sectionTitle}" pour la ${paloName} sur la Bibliothèque Flamenca.`;

  return {
    title,
    text,
    url: shareUrl
  };
}

/**
 * Aide pratique pour partager une vidéo spécifique avec horodatage optionnel.
 */
export async function shareVideoItem(params: {
  video: VideoItem;
  paloName: string;
  paloId?: string;
  sectionName?: string;
  currentTime?: number;
  discipline?: 'danse' | 'guitare';
}): Promise<ShareResult> {
  const shareOptions = getVideoShareData(params);
  return await shareContent(shareOptions);
}

/**
 * Aide pratique pour partager un espace ou une section spécifique.
 */
export async function shareSection(params: {
  discipline: 'danse' | 'guitare';
  paloName: string;
  paloId: string;
  sectionKey: string;
  sectionTitle: string;
  montageId?: string;
}): Promise<ShareResult> {
  const shareOptions = getSectionShareData(params);
  return await shareContent(shareOptions);
}
