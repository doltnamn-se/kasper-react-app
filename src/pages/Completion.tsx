import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export const Completion = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'reveal' | 'stay' | 'hide'>('reveal');

  useEffect(() => {
    console.log('Completion page mounted');
    
    // Show welcome message after a brief moment and start reveal animation
    setTimeout(() => {
      console.log('Starting welcome message reveal');
      setShowWelcome(true);
      setAnimationPhase('reveal');
    }, 300);
    
    // After reveal animation completes, stay for 2 seconds
    setTimeout(() => {
      console.log('Welcome message fully revealed, staying visible');
      setAnimationPhase('stay');
    }, 1100); // 300ms delay + 800ms reveal animation
    
    // Start hide animation after 2 seconds of staying
    setTimeout(() => {
      console.log('Starting welcome message hide animation');
      setAnimationPhase('hide');
    }, 3100); // 300ms + 800ms + 2000ms stay
    
    // Navigate to platform after hide animation completes
    setTimeout(() => {
      console.log('Hide animation complete, navigating to platform');
      window.location.href = '/';
    }, 3900); // 300ms + 800ms + 2000ms + 800ms hide animation
  }, [navigate]);

  const welcomeText = t('checklist.completion.welcome');
  
  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618] flex items-center justify-center">
      {showWelcome && (
        <div className="text-center">
          <h1 className="text-2xl md:text-[2.5rem] font-domaine font-normal tracking-[0px] text-[#000000] dark:text-white">
            {welcomeText.split('').map((char, index) => (
              <span
                key={index}
                className={`inline-block ${
                  animationPhase === 'reveal' ? 'animate-letter-fade-in' : 
                  animationPhase === 'hide' ? 'animate-letter-fade-out' : ''
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  opacity: animationPhase === 'stay' ? 1 : 0
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
        </div>
      )}
    </div>
  );
};

export default Completion;