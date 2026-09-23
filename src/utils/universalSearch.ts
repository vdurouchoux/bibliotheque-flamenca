import { BAILE_PALOS_CATALOG, BAILE_PALOS_DATA } from '../data/baileData';
import { PALOS_DATA } from '../data/flamencoData';
import { FLAMENCO_LEXIQUE, LexiqueTerm } from '../data/flamencoLexiqueData';
import { VideoItem, DanseSectionTab, SectionTab, DisciplineMode } from '../types';

export interface UniversalSearchItem {
  id: string;
  type: 'video' | 'palo' | 'letra' | 'lexique';
  title: string;
  subtitle?: string;
  description?: string;
  paloKey?: string;
  paloName?: string;
  discipline: DisciplineMode | 'general';
  sectionName?: string;
  danseTab?: DanseSectionTab;
  guitarTab?: SectionTab;
  video?: VideoItem;
  lexiqueTerm?: LexiqueTerm;
}

/**
 * Construit l'index universel complet de tous les éléments du catalogue flamenco
 */
export function buildUniversalIndex(): UniversalSearchItem[] {
  const items: UniversalSearchItem[] = [];

  // --- A. Modules & Palos de Danse (Baile) ---
  BAILE_PALOS_CATALOG.forEach(palo => {
    items.push({
      id: `danse-palo-${palo.id}`,
      type: 'palo',
      title: palo.name,
      subtitle: `${palo.tag} • ${palo.compasSummary}`,
      description: palo.highlights.join(' • '),
      paloKey: palo.id,
      paloName: palo.name,
      discipline: 'danse',
      sectionName: 'Dossier Danse'
    });
  });

  // Vidéos & contenus Danse
  Object.entries(BAILE_PALOS_DATA).forEach(([paloKey, palo]) => {
    // 1. Maîtres de la danse
    palo.maitres?.forEach(v => {
      items.push({
        id: `danse-maitre-${v.id}`,
        type: 'video',
        title: v.title,
        subtitle: `Niveau ${v.level}`,
        description: v.description,
        paloKey,
        paloName: palo.name,
        discipline: 'danse',
        sectionName: 'Maîtres de la danse',
        danseTab: 'maitres',
        video: v
      });
    });

    // 2. Marcajes & Pieds
    if (palo.marcajes) {
      Object.values(palo.marcajes).forEach(list => {
        list?.forEach(v => {
          items.push({
            id: `danse-marcaje-${v.id}`,
            type: 'video',
            title: v.title,
            subtitle: `Niveau ${v.level}`,
            description: v.description,
            paloKey,
            paloName: palo.name,
            discipline: 'danse',
            sectionName: 'Marcajes & Pieds',
            danseTab: 'structure',
            video: v
          });
        });
      });
    }

    // 3. Zapateado & Escobilla
    if (palo.zapateado) {
      Object.values(palo.zapateado).forEach(list => {
        list?.forEach(v => {
          items.push({
            id: `danse-zapateado-${v.id}`,
            type: 'video',
            title: v.title,
            subtitle: `Niveau ${v.level}`,
            description: v.description,
            paloKey,
            paloName: palo.name,
            discipline: 'danse',
            sectionName: 'Zapateado & Escobilla',
            danseTab: 'structure',
            video: v
          });
        });
      });
    }

    // 4. Llamadas & Remates
    if (palo.llamadas) {
      Object.values(palo.llamadas).forEach(list => {
        list?.forEach(v => {
          items.push({
            id: `danse-llamada-${v.id}`,
            type: 'video',
            title: v.title,
            subtitle: `Niveau ${v.level}`,
            description: v.description,
            paloKey,
            paloName: palo.name,
            discipline: 'danse',
            sectionName: 'Llamadas & Remates',
            danseTab: 'structure',
            video: v
          });
        });
      });
    }

    // 5. Letras & Poésie
    palo.letras?.forEach(l => {
      items.push({
        id: `danse-letra-${l.id}`,
        type: 'letra',
        title: l.title,
        subtitle: l.coplaText?.slice(0, 2).join(' / '),
        description: `${l.cantaorReference ? `Chant : ${l.cantaorReference}` : ''}${l.contextAndMeaning ? ` • ${l.contextAndMeaning}` : ''}`,
        paloKey,
        paloName: palo.name,
        discipline: 'danse',
        sectionName: 'Letras & Chant',
        danseTab: 'letras',
        video: l.video
      });
    });
  });

  // --- B. Palos & Vidéos de Guitare Flamenca (Toque) ---
  Object.entries(PALOS_DATA).forEach(([paloKey, palo]) => {
    // Dossier Palo Guitare
    items.push({
      id: `guitare-palo-${paloKey}`,
      type: 'palo',
      title: palo.name,
      subtitle: `${palo.tag} • ${palo.subtitle || 'Guitare'}`,
      description: palo.character,
      paloKey,
      paloName: palo.name,
      discipline: 'guitare',
      sectionName: 'Dossier Guitare'
    });

    // 1. Intro & Compás
    palo.intro?.videos?.forEach(v => {
      items.push({
        id: `guitare-intro-${v.id}`,
        type: 'video',
        title: v.title,
        subtitle: `Niveau ${v.level}`,
        description: v.description,
        paloKey,
        paloName: palo.name,
        discipline: 'guitare',
        sectionName: 'Compás & Intro',
        guitarTab: 'intro',
        video: v
      });
    });

    // 2. Falsetas
    if (palo.falsetas) {
      Object.entries(palo.falsetas).forEach(([lvl, list]) => {
        list?.forEach(f => {
          items.push({
            id: `guitare-falseta-${f.id}`,
            type: 'video',
            title: f.title,
            subtitle: `Niveau ${lvl}`,
            description: f.description,
            paloKey,
            paloName: palo.name,
            discipline: 'guitare',
            sectionName: 'Falseta',
            guitarTab: 'falsetas',
            video: f
          });
        });
      });
    }

    // 3. Accompagnement Cante
    if (palo.cante) {
      Object.entries(palo.cante).forEach(([lvl, list]) => {
        list?.forEach(c => {
          items.push({
            id: `guitare-cante-${c.id}`,
            type: 'video',
            title: c.title,
            subtitle: `Niveau ${lvl}`,
            description: c.description,
            paloKey,
            paloName: palo.name,
            discipline: 'guitare',
            sectionName: 'Accompagnement Chant',
            guitarTab: 'cante',
            video: c
          });
        });
      });
    }

    // 4. Accompagnement Baile (côté guitare)
    if (palo.baile) {
      palo.baile.structureVideos?.forEach(b => {
        items.push({
          id: `guitare-baile-struct-${b.id}`,
          type: 'video',
          title: b.title,
          subtitle: `Niveau ${b.level}`,
          description: b.description,
          paloKey,
          paloName: palo.name,
          discipline: 'guitare',
          sectionName: 'Structure Baile (Guitare)',
          guitarTab: 'baile',
          video: b
        });
      });
      if (palo.baile.videos) {
        Object.entries(palo.baile.videos).forEach(([lvl, list]) => {
          list?.forEach(b => {
            items.push({
              id: `guitare-baile-${b.id}`,
              type: 'video',
              title: b.title,
              subtitle: `Niveau ${lvl}`,
              description: b.description,
              paloKey,
              paloName: palo.name,
              discipline: 'guitare',
              sectionName: 'Accompagnement Baile (Guitare)',
              guitarTab: 'baile',
              video: b
            });
          });
        });
      }
    }
  });

  // --- C. Lexique Flamenco ---
  FLAMENCO_LEXIQUE.forEach(term => {
    items.push({
      id: `lexique-${term.id}`,
      type: 'lexique',
      title: term.term,
      subtitle: `${term.categoryLabel} • ${term.spanish}`,
      description: term.shortDef,
      discipline: term.category === 'danse' ? 'danse' : term.category === 'guitare' ? 'guitare' : 'general',
      sectionName: 'Lexique Flamenco',
      lexiqueTerm: term
    });
  });

  return items;
}

/**
 * Fonction de recherche filtrée insensible aux accents et à la casse
 */
export function searchUniversalItems(
  items: UniversalSearchItem[],
  query: string
): UniversalSearchItem[] {
  const clean = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (!clean) return [];

  return items.filter(item => {
    const matchTitle = item.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(clean);
    const matchDesc = item.description?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(clean);
    const matchSub = item.subtitle?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(clean);
    const matchPalo = item.paloName?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(clean);
    const matchSec = item.sectionName?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(clean);

    return matchTitle || matchDesc || matchSub || matchPalo || matchSec;
  });
}
