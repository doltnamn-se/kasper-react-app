
import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { PrivacyScoreCard } from "@/components/privacy/PrivacyScoreCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";

interface SiteStatus {
  site_name: string;
  status: string;
}

const Index = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  const [lastChecked, setLastChecked] = useState(new Date());
  const [siteStatuses, setSiteStatuses] = useState<SiteStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchSiteStatuses = async () => {
      if (!userProfile?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('customer_site_statuses')
          .select('*')
          .eq('customer_id', userProfile.id);

        if (error) {
          console.error('Error fetching site statuses:', error);
          return;
        }

        // Convert the data to our SiteStatus array format
        const statusArray = data || [];
        setSiteStatuses(statusArray);
      } catch (error) {
        console.error('Error in fetchSiteStatuses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteStatuses();
  }, [userProfile?.id]);

  const displayName = userProfile?.display_name || '';
  const firstNameOnly = displayName.split(' ')[0];

  const sites = [
    { name: 'Mrkoll', icon: '/lovable-uploads/logo-icon-mrkoll.webp' },
    { name: 'Ratsit', icon: '/lovable-uploads/logo-icon-ratsit.webp' },
    { name: 'Hitta', icon: '/lovable-uploads/logo-icon-hittase.webp' },
    { name: 'Merinfo', icon: '/lovable-uploads/logo-icon-merinfo.webp' },
    { name: 'Eniro', icon: '/lovable-uploads/logo-icon-eniro.webp' },
    { name: 'Birthday', icon: '/lovable-uploads/logo-icon-birthdayse.webp' },
  ];

  // Get translated status text
  const getStatusText = (siteName: string) => {
    const siteStatus = siteStatuses.find(status => status.site_name === siteName);
    const status = siteStatus ? siteStatus.status : 'Granskar';
    
    switch (status) {
      case 'Adress dold':
        return language === 'sv' ? 'Adress dold' : 'Address hidden';
      case 'Dold':
        return language === 'sv' ? 'Dold' : 'Hidden';
      case 'Borttagen':
        return language === 'sv' ? 'Borttagen' : 'Removed';
      case 'Synlig':
        return language === 'sv' ? 'Synlig' : 'Visible';
      case 'Granskar':
      default:
        return language === 'sv' ? 'Granskar' : 'Reviewing';
    }
  };

  // Get spinner color based on status
  const getSpinnerColor = (siteName: string) => {
    const siteStatus = siteStatuses.find(status => status.site_name === siteName);
    const status = siteStatus ? siteStatus.status : 'Granskar';
    
    switch (status) {
      case 'Synlig':
        return "#ea384c"; // Red for visible
      case 'Granskar':
        return "#8E9196"; // Grey for reviewing
      case 'Adress dold':
        return "#FFC107"; // Amber yellow for address hidden
      case 'Dold':
      case 'Borttagen':
      default:
        return "#20f922"; // Keep green for all other statuses
    }
  };

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
            <div>
              <h2 className="text-lg font-semibold">
                {language === 'sv' ? 'Status' : 'Status'}
              </h2>
              <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-sm mb-10">
                {language === 'sv' ? 'Din synlighet på upplysningssidor' : 'Your visibility on search sites'}
              </p>
            </div>
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
                          <Spinner 
                            color={getSpinnerColor(site.name)} 
                            size={20} 
                            centerSize={5} // Larger center dot specifically for this status widget
                          />
                          <span className="text-sm">{getStatusText(site.name)}</span>
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
