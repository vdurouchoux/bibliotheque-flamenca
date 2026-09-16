import { PaloData } from '../../types';

export const SEVILLANAS: PaloData = {
  id: "sevillanas",
  name: "Sevillanas",
  subtitle: "La grande danse festive et populaire d'Andalousie",
  tag: "3 temps festif",
  origin: "Séville (Feria de Abril)",
  character: "Festif, gracieux, populaire et rigoureusement codifié",
  compas: {
    beats: 3,
    accents: [1],
    defaultBpm: 120,
    minBpm: 90,
    maxBpm: 155,
    description: "Mesure ternaire à 3/4. Structure de 4 coplas distinctes. Chaque copla comprend 3 parties rythmées reliées par des 'pasadas' et conclues par un arrêt net.",
    rhythmType: '3-temps'
  },
  harmonie: {
    summary: "Les <strong>Sevillanas</strong> se jouent en tonalité mineure (souvent La mineur / Mi7), en majeur (La majeur / Mi7) ou en mode flamenco (Mi phrygien). Chaque copla suit une suite harmonique bien définie avec introduction, couplet et refrain.",
    tonality: "La mineur (Am / E7) ou La majeur (A / E7)",
    cadence: ["Am", "Dm", "G7", "C", "F", "E7"],
    cejillaTips: "Cejilla généralement placée case 2, 3 ou 4 pour convenir aux voix de fête.",
    chords: [
      { name: "Am (La mineur)", fretText: "x-0-2-2-1-0", description: "Accord de base de la première sevillana" },
      { name: "E7 (Mi 7ème)", fretText: "0-2-0-1-0-0", description: "Dominante de tension pour les pasadas" },
      { name: "Dm (Ré mineur)", fretText: "x-x-0-2-3-1", description: "Sous-dominante apportant le côté nostalgique" },
      { name: "C (Do majeur)", fretText: "x-3-2-0-1-0", description: "Éclaircie majeure du refrain" }
    ]
  },
  intro: {
    title: "Entrada por Sevillanas – Lancer le compás et appeler la danse",
    concept: "Dans la Sevillana, l'intro de guitare est codifiée au millimètre : elle annonce le tempo aux danseurs, permet de se placer face à face, et donne le signal universel du départ (la 'pasada').",
    howToStart: "1. Positionner la guitare en La mineur (Am) ou La majeur (A).\n2. Exécuter le rasgueado d'introduction traditionnel à 3 temps.\n3. Jouer la falseta d'entrée ou la mélodie courte qui invite le chanteur et les danseurs.\n4. Marquer le silence d'arrêt net (le 'cierre') sur le temps 1 de la mesure précédant le départ de la danse.",
    compasAdvice: "Mesure à 3 temps, 120-130 BPM. L'arrêt juste avant le début de la danse doit être tranchant comme une lame.",
    tonalAmbience: "La mineur ou La majeur. Festif, gracieux, populaire, évoquant la Feria de Séville.",
    chordsTips: "Am (x-0-2-2-1-0) ➔ E7 (0-2-0-1-0-0) avec rasgueos continus d'intro.",
    videos: [
      { id: "sev-intro-1", title: "COMO TOCAR SEVILLANAS FÁCIL COMPLETAS Y RASGUEOS - Jerónimo de Carmen", url: "https://www.youtube.com/watch?v=tnQPcwdBXjg", level: 1, description: "Tutoriel direct expliquant l'intro, les rasgueos et le placement de chaque section." },
      { id: "sev-intro-2", title: "Entrada et structure de Sevillana pour guitare - Mariano Bailera", url: "https://www.youtube.com/watch?v=JTlMZVEoMxE", level: 1, description: "Démonstration claire du départ de guitare et des arrêts de compás." }
    ]
  },
  falsetas: {
    1: [
      { id: "sev-f-1-1", title: "Introduction et rasgueos des Sevillanas", url: "https://www.youtube.com/watch?v=tnQPcwdBXjg", level: 1, description: "Apprentissage du rasgueado d'entrée et du schéma des 4 sevillanas." }
    ],
    2: [
      { id: "sev-f-2-1", title: "Sevillanas Rocieras complètes", url: "https://www.youtube.com/watch?v=DQxWW2Sl34M", level: 2, description: "Style pèlerin du Rocío avec nuances rythmées et contrechants." }
    ],
    3: []
  },
  cante: {
    1: [
      { id: "sev-c-1-1", title: "Accompagner le chant des 4 Sevillanas", url: "https://www.youtube.com/watch?v=tnQPcwdBXjg", level: 1, description: "Comprendre les départs de chant, les silences et les fermetures de chaque copla." }
    ],
    2: [
      { id: "sev-c-2-1", title: "Sevillanas del Adiós chantées", url: "https://www.youtube.com/watch?v=DQxWW2Sl34M", level: 2, description: "Chant traditionnel avec accords et chœur festif." }
    ],
    3: []
  },
  baile: {
    structure: `<div class="structure-title">Structure des 4 Sevillanas du Baile</div>
<strong>1ª Sevillana :</strong> Entrada, Paseíllos (5), Pasada, Pasos de sevillana, Pasada, Cuatro esquinas, Cierre.<br>
<strong>2ª Sevillana :</strong> Entrada, Paseíllo, Valses/giros (3), Pasada, Pasos y zapateado, Pasada, Cierre.<br>
<strong>3ª Sevillana :</strong> Entrada, Paseíllo, Taconeo/zapateado, Pasada, Cruces/pasadas, Cierre.<br>
<strong>4ª Sevillana :</strong> Entrada, Paseíllo, Careos (face à face), Pasada, Giros finales et pose finale arrêtée nette.`,
    structureSteps: [
      { step: 1, name: "Entrada de guitare & Salida", description: "Rasgueado d'appel, préparation des danseurs.", compasTips: "3 temps d'introduction, appel sur le temps 1" },
      { step: 2, name: "Primera parte & Paseíllo", description: "Premier couplet avec le pas de base de sevillana.", compasTips: "Passeggiata fluide sur 3 temps" },
      { step: 3, name: "La Pasada (Croisement)", description: "Les deux danseurs échangent leur place avec élégance.", compasTips: "Changement d'accord sur le temps fort" },
      { step: 4, name: "Segunda & Tercera parte", description: "Variations selon la sevillana (valses, zapateados ou careos).", compasTips: "Rythme soutenu sans faiblir" },
      { step: 5, name: "Cierre & Pose finale", description: "Arrêt net simultané de la guitare, du chant et du geste du danseur.", compasTips: "Coupure sèche au temps 1" }
    ],
    structureVideos: [
      { id: "sev-str-1", title: "Entrada, pasadas y cierre - Structure complète", url: "https://www.youtube.com/watch?v=tnQPcwdBXjg", level: 1, description: "Tutoriel complet des arrêts et repères indispensables pour accompagner la danse." },
      { id: "sev-str-2", title: "2ª Sevillana pour Guitare avec Tablature - Mariano Bailera", url: "https://www.youtube.com/watch?v=JTlMZVEoMxE", level: 1, description: "Jeu direct de guitare avec tablature synchronisée et démonstrations à 5 vitesses (60 à 165 BPM)." }
    ],
    letraTitle: "Primera Sevillana - El Adiós (Amis du Rocío)",
    letraSpanish: `Algo se muere en el alma
cuando un amigo se va.
Y va dejando una huella
que no se puede borrar.

No te vayas todavía,
no te vayas por favor,
que hasta la guitarra mía
llora cuando dice adiós.`,
    letraFrench: `Quelque chose meurt dans l'âme
lorsqu'un ami s'en va.
Et il laisse une empreinte
que rien ne peut effacer.

Ne t'en vas pas encore,
ne pars pas s'il te plaît,
car même ma guitare
pleure quand elle dit adieu.`,
    letraVideo: { id: "sev-letra-v", title: "Sevillanas Rocieras chantées et jouées", url: "https://www.youtube.com/watch?v=DQxWW2Sl34M", level: 1, description: "Exemple audio-vidéo complet de sevillana chantée." }
  }
};
