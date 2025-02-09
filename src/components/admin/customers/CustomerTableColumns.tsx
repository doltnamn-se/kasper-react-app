
import { ColumnDef } from "@tanstack/react-table";
import { CustomerWithProfile } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CustomerDetails } from "@/components/admin/CustomerDetails";

export const getColumns = (
  onlineUsers: Set<string>,
  lastSeen: Record<string, string>
): ColumnDef<CustomerWithProfile>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "profile.display_name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <div className="text-black dark:text-white">
          {row.original.profile?.display_name || 'No name'}
        </div>
        <div className="text-muted-foreground">
          {row.original.profile?.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "checklist_completed",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.checklist_completed ? "default" : "secondary"}>
        {row.original.checklist_completed ? 'Completed' : 'In Progress'}
      </Badge>
    ),
  },
  {
    id: "online_status",
    header: "Online Status",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <Badge variant={row.original.profile?.id && onlineUsers.has(row.original.profile.id) ? "default" : "secondary"}>
          {row.original.profile?.id && onlineUsers.has(row.original.profile.id) ? 'Online' : 'Offline'}
        </Badge>
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
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <CustomerDetails customer={row.original} />,
  },
];
