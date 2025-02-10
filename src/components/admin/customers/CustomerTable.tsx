
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomerTableProps {
  customers: CustomerWithProfile[];
  onlineUsers: Set<string>;
  lastSeen: Record<string, string>;
  onRefresh: () => void;
}

export const CustomerTable = ({ customers, onlineUsers, lastSeen, onRefresh }: CustomerTableProps) => {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithProfile | null>(null);
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

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
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    pageCount: Math.ceil(customers.length / pageSize),
  });

  const handleRowClick = (customer: CustomerWithProfile, isCheckboxCell: boolean) => {
    if (!isCheckboxCell) {
      setSelectedCustomer(customer);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-[#dfdfdf] dark:border-[#2e2e2e]">
        <div className="overflow-x-auto">
          <Table>
            <CustomerTableHeader 
              table={table}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              onRefresh={onRefresh}
            />
            <CustomerTableBody 
              table={table}
              onRowClick={handleRowClick}
            />
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p>
              {t('pagination.page')} {table.getState().pagination.pageIndex + 1} {t('pagination.of')}{' '}
              {table.getPageCount()} {t('pagination.pages')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <p>
              {t('pagination.items.per.page')}:
            </p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs font-medium">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`} className="text-xs font-medium">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0 text-[#000000A6] dark:text-[#FFFFFFA6] hover:text-[#000000] dark:hover:text-[#FFFFFF] border-transparent hover:border-transparent hover:bg-transparent"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t('pagination.previous')}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 text-[#000000A6] dark:text-[#FFFFFFA6] hover:text-[#000000] dark:hover:text-[#FFFFFF] border-transparent hover:border-transparent hover:bg-transparent"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t('pagination.next')}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CustomerDetailsSheet 
        customer={selectedCustomer}
        onOpenChange={() => setSelectedCustomer(null)}
      />
    </div>
  );
};

