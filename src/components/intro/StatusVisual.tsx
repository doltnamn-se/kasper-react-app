import { Spinner } from "@/components/ui/spinner";
import { getSpinnerColor, getStatusText } from "@/components/status/SiteConfig";
import { useState, useEffect } from "react";

interface StatusVisualProps {
  language: string;
}

const allSites = [
  { name: 'Mrkoll', icon: '/fonts/MrKoll.svg', status: 'Dold' },
  { name: 'Ratsit', icon: '/fonts/Ratsit.svg', status: 'Borttagen' },
  { name: 'Hitta', icon: '/fonts/Hitta.svg', status: 'Dold' },
  { name: 'Merinfo', icon: '/fonts/Merinfo.svg', status: 'Adress dold' },
  { name: 'Eniro', icon: '/fonts/Eniro.svg', status: 'Borttagen' },
  { name: 'Birthday', icon: '/fonts/Birthday.svg', status: 'Dold' },
];

export const StatusVisual = ({ language }: StatusVisualProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSites.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Get current 2 sites to display
  const visibleSites = [
    allSites[currentIndex],
    allSites[(currentIndex + 1) % allSites.length],
  ];

  return (
    <div className="w-full bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 space-y-6">
      {/* Header */}
      <h2>
        {language === 'sv' ? 'Status' : 'Status'}
      </h2>

      {/* Status list with vertical carousel */}
      <div className="space-y-3 overflow-hidden">
        {visibleSites.map((site, index) => (
          <div 
            key={`${site.name}-${currentIndex}-${index}`}
            className="flex items-center justify-between py-3 border-b border-[#e5e7eb] dark:border-[#232325] last:border-0 animate-fade-in"
          >
            <div className="flex items-center gap-2">
              <img 
                src={site.icon} 
                alt={site.name} 
                className="w-6 h-6 object-contain"
              />
              <span className="text-xs md:text-sm font-medium">{site.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Spinner 
                color={getSpinnerColor(site.status)} 
                size={16} 
                centerSize={5}
              />
              <span className="text-xs md:text-sm">{getStatusText(site.status, language)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
