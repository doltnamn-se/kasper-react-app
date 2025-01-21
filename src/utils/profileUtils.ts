interface UserProfile {
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  email?: string | null;
}

export const getUserInitials = (userProfile: UserProfile | null): string => {
  if (!userProfile) return 'U';
  
  // First try to get initials from display name
  if (userProfile.display_name) {
    const names = userProfile.display_name.split(' ');
    if (names.length >= 2) {
      return `${names[0]?.[0] || ''}${names[names.length - 1]?.[0] || ''}`.toUpperCase();
    }
    return (userProfile.display_name[0] || 'U').toUpperCase();
  }
  
  // Then try first and last name
  if (userProfile.first_name || userProfile.last_name) {
    return `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`.toUpperCase();
  }
  
  // Finally, try to get meaningful initials from email
  if (userProfile.email) {
    const emailParts = userProfile.email.split('@')[0].split(/[._-]/);
    if (emailParts.length >= 2) {
      return `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase();
    }
    // If email doesn't have separators, take first two letters
    return userProfile.email.slice(0, 2).toUpperCase();
  }
  
  return 'U';
};

export const getFullName = (userProfile: UserProfile | null, userEmail: string | null): string => {
  if (!userProfile) return userEmail || '';
  if (userProfile.display_name) return userProfile.display_name;
  if (userProfile.first_name || userProfile.last_name) {
    return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
  }
  return userEmail || '';
};