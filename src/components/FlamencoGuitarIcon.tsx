import React from 'react';
import guitarTiltedImg from '../assets/images/guitare_flamenca_penchee.jpg';

interface FlamencoGuitarIconProps {
  className?: string;
  size?: number | string;
  variant?: 'vector' | 'image' | 'color' | 'monochrome';
}

/**
 * Icône authentique de Guitare Flamenca (Guitarra Flamenca / Española)
 * Inclinée dynamiquement vers la droite (~38°) pour une visibilité et lisibilité
 * maximales même de loin ou en petit format (16px-24px).
 *
 * Caractéristiques flamenco visibles :
 * - Corps incliné aux chaudes teintes miel/ambre (cyprès et épicéa)
 * - Rosace andalouse rouge et or bien visible
 * - Plaque de frappe (Golpeador) blanche/translucide caractéristique du flamenco
 * - Tête classique ajourée avec mécaniques blanches orientée vers le haut-droit
 */
export const FlamencoGuitarIcon: React.FC<FlamencoGuitarIconProps> = ({
  className = 'w-4 h-4 inline-block shrink-0',
  size,
  variant = 'vector'
}) => {
  const style = size ? { width: size, height: size } : undefined;

  // Option photo réaliste de la guitare penchée vers la droite
  if (variant === 'image') {
    return (
      <img
        src={guitarTiltedImg}
        alt="Guitare flamenca"
        className={`inline-block object-cover rounded-md border border-[#e5a93b]/50 shadow-sm ${className}`}
        style={style}
      />
    );
  }

  // Version monochrome au trait
  if (variant === 'monochrome') {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        aria-label="Guitare flamenca"
      >
        <g transform="rotate(38 16 16)">
          {/* Tête */}
          <rect x="14" y="1" width="4" height="5" rx="1" />
          <line x1="12.5" y1="2.5" x2="14" y2="2.5" />
          <line x1="12.5" y1="4.5" x2="14" y2="4.5" />
          <line x1="18" y1="2.5" x2="19.5" y2="2.5" />
          <line x1="18" y1="4.5" x2="19.5" y2="4.5" />
          {/* Manche */}
          <line x1="14.8" y1="6" x2="14.8" y2="13" />
          <line x1="17.2" y1="6" x2="17.2" y2="13" />
          {/* Corps espagnol */}
          <path d="M13 13.5 C9.5 14 7.5 16 7.5 18.5 C7.5 20.2 8.5 21.2 9.8 22 C8.2 23.5 7 25.5 7 28 C7 31 11 32 16 32 C21 32 25 31 25 28 C25 25.5 23.8 23.5 22.2 22 C23.5 21.2 24.5 20.2 24.5 18.5 C24.5 16 22.5 14 19 13.5 Z" />
          <circle cx="16" cy="19.5" r="2.2" />
          <line x1="13.5" y1="27" x2="18.5" y2="27" />
        </g>
      </svg>
    );
  }

  // Version vectorielle couleur penchée vers la droite :
  // Silhouette généreuse, teintes vives et chaleureuses, lisibilité maximale de loin
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Guitare flamenca"
    >
      <defs>
        {/* Teinte bois de cyprès / épicéa doré très éclatant pour ressortir de loin */}
        <radialGradient id="flamencoWoodTilted" cx="45%" cy="65%" r="65%">
          <stop offset="0%" stopColor="#fed777" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="85%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>

        {/* Touche sombre palissandre avec bord contrasté */}
        <linearGradient id="fretboardGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3c1e08" />
          <stop offset="50%" stopColor="#1f0f04" />
          <stop offset="100%" stopColor="#3c1e08" />
        </linearGradient>

        {/* Ombre portée chaude pour détacher la guitare du fond */}
        <filter id="flamencoGlow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0.5" dy="1.2" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.65" />
        </filter>
      </defs>

      {/* Groupe entier tourné de 38° vers la droite (tête vers le haut-droit, corps en bas-gauche) */}
      <g filter="url(#flamencoGlow)" transform="rotate(38 16 16)">
        {/* 1. Tête ajourée classique espagnole (Pala) */}
        <path
          d="M13.6 1.2 C13.6 0.8 14 0.5 14.5 0.5 L17.5 0.5 C18 0.5 18.4 0.8 18.4 1.2 L18.4 6.2 L13.6 6.2 Z"
          fill="url(#fretboardGrad)"
          stroke="#1c0c03"
          strokeWidth="0.6"
        />
        {/* Ouïes ajourées de la tête */}
        <rect x="14.5" y="1.5" width="0.9" height="3.6" rx="0.3" fill="#140802" />
        <rect x="16.6" y="1.5" width="0.9" height="3.6" rx="0.3" fill="#140802" />

        {/* Mécaniques blanches bien nettes et contrastées (Clavijas) */}
        <circle cx="12.6" cy="2.2" r="0.85" fill="#ffffff" stroke="#92400e" strokeWidth="0.35" />
        <circle cx="12.6" cy="4.2" r="0.85" fill="#ffffff" stroke="#92400e" strokeWidth="0.35" />
        <circle cx="19.4" cy="2.2" r="0.85" fill="#ffffff" stroke="#92400e" strokeWidth="0.35" />
        <circle cx="19.4" cy="4.2" r="0.85" fill="#ffffff" stroke="#92400e" strokeWidth="0.35" />

        {/* Sillet de tête blanc éclatant (Hueso) */}
        <rect x="13.6" y="6" width="4.8" height="0.8" rx="0.2" fill="#ffffff" stroke="#92400e" strokeWidth="0.2" />

        {/* 2. Manche et touche (Diapasón) */}
        <rect x="14" y="6.8" width="4" height="6.6" fill="url(#fretboardGrad)" stroke="#1c0c03" strokeWidth="0.5" />
        {/* Frettes dorées bien visibles */}
        <line x1="14" y1="8.4" x2="18" y2="8.4" stroke="#fde047" strokeWidth="0.5" />
        <line x1="14" y1="10.2" x2="18" y2="10.2" stroke="#fde047" strokeWidth="0.5" />
        <line x1="14" y1="12" x2="18" y2="12" stroke="#fde047" strokeWidth="0.5" />

        {/* 3. Corps Espagnol Flamenco (Caja de resonancia) - Courbes généreuses & bien visibles */}
        <path
          d="M12.8 13.4
             C9.6 13.9 7 16 7 18.6
             C7 20.6 8.2 21.7 9.6 22.4
             C7.8 23.8 6.4 26 6.4 28.5
             C6.4 31.6 10.5 33 16 33
             C21.5 33 25.6 31.6 25.6 28.5
             C25.6 26 24.2 23.8 22.4 22.4
             C23.8 21.7 25 20.6 25 18.6
             C25 16 22.4 13.9 19.2 13.4
             Z"
          fill="url(#flamencoWoodTilted)"
          stroke="#451a03"
          strokeWidth="0.9"
        />

        {/* Filet décoratif extérieur (Perfil) */}
        <path
          d="M13 14.1
             C10.2 14.6 8 16.3 8 18.6
             C8 20.3 9.1 21.3 10.3 21.9
             C8.7 23.2 7.5 25.2 7.5 28.3
             C7.5 30.8 11.2 32.1 16 32.1
             C20.8 32.1 24.5 30.8 24.5 28.3
             C24.5 25.2 23.3 23.2 21.7 21.9
             C22.9 21.3 24 20.3 24 18.6
             C24 16.3 21.8 14.6 19 14.1"
          stroke="#271004"
          strokeWidth="0.4"
          fill="none"
          opacity="0.75"
        />

        {/* Golpeador Flamenco blanc/translucide - Signature flamenco indéniable et lumineuse */}
        <path
          d="M16 16.2 L21.5 16.6 C22.4 18.5 22.2 21.5 20.2 23.8 L16 23.2 Z"
          fill="#ffffff"
          fillOpacity="0.4"
          stroke="#ffffff"
          strokeWidth="0.4"
          strokeOpacity="0.7"
        />

        {/* 4. Rosace flamenca vive (Rouge rubis & anneau or) */}
        <circle cx="16" cy="19.4" r="3.2" stroke="#991b1b" strokeWidth="0.8" fill="#7f1d1d" fillOpacity="0.35" />
        <circle cx="16" cy="19.4" r="2.4" stroke="#fbbf24" strokeWidth="0.5" />
        {/* Bouche sombre profonde (Boca) */}
        <circle cx="16" cy="19.4" r="1.7" fill="#0f0703" stroke="#451a03" strokeWidth="0.4" />

        {/* 5. Chevalet flamenco (Puente clásico) */}
        <rect x="12.8" y="27.4" width="6.4" height="1.6" rx="0.3" fill="#2d1607" stroke="#160b03" strokeWidth="0.4" />
        {/* Sillet de chevalet blanc éclatant (Hueso de puente) */}
        <rect x="14.2" y="27.7" width="3.6" height="0.5" rx="0.1" fill="#ffffff" />

        {/* 6 Cordes nylon avec éclat clair */}
        <line x1="14.6" y1="6.8" x2="14.6" y2="27.7" stroke="#ffffff" strokeWidth="0.32" opacity="0.95" />
        <line x1="15.1" y1="6.8" x2="15.1" y2="27.7" stroke="#ffffff" strokeWidth="0.32" opacity="0.95" />
        <line x1="15.7" y1="6.8" x2="15.7" y2="27.7" stroke="#ffffff" strokeWidth="0.32" opacity="0.95" />
        <line x1="16.3" y1="6.8" x2="16.3" y2="27.7" stroke="#ffffff" strokeWidth="0.32" opacity="0.95" />
        <line x1="16.9" y1="6.8" x2="16.9" y2="27.7" stroke="#ffffff" strokeWidth="0.32" opacity="0.95" />
        <line x1="17.4" y1="6.8" x2="17.4" y2="27.7" stroke="#ffffff" strokeWidth="0.32" opacity="0.95" />
      </g>
    </svg>
  );
};

export default FlamencoGuitarIcon;
