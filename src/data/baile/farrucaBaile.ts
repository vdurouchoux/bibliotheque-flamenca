import { DansePaloData } from '../../types';
import { FARRUCA_LETRAS } from './farrucaLetras';

export const FARRUCA_BAILE: DansePaloData = {
  id: "farruca-baile",
  name: "Farruca",
  subtitle: "Danse solennelle & virtuose – Guide complet de montage & technique",
  tag: "4 temps binaire",
  origin: "Origine galicienne adaptée par les Gitans d'Andalousie (Triana / Séville). Immortalisée au baile par Faíco et Ramón Montoya, puis sublimée par Vicente Escudero et El Güito.",
  character: "Sobre, sculptural, altier, géométrique et puissant. Traditionnellement dansée en pantalon et gilet (hommes et femmes). Lignes franches et frappes de pieds tranchantes.",
  costumeAdvice: "Chaussures de flamenco fermes et bien cloutées, pantalon taille haute (pantalón campero), chemise cintrée et gilet court (chaleco). Parfois exécutée avec une canne (bastón) ou un chapeau cordouan.",
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
    overview: "Monter une Farruca requiert une dramaturgie rigoureuse : de l'immobilité sculpturale de l'entrée jusqu'à l'explosion virtuose du zapateado final. Voici l'architecture en 6 blocs universels pour bâtir votre propre chorégraphie.",
    structureSteps: [
      {
        stepNumber: 1,
        title: "Salida & Entrada (L'Entrée en scène & Promenade)",
        durationApprox: "45s à 1 min",
        description: "L'entrée installe immédiatement l'atmosphère sombre et altière. Le danseur entre généralement sur la falseta d'introduction du guitariste, avance d'un pas lent et mesuré (paseo), puis pose un premier remate ou desplante au centre de la scène.",
        danceTips: [
          "Pas marchés lents sur les temps forts (1 et 3)",
          "Buste fier, épaules basses, bras sculptés sans ondulations gitanes excessives",
          "Regard direct et pénétrant vers le public",
          "Premier arrêt net (desplante) pour affirmer sa présence"
        ],
        communicationWithGuitar: "La cadence de vos pas impose le tempo de départ au guitariste. Le premier remate net donne le signal de départ de la letra.",
        keyVideoRefId: "far-m-ivan-vargas"
      },
      {
        stepNumber: 2,
        title: "Primera Letra & Marcajes (Les Marquages de Chant / Thème)",
        durationApprox: "1 min à 1 min 30",
        description: "Section dansée sur la copla chantée ou le thème principal à la guitare. Le danseur marque le compás binaire avec le haut du corps : cambres sobres, torsions du buste, suspensions des bras et tours lents (giros).",
        danceTips: [
          "Marquages sobres alternant appuis pied droit et pied gauche",
          "Jeux de bras anguleux et lignes géométriques précises",
          "Petits latiguillos de pieds discrets pour souligner la mélodie sans la couvrir",
          "Écoute attentive des respirations du chanteur"
        ],
        communicationWithGuitar: "Les frappes de pieds doivent rester légères pendant le chant pour ne pas masquer la voix ou les accords subtils.",
        keyVideoRefId: "far-m-guito"
      },
      {
        stepNumber: 3,
        title: "Llamada de Transition (L'Appel au guitariste)",
        durationApprox: "15s à 25s",
        description: "La llamada est le signal codifié exécuté avec les pieds et le corps. Elle annonce aux musiciens la fin de la section chantée et la bascule vers la partie suivante (deuxième lettre ou silencio).",
        danceTips: [
          "Combinaison de frappes nettes planta-tacón au compás",
          "Posture engagée et regard tourné vers le guitariste",
          "Remate tranchant sur le temps 1 ou le temps 3 suivi d'un temps de silence"
        ],
        communicationWithGuitar: "La llamada est un ordre musical clair. Elle doit être exécutée avec autorité pour que le guitariste relance sans hésitation.",
        keyVideoRefId: "far-m-farruquito"
      },
      {
        stepNumber: 4,
        title: "Silencio ou Falseta Lyrique (Respiration & Giros)",
        durationApprox: "45s à 1 min",
        description: "Moment de contraste indispensable après la tension des frappes. Sur une falseta lente en arpèges ou en trémolo, le danseur déploie des tours lents (giros), des suspensions et des attitudes immobiles.",
        danceTips: [
          "Contrastes de dynamiques : passer de la puissance à la grâce suspendue",
          "Tours contrôlés avec point fixe du regard (giros de cuello)",
          "Déplacement ample sur toute la surface de scène"
        ],
        communicationWithGuitar: "Connexion visuelle étroite. Le danseur écoute le souffle de la guitare et conclut par un mini-remate d'appel pour préparer l'escobilla.",
        keyVideoRefId: "far-m-gades"
      },
      {
        stepNumber: 5,
        title: "Escobilla & Subida (La Grande Démonstration de Pieds & Accélération)",
        durationApprox: "1 min 30 à 2 min 30",
        description: "Le sommet technique de la Farruca. Enchaînement de variations rythmiques complexes aux pieds (planta, tacón, pointe, contratiempos). La section débute à tempo calme (80 BPM) avant de monter en puissance et en vitesse (la subida).",
        danceTips: [
          "Commencer d'une propreté métronomique parfaite sans forcer le son",
          "Développer la vitesse de manière progressive et continue, jamais par à-coups",
          "Garder le bassin stable et le centre de gravité bas (genoux souples)",
          "Utiliser les bras pour s'équilibrer sans briser les lignes"
        ],
        communicationWithGuitar: "Le guitariste garde les yeux rivés sur vos pieds. C'est le talon du danseur qui mène la danse et dicte l'accélération précise.",
        keyVideoRefId: "far-m-baras"
      },
      {
        stepNumber: 6,
        title: "Remate Final & Cierre / Salida (Conclusion foudroyante)",
        durationApprox: "30s à 45s",
        description: "Au point culminant de la subida, le danseur marque un arrêt foudroyant (cierre) à l'unisson parfait avec la guitare. Il peut alors saluer dans une immobilité totale ou enchaîner sur une courte sortie rythmée.",
        danceTips: [
          "Dernier tour rapide (pirouette ou giro) terminé net",
          "Coup de pied final sec et arrêt immédiat comme une statue",
          "Immobilité complète pendant 2 à 3 secondes pour laisser résonner l'accord final"
        ],
        communicationWithGuitar: "L'accord final de Mi ou La mineur doit frapper exactement au même millième de seconde que le dernier tacón.",
        keyVideoRefId: "far-m-pedagogie-rina"
      }
    ],
    mountingTips: [
      "Viser 3 à 4 minutes au début : Une Farruca courte et parfaitement maîtrisée a 10 fois plus d'impact qu'une chorégraphie de 8 minutes où l'on s'essouffle.",
      "L'art de l'immobilité : Dans la Farruca, un danseur qui ne bouge pas mais tient son regard et sa ligne impose un magnétisme irrésistible. Ne remplissez pas tous les silences.",
      "Le métronome comme meilleur allié : Travaillez vos pas d'escobilla à 70 BPM au métronome. Si un pas n'est pas propre lentement, il sera brouillon en accélérant.",
      "Dialogue avec le guitariste : Apprenez à marquer vos llamadas avec le buste et la tête, pas seulement les pieds. Le guitariste doit 'voir' le remate avant même de l'entendre."
    ]
  },
  marcajes: {},
  zapateado: {},
  llamadas: {},
  letras: FARRUCA_LETRAS,
  maitres: [
    {
      id: "far-m-ivan-vargas",
      title: "Ivan Vargas & Kasandra \"La China\" - Farruca, flamenco dancers",
      url: "https://www.youtube.com/watch?v=pziQ1VcL740",
      level: 3,
      startSeconds: 0,
      landmarks: [
        { timeSeconds: 0, label: "0:00 - Salida & Entrada (Paseo théâtral)", type: "intro" },
        { timeSeconds: 84, label: "1:24 - Remate. Rythme doublé", type: "remate" },
        { timeSeconds: 108, label: "1:48 - Escobilla", type: "zapateado" },
        { timeSeconds: 143, label: "2:23 - Reprise des marquages, danse à deux", type: "marcaje" },
        { timeSeconds: 173, label: "2:53 - Letra", type: "letra" },
        { timeSeconds: 313, label: "5:13 - Subida", type: "subida" },
        { timeSeconds: 370, label: "6:10 - Falseta", type: "falseta" }
      ],
      description: "Interprétation de concert complète par Iván Vargas. Une démonstration modèle suivant fidèlement l'architecture en 6 blocs de la Farruca."
    },
    {
      id: "far-m-guito",
      title: "El Güito - Baile por Farruca",
      url: "https://www.youtube.com/watch?v=77GxEVzmGBM",
      level: 3,
      startSeconds: 0,
      landmarks: [
        { timeSeconds: 0, label: "0:00 - Salida & Entrada (Immobilité sculpturale)", type: "intro" },
        { timeSeconds: 50, label: "0:50 - Falseta. Marcajes nobles & Ports de bras", type: "marcaje" },
        { timeSeconds: 85, label: "1:25 - Remate. Ryhtme doublé", type: "remate" }
      ],
      description: "Le maître incontesté de la Farruca. Une leçon magistrale de sobriété, de géométrie, d'immobilité et de force pure."
    },
    {
      id: "far-m-baras",
      title: "Sara Baras - Farruca (1999)",
      url: "https://www.youtube.com/watch?v=TIeijUUHUp4",
      level: 3,
      startSeconds: 0,
      landmarks: [],
      description: "La grande démonstration moderne de Sara Baras : zapateado d'une vitesse et d'une netteté stupéfiantes, puissance et fierté."
    },
    {
      id: "far-m-gades",
      title: "Antonio Gades - Farruca (1969)",
      url: "https://www.youtube.com/watch?v=fBefsNiLrhg",
      level: 3,
      startSeconds: 0,
      landmarks: [],
      description: "L'interprétation historique d'Antonio Gades : posture hiératique, bras impeccables et dramaturgie théâtrale."
    },
    {
      id: "far-m-farruquito",
      title: "Los Farruco (Farruquito) - Farruca (P-5/6)",
      url: "https://www.youtube.com/watch?v=DzHPNiEV4LE",
      level: 3,
      startSeconds: 0,
      landmarks: [],
      description: "L'école des Farruco : intensité émotionnelle, arrêts brutaux et soniquete inimitable."
    },
    {
      id: "far-m-pedagogie-rina",
      title: "Rina Orellana - Complete Farruca choreography (online course)",
      url: "https://www.youtube.com/watch?v=rZ4S7lSkCRM",
      level: 2,
      startSeconds: 0,
      landmarks: [],
      description: "Chorégraphie d'étude complète filmée en plan large avec tempo clair et repères d'apprentissage idéaux pour travailler chez soi."
    },
    {
      id: "far-m-pedagogie-bg",
      title: "BG Flamenco - Salida y Marcaje para FARRUCA",
      url: "https://www.youtube.com/watch?v=qposVIHEY2E",
      level: 1,
      startSeconds: 0,
      landmarks: [],
      description: "Enchaînement d'étude pour débutants : travail de l'entrée solennelle, marquages au compás et fermeture nette sur le temps 1."
    }
  ]
};
