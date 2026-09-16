import { PaloData } from '../../types';

export const FANDANGOS: PaloData = {
  id: "fandangos",
  name: "Fandangos",
  subtitle: "Fandangos de Huelva & Fandangos Naturales – L'âme de l'Andalousie",
  tag: "3 temps syncopé",
  origin: "Huelva / Alosno",
  character: "Enjoué, passionné, mélodique, populaire et profond",
  compas: {
    beats: 3,
    accents: [1],
    defaultBpm: 115,
    minBpm: 85,
    maxBpm: 155,
    description: "Mesure ternaire à 3/4 avec valse flamenca syncopée et fermetures caractéristiques sur le premier temps. Les Fandangos de Huelva sont mesurés rigoureusement 'a compás', tandis que les Fandangos Naturales sont interprétés ad libitum.",
    rhythmType: '3-temps'
  },
  harmonie: {
    summary: "Les <strong>Fandangos</strong> sont bâtis sur une alternance perpétuelle entre le mode flamenco en <strong>Mi phrygien</strong> (pendant les falsetas et les rythmiques de guitare) et le mode majeur (Do - Sol7 - Do - Fa - Mi) qui accompagne les strophes poétiques chantées.",
    tonality: "Mi phrygien (por arriba) avec modulations majeures",
    cadence: ["C", "G7", "C", "F", "E"],
    cejillaTips: "Cejilla fréquente entre les cases 2 et 5 selon la voix du chanteur.",
    chords: [
      { name: "E (Mi majeur flamenco)", fretText: "0-2-2-1-0-0", description: "Accord de résolution du compás" },
      { name: "F (Fa flamenco)", fretText: "1-3-3-2-0-0", description: "Sous-tonique phrygienne avec cordes aiguës libres" },
      { name: "G7 (Sol 7ème)", fretText: "3-2-0-0-0-1", description: "Appel de la modulation majeure" },
      { name: "C (Do majeur)", fretText: "x-3-2-0-1-0", description: "Début de la strophe chantée" }
    ]
  },
  intro: {
    title: "Entrada por Fandangos de Huelva – Balancement ternaire et appel",
    concept: "Les Fandangos de Huelva se distinguent par une pulsation entraînante à 3 temps. L'intro de guitare installe le compás de valse flamenca syncopée et prépare l'entrée vocale en modulant vers le mode majeur.",
    howToStart: "1. Positionner la guitare en Mi flamenco por arriba.\n2. Lancer la rythmique à 3/4 avec un rasgueo net sur le temps 1 suivi des battements 2 et 3.\n3. Faire tourner la cadence Fa flamenco ➔ Mi flamenco pour asseoir le soniquete de Huelva.\n4. Exécuter un remate sec ou une falseta d'entrée (comme Aires Choqueros de Paco de Lucía ou Niño Ricardo).",
    compasAdvice: "Mesure à 3 temps : accentuez bien le 1er temps sans écraser les temps 2 et 3. Tempo moyen : 110 à 120 BPM.",
    tonalAmbience: "Mi phrygien avec transition Do majeur. Ensoleillé, populaire, fier et entraînant.",
    chordsTips: "E (0-2-2-1-0-0) ➔ F flamenco (1-3-3-2-0-0) ➔ G7 ➔ C pour inviter le chant.",
    videos: [
      { id: "fan-intro-1", title: "Intro Aires Choqueros de Paco de Lucía (Fandangos de Huelva)", url: "https://www.youtube.com/watch?v=sL8Lr1xP85c", level: 2, description: "L'introduction légendaire de Paco de Lucía décortiquée note à note avec le compás de Huelva." },
      { id: "fan-intro-2", title: "Falseta de Fandangos de Huelva du Niño Ricardo", url: "https://www.youtube.com/watch?v=vCPXFjuqckU", level: 1, description: "Toque traditionnel pour débuter et installer la cadence sans détours." }
    ]
  },
  falsetas: {
    1: [
      { id: "fan-f-1-1", title: "Falseta facile Enrique de Melchor por Fandangos", url: "https://www.youtube.com/watch?v=eDXcAy_mwh4", level: 1, description: "Falseta d'école incontournable avec doigtés clairs et ligados chantants." }
    ],
    2: [
      { id: "fan-f-2-1", title: "Falseta de Fandangos de Huelva traditionnelle", url: "https://www.youtube.com/watch?v=EijCqMcdpKY", level: 2, description: "Jeu de pouce vigoureux et variations rythmiques au compás." }
    ],
    3: []
  },
  cante: {
    1: [
      { id: "fan-c-1-1", title: "Comment jouer facilement les Fandangos pour le cante", url: "https://www.youtube.com/watch?v=EijCqMcdpKY", level: 1, description: "Placement précis des 5 vers chantés et des relances de guitare." }
    ],
    2: [
      { id: "fan-c-2-1", title: "Accompagnement de Fandangos de Huelva variés", url: "https://www.youtube.com/watch?v=eDXcAy_mwh4", level: 2, description: "Styles d'Alosno, de Santa Eulalia et de Calañas." }
    ],
    3: []
  },
  baile: {
    structure: `<div class="structure-title">Structure du Baile por Fandangos de Huelva</div>
1. <strong>Entrada de guitare</strong> (Pose du compás ternaire énergique)<br>
2. <strong>Salida cante</strong> (Mélodie d'introduction vocale)<br>
3. <strong>Primera Letra</strong> (Marcaje dynamique et pas de fandango)<br>
4. <strong>Falseta de liaison</strong> (Respiration musicale de la guitare)<br>
5. <strong>Segunda Letra & Zapateado</strong> (Travail de pieds sur les contretemps)<br>
6. <strong>Remate & Cierre</strong> (Arrêt sec et franc sur le temps 1)`,
    structureSteps: [
      { step: 1, name: "Entrada de guitare", description: "Pose du rythme à 3/4 avec rasgueado franc.", compasTips: "Pulsation 110-120 BPM" },
      { step: 2, name: "Salida cante", description: "Lancement de la première strophe.", compasTips: "Guitare attentive à la voix" },
      { step: 3, name: "Letra chantée", description: "Quintilla de vers populaires avec reprise du refrain.", compasTips: "Modulation C -> G7 -> C -> F -> E" },
      { step: 4, name: "Zapateado", description: "Jeux de pieds vifs en harmonie avec le chant.", compasTips: "Temps 1 toujours marqué" },
      { step: 5, name: "Cierre net", description: "Arrêt énergique sur l'accord de Mi.", compasTips: "Coupure nette au temps 1" }
    ],
    structureVideos: [
      { id: "fan-str-1", title: "Falseta Aires Choqueros (Paco de Lucía) - César Martínez", url: "https://www.youtube.com/watch?v=sL8Lr1xP85c", level: 2, description: "Falseta et compás de référence joués directement à différents tempos (70 à 115 BPM)." },
      { id: "fan-str-2", title: "Falseta de Fandangos de Huelva du Niño Ricardo - Rafael Roldán", url: "https://www.youtube.com/watch?v=vCPXFjuqckU", level: 2, description: "Falseta historique de référence avec doigtés et placement rythmique précis." },
      { id: "fan-str-3", title: "Falseta de Fandangos avec Tablatures", url: "https://www.youtube.com/watch?v=hcb-YLEC92Q", level: 1, description: "Décomposition pas à pas avec tablatures interactives au compás." }
    ],
    letraTitle: "Fandango classique de Huelva (Calle Real)",
    letraSpanish: `Calle Real de Huelva,
qué bonita estás de noche,
con tus faroles de gas,
que alumbran a las mocitas
que van a la madrugá.`,
    letraFrench: `Grand-rue de Huelva,
comme tu es belle la nuit,
avec tes réverbères à gaz,
qui éclairent les jeunes filles
qui s'en vont au petit matin.`,
    letraVideo: { id: "fan-letra-v", title: "Fandangos de Huelva pour le chant", url: "https://www.youtube.com/watch?v=EijCqMcdpKY", level: 1, description: "Exemple chanté et guidé à la guitare." }
  }
};
