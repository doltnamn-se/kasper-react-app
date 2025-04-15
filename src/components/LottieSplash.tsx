
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
    // Set up event listener for animation completion with the lottie-player element
    const player = playerRef.current;
    if (player) {
      // We need to wait for the player to be ready
      const handlePlayerEvent = () => {
        // Add event listener to the Lottie player's internal element
        const lottiePlayer = player.container?.querySelector('lottie-player');
        if (lottiePlayer) {
          lottiePlayer.addEventListener('complete', () => {
            setVisible(false);
            if (onComplete) onComplete();
          });
        }
      };
      
      // Check if player is loaded
      if (player.isLoaded) {
        handlePlayerEvent();
      } else {
        // Wait for player to load
        player.addEventListener('load', handlePlayerEvent);
      }
      
      // Cleanup function
      return () => {
        if (player.isLoaded) {
          const lottiePlayer = player.container?.querySelector('lottie-player');
          if (lottiePlayer) {
            lottiePlayer.removeEventListener('complete', () => {});
          }
        }
        player.removeEventListener('load', handlePlayerEvent);
      };
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
