interface UserProfile {
  display_name?: string | null;
  email?: string | null;
}

export const getUserInitials = (userProfile: UserProfile | null): string => {
  if (!userProfile?.display_name) return 'U';
  
  const names = userProfile.display_name.split(' ');
  if (names.length >= 2) {
    return `${names[0]?.[0] || ''}${names[1]?.[0] || ''}`.toUpperCase();
  }
  return (names[0]?.[0] || 'U').toUpperCase();
};

export const getFullName = (userProfile: UserProfile | null, userEmail: string | null): string => {
  if (!userProfile) return userEmail || '';
  return userProfile.display_name || userEmail || '';
};