
import { useEffect, useState, useRef } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

interface LottieSplashProps {
  animationPath: string;
  onComplete?: () => void;
}

export const LottieSplash = ({ animationPath, onComplete }: LottieSplashProps) => {
  const [visible, setVisible] = useState(true);
  const playerRef = useRef<Player>(null);
  
  useEffect(() => {
    // Fallback timeout to hide the splash after a set time
    const timeout = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 3000); // Adjust timeout as needed
    
    return () => clearTimeout(timeout);
  }, [onComplete]);
  
  useEffect(() => {
    // Get access to the Player instance
    const player = playerRef.current;
    
    if (player) {
      // Use the lottie Player's event API correctly
      const handleComplete = () => {
        console.log('Lottie animation completed');
        setVisible(false);
        if (onComplete) onComplete();
      };
      
      // The Player component from @lottiefiles/react-lottie-player uses
      // a different event system - we should check if it has a specific method
      if (typeof player.lottie !== 'undefined') {
        // For newer versions that expose the lottie instance
        player.lottie?.addEventListener('complete', handleComplete);
        
        return () => {
          player.lottie?.removeEventListener('complete', handleComplete);
        };
      } else {
        // For versions that don't expose lottie directly
        const element = player.container;
        if (element) {
          element.addEventListener('complete', handleComplete);
          
          return () => {
            element.removeEventListener('complete', handleComplete);
          };
        }
      }
    }
  }, [onComplete]);
  
  if (!visible) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0066FF',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <Player
        ref={playerRef}
        autoplay
        loop={false}
        src={animationPath}
        style={{ width: '80%', maxWidth: '300px' }}
      />
    </div>
  );
};
