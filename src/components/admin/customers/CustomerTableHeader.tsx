
import { Table } from "@tanstack/react-table";
import { CustomerWithProfile } from "@/types/customer";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { CustomerTableToolbar } from "./CustomerTableToolbar";

interface CustomerTableHeaderProps {
  table: Table<CustomerWithProfile>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  onRefresh: () => void;
}

export const CustomerTableHeader = ({
  table,
  globalFilter,
  setGlobalFilter,
  onRefresh,
}: CustomerTableHeaderProps) => {
  return (
    <TableHeader className="bg-[#f3f3f3] dark:bg-[#212121]">
      <TableRow className="border-b border-[#dfdfdf] dark:border-[#2e2e2e] h-10">
        <TableHead colSpan={table.getAllColumns().length}>
          <CustomerTableToolbar 
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            onRefresh={onRefresh}
          />
        </TableHead>
      </TableRow>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className="border-b border-[#dfdfdf] dark:border-[#2e2e2e]">
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder ? null : (
                <div className="flex items-center justify-between gap-2">
                  {typeof header.column.columnDef.header === 'function' 
                    ? header.column.columnDef.header(header.getContext())
                    : header.column.columnDef.header}
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
  );
};

