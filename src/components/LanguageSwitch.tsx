import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const LanguageSwitch = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      <Button
        variant={language === 'sv' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('sv')}
        className="w-12"
      >
        SV
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="w-12"
      >
        EN
      </Button>
    </div>
  );
};