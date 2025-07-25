
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { URLTableRow } from "./URLTableRow";
import { URLTableToolbar } from "./URLTableToolbar";
import { useState, useEffect } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
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
import { TablePagination } from "@/components/ui/table-pagination";

interface URLTableProps {
  urls: Array<{
    id: string;
    url: string;
    status: string;
    created_at: string;
    customer: {
      id: string;
      profiles: {
        email: string;
      };
    };
  }>;
  onStatusChange: (urlId: string, newStatus: string) => void;
  onDelete: (urlId: string) => void;
}

export const URLTable = ({ urls, onStatusChange, onDelete }: URLTableProps) => {
  const { t } = useLanguage();
  const isMobile = useBreakpoint('(max-width: 767px)');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  
  // Add pagination state
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: isMobile ? 5 : 10,
  });
  
  // Update pageSize when screen size changes
  useEffect(() => {
    setPagination(prev => ({
      pageIndex: prev.pageIndex,
      pageSize: isMobile ? 5 : 10
    }));
  }, [isMobile]);

  const columns = [
    {
      id: "url",
      accessorKey: "url",
      header: t('deindexing.url'),
    },
    {
      id: "customer",
      accessorKey: "customer.profiles.email",
      header: t('deindexing.customer'),
    },
    {
      id: "status",
      accessorKey: "status",
      header: t('deindexing.status'),
    },
  ];

  const table = useReactTable({
    data: urls,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    pageCount: Math.ceil(urls.length / pageSize),
    autoResetPageIndex: false, // This is the key - prevent auto reset of page index
    enableRowSelection: false, // Disable row selection to prevent state conflicts
  });

  const handleRefresh = () => {
    // Refresh logic can be implemented here if needed
    console.log("Refresh clicked");
  };

  return (
    <div className="space-y-4">
      <div className="border border-[#dfdfdf] dark:border-[#2e2e2e]">
        <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#dfdfdf] dark:border-[#2e2e2e]">
                <TableHead colSpan={5} className="h-12 bg-[#f3f3f3] dark:bg-[#212121] !p-0">
                  <URLTableToolbar
                    table={table}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    onRefresh={handleRefresh}
                  />
                </TableHead>
              </TableRow>
              <TableRow className="border-b border-[#dfdfdf] dark:border-[#2e2e2e] h-[2.5rem]">
                {!isMobile && <TableHead className="w-[20%] !px-4 h-[2.5rem] py-0">{t('deindexing.url')}</TableHead>}
                {!isMobile && <TableHead className="w-[20%] !px-4 h-[2.5rem] py-0">{t('deindexing.customer')}</TableHead>}
                <TableHead className="w-[35%] !px-4 h-[2.5rem] py-0">{t('deindexing.status')}</TableHead>
                <TableHead className="w-[15%] !px-4 h-[2.5rem] py-0">Change Status</TableHead>
                {!isMobile && <TableHead className="w-[10%] !px-4 h-[2.5rem] py-0">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <URLTableRow
                  key={row.original.id}
                  url={row.original}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  isMobile={isMobile}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add table pagination component */}
      <TablePagination table={table} />
    </div>
  );
};
