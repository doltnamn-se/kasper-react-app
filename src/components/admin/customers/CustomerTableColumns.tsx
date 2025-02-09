
import { ColumnDef } from "@tanstack/react-table";
import { CustomerWithProfile } from "@/types/customer";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/profileUtils";

export const getColumns = (
  onlineUsers: Set<string>,
  lastSeen: Record<string, string>
): ColumnDef<CustomerWithProfile>[] => [
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
    header: "Customer name",
    cell: ({ row }) => (
      <div className="text-black dark:text-white">
        {row.original.profile?.display_name || 'No name'}
      </div>
    ),
  },
  {
    accessorKey: "profile.email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-black dark:text-white">
        {row.original.profile?.email || 'No email'}
      </div>
    ),
  },
  {
    accessorKey: "checklist_completed",
    header: "Checklist",
    cell: ({ row }) => (
      <span className="text-black dark:text-white">
        {row.original.checklist_completed ? 'Completed' : 'In Progress'}
      </span>
    ),
  },
  {
    id: "online_status",
    header: "Last Online",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <span className="text-black dark:text-white">
          {row.original.profile?.id && onlineUsers.has(row.original.profile.id) ? 'Online' : 'Offline'}
        </span>
        {row.original.profile?.id && 
         !onlineUsers.has(row.original.profile.id) && 
         lastSeen[row.original.profile.id] && (
          <div className="text-muted-foreground">
            Last seen: {format(new Date(lastSeen[row.original.profile.id]), 'MMM d, HH:mm')}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "subscription_plan",
    header: "Plan",
    cell: ({ row }) => (
      <span className="text-black dark:text-white">
        {row.original.subscription_plan 
          ? row.original.subscription_plan.replace('_', ' ') 
          : 'No plan'}
      </span>
    ),
  },
];

