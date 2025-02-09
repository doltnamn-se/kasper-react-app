
import { Table } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { getColumns } from "./CustomerTableColumns";
import { textFilterFn } from "./customerTableUtils";
import { CustomerTableHeader } from "./CustomerTableHeader";
import { CustomerTableBody } from "./CustomerTableBody";
import { CustomerDetailsSheet } from "./CustomerDetailsSheet";

interface CustomerTableProps {
  customers: CustomerWithProfile[];
  onlineUsers: Set<string>;
  lastSeen: Record<string, string>;
}

export const CustomerTable = ({ customers, onlineUsers, lastSeen }: CustomerTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithProfile | null>(null);

  const columns = getColumns(onlineUsers, lastSeen);

  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      text: textFilterFn,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleRowClick = (customer: CustomerWithProfile, isCheckboxCell: boolean) => {
    if (!isCheckboxCell) {
      setSelectedCustomer(customer);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-[#dfdfdf] dark:border-[#2e2e2e]">
        <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
          <Table>
            <CustomerTableHeader 
              table={table}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
            <CustomerTableBody 
              table={table}
              onRowClick={handleRowClick}
            />
          </Table>
        </div>
      </div>

      <CustomerDetailsSheet 
        customer={selectedCustomer}
        onOpenChange={() => setSelectedCustomer(null)}
      />
    </div>
  );
};
