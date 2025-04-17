
import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { PrivacyScoreCard } from "@/components/privacy/PrivacyScoreCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const Index = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Översikt | Digitaltskydd.se" : 
      "Overview | Digitaltskydd.se";
      
    const now = new Date();
    const minutes = now.getMinutes();
    const currentInterval = minutes - (minutes % 5);
    
    const lastInterval = new Date(now);
    lastInterval.setMinutes(currentInterval);
    lastInterval.setSeconds(0);
    lastInterval.setMilliseconds(0);
    setLastChecked(lastInterval);
  }, [language]);

  const displayName = userProfile?.display_name || '';
  const firstNameOnly = displayName.split(' ')[0];

  const sites = [
    { name: 'Mrkoll', status: language === 'sv' ? 'Granskar' : 'Reviewing', icon: '/lovable-uploads/logo-icon-mrkoll.webp' },
    { name: 'Ratsit', status: language === 'sv' ? 'Granskar' : 'Reviewing', icon: '/lovable-uploads/logo-icon-ratsit.webp' },
    { name: 'Hitta', status: language === 'sv' ? 'Granskar' : 'Reviewing', icon: '/lovable-uploads/logo-icon-hittase.webp' },
    { name: 'Merinfo', status: language === 'sv' ? 'Granskar' : 'Reviewing', icon: '/lovable-uploads/logo-icon-merinfo.webp' },
    { name: 'Eniro', status: language === 'sv' ? 'Granskar' : 'Reviewing', icon: '/lovable-uploads/logo-icon-eniro.webp' },
    { name: 'Birthday', status: language === 'sv' ? 'Granskar' : 'Reviewing', icon: '/lovable-uploads/logo-icon-birthdayse.webp' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 pb-20 md:pb-0">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {language === 'sv' ? 
            `Välkommen, ${firstNameOnly} 👋` : 
            `Welcome, ${firstNameOnly} 👋`
          }
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PrivacyScoreCard />
          <Card className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
            <div className="flex items-center justify-between mb-[50px]">
              <h2 className="text-lg font-semibold flex items-center">
                {language === 'sv' ? 'Status' : 'Status'}
              </h2>
            </div>
            <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-sm mb-10">
              {language === 'sv' ? 'Din synlighet på upplysningssidor' : 'Your visibility on search sites'}
            </p>
            <div className="mt-2">
              <Table>
                <TableHeader>
                  <TableRow className="!hover:bg-transparent border-none">
                    <TableHead className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
                      {language === 'sv' ? 'Sida' : 'Site'}
                    </TableHead>
                    <TableHead className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site) => (
                    <TableRow key={site.name} className="!hover:bg-transparent border-none py-4">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={site.icon} 
                            alt={site.name} 
                            className="w-8 h-8 object-contain" 
                          />
                          <span className="text-sm font-medium">{site.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Spinner color="#20f922" size={20} />
                          <span className="text-sm">{site.status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
