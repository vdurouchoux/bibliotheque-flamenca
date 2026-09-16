import { PaloData } from '../../types';

export const TARANTA: PaloData = {
  id: "taranta",
  name: "Taranta",
  subtitle: "Le grand cante libre de Levante et des mines d'Almería",
  tag: "Toque libre en Fa# modal",
  origin: "Linares / Almería / Carthagène",
  character: "Poétique, mélancolique, mystique, vertigineux et intemporel",
  compas: {
    beats: 1,
    accents: [1],
    defaultBpm: 60,
    minBpm: 40,
    maxBpm: 80,
    description: "Toque libre (ad libitum). Absence de pulsation métronomique. La guitare tisse un espace sonore poétique fait d'arpèges amples, de silences profonds et de trémolos vibrants.",
    rhythmType: 'libre'
  },
  harmonie: {
    summary: "La <strong>Taranta</strong> est l'un des joyaux guitaristiques du flamenco. Jouée en <strong>Fa# phrygien modal</strong>, elle laisse vibrer les cordes 1 (Mi aigu) et 2 (Si) à vide sur presque tous les accords, ce qui confère à cette musique sa résonance cristalline et mystérieuse si emblématique.",
    tonality: "Fa# phrygien modal (Toque minero)",
    cadence: ["G", "F#", "Em", "D", "B7", "F#"],
    cejillaTips: "Généralement jouée al aire (sans cejilla) pour profiter au maximum de la résonance des basses acoustiques de l'instrument.",
    chords: [
      { name: "F# (Fa# flamenco minero)", fretText: "2-4-4-3-0-0", description: "Tonique avec Mi et Si ouverts" },
      { name: "G (Sol modal)", fretText: "3-2-0-0-0-0", description: "Tension phrygienne à demi-ton" },
      { name: "Em (Mi mineur 9ème)", fretText: "0-2-2-0-0-2", description: "Couleur nocturne et poignante" },
      { name: "B7 (Si 7ème)", fretText: "x-2-1-2-0-2", description: "Accord de relance mélodique" }
    ]
  },
  falsetas: {
    1: [
      { id: "trt-f-1-1", title: "Iníciate a tocar por Taranta (Fuente y Caudal)", url: "https://www.youtube.com/watch?v=JQ2zjGYTOyQ", level: 1, description: "Positions d'accords et arpèges d'introduction inspirés de Paco de Lucía." },
      { id: "trt-f-1-2", title: "Entrada por Tarantas - Jérónimo de Carmen", url: "https://www.youtube.com/watch?v=llpbHNSfKkk", level: 1, description: "Introduction atmosphérique pour poser l'ambiance des mines." },
      { id: "trt-f-1-3", title: "Falseta de ligados por Taranta", url: "https://www.youtube.com/watch?v=2pnGBh6ACkE", level: 1, description: "Travail des marteaux et tirés de la main gauche." }
    ],
    2: [
      { id: "trt-f-2-1", title: "Idées et ressources pour la Taranta", url: "https://www.youtube.com/watch?v=TiLdfG0A3r8", level: 2, description: "Liaisons de pouces, glissés et ornementations libres." },
      { id: "trt-f-2-2", title: "Falseta de arpegios por Taranta", url: "https://www.youtube.com/watch?v=zN0C07AUMR0", level: 2, description: "Richesse polyphonique et équilibre entre les voix." },
      { id: "trt-f-2-3", title: "Tutorial pour débutants et intermédiaires", url: "https://www.youtube.com/watch?v=Hu0p9oSkxU0", level: 2, description: "Décorticage note à note de la cadence minera." }
    ],
    3: [
      { id: "trt-f-3-1", title: "Magnifique trémolo pour Taranta", url: "https://www.youtube.com/watch?v=Ram_3iqmf_c", level: 3, description: "Étude du trémolo flamenco à 5 notes (p-i-a-m-i) en Fa# phrygien." },
      { id: "trt-f-3-2", title: "Falseta de concert et expressivité", url: "https://www.youtube.com/watch?v=40TLuKyA7G0", level: 3, description: "Subtilités de toucher et nuances dynamiques." },
      { id: "trt-f-3-3", title: "Falsetón avec arpegios complexes", url: "https://www.youtube.com/watch?v=X9wIawvlyzA", level: 3, description: "Morceau de bravoure pour guitare de concert." }
    ]
  },
  cante: {
    1: [
      { id: "trt-c-1-1", title: "Accompagnement du grand cante de Taranta", url: "https://www.youtube.com/watch?v=TiLdfG0A3r8", level: 1, description: "Comment soutenir les mélismes vocaux sans envahir la liberté du cantaor." }
    ],
    2: []
  },
  baile: {
    structure: `<div class="structure-title">Structure traditionnelle de la Taranta</div>
1. <strong>Entrada libre</strong> (Arpèges contemplatifs et son des mines)<br>
2. <strong>Temple du cante</strong> (Lamento d'ouverture)<br>
3. <strong>Primera Letra</strong> (Chant solennel sur la rudesse de la vie minière)<br>
4. <strong>Falseta de concert</strong> (Trémolo ou picado virtuose)<br>
5. <strong>Segunda Letra</strong> (Climax émotionnel du chant)<br>
6. <strong>Remate libre</strong> (Résolution en Fa# avec résonance finale)`,
    structureSteps: [
      { step: 1, name: "Entrada libre", description: "La guitare pose le silence et le mystère minier.", compasTips: "Ad libitum, tempo suspendu" },
      { step: 2, name: "Temple", description: "Entrée du chant par des vocalises étirées.", compasTips: "Accords tenus en résonance" },
      { step: 3, name: "Letra", description: "Déroulement des 5 vers poétiques de la strophe.", compasTips: "Attendre le repos de la voix avant de relancer" },
      { step: 4, name: "Falseta libre", description: "Grand moment d'expression soliste à la guitare.", compasTips: "Trémolo à 5 notes très expressif" }
    ],
    structureVideos: [
      { id: "trt-str-1", title: "Entrada et ressources pour la Taranta", url: "https://www.youtube.com/watch?v=TiLdfG0A3r8", level: 2, description: "Mise en place de l'entrée libre et du climat harmonique." },
      { id: "trt-str-2", title: "Trémolo magnifique pour Taranta", url: "https://www.youtube.com/watch?v=Ram_3iqmf_c", level: 3, description: "Démonstration du trémolo minero emblématique." }
    ],
    letraTitle: "Letra traditionnelle de la Taranta de Carthagène",
    letraSpanish: `Muralla de Cartagena,
quién te pudiera derribar,
para ver si por tus ruinas
se divisa la Almería
donde tengo mi querer.`,
    letraFrench: `Remparts de Carthagène,
qui pourrait donc vous abattre,
pour voir si par vos ruines
on aperçoit Almería
où repose mon amour.`,
    letraVideo: { id: "trt-letra-v", title: "Exemple chanté et joué de Taranta", url: "https://www.youtube.com/watch?v=JQ2zjGYTOyQ", level: 2, description: "Illustration vocale et guitaristique de la letra de Taranta." }
  }
};
