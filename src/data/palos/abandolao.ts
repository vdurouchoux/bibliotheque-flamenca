import { PaloData } from '../../types';

export const ABANDOLAO: PaloData = {
  id: "abandolao",
  name: "Fandangos Abandolaos",
  subtitle: "Rythme ternaire cadencé des monts de Málaga",
  tag: "3 temps cadencé",
  origin: "Málaga / Cordoue (Rondeña, Jabegote, Lucena)",
  character: "Fier, cadencé, champêtre et expressif",
  compas: {
    beats: 3,
    accents: [1],
    defaultBpm: 108,
    minBpm: 80,
    maxBpm: 140,
    description: "Compás ternaire à 3 temps hérité des danses folkloriques andalouses. Rythme 'a compás' soutenu par un jeu de pouce incisif et des rasgueados légers.",
    rhythmType: '3-temps'
  },
  harmonie: {
    summary: "Les <strong>Fandangos Abandolaos</strong> (qui regroupent les Jabegotes, Rondeñas anciennes, Fandangos de Lucena et Verdiales) s'articulent autour du <strong>Mi phrygien</strong> (por arriba) avec modulations majeures typiques (C, G7, F, E).",
    tonality: "Mi phrygien (por arriba)",
    cadence: ["C", "G7", "C", "F", "E"],
    cejillaTips: "Cejilla généralement placée entre les cases 2 et 5 selon la tessiture du cantaor.",
    chords: [
      { name: "E (Mi majeur flamenco)", fretText: "0-2-2-1-0-0", description: "Résolution tonale et repos du compás" },
      { name: "F (Fa flamenco)", fretText: "1-3-3-2-0-0", description: "Demi-ton au-dessus de la tonique avec cordes 1 et 2 à vide" },
      { name: "G7 (Sol 7ème)", fretText: "3-2-0-0-0-1", description: "Dominante de préparation pour le Do" },
      { name: "C (Do majeur)", fretText: "x-3-2-0-1-0", description: "Début de la modulation chantée" }
    ]
  },
  intro: {
    title: "Entrada por Abandolaos – Cadence montagnarde et jeu de pouce",
    concept: "Les Fandangos Abandolaos tirent leur nom du rythme des Verdiales et de la mandoline (bandola). L'intro de guitare installe une pulsation ternaire soutenue par un alzapúa de pouce vigoureux qui donne l'élan au chant.",
    howToStart: "1. Positionner la main en Mi flamenco por arriba.\n2. Lancer la rythmique à 3 temps avec l'alternance pouce/index caractéristique des abandolaos.\n3. Balancer entre Fa flamenco et Mi flamenco pour fixer le rythme campagnard.\n4. Conclure l'intro par un remate sec au temps 1 avant de lancer la strophe.",
    compasAdvice: "Mesure à 3 temps, 105-115 BPM. Le pouce de la main droite est le moteur de la cadence.",
    tonalAmbience: "Mi phrygien (por arriba). Champêtre, fier, alerte et cadencé.",
    chordsTips: "E (0-2-2-1-0-0) ➔ F flamenco (1-3-3-2-0-0) ➔ E.",
    videos: [
      { id: "ab-intro-1", title: "Comment Jouer le Compás d'Abandolaos en Guitare - Toño Bernal", url: "https://www.youtube.com/watch?v=hCBaXvZKrgQ", level: 1, description: "Explication claire du compás d'entrée et de la pulsation ternaire avec alzapúa." },
      { id: "ab-intro-2", title: "Première Falseta de Abandolaos - Toño Bernal", url: "https://www.youtube.com/watch?v=AszIOvftHQY", level: 2, description: "Falseta mélodique traditionnelle pour lancer le palo." }
    ]
  },
  falsetas: {
    1: [
      { id: "ab-f-1-1", title: "Compás de base Abandolaos - Toño Bernal", url: "https://www.youtube.com/watch?v=hCBaXvZKrgQ", level: 1, description: "Structure ternaire 1-2-3 avec alzapúa de pouce, rasgueos et découpe du compás." }
    ],
    2: [
      { id: "ab-f-2-1", title: "Première Falseta de Abandolaos - Toño Bernal", url: "https://www.youtube.com/watch?v=AszIOvftHQY", level: 2, description: "Falseta traditionnelle mélodique avec ligados souples et répons au pouce." },
      { id: "ab-f-2-2", title: "Falseta de Enrique de Melchor por Abandolaos", url: "https://www.youtube.com/watch?v=cWQWnFsdyoc", level: 2, description: "Falseta de concert du maître Enrique de Melchor avec doigtés précis." }
    ],
    3: []
  },
  cante: {
    1: [
      { id: "ab-c-1-1", title: "Accompagnement du compás abandolao", url: "https://www.youtube.com/watch?v=hCBaXvZKrgQ", level: 1, description: "Rythmique de soutien au compás pour porter le chant sans l'étouffer." }
    ],
    2: [
      { id: "ab-c-2-1", title: "Fandango del Cojo de Málaga - Bonela Hijo", url: "https://www.youtube.com/watch?v=dltK_Fv_pMI", level: 2, description: "Interprétation de référence avec chant fier et orné." }
    ],
    3: []
  },
  baile: {
    structure: `<div class="structure-title">Structure du Baile Abandolao</div>
1. Introduction de guitare (Entrada au compás de 3 temps)<br>
2. Temple et Salida du chant<br>
3. Première Letra (marcaje vif et promenades)<br>
4. Llamada et Remate net sur le premier temps<br>
5. Escobilla (travail rythmique des pieds)<br>
6. Cierre final sur le Mi flamenco`,
    structureSteps: [
      { step: 1, name: "Entrada guitare", description: "Pose du rythme à 3 temps, pulsation ferme et régulière.", compasTips: "Temps 1 accentué, rasgueados 2 et 3" },
      { step: 2, name: "Salida du cante", description: "Le chanteur annonce la strophe avec de longues tenues.", compasTips: "Guitare discrète mais restant strictement au compás" },
      { step: 3, name: "Letra chantée", description: "Strophe poétique de 5 vers (quintilla) répétée.", compasTips: "Modulation Do -> Sol7 -> Do -> Fa -> Mi" },
      { step: 4, name: "Remate final", description: "Clôture nette de la strophe sur le premier temps.", compasTips: "Coupure nette (corte) sur l'accord de Mi" }
    ],
    structureVideos: [
      { id: "ab-str-1", title: "Entrada et compás de danse abandolao - Toño Bernal", url: "https://www.youtube.com/watch?v=hCBaXvZKrgQ", level: 1, description: "Mise en place de la cadence et de l'entrée de la guitare sans parole superflue." }
    ],
    letraTitle: "Fandango abandolao traditionnel",
    letraSpanish: `A la sombra de un laurel
me puse a considerar
lo poco que vale un hombre
cuando no tiene qué dar,
ni qué le puedan valer.`,
    letraFrench: `À l'ombre d'un laurier
je me suis mis à méditer
sur le peu que vaut un homme
lorsqu'il n'a rien à donner,
et que personne ne peut l'aider.`,
    letraVideo: { id: "ab-letra-v", title: "Exemple chanté - Fandango abandolao", url: "https://www.youtube.com/watch?v=dltK_Fv_pMI", level: 2, description: "Chant traditionnel avec répons de guitare au compás." }
  }
};
