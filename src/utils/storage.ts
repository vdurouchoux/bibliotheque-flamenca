import { PracticeBookmark, VideoItem, Level, VideoLandmark, MontageBlock, DanseMontageStore, BlockVideoLink } from '../types';
import { scheduleCloudPush } from './firebaseSync';
import { isLocalVideoUrl, detectDeviceFromUrl, getCurrentDeviceType } from './deviceUtils';

const STORAGE_CUSTOM_VIDEOS_KEY = 'flamenco_custom_videos_v1';
const STORAGE_DELETED_VIDEOS_KEY = 'flamenco_deleted_videos_v1';
const STORAGE_REPLACED_VIDEOS_KEY = 'flamenco_replaced_videos_v1';
const STORAGE_BOOKMARKS_KEY = 'flamenco_bookmarks_v1';
const STORAGE_NOTES_KEY = 'flamenco_video_notes_v1';
const STORAGE_CHOREO_KEY = 'flamenco_choreo_checklist_v1';
const STORAGE_LANDMARKS_KEY = 'flamenco_video_landmarks_v1';
const STORAGE_DANSE_MONTAGES_KEY = 'flamenco_danse_montages_v2';
const STORAGE_DANSE_MONTAGE_KEYS_ORDER = 'flamenco_danse_montage_keys_order_v2';
const STORAGE_DANSE_BLOCK_LINKS_KEY = 'flamenco_danse_block_links_v1';
const STORAGE_DANSE_MONTAGE_TITLES_KEY = 'flamenco_danse_montage_titles_v1';
const STORAGE_USER_DISPLAY_NAME_KEY = 'flamenco_user_display_name_v1';

export interface SharedMontagePayload {
  v: 1;
  paloId: string;
  author: string;
  title?: string;
  blocks: {
    id: string;
    title: string;
    description: string;
    danceTips: string;
    guitarCode: string;
    durationApprox?: string;
  }[];
  links?: Record<string, BlockVideoLink>;
  created?: number;
}

export interface CustomVideoStore {
  [paloKey: string]: {
    [section: string]: VideoItem[];
  };
}

export function getCustomVideos(): CustomVideoStore {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomVideo(
  paloKey: string,
  section: string,
  video: { title: string; url: string; level: Level; description?: string; sourceDevice?: 'pc' | 'mobile'; isLocalFile?: boolean }
): VideoItem {
  const store = getCustomVideos();
  if (!store[paloKey]) store[paloKey] = {};
  if (!store[paloKey][section]) store[paloKey][section] = [];

  const isLocal = video.isLocalFile ?? isLocalVideoUrl(video.url);
  const detectedDevice = video.sourceDevice || (isLocal ? (detectDeviceFromUrl(video.url) || getCurrentDeviceType()) : undefined);

  const newItem: VideoItem = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: video.title.trim(),
    url: video.url.trim(),
    level: video.level,
    description: video.description?.trim(),
    isCustom: true,
    isLocalFile: isLocal,
    sourceDevice: detectedDevice
  };

  store[paloKey][section].push(newItem);
  try {
    localStorage.setItem(STORAGE_CUSTOM_VIDEOS_KEY, JSON.stringify(store));
    scheduleCloudPush();
  } catch (e) {
    console.error('Failed to save custom video', e);
  }
  return newItem;
}

export function getChoreographyChecklist(paloId: string): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_CHOREO_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[paloId] || [];
  } catch {
    return [];
  }
}

export function toggleChoreographyStep(paloId: string, stepNumber: number): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_CHOREO_KEY);
    const store: Record<string, number[]> = raw ? JSON.parse(raw) : {};
    const current = store[paloId] || [];
    let updated: number[];
    if (current.includes(stepNumber)) {
      updated = current.filter(s => s !== stepNumber);
    } else {
      updated = [...current, stepNumber];
    }
    store[paloId] = updated;
    localStorage.setItem(STORAGE_CHOREO_KEY, JSON.stringify(store));
    scheduleCloudPush();
    return updated;
  } catch {
    return [];
  }
}

export function getDefaultFarrucaBlocks(): MontageBlock[] {
  return [
    {
      id: 'bloc-1',
      title: "Salida & Entrada (L'Entrée en scène & Promenade)",
      description: "L'entrée installe immédiatement l'atmosphère sombre et altière. Le danseur entre généralement sur la falseta d'introduction du guitariste, avance d'un pas lent et mesuré (paseo), puis pose un premier remate ou desplante au centre de la scène.",
      danceTips: "• Pas marchés lents sur les temps forts (1 et 3)\n• Buste fier, épaules basses, bras sculptés sans ondulations gitanes excessives\n• Regard direct et pénétrant vers le public\n• Premier arrêt net (desplante) pour affirmer sa présence",
      guitarCode: "La cadence de vos pas impose le tempo de départ au guitariste. Le premier remate net donne le signal de départ de la letra.",
      durationApprox: "45s à 1 min"
    },
    {
      id: 'bloc-2',
      title: "Primera Letra & Marcajes (Les Marquages de Chant / Thème)",
      description: "Section dansée sur la copla chantée ou le thème principal à la guitare. Le danseur marque le compás binaire avec le haut du corps : cambres sobres, torsions du buste, suspensions des bras et tours lents (giros).",
      danceTips: "• Marquages sobres alternant appuis pied droit et pied gauche\n• Jeux de bras anguleux et lignes géométriques précises\n• Petits latiguillos de pieds discrets pour souligner la mélodie sans la couvrir\n• Écoute attentive des respirations du chanteur",
      guitarCode: "Les frappes de pieds doivent rester légères pendant le chant pour ne pas masquer la voix ou les accords subtils.",
      durationApprox: "1 min à 1 min 30"
    },
    {
      id: 'bloc-3',
      title: "Llamada de Transition (L'Appel au guitariste)",
      description: "La llamada est le signal codifié exécuté avec les pieds et le corps. Elle annonce aux musiciens la fin de la section chantée et la bascule vers la partie suivante (deuxième lettre ou silencio).",
      danceTips: "• Combinaison de frappes nettes planta-tacón au compás\n• Posture engagée et regard tourné vers le guitariste\n• Remate tranchant sur le temps 1 ou le temps 3 suivi d'un temps de silence",
      guitarCode: "La llamada est un ordre musical clair. Elle doit être exécutée avec autorité pour que le guitariste relance sans hésitation.",
      durationApprox: "15s à 25s"
    },
    {
      id: 'bloc-4',
      title: "Silencio ou Falseta Lyrique (Respiration & Giros)",
      description: "Moment de contraste indispensable après la tension des frappes. Sur une falseta lente en arpèges ou en trémolo, le danseur déploie des tours lents (giros), des suspensions et des attitudes immobiles.",
      danceTips: "• Contrastes de dynamiques : passer de la puissance à la grâce suspendue\n• Tours contrôlés avec point fixe du regard (giros de cuello)\n• Déplacement ample sur toute la surface de scène",
      guitarCode: "Connexion visuelle étroite. Le danseur écoute le souffle de la guitare et conclut par un mini-remate d'appel pour préparer l'escobilla.",
      durationApprox: "45s à 1 min"
    },
    {
      id: 'bloc-5',
      title: "Escobilla & Subida (La Grande Démonstration de Pieds & Accélération)",
      description: "Le sommet technique de la Farruca. Enchaînement de variations rythmiques complexes aux pieds (planta, tacón, pointe, contratiempos). La section débute à tempo calme (80 BPM) avant de monter en puissance et en vitesse (la subida).",
      danceTips: "• Commencer d'une propreté métronomique parfaite sans forcer le son\n• Développer la vitesse de manière progressive et continue, jamais par à-coups\n• Garder le bassin stable et le centre de gravité bas (genoux souples)\n• Utiliser les bras pour s'équilibrer sans briser les lignes",
      guitarCode: "Le guitariste garde les yeux rivés sur vos pieds. C'est le talon du danseur qui mène la danse et dicte l'accélération précise.",
      durationApprox: "1 min 30 à 2 min 30"
    },
    {
      id: 'bloc-6',
      title: "Remate Final & Cierre / Salida (Conclusion foudroyante)",
      description: "Au point culminant de la subida, le danseur marque un arrêt foudroyant (cierre) à l'unisson parfait avec la guitare. Il peut alors saluer dans une immobilité totale ou enchaîner sur une courte sortie rythmée.",
      danceTips: "• Dernier tour rapide (pirouette ou giro) terminé net\n• Coup de pied final sec et arrêt immédiat comme une statue\n• Immobilité complète pendant 2 à 3 secondes pour laisser résonner l'accord final",
      guitarCode: "L'accord final de Mi ou La mineur doit frapper exactement au même millième de seconde que le dernier tacón.",
      durationApprox: "30s à 45s"
    }
  ];
}

export function getDanseMontages(paloId: string): Record<string, MontageBlock[]> {
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_MONTAGES_KEY);
    const store: DanseMontageStore = raw ? JSON.parse(raw) : {};
    const paloMontages = store[paloId];
    if (paloMontages && Object.keys(paloMontages).length > 0) {
      return paloMontages;
    }

    // Check migration from v1 if user had edited montage-1
    let initialMontage1 = getDefaultFarrucaBlocks();
    try {
      const oldRaw = localStorage.getItem('flamenco_danse_montages_v1');
      if (oldRaw) {
        const oldStore: DanseMontageStore = JSON.parse(oldRaw);
        if (oldStore[paloId]?.['montage-1']) {
          initialMontage1 = oldStore[paloId]['montage-1'];
        }
      }
    } catch {}

    const initialStore: Record<string, MontageBlock[]> = {
      'montage-1': initialMontage1,
    };
    saveDanseMontage(paloId, 'montage-1', initialMontage1);
    saveDanseMontageKeys(paloId, ['montage-1']);
    return initialStore;
  } catch {
    return {
      'montage-1': getDefaultFarrucaBlocks(),
    };
  }
}

export function getDanseMontageKeys(paloId: string): string[] {
  try {
    const rawOrder = localStorage.getItem(STORAGE_DANSE_MONTAGE_KEYS_ORDER);
    const storeOrder: Record<string, string[]> = rawOrder ? JSON.parse(rawOrder) : {};
    if (storeOrder[paloId] && Array.isArray(storeOrder[paloId]) && storeOrder[paloId].length > 0) {
      return storeOrder[paloId];
    }
    const montages = getDanseMontages(paloId);
    const keys = Object.keys(montages);
    return keys.length > 0 ? keys : ['montage-1'];
  } catch {
    return ['montage-1'];
  }
}

export function saveDanseMontageKeys(paloId: string, keys: string[]) {
  try {
    const rawOrder = localStorage.getItem(STORAGE_DANSE_MONTAGE_KEYS_ORDER);
    const storeOrder: Record<string, string[]> = rawOrder ? JSON.parse(rawOrder) : {};
    storeOrder[paloId] = keys;
    localStorage.setItem(STORAGE_DANSE_MONTAGE_KEYS_ORDER, JSON.stringify(storeOrder));
    scheduleCloudPush();
  } catch (e) {
    console.error('Failed to save montage keys', e);
  }
}

export function deleteDanseMontage(paloId: string, montageKey: string) {
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_MONTAGES_KEY);
    const store: DanseMontageStore = raw ? JSON.parse(raw) : {};
    if (store[paloId] && store[paloId][montageKey]) {
      delete store[paloId][montageKey];
      localStorage.setItem(STORAGE_DANSE_MONTAGES_KEY, JSON.stringify(store));
    }
    deleteDanseMontageTitle(paloId, montageKey);
    const currentKeys = getDanseMontageKeys(paloId).filter(k => k !== montageKey);
    saveDanseMontageKeys(paloId, currentKeys.length > 0 ? currentKeys : ['montage-1']);
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_montages_updated'));
    }
  } catch (e) {
    console.error('Failed to delete danse montage', e);
  }
}

export function getUserDisplayName(): string {
  try {
    return localStorage.getItem(STORAGE_USER_DISPLAY_NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function saveUserDisplayName(name: string): void {
  try {
    const clean = name.trim();
    if (clean) {
      localStorage.setItem(STORAGE_USER_DISPLAY_NAME_KEY, clean);
    }
  } catch {}
}

export function getDanseMontageTitles(paloId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_MONTAGE_TITLES_KEY);
    const store: Record<string, Record<string, string>> = raw ? JSON.parse(raw) : {};
    return store[paloId] || {};
  } catch {
    return {};
  }
}

export function saveDanseMontageTitle(paloId: string, montageKey: string, title: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_MONTAGE_TITLES_KEY);
    const store: Record<string, Record<string, string>> = raw ? JSON.parse(raw) : {};
    if (!store[paloId]) store[paloId] = {};
    store[paloId][montageKey] = title.trim();
    localStorage.setItem(STORAGE_DANSE_MONTAGE_TITLES_KEY, JSON.stringify(store));
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_montages_updated'));
    }
  } catch (e) {
    console.error('Failed to save danse montage title', e);
  }
}

export function deleteDanseMontageTitle(paloId: string, montageKey: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_MONTAGE_TITLES_KEY);
    const store: Record<string, Record<string, string>> = raw ? JSON.parse(raw) : {};
    if (store[paloId] && store[paloId][montageKey]) {
      delete store[paloId][montageKey];
      localStorage.setItem(STORAGE_DANSE_MONTAGE_TITLES_KEY, JSON.stringify(store));
      scheduleCloudPush();
    }
  } catch (e) {
    console.error('Failed to delete danse montage title', e);
  }
}

export function encodeSharedMontage(payload: SharedMontagePayload): string {
  try {
    return toBase64Unicode(JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to encode shared montage', e);
    return '';
  }
}

export function decodeSharedMontage(encoded: string): SharedMontagePayload | null {
  try {
    if (!encoded || !encoded.trim()) return null;
    const jsonStr = fromBase64Unicode(encoded.trim());
    const data = JSON.parse(jsonStr);
    if (data && Array.isArray(data.blocks) && data.paloId) {
      return data as SharedMontagePayload;
    }
    return null;
  } catch (e) {
    console.error('Failed to decode shared montage', e);
    return null;
  }
}

export function importSharedMontage(payload: SharedMontagePayload): {
  key: string;
  title: string;
  isUpdate: boolean;
} {
  const paloId = payload.paloId || 'Farruca';
  const author = (payload.author || '').trim();
  const rawTitle = (payload.title || '').trim();

  // Nom convivial : "Montage de Vincent" (selon la demande exacte de l'utilisateur)
  let finalTitle = rawTitle;
  if (!finalTitle) {
    finalTitle = author ? `Montage de ${author}` : 'Montage partagé';
  } else if (author && !finalTitle.toLowerCase().includes(author.toLowerCase())) {
    finalTitle = `Montage de ${author}`;
  }

  const existingTitles = getDanseMontageTitles(paloId);
  const existingKeys = getDanseMontageKeys(paloId);

  // Recherche si un onglet avec ce nom existe déjà
  let targetKey = '';
  let isUpdate = false;

  for (const [k, t] of Object.entries(existingTitles)) {
    if (t.toLowerCase() === finalTitle.toLowerCase()) {
      targetKey = k;
      isUpdate = true;
      break;
    }
  }

  if (!targetKey) {
    const slug = author
      ? author.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 15)
      : 'partage';
    let baseKey = `montage-shared-${slug}`;
    if (existingKeys.includes(baseKey)) {
      baseKey = `${baseKey}-${Date.now().toString().slice(-4)}`;
    }
    targetKey = baseKey;
  }

  // Blocs
  const blocks: MontageBlock[] = payload.blocks.map((b, idx) => ({
    id: b.id || `shared-block-${idx}-${Date.now()}`,
    title: b.title || `Bloc ${idx + 1}`,
    description: b.description || '',
    danceTips: b.danceTips || '',
    guitarCode: b.guitarCode || '',
    durationApprox: b.durationApprox || ''
  }));

  // Sauvegarde des blocs et du titre
  saveDanseMontage(paloId, targetKey, blocks);
  saveDanseMontageTitle(paloId, targetKey, finalTitle);

  // Mise à jour de la liste des clés
  if (!existingKeys.includes(targetKey)) {
    saveDanseMontageKeys(paloId, [...existingKeys, targetKey]);
  }

  // Valide immédiatement pour ouvrir directement la timeline avec les blocs
  try {
    const rawVal = localStorage.getItem('flamenco_montages_validated_v3');
    const valStore = rawVal ? JSON.parse(rawVal) : {};
    valStore[targetKey] = true;
    localStorage.setItem('flamenco_montages_validated_v3', JSON.stringify(valStore));
  } catch {}

  // Sélectionne tous les blocs pour ce montage
  try {
    const rawSel = localStorage.getItem('flamenco_montage_selected_blocks_v3');
    const selStore = rawSel ? JSON.parse(rawSel) : {};
    selStore[targetKey] = blocks.map(b => b.id);
    localStorage.setItem('flamenco_montage_selected_blocks_v3', JSON.stringify(selStore));
  } catch {}

  // Liens vidéo éventuels
  if (payload.links && typeof payload.links === 'object') {
    Object.entries(payload.links).forEach(([blockId, link]) => {
      if (link && link.videoId) {
        saveDanseBlockLink(paloId, targetKey, blockId, link);
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('flamenco_montages_updated'));
  }

  return {
    key: targetKey,
    title: finalTitle,
    isUpdate
  };
}

export function saveDanseMontage(paloId: string, montageKey: string, blocks: MontageBlock[]) {
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_MONTAGES_KEY);
    const store: DanseMontageStore = raw ? JSON.parse(raw) : {};
    if (!store[paloId]) {
      store[paloId] = {};
    }
    store[paloId][montageKey] = blocks;
    localStorage.setItem(STORAGE_DANSE_MONTAGES_KEY, JSON.stringify(store));
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_montages_updated'));
    }
  } catch (e) {
    console.error('Failed to save danse montage', e);
  }
}

export function resetDanseMontage(paloId: string, montageKey: string): MontageBlock[] {
  const defaultBlocks = getDefaultFarrucaBlocks();
  saveDanseMontage(paloId, montageKey, defaultBlocks);
  return defaultBlocks;
}

export function getDanseBlockLinks(paloId: string): Record<string, Record<string, BlockVideoLink>> {
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_BLOCK_LINKS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[paloId] || {};
  } catch {
    return {};
  }
}

export function saveDanseBlockLink(paloId: string, montageKey: string, blockId: string, link: BlockVideoLink) {
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_BLOCK_LINKS_KEY);
    const store: Record<string, Record<string, Record<string, BlockVideoLink>>> = raw ? JSON.parse(raw) : {};
    if (!store[paloId]) store[paloId] = {};
    if (!store[paloId][montageKey]) store[paloId][montageKey] = {};
    store[paloId][montageKey][blockId] = link;
    localStorage.setItem(STORAGE_DANSE_BLOCK_LINKS_KEY, JSON.stringify(store));
    scheduleCloudPush();
  } catch (e) {
    console.error('Failed to save danse block link', e);
  }
}

export function deleteDanseBlockLink(paloId: string, montageKey: string, blockId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_BLOCK_LINKS_KEY);
    const store: Record<string, Record<string, Record<string, BlockVideoLink>>> = raw ? JSON.parse(raw) : {};
    if (store[paloId] && store[paloId][montageKey] && store[paloId][montageKey][blockId]) {
      delete store[paloId][montageKey][blockId];
      localStorage.setItem(STORAGE_DANSE_BLOCK_LINKS_KEY, JSON.stringify(store));
      scheduleCloudPush();
    }
  } catch (e) {
    console.error('Failed to delete danse block link', e);
  }
}

export const DEFAULT_DANSE_SPACES_ORDER = [
  'structure',
  'montages',
  'maitres',
  'letras',
  'compas',
  'cours',
];

export function getDanseSpacesOrder(paloId: string): string[] | null {
  try {
    const raw = localStorage.getItem(`danse_spaces_order_${paloId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDanseSpacesOrder(paloId: string, order: string[]) {
  try {
    localStorage.setItem(`danse_spaces_order_${paloId}`, JSON.stringify(order));
    scheduleCloudPush(100);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flamenco_spaces_order_updated'));
    }
  } catch (e) {
    console.error('Failed to save danse spaces order', e);
  }
}

export function resetDanseSpacesOrder(paloId: string, defaultOrder: string[] = DEFAULT_DANSE_SPACES_ORDER) {
  try {
    saveDanseSpacesOrder(paloId, defaultOrder);
  } catch (e) {
    console.error('Failed to reset danse spaces order', e);
  }
}

export function deleteCustomVideo(paloKey: string, section: string, id: string) {
  const store = getCustomVideos();
  if (store[paloKey] && store[paloKey][section]) {
    store[paloKey][section] = store[paloKey][section].filter(item => item.id !== id);
    try {
      localStorage.setItem(STORAGE_CUSTOM_VIDEOS_KEY, JSON.stringify(store));
      scheduleCloudPush();
    } catch (e) {
      console.error('Failed to delete custom video', e);
    }
  }
}

export function getDeletedVideoIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isVideoDeleted(videoId: string): boolean {
  return getDeletedVideoIds().includes(videoId);
}

export function deleteAnyVideo(paloKey: string, section: string, videoId: string) {
  deleteCustomVideo(paloKey, section, videoId);
  const list = getDeletedVideoIds();
  if (!list.includes(videoId)) {
    list.push(videoId);
    try {
      localStorage.setItem(STORAGE_DELETED_VIDEOS_KEY, JSON.stringify(list));
      scheduleCloudPush();
    } catch (e) {
      console.error('Failed to save deleted video id', e);
    }
  }
}

export function getReplacedVideos(): Record<string, VideoItem> {
  try {
    const raw = localStorage.getItem(STORAGE_REPLACED_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function replaceAnyVideo(
  paloKey: string,
  section: string,
  oldVideo: VideoItem,
  newData: { title: string; url: string; level: Level; description?: string; sourceDevice?: 'pc' | 'mobile'; isLocalFile?: boolean }
): VideoItem {
  const isLocal = newData.isLocalFile ?? isLocalVideoUrl(newData.url);
  const detectedDevice = newData.sourceDevice || (isLocal ? (detectDeviceFromUrl(newData.url) || getCurrentDeviceType()) : undefined);

  const updatedItem: VideoItem = {
    id: oldVideo.id,
    title: newData.title.trim(),
    url: newData.url.trim(),
    level: newData.level,
    description: newData.description?.trim(),
    isCustom: true,
    isLocalFile: isLocal,
    sourceDevice: detectedDevice,
    landmarks: oldVideo.landmarks
  };

  const customStore = getCustomVideos();
  if (customStore[paloKey] && customStore[paloKey][section]) {
    const idx = customStore[paloKey][section].findIndex(v => v.id === oldVideo.id);
    if (idx !== -1) {
      customStore[paloKey][section][idx] = updatedItem;
      try {
        localStorage.setItem(STORAGE_CUSTOM_VIDEOS_KEY, JSON.stringify(customStore));
        scheduleCloudPush();
      } catch (e) {
        console.error('Failed to update custom video', e);
      }
      return updatedItem;
    }
  }

  const replacedStore = getReplacedVideos();
  replacedStore[oldVideo.id] = updatedItem;
  try {
    localStorage.setItem(STORAGE_REPLACED_VIDEOS_KEY, JSON.stringify(replacedStore));
    scheduleCloudPush();
  } catch (e) {
    console.error('Failed to save replaced video', e);
  }
  return updatedItem;
}

export function resetAllDeletedVideos() {
  localStorage.removeItem(STORAGE_DELETED_VIDEOS_KEY);
  localStorage.removeItem(STORAGE_REPLACED_VIDEOS_KEY);
  scheduleCloudPush();
}

export function getBookmarks(): Record<string, PracticeBookmark> {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function toggleBookmark(bookmark: Omit<PracticeBookmark, 'savedAt'>): boolean {
  const bookmarks = getBookmarks();
  const exists = !!bookmarks[bookmark.videoId];

  if (exists) {
    delete bookmarks[bookmark.videoId];
  } else {
    bookmarks[bookmark.videoId] = {
      ...bookmark,
      savedAt: Date.now()
    };
  }

  try {
    localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(bookmarks));
    scheduleCloudPush();
  } catch (e) {
    console.error('Failed to save bookmark', e);
  }

  return !exists;
}

export function updateBookmarkStatus(videoId: string, status: PracticeBookmark['status']) {
  const bookmarks = getBookmarks();
  if (bookmarks[videoId]) {
    bookmarks[videoId].status = status;
    try {
      localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(bookmarks));
      scheduleCloudPush();
    } catch (e) {
      console.error('Failed to update bookmark status', e);
    }
  }
}

export function getVideoNotes(videoId: string): string {
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[videoId] || '';
  } catch {
    return '';
  }
}

export function saveVideoNotes(videoId: string, notes: string) {
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[videoId] = notes;
    localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(store));
    scheduleCloudPush();
  } catch (e) {
    console.error('Failed to save video notes', e);
  }
}

export function extractYouTubeInfo(url: string, defaultStart?: number): { videoId: string | null; startSeconds: number } {
  if (!url) return { videoId: null, startSeconds: defaultStart || 0 };

  let videoId: string | null = null;
  let startSeconds = defaultStart || 0;

  // Extract start time parameter (&t= or ?t= or start=)
  const tMatch = url.match(/[?&](?:t|start)=([0-9hms]+)/i);
  if (tMatch) {
    const rawT = tMatch[1].toLowerCase();
    if (/^\d+$/.test(rawT)) {
      startSeconds = parseInt(rawT, 10);
    } else {
      let secs = 0;
      const hoursMatch = rawT.match(/(\d+)h/);
      const minsMatch = rawT.match(/(\d+)m/);
      const secsMatch = rawT.match(/(\d+)s/);
      if (hoursMatch) secs += parseInt(hoursMatch[1], 10) * 3600;
      if (minsMatch) secs += parseInt(minsMatch[1], 10) * 60;
      if (secsMatch) secs += parseInt(secsMatch[1], 10);
      if (secs > 0) startSeconds = secs;
    }
  }

  if (url.includes('watch?v=')) {
    const parts = url.split('watch?v=')[1];
    videoId = parts.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/')[1];
    videoId = parts.split('?')[0].split('&')[0];
  } else if (url.includes('embed/')) {
    const parts = url.split('embed/')[1];
    videoId = parts.split('?')[0].split('&')[0];
  }

  return { videoId, startSeconds };
}

export function extractYouTubeId(url: string): string | null {
  return extractYouTubeInfo(url).videoId;
}

export function getVideoCustomLandmarks(videoId: string, videoUrl?: string): VideoLandmark[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_LANDMARKS_KEY);
    if (!raw) return null;
    const store: Record<string, VideoLandmark[]> = JSON.parse(raw);

    // 1. Direct match by videoId
    if (store[videoId] !== undefined && store[videoId] !== null) {
      return store[videoId];
    }

    // 2. Match by YouTube ID extracted from videoUrl or videoId
    const ytId = extractYouTubeId(videoUrl || '') || extractYouTubeId(videoId);
    if (ytId && store[ytId] !== undefined && store[ytId] !== null) {
      return store[ytId];
    }

    // 3. Match by full URL if used as key
    if (videoUrl && store[videoUrl] !== undefined && store[videoUrl] !== null) {
      return store[videoUrl];
    }

    // 4. Fuzzy match in store keys (e.g. if key contains the YouTube ID or palo reference)
    if (ytId) {
      for (const key of Object.keys(store)) {
        if (key.includes(ytId) && store[key]) {
          return store[key];
        }
      }
    }

    // 5. Special fallback match for Vargas / Guito if customized under another format
    const lowerId = (videoId + ' ' + (videoUrl || '')).toLowerCase();
    if (lowerId.includes('vargas') || (ytId && ytId === 'pziQ1VcL740')) {
      for (const key of Object.keys(store)) {
        if ((key.toLowerCase().includes('vargas') || key.includes('pziQ1VcL740')) && store[key]) {
          return store[key];
        }
      }
    }
    if (lowerId.includes('guito') || (ytId && ytId === '77GxEVzmGBM')) {
      for (const key of Object.keys(store)) {
        if ((key.toLowerCase().includes('guito') || key.includes('77GxEVzmGBM')) && store[key]) {
          return store[key];
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function saveVideoCustomLandmarks(videoId: string, landmarks: VideoLandmark[], videoUrl?: string) {
  try {
    const raw = localStorage.getItem(STORAGE_LANDMARKS_KEY);
    const store: Record<string, VideoLandmark[]> = raw ? JSON.parse(raw) : {};
    
    // Save under primary ID
    store[videoId] = landmarks;

    // Also save under YouTube ID if available to prevent any key mismatch
    const ytId = extractYouTubeId(videoUrl || '') || extractYouTubeId(videoId);
    if (ytId && ytId !== videoId) {
      store[ytId] = landmarks;
    }

    localStorage.setItem(STORAGE_LANDMARKS_KEY, JSON.stringify(store));
    scheduleCloudPush();

    // Notify all active views of the landmarks update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flamenco_landmarks_updated', { detail: { videoId, ytId } }));
    }
  } catch (e) {
    console.error('Failed to save custom video landmarks', e);
  }
}

export function resetVideoCustomLandmarks(videoId: string, videoUrl?: string) {
  try {
    const raw = localStorage.getItem(STORAGE_LANDMARKS_KEY);
    if (!raw) return;
    const store: Record<string, VideoLandmark[]> = JSON.parse(raw);
    delete store[videoId];

    const ytId = extractYouTubeId(videoUrl || '') || extractYouTubeId(videoId);
    if (ytId && store[ytId]) {
      delete store[ytId];
    }

    localStorage.setItem(STORAGE_LANDMARKS_KEY, JSON.stringify(store));
    scheduleCloudPush();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flamenco_landmarks_updated', { detail: { videoId, ytId } }));
    }
  } catch (e) {
    console.error('Failed to reset custom video landmarks', e);
  }
}

// ==========================================
// SYNC & BACKUP BETWEEN DEVICES (PC <-> MOBILE)
// ==========================================

function toBase64Unicode(str: string): string {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    ));
  } catch {
    return btoa(str);
  }
}

function fromBase64Unicode(str: string): string {
  try {
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c: string) => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
  } catch {
    return atob(str);
  }
}

export function hasCustomUserData(): boolean {
  try {
    return !!(
      localStorage.getItem(STORAGE_LANDMARKS_KEY) ||
      localStorage.getItem(STORAGE_BOOKMARKS_KEY) ||
      localStorage.getItem(STORAGE_NOTES_KEY) ||
      localStorage.getItem(STORAGE_CUSTOM_VIDEOS_KEY) ||
      localStorage.getItem(STORAGE_REPLACED_VIDEOS_KEY)
    );
  } catch {
    return false;
  }
}

export function exportAllSyncData(): string {
  try {
    const payload: Record<string, any> = {
      v: 1,
      timestamp: Date.now()
    };
    const keys = [
      STORAGE_LANDMARKS_KEY,
      STORAGE_BOOKMARKS_KEY,
      STORAGE_NOTES_KEY,
      STORAGE_CHOREO_KEY,
      STORAGE_CUSTOM_VIDEOS_KEY,
      STORAGE_REPLACED_VIDEOS_KEY,
      STORAGE_DELETED_VIDEOS_KEY
    ];

    let hasData = false;
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          payload[k] = JSON.parse(val);
          hasData = true;
        } catch {
          // skip invalid json
        }
      }
    }

    if (!hasData) return '';
    return toBase64Unicode(JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to export sync data', e);
    return '';
  }
}

export function importAllSyncData(encoded: string): boolean {
  try {
    if (!encoded || !encoded.trim()) return false;
    const clean = encoded.trim();
    const jsonStr = fromBase64Unicode(clean);
    const payload = JSON.parse(jsonStr);
    if (!payload || typeof payload !== 'object') return false;

    const keys = [
      STORAGE_LANDMARKS_KEY,
      STORAGE_BOOKMARKS_KEY,
      STORAGE_NOTES_KEY,
      STORAGE_CHOREO_KEY,
      STORAGE_CUSTOM_VIDEOS_KEY,
      STORAGE_REPLACED_VIDEOS_KEY,
      STORAGE_DELETED_VIDEOS_KEY
    ];

    let importedCount = 0;
    for (const k of keys) {
      if (payload[k] !== undefined && payload[k] !== null) {
        localStorage.setItem(k, JSON.stringify(payload[k]));
        importedCount++;
      }
    }

    if (importedCount > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flamenco_landmarks_updated'));
      window.dispatchEvent(new CustomEvent('flamenco_data_imported'));
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to import sync data', e);
    return false;
  }
}

export function formatLandmarksAsText(videoTitle: string, landmarks: VideoLandmark[]): string {
  const lines = [`Repères pour "${videoTitle}" :`];
  landmarks.forEach((lm) => {
    const mins = Math.floor(lm.timeSeconds / 60);
    const secs = (lm.timeSeconds % 60).toString().padStart(2, '0');
    lines.push(`- ${mins}:${secs} : ${lm.label}`);
  });
  return lines.join('\n');
}

export interface ModificationsReport {
  hasModifications: boolean;
  totalCount: number;
  summaryText: string;
  jsonString: string;
}

export function getModificationsReport(): ModificationsReport {
  try {
    const deletedVideos = getDeletedVideoIds();
    const replacedVideos = getReplacedVideos();
    const customVideosStore = getCustomVideos();
    const rawLandmarks = localStorage.getItem(STORAGE_LANDMARKS_KEY);
    const customLandmarks: Record<string, VideoLandmark[]> = rawLandmarks ? JSON.parse(rawLandmarks) : {};

    const lines: string[] = [];

    // Added custom videos
    let customVideosCount = 0;
    Object.entries(customVideosStore).forEach(([palo, sections]) => {
      Object.entries(sections).forEach(([sec, list]) => {
        if (list && list.length > 0) {
          list.forEach(v => {
            customVideosCount++;
            lines.push(`- [AJOUT] Palo "${palo}", Section "${sec}" : "${v.title}" (${v.url})`);
          });
        }
      });
    });

    // Replaced videos
    const replacedCount = Object.keys(replacedVideos).length;
    Object.entries(replacedVideos).forEach(([oldId, v]) => {
      lines.push(`- [REMPLACEMENT] Id "${oldId}" remplacé par : "${v.title}" (${v.url})`);
    });

    // Deleted videos
    const deletedCount = deletedVideos.length;
    deletedVideos.forEach(id => {
      lines.push(`- [SUPPRESSION] Vidéo supprimée (id: "${id}")`);
    });

    // Custom landmarks
    const landmarksCount = Object.keys(customLandmarks).length;
    Object.entries(customLandmarks).forEach(([key, lmList]) => {
      lines.push(`- [REPÈRES] Vidéo "${key}" (${lmList.length} repères) :`);
      lmList.forEach(lm => {
        const mins = Math.floor(lm.timeSeconds / 60);
        const secs = (lm.timeSeconds % 60).toString().padStart(2, '0');
        lines.push(`    • ${mins}:${secs} - ${lm.label}`);
      });
    });

    const totalCount = customVideosCount + replacedCount + deletedCount + landmarksCount;

    const payload = {
      deletedVideos,
      replacedVideos,
      customVideosStore,
      customLandmarks
    };

    const summaryText = totalCount > 0 
      ? `=== RAPPORT DE MES MODIFICATIONS MANUELLES (${totalCount} éléments) ===\n\n` + lines.join('\n')
      : "Aucune modification manuelle détectée dans ce navigateur.";

    return {
      hasModifications: totalCount > 0,
      totalCount,
      summaryText,
      jsonString: JSON.stringify(payload, null, 2)
    };
  } catch (e) {
    console.error('Error creating modifications report', e);
    return {
      hasModifications: false,
      totalCount: 0,
      summaryText: "Erreur lors de la lecture des modifications.",
      jsonString: "{}"
    };
  }
}

// -------------------------------------------------------------
// EXPORT & IMPORT DE MES FAVORIS, PROGRÈS & NOTES PERSONNELLES
// -------------------------------------------------------------

export function exportFavoritesAndNotesAsText(): string {
  const bookmarks = getBookmarks();
  const rawNotes = localStorage.getItem(STORAGE_NOTES_KEY);
  const notesStore: Record<string, string> = rawNotes ? JSON.parse(rawNotes) : {};
  const rawLandmarks = localStorage.getItem(STORAGE_LANDMARKS_KEY);
  const landmarksStore: Record<string, VideoLandmark[]> = rawLandmarks ? JSON.parse(rawLandmarks) : {};
  const rawChoreo = localStorage.getItem(STORAGE_CHOREO_KEY);
  const choreoStore: Record<string, number[]> = rawChoreo ? JSON.parse(rawChoreo) : {};

  const items = (Object.values(bookmarks) as PracticeBookmark[]).sort((a, b) => b.savedAt - a.savedAt);
  const masteredCount = items.filter(i => i.status === 'mastered').length;
  const learningCount = items.filter(i => i.status === 'learning').length;
  const toLearnCount = items.filter(i => i.status === 'to_learn').length;

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const lines: string[] = [];
  lines.push('========================================================================');
  lines.push('       COMPAS & FALSETAS - MON CARNET D’ÉTUDE & NOTES PERSONNELLES      ');
  lines.push('========================================================================');
  lines.push(`Exporté le : ${dateStr} à ${timeStr}`);
  lines.push(`Total de pièces suivies : ${items.length}`);
  lines.push(`  • Maîtrisées          : ${masteredCount}`);
  lines.push(`  • En cours            : ${learningCount}`);
  lines.push(`  • À travailler        : ${toLearnCount}`);
  lines.push('========================================================================\n');

  if (items.length === 0) {
    lines.push('Aucune pièce enregistrée dans votre carnet d’étude pour l’instant.');
    lines.push('Cliquez sur « Ajouter à mes études » sur une vidéo pour la retrouver ici avec vos notes.\n');
  } else {
    // Group by palo
    const byPalo: Record<string, PracticeBookmark[]> = {};
    items.forEach(item => {
      const key = item.paloName || 'Autres';
      if (!byPalo[key]) byPalo[key] = [];
      byPalo[key].push(item);
    });

    Object.entries(byPalo).forEach(([palo, paloItems]) => {
      lines.push(`\n------------------------------------------------------------------------`);
      lines.push(`PALO : ${palo.toUpperCase()}`);
      lines.push(`------------------------------------------------------------------------`);

      paloItems.forEach((item, idx) => {
        const statusLabel = 
          item.status === 'mastered' ? '✅ Maîtrisée' :
          item.status === 'learning' ? '⏳ En cours d’apprentissage' :
          '📌 À travailler';

        lines.push(`\n[${idx + 1}] ${item.title}`);
        lines.push(`    • Section      : ${item.section}`);
        lines.push(`    • Statut       : ${statusLabel}`);
        lines.push(`    • Lien vidéo   : ${item.url}`);

        // Personal notes
        const note = notesStore[item.videoId];
        if (note && note.trim().length > 0) {
          lines.push(`    • Mes notes personnelles :`);
          note.split('\n').forEach(nl => {
            lines.push(`        ${nl}`);
          });
        }

        // Custom landmarks
        const lmList = landmarksStore[item.videoId];
        if (lmList && lmList.length > 0) {
          lines.push(`    • Mes repères chronométrés (${lmList.length}) :`);
          lmList.forEach(lm => {
            const mins = Math.floor(lm.timeSeconds / 60);
            const secs = (lm.timeSeconds % 60).toString().padStart(2, '0');
            lines.push(`        - ${mins}:${secs} : ${lm.label}`);
          });
        }
      });
    });
  }

  // Choreo progress if any
  const choreoKeys = Object.keys(choreoStore);
  if (choreoKeys.length > 0) {
    lines.push(`\n\n========================================================================`);
    lines.push(`PROGRESSION SUR LES ÉTAPES DE CHORÉGRAPHIE (DANSE)`);
    lines.push(`========================================================================`);
    choreoKeys.forEach(pId => {
      const steps = choreoStore[pId] || [];
      if (steps.length > 0) {
        lines.push(`• Palo "${pId}" : étapes validées [${steps.sort((a,b)=>a-b).join(', ')}]`);
      }
    });
  }

  lines.push('\n========================================================================');
  lines.push('Généré depuis Compas & Falsetas - Guitare & Danse Flamenca');
  lines.push('========================================================================');

  return lines.join('\n');
}

export function exportFavoritesAndNotesAsJSON(): string {
  const bookmarks = getBookmarks();
  const rawNotes = localStorage.getItem(STORAGE_NOTES_KEY);
  const notes = rawNotes ? JSON.parse(rawNotes) : {};
  const rawLandmarks = localStorage.getItem(STORAGE_LANDMARKS_KEY);
  const landmarks = rawLandmarks ? JSON.parse(rawLandmarks) : {};
  const rawChoreo = localStorage.getItem(STORAGE_CHOREO_KEY);
  const choreoChecklist = rawChoreo ? JSON.parse(rawChoreo) : {};
  const rawMontages = localStorage.getItem(STORAGE_DANSE_MONTAGES_KEY);
  const danseMontages = rawMontages ? JSON.parse(rawMontages) : {};

  const payload = {
    version: '1.0',
    type: 'compas_flamencas_user_progress',
    exportedAt: new Date().toISOString(),
    bookmarks,
    notes,
    landmarks,
    choreoChecklist,
    danseMontages
  };

  return JSON.stringify(payload, null, 2);
}

export function importFavoritesAndNotesFromJSON(jsonString: string): { success: boolean; count: number; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, count: 0, message: "Format de fichier invalide (pas un objet JSON valide)." };
    }

    let restoredBookmarks = 0;
    let restoredNotes = 0;

    // Merge bookmarks
    if (data.bookmarks && typeof data.bookmarks === 'object') {
      const currentBookmarks = getBookmarks();
      Object.entries(data.bookmarks).forEach(([k, v]) => {
        currentBookmarks[k] = v as PracticeBookmark;
        restoredBookmarks++;
      });
      localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(currentBookmarks));
    }

    // Merge notes
    if (data.notes && typeof data.notes === 'object') {
      const rawNotes = localStorage.getItem(STORAGE_NOTES_KEY);
      const currentNotes = rawNotes ? JSON.parse(rawNotes) : {};
      Object.entries(data.notes).forEach(([k, v]) => {
        if (typeof v === 'string') {
          currentNotes[k] = v;
          restoredNotes++;
        }
      });
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(currentNotes));
    }

    // Merge landmarks
    if (data.landmarks && typeof data.landmarks === 'object') {
      const rawLm = localStorage.getItem(STORAGE_LANDMARKS_KEY);
      const currentLm = rawLm ? JSON.parse(rawLm) : {};
      Object.entries(data.landmarks).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          currentLm[k] = v;
        }
      });
      localStorage.setItem(STORAGE_LANDMARKS_KEY, JSON.stringify(currentLm));
    }

    // Merge choreo
    if (data.choreoChecklist && typeof data.choreoChecklist === 'object') {
      const rawCh = localStorage.getItem(STORAGE_CHOREO_KEY);
      const currentCh = rawCh ? JSON.parse(rawCh) : {};
      Object.entries(data.choreoChecklist).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          currentCh[k] = v;
        }
      });
      localStorage.setItem(STORAGE_CHOREO_KEY, JSON.stringify(currentCh));
    }

    // Merge danse montages
    if (data.danseMontages && typeof data.danseMontages === 'object') {
      const rawM = localStorage.getItem(STORAGE_DANSE_MONTAGES_KEY);
      const currentM = rawM ? JSON.parse(rawM) : {};
      Object.entries(data.danseMontages).forEach(([paloKey, montageObj]) => {
        currentM[paloKey] = montageObj;
      });
      localStorage.setItem(STORAGE_DANSE_MONTAGES_KEY, JSON.stringify(currentM));
    }

    // Trigger update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_data_imported'));
      window.dispatchEvent(new Event('flamenco_landmarks_updated'));
      window.dispatchEvent(new Event('flamenco_montages_updated'));
    }

    return {
      success: true,
      count: restoredBookmarks,
      message: `${restoredBookmarks} pièce(s) et ${restoredNotes} note(s) restaurée(s) avec succès !`
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: "Erreur lors de la lecture du fichier : " + (err?.message || "format JSON corrompu")
    };
  }
}

export function triggerFileDownload(content: string, filename: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

export interface DanseFolderNode {
  id: string;
  paloId: string;
  name: string;
  parentId?: string | null;
  createdAt: number;
  category?: 'biblio' | 'studio';
}

const STORAGE_DANSE_FOLDERS_KEY = 'flamenco_danse_folders_v1';
const STORAGE_TREE_VIEW_MODE_KEY = 'flamenco_farruca_tree_view_mode_v1';

export function getDanseFolders(paloId: string): DanseFolderNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_FOLDERS_KEY);
    const store: Record<string, DanseFolderNode[]> = raw ? JSON.parse(raw) : {};
    let folders = store[paloId] || [];

    let hasChanges = false;

    // Mettre à jour "Essai" vers "Essais" avec un s
    folders = folders.map(f => {
      if (f.id === 'folder_farruca_essai' && f.name === 'Essai') {
        hasChanges = true;
        return { ...f, name: 'Essais' };
      }
      return f;
    });

    if (paloId.includes('farruca') && !folders.some(f => (f.name.toLowerCase() === 'essai' || f.name.toLowerCase() === 'essais') && f.parentId === 'maitres')) {
      const defaultEssai: DanseFolderNode = {
        id: 'folder_farruca_essai',
        paloId,
        name: 'Essais',
        parentId: 'maitres',
        createdAt: 1700000000000
      };
      folders = [...folders, defaultEssai];
      hasChanges = true;
    }

    // Initialisation des dossiers de l'Atelier de création sous le dossier Farruca :
    // 1. Mes chorégraphies, 2. Mes llamadas, 3. Mes remate
    const hasStudioChoreo = folders.some(f => (f.category === 'studio' || f.id.includes('choregraphies')) && f.name.toLowerCase().includes('chorégraphie'));
    if (!hasStudioChoreo) {
      const defaultStudioFolders: DanseFolderNode[] = [
        {
          id: `folder_${paloId}_choregraphies`,
          paloId,
          name: 'Mes chorégraphies',
          parentId: null,
          category: 'studio',
          createdAt: 1700000000010
        },
        {
          id: `folder_${paloId}_llamadas`,
          paloId,
          name: 'Mes llamadas',
          parentId: null,
          category: 'studio',
          createdAt: 1700000000020
        },
        {
          id: `folder_${paloId}_remates`,
          paloId,
          name: 'Mes remate',
          parentId: null,
          category: 'studio',
          createdAt: 1700000000030
        }
      ];
      folders = [...folders, ...defaultStudioFolders];
      hasChanges = true;
    }

    if (hasChanges) {
      store[paloId] = folders;
      try {
        localStorage.setItem(STORAGE_DANSE_FOLDERS_KEY, JSON.stringify(store));
      } catch {}
    }

    return folders;
  } catch {
    return [];
  }
}

export function saveDanseFolder(paloId: string, name: string, parentId?: string | null, category?: 'biblio' | 'studio'): DanseFolderNode {
  const folders = getDanseFolders(paloId);
  let effectiveCategory = category;
  if (parentId) {
    const parent = folders.find(f => f.id === parentId);
    if (parent?.category === 'studio') {
      effectiveCategory = 'studio';
    }
  }
  const newFolder: DanseFolderNode = {
    id: `folder_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    paloId,
    name: name.trim(),
    parentId: parentId || null,
    category: effectiveCategory,
    createdAt: Date.now()
  };
  const updated = [...folders, newFolder];
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_FOLDERS_KEY);
    const store: Record<string, DanseFolderNode[]> = raw ? JSON.parse(raw) : {};
    store[paloId] = updated;
    localStorage.setItem(STORAGE_DANSE_FOLDERS_KEY, JSON.stringify(store));
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_danse_folders_updated'));
    }
  } catch (e) {
    console.error('Failed to save folder', e);
  }
  return newFolder;
}

export function renameDanseFolder(paloId: string, folderId: string, newName: string): DanseFolderNode[] {
  const folders = getDanseFolders(paloId);
  const updated = folders.map(f => f.id === folderId ? { ...f, name: newName.trim() } : f);
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_FOLDERS_KEY);
    const store: Record<string, DanseFolderNode[]> = raw ? JSON.parse(raw) : {};
    store[paloId] = updated;
    localStorage.setItem(STORAGE_DANSE_FOLDERS_KEY, JSON.stringify(store));
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_danse_folders_updated'));
    }
  } catch (e) {
    console.error('Failed to rename folder', e);
  }
  return updated;
}

const STORAGE_STANDARD_RENAMES_KEY = 'flamenco_standard_folders_renames_v1';
const STORAGE_STANDARD_DELETED_KEY = 'flamenco_standard_folders_deleted_v1';

export function getStandardFolderRenames(paloId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_STANDARD_RENAMES_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[paloId] || {};
  } catch {
    return {};
  }
}

export function saveStandardFolderRename(paloId: string, folderId: string, newName: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_STANDARD_RENAMES_KEY);
    const store = raw ? JSON.parse(raw) : {};
    if (!store[paloId]) store[paloId] = {};
    store[paloId][folderId] = newName.trim();
    localStorage.setItem(STORAGE_STANDARD_RENAMES_KEY, JSON.stringify(store));
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_danse_folders_updated'));
    }
  } catch (e) {
    console.error('Failed to save standard folder rename', e);
  }
}

export function getStandardFolderDeleted(paloId: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_STANDARD_DELETED_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[paloId] || [];
  } catch {
    return [];
  }
}

export function deleteStandardFolder(paloId: string, folderId: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_STANDARD_DELETED_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const list = store[paloId] || [];
    if (!list.includes(folderId)) {
      list.push(folderId);
    }
    store[paloId] = list;
    localStorage.setItem(STORAGE_STANDARD_DELETED_KEY, JSON.stringify(store));
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_danse_folders_updated'));
    }
  } catch (e) {
    console.error('Failed to delete standard folder', e);
  }
}

export function deleteDanseFolder(paloId: string, folderId: string): DanseFolderNode[] {
  const folders = getDanseFolders(paloId);
  const toDelete = new Set<string>([folderId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of folders) {
      if (f.parentId && toDelete.has(f.parentId) && !toDelete.has(f.id)) {
        toDelete.add(f.id);
        changed = true;
      }
    }
  }
  const updated = folders.filter(f => !toDelete.has(f.id));
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_FOLDERS_KEY);
    const store: Record<string, DanseFolderNode[]> = raw ? JSON.parse(raw) : {};
    store[paloId] = updated;
    localStorage.setItem(STORAGE_DANSE_FOLDERS_KEY, JSON.stringify(store));
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_danse_folders_updated'));
    }
  } catch (e) {
    console.error('Failed to delete folder', e);
  }
  return updated;
}

export function getFarrucaTreeViewMode(): 'list' | 'icons' {
  try {
    const v = localStorage.getItem(STORAGE_TREE_VIEW_MODE_KEY);
    if (v === 'icons') {
      localStorage.removeItem(STORAGE_TREE_VIEW_MODE_KEY);
    }
    return 'list';
  } catch {
    return 'list';
  }
}

export function setFarrucaTreeViewMode(mode: 'list' | 'icons'): void {
  try {
    if (mode === 'icons') {
      localStorage.removeItem(STORAGE_TREE_VIEW_MODE_KEY);
    } else {
      localStorage.setItem(STORAGE_TREE_VIEW_MODE_KEY, 'list');
    }
  } catch {}
}

export interface LocalMediaItem {
  id: string;
  title: string;
  url: string;
  sourceType: 'custom' | 'replaced' | 'block_link';
  paloKey: string;
  paloName: string;
  sectionKey: string;
  sectionName: string;
  blockId?: string;
  montageKey?: string;
  sourceDevice: 'pc' | 'mobile' | 'unknown';
  landmarksCount: number;
  hasNotes: boolean;
  level?: Level;
  description?: string;
}

export function getAllLocalMedia(): LocalMediaItem[] {
  const items: LocalMediaItem[] = [];
  const seenIds = new Set<string>();

  const resolvePaloName = (key: string): string => {
    if (key.toLowerCase().includes('farruca')) return 'Farruca (Danse)';
    if (key.toLowerCase().includes('solea')) return 'Soleá';
    if (key.toLowerCase().includes('alegrias')) return 'Alegrías';
    if (key.toLowerCase().includes('bulerias')) return 'Bulerías';
    if (key.toLowerCase().includes('tangos')) return 'Tangos';
    if (key.toLowerCase().includes('seguiriya')) return 'Seguiriya';
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const resolveSectionName = (sec: string): string => {
    const s = sec.toLowerCase();
    if (s === 'cours') return 'Mes Cours & Stages';
    if (s === 'marcajes') return 'Marcajes';
    if (s === 'zapateado') return 'Zapateado';
    if (s === 'llamadas') return 'Llamadas';
    if (s === 'maitres') return 'Grands Maîtres';
    if (s === 'structure') return 'Structure & Remates';
    if (s === 'montages') return 'Montages chorégraphiques';
    return sec;
  };

  // 1. Vidéos ajoutées (custom videos)
  try {
    const customStore = getCustomVideos();
    Object.entries(customStore).forEach(([paloKey, sections]) => {
      Object.entries(sections).forEach(([sectionKey, list]) => {
        if (Array.isArray(list)) {
          list.forEach(v => {
            if (v.isLocalFile || isLocalVideoUrl(v.url)) {
              if (!seenIds.has(v.id)) {
                seenIds.add(v.id);
                const lm = getVideoCustomLandmarks(v.id, v.url);
                const notes = getVideoNotes(v.id);
                items.push({
                  id: v.id,
                  title: v.title || 'Vidéo sans titre',
                  url: v.url || '',
                  sourceType: 'custom',
                  paloKey,
                  paloName: resolvePaloName(paloKey),
                  sectionKey,
                  sectionName: resolveSectionName(sectionKey),
                  sourceDevice: (v.sourceDevice || detectDeviceFromUrl(v.url) || 'unknown') as 'pc' | 'mobile' | 'unknown',
                  landmarksCount: (lm && lm.length > 0) ? lm.length : (v.landmarks?.length || 0),
                  hasNotes: Boolean(notes && notes.trim()),
                  level: v.level,
                  description: v.description
                });
              }
            }
          });
        }
      });
    });
  } catch (e) {
    console.error('Error scanning custom videos for local media', e);
  }

  // 2. Vidéos remplacées (replaced videos)
  try {
    const replacedStore = getReplacedVideos();
    Object.entries(replacedStore).forEach(([oldId, v]) => {
      if (v.isLocalFile || isLocalVideoUrl(v.url)) {
        if (!seenIds.has(v.id)) {
          seenIds.add(v.id);
          const lm = getVideoCustomLandmarks(v.id, v.url);
          const notes = getVideoNotes(v.id);
          items.push({
            id: v.id,
            title: v.title || 'Vidéo remplacée',
            url: v.url || '',
            sourceType: 'replaced',
            paloKey: 'farruca-danse',
            paloName: 'Farruca (Danse)',
            sectionKey: 'maitres',
            sectionName: 'Remplacement de vidéo',
            sourceDevice: (v.sourceDevice || detectDeviceFromUrl(v.url) || 'unknown') as 'pc' | 'mobile' | 'unknown',
            landmarksCount: (lm && lm.length > 0) ? lm.length : (v.landmarks?.length || 0),
            hasNotes: Boolean(notes && notes.trim()),
            level: v.level,
            description: v.description
          });
        }
      }
    });
  } catch (e) {
    console.error('Error scanning replaced videos for local media', e);
  }

  // 3. Liens de blocs de montage (block links)
  try {
    const raw = localStorage.getItem(STORAGE_DANSE_BLOCK_LINKS_KEY);
    const blockStore: Record<string, Record<string, Record<string, BlockVideoLink>>> = raw ? JSON.parse(raw) : {};
    Object.entries(blockStore).forEach(([paloId, montages]) => {
      Object.entries(montages).forEach(([montageKey, blocks]) => {
        Object.entries(blocks).forEach(([blockId, link]) => {
          if (link && link.videoUrl && isLocalVideoUrl(link.videoUrl)) {
            const compositeId = `blocklink-${paloId}-${montageKey}-${blockId}`;
            if (!seenIds.has(compositeId)) {
              seenIds.add(compositeId);
              items.push({
                id: compositeId,
                title: link.videoTitle || `Bloc ${blockId}`,
                url: link.videoUrl || '',
                sourceType: 'block_link',
                paloKey: paloId,
                paloName: resolvePaloName(paloId),
                sectionKey: montageKey,
                sectionName: `Atelier montage (${montageKey})`,
                blockId,
                montageKey,
                sourceDevice: (detectDeviceFromUrl(link.videoUrl) || 'unknown') as 'pc' | 'mobile' | 'unknown',
                landmarksCount: 0,
                hasNotes: false
              });
            }
          }
        });
      });
    });
  } catch (e) {
    console.error('Error scanning montage blocks for local media', e);
  }

  return items;
}

export function updateLocalMediaUrl(
  item: LocalMediaItem,
  newUrl: string,
  newTitle?: string
): boolean {
  if (!newUrl.trim()) return false;
  const cleanUrl = newUrl.trim();
  const cleanTitle = (newTitle || item.title).trim();

  try {
    if (item.sourceType === 'custom') {
      const store = getCustomVideos();
      if (store[item.paloKey] && store[item.paloKey][item.sectionKey]) {
        const idx = store[item.paloKey][item.sectionKey].findIndex(v => v.id === item.id);
        if (idx >= 0) {
          store[item.paloKey][item.sectionKey][idx] = {
            ...store[item.paloKey][item.sectionKey][idx],
            title: cleanTitle,
            url: cleanUrl,
            isLocalFile: isLocalVideoUrl(cleanUrl),
            sourceDevice: isLocalVideoUrl(cleanUrl) ? (detectDeviceFromUrl(cleanUrl) || undefined) : undefined
          };
          localStorage.setItem(STORAGE_CUSTOM_VIDEOS_KEY, JSON.stringify(store));
          scheduleCloudPush();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('flamenco_custom_videos_updated'));
          }
          return true;
        }
      }
    } else if (item.sourceType === 'replaced') {
      const replacedStore = getReplacedVideos();
      if (replacedStore[item.id]) {
        replacedStore[item.id] = {
          ...replacedStore[item.id],
          title: cleanTitle,
          url: cleanUrl,
          isLocalFile: isLocalVideoUrl(cleanUrl),
          sourceDevice: isLocalVideoUrl(cleanUrl) ? (detectDeviceFromUrl(cleanUrl) || undefined) : undefined
        };
        localStorage.setItem(STORAGE_REPLACED_VIDEOS_KEY, JSON.stringify(replacedStore));
        scheduleCloudPush();
        return true;
      }
    } else if (item.sourceType === 'block_link' && item.montageKey && item.blockId) {
      saveDanseBlockLink(item.paloKey, item.montageKey, item.blockId, {
        videoId: item.id,
        videoUrl: cleanUrl,
        videoTitle: cleanTitle,
        landmarkTime: 0,
        landmarkLabel: ''
      });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to update local media to web', err);
    return false;
  }
}

const STORAGE_GUITARE_FOLDERS_KEY = 'flamenco_guitare_folders_v1';

export function getGuitareFolders(paloId: string): DanseFolderNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_GUITARE_FOLDERS_KEY);
    const store: Record<string, DanseFolderNode[]> = raw ? JSON.parse(raw) : {};
    let folders = store[paloId] || [];
    let hasChanges = false;

    // Initialisation des dossiers par défaut de l'Atelier pour la Guitare :
    // 1. Mes falsetas, 2. Mes morceaux, 3. Mes techniques
    const hasStudioFalsetas = folders.some(f => (f.category === 'studio' || f.id.includes('falsetas')) && f.name.toLowerCase().includes('falseta'));
    if (!hasStudioFalsetas) {
      const defaultStudioFolders: DanseFolderNode[] = [
        {
          id: `folder_guitare_${paloId}_falsetas`,
          paloId,
          name: 'Mes falsetas',
          parentId: null,
          category: 'studio',
          createdAt: 1700000000010
        },
        {
          id: `folder_guitare_${paloId}_morceaux`,
          paloId,
          name: 'Mes morceaux',
          parentId: null,
          category: 'studio',
          createdAt: 1700000000020
        },
        {
          id: `folder_guitare_${paloId}_techniques`,
          paloId,
          name: 'Mes techniques & exercices',
          parentId: null,
          category: 'studio',
          createdAt: 1700000000030
        }
      ];
      folders = [...folders, ...defaultStudioFolders];
      hasChanges = true;
    }

    if (hasChanges) {
      store[paloId] = folders;
      try {
        localStorage.setItem(STORAGE_GUITARE_FOLDERS_KEY, JSON.stringify(store));
      } catch {}
    }

    return folders;
  } catch {
    return [];
  }
}

export function saveGuitareFolder(paloId: string, name: string, parentId?: string | null, category?: 'biblio' | 'studio'): DanseFolderNode {
  const folders = getGuitareFolders(paloId);
  let effectiveCategory = category;
  if (parentId) {
    const parent = folders.find(f => f.id === parentId);
    if (parent?.category === 'studio') {
      effectiveCategory = 'studio';
    }
  }
  const newFolder: DanseFolderNode = {
    id: `folder_g_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    paloId,
    name: name.trim(),
    parentId: parentId || null,
    category: effectiveCategory,
    createdAt: Date.now()
  };
  const updated = [...folders, newFolder];
  try {
    const raw = localStorage.getItem(STORAGE_GUITARE_FOLDERS_KEY);
    const store: Record<string, DanseFolderNode[]> = raw ? JSON.parse(raw) : {};
    store[paloId] = updated;
    localStorage.setItem(STORAGE_GUITARE_FOLDERS_KEY, JSON.stringify(store));
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_guitare_folders_updated'));
    }
  } catch (e) {
    console.error('Failed to save guitare folder', e);
  }
  return newFolder;
}

export function renameGuitareFolder(paloId: string, folderId: string, newName: string): DanseFolderNode[] {
  const folders = getGuitareFolders(paloId);
  const updated = folders.map(f => f.id === folderId ? { ...f, name: newName.trim() } : f);
  try {
    const raw = localStorage.getItem(STORAGE_GUITARE_FOLDERS_KEY);
    const store: Record<string, DanseFolderNode[]> = raw ? JSON.parse(raw) : {};
    store[paloId] = updated;
    localStorage.setItem(STORAGE_GUITARE_FOLDERS_KEY, JSON.stringify(store));
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_guitare_folders_updated'));
    }
  } catch (e) {
    console.error('Failed to rename guitare folder', e);
  }
  return updated;
}

export function deleteGuitareFolder(paloId: string, folderId: string): DanseFolderNode[] {
  const folders = getGuitareFolders(paloId);
  const toDelete = new Set<string>([folderId]);
  let added = true;
  while (added) {
    added = false;
    for (const f of folders) {
      if (f.parentId && toDelete.has(f.parentId) && !toDelete.has(f.id)) {
        toDelete.add(f.id);
        added = true;
      }
    }
  }
  const updated = folders.filter(f => !toDelete.has(f.id));
  try {
    const raw = localStorage.getItem(STORAGE_GUITARE_FOLDERS_KEY);
    const store: Record<string, DanseFolderNode[]> = raw ? JSON.parse(raw) : {};
    store[paloId] = updated;
    localStorage.setItem(STORAGE_GUITARE_FOLDERS_KEY, JSON.stringify(store));
    scheduleCloudPush();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flamenco_guitare_folders_updated'));
    }
  } catch (e) {
    console.error('Failed to delete guitare folder', e);
  }
  return updated;
}
