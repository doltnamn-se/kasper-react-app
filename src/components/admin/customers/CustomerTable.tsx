
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { format } from "date-fns";

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
      <CustomerTableToolbar 
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      
      <div>
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
                                <ChevronDown className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6] group-hover:text-black dark:group-hover:text-white transition-colors" />
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
                  <TableRow 
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-[#ededed] dark:border-[#242424] cursor-pointer hover:bg-[#f3f3f3] dark:hover:bg-[#212121]"
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <TableCell 
                        key={cell.id}
                        onClick={() => handleRowClick(row.original, cellIndex === 0)}
                      >
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

      <Sheet open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <SheetContent side="right" className="sm:max-w-xl w-full">
          {selectedCustomer && (
            <div className="space-y-6 py-6">
              <h2 className="text-2xl font-semibold">Customer Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Display Name:</span>{" "}
                      {selectedCustomer.profile?.display_name || 'No name provided'}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {selectedCustomer.profile?.email || 'No email provided'}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Created:</span>{" "}
                      {selectedCustomer.created_at ? format(new Date(selectedCustomer.created_at), 'PPP') : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Onboarding Status</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Status:</span>{" "}
                      {selectedCustomer.onboarding_completed ? 'Completed' : 'In Progress'}
                    </p>
                    {!selectedCustomer.onboarding_completed && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Current Step:</span>{" "}
                        {selectedCustomer.onboarding_step || 1}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Subscription</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Plan:</span>{" "}
                      {selectedCustomer.subscription_plan 
                        ? selectedCustomer.subscription_plan.replace('_', ' ') 
                        : 'No active plan'}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Customer Type:</span>{" "}
                      <span className="capitalize">{selectedCustomer.customer_type}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

