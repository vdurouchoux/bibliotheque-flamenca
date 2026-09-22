import treeMockupImage from '../assets/images/tree_ui_mockup_1789973540231.jpg';

export interface PaloFamily {
  id: string;
  name: string;
  badge: string;
  color: string;
  compasType: string;
  description: string;
  palos: string[];
}

export interface ArborescenceConfig {
  title: string;
  subtitle: string;
  description: string;
  /**
   * Chemin direct importé (traité par Vite en bundle de production, résout à 100% sur PC et mobile)
   */
  imageUrl: string;
  /**
   * Chemin public web direct servi par le serveur web (compatible PC, mobile, serveurs Nginx/Cloud Run)
   */
  publicWebPath: string;
  /**
   * Chemin alternatif à la racine du serveur web public
   */
  rootWebPath: string;
  /**
   * Familles fondamentales de l'arborescence flamenca
   */
  families: PaloFamily[];
}

export const ARBORESCENCE_DATA: ArborescenceConfig = {
  title: "Arborescence des Palos Flamencos",
  subtitle: "Arbre généalogique, filiations et classification des styles",
  description: "Schéma généalogique complet retraçant la filiation des styles flamencos (palos) depuis les racines primitives sans guitare (Cantes a palo seco / Tonás) jusqu'aux métissages d'Ida y Vuelta et aux grandes formes festives et solennelles contemporaines.",
  imageUrl: treeMockupImage,
  publicWebPath: "/assets/images/tree_ui_mockup_1789973540231.jpg",
  rootWebPath: "/tree_ui_mockup_1789973540231.jpg",
  families: [
    {
      id: "tonas",
      name: "Cantes Primitifs (A Palo Seco)",
      badge: "Racines sans guitare",
      color: "#ef4444",
      compasType: "Libre / Non mesuré",
      description: "Les chants ancestraux les plus dépouillés, interprétés à voix nue, scandés au marteau sur l'enclume ou à la canne.",
      palos: ["Tonás", "Martinetes", "Debla", "Carceleras", "Saetas"]
    },
    {
      id: "solea",
      name: "Tronc de la Soleá",
      badge: "Mère du Cante Jondo",
      color: "#e5a93b",
      compasType: "12 temps solennel",
      description: "La colonne vertébrale du compás à 12 temps. Tonalité phrygienne (por arriba), profondeur dramatique et noblesse du toque.",
      palos: ["Soleá", "Soleá por Bulerías", "Bulerías", "Caña", "Polo", "Bamberas"]
    },
    {
      id: "cantinas",
      name: "Famille des Cantiñas & Alegrías",
      badge: "Cadix & la Baie",
      color: "#f59e0b",
      compasType: "12 temps majeur festif",
      description: "Styles solaires et marins au compás de 12 temps, traditionnellement joués en tonalité majeure (Do majeur por arriba).",
      palos: ["Alegrías de Cádiz", "Mirabrás", "Caracoles", "Romeras", "Cantiñas de Pinini", "Alegrías de Córdoba"]
    },
    {
      id: "tangos",
      name: "Famille des Tangos & Rythmes 4 Temps",
      badge: "Cadence binaire & danse",
      color: "#3b82f6",
      compasType: "4 temps binaire",
      description: "Rythmes dansants et terriens à 4 temps, d'influences afro-andalouses et gitanes (Triana, Séville, Grenade, Estrémadure).",
      palos: ["Tangos (Triana, Jerez, Grenade)", "Tientos", "Farruca", "Rumba", "Garrotín", "Mariana"]
    },
    {
      id: "fandangos",
      name: "Famille des Fandangos & Cantes de Levante",
      badge: "Andalousie & Mines",
      color: "#10b981",
      compasType: "Ternaire 3 temps & Toque Libre",
      description: "Vaste groupe issu du folklore andalou (Fandangos) et des chants miniers de la région de Murcie et Almería.",
      palos: ["Fandangos de Huelva", "Malagueñas", "Granadinas", "Taranta", "Taranto", "Minera", "Cartagenera", "Verdiales"]
    },
    {
      id: "ida-vuelta",
      name: "Cantes de Ida y Vuelta",
      badge: "Hispano-américain",
      color: "#8b5cf6",
      compasType: "Rythmes syncopés caribéens",
      description: "Chants nés des échanges maritimes entre l'Andalousie et les Amériques (Cuba, Colombie, Argentine) réappropriés par le flamenco.",
      palos: ["Guajiras", "Colombianas", "Milonga flamenca", "Vidalita"]
    },
    {
      id: "seguiriya",
      name: "Famille de la Seguiriya",
      badge: "Tragédie pure",
      color: "#991b1b",
      compasType: "12 temps asymétrique",
      description: "Le sommet du sentiment tragique flamenco (duende). Compás inversé et asymétrique (accents sur 3, 6, 8, 10, 12 alternant mesures courtes et longues).",
      palos: ["Seguiriya", "Serrana", "Liviana", "Cabales"]
    }
  ]
};
