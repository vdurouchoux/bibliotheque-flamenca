import { PaloData } from '../types';
import { MINERA } from './palos/minera';
import { ABANDOLAO } from './palos/abandolao';
import { SEVILLANAS } from './palos/sevillanas';
import { RUMBA } from './palos/rumba';
import { VERDIALES } from './palos/verdiales';
import { TARANTO } from './palos/taranto';
import { TARANTA } from './palos/taranta';
import { GUAJIRAS } from './palos/guajiras';
import { FANDANGOS } from './palos/fandangos';

export const PALOS_DATA: Record<string, PaloData> = {
  "Alegrias": {
    id: "alegrias",
    name: "Alegrías",
    subtitle: "Cantiñas de Cádiz – Rythme vif et éclatant",
    tag: "12 temps majeur",
    origin: "Cádiz",
    character: "Festif, lumineux, dynamique et élégant",
    compas: {
      beats: 12,
      accents: [3, 6, 8, 10, 12],
      defaultBpm: 124,
      minBpm: 90,
      maxBpm: 160,
      description: "Compás à 12 temps. Début traditionnel sur le temps 1. Accents vifs sur 3, 6, 8, 10, 12.",
      rhythmType: '12-temps'
    },
    harmonie: {
      summary: "Les <strong>Alegrías</strong> sont jouées en <strong>majeur</strong> (le plus souvent en Do majeur por arriba avec cejilla, ou en Mi ou La majeur). Structure harmonique tonale I – V – I. Section « Silencio » en mineur mélancolique. Final fréquent accéléré en Bulerías de Cádiz.",
      tonality: "Do majeur (ou Mi / La majeur)",
      cadence: ["C", "G7", "C", "F", "G7", "C"],
      cejillaTips: "Généralement cejilla à la case 1, 2 ou 3 pour accompagner le cante en Do majeur por arriba.",
      chords: [
        { name: "C (Do majeur)", fretText: "x-3-2-0-1-0", description: "Tonique fondamentale de la section vive" },
        { name: "G7 (Sol 7ème)", fretText: "3-2-0-0-0-1", description: "Dominante de préparation" },
        { name: "F (Fa majeur flamenco)", fretText: "1-3-3-2-0-0", description: "Sous-dominante avec cordes aiguës à vide" },
        { name: "Am (Silencio)", fretText: "x-0-2-2-1-0", description: "Début de la partie Silencio en mineur" },
        { name: "E7 (Mi 7ème)", fretText: "0-2-0-1-0-0", description: "Résolution du Silencio" }
      ]
    },
    intro: {
      title: "Entrada por Alegrías – Poser le compás & l'ambiance",
      concept: "L'entrée par Alegrías a pour mission d'installer instantanément la lumière et la fête de Cadix, de fixer le compás à 12 temps avec franchise et d'annoncer la tonalité majeure au chanteur ou au danseur avec l'appel de préparation (silbato / llamada).",
      howToStart: "1. Positionner la cejilla (généralement en case 1, 2 ou 3) et placer la main gauche sur Do majeur (C).\n2. Démarrer par un marcaje régulier ou un rasgueo continu léger au compás de 12 temps.\n3. Balancer entre Do majeur (C) et Sol 7ème (G7) en marquant clairement les temps 3, 6, 8, 10, 12.\n4. Conclure l'entrée par un remate net au temps 10 ou une falseta de sortie pour inviter le cante ('Tirititrán').",
      compasAdvice: "Démarrez le compás soit au temps 1, soit entrez avec un golpe sur le temps 12. Marquez fermement le temps 10 pour clôturer chaque cycle (remate). Le tempo d'intro se situe idéalement entre 110 et 125 BPM.",
      tonalAmbience: "Do majeur (ou Mi majeur). Éclatant, noble, chaloupé, évoquant la mer et la fête de Cadix.",
      chordsTips: "C (x-3-2-0-1-0) ➔ G7 (3-2-0-0-0-1) ➔ C avec variantes flamenco (cordes de Mi et Si aiguës à vide).",
      videos: [
        { id: "al-intro-1", title: "Cómo empezar unas Alegrías en guitarra - Daniel Valenzuela", url: "https://www.youtube.com/watch?v=a0E0YvItMOs", level: 1, description: "Guide complet guitare en main : placement de la cejilla, accords en Do et lancement du compás." },
        { id: "al-intro-2", title: "Como empezar por Alegrías (capítulo II) - Carlos Orgaz", url: "https://www.youtube.com/watch?v=8WCMEZEtG3I", level: 1, description: "Tutoriel pas à pas sur les rasgueos d'entrée et la structure rythmique traditionnelle." },
        { id: "al-intro-3", title: "Entrada por Alegrías de Moraíto Chico (Entrada + falseta)", url: "https://www.youtube.com/watch?v=Gc_pQad_kTE", level: 2, description: "Entrée de concert puissante du maestro Moraíto avec rasgueos jerezanos et falseta d'appel." },
        { id: "al-intro-4", title: "Entrada au compás + falseta de salida - Flamenco de Punta a Punta", url: "https://www.youtube.com/watch?v=A7Qq-RTd9Ow", level: 2, description: "Mise en place de l'ambiance et enchaînement vers le premier cante." }
      ]
    },
    falsetas: {
      1: [
        { id: "al-f-1-1", title: "Falseta de rasgueos pour débutants", url: "https://www.youtube.com/watch?v=GOlcz8vGcRE", level: 1, description: "Étude du compás, rasgueado continu et remate au temps 10." },
        { id: "al-f-1-2", title: "Arpeggio facile par Alegrías", url: "https://www.youtube.com/watch?v=3mVv6om4UcM", level: 1, description: "Arpège p-i-m-a fluide et mélodieux en Do majeur." }
      ],
      2: [
        { id: "al-f-2-1", title: "Falseta de pulgar", url: "https://www.youtube.com/watch?v=LvunJH5mcfA", level: 2, description: "Technique de pouce appuyé avec son flamenco percutant." },
        { id: "al-f-2-2", title: "Falseta traditionnelle (Jerónimo de Carmen)", url: "https://www.youtube.com/watch?v=pQBAcBZuPd0", level: 2, description: "Falseta cadizienne classique avec ligados et accents au compás." }
      ],
      3: [
        { id: "al-f-3-1", title: "Falseta moderne en Mi majeur", url: "https://www.youtube.com/watch?v=BPGLonhegdc", level: 3, description: "Harmonies contemporaines, vitesse de picado et syncopes modernes." }
      ]
    },
    cante: {
      1: [
        { id: "al-c-1-1", title: "Explication accompagnement Alegrías de Cádiz", url: "https://www.youtube.com/watch?v=WsXDSGVByLE", level: 1, description: "Comprendre où placer les remates et les respirations du cantaor." }
      ],
      2: [
        { id: "al-c-2-1", title: "Accompagner ton premier cante + falseta de sortie", url: "https://www.youtube.com/watch?v=A7Qq-RTd9Ow", level: 2, description: "Enchaînement entrada, primera letra et falseta de liaison." }
      ],
      3: []
    },
    baile: {
      structure: `<div class="structure-title">Structure traditionnelle du baile por Alegrías</div>
1. Introduction guitare (Temple & falseta)<br>
2. Salida du cante (tirititrán…)<br>
3. Salida du baile (Appel et entrée du danseur)<br>
4. Letras + marcaje (Chant et pas feutrés)<br>
5. <strong>Silencio</strong> (paseo majestueux / campanas en mineur)<br>
6. <strong>Castellana</strong> (transition rythmée)<br>
7. Escobilla + subida (Travail de pieds virtuose et accélération)<br>
8. Final en <strong>Bulerías de Cádiz</strong> (Apothéose festive)`,
      structureSteps: [
        { step: 1, name: "Entrada & Salida guitare", description: "La guitare pose le compás et invite le chanteur.", compasTips: "Temps 1 à 12, tempo modéré 110-120 BPM" },
        { step: 2, name: "Salida cante (Tirititrán)", description: "Le célèbre appel gaditano qui fixe la tonalité.", compasTips: "Marcaje doux avec rasgueado discret" },
        { step: 3, name: "Première Letra", description: "Le danseur marque le chant (marcaje) et effectue une llamada.", compasTips: "Bien écouter la fin des vers pour remater à 10" },
        { step: 4, name: "Silencio", description: "Passage lent en mineur (Am / E7), très expressif.", compasTips: "Tempo plus posé, arpèges doux" },
        { step: 5, name: "Castellana", description: "Rupture de rythme marquant la reprise.", compasTips: "Accents nets sur les contretemps" },
        { step: 6, name: "Escobilla & Subida", description: "Zapateado pur, la guitare accélère avec le baile.", compasTips: "Accélération progressive vers 140-160 BPM" },
        { step: 7, name: "Cierre por Bulerías", description: "Final festif explosif dans le compás des Bulerías.", compasTips: "Cierre sec et net sur le temps 10" }
      ],
      letraTitle: "Letra traditionnelle de Cádiz",
      letraSpanish: `Yo le di un duro al barquero
por pasar el Ebro a verte.
Los amores de Navarro
son caros pero son buenos.`,
      letraFrench: `J'ai donné une pièce au passeur
pour traverser l'Èbre et te voir.
Les amours de Navarre
sont chers mais ils sont si doux.`,
      letraVideo: { id: "al-letra-v", title: "Cante por Alegrías de Cádiz", url: "https://www.youtube.com/watch?v=WsXDSGVByLE", level: 1, description: "Letra gaditane traditionnelle avec remates et respirations." },
      structureVideos: [
        { id: "al-str-1", title: "Entrada de guitare et salida cante", url: "https://www.youtube.com/watch?v=A7Qq-RTd9Ow", level: 2, description: "Enchaînement de l'entrée, marcaje et falseta de sortie pour le baile." }
      ],
      videos: {
        1: [
          { id: "al-b-1-1", title: "Montar y acompañar un baile (référence)", url: "https://www.youtube.com/watch?v=zxSyQ-K6Jh0", level: 1, description: "Guide complet pour guider le zapateado et les llamadas." }
        ],
        2: [],
        3: []
      }
    }
  },

  "Bulerias": {
    id: "bulerias",
    name: "Bulerías",
    subtitle: "Jerez & Cadix – Reine du compás et de la fête",
    tag: "12 temps festif",
    origin: "Jerez de la Frontera",
    character: "Rapide, incandescent, syncopé et virtuose",
    compas: {
      beats: 12,
      accents: [12, 3, 6, 8, 10],
      defaultBpm: 190,
      minBpm: 150,
      maxBpm: 250,
      description: "Compás cyclique à 12 temps. La mesure démarre traditionnellement sur le 12, avec des accents percutants sur [12] 1 2 [3] 4 5 [6] 7 [8] 9 [10] 11.",
      rhythmType: '12-temps'
    },
    harmonie: {
      summary: "Les <strong>Bulerías</strong> se jouent le plus souvent <strong>por medio</strong> (mode phrygien de La). La cadence andalouse fondamentale est : <strong>Dm – C – Bb – A</strong> (ou avec variantes de substitutions modernes). Également courante en Mi phrygien (por arriba) ou en majeur (Bulerías al golpe / de Cádiz).",
      tonality: "Por medio (La phrygien)",
      cadence: ["Dm", "C", "Bb", "A (La flamenco)"],
      cejillaTips: "Cejilla fréquente entre case 2 et 5 selon la voix du chanteur.",
      chords: [
        { name: "A (La flamenco)", fretText: "x-0-2-2-2-0", description: "Tonique phrygienne majeure avec cordes à vide" },
        { name: "Bb (Si bémol)", fretText: "x-1-3-3-3-1", description: "Degré bII caractéristique du mode phrygien" },
        { name: "C (Do)", fretText: "x-3-2-0-1-0", description: "Degré bIII de passage" },
        { name: "Dm (Ré mineur)", fretText: "x-x-0-2-3-1", description: "Degré iv de la cadence andalouse" },
        { name: "Bbmaj7(#11)", fretText: "x-1-3-2-3-0", description: "Voicing moderne très utilisé par Paco de Lucía" }
      ]
    },
    intro: {
      title: "Entrada por Bulerías – Lancer le soniquete & la fête",
      concept: "L'entrée des Bulerías est l'une des plus décisives : le guitariste doit immédiatement imposer le compás de 12 temps, établir le tempo vif sans vaciller et capter l'attention de la fête avec des coups nets et un swing incisif.",
      howToStart: "1. Installer la tonalité por medio (accord de La flamenco).\n2. Démarrer par un golpe sec sur la table au temps 12 ou laisser respirer le silence pour poser le temps 12.\n3. Enchaîner avec les rasgueos caractéristiques sur [12] 1 2 [3] 4 5 [6] 7 [8] 9 [10] 11.\n4. Jouer une première falseta d'entrée courte ou un remate au temps 10 pour inviter les palmas ou le chant.",
      compasAdvice: "Ne démarrez jamais précipité ! Même à 190 BPM, le compás doit être posé 'afincao'. Marquez avec autorité les temps 12, 3, 6, 8 et 10.",
      tonalAmbience: "La phrygien (por medio). Fougueux, festif, syncopé, imprégné de l'esprit gitan de Jerez.",
      chordsTips: "A (x-0-2-2-2-0) ➔ Bb (x-1-3-3-3-1) ➔ A, avec retards et suspensions au pouce.",
      videos: [
        { id: "bu-intro-1", title: "Entrada por Bulerías, Compás y 1ª Falseta - Flamenco Estepa", url: "https://www.youtube.com/watch?v=GRC4UkZZDME", level: 1, description: "Décorticage direct guitare en main du compás d'entrée et de la première falseta." },
        { id: "bu-intro-2", title: "Entrada por Bulerías - Tutoriel Guitare (FlamencoFácil)", url: "https://www.youtube.com/watch?v=R1XUJT6Jkis", level: 2, description: "Entrée polyvalente et efficace pour poser le compás et l'ambiance festa." },
        { id: "bu-intro-3", title: "Entrada por Bulerías por Soleá - Daniel Valenzuela", url: "https://www.youtube.com/watch?v=pInRsD89KJw", level: 1, description: "Falseta d'entrée accessible au compás avec explications des rasgueos et accents." }
      ]
    },
    falsetas: {
      1: [
        { id: "bu-f-1-1", title: "3 falsetas faciles por Bulerías", url: "https://www.youtube.com/watch?v=tSVvTedoB8w", level: 1, description: "Idéal pour intérioriser le compás et le remate au temps 10." },
        { id: "bu-f-1-2", title: "Entrée + falseta débutants", url: "https://www.youtube.com/watch?v=MrchcNSBm8Y", level: 1, description: "Introduction propre et régulière avec boucle de compás." }
      ],
      2: [
        { id: "bu-f-2-1", title: "Falseta très flamenca", url: "https://www.youtube.com/watch?v=f4ZOkNrMgf0", level: 2, description: "Sonorités traditionnelles de Jerez avec alzapúa incisif." },
        { id: "bu-f-2-2", title: "Falseta + remate niveau moyen", url: "https://www.youtube.com/watch?v=67R1GJjvmfo", level: 2, description: "Liaisons entre falseta et remate de fermeture." }
      ],
      3: [
        { id: "bu-f-3-1", title: "11 falsetas en 9 tonalités", url: "https://www.youtube.com/watch?v=ZnW0PBHlnyY", level: 3, description: "Tour d'horizon magistral des modulations flamencas contemporaines." },
        { id: "bu-f-3-2", title: "4 falsetas classiques de Morón", url: "https://www.youtube.com/watch?v=3LFr68-Pj0s", level: 3, description: "Le toque légendaire de Morón de la Frontera (Diego del Gastor)." }
      ]
    },
    cante: {
      1: [
        { id: "bu-c-1-1", title: "3 façons d’accompagner le cante", url: "https://www.youtube.com/watch?v=v1iQaUeQJQg", level: 1, description: "Rasgueados simples, maintien du compás et silences indispensables." }
      ],
      2: [
        { id: "bu-c-2-1", title: "Système pour accompagner les Bulerías", url: "https://www.youtube.com/watch?v=9W0ruGJvnp0", level: 2, description: "Méthode infaillible pour ne jamais perdre le temps 12." }
      ],
      3: [
        { id: "bu-c-3-1", title: "Acompañamiento classique de Jerez", url: "https://www.youtube.com/watch?v=BIZPK6vu394", level: 3, description: "Accompagnement dense et percussif avec golpes sur la table." }
      ]
    },
    baile: {
      structure: `<div class="structure-title">Structure traditionnelle du baile por Bulerías</div>
1. Salida guitare (Entrada au compás)<br>
2. Salida cante / baile (Le danseur entre en scène)<br>
3. Letras + marcaje + llamada + remate (Cycle de chant et appel)<br>
4. Escobilla / subida (Accélération et virtuosité des talons)<br>
5. Cierre final ou désalida (Sortie festive)`,
      structureSteps: [
        { step: 1, name: "Salida guitare", description: "Poser le tempo et la cadence de base.", compasTips: "Tourner sur Dm - Bb - A" },
        { step: 2, name: "Llamada du danseur", description: "Appel rythmique net signalant l'arrivée du chant.", compasTips: "Remate au 10" },
        { step: 3, name: "Letra & Marcaje", description: "La guitare reste discrète pour faire briller le chant.", compasTips: "Pas de falsetas pendant que le cantaor chante !" },
        { step: 4, name: "Escobilla", description: "Le zapateado s'amplifie.", compasTips: "Soutenir la vitesse sans dévier d'un millimètre" },
        { step: 5, name: "Cierre final", description: "Claquement net au temps 10.", compasTips: "Arrêt net à 10, silence à 11-12" }
      ],
      letraTitle: "Letra traditionnelle de Jerez",
      letraSpanish: `Mi amante es pajarero,
me trajo un loro
con las plumas doradas
y el pico de oro.`,
      letraFrench: `Mon amant est oiseleur,
il m'a apporté un perroquet
aux plumes dorées
et au bec d'or.`,
      letraVideo: { id: "bu-letra-v", title: "Cante por Bulerías de Jerez - Jerónimo de Carmen", url: "https://www.youtube.com/watch?v=aFYCq8u5osQ", level: 2, description: "Accompagner la letra traditionnelle au compás vif de Jerez." },
      structureVideos: [
        { id: "bu-str-1", title: "Entrada et rythme addictif por Bulerías - Jerónimo de Carmen", url: "https://www.youtube.com/watch?v=PXATD96w-J4", level: 2, description: "Structure rythmique, llamada et accents indispensables du compás." }
      ],
      videos: {
        1: [
          { id: "bu-b-1-1", title: "Montar y acompañar un baile por Soleá por Bulerías", url: "https://www.youtube.com/watch?v=zxSyQ-K6Jh0", level: 1, description: "Base solide pour accompagner une danseuse ou un danseur." }
        ],
        2: [
          { id: "bu-b-2-1", title: "Explication guitarra de la primera letra", url: "https://www.youtube.com/watch?v=Ynh0-5YW0tc", level: 2, description: "Comment répondre mélodiquement entre chaque tercio de la letra." }
        ],
        3: []
      }
    }
  },

  "Granainas": {
    id: "granainas",
    name: "Granaínas",
    subtitle: "Cante libre de Granada – Noblesse et mélancolie",
    tag: "Cante libre",
    origin: "Granada",
    character: "Lyrique, poétique, introspectif et orné",
    compas: {
      beats: 0,
      accents: [],
      defaultBpm: 60,
      minBpm: 40,
      maxBpm: 80,
      description: "Rythme libre (sin compás métrique fixe). Le guitariste respire avec la mélodie du cante et développe de riches arabesques mélodiques.",
      rhythmType: 'libre'
    },
    harmonie: {
      summary: "Les <strong>Granaínas</strong> et la <strong>Media Granaína</strong> sont des cantes libres issus des fandangos de Grenade. La tonalité de référence est en <strong>Si phrygien</strong> (fondée sur un accord de Si avec 5ème diminuée / bII en Do majeur). Les accords typiques : <strong>Em – D – C – B</strong>.",
      tonality: "Si phrygien (mode de Grenade)",
      cadence: ["Em", "D", "C", "B (B7b9 / B phrygien)"],
      cejillaTips: "Généralement jouée al aire (sans cejilla) ou cejilla 1-2 pour ajuster la résonance des basses.",
      chords: [
        { name: "B phrygien", fretText: "x-2-4-4-4-2 ou x-2-1-2-0-0", description: "Tonique centrale de la Granaína" },
        { name: "Cmaj7", fretText: "x-3-2-0-0-0", description: "Bémol 2 avec cordes à vide très expressives" },
        { name: "D7", fretText: "x-x-0-2-1-2", description: "Accord de transition vers Em" },
        { name: "Em", fretText: "0-2-2-0-0-0", description: "Résolution mineure" },
        { name: "B7(b9)", fretText: "x-2-1-2-1-x", description: "Tension flamenca typique avant la résolution" }
      ]
    },
    intro: {
      title: "Entrada por Granaínas – Ambiance libre et poésie de Grenade",
      concept: "La Granaína étant un cante libre, l'intro n'est pas prisonnière d'une pulsation métronomique. La guitare tisse un prélude arpégé, évoquant les jardins de l'Alhambra et créant l'espace sonore pour le chant.",
      howToStart: "1. Accorder soigneusement la guitare (tonalité de Si phrygien, souvent sans cejilla).\n2. Démarrer par un arpège doux sur B phrygien ou Cmaj7 en laissant vibrer les cordes aiguës à vide.\n3. Faire respirer les phrases avec un trémolo ou des liés souples (ligados).\n4. Conclure l'intro sur l'accord de B7(b9) tenu avec un rasgueo feutré pour donner la note d'entrée au cantaor.",
      compasAdvice: "Rythme libre (ad libitum). Respirez comme un chanteur, ne vous pressez pas et privilégiez la beauté du son.",
      tonalAmbience: "Si phrygien (mode de Grenade). Poétique, raffiné, nostalgique et arabisant.",
      chordsTips: "B phrygien (x-2-4-4-4-2 ou x-2-1-2-0-0) ➔ Cmaj7 (x-3-2-0-0-0) ➔ B7(b9).",
      videos: [
        { id: "gr-intro-1", title: "Falseta de nivel básico « De la casa » por Granaínas", url: "https://www.youtube.com/watch?v=9TZFum4mTus", level: 1, description: "Arpèges d'ouverture et installation de l'ambiance harmonique de Grenade." },
        { id: "gr-intro-2", title: "Granaína facile avec arpegios", url: "https://www.youtube.com/watch?v=C81NhxaQ9sE", level: 1, description: "Prélude arpégé posé pour entrer dans la couleur sonore du palo." }
      ]
    },
    falsetas: {
      1: [
        { id: "gr-f-1-1", title: "Falseta de nivel básico « De la casa »", url: "https://www.youtube.com/watch?v=9TZFum4mTus", level: 1, description: "Position de Si phrygien avec arpège simple et ornementation." },
        { id: "gr-f-1-2", title: "Granaína facile avec arpegios", url: "https://www.youtube.com/watch?v=C81NhxaQ9sE", level: 1, description: "Arpèges étalés pour développer la souplesse de la main droite." }
      ],
      2: [
        { id: "gr-f-2-1", title: "Falseta de trémolo por Granaínas", url: "https://www.youtube.com/watch?v=TkWwq4TGfSY", level: 2, description: "Le trémolo flamenco à 5 notes (p-i-a-m-i) dans toute sa splendeur." },
        { id: "gr-f-2-2", title: "Estudio de arpegios por Granaínas", url: "https://www.youtube.com/watch?v=qhid3_5Rraw", level: 2, description: "Contrepoint entre la ligne de basse au pouce et les voix aiguës." }
      ],
      3: [
        { id: "gr-f-3-1", title: "Falseta de Enrique de Melchor", url: "https://www.youtube.com/watch?v=GDzi-G5v4NM", level: 3, description: "Le style légendaire et le toucher cristallin d'Enrique de Melchor." },
        { id: "gr-f-3-2", title: "Falseta de Paco Serrano", url: "https://www.youtube.com/watch?v=m3Df3K4Pd2U", level: 3, description: "Virtuosité concertiste et doigtés harmoniques sophistiqués." }
      ]
    },
    cante: { 1: [], 2: [], 3: [] },
    baile: {
      structure: `<div class="structure-title">Structure du baile por Granaínas</div>
Baile libre et hautement expressif, peu codifié. On privilégie le sentiment, les mouvements souples des bras (braceo) et la théâtralité émotionnelle.`,
      structureSteps: [
        { step: 1, name: "Entrada ad libitum", description: "Le danseur investit l'espace avec lenteur et majesté.", compasTips: "Aucun métronome, écoute absolue" },
        { step: 2, name: "Letra libre", description: "Le cantaor déploie ses mélismes poétiques sur l'Alhambra.", compasTips: "Accords tenus en rasgueado doux" },
        { step: 3, name: "Remate mélodique", description: "Conclusion douce en accord de Si phrygien.", compasTips: "Arpège descendant ralenti" }
      ],
      letraTitle: "Exemple de letra poétique",
      letraSpanish: `Viva el puente del Genil
y viva Granada entera.
Donde mora la sultana,
la más bonita y morena.`,
      letraFrench: `Vive le pont du Genil
et vive Grenade tout entière.
Où demeure la sultane,
la plus belle et la plus brune.`,
      videos: { 1: [], 2: [], 3: [] }
    }
  },

  "Malaguenas": {
    id: "malaguenas",
    name: "Malagueñas",
    subtitle: "Cante libre de Málaga – Émotion pure et trémolo",
    tag: "Cante libre",
    origin: "Málaga",
    character: "Grave, mélodique, solennel et passionné",
    compas: {
      beats: 0,
      accents: [],
      defaultBpm: 65,
      minBpm: 45,
      maxBpm: 80,
      description: "Cante libre hérité du fandango malagueño. Rythme suspendu guidé par le souffle du chant.",
      rhythmType: 'libre'
    },
    harmonie: {
      summary: "Les <strong>Malagueñas</strong> se jouent généralement <strong>por arriba</strong> (Mi phrygien). La cadence andalouse fondamentale est : <strong>Am – G – F – E</strong>. Les falsetas s'appuient sur des trémolos poignants et des arpèges étalés.",
      tonality: "Mi phrygien (por arriba)",
      cadence: ["Am", "G", "F", "E (Mi flamenco)"],
      cejillaTips: "Fréquemment au sillet d'origine ou cejilla 1 à 3 selon le registre vocal.",
      chords: [
        { name: "E (Mi flamenco)", fretText: "0-2-2-1-0-0", description: "Tonique fondamentale en Mi phrygien" },
        { name: "F (Fa flamenco)", fretText: "1-3-3-2-0-0", description: "Degré bII avec cordes Si et Mi aigu à vide" },
        { name: "G (Sol)", fretText: "3-2-0-0-0-3", description: "Accord de passage" },
        { name: "Am (La mineur)", fretText: "x-0-2-2-1-0", description: "Degré iv de départ de la cadence" },
        { name: "E7(b9)", fretText: "0-2-0-1-0-1", description: "Tension dramatique typique de Málaga" }
      ]
    },
    intro: {
      title: "Entrada por Malagueñas – Gravité et souffle mélodique",
      concept: "La Malagueña se caractérise par une ouverture dramatique où la guitare installe la cadence andalouse en Mi phrygien avec une grande liberté expressive, préparant l'entrée du cantaor sur les tercios étirés.",
      howToStart: "1. Positionner la guitare en Mi flamenco por arriba.\n2. Égrener lentement la cadence Am ➔ G ➔ F ➔ E avec un trémolo ou des arpèges étalés.\n3. Laisser sonner les cordes de Si et Mi aigu à vide sur le Fa flamenco pour créer l'ambiance mystérieuse.\n4. Terminer la phrase d'intro en E7(b9) ou Mi majeur avec une suspension pour laisser entrer le cante.",
      compasAdvice: "Rythme libre (ad libitum). Suivez les ondulations de la mélodie et suspendez le temps sur les accords de tension.",
      tonalAmbience: "Mi phrygien (por arriba). Grave, lyrique, passionné et noble.",
      chordsTips: "E (0-2-2-1-0-0) ➔ F flamenco (1-3-3-2-0-0) ➔ E7(b9) (0-2-0-1-0-1).",
      videos: [
        { id: "ma-intro-1", title: "Falseta très facile d'intro - Malagueña", url: "https://www.youtube.com/watch?v=r6a5AFZstNs", level: 1, description: "Doigtés clairs et introduction posée pour entrer dans le toque de Málaga." },
        { id: "ma-intro-2", title: "Tutorial por Malagueñas (Guía y falseta)", url: "https://www.youtube.com/watch?v=2ea6aqVqVX4", level: 2, description: "Guide complet du toucher, de la résonance des basses et des ornements." }
      ]
    },
    falsetas: {
      1: [
        { id: "ma-f-1-1", title: "Falseta très facile", url: "https://www.youtube.com/watch?v=r6a5AFZstNs", level: 1, description: "Harmonies claires et doigtés fondamentaux pour débuter." }
      ],
      2: [
        { id: "ma-f-2-1", title: "Tutorial por Malagueñas", url: "https://www.youtube.com/watch?v=2ea6aqVqVX4", level: 2, description: "Guide complet des nuances dynamiques et de l'ornementation." }
      ],
      3: [
        { id: "ma-f-3-1", title: "Falseta avec trémolo + remate", url: "https://www.youtube.com/watch?v=xgLz_SjF9aw", level: 3, description: "Exécution de haut vol du trémolo flamenco sur la cadence andalouse." }
      ]
    },
    cante: { 1: [], 2: [], 3: [] },
    baile: {
      structure: `<div class="structure-title">Structure du baile por Malagueñas</div>
Baile expressif, axé sur l'émotion corporelle et la retenue. Rarement dansé en tablao, il est l'apanage des créations scéniques d'auteur.`,
      structureSteps: [
        { step: 1, name: "Prélude guitare", description: "Mise en vibration de la caisse de résonance.", compasTips: "Arpèges lents et tenus" },
        { step: 2, name: "Letra de cante", description: "Déclamation dramatique du cantaor.", compasTips: "Soutenir avec accords étouffés" },
        { step: 3, name: "Résolution finale", description: "Ralentissement progressif sur l'accord de Mi majeur.", compasTips: "Fin en pianissimo" }
      ],
      letraTitle: "Letra traditionnelle de Málaga",
      letraSpanish: `Málaga, tierra mía,
dónde está mi querer.
Que se lo llevó la marea
una noche al amanecer.`,
      letraFrench: `Málaga, ma terre chérie,
où se trouve mon amour ?
La marée l'a emporté
une nuit, aux premières lueurs de l'aube.`,
      videos: { 1: [], 2: [], 3: [] }
    }
  },

  "Solea": {
    id: "solea",
    name: "Soleá",
    subtitle: "Mère du cante flamenco – Noblesse et profondeur",
    tag: "12 temps jondo",
    origin: "Triana / Séville",
    character: "Profond, majestueux, solennel et méditatif",
    compas: {
      beats: 12,
      accents: [12, 3, 6, 8, 10],
      defaultBpm: 85,
      minBpm: 60,
      maxBpm: 110,
      description: "Compás à 12 temps, solennel et cadencé. Les accents clés se situent sur [12] 1 2 [3] 4 5 [6] 7 [8] 9 [10] 11. Le tempo permet une expressivité infinie.",
      rhythmType: '12-temps'
    },
    harmonie: {
      summary: "La <strong>Soleá</strong> se joue principalement <strong>por arriba</strong> (mode phrygien de Mi). Cadence andalouse classique : <strong>Am – G – F – E</strong>. Peut également se jouer por medio (La phrygien) dans certaines variantes.",
      tonality: "Por arriba (Mi phrygien)",
      cadence: ["Am", "G", "F", "E (Mi flamenco)"],
      cejillaTips: "Cejilla souvent placée en case 2, 3 ou 4 pour s'adapter au timbre du cantaor.",
      chords: [
        { name: "E (Mi flamenco)", fretText: "0-2-2-1-0-0", description: "Tonique centrale de la Soleá" },
        { name: "F (Fa flamenco)", fretText: "1-3-3-2-0-0", description: "Tension phrygienne indispensable avec cordes aiguës libres" },
        { name: "G7 / G", fretText: "3-2-0-0-0-1", description: "Degré bVII" },
        { name: "Am", fretText: "x-0-2-2-1-0", description: "Degré iv de préparation" },
        { name: "Fmaj7(#11)", fretText: "x-x-3-2-0-0", description: "Voicing moderne raffiné" }
      ]
    },
    intro: {
      title: "Entrada por Soleá – Poids, silence et solennité",
      concept: "La Soleá est la mère du cante. L'entrée de la guitare doit créer un climat de recueillement et de respect : chaque note et chaque silence comptent. Le guitariste installe le compás lourd à 12 temps et prépare le temple du chanteur.",
      howToStart: "1. Placer la main gauche en position de Mi flamenco (por arriba).\n2. Démarrer souvent 'ad libitum' par un rasgueo étalé au pouce, ou entrer directement sur le temps 12 d'un compás lent (70-85 BPM).\n3. Dérouler la cadence Am ➔ G ➔ F ➔ E avec un toucher rond et profond au pouce (toque sobrio).\n4. Marquer le remate au temps 10 pour suspendre le silence avant la première letra du cante.",
      compasAdvice: "Dans la Soleá, le silence fait partie intégrante de la musique. Marquez les accents 12, 3, 6, 8, 10 avec gravité, sans jamais presser le tempo.",
      tonalAmbience: "Mi phrygien (por arriba). Grave, majestueux, tragique et d'une grande noblesse spirituelle.",
      chordsTips: "E (0-2-2-1-0-0) ➔ F (1-3-3-2-0-0) ➔ E avec retards mélodiques sur les cordes de Si et Sol.",
      videos: [
        { id: "so-intro-1", title: "Entrada por Soleá 'De la Casa' - FlamencoFácil", url: "https://www.youtube.com/watch?v=ZTJuThIWv2M", level: 1, description: "Introduction pédagogique claire et directe pour poser le compás et l'ambiance por arriba." },
        { id: "so-intro-2", title: "Entrada Soleá de Moraíto Chico", url: "https://www.youtube.com/watch?v=tSucYVPBJ4w", level: 2, description: "L'art incomparable de Moraíto pour faire respirer la Soleá de Jerez." },
        { id: "so-intro-3", title: "Entrada Solea Tomatito", url: "https://www.youtube.com/watch?v=SMcWkp4M2zg", level: 2, description: "La patte virtuose et moderne de Tomatito pour débuter la Soleá." }
      ]
    },
    falsetas: {
      1: [
        { id: "so-f-1-1", title: "Falseta très facile", url: "https://www.youtube.com/watch?v=WKncsRkx_M0", level: 1, description: "Phrasé sobre et percutant pour asseoir le compás de la Soleá." },
        { id: "so-f-1-2", title: "Soleá en 2 jours", url: "https://www.youtube.com/watch?v=Y-_d7E4hSs0", level: 1, description: "Structure condensée idéale pour démarrer sans s'éparpiller." }
      ],
      2: [
        { id: "so-f-2-1", title: "4 falsetas traditionnelles", url: "https://www.youtube.com/watch?v=KZmuqxoTtLw", level: 2, description: "Recueil des grands motifs classiques transmis de maître à élève." },
        { id: "so-f-2-2", title: "Falseta + remate", url: "https://www.youtube.com/watch?v=-pWs3e6XTIg", level: 2, description: "Finition rigoureuse sur le temps 10." }
      ],
      3: [
        { id: "so-f-3-1", title: "Falseta « définitive »", url: "https://www.youtube.com/watch?v=WTHuHXpaDqg", level: 3, description: "Chef-d'œuvre de contretemps, ligados expressifs et pureté du toque." }
      ]
    },
    cante: {
      1: [
        { id: "so-c-1-1", title: "Acompañamiento básico", url: "https://www.youtube.com/watch?v=BTpfnEr9DJE", level: 1, description: "Marquage sobre des temps forts et écoute des tercios du cante." }
      ],
      2: [
        { id: "so-c-2-1", title: "Explication accompagnement", url: "https://www.youtube.com/watch?v=sFPsZFAkKgA", level: 2, description: "Anticipation des respirations et placement des accords." }
      ],
      3: [
        { id: "so-c-3-1", title: "Tutorial complet", url: "https://www.youtube.com/watch?v=7Q3urs5dhsE", level: 3, description: "Accompagnement intégral d'une suite de Soleares." }
      ]
    },
    baile: {
      structure: `<div class="structure-title">Structure traditionnelle du baile por Soleá</div>
1. Salida guitare<br>
2. Letras + marcaje<br>
3. Escobilla (travail de zapateado)<br>
4. Falsetas de liaison<br>
5. Cierre<br>
6. Souvent final accéléré en Bulerías (Bulerías de salida)`,
      structureSteps: [
        { step: 1, name: "Temple & Salida", description: "Pose de l'ambiance solennelle et entrée majestueuse.", compasTips: "Tempo lent et pesant (80 BPM)" },
        { step: 2, name: "Première Letra", description: "Chant profond accompagné avec gravité et silences.", compasTips: "Pas de précipitation, respecter les silences" },
        { step: 3, name: "Escobilla", description: "Séquence de pas rythmés par le danseur.", compasTips: "Accélération progressive du rythme" },
        { step: 4, name: "Subida", description: "Montée d'intensité vers l'apothéose.", compasTips: "Passage dynamique vers le compás festif" },
        { step: 5, name: "Final por Bulerías", description: "Clôture éclatante en Bulerías al golpe.", compasTips: "Changement de tempo vers 180 BPM" }
      ],
      letraTitle: "Letra traditionnelle",
      letraSpanish: `Si sufres, sufre callando
y no publiques tus penas,
aunque te estén ahogando,
que nadie se ría de ellas.`,
      letraFrench: `Si tu souffres, souffre en silence
et n'étale pas tes peines,
même si elles t'étouffent,
afin que nul ne s'en moque.`,
      letraVideo: { id: "so-letra-v", title: "Soleá de Alcalá au cante", url: "https://www.youtube.com/watch?v=A7Qq-RTd9Ow", level: 2, description: "Letra traditionnelle chantée avec respirations et écoute mutuelle." },
      structureVideos: [
        { id: "so-str-1", title: "Entrada de guitare por Soleá", url: "https://www.youtube.com/watch?v=BPGLonhegdc", level: 2, description: "Entrée solennelle de la guitare et pose du compás lourd." }
      ],
      videos: {
        1: [
          { id: "so-b-1-1", title: "Montar y acompañar un baile", url: "https://www.youtube.com/watch?v=zxSyQ-K6Jh0", level: 1, description: "Guide pas à pas pour suivre la chorégraphie et les signaux." }
        ],
        2: [],
        3: []
      }
    }
  },

  "Taranta": TARANTA,

  "Tangos": {
    id: "tangos",
    name: "Tangos",
    subtitle: "Compás binaire à 4 temps – Festero, dansant et rythmé",
    tag: "4 temps festif",
    origin: "Séville, Cádiz, Grenade, Málaga",
    character: "Entraînant, sensuel, chaleureux et chaloupé",
    compas: {
      beats: 4,
      accents: [2, 3, 4],
      defaultBpm: 128,
      minBpm: 100,
      maxBpm: 165,
      description: "Compás binaire à 4 temps (mesure à 4/4). Le temps 1 est silencieux ou feutré, les accents marqués tombent sur 2, 3 et 4 : [1] 2 3 4.",
      rhythmType: '4-temps'
    },
    harmonie: {
      summary: "Les <strong>Tangos flamencos</strong> se jouent le plus souvent <strong>por medio</strong> (La phrygien) avec la cadence : <strong>Dm – C – Bb – A</strong>, ou parfois <strong>por arriba</strong> (Mi phrygien). Le compás chaloupé est idéal pour l'apprentissage du rythme.",
      tonality: "Por medio (La phrygien)",
      cadence: ["Dm", "C", "Bb", "A (La flamenco)"],
      cejillaTips: "Cejilla fréquente entre case 2 et 5 selon la tessiture de la voix.",
      chords: [
        { name: "A (La flamenco)", fretText: "x-0-2-2-2-0", description: "Tonique centrale du compás" },
        { name: "Bb (Si bémol)", fretText: "x-1-3-3-3-1", description: "Bémol 2 percutant" },
        { name: "C (Do)", fretText: "x-3-2-0-1-0", description: "Accord de transition" },
        { name: "Dm (Ré mineur)", fretText: "x-x-0-2-3-1", description: "Premier degré de la cadence" }
      ]
    },
    intro: {
      title: "Entrada por Tangos – Le groove 4 temps et l'ambiance festera",
      concept: "Les Tangos reposent sur un balancement binaire irrésistible. Le secret de l'entrée est de laisser respirer le temps 1 pour attaquer avec un son tranchant et swingué sur les temps 2, 3 et 4.",
      howToStart: "1. Positionner la main en La flamenco (por medio) ou Mi flamenco (por arriba).\n2. Démarrer par un golpe sec ou silence sur le temps 1, puis déclencher les rasgueos sur 2, 3 et 4.\n3. Balancer la cadence Dm ➔ C ➔ Bb ➔ A avec le pouce ou en rasgueados étouffés (alzapúa/apagado).\n4. Marquer le remate ou lancer une falseta courte d'entrée pour appeler le chant ('Triana, Triana...').",
      compasAdvice: "Rappelez-vous : [1 silencieux ou golpe] - [2 rasgueo] - [3 rasgueo] - [4 accent]. Ne pressez pas : le compás doit être 'afincao' (ancré dans le sol).",
      tonalAmbience: "La phrygien (por medio). Chaleureux, sensuel, festif, avec une cadence dansante immédiate.",
      chordsTips: "A (x-0-2-2-2-0) ➔ Bb (x-1-3-3-3-1) avec golpes sur la table d'harmonie.",
      videos: [
        { id: "tg-intro-1", title: "ENTRADA POR TANGOS DE MORAITO CHICO", url: "https://www.youtube.com/watch?v=AIw6RmmlK84", level: 2, description: "L'entrée légendaire de Moraíto Chico expliquée guitare en main avec le son pur de Jerez." },
        { id: "tg-intro-2", title: "Entrada, Falseta y Remate por Tangos (TUTORIAL)", url: "https://www.youtube.com/watch?v=gi-oT3L7x_Q", level: 1, description: "Tutoriel complet détaillant l'enchaînement de l'entrée, de la première falseta et du remate." },
        { id: "tg-intro-3", title: "Comment jouer l'entrée des Tangos - Toni Flamadeus", url: "https://www.youtube.com/watch?v=AOpmxrzYWCA", level: 1, description: "Apprentissage des notes au pouce et des rasgueados avec golpe pour démarrer sans hésiter." }
      ]
    },
    falsetas: {
      1: [
        { id: "tg-f-1-1", title: "Los TANGOS flamencos más rápidos de aprender (Jerónimo de Carmen)", url: "https://www.youtube.com/watch?v=VCTY6XRudBM", level: 1, description: "Apprentissage express du compás des Tangos avec positions claires et tempo modéré." }
      ],
      2: [
        { id: "tg-f-2-1", title: "Falseta por Tangos de Moraíto Chico (Jerónimo de Carmen)", url: "https://www.youtube.com/watch?v=HQefM4ZxRQs", level: 2, description: "Mélodie gitane de référence avec alzapúa de pouce et golpes au compás." }
      ],
      3: []
    },
    cante: {
      1: [
        { id: "tg-c-1-1", title: "Accompagnement cante por Tangos (Estrella Morente)", url: "https://www.youtube.com/watch?v=EttBBdK7bow", level: 1, description: "Comprendre le placement des rasgueados sur les temps 2, 3 et 4 et respirer avec le chant." },
        { id: "tg-c-1-2", title: "Tangos La Estrella (Enrique Morente)", url: "https://www.youtube.com/watch?v=J0DzZKlvHRA", level: 1, description: "Accompagnement d'une letra de légende de Grenade." }
      ],
      2: [],
      3: []
    },
    baile: {
      structure: `<div class="structure-title">Structure classique du baile por Tangos</div>
1. Entrada musicale (Appel de la guitare)<br>
2. Salida cante (Llamada)<br>
3. Letras successives avec marcajes sensuels<br>
4. Escobilla (Jeux de pieds cadencés)<br>
5. Subida & Cierre final festif`,
      structureSteps: [
        { step: 1, name: "Entrada", description: "Entrée en scène cadencée sur le 4 temps.", compasTips: "Accents nets sur 2, 3, 4" },
        { step: 2, name: "Letra & Marcaje", description: "Le danseur marque le chant avec souplesse des hanches.", compasTips: "Rythme chaloupé régulier" },
        { step: 3, name: "Escobilla", description: "Jeux de pieds percutants.", compasTips: "Subida progressive" },
        { step: 4, name: "Cierre", description: "Fermeture festive sur le temps 4.", compasTips: "Remate net" }
      ],
      structureVideos: [
        { id: "tg-str-1", title: "Entrada et llamadas de Tangos (Moraíto Chico)", url: "https://www.youtube.com/watch?v=HQefM4ZxRQs", level: 2, description: "Démonstration des remates d'entrée et de liaison pour le baile." }
      ],
      letraTitle: "Letra traditionnelle de Triana",
      letraSpanish: `Adiós patio de la cárcel,
rincón de la barbería,
que al que no tiene dinero
lo afeitan con agua fría.`,
      letraFrench: `Adieu cour de la prison,
recoin de la boutique du barbier,
celui qui n'a pas un sou,
on le rase à l'eau glacée.`,
      letraVideo: { id: "tg-letra-v", title: "Tangos de Triana chantés - Enrique Morente", url: "https://www.youtube.com/watch?v=J0DzZKlvHRA", level: 1, description: "Interprétation chantée avec accompagnement de guitare." },
      videos: { 1: [], 2: [], 3: [] }
    },
    variants: {
      "Tangos de Triana": {
        id: "tangos-triana",
        name: "Tangos de Triana",
        subtitle: "Séville – Le berceau gitan des Tangos",
        tag: "Triana (Séville)",
        origin: "Triana (Séville)",
        character: "Festero, gitan, fier et terrien",
        compas: {
          beats: 4,
          accents: [2, 3, 4],
          defaultBpm: 125,
          minBpm: 100,
          maxBpm: 155,
          description: "Compás binaire à 4 temps, très marqué et terrien. Style festero et gitano de Séville.",
          rhythmType: '4-temps'
        },
        harmonie: {
          summary: "Les <strong>Tangos de Triana</strong> sont parmi les plus classiques et emblématiques. Compás binaire, style festero et gitano de Séville en La phrygien.",
          tonality: "Por medio (La phrygien)",
          cadence: ["Dm", "C", "Bb", "A"],
          cejillaTips: "Case 2 à 4 selon la voix.",
          chords: [
            { name: "A", fretText: "x-0-2-2-2-0", description: "Tonique" },
            { name: "Bb", fretText: "x-1-3-3-3-1", description: "Bémol 2" },
            { name: "C", fretText: "x-3-2-0-1-0", description: "Passage" },
            { name: "Dm", fretText: "x-x-0-2-3-1", description: "Mineur" }
          ]
        },
        falsetas: { 1: [], 2: [], 3: [] },
        cante: { 1: [], 2: [], 3: [] },
        baile: {
          structure: `<div class="structure-title">Structure baile – Tangos de Triana</div>
1. Entrada<br>
2. Letras + marcaje<br>
3. Escobilla<br>
4. Subida / llamada<br>
5. Cierre`,
          structureSteps: [
            { step: 1, name: "Entrada", description: "Installation du compás de Triana.", compasTips: "Accords incisifs" },
            { step: 2, name: "Letra de Triana", description: "Mélodie typique du quartier gitan.", compasTips: "Marquage terrien" },
            { step: 3, name: "Cierre", description: "Clôture en apothéose festive.", compasTips: "Arrêt net" }
          ],
          letraTitle: "Letra de Triana",
          letraSpanish: `Adiós patio de la cárcel,
rincón de la barbería,
que al que no tiene dinero
lo afeitan con agua fría.`,
          letraFrench: `Adieu cour de la prison,
recoin du barbier,
celui qui n'a pas d'argent
on le rase à l'eau froide.`,
          videos: { 1: [], 2: [], 3: [] }
        }
      },

      "Tangos de Málaga": {
        id: "tangos-malaga",
        name: "Tangos de Málaga",
        subtitle: "Málaga – Ligne mélodique singulière et charmeuse",
        tag: "Málaga",
        origin: "Málaga / El Piyayo",
        character: "Chantant, plus mélodique et cadencé",
        compas: {
          beats: 4,
          accents: [2, 3, 4],
          defaultBpm: 120,
          minBpm: 95,
          maxBpm: 145,
          description: "Compás à 4 temps plus doux, souvent associé au style d'El Piyayo avec influence guajira.",
          rhythmType: '4-temps'
        },
        harmonie: {
          summary: "Les <strong>Tangos de Málaga</strong> ont un caractère propre, souvent plus mélodiques avec des modulations en majeur ou des tournures proches du Piyayo.",
          tonality: "Por medio ou Mi majeur / phrygien",
          cadence: ["Dm", "C", "Bb", "A"],
          cejillaTips: "Case 1 à 3.",
          chords: [
            { name: "A", fretText: "x-0-2-2-2-0", description: "Tonique" },
            { name: "Bb", fretText: "x-1-3-3-3-1", description: "Bémol 2" },
            { name: "E7", fretText: "0-2-0-1-0-0", description: "Dominante" }
          ]
        },
        falsetas: { 1: [], 2: [], 3: [] },
        cante: { 1: [], 2: [], 3: [] },
        baile: {
          structure: `<div class="structure-title">Structure baile – Tangos de Málaga</div>
Structure classique des Tangos : entrada, letras, escobilla, cierre.`,
          structureSteps: [
            { step: 1, name: "Entrada", description: "Entrée mélodique.", compasTips: "Nuance douce" },
            { step: 2, name: "Letra de Málaga", description: "Chant ouvert et maritime.", compasTips: "Soutien aéré" },
            { step: 3, name: "Cierre", description: "Final rythmé.", compasTips: "Remate clair" }
          ],
          letraTitle: "Letra de Málaga",
          letraSpanish: `Málaga tiene una playa
que se llama la Malagueta.
Donde los barquitos veleros
van remando a la veleta.`,
          letraFrench: `Málaga a une plage
qui s'appelle la Malagueta.
Où les bateaux à voile
naviguent vers la girouette.`,
          videos: { 1: [], 2: [], 3: [] }
        }
      },

      "Tangos de Granada": {
        id: "tangos-granada",
        name: "Tangos de Granada",
        subtitle: "Sacromonte – Les zambras gitanes de Grenade",
        tag: "Granada (Sacromonte)",
        origin: "Sacromonte (Granada)",
        character: "Arabo-andalou, mystique, ardent et percussif",
        compas: {
          beats: 4,
          accents: [2, 3, 4],
          defaultBpm: 122,
          minBpm: 95,
          maxBpm: 150,
          description: "Le fameux rythme des zambras du Sacromonte, avec une cadence lancinante et hypnotique.",
          rhythmType: '4-temps'
        },
        harmonie: {
          summary: "Les <strong>Tangos de Granada</strong> (ou Tangos granadinos) ont un air caractéristique de la région, influencé par la zambra gitane du Sacromonte.",
          tonality: "Por medio ou Si phrygien",
          cadence: ["Dm", "C", "Bb", "A"],
          cejillaTips: "Case 2 à 4.",
          chords: [
            { name: "A flamenco", fretText: "x-0-2-2-2-0", description: "Tonique" },
            { name: "Bb", fretText: "x-1-3-3-3-1", description: "Bémol 2" },
            { name: "Dm", fretText: "x-x-0-2-3-1", description: "Mineur" }
          ]
        },
        falsetas: { 1: [], 2: [], 3: [] },
        cante: { 1: [], 2: [], 3: [] },
        baile: {
          structure: `<div class="structure-title">Structure baile – Tangos de Granada</div>
Structure classique des Tangos avec l'accentuation particulière des zambras du Sacromonte.`,
          structureSteps: [
            { step: 1, name: "Entrada zambra", description: "Introduction hypnotique.", compasTips: "Golpes sourds sur la table" },
            { step: 2, name: "Letra granadina", description: "Chant aux intonations mauresques.", compasTips: "Marcaje félin" },
            { step: 3, name: "Cierre del Sacromonte", description: "Fermeture éclatante.", compasTips: "Apogée percussive" }
          ],
          letraTitle: "Letra de Granada",
          letraSpanish: `Granada, tierra soñada,
dónde está mi querer.
Bajo la sombra del ciprés
la vi llorar y correr.`,
          letraFrench: `Grenade, terre rêvée,
où est donc mon amour ?
Sous l'ombre du cyprès
je l'ai vue pleurer et fuir.`,
          videos: { 1: [], 2: [], 3: [] }
        }
      },

      "Tangos del Titi": {
        id: "tangos-titi",
        name: "Tangos del Titi",
        subtitle: "Triana – Le génie de Francisco la Perla 'El Titi'",
        tag: "Triana (El Titi)",
        origin: "Triana (Séville)",
        character: "Savoureux, syncopé, gitan et bondissant",
        compas: {
          beats: 4,
          accents: [2, 3, 4],
          defaultBpm: 130,
          minBpm: 105,
          maxBpm: 160,
          description: "La signature rythmique et mélodique de référence pour les danseurs de Triana.",
          rhythmType: '4-temps'
        },
        harmonie: {
          summary: "Les <strong>Tangos del Titi</strong> sont une variante très caractéristique et populaire, avec des résolutions harmoniques franches et un air inoubliable.",
          tonality: "Por medio (La phrygien)",
          cadence: ["Dm", "C", "Bb", "A"],
          cejillaTips: "Case 2 à 4.",
          chords: [
            { name: "A", fretText: "x-0-2-2-2-0", description: "Tonique" },
            { name: "Bb", fretText: "x-1-3-3-3-1", description: "Bémol 2" },
            { name: "C", fretText: "x-3-2-0-1-0", description: "Passage" }
          ]
        },
        falsetas: { 1: [], 2: [], 3: [] },
        cante: { 1: [], 2: [], 3: [] },
        baile: {
          structure: `<div class="structure-title">Structure baile – Tangos del Titi</div>
Structure classique des Tangos, avec le style propre, rebondissant et inimitable du Titi.`,
          structureSteps: [
            { step: 1, name: "Entrada del Titi", description: "Llamada typique du Titi.", compasTips: "Accents syncopés" },
            { step: 2, name: "Letra du Titi", description: "Chant joyeux et rebondi.", compasTips: "Soutien dynamique" },
            { step: 3, name: "Remate", description: "Cierre net à 4.", compasTips: "Coup de talon synchronisé" }
          ],
          letraTitle: "Letra del Titi",
          letraSpanish: `Que lejos está mi tierra
y más lejos mi querer.
Pero me consuela el compás
que me hace revivir.`,
          letraFrench: `Comme ma terre est lointaine
et plus lointain encore mon amour.
Mais le compás me console
et me redonne la vie.`,
          videos: { 1: [], 2: [], 3: [] }
        }
      },

      "Tangos de Cadiz": {
        id: "tangos-cadiz",
        name: "Tangos de Cádiz",
        subtitle: "Cádiz – L'esprit de la baie, salé et festif",
        tag: "Cádiz",
        origin: "Cádiz",
        character: "Pétillant, plein de grâce, taquin et ensoleillé",
        compas: {
          beats: 4,
          accents: [2, 3, 4],
          defaultBpm: 132,
          minBpm: 110,
          maxBpm: 165,
          description: "Rythme chaloupé avec une pointe de malice gaditane, souvent teinté de majeur.",
          rhythmType: '4-temps'
        },
        harmonie: {
          summary: "Les <strong>Tangos de Cádiz</strong> ont un caractère festero très cadizien, souvent chantés avec malice et une touche enjouée de mode majeur.",
          tonality: "Por medio ou Do majeur",
          cadence: ["Dm", "C", "Bb", "A"],
          cejillaTips: "Case 1 à 3.",
          chords: [
            { name: "A", fretText: "x-0-2-2-2-0", description: "Tonique" },
            { name: "Bb", fretText: "x-1-3-3-3-1", description: "Bémol 2" },
            { name: "C", fretText: "x-3-2-0-1-0", description: "Passage" }
          ]
        },
        falsetas: { 1: [], 2: [], 3: [] },
        cante: { 1: [], 2: [], 3: [] },
        baile: {
          structure: `<div class="structure-title">Structure baile – Tangos de Cádiz</div>
Structure classique des Tangos avec l'élégance souple et piquante de Cadix.`,
          structureSteps: [
            { step: 1, name: "Salida gaditana", description: "Entrée pleine de sel et d'esprit.", compasTips: "Rasgueado léger" },
            { step: 2, name: "Letra de Cádiz", description: "Texte taquin et poétique.", compasTips: "Sourire dans le son" },
            { step: 3, name: "Cierre festif", description: "Final éclatant.", compasTips: "Rasgueado final en éventail" }
          ],
          letraTitle: "Letra de Cádiz",
          letraSpanish: `Cádiz, tierra de la gracia,
dónde nací yo.
Tierra con sal y alegría
bajo la luz del sol.`,
          letraFrench: `Cadix, terre de la grâce,
où je suis né.
Terre de sel et d'allégresse
sous la lumière du soleil.`,
          videos: { 1: [], 2: [], 3: [] }
        }
      }
    }
  },

  "Seguiriya": {
    id: "seguiriya",
    name: "Seguiriya",
    subtitle: "Le cri originel – Douleur sacrée et compás inversé",
    tag: "12 temps décalé",
    origin: "Jerez, Cadix, Triana",
    character: "Tragique, sombre, poignant et viscéral",
    compas: {
      beats: 12,
      accents: [1, 3, 5, 8, 11],
      defaultBpm: 68,
      minBpm: 50,
      maxBpm: 90,
      description: "Compás jondo à 5 temps inégaux (3 courts et 2 longs) répartis sur 12 temps : 1-2 [3] 4 [5] 6-7 [8] 9-10 [11] 12.",
      rhythmType: '12-temps'
    },
    harmonie: {
      summary: "La <strong>Seguiriya</strong> se joue principalement <strong>por medio</strong> (La phrygien) ou <strong>por arriba</strong> (Mi phrygien). Cadence andalouse lente, pesante et décharnée.",
      tonality: "Por medio (La phrygien)",
      cadence: ["Dm", "C", "Bb", "A"],
      cejillaTips: "Cejilla adaptée à la voix sombre du chanteur (case 2 à 4).",
      chords: [
        { name: "A flamenco", fretText: "x-0-2-2-2-0", description: "Tonique grave et résonante" },
        { name: "Bb", fretText: "x-1-3-3-3-1", description: "Tension déchirante" },
        { name: "Dm", fretText: "x-x-0-2-3-1", description: "Point de départ sombre" }
      ]
    },
    intro: {
      title: "Entrada por Seguiriya – Douleur sacrée et compás inversé",
      concept: "La Seguiriya est le cœur tragique du flamenco. Son compás asymétrique (alternance de mesures ternaires et binaires) demande une concentration extrême : le guitariste installe une tension dramatique sans artifice.",
      howToStart: "1. Positionner la guitare por medio (La phrygien).\n2. Démarrer avec un marcaje dépouillé et lourd au pouce sur les basses.\n3. Compter mentalement : 1-2 [3] 4 [5] 6-7 [8] 9-10 [11] 12, en faisant résonner la 5ème corde à vide.\n4. Poser la cadence Dm ➔ C ➔ Bb ➔ A avec des rasgueados retenus et des silences solennels.",
      compasAdvice: "Respectez l'inégalité des temps : les temps 3, 5, 8, 11 et 12 ont une durée et un poids différents. Laissez sonner chaque accord.",
      tonalAmbience: "La phrygien (por medio). Tragique, ancestral, dépouillé, chargé d'angoisse et de ferveur.",
      chordsTips: "A flamenco (x-0-2-2-2-0) ➔ Bb (x-1-3-3-3-1) avec basses appuyées au pouce.",
      videos: [
        { id: "seg-intro-1", title: "ESTA ENTRADA Y FALSETA POR SEGUIRIYA FÁCILES - Jerónimo de Carmen", url: "https://www.youtube.com/watch?v=-vRophk8nOY", level: 1, description: "Tutoriel direct expliquant comment placer l'entrée et le compás asymétrique sans se perdre." },
        { id: "seg-intro-2", title: "Falseta por seguiriya de Moraíto (1992)", url: "https://www.youtube.com/watch?v=a_GnFXwccqE", level: 2, description: "L'entrée magistrale du maestro de Jerez avec rasgueos et falseta de référence." }
      ]
    },
    falsetas: {
      1: [
        { id: "seg-f-1-1", title: "Entradas e intros por Seguiriya (Jerónimo de Carmen)", url: "https://www.youtube.com/watch?v=-vRophk8nOY", level: 1, description: "Apprentissage du compás solennel et de l'accentuation des temps longs et courts." }
      ],
      2: [
        { id: "seg-f-2-1", title: "Falseta por Siguiriyas traditionnelle (Jerónimo de Carmen)", url: "https://www.youtube.com/watch?v=iFD145hN0xs", level: 2, description: "Jeu pur de Jerez avec pouce sec, alzapúa et silences dramatiques." }
      ],
      3: []
    },
    cante: {
      1: [
        { id: "seg-c-1-1", title: "Falseta por seguiriya de Moraíto (1992)", url: "https://www.youtube.com/watch?v=a_GnFXwccqE", level: 1, description: "Toque pur de Jerez, rasgueos et falseta légendaire jouée directement à la guitare." }
      ],
      2: [
        { id: "seg-c-2-1", title: "Seguiriya La Fragua (Guadiana) - Acompañamiento", url: "https://www.youtube.com/watch?v=afvdQwEVp8w", level: 2, description: "Accompagnement d'un cante jondo d'anthologie." }
      ],
      3: []
    },
    baile: {
      structure: `<div class="structure-title">Structure du baile por Seguiriya</div>
1. Temple et appel de la guitare<br>
2. Salida cante tragique<br>
3. Letra solemnelle<br>
4. Escobilla pesante avec zapateado dense<br>
5. Macho ou final en Cabales`,
      structureSteps: [
        { step: 1, name: "Introduction", description: "Accords lourds posant le drame.", compasTips: "Pesanteur du temps" },
        { step: 2, name: "Letra jonda", description: "Chant de douleur.", compasTips: "Soutien respectueux" },
        { step: 3, name: "Escobilla", description: "Pieds martelant la terre.", compasTips: "Régularité sans faille" },
        { step: 4, name: "Macho final", description: "Accélération finale ou passage en Cabales.", compasTips: "Changement de dynamique" }
      ],
      structureVideos: [
        { id: "seg-str-1", title: "Entrada et llamadas de Seguiriya", url: "https://www.youtube.com/watch?v=-vRophk8nOY", level: 1, description: "Illustration de l'entrée et de la solennité du compás pour le baile." }
      ],
      letraTitle: "Letra tragique traditionnelle",
      letraSpanish: `Siempre por los rincones
te encuentro llorando.
Que yo no tenga libertad en mi vida
si te doy mal pago.`,
      letraFrench: `Toujours dans les recoins
je te trouve en larmes.
Puissé-je être privé de liberté toute ma vie
si je te paye en retour par le mal.`,
      letraVideo: { id: "seg-letra-v", title: "Seguiriya La Fragua (Guadiana) - Acompañamiento", url: "https://www.youtube.com/watch?v=afvdQwEVp8w", level: 2, description: "Accompagnement guitare direct d'un cante jondo d'anthologie." },
      videos: { 1: [], 2: [], 3: [] }
    }
  },

  "Minera": MINERA,
  "Abandolao": ABANDOLAO,
  "Sevillanas": SEVILLANAS,
  "Rumba": RUMBA,
  "Verdiales": VERDIALES,
  "Taranto": TARANTO,
  "Guajiras": GUAJIRAS,
  "Fandangos": FANDANGOS
};

export const FLAMENCO_TECHNIQUES = [
  {
    name: "Rasgueado (ou Rasgueo)",
    icon: "🖐️",
    definition: "Le balayage rythmique percussif des doigts sur les cordes, fondation indispensable du compás.",
    tips: "Garder le poignet souple, utiliser les ongles en éventail (e-a-m-i) et finir fermement par l'index ou le pouce."
  },
  {
    name: "Golpe",
    icon: "🪵",
    definition: "Frappe percussive de l'ongle de l'annulaire ou du majeur sur le golpeador (plaque protectrice en plastique de la table).",
    tips: "Le golpe se fait souvent simultanément avec une note jouée au pouce ou à l'index pour accentuer le compás."
  },
  {
    name: "Alzapúa",
    icon: "👍",
    definition: "Technique virtuose de pouce en trois mouvements : coup vers le bas, frappe de la tranche de l'ongle vers le haut, puis golpe ou note étouffée.",
    tips: "La force vient de la rotation rapide de l'avant-bras et du poignet, le pouce restant ferme."
  },
  {
    name: "Picado",
    icon: "⚡",
    definition: "Jeu en buté alternatif très rapide avec l'index et le majeur (ou index et annulaire) pour les traits mélodiques.",
    tips: "Poser le doigt sur la corde supérieure après l'attaque pour donner un son rond, puissant et précis."
  },
  {
    name: "Trémolo flamenco",
    icon: "💧",
    definition: "Contrairement au trémolo classique (p-a-m-i à 4 notes), le trémolo flamenco se joue à 5 notes : Pouce - Index - Annulaire - Majeur - Index (p-i-a-m-i).",
    tips: "Cette note d'index supplémentaire apporte une texture percussive et fluide unique."
  },
  {
    name: "Cejilla (Capodastre)",
    icon: "🎯",
    definition: "Le capodastre traditionnel en bois avec cheville, indispensable pour adapter les toques aux registres des chanteurs.",
    tips: "Permet de transposer instantanément tout en conservant les résonances ouvertes fondamentales du flamenco (por arriba ou por medio)."
  }
];

export const CEJILLA_CHART = [
  { fret: 0, porArriba: "Mi phrygien (Standard)", porMedio: "La phrygien (Standard)", notes: "Position al aire sans cejilla" },
  { fret: 1, porArriba: "Fa phrygien", porMedio: "Sib phrygien", notes: "Voix d'hommes graves ou baryton" },
  { fret: 2, porArriba: "Fa# phrygien", porMedio: "Si phrygien", notes: "Voix masculines moyennes" },
  { fret: 3, porArriba: "Sol phrygien", porMedio: "Do phrygien", notes: "Très courant pour Soleá & Bulerías" },
  { fret: 4, porArriba: "Sol# phrygien", porMedio: "Do# phrygien", notes: "Voix ténor ou voix de femmes graves" },
  { fret: 5, porArriba: "La phrygien (équiv. por medio)", porMedio: "Ré phrygien", notes: "Voix de femmes ou cante aigu" },
  { fret: 6, porArriba: "Sib phrygien", porMedio: "Mib phrygien", notes: "Cante aigu / cantaora" },
  { fret: 7, porArriba: "Si phrygien", porMedio: "Mi phrygien", notes: "Voix féminines très aiguës" }
];
