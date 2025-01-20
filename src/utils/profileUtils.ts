interface UserProfile {
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
}

export const getUserInitials = (userProfile: UserProfile | null): string => {
  if (userProfile?.display_name) {
    const names = userProfile.display_name.split(' ');
    return `${names[0]?.[0] || ''}${names[1]?.[0] || ''}`.toUpperCase();
  }
  if (!userProfile?.first_name && !userProfile?.last_name) return 'U';
  return `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`.toUpperCase();
};

export const getFullName = (userProfile: UserProfile | null, userEmail: string | null): string => {
  if (userProfile?.display_name) return userProfile.display_name;
  if (!userProfile?.first_name && !userProfile?.last_name) return userEmail || '';
  return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userEmail || '';
};