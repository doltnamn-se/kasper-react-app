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
      <div className="flex items-center gap-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={row.original.profile?.avatar_url ?? undefined}
            alt={row.original.profile?.display_name || "User"}
          />
          <AvatarFallback className="text-xs">
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
    accessorKey: "checklist_completed",
    header: "Status",
    cell: ({ row }) => (
      <span className="text-black dark:text-white">
        {row.original.checklist_completed ? 'Completed' : 'In Progress'}
      </span>
    ),
  },
  {
    id: "online_status",
    header: "Online Status",
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
    accessorKey: "customer_type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize text-black dark:text-white">
        {row.original.customer_type}
      </span>
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
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-black dark:text-white">
        {format(new Date(row.original.created_at), 'MMM d, yyyy')}
      </span>
    ),
  },
];
