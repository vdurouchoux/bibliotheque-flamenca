import { PaloData } from '../../types';

export const VERDIALES: PaloData = {
  id: "verdiales",
  name: "Verdiales",
  subtitle: "Le fandango primitif et carnavalesque des monts de Málaga",
  tag: "3 temps folklorique",
  origin: "Montes de Málaga / Comares / Almogía",
  character: "Joyeux, rustique, carnavalesque, vigoureux et enivrant",
  compas: {
    beats: 3,
    accents: [1],
    defaultBpm: 126,
    minBpm: 90,
    maxBpm: 160,
    description: "Compás à 3 temps joué très rapidement et sans interruption. Le rythme est scandé par le rasgueo continu de la guitare, les castagnettes et les sonajas du pandero.",
    rhythmType: '3-temps'
  },
  harmonie: {
    summary: "Les <strong>Verdiales</strong> sont l'une des formes les plus archaïques du fandango andalou. Harmoniquement ancrées en <strong>Mi phrygien</strong> (por arriba), elles modulent vers le Do majeur et Sol7 pendant les strophes chantées.",
    tonality: "Mi phrygien (por arriba)",
    cadence: ["C", "G7", "C", "F", "E"],
    cejillaTips: "Cejilla généralement case 2, 3 ou 4 pour les pandas de verdiales.",
    chords: [
      { name: "E (Mi majeur flamenco)", fretText: "0-2-2-1-0-0", description: "Accord de base de la danse" },
      { name: "F (Fa flamenco)", fretText: "1-3-3-2-0-0", description: "Tension caractéristique phrygienne" },
      { name: "G7 (Sol 7ème)", fretText: "3-2-0-0-0-1", description: "Ouverture du chant" },
      { name: "C (Do majeur)", fretText: "x-3-2-0-1-0", description: "Début de la copla de verdiales" }
    ]
  },
  falsetas: {
    1: [
      { id: "ver-f-1-1", title: "Entrada et mélodie des Verdiales", url: "https://www.youtube.com/watch?v=Rl6Kros1xz0", level: 1, description: "Mélodie folklorique typique et rasgueado rapide à 3 temps." }
    ],
    2: [
      { id: "ver-f-2-1", title: "Verdiales style Comares à la guitare", url: "https://www.youtube.com/watch?v=Rl6Kros1xz0", level: 2, description: "Jeu vigoureux avec ornementations de médiator ou d'index." }
    ],
    3: []
  },
  cante: {
    1: [
      { id: "ver-c-1-1", title: "Accompagner les coplas de Verdiales", url: "https://www.youtube.com/watch?v=Rl6Kros1xz0", level: 1, description: "Apprendre la cadence de strophe et les respirations des chanteurs paysans." }
    ],
    2: []
  },
  baile: {
    structure: `<div class="structure-title">Structure de la Fiesta de Verdiales</div>
1. Paseíllo d'entrée de la Panda (défilé au rythme du violon et des guitares)<br>
2. Subida du rythme et entrée des couples de danseurs<br>
3. Coplas chantées en alternance (letra 1, letra 2)<br>
4. Pas de sauts, bras levés et virevoltes traditionnelles<br>
5. Remate collectif et célébration finale`,
    structureSteps: [
      { step: 1, name: "Entrada de guitare", description: "Lancement du rasgueo ininterrompu à 3 temps.", compasTips: "Tempo rapide 120-130 BPM" },
      { step: 2, name: "Entrée du baile", description: "Les danseurs évoluent en couple avec castagnettes.", compasTips: "Maintien rigoureux du temps fort 1" },
      { step: 3, name: "Coplas chantées", description: "Les cantaores lancent des quatrains et quintils vifs.", compasTips: "Accords C -> G7 -> C -> F -> E" },
      { step: 4, name: "Cierre de la panda", description: "Accélération générale et arrêt en chœur.", compasTips: "Fin nette sur le Mi" }
    ],
    structureVideos: [
      { id: "ver-str-1", title: "Compás et rasgueo des Verdiales", url: "https://www.youtube.com/watch?v=Rl6Kros1xz0", level: 1, description: "Démonstration des accents et de la vitesse du rasgueado." }
    ],
    letraTitle: "Coplas de Verdiales de Málaga",
    letraSpanish: `Viva Málaga la bella,
tierra de tanta alegría,
que tiene por monumento
la torre de la Alcazaba
y la sierra de los montes.`,
    letraFrench: `Vive Malaga la belle,
terre de tant d'allégresse,
qui a pour monument
la tour de l'Alcazaba
et la chaîne des monts.`,
    letraVideo: { id: "ver-letra-v", title: "Exemple chanté des Verdiales", url: "https://www.youtube.com/watch?v=Rl6Kros1xz0", level: 1, description: "Cante traditionnel de fête des monts de Málaga." }
  }
};
