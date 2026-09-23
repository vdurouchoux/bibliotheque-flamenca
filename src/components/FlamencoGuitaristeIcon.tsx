import React from 'react';
import guitaristeImg from '../assets/images/guitariste_flamenco.jpg';

interface FlamencoGuitaristeIconProps {
  className?: string;
  size?: number | string;
  variant?: 'image' | 'vector';
}

/**
 * Icône / Image authentique d'un vrai Guitariste Flamenco (Tocaor Flamenco)
 * Remplacement de l'icône/émoji par la photo d'un véritable artiste jouant sa guitare flamenca :
 * - Guitariste espagnol passionné en habit traditionnel (gilet noir, chemise blanche)
 * - Guitare flamenca en bois doré avec jeu de main droite (rasgueado / alzapúa)
 * - Éclairage scénique chaud avec liséré doré
 */
export const FlamencoGuitaristeIcon: React.FC<FlamencoGuitaristeIconProps> = ({
  className = 'w-4 h-4 inline-block shrink-0',
  size,
  variant = 'image'
}) => {
  const style = size ? { width: size, height: size } : undefined;

  if (variant === 'image') {
    return (
      <img
        src={guitaristeImg}
        alt="Guitariste flamenco (Tocaor)"
        className={`inline-block object-cover object-center rounded-full border border-[#e5a93b]/70 shadow-xs ring-1 ring-[#e5a93b]/20 ${className}`}
        style={style}
      />
    );
  }

  return (
    <img
      src={guitaristeImg}
      alt="Guitariste flamenco (Tocaor)"
      className={`inline-block object-cover object-center rounded-full border border-[#e5a93b]/70 shadow-xs ring-1 ring-[#e5a93b]/20 ${className}`}
      style={style}
    />
  );
};

export default FlamencoGuitaristeIcon;
