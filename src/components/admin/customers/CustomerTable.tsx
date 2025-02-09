
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import { ChevronDown, ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
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
import { useState } from "react";
import { getColumns } from "./CustomerTableColumns";
import { CustomerTableToolbar } from "./CustomerTableToolbar";
import { textFilterFn } from "./customerTableUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  return (
    <div className="space-y-4">
      <CustomerTableToolbar 
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      
      <div className="border border-[#dfdfdf] dark:border-[#2e2e2e]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f3f3f3] dark:bg-[#212121]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-[#dfdfdf] dark:border-[#2e2e2e]">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center justify-between gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="ml-auto focus:outline-none group rounded p-0.5 hover:bg-[#ededed] dark:hover:bg-[#292929] transition-colors">
                                <ChevronDown className="h-3 w-3 text-[#000000A6] dark:text-[#FFFFFFA6] group-hover:text-black dark:group-hover:text-white transition-colors" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => header.column.toggleSorting(true)}
                                  className="text-xs"
                                >
                                  <ArrowDownWideNarrow className="mr-2 h-3.5 w-3.5" />
                                  Sort descending
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => header.column.toggleSorting(false)}
                                  className="text-xs"
                                >
                                  <ArrowUpNarrowWide className="mr-2 h-3.5 w-3.5" />
                                  Sort ascending
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="bg-[#f8f8f8] dark:bg-[#171717] border-b border-[#ededed] dark:border-[#242424]">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

