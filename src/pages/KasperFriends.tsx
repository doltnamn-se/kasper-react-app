import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { KasperFriendsCard } from "@/components/kasper/KasperFriendsCard";
import { useIsMobile } from "@/hooks/use-mobile";

const KasperFriends = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Kasper Friends | Kasper" : 
      "Kasper Friends | Kasper";
  }, [language]);

  const content = (
    <div className="space-y-8">
      <h1>
        <span className="font-sans font-semibold">Kasper</span> Friends
      </h1>
      
      <KasperFriendsCard />
    </div>
  );

  // On mobile, render the content directly (MobilePersistentLayout will add navigation)
  // On desktop, wrap it in MainLayout
  return isMobile ? content : <MainLayout>{content}</MainLayout>;
};

export default KasperFriends;