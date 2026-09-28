export type Level = 1 | 2 | 3;

export interface VideoLandmark {
  timeSeconds: number;
  endTimeSeconds?: number;
  label: string;
  type?: 'marcaje' | 'llamada' | 'zapateado' | 'subida' | 'cierre' | 'silencio' | 'remate' | 'intro' | 'letra' | 'falseta';
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  level: Level;
  description?: string;
  isCustom?: boolean;
  startSeconds?: number; // Starting time in seconds to bypass talking intros
  danceInterval?: {
    start: number;       // Start of the specific movement in seconds
    end?: number;        // End of the specific movement in seconds (or undefined if whole section)
    label: string;       // e.g. "Marquages de 0:38 à 2:10"
    type: 'marcaje' | 'llamada' | 'zapateado' | 'subida' | 'cierre' | 'entier' | 'danse-complete';
  };
  landmarks?: VideoLandmark[]; // Key landmarks with one-click jump points
  sourceDevice?: 'pc' | 'mobile'; // Origin device where local video was added
  isLocalFile?: boolean; // Whether the video points to a local file/path instead of a web url
}

export interface BaileSection {
  structure: string;
  structureSteps?: {
    step: number;
    name: string;
    description: string;
    compasTips?: string;
  }[];
  letraTitle?: string;
  letraSpanish: string;
  letraFrench?: string;
  letraVideo?: VideoItem; // Dedicated video/audio illustrating this traditional letra
  structureVideos?: VideoItem[]; // Videos demonstrating specific structural parts (Entrada de guitarra, llamadas, escobilla...)
  videos?: {
    [key in Level]?: VideoItem[];
  };
}

export interface ChordVoicing {
  name: string;
  fretText: string; // e.g. "0-0-2-2-1-0" or custom
  description: string;
  fingers?: string;
}

export interface PaloHarmony {
  summary: string;
  tonality: string; // e.g. "Por medio (La phrygien)", "Por arriba (Mi phrygien)"
  cadence: string[]; // e.g. ["Dm", "C", "Bb", "A"]
  cejillaTips: string;
  chords?: ChordVoicing[];
}

export interface PaloCompas {
  beats: number; // 12 or 4 or 3 or 0 (libre)
  accents: number[]; // e.g. [12, 3, 6, 8, 10] or [1, 2, 3] or [2, 4]
  defaultBpm: number;
  minBpm: number;
  maxBpm: number;
  description: string;
  rhythmType: '12-temps' | '4-temps' | '3-temps' | 'libre';
}

export interface PaloIntro {
  title?: string;
  concept: string; // Explication du rôle de l'entrée dans ce palo
  howToStart: string; // Comment poser la guitare, lancer le compás et installer l'ambiance pas à pas
  compasAdvice: string; // Conseils rythmiques (où compter, appels, silences, remates préparatoires)
  tonalAmbience?: string; // Tonalité et couleur sonore pour créer l'ambiance du palo
  chordsTips?: string; // Accords et enchaînement d'entrée
  videos: VideoItem[]; // Vidéos sélectionnées illustrant directement l'entrée et la mise en compás
}

export interface PaloData {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  origin?: string;
  character: string;
  compas: PaloCompas;
  harmonie: PaloHarmony;
  intro?: PaloIntro;
  falsetas: {
    [key in Level]?: VideoItem[];
  };
  cante: {
    [key in Level]?: VideoItem[];
  };
  baile: BaileSection;
  variants?: { [key: string]: PaloData };
}

export type SectionTab = 'intro' | 'falsetas' | 'cante' | 'baile' | 'harmonie' | 'compas';

export type DisciplineMode = 'guitare' | 'danse' | 'chant';

export type DanseSectionTab = 'hub' | 'structure' | 'maitres' | 'letras' | 'compas' | 'cours' | 'montages';

export interface LetraItem {
  id: string;
  title: string;
  category: string;
  cantaorReference: string;
  salidaText?: string[];
  salidaTranslation?: string[];
  coplaText: string[];
  coplaTranslation: string[];
  estribilloText?: string[];
  estribilloTranslation?: string[];
  contextAndMeaning: string;
  danceCompasTips: string;
  video: VideoItem;
}

export interface DanseChoreographyStep {
  stepNumber: number;
  title: string;
  durationApprox: string;
  description: string;
  danceTips: string[];
  communicationWithGuitar: string;
  keyVideoRefId?: string;
}

export interface DansePaloData {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  origin: string;
  character: string;
  costumeAdvice: string;
  compas: PaloCompas;
  choreographyGuide: {
    overview: string;
    structureSteps: DanseChoreographyStep[];
    mountingTips: string[];
  };
  marcajes?: {
    [key in Level]?: VideoItem[];
  };
  zapateado?: {
    [key in Level]?: VideoItem[];
  };
  llamadas?: {
    [key in Level]?: VideoItem[];
  };
  letras?: LetraItem[];
  maitres: VideoItem[];
}

export interface PracticeBookmark {
  videoId: string;
  paloId: string;
  paloName: string;
  section: string;
  title: string;
  url: string;
  level: Level;
  status: 'to_learn' | 'learning' | 'mastered';
  notes?: string;
  discipline?: DisciplineMode;
  savedAt: number;
}

export interface MontageBlock {
  id: string;
  title: string;
  description: string;
  danceTips: string;
  guitarCode: string;
  durationApprox?: string;
}

export interface BlockVideoLink {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  landmarkTime: number; // in seconds
  landmarkLabel: string; // e.g. "1:48 - Escobilla"
  sectionName?: string;
}

export interface DanseMontageStore {
  [paloId: string]: {
    [montageKey: string]: MontageBlock[];
  };
}
