export const extractSiteName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;
    
    // Remove www. prefix if present
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    // Get the main domain part (before the TLD)
    const domainParts = hostname.split('.');
    const mainDomain = domainParts[0];
    
    // Capitalize first letter
    return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
  } catch (error) {
    // If URL parsing fails, return the original URL
    return url;
  }
};