
import { ColumnDef } from "@tanstack/react-table";
import { CustomerWithProfile } from "@/types/customer";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/profileUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";

export const getColumns = (
  onlineUsers: Set<string>,
  lastSeen: Record<string, string>
): ColumnDef<CustomerWithProfile>[] => {
  const { t } = useLanguage();

  const getSubscriptionLabel = (plan: string | null) => {
    switch(plan) {
      case '1_month':
        return t('subscription.1month');
      case '3_months':
        return t('subscription.3months');
      case '6_months':
        return t('subscription.6months');
      case '12_months':
        return t('subscription.12months');
      case '24_months':
        return t('subscription.24months');
      default:
        return t('subscription.none');
    }
  };

  return [
    {
      id: "select",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
          <Avatar className="h-6 w-6">
            <AvatarImage 
              src={row.original.profile?.avatar_url ?? undefined}
              alt={row.original.profile?.display_name || "User"}
            />
            <AvatarFallback className="text-[10px]">
              {getUserInitials({
                display_name: row.original.profile?.display_name,
                email: row.original.profile?.email
              })}
            </AvatarFallback>
          </Avatar>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "profile.display_name",
      id: "profile_display_name",
      header: t('name'),
      cell: ({ row }) => (
        <div className="text-black dark:text-white">
          {row.original.profile?.display_name || t('no.name')}
        </div>
      ),
    },
    {
      accessorKey: "profile.email",
      id: "profile_email",
      header: t('email'),
      cell: ({ row }) => (
        <div className="text-black dark:text-white">
          {row.original.profile?.email || t('no.email')}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "subscription_plan",
      header: t('plan'),
      cell: ({ row }) => (
        <span className="text-black dark:text-white">
          {getSubscriptionLabel(row.original.subscription_plan)}
        </span>
      ),
    },
    {
      accessorKey: "checklist_completed",
      header: t('checklist'),
      cell: ({ row }) => (
        <span className="text-black dark:text-white">
          {row.original.checklist_completed ? t('completed') : t('in.progress')}
        </span>
      ),
    },
    {
      id: "online_status",
      header: t('status'),
      cell: ({ row }) => {
        const isOnline = row.original.profile?.id && onlineUsers.has(row.original.profile.id);
        return (
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle 
                cx="6" 
                cy="6" 
                r="3" 
                fill={isOnline ? '#20f922' : '#ea384c'} 
                filter="url(#glow)"
              />
            </svg>
            <span className="text-black dark:text-white">
              {isOnline ? t('online') : t('offline')}
            </span>
          </div>
        );
      },
    },
    {
      id: "last_seen",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-between gap-2">
            {t('last.seen').replace(':', '')}
            {column.getCanSort() && (
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-auto focus:outline-none group rounded p-0.5 hover:bg-[#ededed] dark:hover:bg-[#292929] transition-colors">
                  <ChevronDown className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6] group-hover:text-black dark:group-hover:text-white transition-colors" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => column.toggleSorting(true)}
                    className="text-xs"
                  >
                    <ArrowDownWideNarrow className="mr-2 h-3.5 w-3.5" />
                    {t('sort.descending')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => column.toggleSorting(false)}
                    className="text-xs"
                  >
                    <ArrowUpNarrowWide className="mr-2 h-3.5 w-3.5" />
                    {t('sort.ascending')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
      cell: ({ row }) => {
        const isOnline = row.original.profile?.id && onlineUsers.has(row.original.profile.id);
        if (isOnline || !row.original.profile?.id) return null;
        
        const lastSeenTime = lastSeen[row.original.profile.id];
        if (!lastSeenTime) return null;

        return (
          <div className="text-black dark:text-white">
            {format(new Date(lastSeenTime), 'MMM d, HH:mm')}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const aLastSeen = rowA.original.profile?.id ? lastSeen[rowA.original.profile.id] : null;
        const bLastSeen = rowB.original.profile?.id ? lastSeen[rowB.original.profile.id] : null;
        
        if (!aLastSeen && !bLastSeen) return 0;
        if (!aLastSeen) return 1;
        if (!bLastSeen) return -1;
        
        return new Date(bLastSeen).getTime() - new Date(aLastSeen).getTime();
      },
      enableSorting: true,
    },
  ];
};
