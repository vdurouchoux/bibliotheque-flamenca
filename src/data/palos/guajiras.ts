import { PaloData } from '../../types';

export const GUAJIRAS: PaloData = {
  id: "guajiras",
  name: "Guajiras",
  subtitle: "Cante d'Ida y Vuelta aux parfums suaves de La Havane",
  tag: "12 temps majeur / Cuba",
  origin: "Cuba / Séville / Cadix",
  character: "Sensuel, raffiné, dansant, élégant et exotique",
  compas: {
    beats: 12,
    accents: [12, 3, 6, 8, 10],
    defaultBpm: 110,
    minBpm: 80,
    maxBpm: 150,
    description: "Compás à 12 temps avec alternance de mesures à 6/8 et 3/4 (hémioles). Départ traditionnel au temps 12. Accents sur 12, 3, 6, 8, 10.",
    rhythmType: '12-temps'
  },
  harmonie: {
    summary: "Les <strong>Guajiras</strong> se jouent en <strong>La majeur</strong> (tonalité por arriba majeure) avec un balancement créole hérité de la musique cubaine. Alternance lumineuse d'accords majeurs (A, D, E7).",
    tonality: "La majeur (A)",
    cadence: ["A", "D", "E7", "A"],
    cejillaTips: "Cejilla case 1 ou 2 pour éclaircir le brillant de la guitare, ou case 3 à 5 pour le chant.",
    chords: [
      { name: "A (La majeur flamenco)", fretText: "x-0-2-2-2-0", description: "Tonique fondamentale lumineuse" },
      { name: "D (Ré majeur)", fretText: "x-x-0-2-3-2", description: "Sous-dominante apportant l'élan créole" },
      { name: "E7 (Mi 7ème)", fretText: "0-2-0-1-0-0", description: "Dominante de préparation" },
      { name: "A7 (La 7ème)", fretText: "x-0-2-0-2-0", description: "Transition vers le Ré" }
    ]
  },
  intro: {
    title: "Entrada por Guajiras – Balancement créole et sensualité",
    concept: "La Guajira est un cante d'Ida y Vuelta imprégné des parfums de Cuba. L'intro de guitare installe un compás à 12 temps chaloupé en alternant 6/8 et 3/4 avec un départ typique sur le temps 12.",
    howToStart: "1. Positionner la guitare en La majeur (A).\n2. Démarrer avec un battement souple ou un golpe sur le temps 12.\n3. Balancer la cadence A ➔ D ➔ E7 ➔ A avec des rasgueados aérés et des cordes aiguës libres.\n4. Jouer la falseta de salida mélodieuse pour inviter la danse à l'éventail ou le chant caribéen.",
    compasAdvice: "Compás à 12 temps (hémioles 6/8 et 3/4), 105-115 BPM. Départ au temps 12, accents sur 12, 3, 6, 8, 10.",
    tonalAmbience: "La majeur (A). Suave, exotique, lumineux, dansant et élégant.",
    chordsTips: "A (x-0-2-2-2-0) ➔ D (x-x-0-2-3-2) ➔ E7 (0-2-0-1-0-0).",
    videos: [
      { id: "guaj-intro-1", title: "Falseta de Guajiras y Compás d'Entrée", url: "https://www.youtube.com/watch?v=jp6x6ihu8Os", level: 1, description: "Apprentissage du compás à 12 temps en La majeur avec départ sur le temps 12 et falseta d'intro." },
      { id: "guaj-intro-2", title: "Falseta mélodieuse d'Ida y Vuelta", url: "https://www.youtube.com/watch?v=-d3N0mD82hA", level: 2, description: "Arpèges et liés élégants pour installer l'ambiance havanaise." }
    ]
  },
  falsetas: {
    1: [
      { id: "guaj-f-1-1", title: "Entrada et compás de Guajiras", url: "https://www.youtube.com/watch?v=jp6x6ihu8Os", level: 1, description: "Apprentissage du compás à 12 temps en La majeur avec départ sur le temps 12." }
    ],
    2: [
      { id: "guaj-f-2-1", title: "Falseta mélodieuse avec tablature", url: "https://www.youtube.com/watch?v=-d3N0mD82hA", level: 2, description: "Arpèges et liés élégants dans le style d'Ida y Vuelta." }
    ],
    3: []
  },
  cante: {
    1: [
      { id: "guaj-c-1-1", title: "Accompagnement du cante por Guajiras", url: "https://www.youtube.com/watch?v=jp6x6ihu8Os", level: 1, description: "Placer les respirations et le rythme chaloupé avec le chanteur." }
    ],
    2: [
      { id: "guaj-c-2-1", title: "Guajiras chantées complètes", url: "https://www.youtube.com/watch?v=FoxcAIIQqz8", level: 2, description: "Interprétation vocale avec répons de guitare et de castagnettes." }
    ],
    3: []
  },
  baile: {
    structure: `<div class="structure-title">Structure du Baile por Guajiras (Danse à l'éventail)</div>
1. <strong>Entrada de guitare</strong> (Départ au temps 12, compás suave)<br>
2. <strong>Salida cante</strong> (Mélodie d'entrée évoquant Cuba et les tropiques)<br>
3. <strong>Salida del baile</strong> (Entrée gracieuse de la danseuse avec éventail - abanico)<br>
4. <strong>Primera Letra</strong> (Marcaje élégant et jeux de bras avec le châle ou l'éventail)<br>
5. <strong>Falseta de guitare</strong> (Moment musical doux et chantant)<br>
6. <strong>Segunda Letra & Silencio</strong> (Passage plus intime)<br>
7. <strong>Escobilla</strong> (Zapateado léger et dansant, sans agressivité)<br>
8. <strong>Subida et final por Bulerías</strong> (Accélération festive gaditane)`,
    structureSteps: [
      { step: 1, name: "Entrada guitare", description: "Pose du balancement créole à 12 temps, départ à 12.", compasTips: "Tempo modéré 100-110 BPM" },
      { step: 2, name: "Entrée danseuse", description: "Déploiement de l'éventail (abanico) et cambrure élégante.", compasTips: "Marcaje feutré au compás" },
      { step: 3, name: "Letra cubano-andalouse", description: "Chant décrivant la canne à sucre, le café et la mer des Caraïbes.", compasTips: "Accords A -> D -> E7 -> A" },
      { step: 4, name: "Escobilla de pieds", description: "Rythmique de talons délicate et musicale.", compasTips: "Claquements clairs sans précipitation" },
      { step: 5, name: "Cierre", description: "Clôture en apothéose avec sortie vive.", compasTips: "Fermeture nette à 10" }
    ],
    structureVideos: [
      { id: "guaj-str-1", title: "Entrada de guitare et compás de Guajiras", url: "https://www.youtube.com/watch?v=jp6x6ihu8Os", level: 1, description: "Mise en place du rythme et de l'entrée de la guitare." },
      { id: "guaj-str-2", title: "Danse complète de Guajiras à l'éventail", url: "https://www.youtube.com/watch?v=FoxcAIIQqz8", level: 2, description: "Chorégraphie complète avec maniement de l'abanico." }
    ],
    letraTitle: "Guajira traditionnelle cubano-andalouse",
    letraSpanish: `Me gusta por la mañana,
después de haberme levantao,
tomarme un café de aroma
con el cigarro encendío,
viendo pasar a mi cubana.`,
    letraFrench: `J'aime le matin,
après m'être éveillé,
prendre un café parfumé
avec mon cigare allumé,
en regardant passer ma Cubaine.`,
    letraVideo: { id: "guaj-letra-v", title: "Guajiras chantées et dansées", url: "https://www.youtube.com/watch?v=FoxcAIIQqz8", level: 2, description: "Interprétation complète du cante de Guajiras." }
  }
};
