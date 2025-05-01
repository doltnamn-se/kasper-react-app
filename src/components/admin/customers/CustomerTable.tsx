
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
import { useState, useEffect } from "react";
import { getColumns } from "./CustomerTableColumns";
import { textFilterFn } from "./customerTableUtils";
import { CustomerTableHeader } from "./CustomerTableHeader";
import { CustomerTableBody } from "./CustomerTableBody";
import { CustomerDetailsSheet } from "./CustomerDetailsSheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const isMobile = useIsMobile();

  const columns = getColumns(onlineUsers, lastSeen);

  useEffect(() => {
    if (isMobile) {
      // On mobile, only show profile_display_name and online_status columns
      setColumnVisibility({
        profile_display_name: true,
        online_status: true,
        profile_email: false,
        checklist_completed: false,
        last_seen: false,
        subscription_plan: false,
        actions: true,
      });
    } else {
      // On desktop, show all columns by default
      setColumnVisibility({});
    }
  }, [isMobile]);

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
      <div className="border border-[#dfdfdf] dark:border-[#2e2e2e] w-full max-w-full">
        <ScrollArea className="w-full" type="scroll">
          <div className="min-w-full w-max">
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
        </ScrollArea>
      </div>

      <div className="flex items-center justify-between px-2 text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p>
              {isMobile ? (
                <>
                  {table.getState().pagination.pageIndex + 1} {t('pagination.of')}{' '}
                  {table.getPageCount()}
                </>
              ) : (
                <>
                  {t('pagination.page')} {table.getState().pagination.pageIndex + 1} {t('pagination.of')}{' '}
                  {table.getPageCount()} {t('pagination.pages')}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <p>
                {t('pagination.items.per.page')}:
              </p>
            )}
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
