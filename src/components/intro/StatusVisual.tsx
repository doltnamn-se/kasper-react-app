import { Spinner } from "@/components/ui/spinner";
import { getSpinnerColor, getStatusText } from "@/components/status/SiteConfig";

interface StatusVisualProps {
  language: string;
}

const allSites = [
  { name: 'Mrkoll', icon: '/fonts/MrKoll.svg', status: 'Borttagen' },
  { name: 'Ratsit', icon: '/fonts/Ratsit.svg', status: 'Borttagen' },
  { name: 'Hitta', icon: '/fonts/Hitta.svg', status: 'Borttagen' },
  { name: 'Merinfo', icon: '/fonts/Merinfo.svg', status: 'Borttagen' },
  { name: 'Eniro', icon: '/fonts/Eniro.svg', status: 'Borttagen' },
  { name: 'Birthday', icon: '/fonts/Birthday.svg', status: 'Borttagen' },
];

export const StatusVisual = ({ language }: StatusVisualProps) => {
  // Double the array to create seamless loop
  const sites = [...allSites, ...allSites];

  return (
    <div className="w-full bg-transparent p-4 md:p-6 rounded-2xl shadow-sm border border-transparent transition-colors duration-200 space-y-6">
      {/* Status list with smooth vertical scroll */}
      <div className="relative h-[140px] overflow-hidden">
        {/* Fade out gradient at top */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#fafafa] dark:from-[#1a1a1a] to-transparent z-10 pointer-events-none" />
        
        {/* Fade in gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#fafafa] dark:from-[#1a1a1a] to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling container */}
        <div 
          className="space-y-3"
          style={{
            animation: 'scroll-up 12s linear infinite',
          }}
        >
          {sites.map((site, index) => (
            <div 
              key={`${site.name}-${index}`}
              className="flex items-center justify-between py-3 border-b border-[#e5e7eb] dark:border-[#232325]"
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

      <style>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
};
