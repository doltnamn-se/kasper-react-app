
import React from "react";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomerMembers } from "@/hooks/useCustomerMembers";
import { useUserProfile } from "@/hooks/useUserProfile";

interface UserSwitcherProps {
  value: string | null;
  onChange: (memberId: string | null) => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({ value, onChange }) => {
  const { language } = useLanguage();
  const { members } = useCustomerMembers();
  const { userProfile } = useUserProfile();
  const mainName = userProfile?.display_name ?? (language === "sv" ? "Huvudanvändare" : "Main user");

  const hasMembers = (members?.length ?? 0) > 0;

  if (!hasMembers) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          badgeVariants({ variant: "secondary" }),
          "cursor-pointer select-none gap-1 px-3 py-1 text-sm font-medium rounded-[10px] bg-[hsl(var(--switcher-bg))] hover:bg-[hsl(var(--switcher-bg-hover))] text-[hsl(var(--switcher-fg))]"
        )}
        aria-label={language === 'sv' ? 'Växla användare' : 'Switch user'}
      >
        {language === 'sv' ? 'Växla' : 'Switch'}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel>
          {language === "sv" ? "Familjemedlemmar" : "Family members"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={value ?? "main"}
          onValueChange={(val) => onChange(val === "main" ? null : val)}
        >
          <DropdownMenuRadioItem value="main">
            {mainName}
          </DropdownMenuRadioItem>
          {members.map((m) => (
            <DropdownMenuRadioItem key={m.id} value={m.id}>
              {m.display_name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
