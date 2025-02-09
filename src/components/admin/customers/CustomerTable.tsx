
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CustomerDetails } from "@/components/admin/CustomerDetails";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRound } from "lucide-react";

interface CustomerTableProps {
  customers: CustomerWithProfile[];
  onlineUsers: Set<string>;
  lastSeen: Record<string, string>;
}

export const CustomerTable = ({ customers, onlineUsers, lastSeen }: CustomerTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox />
          </TableHead>
          <TableHead className="w-12"></TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Online Status</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id} className="h-12">
            <TableCell className="w-12">
              <Checkbox />
            </TableCell>
            <TableCell className="w-12">
              <UserRound className="w-4 h-4 text-gray-400" />
            </TableCell>
            <TableCell>
              <div className="space-y-0.5">
                <div className="font-medium">
                  {customer.profile?.display_name || 'No name'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.profile?.email}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={customer.checklist_completed ? "default" : "secondary"}>
                {customer.checklist_completed ? 'Completed' : 'In Progress'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="space-y-0.5">
                <Badge variant={onlineUsers.has(customer.profile?.id || '') ? "default" : "secondary"}>
                  {onlineUsers.has(customer.profile?.id || '') ? 'Online' : 'Offline'}
                </Badge>
                {!onlineUsers.has(customer.profile?.id || '') && lastSeen[customer.profile?.id || ''] && (
                  <div className="text-xs text-muted-foreground">
                    Last seen: {format(new Date(lastSeen[customer.profile?.id || '']), 'MMM d, HH:mm')}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="capitalize">
              {customer.customer_type}
            </TableCell>
            <TableCell>
              {customer.subscription_plan 
                ? customer.subscription_plan.replace('_', ' ') 
                : 'No plan'}
            </TableCell>
            <TableCell>
              {customer.created_at 
                ? format(new Date(customer.created_at), 'MMM d, yyyy')
                : 'N/A'}
            </TableCell>
            <TableCell className="text-right">
              <CustomerDetails customer={customer} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
