import { useEffect } from 'react';

const PROFILE_BACKGROUNDS = [
  '/lovable-uploads/kasper-profil-personskydd.png',
  '/lovable-uploads/kasper-profil-parskydd.png',
  '/lovable-uploads/kasper-profil-familjeskydd.png'
];

export const ImagePreloader = () => {
  useEffect(() => {
    PROFILE_BACKGROUNDS.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null;
};
