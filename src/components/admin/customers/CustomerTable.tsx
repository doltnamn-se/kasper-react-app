
import { useState } from "react";
import { CustomerWithProfile } from "@/types/customer";
import { getColumns } from "./CustomerTableColumns";
import { CustomerTableHeader } from "./CustomerTableHeader";
import { CustomerTableBody } from "./CustomerTableBody";
import { CustomerTableToolbar } from "./CustomerTableToolbar";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table } from "@/components/ui/table";
import { CustomerDetailsSheet } from "./CustomerDetailsSheet";

interface CustomerTableProps {
  customers: CustomerWithProfile[];
  onRefresh: () => void;
  onlineUsers: Set<string>;
  lastSeen: Record<string, string>;
  deviceTypes: Record<string, string>;
}

export const CustomerTable = ({ 
  customers, 
  onRefresh, 
  onlineUsers, 
  lastSeen,
  deviceTypes
}: CustomerTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithProfile | null>(null);

  const columns = getColumns(onlineUsers, lastSeen, deviceTypes);

  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleRowClick = (customer: CustomerWithProfile) => {
    setSelectedCustomer(customer);
    setIsDetailsSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <CustomerTableToolbar 
        table={table} 
        onRefresh={onRefresh}
      />

      <div className="border rounded-md">
        <Table>
          <CustomerTableHeader table={table} />
          <CustomerTableBody 
            table={table} 
            onRowClick={handleRowClick}
          />
        </Table>
      </div>

      {selectedCustomer && (
        <CustomerDetailsSheet 
          customer={selectedCustomer}
          open={isDetailsSheetOpen}
          onOpenChange={setIsDetailsSheetOpen}
          onCustomerUpdated={onRefresh}
        />
      )}
    </div>
  );
};
