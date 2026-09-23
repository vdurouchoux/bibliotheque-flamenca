import React from 'react';
import cantaorImg from '../assets/images/cantaor_flamenco.jpg';

interface FlamencoCantaorIconProps {
  className?: string;
  size?: number | string;
  variant?: 'image' | 'vector' | 'monochrome';
}

/**
 * Icône / Image authentique d'un Chanteur Flamenco (Cantaor Flamenco)
 * Remplacement authentique de l'émoji microphone standard (🎤).
 * Représente un véritable cantaor en plein chant jondo :
 * - Chanteur espagnol passionné avec le duende
 * - Tête levée, bouche ouverte chantant la letra
 * - Geste expressif de la main et gilet traditionnel
 */
export const FlamencoCantaorIcon: React.FC<FlamencoCantaorIconProps> = ({
  className = 'w-4 h-4 inline-block shrink-0',
  size,
  variant = 'image'
}) => {
  const style = size ? { width: size, height: size } : undefined;

  // Option par défaut : véritable image studio du chanteur flamenco
  if (variant === 'image') {
    return (
      <img
        src={cantaorImg}
        alt="Chanteur flamenco (Cantaor)"
        className={`inline-block object-cover object-top rounded-full border border-[#e5a93b]/70 shadow-xs ring-1 ring-[#e5a93b]/20 ${className}`}
        style={style}
      />
    );
  }

  // Version vectorielle stylisée avec profil expressif et geste flamenco
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Chanteur flamenco (Cantaor)"
    >
      <defs>
        <radialGradient id="cantaorGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <filter id="cantaorShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.6" />
        </filter>
      </defs>

      <g filter="url(#cantaorShadow)">
        {/* Halo scénique chaud */}
        <circle cx="16" cy="16" r="14.5" fill="#1b140e" stroke="#e5a93b" strokeWidth="0.8" strokeOpacity="0.4" />

        {/* Buste & gilet noir traditionnel */}
        <path
          d="M7 29 C7 25 10 22 13 21 L16 23 L19 21 C22 22 25 25 25 29 Z"
          fill="#0c0906"
          stroke="#451a03"
          strokeWidth="0.5"
        />

        {/* Chemise blanche ouverte */}
        <path d="M13 21 L16 25 L19 21 L16 19 Z" fill="#fffef8" />

        {/* Cou tendu vers l'arrière en plein chant */}
        <path d="M14 14.5 L14 19 L18 19 L18 14.5 Z" fill="#d49567" />

        {/* Tête de profil / trois-quarts inclinée vers le haut (Duende du cante) */}
        <path
          d="M13 8.5
             C13 5.5 15.5 4 18 4.5
             C20.5 5 21.5 7.5 21 10.5
             C20.8 11.5 20.2 12.5 19.5 13
             C19 13.5 18 14.5 16.5 14.5
             C14.5 14.5 13 12 13 8.5 Z"
          fill="#d49567"
        />

        {/* Chevelure andalouse brune foncée */}
        <path
          d="M13 8 C12.8 5.2 14.5 3.8 17.5 4 C19.5 4.2 20.8 5.2 21 6.8 C19.8 6.5 18.5 6.8 17.8 7.5 C16.5 7.2 15 7.5 13 8 Z"
          fill="#1c120c"
        />

        {/* Bouche ouverte chantant la letra (expression dramatique du cante) */}
        <path d="M18.8 11.2 C19.8 11.8 19.8 13.2 18.5 13 C18.2 12.2 18.2 11.5 18.8 11.2 Z" fill="#581c15" />
        {/* Dents visibles */}
        <line x1="18.6" y1="11.6" x2="19.2" y2="11.8" stroke="#ffffff" strokeWidth="0.4" />

        {/* Main levée avec geste flamenco expressif (doigts arrondis/ouverts) */}
        <path
          d="M24 16
             C25 15 26.5 15.2 27 16.2
             C27.5 17.2 26.8 18.5 25.5 19
             C24.8 19.2 23.5 18.2 24 16 Z"
          fill="#d49567"
        />
        {/* Doigts expressifs */}
        <path d="M25.5 15.2 C26.2 14.2 27.2 14.6 27.2 15.6" stroke="#d49567" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M26.5 16.2 C27.5 15.8 28.2 16.5 27.8 17.4" stroke="#d49567" strokeWidth="0.6" strokeLinecap="round" />

        {/* Onde sonore dorée symbolisant le chant / voix flamenco */}
        <path
          d="M21 9 C22.5 8 24 9.5 23.8 11.5"
          stroke="#f59e0b"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <path
          d="M22.5 7.5 C24.8 6.5 26.8 8.5 26.2 12"
          stroke="#f59e0b"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
      </g>
    </svg>
  );
};

export default FlamencoCantaorIcon;
