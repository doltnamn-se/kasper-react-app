import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export const Completion = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    console.log('Completion page mounted');
    
    // Show welcome message after a brief moment (fade in)
    setTimeout(() => {
      console.log('Showing welcome message');
      setShowWelcome(true);
    }, 300);
    
    // Hide welcome message and navigate to platform after 3 seconds
    setTimeout(() => {
      console.log('Hiding welcome message and navigating to platform');
      setShowWelcome(false);
      
      // Navigate to platform after fade out
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }, 3000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618] flex items-center justify-center">
      {showWelcome && (
        <div className="text-center animate-fade-in">
          <h1 className="text-2xl md:text-[2.5rem] font-domaine font-normal tracking-[0px] text-[#000000] dark:text-white">
            {t('checklist.completion.welcome')}
          </h1>
        </div>
      )}
    </div>
  );
};

export default Completion;