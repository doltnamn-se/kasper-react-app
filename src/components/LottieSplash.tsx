
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
    
    // Handle animation complete event manually
    if (player) {
      const handleComplete = () => {
        console.log('Lottie animation completed');
        setVisible(false);
        if (onComplete) onComplete();
      };
      
      // Add event listener to the lottie player element
      // The Player component wraps the lottie-player web component
      player.addEventListener('complete', handleComplete);
      
      // Cleanup
      return () => {
        player.removeEventListener('complete', handleComplete);
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
