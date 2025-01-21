import { Profile } from "@/types/customer";

export const getUserInitials = (profile: Profile | null): string => {
  if (!profile?.display_name) return "U";
  
  const names = profile.display_name.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return names[0][0].toUpperCase();
};

export const getFullName = (profile: Profile | null, email: string | null): string => {
  if (profile?.display_name) {
    return profile.display_name;
  }
  return email || "";
};