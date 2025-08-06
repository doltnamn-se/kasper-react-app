import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Player } from '@lottiefiles/react-lottie-player';
import { useTheme } from 'next-themes';

export const Completion = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    console.log('Completion page mounted');
    
    // Show welcome animation after a brief moment
    setTimeout(() => {
      console.log('Starting welcome animation');
      setShowWelcome(true);
    }, 300);
    
    // Navigate to platform after animation completes (about 4 seconds total)
    setTimeout(() => {
      console.log('Animation complete, navigating to platform');
      window.location.href = '/';
    }, 4300); // 300ms delay + 4000ms animation
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618] flex items-center justify-center">
      {showWelcome && (
        <div className="text-center">
          <Player
            autoplay
            loop={false}
            src={theme === 'dark' ? '/lovable-uploads/welcome-light-text.json' : '/lovable-uploads/welcome-dark-text.json'}
            className="w-72 h-12 sm:w-96 sm:h-16 md:w-[520px] md:h-20 mx-auto"
          />
        </div>
      )}
    </div>
  );
};

export default Completion;