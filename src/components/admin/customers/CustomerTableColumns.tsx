
import { ColumnDef } from "@tanstack/react-table";
import { CustomerWithProfile } from "@/types/customer";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/profileUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { CustomerStatusCell } from "./components/CustomerStatusCell";
import { SubscriptionLabel } from "./components/SubscriptionLabel";

export const getColumns = (
  onlineUsers: Set<string>,
  lastSeen: Record<string, string>,
  deviceTypes: Record<string, string>
): ColumnDef<CustomerWithProfile>[] => {
  const { t } = useLanguage();

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
        <SubscriptionLabel plan={row.original.subscription_plan} />
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
        const userId = row.original.profile?.id;
        const deviceType = userId ? deviceTypes[userId] : null;
        
        return (
          <CustomerStatusCell 
            isOnline={isOnline} 
            deviceType={deviceType}
          />
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
