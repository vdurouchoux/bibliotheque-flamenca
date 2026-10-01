import { DansePaloData } from '../../types';
import { FARRUCA_LETRAS } from '../baile/farrucaLetras';

export const FARRUCA_GUITARE: DansePaloData = {
  id: "farruca-guitare",
  name: "Farruca",
  subtitle: "Guitare solennelle & virtuose – Guide complet de montage & technique",
  tag: "4 temps binaire",
  origin: "Origine galicienne adaptée par les Gitans d'Andalousie (Triana / Séville). Immortalisée à la guitare par Ramón Montoya, Sabicas et Niño Ricardo, puis sublimée par Paco de Lucía.",
  character: "Sobre, altier, géométrique et puissant. Tonalité traditionnelle en La mineur (position de Por Arriba) ou Mi mineur. Attaques franches en picado, alzapúa tranchante et rasgueados puissants.",
  costumeAdvice: "Tenue sobre et élégante, guitare bien calée, main droite ferme pour les frappes de golpador (golpes) et pouce agile pour l'alzapúa.",
  compas: {
    beats: 4,
    accents: [1, 3],
    defaultBpm: 84,
    minBpm: 60,
    maxBpm: 165,
    description: "Compás binaire à 4 temps. Pulsation régulière et solennelle (80-90 BPM au départ), avec montée progressive (subida) culminant à 150-165 BPM dans l'escobilla.",
    rhythmType: '4-temps'
  },
  choreographyGuide: {
    overview: "Monter une Farruca à la guitare requiert une dramaturgie rigoureuse : de la falseta d'introduction jusqu'à l'explosion virtuose du cierre final. Voici l'architecture en 6 blocs universels pour bâtir votre propre pièce de guitare.",
    structureSteps: [
      {
        stepNumber: 1,
        title: "Salida & Entrada (Introduction & Falseta d'entrée)",
        durationApprox: "45s à 1 min",
        description: "L'entrée installe immédiatement l'atmosphère sombre et altière. Le guitariste commence par une falseta d'introduction en accords arpégés ou pouce/index, installe la pulsation de 4 temps, puis pose un premier remate affirmé.",
        danceTips: [
          "Attaques lentes et pesées sur les temps forts (1 et 3)",
          "Sonorité pleine et ronde sur les basses",
          "Marquer le premier golpe net pour affirmer le tempo",
          "Premier arrêt net (desplante) pour faire respirer la pièce"
        ],
        communicationWithGuitar: "La clarté du rythme impose le tempo de départ. Le premier remate net donne le signal de départ de la letra ou de la falseta suivante.",
        keyVideoRefId: "far-g-paco-delucia"
      },
      {
        stepNumber: 2,
        title: "Primera Letra & Falsetas (Accompagnement du Chant ou Thème)",
        durationApprox: "1 min à 1 min 30",
        description: "Section d'accompagnement de la copla chantée ou exposition du thème principal à la guitare. Accords sobres (La mineur, Mi majeur, Sol, Fa), rasgueados légers et contre-chants discrets.",
        danceTips: [
          "Accompagnement sobre alternant rythmique et arpèges",
          "Mise en valeur de la ligne mélodique",
          "Golpes discrets pour souligner la mélodie sans la couvrir",
          "Écoute attentive des respirations et cadences"
        ],
        communicationWithGuitar: "Les rasgueados doivent rester aérés pendant le chant pour ne pas masquer la voix ou les nuances subtiles.",
        keyVideoRefId: "far-g-sabicas"
      },
      {
        stepNumber: 3,
        title: "Llamada de Transition (L'Appel rythmique)",
        durationApprox: "15s à 25s",
        description: "La llamada est le signal codifié exécuté avec l'alzapúa et les coups de golpador. Elle annonce la fin de la section chantée et la bascule vers la partie suivante (deuxième falseta ou silencio).",
        danceTips: [
          "Combinaison de rasgueados nets et frappes au compás",
          "Rythme engagé et précis",
          "Remate tranchant sur le temps 1 ou le temps 3 suivi d'un temps de silence"
        ],
        communicationWithGuitar: "La llamada est un ordre musical clair. Elle doit être exécutée avec autorité pour relancer la suite sans hésitation.",
        keyVideoRefId: "far-g-paco-pena"
      },
      {
        stepNumber: 4,
        title: "Silencio ou Falseta Lyrique (Respiration & Trémolo)",
        durationApprox: "45s à 1 min",
        description: "Moment de contraste indispensable après la tension rythmique. Sur une falseta lente en arpèges ou en trémolo, la guitare déploie toute sa poésie et son lyrisme.",
        danceTips: [
          "Contrastes de dynamiques : passer de la puissance à la douceur suspendue",
          "Trémolo régulier et expressif",
          "Laisser vibrer les basses en accord ouvert"
        ],
        communicationWithGuitar: "Écoute du souffle musical et conclusion par un mini-remate d'appel pour préparer l'escobilla.",
        keyVideoRefId: "far-g-juan-martin"
      },
      {
        stepNumber: 5,
        title: "Escobilla & Subida (Variations Rythmiques & Accélération)",
        durationApprox: "1 min 30 à 2 min 30",
        description: "Le sommet technique de la Farruca. Enchaînement de variations rythmiques complexes (alzapúa, picados rapides, contratiempos). La section débute à tempo calme (80 BPM) avant de monter en puissance et en vitesse (la subida).",
        danceTips: [
          "Commencer d'une propreté métronomique parfaite sans forcer le son",
          "Développer la vitesse de manière progressive et continue, jamais par à-coups",
          "Main droite bien détendue pour le picado et l'alzapúa",
          "Précision des accents sur 1 et 3"
        ],
        communicationWithGuitar: "C'est la régularité du compás qui dicte l'accélération précise et puissante.",
        keyVideoRefId: "far-g-sabicas"
      },
      {
        stepNumber: 6,
        title: "Remate Final & Cierre / Salida (Conclusion foudroyante)",
        durationApprox: "30s à 45s",
        description: "Au point culminant de la subida, le guitariste marque un arrêt foudroyant (cierre) sur un accord sec. Il peut alors conclure dans une immobilité totale ou enchaîner sur une courte sortie rythmée.",
        danceTips: [
          "Dernier rasgueado rapide terminé net",
          "Golpe final sec et arrêt immédiat",
          "Silence complet pendant 2 à 3 secondes pour laisser résonner l'accord final"
        ],
        communicationWithGuitar: "L'accord final de Mi ou La mineur doit frapper exactement au même instant que le silence.",
        keyVideoRefId: "far-g-paco-delucia"
      }
    ],
    mountingTips: [
      "Viser 3 à 4 minutes au début : Une Farruca courte et parfaitement maîtrisée a 10 fois plus d'impact qu'un morceau de 8 minutes où l'on perd le fil.",
      "L'art du silence : Dans la Farruca, laisser respirer un accord ou tenir un silence impose un magnétisme irrésistible. Ne remplissez pas toutes les mesures de notes.",
      "Le métronome comme meilleur allié : Travaillez vos falsetas à 70 BPM au métronome. Si un passage n'est pas propre lentement, il sera brouillon en accélérant.",
      "Écoute et dialogue : Apprenez à marquer vos appels et remates clairement pour que l'auditeur ressente la structure de la pièce."
    ]
  },
  marcajes: {},
  zapateado: {},
  llamadas: {},
  letras: FARRUCA_LETRAS,
  maitres: [
    {
      id: "far-g-paco-delucia",
      title: "Paco de Lucía - Farruca de Lucía",
      url: "https://www.youtube.com/watch?v=AqHuFQ4cHEA",
      level: 3,
      startSeconds: 0,
      landmarks: [
        { timeSeconds: 0, label: "0:00 - Introduction & Falseta d'entrée", type: "intro" },
        { timeSeconds: 42, label: "0:42 - Première falseta en La mineur", type: "falseta" },
        { timeSeconds: 88, label: "1:28 - Alzapúa & Golpeador", type: "remate" },
        { timeSeconds: 135, label: "2:15 - Falseta lyrique en arpèges", type: "falseta" },
        { timeSeconds: 195, label: "3:15 - Picado virtuose & Subida", type: "subida" },
        { timeSeconds: 232, label: "3:52 - Cierre final foudroyant", type: "cierre" }
      ],
      description: "Le chef-d'œuvre absolu de Paco de Lucía. Une leçon de pureté, de dynamique sonore et de vélocité légendaire."
    },
    {
      id: "far-g-sabicas",
      title: "Sabicas - Punta y Tacón (Farruca)",
      url: "https://www.youtube.com/watch?v=8RxEHqFuunE",
      level: 3,
      startSeconds: 0,
      landmarks: [
        { timeSeconds: 0, label: "0:00 - Thème fondateur & Compás", type: "intro" },
        { timeSeconds: 38, label: "0:38 - Alzapúa mythique de Sabicas", type: "remate" },
        { timeSeconds: 76, label: "1:16 - Falseta en trémolo", type: "falseta" },
        { timeSeconds: 120, label: "2:00 - Picado percutant et cierre", type: "cierre" }
      ],
      description: "La pièce fondatrice du répertoire de concert pour guitare flamenca. Technique d'alzapúa et de picado inégalée."
    },
    {
      id: "far-g-paco-pena",
      title: "Paco Peña & John Williams - Farruca in D",
      url: "https://www.youtube.com/watch?v=izNxtsC1b4k",
      level: 3,
      startSeconds: 0,
      landmarks: [
        { timeSeconds: 0, label: "0:00 - Dialogue d'introduction", type: "intro" },
        { timeSeconds: 52, label: "0:52 - Thème en Ré et rasgueados", type: "falseta" },
        { timeSeconds: 140, label: "2:20 - Accélération et compás", type: "subida" }
      ],
      description: "Interprétation de concert d'anthologie unissant le maître Paco Peña et John Williams. Clarté polyphonique exemplaire."
    },
    {
      id: "far-g-juan-martin",
      title: "Juan Martín - Farruca (El Arte Flamenco de la Guitarra)",
      url: "https://www.youtube.com/watch?v=QfP-J7gB50c",
      level: 2,
      startSeconds: 0,
      landmarks: [
        { timeSeconds: 0, label: "0:00 - Entrée posée et accords de base", type: "intro" },
        { timeSeconds: 45, label: "0:45 - Falseta mélodique traditionnelle", type: "falseta" },
        { timeSeconds: 95, label: "1:35 - Alzapúa et fermeture", type: "cierre" }
      ],
      description: "L'école classique andalouse : pulsation rigoureuse, sonorité ronde et ornementation sobre conforme à la tradition."
    }
  ],
  cours: [
    {
      id: "far-c-jeronimo-carmen",
      title: "Jerónimo de Carmen - FARRUCA FÁCIL con Falseta",
      url: "https://www.youtube.com/watch?v=hR-05f329dY",
      level: 1,
      startSeconds: 0,
      description: "Le cours le plus populaire et pédagogue sur YouTube : positions d'accords simples, compás à 4 temps et première falseta complète."
    },
    {
      id: "far-c-kai-narezo",
      title: "Kai Narezo - Farruca Compás Explained (Flamenco Guitar)",
      url: "https://www.youtube.com/watch?v=yB_5J8n1L2E",
      level: 2,
      startSeconds: 0,
      description: "Masterclass de référence de Flamenco Explained : placement des accents 1 et 3, technique de rasgueado et jeu de main droite."
    },
    {
      id: "far-c-sabicas-tuto",
      title: "Sabicas - Punta y Tacón (Tutorial & Tablature)",
      url: "https://www.youtube.com/watch?v=d-d65t6N2W4",
      level: 3,
      startSeconds: 0,
      description: "Étude pas à pas de la légendaire Farruca de Sabicas avec tablature synchronisée pour travailler lentement chez soi."
    }
  ]
};
