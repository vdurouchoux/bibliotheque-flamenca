import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, doc, setDoc, getDoc, onSnapshot, getDocFromServer, Unsubscribe 
} from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';
import { SharedMontagePayload } from './storage';

// 1. Initialisation de Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Constantes de stockage local
const STORAGE_WORKSPACE_ID_KEY = 'flamenco_cloud_workspace_id_v2';
const STORAGE_LAST_CLOUD_SYNC_KEY = 'flamenco_last_cloud_sync_timestamp';

export type SyncState = 'connecting' | 'synced' | 'saving' | 'offline' | 'error';

export interface SyncStatusInfo {
  state: SyncState;
  workspaceId: string;
  lastSyncedAt: number | null;
  message?: string;
}

let currentStatus: SyncStatusInfo = {
  state: 'connecting',
  workspaceId: '',
  lastSyncedAt: null,
};

const statusListeners = new Set<(status: SyncStatusInfo) => void>();

function notifyStatusListeners() {
  statusListeners.forEach(listener => {
    try {
      listener({ ...currentStatus });
    } catch (e) {
      console.error('Error notifying sync listener', e);
    }
  });
}

export function subscribeToSyncStatus(callback: (status: SyncStatusInfo) => void): () => void {
  statusListeners.add(callback);
  callback({ ...currentStatus });
  return () => {
    statusListeners.delete(callback);
  };
}

const DEFAULT_GLOBAL_WORKSPACE = 'studio-principal';

/**
 * Récupère ou initialise l'identifiant unique de studio/espace de travail.
 * Si l'URL contient ?workspace=XYZ, elle prévaut et est enregistrée pour lier le téléphone au PC.
 * Par défaut, tous les appareils de l'utilisateur partagent 'studio-principal' pour une synchro immédiate.
 */
export function getOrCreateWorkspaceId(): string {
  if (typeof window === 'undefined') return DEFAULT_GLOBAL_WORKSPACE;

  // 1. Vérifier si un lien d'invitation/synchronisation a été ouvert
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlWorkspace = urlParams.get('workspace') || urlParams.get('ws');
    if (urlWorkspace && urlWorkspace.trim()) {
      const cleanId = urlWorkspace.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      localStorage.setItem(STORAGE_WORKSPACE_ID_KEY, cleanId);
      // Nettoyer l'URL proprement sans rechargement
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('workspace');
        url.searchParams.delete('ws');
        window.history.replaceState(null, '', url.toString());
      } catch {
        // ignore
      }
      return cleanId;
    }
  } catch {
    // ignore
  }

  // 2. Vérifier le localStorage
  try {
    const saved = localStorage.getItem(STORAGE_WORKSPACE_ID_KEY);
    if (saved && saved.trim()) {
      const trimmed = saved.trim();
      // Migration automatique des anciens codes aléatoires temporaires (ex: studio-xxxxx)
      // vers le studio principal commun pour que le téléphone et le PC soient instantanément synchronisés
      const isLegacyRandom = /^studio-[a-z0-9]{5}$/.test(trimmed);
      if (!isLegacyRandom) {
        return trimmed;
      }
    }
  } catch {
    // ignore
  }

  // 3. Par défaut : Studio Principal commun pour relier PC et Mobile automatiquement
  try {
    localStorage.setItem(STORAGE_WORKSPACE_ID_KEY, DEFAULT_GLOBAL_WORKSPACE);
  } catch {
    // ignore
  }
  return DEFAULT_GLOBAL_WORKSPACE;
}

export function setWorkspaceId(newId: string): void {
  const cleanId = newId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  if (!cleanId) return;
  localStorage.setItem(STORAGE_WORKSPACE_ID_KEY, cleanId);
  currentStatus.workspaceId = cleanId;
  notifyStatusListeners();
  // Relancer l'écouteur
  restartCloudSync();
}

/**
 * Prépare toutes les données locales pour les sauvegarder dans Firestore.
 */
function gatherLocalData() {
  const getItem = (k: string) => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // Récupérer tous les ordres personnalisés des espaces d'étude (ex: danse_spaces_order_farruca-baile)
  const danseSpacesOrders: Record<string, string[]> = {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('danse_spaces_order_')) {
          const val = getItem(key);
          if (val && Array.isArray(val)) {
            danseSpacesOrders[key] = val;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    customVideos: getItem('flamenco_custom_videos_v1') || {},
    deletedVideos: getItem('flamenco_deleted_videos_v1') || [],
    replacedVideos: getItem('flamenco_replaced_videos_v1') || {},
    bookmarks: getItem('flamenco_bookmarks_v1') || {},
    notes: getItem('flamenco_video_notes_v1') || {},
    choreoChecklist: getItem('flamenco_choreo_checklist_v1') || {},
    landmarks: getItem('flamenco_video_landmarks_v1') || {},
    danseMontages: getItem('flamenco_danse_montages_v2') || {},
    danseMontageKeysOrder: getItem('flamenco_danse_montage_keys_order_v2') || [],
    danseBlockLinks: getItem('flamenco_danse_block_links_v1') || {},
    danseSpacesOrders,
  };
}

/**
 * Applique les données reçues du Cloud dans le stockage local et réveille les composants React.
 */
function applyRemoteDataToLocal(remote: any) {
  if (!remote || typeof remote !== 'object') return;

  const setItem = (k: string, val: any) => {
    if (val !== undefined && val !== null) {
      try {
        localStorage.setItem(k, JSON.stringify(val));
      } catch (e) {
        console.error(`Failed to write local key ${k}`, e);
      }
    }
  };

  if (remote.customVideos) setItem('flamenco_custom_videos_v1', remote.customVideos);
  if (remote.deletedVideos) setItem('flamenco_deleted_videos_v1', remote.deletedVideos);
  if (remote.replacedVideos) setItem('flamenco_replaced_videos_v1', remote.replacedVideos);
  if (remote.bookmarks) setItem('flamenco_bookmarks_v1', remote.bookmarks);
  if (remote.notes) setItem('flamenco_video_notes_v1', remote.notes);
  if (remote.choreoChecklist) setItem('flamenco_choreo_checklist_v1', remote.choreoChecklist);
  if (remote.landmarks) setItem('flamenco_video_landmarks_v1', remote.landmarks);
  if (remote.danseMontages) setItem('flamenco_danse_montages_v2', remote.danseMontages);
  if (remote.danseMontageKeysOrder) setItem('flamenco_danse_montage_keys_order_v2', remote.danseMontageKeysOrder);
  if (remote.danseBlockLinks) setItem('flamenco_danse_block_links_v1', remote.danseBlockLinks);

  // Synchronisation des ordres personnalisés d'espaces d'étude
  if (remote.danseSpacesOrders && typeof remote.danseSpacesOrders === 'object') {
    Object.entries(remote.danseSpacesOrders).forEach(([k, v]) => {
      if (k.startsWith('danse_spaces_order_') && Array.isArray(v)) {
        setItem(k, v);
      }
    });
  }

  // Déclencher les événements de mise à jour pour que React se ré-affiche en temps réel
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('flamenco_landmarks_updated'));
    window.dispatchEvent(new CustomEvent('flamenco_data_imported'));
    window.dispatchEvent(new CustomEvent('flamenco_montages_updated'));
    window.dispatchEvent(new CustomEvent('flamenco_spaces_order_updated'));
  }
}

let syncDebounceTimer: any = null;
let isPushedFromRemote = false;

/**
 * Envoie l'état local dans Firestore en tâche de fond.
 * Débouncé pour regrouper les frappes ou modifications rapides.
 */
export function scheduleCloudPush(delayMs = 400): void {
  if (isPushedFromRemote) return; // Ne pas ré-écrire ce qu'on vient de recevoir du cloud

  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
  }

  currentStatus.state = 'saving';
  notifyStatusListeners();

  syncDebounceTimer = setTimeout(async () => {
    try {
      const workspaceId = getOrCreateWorkspaceId();
      const localData = gatherLocalData();
      const now = Date.now();

      const docRef = doc(db, 'workspaces', workspaceId);
      await setDoc(docRef, {
        workspaceId,
        updatedAt: now,
        data: localData,
      }, { merge: true });

      localStorage.setItem(STORAGE_LAST_CLOUD_SYNC_KEY, now.toString());
      currentStatus.state = 'synced';
      currentStatus.lastSyncedAt = now;
      notifyStatusListeners();
    } catch (err: any) {
      console.warn('Erreur lors de la sauvegarde Cloud automatique:', err);
      currentStatus.state = !navigator.onLine ? 'offline' : 'error';
      notifyStatusListeners();
    }
  }, delayMs);
}

let activeUnsubscribe: Unsubscribe | null = null;

/**
 * Démarre l'écoute en direct du Cloud Firestore pour synchronisation bidirectionnelle instantanée.
 */
export function startCloudSync(): () => void {
  const workspaceId = getOrCreateWorkspaceId();
  currentStatus.workspaceId = workspaceId;
  currentStatus.state = 'connecting';
  notifyStatusListeners();

  // Test de connexion initial obligatoire selon le skill Firebase
  getDocFromServer(doc(db, 'workspaces', workspaceId))
    .then((snap) => {
      if (snap.exists()) {
        const cloudData = snap.data();
        if (cloudData?.data) {
          const remoteUpdatedAt = cloudData.updatedAt || 0;
          const lastLocalSync = parseInt(localStorage.getItem(STORAGE_LAST_CLOUD_SYNC_KEY) || '0', 10);
          if (remoteUpdatedAt > lastLocalSync) {
            isPushedFromRemote = true;
            applyRemoteDataToLocal(cloudData.data);
            localStorage.setItem(STORAGE_LAST_CLOUD_SYNC_KEY, remoteUpdatedAt.toString());
            setTimeout(() => {
              isPushedFromRemote = false;
            }, 300);
          }
        }
      } else {
        // Premier démarrage : initialiser le document cloud avec les données locales
        scheduleCloudPush(100);
      }
    })
    .catch((err) => {
      if (err instanceof Error && err.message.includes('the client is offline')) {
        currentStatus.state = 'offline';
        notifyStatusListeners();
      }
    });

  const docRef = doc(db, 'workspaces', workspaceId);

  activeUnsubscribe = onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      currentStatus.state = 'synced';
      notifyStatusListeners();
      return;
    }

    const cloudData = snapshot.data();
    const remoteUpdatedAt = cloudData?.updatedAt || 0;
    const lastLocalSync = parseInt(localStorage.getItem(STORAGE_LAST_CLOUD_SYNC_KEY) || '0', 10);

    // Si le cloud a une version plus récente émise par un autre appareil (ex: le PC alors qu'on est sur le mobile)
    if (remoteUpdatedAt > lastLocalSync && cloudData?.data) {
      isPushedFromRemote = true;
      applyRemoteDataToLocal(cloudData.data);
      localStorage.setItem(STORAGE_LAST_CLOUD_SYNC_KEY, remoteUpdatedAt.toString());
      setTimeout(() => {
        isPushedFromRemote = false;
      }, 300);
    }

    currentStatus.state = 'synced';
    currentStatus.lastSyncedAt = remoteUpdatedAt || Date.now();
    notifyStatusListeners();
  }, (err) => {
    console.warn('Firestore snapshot error:', err);
    currentStatus.state = !navigator.onLine ? 'offline' : 'error';
    notifyStatusListeners();
  });

  return () => {
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }
  };
}

export function restartCloudSync(): void {
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }
  startCloudSync();
}

/**
 * Construit l'URL complète avec le workspace pour appairer un téléphone en 1 clic ou QR Code.
 */
export function buildPairingUrl(): string {
  const workspaceId = getOrCreateWorkspaceId();
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.set('workspace', workspaceId);
  return url.toString();
}

/**
 * Sauvegarde un montage partagé dans Firestore pour générer un lien court et propre,
 * sans polluer WhatsApp, Facebook ou les SMS avec des milliers de caractères encodés.
 */
export async function saveSharedMontageCloud(payload: SharedMontagePayload, customId?: string): Promise<string> {
  const cleanPalo = (payload.paloId || 'montage').toLowerCase().replace(/[^a-z0-9]/g, '');
  const rand = Math.random().toString(36).substring(2, 8);
  const shortId = customId || `m_${cleanPalo.slice(0, 8)}_${rand}`;

  try {
    const docRef = doc(db, 'shared_montages', shortId);
    await setDoc(docRef, {
      id: shortId,
      paloId: payload.paloId || 'Farruca',
      author: payload.author || '',
      title: payload.title || '',
      payloadJson: JSON.stringify(payload),
      createdAt: Date.now()
    });
    return shortId;
  } catch (e) {
    console.error('Erreur lors de la sauvegarde cloud du montage partagé', e);
    throw e;
  }
}

/**
 * Récupère un montage partagé depuis Firestore via son identifiant court.
 */
export async function loadSharedMontageCloud(montageId: string): Promise<SharedMontagePayload | null> {
  if (!montageId || !montageId.trim()) return null;
  const cleanId = montageId.trim();

  try {
    const docRef = doc(db, 'shared_montages', cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.payloadJson) {
        return JSON.parse(data.payloadJson) as SharedMontagePayload;
      }
    }
    return null;
  } catch (e) {
    console.error('Erreur lors du chargement cloud du montage', cleanId, e);
    return null;
  }
}

