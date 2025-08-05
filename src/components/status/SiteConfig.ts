
interface SiteInfo {
  name: string;
  icon: string;
}

export const siteConfig: SiteInfo[] = [
  { name: 'Mrkoll', icon: '/fonts/MrKoll.svg' },
  { name: 'Ratsit', icon: '/fonts/Ratsit.svg' },
  { name: 'Hitta', icon: '/fonts/Hitta.svg' },
  { name: 'Merinfo', icon: '/fonts/Merinfo.svg' },
  { name: 'Eniro', icon: '/fonts/Eniro.svg' },
  { name: 'Birthday', icon: '/fonts/Birthday.svg' },
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
    case 'Begäran skickad':
      return language === 'sv' ? 'Begäran skickad' : 'Request sent';
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
    case 'Begäran skickad':
      return "#FFC107"; // Amber yellow for address hidden and request sent
    case 'Dold':
    case 'Borttagen':
    default:
      return "#20f922"; // Keep green for all other statuses
  }
};
