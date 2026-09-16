import { PaloData } from '../../types';

export const RUMBA: PaloData = {
  id: "rumba",
  name: "Rumba Flamenca",
  subtitle: "Rythme binaire festif d'influence catalane et gitane",
  tag: "4 temps binaire",
  origin: "Catalogne / Andalousie (Cantes de Ida y Vuelta)",
  character: "Enjoué, dansant, percussif, fédérateur et moderne",
  compas: {
    beats: 4,
    accents: [1, 3],
    defaultBpm: 108,
    minBpm: 80,
    maxBpm: 140,
    description: "Compás binaire à 4 temps. Joué avec la technique de l'éventail percussif ('ventilador') ou avec accentuation marquée de basse sur le temps 1 et syncopes sur les temps 2, 3 et 4.",
    rhythmType: '4-temps'
  },
  harmonie: {
    summary: "La <strong>Rumba Flamenca</strong> utilise couramment la <strong>cadence andalouse</strong> (Am - G - F - E) ou des grilles majeures pop-flamencas (ex: Dm - G7 - C - A7). Elle permet de chanter des mélodies immédiates tout en maintenant une assise rythmique percutante.",
    tonality: "La mineur (Am) / Mi phrygien ou Ré mineur",
    cadence: ["Am", "G", "F", "E"],
    cejillaTips: "Placer la cejilla selon la tessiture de la chanson (cases 1 à 4 très courantes).",
    chords: [
      { name: "Am (La mineur)", fretText: "x-0-2-2-1-0", description: "Accord tonique de départ" },
      { name: "G (Sol majeur)", fretText: "3-2-0-0-0-3", description: "Deuxième degré de la descente andalouse" },
      { name: "F (Fa flamenco)", fretText: "1-3-3-2-0-0", description: "Sous-dominante avec cordes aiguës ouvertes" },
      { name: "E (Mi majeur flamenco)", fretText: "0-2-2-1-0-0", description: "Accord de tension et de résolution rythmique" }
    ]
  },
  intro: {
    title: "Entrada por Rumba – Le ventilateur percussif et la cadence",
    concept: "La Rumba flamenca invite immédiatement au partage et à la danse. L'intro de guitare installe la boîte à rythmes naturelle de l'instrument avec le fameux coup de poignet (ventilador) ou le blocage percussif.",
    howToStart: "1. Positionner la main gauche sur La mineur (Am) ou Mi flamenco (E).\n2. Démarrer par un coup de pouce sur la basse suivi du claqué percussif de la main droite sur la table.\n3. Faire tourner la cadence Am ➔ G ➔ F ➔ E avec un swing régulier.\n4. Marquer une coupure (remate) sèche sur le 4ème temps pour lancer le refrain ou le couplet.",
    compasAdvice: "Mesure à 4 temps, 100-115 BPM. La régularité de la pulsation et la frappe percussive sont la clé.",
    tonalAmbience: "La mineur ou Mi phrygien. Festif, fédérateur, dansant et chaleureux.",
    chordsTips: "Am (x-0-2-2-1-0) ➔ G (3-2-0-0-0-3) ➔ F (1-3-3-2-0-0) ➔ E (0-2-2-1-0-0).",
    videos: [
      { id: "rum-intro-1", title: "7 rumbas faciles pour débutants (4 accords)", url: "https://www.youtube.com/watch?v=zJXCpwseJQY", level: 1, description: "Positions fondamentales et lancement du rythme binaire de base." },
      { id: "rum-intro-2", title: "Remates et coupures de Rumba faciles", url: "https://www.youtube.com/watch?v=RdERdC9Snos", level: 2, description: "Coupures d'ambiance et relances au compás." }
    ]
  },
  falsetas: {
    1: [
      { id: "rum-f-1-1", title: "7 rumbas faciles pour débutants (4 accords)", url: "https://www.youtube.com/watch?v=zJXCpwseJQY", level: 1, description: "Les standards de la rumba gitane expliqués avec des positions simples." }
    ],
    2: [
      { id: "rum-f-2-1", title: "Remates et coupures de Rumba faciles", url: "https://www.youtube.com/watch?v=RdERdC9Snos", level: 2, description: "Coupures percussives et variations rythmiques pour dynamiser l'accompagnement." }
    ],
    3: []
  },
  cante: {
    1: [
      { id: "rum-c-1-1", title: "Accompagner les chansons por Rumba", url: "https://www.youtube.com/watch?v=zJXCpwseJQY", level: 1, description: "Synchroniser le chant avec les coups de pouce et la boîte à rythme naturelle de la table." }
    ],
    2: [
      { id: "rum-c-2-1", title: "Rumba gitane chantée avec arrangements", url: "https://www.youtube.com/watch?v=RdERdC9Snos", level: 2, description: "Contrechants de guitare entre chaque tercio chanté." }
    ],
    3: []
  },
  baile: {
    structure: `<div class="structure-title">Structure du Baile por Rumba</div>
1. Introduction de guitare (Ritmo continuo & remate)<br>
2. Entrée des danseurs avec marcaje chaloupé<br>
3. Letras chantées (strophes dynamiques et refrains)<br>
4. Subida (montée d'énergie et claquements de mains / palmas)<br>
5. Cierre festif et sortie libre`,
    structureSteps: [
      { step: 1, name: "Entrada rythmique", description: "Pose immédiate de la pulsation binaire à la guitare.", compasTips: "Basse au temps 1, syncopes 2 et 4" },
      { step: 2, name: "Marcaje et danse", description: "Mouvements de hanches et pas souples au compás.", compasTips: "Maintien d'un tempo régulier et stable" },
      { step: 3, name: "Remates", description: "Arrêts percussifs annoncés par la guitare.", compasTips: "Frappe sur la table d'harmonie (golpe) au 4e temps" },
      { step: 4, name: "Fin de fiesta", description: "Chœur à l'unisson et célébration collective.", compasTips: "Accélération possible en apothéose" }
    ],
    structureVideos: [
      { id: "rum-str-1", title: "Technique du rythme rumba et remates", url: "https://www.youtube.com/watch?v=RdERdC9Snos", level: 1, description: "Exemples courts pour illustrer l'entrada et les arrêts en rumba." }
    ],
    letraTitle: "Rumba Gitana traditionnelle",
    letraSpanish: `Al calor de la noche
suena la guitarra ya,
con el son de los gitanos
que me invita a bailar.

Vuela libre mi pensamiento,
se me alegra el corazón.`,
    letraFrench: `À la chaleur de la nuit
la guitare résonne déjà,
au rythme des gitans
qui m'invite à danser.

Ma pensée vole en liberté,
mon cœur s'emplit de joie.`,
    letraVideo: { id: "rum-letra-v", title: "Chant et accompagnement de Rumba", url: "https://www.youtube.com/watch?v=zJXCpwseJQY", level: 1, description: "Chants de rumba avec accords guidés." }
  }
};
