
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Columns3, UserRoundPlus } from "lucide-react";
import { CustomerWithProfile } from "@/types/customer";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";

interface CustomerTableToolbarProps {
  table: Table<CustomerWithProfile>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

export const CustomerTableToolbar = ({
  table,
  globalFilter,
  setGlobalFilter,
}: CustomerTableToolbarProps) => {
  return (
    <div className="flex items-center gap-4 py-2 px-2">
      <Input
        placeholder="Filter customers..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Columns3 className="mr-2 h-4 w-4" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex-1" />
      <CreateCustomerDialog onCustomerCreated={() => {}} />
    </div>
  );
};
