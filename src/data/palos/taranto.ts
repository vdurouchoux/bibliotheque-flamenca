import { PaloData } from '../../types';

export const TARANTO: PaloData = {
  id: "taranto",
  name: "Taranto",
  subtitle: "La danse mesurée des mines – Compás binaire dramatique",
  tag: "4 temps dramatique",
  origin: "Almería / Jaén / Carthagène",
  character: "Sombre, tellurique, altier, percutant et passionné",
  compas: {
    beats: 4,
    accents: [1, 3],
    defaultBpm: 82,
    minBpm: 60,
    maxBpm: 110,
    description: "Compás binaire à 4 temps, dérivé du chant de la Taranta mais mesuré 'a compás' pour permettre la danse. Vitesse lente et majestueuse, avec accélération finale fréquente en Tangos.",
    rhythmType: '4-temps'
  },
  harmonie: {
    summary: "Le <strong>Taranto</strong> se joue dans la tonalité magique de la <strong>Taranta (Fa# phrygien)</strong> avec les cordes 1 (Mi) et 2 (Si) qui résonnent à vide. L'alliance entre cette résonance mystique et le compás binaire lourd crée un climat dramatique sans équivalent.",
    tonality: "Fa# phrygien (modal minero)",
    cadence: ["G", "F#", "Em", "D", "Bm", "F#"],
    cejillaTips: "Généralement joué sans cejilla ou avec cejilla case 1 ou 2 pour éclaircir le timbre.",
    chords: [
      { name: "F# (Fa# flamenco)", fretText: "2-4-4-3-0-0", description: "Accord tonique fondamental avec cordes 1 et 2 à vide" },
      { name: "G (Sol majeur modal)", fretText: "3-2-0-0-0-0", description: "Demi-ton supérieur, tension caractéristique" },
      { name: "Em (Mi mineur)", fretText: "0-2-2-0-0-0", description: "Couleur sombre des profondeurs de la mine" },
      { name: "D (Ré majeur)", fretText: "x-x-0-2-3-2", description: "Étape de la descente harmonique" },
      { name: "Bm (Si mineur)", fretText: "x-2-4-4-3-2", description: "Dominante secondaire" }
    ]
  },
  intro: {
    title: "Entrada por Taranto – L'écho des mines et la gravité binaire",
    concept: "Le Taranto transpose la complainte minérale de la Taranta dans un compás binaire à 4 temps. L'intro de guitare doit faire résonner les cordes à vide en Fa# phrygien avec une gravité tellurique.",
    howToStart: "1. Positionner la main sur le Fa# flamenco modal (2-4-4-3-0-0) avec cordes aiguës libres.\n2. Égrener lentement un arpège ou poser un marcaje à 4 temps lent et lourd (80 BPM).\n3. Faire vibrer le contraste entre l'accord de Fa# et l'accord de Sol (G) au pouce.\n4. Marquer un remate binaire pour lancer le temple du chanteur ou l'entrée altère de la danse.",
    compasAdvice: "Mesure à 4 temps lente : accents marqués sur les temps 1 et 3. Le son doit être ample, lourd et résonnant.",
    tonalAmbience: "Fa# phrygien modal (cordes Si et Mi aigu à vide). Sombre, tellurique, minier, altier.",
    chordsTips: "F# flamenco (2-4-4-3-0-0) ➔ G modal (3-2-0-0-0-0) ➔ F#.",
    videos: [
      { id: "tar-intro-1", title: "Tutorial Tarantos (Toque de las minas) - Juan Martín", url: "https://www.youtube.com/watch?v=BagvdEwIZ-o", level: 1, description: "Introduction de référence posant le compás et l'ambiance des mines." },
      { id: "tar-intro-2", title: "Falseta por Taranto avec Tablatures - Tu Guitarra Flamenca", url: "https://www.youtube.com/watch?v=wI9EQHN-lV4", level: 1, description: "Falseta d'entrée accessible au compás avec doigtés détaillés." }
    ]
  },
  falsetas: {
    1: [
      { id: "tar-f-1-1", title: "Entrada et compás de base du Taranto", url: "https://www.youtube.com/watch?v=nCooRcE_hLA", level: 1, description: "Positions fondamentales en Fa# phrygien et découpage du compás binaire." },
      { id: "tar-f-1-2", title: "Tarantos (Toque de las minas) - Juan Martín", url: "https://www.youtube.com/watch?v=BagvdEwIZ-o", level: 1, description: "Falseta mélodieuse extraite des méthodes classiques de référence." }
    ],
    2: [
      { id: "tar-f-2-1", title: "Falseta de pulgar y alzapúa por Taranto", url: "https://www.youtube.com/watch?v=nCooRcE_hLA", level: 2, description: "Technique de pouce puissant marquant les temps forts du compás." }
    ],
    3: []
  },
  cante: {
    1: [
      { id: "tar-c-1-1", title: "Falseta por Taranto avec Tablatures - Tu Guitarra Flamenca", url: "https://www.youtube.com/watch?v=wI9EQHN-lV4", level: 1, description: "Falseta accessible au compás avec doigtés détaillés et tablature à l'écran." }
    ],
    2: [
      { id: "tar-c-2-1", title: "Falseta por Taranto de référence - Niño Carmelo", url: "https://www.youtube.com/watch?v=Odtdn9u6pMc", level: 2, description: "Toque pur et profond du maître Niño Carmelo, expressivité minera directe." },
      { id: "tar-c-2-2", title: "Tarantos complets cante et guitare", url: "https://www.youtube.com/watch?v=NnQ6rk46NiE", level: 2, description: "Enregistrement de référence avec cantaor de premier plan et guitare." }
    ],
    3: []
  },
  baile: {
    structure: `<div class="structure-title">Structure complète du Baile por Taranto</div>
1. <strong>Entrada de guitare</strong> (Pose du compás solennel en Fa#)<br>
2. <strong>Temple & Salida du cantaor</strong> (Ayes de présentation)<br>
3. <strong>Llamada de entrada</strong> (Le danseur marque son entrée avec force)<br>
4. <strong>Primera Letra</strong> (Marcaje feutré et sobre du chant de la mine)<br>
5. <strong>Falseta de guitare</strong> (Mise en valeur du guitariste)<br>
6. <strong>Segunda Letra</strong> (Deuxième strophe dramatique)<br>
7. <strong>Escobilla</strong> (Zapateado d'une virtuosité tellurique)<br>
8. <strong>Subida & Remate</strong> (Accélération progressive vers les Tangos)<br>
9. <strong>Final en Tangos de Triana ou Granada</strong> (Apothéose festive)`,
    structureSteps: [
      { step: 1, name: "Entrada de guitare", description: "Pulsation 4 temps lente et posée, accord magique de Fa#.", compasTips: "Tempo lent ~80 BPM" },
      { step: 2, name: "Salida cante", description: "Lamentation du chant minier qui s'étire sur le compás.", compasTips: "Guitare discrète" },
      { step: 3, name: "Primera Letra & Marcaje", description: "Le baile danse les vers avec gestuelle altière.", compasTips: "Remater à la fin des strophes" },
      { step: 4, name: "Falseta", description: "Intermède mélodique de la guitare.", compasTips: "Pouce et alzapúa" },
      { step: 5, name: "Escobilla & Subida", description: "Travail des pieds puissant qui accélère la cadence.", compasTips: "Transition graduelle de 80 vers 115 BPM" },
      { step: 6, name: "Final en Tangos", description: "La danse bascule dans le compás des Tangos pour la sortie.", compasTips: "Rythme vif et résolu" }
    ],
    structureVideos: [
      { id: "tar-str-1", title: "Falseta et rythme de Taranto - Tu Guitarra Flamenca", url: "https://www.youtube.com/watch?v=wI9EQHN-lV4", level: 1, description: "Démonstration guitare en main du compás et de la mélodie." },
      { id: "tar-str-2", title: "Entrada de guitare por Taranto - Juan Martín", url: "https://www.youtube.com/watch?v=BagvdEwIZ-o", level: 1, description: "Exemple d'entrée de guitare posant l'atmosphère du palo." }
    ],
    letraTitle: "Letra minera por Taranto",
    letraSpanish: `Ese que va por la esquina,
con la faja de color,
es el capataz de mina
que no tiene compasión
del pobre que se fatiga.`,
    letraFrench: `Celui qui passe au coin de la rue,
avec sa ceinture colorée,
c'est le contremaître de la mine
qui n'a aucune compassion
pour le pauvre ouvrier épuisé.`,
    letraVideo: { id: "tar-letra-v", title: "Tarantos Baile et Cante complets", url: "https://www.youtube.com/watch?v=NnQ6rk46NiE", level: 2, description: "Enregistrement de scène du chant et de la danse du Taranto." }
  }
};
