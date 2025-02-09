
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
      <Input
        placeholder="Filter customers..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />
      <div className="flex-1" />
      <CreateCustomerDialog onCustomerCreated={() => table.resetRowSelection()}>
        <Button 
          className="
            text-[#000000] bg-[#72e3ad] border-[#16b674bf] hover:bg-[#3fcf8ecc] hover:border-[#097c4f]
            dark:text-white dark:bg-[#3ecf8e80] dark:border-[#3ecf8e] dark:hover:bg-[#3ecf8e] dark:hover:border-[#3ecf8e]
            border flex items-center gap-2 text-xs rounded-md h-8 px-[0.625rem]
          "
        >
          <UserRoundPlus className="h-4 w-4 text-[#097c4f] dark:text-[#85e0ba]" />
          Add Customer
        </Button>
      </CreateCustomerDialog>
    </div>
  );
};

