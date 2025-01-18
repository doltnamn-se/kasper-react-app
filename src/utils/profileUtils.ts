interface UserProfile {
  first_name?: string;
  last_name?: string;
}

export const getUserInitials = (userProfile: UserProfile | null): string => {
  if (!userProfile?.first_name && !userProfile?.last_name) return 'U';
  return `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`;
};

export const getFullName = (userProfile: UserProfile | null, userEmail: string | null): string => {
  if (!userProfile?.first_name && !userProfile?.last_name) return userEmail || '';
  return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userEmail || '';
};