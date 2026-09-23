import React from 'react';
import bailaoraImg from '../assets/images/danseuse_flamenca.jpg';

interface FlamencoBailaoraIconProps {
  className?: string;
  size?: number | string;
  variant?: 'image' | 'vector';
}

/**
 * Icône / Image authentique d'une vraie Danseuse Flamenca (Bailaora Flamenca)
 * Remplacement authentique de l'émoji danseuse générique (💃).
 * - Véritable bailaora espagnole en robe de flamenco rouge et noire
 * - Fleur andalouse dans les cheveux et port de bras majestueux (braceo)
 * - Regard intense et posture dramatique du duende
 * - Éclairage scénique chaud avec liséré doré
 */
export const FlamencoBailaoraIcon: React.FC<FlamencoBailaoraIconProps> = ({
  className = 'w-4 h-4 inline-block shrink-0',
  size,
  variant = 'image'
}) => {
  const style = size ? { width: size, height: size } : undefined;

  if (variant === 'image') {
    return (
      <img
        src={bailaoraImg}
        alt="Danseuse flamenca (Bailaora)"
        className={`inline-block object-cover object-top rounded-full border border-[#e5a93b]/70 shadow-xs ring-1 ring-[#e5a93b]/20 ${className}`}
        style={style}
      />
    );
  }

  return (
    <img
      src={bailaoraImg}
      alt="Danseuse flamenca (Bailaora)"
      className={`inline-block object-cover object-top rounded-full border border-[#e5a93b]/70 shadow-xs ring-1 ring-[#e5a93b]/20 ${className}`}
      style={style}
    />
  );
};

export default FlamencoBailaoraIcon;
