
interface SiteInfo {
  name: string;
  icon: string;
}

export const siteConfig: SiteInfo[] = [
  { name: 'Mrkoll', icon: '/lovable-uploads/logo-icon-mrkoll.webp' },
  { name: 'Ratsit', icon: '/lovable-uploads/logo-icon-ratsit.webp' },
  { name: 'Hitta', icon: '/lovable-uploads/logo-icon-hittase.webp' },
  { name: 'Merinfo', icon: '/lovable-uploads/logo-icon-merinfo.webp' },
  { name: 'Eniro', icon: '/lovable-uploads/logo-icon-eniro.webp' },
  { name: 'Birthday', icon: '/lovable-uploads/logo-icon-birthdayse.webp' },
];

export const getStatusText = (status: string, language: string): string => {
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

export const getSpinnerColor = (status: string): string => {
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
