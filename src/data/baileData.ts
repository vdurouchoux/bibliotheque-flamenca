import { DansePaloData } from '../types';
import { FARRUCA_BAILE } from './baile/farrucaBaile';

export const BAILE_PALOS_DATA: Record<string, DansePaloData> = {
  "Farruca": FARRUCA_BAILE
};

export interface DansePaloPreview {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  compasSummary: string;
  isAvailable: boolean;
  highlights: string[];
}

export const BAILE_PALOS_CATALOG: DansePaloPreview[] = [
  {
    id: "Farruca",
    name: "Farruca",
    subtitle: "Atelier de création",
    tag: "4 temps binaire (La mineur)",
    compasSummary: "4 temps • 84 à 165 BPM",
    isAvailable: true,
    highlights: [
      "Structure traditionnelle",
      "Grands Maîtres",
      "Letras & Textes",
      "Compás",
      "Cours & Stages",
      "Mon atelier de création"
    ]
  },
  {
    id: "Alegrias-baile",
    name: "Alegrías (Baile)",
    subtitle: "Danse de fête & Silencio en Do mineur",
    tag: "12 temps festif",
    compasSummary: "12 temps • 120-140 BPM",
    isAvailable: false,
    highlights: ["Silencio & Castellana", "Bata de cola & Mantón", "Escobilla & Bulerías"]
  },
  {
    id: "Solea-baile",
    name: "Soleá (Baile)",
    subtitle: "La Mère de la danse flamenca solennelle",
    tag: "12 temps profond",
    compasSummary: "12 temps • 80-105 BPM",
    isAvailable: false,
    highlights: ["Paseos majestueux", "Llamada por Solea", "Escobilla & Bulería final"]
  },
  {
    id: "Seguiriya-baile",
    name: "Seguiriya (Baile)",
    subtitle: "Tragédie & tension dramatique",
    tag: "12 temps asymétrique",
    compasSummary: "12 temps • 70-85 BPM",
    isAvailable: false,
    highlights: ["Pieds sombres & martelés", "Cierre tragique", "Bastón"]
  },
  {
    id: "Bulerias-baile",
    name: "Bulerías (Baile)",
    subtitle: "Virtuosité, fête & soniquete festif",
    tag: "12 temps rapide",
    compasSummary: "12 temps • 180-220 BPM",
    isAvailable: false,
    highlights: ["Patada por Bulerías", "Desplantes de fête", "Remates jerezanos"]
  }
];
