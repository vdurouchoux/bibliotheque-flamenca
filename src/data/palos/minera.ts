import { PaloData } from '../../types';

export const MINERA: PaloData = {
  id: "minera",
  name: "Minera",
  subtitle: "Cante de las Minas – La plainte tellurique des mineurs",
  tag: "Toque libre des mines",
  origin: "La Unión (Murcia) / Carthagène",
  character: "Dramatique, mélancolique, virtuose et profond",
  compas: {
    beats: 1,
    accents: [1],
    defaultBpm: 60,
    minBpm: 40,
    maxBpm: 80,
    description: "Toque libre (ad libitum). Rythme sans compás métrique fixe, dicté par l'émotion et la respiration du chant minier.",
    rhythmType: 'libre'
  },
  harmonie: {
    summary: "La <strong>Minera</strong> appartient aux <em>Cantes de Levante</em>. Elle se joue dans une tonalité dérivée du mode phrygien (tonalité de Minera en Sol# phrygien ou Mi mineur modal avec accord pivot de Sol# / Lab, faisant résonner les cordes graves et aiguës à vide).",
    tonality: "Sol# phrygien modal (avec 6e corde accordée en Ré pour certains maestros)",
    cadence: ["G#", "A", "F#m", "B7", "E"],
    cejillaTips: "Généralement jouée au sillet (sans cejilla) ou avec cejilla case 1 à 3 pour s'adapter au registre du cantaor.",
    chords: [
      { name: "G# (Sol dièse flamenco)", fretText: "4-6-6-5-0-0", description: "Accord tonique fondamental avec cordes 1 et 2 à vide" },
      { name: "A (La majeur modal)", fretText: "x-0-2-2-2-0", description: "Accord de tension de la cadence minera" },
      { name: "F#m (Fa# mineur)", fretText: "2-4-4-2-2-2", description: "Passage mélodique sombre des galeries minières" },
      { name: "E (Mi majeur / mineur)", fretText: "0-2-2-1-0-0", description: "Résolution naturelle sur les basses" }
    ]
  },
  falsetas: {
    1: [
      { id: "min-f-1-1", title: "Entrada et motif mélodique de Minera", url: "https://www.youtube.com/watch?v=pCUeg3BF9T0", level: 1, description: "Arpèges lents et résonances caractéristiques des cordes à vide." }
    ],
    2: [
      { id: "min-f-2-1", title: "Falseta por Minera (Carlos Lora / El Viejín)", url: "https://www.youtube.com/watch?v=pCUeg3BF9T0", level: 2, description: "Jeu de pouce legato et nuances expressives du toque de Levante." }
    ],
    3: [
      { id: "min-f-3-1", title: "Minera de concert - Paco de Lucía", url: "https://www.youtube.com/watch?v=QSPUvSGeH_0", level: 3, description: "Chef-d'œuvre de concert avec arpèges complexes et picados fulgurants." }
    ]
  },
  cante: {
    1: [
      { id: "min-c-1-1", title: "Accompagner la Minera au cante", url: "https://www.youtube.com/watch?v=pCUeg3BF9T0", level: 1, description: "Comment respirer avec le cantaor et poser les accords de soutien." }
    ],
    2: [
      { id: "min-c-2-1", title: "Cante de las Minas - Minera traditionnelle", url: "https://www.youtube.com/watch?v=QSPUvSGeH_0", level: 2, description: "Grand chant des mines avec mélismes tendus." }
    ],
    3: []
  },
  baile: {
    structure: `<div class="structure-title">Structure du Cante & Baile por Minera</div>
1. Introduction de guitare (Toque libre majestueux)<br>
2. Temple et soupir du cantaor<br>
3. Première Letra minera (évocation de la mine et du labeur)<br>
4. Falseta de guitare (souvent arpèges ou trémolo poignant)<br>
5. Deuxième Letra ou transition vers un Taranto (si dansé)<br>
6. Remate ou accélération finale festive`,
    structureSteps: [
      { step: 1, name: "Entrada libre", description: "La guitare installe le climat de recueillement et de tristesse minérale.", compasTips: "Toque libre sans métronome" },
      { step: 2, name: "Temple du cante", description: "Le chanteur pose sa voix dans le registre aigu avec 'ayes' déchirants.", compasTips: "Accords discrets tenus" },
      { step: 3, name: "Letra minera", description: "Strophe poétique racontant l'obscurité du puits et le danger du grisou.", compasTips: "Suivre scrupuleusement la fin de chaque tercio" },
      { step: 4, name: "Falseta expressive", description: "Moment soliste de la guitare avant d'enchaîner ou de conclure.", compasTips: "Trémolo ou arpège p-i-m-a fluide" }
    ],
    structureVideos: [
      { id: "min-str-1", title: "Entrada libre et climat de Minera", url: "https://www.youtube.com/watch?v=QSPUvSGeH_0", level: 2, description: "Illustration de l'entrée de guitare et du silence dramatique." }
    ],
    letraTitle: "Letra traditionnelle minera de La Unión",
    letraSpanish: `En el pozo de San Juan,
a cuatrocientos estados,
se le apagó el candil
a un minero desgraciao,
¡válgame Dios y qué fin!`,
    letraFrench: `Au puits de Saint-Jean,
à quatre cents brasses de profondeur,
la lampe à huile s'est éteinte
d'un mineur infortuné,
mon Dieu, quelle triste fin !`,
    letraVideo: { id: "min-letra-v", title: "Chant et guitare por Minera", url: "https://www.youtube.com/watch?v=pCUeg3BF9T0", level: 2, description: "Interprétation vocale et accompagnement guitare de la letra minera." }
  }
};
