import { DansePaloData } from '../types';
import { DansePaloPreview } from './baileData';
import { FARRUCA_GUITARE } from './guitare/farrucaGuitare';

export const GUITARE_PALOS_DATA: Record<string, DansePaloData> = {
  "Farruca": FARRUCA_GUITARE
};

export const GUITARE_PALOS_CATALOG: DansePaloPreview[] = [
  {
    id: "Farruca",
    name: "Farruca",
    subtitle: "Atelier de création & Toque",
    tag: "4 temps binaire",
    compasSummary: "4 temps binaire",
    isAvailable: true,
    highlights: [
      "Structure traditionnelle",
      "Grands Maîtres",
      "Letras & Falsetas",
      "Compás",
      "Cours & Stages",
      "Mon atelier de création"
    ]
  },
  {
    id: "Alegrias-guitare",
    name: "Alegrías (Guitare)",
    subtitle: "Toque festif & Silencio en Do mineur",
    tag: "12 temps festif",
    compasSummary: "12 temps festif",
    isAvailable: false,
    highlights: ["Silencio & Castellana", "Falsetas traditionnelles", "Escobilla & Bulerías"]
  },
  {
    id: "Solea-guitare",
    name: "Soleá (Guitare)",
    subtitle: "La Mère du toque flamenco solennel",
    tag: "12 temps profond",
    compasSummary: "12 temps profond",
    isAvailable: false,
    highlights: ["Paseos & Falsetas", "Llamadas por Solea", "Cierre & Bulería final"]
  },
  {
    id: "Seguiriya-guitare",
    name: "Seguiriya (Guitare)",
    subtitle: "Tragédie & tension dramatique",
    tag: "12 temps asymétrique",
    compasSummary: "12 temps asymétrique",
    isAvailable: false,
    highlights: ["Accords sombres & martelés", "Cierre tragique", "Falsetas anciennes"]
  },
  {
    id: "Bulerias-guitare",
    name: "Bulerías (Guitare)",
    subtitle: "Virtuosité, rythme & soniquete jerezano",
    tag: "12 temps rapide",
    compasSummary: "12 temps rapide",
    isAvailable: false,
    highlights: ["Falsetas por Bulerías", "Remates de fête", "Compás jerezano"]
  }
];
