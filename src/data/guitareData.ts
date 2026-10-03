import { DansePaloData, VideoItem, Level } from '../types';
import { DansePaloPreview } from './baileData';
import { FARRUCA_GUITARE } from './guitare/farrucaGuitare';
import { PALOS_DATA } from './flamencoData';

interface PaloDefinition {
  key: string;
  name: string;
  subtitle: string;
  tag: string;
  highlights: string[];
}

const GUITARE_PALOS_DEFS: PaloDefinition[] = [
  {
    key: "Farruca",
    name: "Farruca",
    subtitle: "Atelier de création & Toque",
    tag: "4 temps binaire",
    highlights: [
      "Structure traditionnelle",
      "Grands Maîtres",
      "Letras & Falsetas",
      "Compás (4 temps)",
      "Cours & Stages",
      "Mon atelier de création"
    ]
  },
  {
    key: "Alegrias",
    name: "Alegrías",
    subtitle: "Cantiñas de Cádiz & Silencio en Do mineur",
    tag: "12 temps festif",
    highlights: [
      "Cantiñas de Cádiz",
      "Grands Maîtres",
      "Silencio en Do mineur",
      "Compás (12 temps)",
      "Falsetas & Escobilla",
      "Mon atelier de création"
    ]
  },
  {
    key: "Solea",
    name: "Soleá",
    subtitle: "La Mère du toque flamenco solennel",
    tag: "12 temps jondo",
    highlights: [
      "Mère du toque flamenco",
      "Grands Maîtres",
      "Paseos & Falsetas",
      "Compás (12 temps)",
      "Llamadas por Soleá",
      "Mon atelier de création"
    ]
  },
  {
    key: "Bulerias",
    name: "Bulerías",
    subtitle: "Virtuosité, rythme & soniquete jerezano",
    tag: "12 temps rapide",
    highlights: [
      "Virtuosité & Fête",
      "Grands Maîtres",
      "Compás jerezano",
      "Remates & Cierres",
      "Falsetas festives",
      "Mon atelier de création"
    ]
  },
  {
    key: "Tangos",
    name: "Tangos",
    subtitle: "Cadence binaire festive de Triana & Grenade",
    tag: "4 temps festif",
    highlights: [
      "Cadence binaire & Fête",
      "Grands Maîtres",
      "Rythme de Triana",
      "Compás (4 temps)",
      "Falsetas & Remates",
      "Mon atelier de création"
    ]
  },
  {
    key: "Seguiriya",
    name: "Seguiriya",
    subtitle: "Tragédie, noirceur & tension dramatique",
    tag: "12 temps asymétrique",
    highlights: [
      "Tragédie & Profondeur",
      "Grands Maîtres",
      "Compás asymétrique",
      "Accords sombres & martelés",
      "Cierre tragique",
      "Mon atelier de création"
    ]
  },
  {
    key: "Fandangos",
    name: "Fandangos",
    subtitle: "Cante & Toque de Huelva aux mélodies lumineuses",
    tag: "3 temps syncopé",
    highlights: [
      "Cante & Toque de Huelva",
      "Grands Maîtres",
      "Compás ternaire (3 temps)",
      "Falsetas traditionnelles",
      "Remates",
      "Mon atelier de création"
    ]
  },
  {
    key: "Guajiras",
    name: "Guajiras",
    subtitle: "Cante de ida y vuelta aux parfums de La Havane",
    tag: "12 temps majeur / Cuba",
    highlights: [
      "Cante de ida y vuelta",
      "Grands Maîtres",
      "Tonalité majeure (La / Mi)",
      "Compás (12 temps)",
      "Sonorité cubaine & festive",
      "Mon atelier de création"
    ]
  },
  {
    key: "Taranto",
    name: "Taranto",
    subtitle: "Chants des mines de Carthagène au compás binaire",
    tag: "4 temps dramatique",
    highlights: [
      "Toque des mines de Carthagène",
      "Grands Maîtres",
      "Compás binaire (4 temps)",
      "Accords en Fa# modal",
      "Montée en puissance",
      "Mon atelier de création"
    ]
  },
  {
    key: "Taranta",
    name: "Taranta",
    subtitle: "Toque libre minier d'Almería et de Jaén",
    tag: "Toque libre en Fa# modal",
    highlights: [
      "Toque libre de Levante",
      "Grands Maîtres",
      "Tonalité Fa# minera",
      "Arpèges & Trémolo",
      "Virtuosité expressive",
      "Mon atelier de création"
    ]
  },
  {
    key: "Granainas",
    name: "Granaínas",
    subtitle: "Lyrisme poétique et arabesques de l'Alhambra",
    tag: "Cante libre",
    highlights: [
      "Cante libre de Grenade",
      "Grands Maîtres",
      "Cadence andalouse en Si",
      "Arpèges lyriques & Media Granaína",
      "Nuances poétiques",
      "Mon atelier de création"
    ]
  },
  {
    key: "Malaguenas",
    name: "Malagueñas",
    subtitle: "Élégance mélodique et noblesse de Málaga",
    tag: "Cante libre",
    highlights: [
      "Toque libre de Málaga",
      "Grands Maîtres",
      "Dérivé du Fandango",
      "Accords en Mi modal (Por Arriba)",
      "Mélodies riches",
      "Mon atelier de création"
    ]
  },
  {
    key: "Minera",
    name: "Minera",
    subtitle: "Sévérité et austérité des entrailles de La Unión",
    tag: "Toque libre des mines",
    highlights: [
      "Chants miniers de la Unión",
      "Grands Maîtres",
      "Toque libre sombre & austère",
      "Harmonies mystiques",
      "Technique du pouce",
      "Mon atelier de création"
    ]
  },
  {
    key: "Abandolao",
    name: "Fandangos Abandolaos",
    subtitle: "Rythme cadencé des monts de Málaga et Lucena",
    tag: "3 temps cadencé",
    highlights: [
      "Fandangos de Málaga & Lucena",
      "Grands Maîtres",
      "Compás ternaire rapide",
      "Rythme de verdial",
      "Accompagnement rythmé",
      "Mon atelier de création"
    ]
  },
  {
    key: "Sevillanas",
    name: "Sevillanas",
    subtitle: "La fête de Séville en quatre coplas traditionnelles",
    tag: "3 temps festif",
    highlights: [
      "Danse & Fête de Séville",
      "Grands Maîtres",
      "4 coplas traditionnelles",
      "Compás ternaire (3 temps)",
      "Rasgueados & Pasodobles",
      "Mon atelier de création"
    ]
  },
  {
    key: "Rumba",
    name: "Rumba Flamenca",
    subtitle: "Toque chaloupé, ventilateur et énergie festive",
    tag: "4 temps binaire",
    highlights: [
      "Rythme dansant & festif",
      "Grands Maîtres",
      "Ventilateur & Golpe",
      "Compás binaire (4 temps)",
      "Accords modernes",
      "Mon atelier de création"
    ]
  },
  {
    key: "Verdiales",
    name: "Verdiales",
    subtitle: "Fêtes champêtres et folklore archaïque de Málaga",
    tag: "3 temps folklorique",
    highlights: [
      "Fêtes des monts de Málaga",
      "Grands Maîtres",
      "Compás ternaire paysan",
      "Paseos traditionnels",
      "Énergie populaire",
      "Mon atelier de création"
    ]
  }
];

function buildGuitarePalo(def: PaloDefinition): DansePaloData {
  if (def.key === 'Farruca') {
    return FARRUCA_GUITARE;
  }

  const p = PALOS_DATA[def.key];
  if (!p) {
    return {
      id: `guitare-${def.key.toLowerCase()}`,
      name: def.name,
      subtitle: def.subtitle,
      tag: def.tag,
      origin: "Tradition flamenca andalouse",
      character: "Toque traditionnel",
      costumeAdvice: "Techniques de guitare flamenca : alzapúa, picado, rasgueados et compás.",
      compas: {
        beats: 12,
        accents: [3, 6, 8, 10, 12],
        defaultBpm: 120,
        minBpm: 80,
        maxBpm: 180,
        description: "Compás flamenco traditionnel",
        rhythmType: '12-temps'
      },
      choreographyGuide: {
        overview: `Monter une pièce de ${def.name} à la guitare requiert une dramaturgie équilibrée : entrée dans le compás, falsetas principales, nuances lyriques et accélération vers le cierre.`,
        structureSteps: [
          {
            stepNumber: 1,
            title: "Salida & Entrada (Introduction)",
            durationApprox: "30s à 1 min",
            description: `Entrée au compás de ${def.name}. Rasgueados légers ou marcajes initiaux pour poser l'ambiance sonore.`,
            danceTips: ["Précision des accents", "Stabilité du tempo initial", "Premier remate franc"],
            communicationWithGuitar: "L'entrée donne l'impulsion rythmique et le tempo de référence."
          },
          {
            stepNumber: 2,
            title: "Thème & Falseta 1 (Exposition)",
            durationApprox: "1 min à 1 min 30",
            description: `Exposition de la première falseta mélodique ou accompagnement du premier tercio de chant.`,
            danceTips: ["Clarté des notes et propreté du jeu", "Fluidité des arpèges et du pouce"],
            communicationWithGuitar: "Harmonie claire et soutien des respirations musicales."
          },
          {
            stepNumber: 3,
            title: "Llamada & Transition",
            durationApprox: "15s à 25s",
            description: `Llamada rythmique tranchante marquant la fin de la première section.`,
            danceTips: ["Rasgueados nets au compás", "Fermeté des golpes et coupure sèche"],
            communicationWithGuitar: "Signal net et autoritaire."
          },
          {
            stepNumber: 4,
            title: "Silencio ou Falseta lyrique",
            durationApprox: "45s à 1 min",
            description: `Moment d'émotion et de nuance. Trémolo ou arpèges lents créant un contraste poétique.`,
            danceTips: ["Douceur du toucher et résonance des basses", "Suspension du temps avant la reprise"],
            communicationWithGuitar: "Écoute du souffle musical et des silences."
          },
          {
            stepNumber: 5,
            title: "Variations & Subida (Montée en intensité)",
            durationApprox: "1 min à 2 min",
            description: `Accélération progressive ou enchaînement de variations rythmiques (alzapúa, picados rapides).`,
            danceTips: ["Augmentation progressive de la cadence", "Régularité sans précipitation"],
            communicationWithGuitar: "Conduire l'énergie vers le sommet du morceau."
          },
          {
            stepNumber: 6,
            title: "Remate & Cierre final",
            durationApprox: "20s à 40s",
            description: `Conclusion magistrale sur un arrêt net au compás ou sortie brillante.`,
            danceTips: ["Dernier accord frappé net", "Silence complet pour laisser vibrer la conclusion"],
            communicationWithGuitar: "Arrêt net et irrévocable."
          }
        ],
        mountingTips: [
          `Structure claire : Construisez votre ${def.name} autour de contrastes bien définis.`,
          "Régularité métronomique : Travaillez chaque falseta au métronome avant d'accélérer.",
          "Art du silence : Ne surchargez pas chaque mesure ; les silences sont l'âme du flamenco."
        ]
      },
      marcajes: {},
      zapateado: {},
      llamadas: {},
      letras: [],
      maitres: [],
      cours: []
    };
  }

  // Extraire les vidéos de falsetas (niveaux 1, 2, 3)
  const allFalsetas: VideoItem[] = [];
  if (p.falsetas) {
    [1, 2, 3].forEach(lvl => {
      const list = p.falsetas?.[lvl as Level] || [];
      allFalsetas.push(...list.map(v => ({ ...v, level: lvl as Level })));
    });
  }

  // Extraire les vidéos d'intro et de cante
  const introVideos = p.intro?.videos || [];
  const canteVideos: VideoItem[] = [];
  if (p.cante) {
    [1, 2, 3].forEach(lvl => {
      const list = p.cante?.[lvl as Level] || [];
      canteVideos.push(...list.map(v => ({ ...v, level: lvl as Level })));
    });
  }

  // Grands maîtres : Falsetas et vidéos de concert de référence
  const maitresVideos = [...allFalsetas];
  // Cours : Tutoriels et vidéos d'accompagnement
  const coursVideos = [...introVideos, ...canteVideos];

  return {
    id: `guitare-${p.id || def.key.toLowerCase()}`,
    name: p.name || def.name,
    subtitle: p.subtitle || def.subtitle,
    tag: p.tag || def.tag,
    origin: p.origin || "Tradition flamenca andalouse",
    character: p.character || "Toque traditionnel",
    costumeAdvice: p.harmonie?.summary || "Techniques de guitare flamenca : alzapúa, picado, rasgueados et compás.",
    compas: p.compas || {
      beats: 12,
      accents: [3, 6, 8, 10, 12],
      defaultBpm: 120,
      minBpm: 80,
      maxBpm: 180,
      description: "Compás flamenco traditionnel",
      rhythmType: '12-temps'
    },
    choreographyGuide: {
      overview: `Monter une pièce de ${p.name || def.name} à la guitare requiert une dramaturgie équilibrée : entrée dans le compás, falsetas principales, nuances lyriques et accélération vers le cierre.`,
      structureSteps: [
        {
          stepNumber: 1,
          title: "Salida & Entrada (Introduction)",
          durationApprox: "30s à 1 min",
          description: `Entrée au compás de ${p.name || def.name}. Rasgueados légers ou marcajes initiaux pour poser l'ambiance sonore.`,
          danceTips: ["Précision des accents", "Stabilité du tempo initial", "Premier remate franc"],
          communicationWithGuitar: "L'entrée donne l'impulsion rythmique et le tempo de référence."
        },
        {
          stepNumber: 2,
          title: "Thème & Falseta 1 (Exposition)",
          durationApprox: "1 min à 1 min 30",
          description: `Exposition de la première falseta mélodique ou accompagnement du premier tercio de chant.`,
          danceTips: ["Clarté des notes et propreté du jeu", "Fluidité des arpèges et du pouce"],
          communicationWithGuitar: "Harmonie claire et soutien des respirations musicales."
        },
        {
          stepNumber: 3,
          title: "Llamada & Transition",
          durationApprox: "15s à 25s",
          description: `Llamada rythmique tranchante marquant la fin de la première section.`,
          danceTips: ["Rasgueados nets au compás", "Fermeté des golpes et coupure sèche"],
          communicationWithGuitar: "Signal net et autoritaire."
        },
        {
          stepNumber: 4,
          title: "Silencio ou Falseta lyrique",
          durationApprox: "45s à 1 min",
          description: `Moment d'émotion et de nuance. Trémolo ou arpèges lents créant un contraste poétique.`,
          danceTips: ["Douceur du toucher et résonance des basses", "Suspension du temps avant la reprise"],
          communicationWithGuitar: "Écoute du souffle musical et des silences."
        },
        {
          stepNumber: 5,
          title: "Variations & Subida (Montée en intensité)",
          durationApprox: "1 min à 2 min",
          description: `Accélération progressive ou enchaînement de variations rythmiques (alzapúa, picados rapides).`,
          danceTips: ["Augmentation progressive de la cadence", "Régularité sans précipitation"],
          communicationWithGuitar: "Conduire l'énergie vers le sommet du morceau."
        },
        {
          stepNumber: 6,
          title: "Remate & Cierre final",
          durationApprox: "20s à 40s",
          description: `Conclusion magistrale sur un arrêt net au compás ou sortie brillante.`,
          danceTips: ["Dernier accord frappé net", "Silence complet pour laisser vibrer la conclusion"],
          communicationWithGuitar: "Arrêt net et irrévocable."
        }
      ],
      mountingTips: [
        `Structure claire : Construisez votre ${p.name || def.name} autour de contrastes bien définis.`,
        "Régularité métronomique : Travaillez chaque falseta au métronome avant d'accélérer.",
        "Art du silence : Ne surchargez pas chaque mesure ; les silences sont l'âme du flamenco."
      ]
    },
    marcajes: {},
    zapateado: {},
    llamadas: {},
    letras: [],
    maitres: maitresVideos,
    cours: coursVideos
  };
}

// 1. Catalogue complet des 17 palos de guitare (TOUS ACCESSIBLES ET DISPONIBLES)
export const GUITARE_PALOS_CATALOG: DansePaloPreview[] = GUITARE_PALOS_DEFS.map(def => ({
  id: def.key,
  name: def.name,
  subtitle: def.subtitle,
  tag: def.tag,
  compasSummary: def.tag,
  isAvailable: true,
  highlights: def.highlights
}));

// 2. Base de données complète indexée par clé, identifiant et nom
export const GUITARE_PALOS_DATA: Record<string, DansePaloData> = {};

GUITARE_PALOS_DEFS.forEach(def => {
  const paloData = buildGuitarePalo(def);
  // Indexer par clé exacte (ex: "Alegrias", "Solea", "Bulerias")
  GUITARE_PALOS_DATA[def.key] = paloData;
  // Indexer par version minuscule (ex: "alegrias", "solea", "bulerias")
  GUITARE_PALOS_DATA[def.key.toLowerCase()] = paloData;
  // Indexer par id interne (ex: "guitare-alegrias")
  GUITARE_PALOS_DATA[paloData.id] = paloData;
  // Indexer par nom complet (ex: "Alegrías", "Soleá")
  GUITARE_PALOS_DATA[paloData.name] = paloData;
  // Variantes avec suffixe "-guitare"
  GUITARE_PALOS_DATA[`${def.key}-guitare`] = paloData;
  GUITARE_PALOS_DATA[`${def.key.toLowerCase()}-guitare`] = paloData;
});
