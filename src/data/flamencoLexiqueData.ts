export type LexiqueCategory = 'all' | 'danse' | 'guitare' | 'rythme' | 'cante' | 'general';

export interface LexiqueTerm {
  id: string;
  term: string;
  spanish: string;
  category: 'danse' | 'guitare' | 'rythme' | 'cante' | 'general';
  categoryLabel: string;
  badgeColor: string;
  icon: string;
  shortDef: string;
  detailedDef: string;
  appContext?: string;
  relatedTerms?: string[];
}

export const LEXIQUE_CATEGORIES: { id: LexiqueCategory; label: string; icon: string; description: string }[] = [
  { id: 'all', label: 'Tous les termes', icon: '🌟', description: 'Glossaire complet du flamenco' },
  { id: 'danse', label: 'Danse & Baile', icon: '💃', description: 'Jeux de pieds, posture, chorégraphie & structure' },
  { id: 'guitare', label: 'Guitare & Toque', icon: '🎸', description: 'Techniques main droite, accords, cejilla & falsetas' },
  { id: 'rythme', label: 'Rythme & Compás', icon: '🥁', description: 'Pulsations, accents, palmas & métrique' },
  { id: 'cante', label: 'Cante & Poésie', icon: '🎤', description: 'Letras, tercios, styles vocaux & émotions' },
  { id: 'general', label: 'Tablao & Culture', icon: '🏛️', description: 'Scène, traditions, jaleos & vocabulaire' }
];

export const FLAMENCO_LEXIQUE: LexiqueTerm[] = [
  // --- RYTHME & COMPÁS ---
  {
    id: 'compas',
    term: 'Compás',
    spanish: 'Compás',
    category: 'rythme',
    categoryLabel: 'Rythme & Métrique',
    badgeColor: '#e5a93b',
    icon: '⏱️',
    shortDef: "Le cycle rythmique fondamental, la pulsation sacrée et le cadre temporel de tout morceau de flamenco.",
    detailedDef: "Le compás n'est pas un simple métronome : c'est un cercle cyclique fermé où chaque temps possède une fonction précise (élan, tension, résolution). En flamenco, il s'organise principalement en cycles de 12 temps (Soleá, Bulerías, Alegrías), de 4 temps binaires (Tangos, Farruca, Rumba), de 3 temps ternaires (Fandangos, Sevillanas) ou en rythme libre sans mesure (Tonás, Taranta).",
    appContext: "Utilisé dans le métronome interactif du Header et dans la section 'Compás' de chaque Palo.",
    relatedTerms: ['12-temps', 'Palmas', 'Contratiempo', 'Remate']
  },
  {
    id: 'douze-temps',
    term: 'Compás à 12 temps',
    spanish: 'Compás de doce tiempos',
    category: 'rythme',
    categoryLabel: 'Rythme & Métrique',
    badgeColor: '#e5a93b',
    icon: '🔄',
    shortDef: "Cycle rythmique emblématique composé de 12 pulsations avec des accents asymétriques.",
    detailedDef: "Structure reine du flamenco traditionnel. Dans la Soleá et les Bulerías, les accents frappent traditionnellement les temps 3, 6, 8, 10 et 12 (avec clôture nette sur le 10). Dans les Alegrías, les accents vifs soutiennent le rythme festif. Sa compréhension est le premier pas vers la maîtrise du compás.",
    appContext: "Présent dans les fiches de Soleá, Bulerías, Alegrías et dans le visualiseur de compás circulaire.",
    relatedTerms: ['Compás', 'Remate', 'Soleá']
  },
  {
    id: 'palmas-sordas',
    term: 'Palmas sordas',
    spanish: 'Palmas sordas (o sordas)',
    category: 'rythme',
    categoryLabel: 'Rythme & Accompagnement',
    badgeColor: '#e5a93b',
    icon: '👏',
    shortDef: "Frappe de mains étouffée et sourde (paume contre paume creusée) produisant un son mat et feutré.",
    detailedDef: "Les palmas sordas servent à porter le chanteur et le danseur sans jamais saturer l'espace sonore. Elles constituent le tapis rythmique discret indispensable pour laisser résonner la voix ou le jeu subtil des pieds.",
    appContext: "Conseillé pour accompagner le cante et les sections de marcaje ou silencio de la Farruca.",
    relatedTerms: ['Palmas claras', 'Contratiempo']
  },
  {
    id: 'palmas-claras',
    term: 'Palmas claras (ou secas)',
    spanish: 'Palmas abiertas / secas',
    category: 'rythme',
    categoryLabel: 'Rythme & Accompagnement',
    badgeColor: '#e5a93b',
    icon: '💥',
    shortDef: "Frappe de mains claquée et brillante (phalanges d'une main frappant la paume plate de l'autre).",
    detailedDef: "Elles produisent un son aigu, sec et incisif, utilisé lors des accélérations (subidas), des crescendos et des conclusions percutantes (remates, cierres) pour galvaniser l'énergie de la scène.",
    appContext: "Recommandé dans la section finale de la Farruca et pour marquer les remates.",
    relatedTerms: ['Palmas sordas', 'Subida', 'Remate']
  },
  {
    id: 'contratiempo',
    term: 'Contratiempo',
    spanish: 'Contratiempo',
    category: 'rythme',
    categoryLabel: 'Rythme & Métrique',
    badgeColor: '#e5a93b',
    icon: '⚡',
    shortDef: "Intercalage rythmique percussif frappé exactement à mi-chemin entre deux pulsations principales.",
    detailedDef: "La magie et le swing du flamenco reposent sur le jeu polyrythmique entre deux palmeros : l'un tient le temps de base (a tiempo) pendant que l'autre tisse une cascade de contretemps (a contratiempo), créant une dynamique irrésistible.",
    appContext: "Présent dans les cours de compás et les tutoriels de palmas de l'application.",
    relatedTerms: ['Compás', 'Palmas claras']
  },
  {
    id: 'a-palo-seco',
    term: 'A palo seco',
    spanish: 'A palo seco',
    category: 'rythme',
    categoryLabel: 'Chant & Tradition',
    badgeColor: '#ef4444',
    icon: '🎙️',
    shortDef: "Chant exécuté à voix nue sans accompagnement de guitare, parfois rythmé par un bâton ou une enclume.",
    detailedDef: "La forme la plus dépouillée et primitive du flamenco (Tonás, Martinetes, Debla). Le cantaor s'appuie uniquement sur sa gorge et son sens inné du temps, sans support harmonique instrumental.",
    appContext: "Classé dans l'arborescence des palos ancestraux au sommet de la généalogie flamenca.",
    relatedTerms: ['Cante Jondo', 'Tonás']
  },

  // --- DANSE & BAILE ---
  {
    id: 'farruca',
    term: 'Farruca',
    spanish: 'Farruca',
    category: 'danse',
    categoryLabel: 'Style de Danse (Palo)',
    badgeColor: '#c53d2d',
    icon: '💃',
    shortDef: "Palo masculin et sobre à 4 temps, caractérisé par sa fierté, son port altier et son zapateado millimétré.",
    detailedDef: "Originaire du nord de l'Espagne (Galice / Asturies) et adaptée au flamenco au début du XXe siècle, notamment par Faíco. Se danse traditionnellement en pantalon à taille haute et gilet court. Elle repose sur des arrêts sculpturaux, une tension contenue et une virtuosité technique épurée.",
    appContext: "Palo central de l'espace Danse dans l'application, avec structure canonique en 6 blocs et montages personnalisés.",
    relatedTerms: ['Zapateado', 'Llamada', 'Desplante', 'Silencio']
  },
  {
    id: 'llamada',
    term: 'Llamada',
    spanish: 'Llamada (Appel)',
    category: 'danse',
    categoryLabel: 'Structure Chorégraphique',
    badgeColor: '#c53d2d',
    icon: '📣',
    shortDef: "Séquence rythmique percutante qui 'appelle' et prévient le cantaor ou les musiciens d'une action à venir.",
    detailedDef: "Exécutée au zapateado par le danseur ou aux rasgueos par le guitariste. Elle signale un tournant décisif : fin d'une introduction, invitation du chant à débuter, ou transition vers une nouvelle section.",
    appContext: "Bloc clé présent dans la structure de danse et dans les montages vidéo de l'application.",
    relatedTerms: ['Remate', 'Cierre', 'Letra']
  },
  {
    id: 'desplante',
    term: 'Desplante',
    spanish: 'Desplante',
    category: 'danse',
    categoryLabel: 'Expression & Posture',
    badgeColor: '#c53d2d',
    icon: '🧍',
    shortDef: "Posture immobile et altière où le danseur se fige pour affirmer sa présence face au public.",
    detailedDef: "Après un enchaînement intense ou une montée de pieds, le danseur stoppe net tout mouvement. Ce silence visuel chargé d'intensité dramatique provoque souvent les bravos et les jaleos de l'auditoire.",
    appContext: "Point culminant visualisé dans les chorégraphies des Grands Maîtres (Gades, Baras).",
    relatedTerms: ['Llamada', 'Remate', 'Farruca']
  },
  {
    id: 'zapateado',
    term: 'Zapateado',
    spanish: 'Zapateado',
    category: 'danse',
    categoryLabel: 'Technique de Pieds',
    badgeColor: '#c53d2d',
    icon: '👞',
    shortDef: "L'art de percussion des chaussures de danse au sol, transformant le danseur en véritable instrument.",
    detailedDef: "Combine les frappes de la plante (planta), du talon (tacón) et de la pointe (punta). Il demande une dissociation corporelle parfaite, des genoux souples et un centre de gravité bas pour maintenir la vitesse sans raideur.",
    appContext: "Présent dans les vidéos de cours techniques et les repères pédagogiques de la Farruca.",
    relatedTerms: ['Planta', 'Tacón', 'Escobilla']
  },
  {
    id: 'escobilla',
    term: 'Escobilla',
    spanish: 'Escobilla',
    category: 'danse',
    categoryLabel: 'Section Chorégraphique',
    badgeColor: '#c53d2d',
    icon: '⚙️',
    shortDef: "Longue section centrale de la danse dédiée à la démonstration virtuose du zapateado.",
    detailedDef: "Pendant l'escobilla, le chant se tait. Le guitariste joue un motif mélodique régulier (souvent en boucle douce) pour laisser toute la place sonore et rythmique aux nuances de frappes du danseur.",
    appContext: "Bloc fondamental de l'espace 'Structure traditionnelle' et 'Mon atelier de création'.",
    relatedTerms: ['Zapateado', 'Subida', 'Cierre']
  },
  {
    id: 'subida',
    term: 'Subida',
    spanish: 'Subida (Montée)',
    category: 'danse',
    categoryLabel: 'Dynamique Rythmique',
    badgeColor: '#c53d2d',
    icon: '📈',
    shortDef: "Accélération progressive du tempo et de l'intensité sonore initiée par les pieds du danseur.",
    detailedDef: "Le danseur accélère pas à pas le battement de ses pieds pour entraîner la guitare et les palmas vers un tempo culminant, débouchant généralement sur un cierre retentissant ou une transition vers un palo plus rapide.",
    appContext: "Identifié par un marqueur temporel dans les vidéos de chorégraphie de l'application.",
    relatedTerms: ['Escobilla', 'Cierre', 'Palmas claras']
  },
  {
    id: 'silencio',
    term: 'Silencio',
    spanish: 'Silencio',
    category: 'danse',
    categoryLabel: 'Partie Lyrique',
    badgeColor: '#3b82f6',
    icon: '🌙',
    shortDef: "Passage lent, doux et mélancolique où le danseur met en valeur ses ports de bras et son expressivité.",
    detailedDef: "Caractéristique majeure des Alegrías (joué en mineur) ou moment de grâce poétique dans la Farruca. La percussion des pieds s'efface pour laisser s'épanouir la beauté des lignes corporelles et du regard.",
    appContext: "Section d'étude dédiée dans la Farruca (Danse) avec travail du braceo.",
    relatedTerms: ['Braceo', 'Floreao', 'Alegrías']
  },
  {
    id: 'braceo',
    term: 'Braceo & Floreao',
    spanish: 'Braceo y Floreo',
    category: 'danse',
    categoryLabel: 'Gestuelle du Haut du Corps',
    badgeColor: '#c53d2d',
    icon: '✨',
    shortDef: "L'art du port de bras sculpté et de l'ondulation fluide des poignets et des doigts.",
    detailedDef: "Le braceo exige des coudes soutenus et des lignes d'épaules abaissées. Le floreao (rotation des mains vers l'intérieur ou l'extérieur) insuffle grâce et sensualité au mouvement.",
    appContext: "Explicité dans les tutoriels techniques et les vidéos des cours de danse de l'application.",
    relatedTerms: ['Silencio', 'Marcaje']
  },
  {
    id: 'marcaje',
    term: 'Marcaje',
    spanish: 'Marcaje',
    category: 'danse',
    categoryLabel: 'Danse d\'Accompagnement',
    badgeColor: '#c53d2d',
    icon: '👣',
    shortDef: "Pas feutrés et mouvements ondulants du corps servant à marquer le compás pendant le couplet chanté.",
    detailedDef: "Lorsque le cantaor chante une letra, le danseur ne fait pas de bruit de pieds pour ne pas masquer la voix : il 'marque' le rythme avec élégance, se déplace sur scène et illustre l'émotion du texte.",
    appContext: "Section 'Letra' dans la structure de danse.",
    relatedTerms: ['Letra', 'Compás']
  },
  {
    id: 'cierre',
    term: 'Cierre',
    spanish: 'Cierre (Fermeture)',
    category: 'danse',
    categoryLabel: 'Structure & Clôture',
    badgeColor: '#c53d2d',
    icon: '🛑',
    shortDef: "Arrêt net et synchronisé de tous les artistes (danse, guitare, chant, palmas), marquant le silence absolu.",
    detailedDef: "Le cierre verrouille définitivement une section ou le morceau tout entier. La précision millimétrique de cet arrêt commun est l'une des sensations les plus fortes du spectacle flamenco.",
    appContext: "Repère final des blocs de montage dans l'application.",
    relatedTerms: ['Remate', 'Llamada']
  },

  // --- GUITARE & TOQUE ---
  {
    id: 'falseta',
    term: 'Falseta',
    spanish: 'Falseta',
    category: 'guitare',
    categoryLabel: 'Guitare Soliste',
    badgeColor: '#3b82f6',
    icon: '🎸',
    shortDef: "Variation mélodique soliste composée ou improvisée par le guitariste entre deux couplets de chant.",
    detailedDef: "C'est l'espace d'expression créative privilégié du guitariste flamenco. Une falseta met en œuvre diverses techniques (alzapúa, picado, arpèges, trémolo) tout en respectant scrupuleusement la métrique du palo.",
    appContext: "Présent dans tous les Palos de Guitare avec 3 niveaux de difficulté et tablatures/vidéos.",
    relatedTerms: ['Toque Por Arriba', 'Toque Por Medio', 'Picado']
  },
  {
    id: 'cejilla',
    term: 'Cejilla (Capodastre)',
    spanish: 'Cejilla',
    category: 'guitare',
    categoryLabel: 'Accessoire & Transposition',
    badgeColor: '#3b82f6',
    icon: '🎯',
    shortDef: "Capodastre traditionnel en bois à cheville, indispensable pour adapter la guitare à la voix du cantaor.",
    detailedDef: "Règle d'or du flamenco : le guitariste ne réapprend pas de nouveaux doigtés pour changer de tonalité. Il conserve les positions ouvertes fondamentales (por arriba ou por medio) et déplace sa cejilla case par case pour trouver la hauteur parfaite du chanteur.",
    appContext: "Onglet dédié 'Cejilla (Capodastre)' avec tableau interactif de correspondance des hauteurs vocales.",
    relatedTerms: ['Toque Por Arriba', 'Toque Por Medio']
  },
  {
    id: 'por-arriba',
    term: 'Toque Por Arriba',
    spanish: 'Toque por arriba',
    category: 'guitare',
    categoryLabel: 'Harmonie & Position',
    badgeColor: '#3b82f6',
    icon: '👆',
    shortDef: "Jeu flamenco basé sur la position ouverte de Mi (Mi phrygien / Cadence andalouse Mi-Fa-Sol-Fa-Mi).",
    detailedDef: "Position noble et sombre exploitant la corde grave de Mi à vide. Utilisée traditionnellement pour la Soleá, les Siguiriyas et certains Fandangos. Donne un son rond, terrien et profond.",
    appContext: "Indiqué dans les fiches harmoniques des palos (Soleá, Taranta, Fandangos).",
    relatedTerms: ['Toque Por Medio', 'Cejilla']
  },
  {
    id: 'por-medio',
    term: 'Toque Por Medio',
    spanish: 'Toque por medio',
    category: 'guitare',
    categoryLabel: 'Harmonie & Position',
    badgeColor: '#3b82f6',
    icon: '👉',
    shortDef: "Jeu flamenco basé sur la position ouverte de La (La phrygien / Cadence andalouse La-Sib-Do-Sib-La).",
    detailedDef: "Position médiane très expressive utilisant la basse de La. Idéale pour les Bulerías de Jerez, les Tangos et les Tientos grâce à sa brillance et son mordant rythmique.",
    appContext: "Indiqué dans les fiches de Tangos, Bulerías et Tientos.",
    relatedTerms: ['Toque Por Arriba', 'Cejilla']
  },
  {
    id: 'rasgueado',
    term: 'Rasgueado (Rasgueo)',
    spanish: 'Rasgueado / Rasgueo',
    category: 'guitare',
    categoryLabel: 'Technique Main Droite',
    badgeColor: '#3b82f6',
    icon: '🖐️',
    shortDef: "Déferlement percussif et rythmique des ongles sur les cordes, signature sonore de la guitare flamenca.",
    detailedDef: "Se joue en éventail de doigts (auriculaire, annulaire, majeur, index) ou en mouvements alternés du poignet. Il génère une nappe rythmique continue, puissante et incisive indispensable pour cadencer le chant et la danse.",
    appContext: "Détaillé dans l'onglet 'Techniques de main droite' avec conseils d'exécution.",
    relatedTerms: ['Golpe', 'Alzapúa']
  },
  {
    id: 'alzapua',
    term: 'Alzapúa',
    spanish: 'Alzapúa',
    category: 'guitare',
    categoryLabel: 'Technique Main Droite',
    badgeColor: '#3b82f6',
    icon: '👍',
    shortDef: "Technique virtuose de pouce en trois mouvements rapides : coup vers le bas, retour avec l'ongle vers le haut, et golpe.",
    detailedDef: "Typique du flamenco gitan (Bulerías, Soleá por Bulerías). Elle confère une attaque métallique, une vitesse spectaculaire et une dynamique rebondissante inégalée à la basse.",
    appContext: "Présent dans les falsetas de niveau 2 et 3 de Bulerías et Tangos.",
    relatedTerms: ['Golpe', 'Picado']
  },
  {
    id: 'picado',
    term: 'Picado',
    spanish: 'Picado',
    category: 'guitare',
    categoryLabel: 'Technique Main Droite',
    badgeColor: '#3b82f6',
    icon: '⚡',
    shortDef: "Jeu mélodique virtuose en buté rapide alternant index et majeur (ou index et annulaire).",
    detailedDef: "Le doigt attaque la corde avec puissance et vient se reposer sur la corde supérieure. Cette technique exige une coordination parfaite et permet d'atteindre des vitesses fulgurantes (comme chez Paco de Lucía).",
    appContext: "Étudié dans les solos et falsetas de concert de l'application.",
    relatedTerms: ['Falseta', 'Alzapúa']
  },
  {
    id: 'golpe',
    term: 'Golpe',
    spanish: 'Golpe',
    category: 'guitare',
    categoryLabel: 'Technique & Percussion',
    badgeColor: '#3b82f6',
    icon: '🪵',
    shortDef: "Frappe percussive de l'ongle (annulaire ou majeur) sur le golpeador de la guitare.",
    detailedDef: "Exécuté souvent simultanément avec une note du pouce ou de l'index pour marquer les temps forts du compás. Il confère à la guitare flamenca son double rôle d'instrument harmonique et de percussion.",
    appContext: "Présent dans les rythmes d'introduction et le jeu d'accompagnement de chaque palo.",
    relatedTerms: ['Rasgueado', 'Compás']
  },

  // --- CANTE & POÉSIE ---
  {
    id: 'letra',
    term: 'Letra (ou Copla)',
    spanish: 'Letra / Copla',
    category: 'cante',
    categoryLabel: 'Poésie & Chant',
    badgeColor: '#10b981',
    icon: '📜',
    shortDef: "Strophe poétique chantée par le cantaor, généralement formée de 3 à 4 vers octosyllabiques.",
    detailedDef: "Les letras abordent l'amour, la mort, le destin, la misère ou la fête. En danse, la letra est le moment où la gestuelle corporelle interprète et magnifie les vers chantés.",
    appContext: "Espace 'Letras & Textes' de chaque palo avec traduction bilingue espagnol/français et explications poétiques.",
    relatedTerms: ['Tercio', 'Salida', 'Cante Jondo']
  },
  {
    id: 'tercio',
    term: 'Tercio',
    spanish: 'Tercio',
    category: 'cante',
    categoryLabel: 'Structure Vocale',
    badgeColor: '#10b981',
    icon: '🎶',
    shortDef: "Chacune des lignes mélodiques ou versets composant une letra de cante.",
    detailedDef: "Le cantaor respire entre deux tercios. C'est à la fin d'un tercio que le guitariste place un court remate ou que le danseur effectue une respiration corporelle avant la reprise du chant.",
    appContext: "Analysé dans les transcriptions poétiques des letras de la Farruca.",
    relatedTerms: ['Letra', 'Remate']
  },
  {
    id: 'salida-temple',
    term: 'Salida / Temple',
    spanish: 'Salida / Temple',
    category: 'cante',
    categoryLabel: 'Entrée Vocale',
    badgeColor: '#10b981',
    icon: '🎙️',
    shortDef: "Échauffement vocal stylisé au début d'un cante (onomatopées '¡Ay!', 'Tirititrán', 'Lelili').",
    detailedDef: "Le chanteur prépare sa voix, se cale sur la tonalité de la guitare, installe le compás et plonge l'auditoire dans l'émotion du palo avant d'entamer les paroles de la première letra.",
    appContext: "Présent dans l'entrée des Alegrías ('Tirititrán') et de la Soleá.",
    relatedTerms: ['Letra', 'Cantaor']
  },
  {
    id: 'cante-jondo',
    term: 'Cante Jondo',
    spanish: 'Cante Jondo (profond)',
    category: 'cante',
    categoryLabel: 'Style Vocal Fondamental',
    badgeColor: '#ef4444',
    icon: '🖤',
    shortDef: "Le chant le plus profond, solennel et tragique du flamenco (Soleá, Siguiriya, Tonás).",
    detailedDef: "Caractérisé par des mélismes poignants, un timbre de voix voilé ou éraillé (voz afillá) et une intensité émotionnelle brute liée aux souffrances historiques du peuple andalou et gitan.",
    appContext: "Représenté dans l'Arborescence des Palos sous la branche mère de la Soleá et de la Seguiriya.",
    relatedTerms: ['Duende', 'Soleá']
  },

  // --- TABLAO & CULTURE ---
  {
    id: 'palo',
    term: 'Palo',
    spanish: 'Palo (Style musical)',
    category: 'general',
    categoryLabel: 'Classification Musicale',
    badgeColor: '#e5a93b',
    icon: '🌿',
    shortDef: "Chaque style, genre ou variété de chant, de guitare ou de danse au sein de l'univers flamenco.",
    detailedDef: "Il existe plus de 50 palos différents (Soleá, Bulerías, Tangos, Farruca, Alegrías, Guajiras, Fandangos...). Chaque palo se distingue par son compás, son humeur (grave ou festif), son origine géographique et sa cadence harmonique.",
    appContext: "La Médiathèque Flamenca organise toute sa structure autour de la sélection et l'étude des Palos.",
    relatedTerms: ['Compás', 'Arborescence']
  },
  {
    id: 'tablao',
    term: 'Tablao',
    spanish: 'Tablao',
    category: 'general',
    categoryLabel: 'Lieu de Spectacle',
    badgeColor: '#8b5cf6',
    icon: '🎭',
    shortDef: "Scène surélevée en planches de bois conçue spécialement pour la résonance du zapateado flamenco.",
    detailedDef: "Héritiers des cafés cantantes du XIXe siècle, les tablaos sont les temples du flamenco en direct (Séville, Madrid, Grenade, Cadix). Les artistes s'y produisent dans une grande proximité avec le public, laissant une large part à l'improvisation.",
    appContext: "Cadre de référence scénique pour les études de montages de danse.",
    relatedTerms: ['Cuadro flamenco', 'Duende']
  },
  {
    id: 'duende',
    term: 'Duende',
    spanish: 'Duende',
    category: 'general',
    categoryLabel: 'Mystique & Émotion',
    badgeColor: '#ec4899',
    icon: '🔥',
    shortDef: "L'état de grâce, d'inspiration indicible et de transe émotionnelle ressentie par l'artiste et le spectateur.",
    detailedDef: "Théorisé notamment par le poète Federico García Lorca. Le duende ne s'apprend pas dans les conservatoires : c'est un feu intérieur mystérieux qui jaillit quand l'artiste se met à nu, transformant une exécution technique en moment magique inoubliable.",
    appContext: "Évoqué dans les commentaires artistiques et l'histoire des Grands Maîtres.",
    relatedTerms: ['Cante Jondo', 'Jaleo']
  },
  {
    id: 'jaleo',
    term: 'Jaleo',
    spanish: 'Jaleo (Encouragements)',
    category: 'general',
    categoryLabel: 'Tradition Scénique',
    badgeColor: '#8b5cf6',
    icon: '🗣️',
    shortDef: "Cris d'encouragement spontanés et chaleureux ('¡Olé!', '¡Eso es!', '¡Agua!', '¡Guapo!') lancés aux artistes.",
    detailedDef: "En flamenco, le public et les membres du cuadro ne sont pas passifs. Les jaleos, lancés à bon escient sur les temps forts ou après un trait virtuose, galvanisent les musiciens et les danseurs pour les pousser au dépassement de soi.",
    appContext: "Présent dans les pistes audio et vidéos d'accompagnement de la médiathèque.",
    relatedTerms: ['Pitos', 'Palmas claras']
  },
  {
    id: 'cuadro-flamenco',
    term: 'Cuadro flamenco',
    spanish: 'Cuadro flamenco',
    category: 'general',
    categoryLabel: 'Formation Scénique',
    badgeColor: '#8b5cf6',
    icon: '👥',
    shortDef: "La troupe complète réunie sur scène : danseur(s), guitariste(s), chanteur(s) et palmeros.",
    detailedDef: "Disposés en demi-cercle sur des chaises traditionnelles, ils interagissent en permanence par le regard et l'écoute mutuelle, se relayant pour accompagner chaque moment du spectacle.",
    appContext: "Organisation illustrée dans les montages chorégraphiques et les vidéos de groupe.",
    relatedTerms: ['Tablao', 'Jaleo']
  },
  {
    id: 'pitos',
    term: 'Pitos',
    spanish: 'Pitos (Claquements de doigts)',
    category: 'general',
    categoryLabel: 'Percussion Corporelle',
    badgeColor: '#8b5cf6',
    icon: '👌',
    shortDef: "Claquements de doigts rythmiques percutants utilisés pour poser le compás avec légèreté.",
    detailedDef: "Souvent utilisés par les danseurs avant d'entrer en scène, ou par les chanteurs pour donner le tempo initial sans écraser la guitare.",
    appContext: "Utilisé dans les introductions de Tangos et de Bulerías.",
    relatedTerms: ['Palmas sordas', 'Compás']
  }
];
