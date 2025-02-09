
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CustomerDetails } from "@/components/admin/CustomerDetails";

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
          <TableRow key={customer.id}>
            <TableCell>
              <div>
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
              <Badge variant={onlineUsers.has(customer.profile?.id || '') ? "default" : "secondary"}>
                {onlineUsers.has(customer.profile?.id || '') ? 'Online' : 'Offline'}
              </Badge>
              {!onlineUsers.has(customer.profile?.id || '') && lastSeen[customer.profile?.id || ''] && (
                <div className="text-xs text-muted-foreground mt-1">
                  Last seen: {format(new Date(lastSeen[customer.profile?.id || '']), 'MMM d, HH:mm')}
                </div>
              )}
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
