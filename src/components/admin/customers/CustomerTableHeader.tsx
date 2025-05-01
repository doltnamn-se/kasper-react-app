
import { Table } from "@tanstack/react-table";
import { TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import { flexRender } from "@tanstack/react-table";
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
    <>
      <CustomerTableToolbar 
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onRefresh={onRefresh}
      />
      <TableHeader className="bg-[#f3f3f3] dark:bg-[#1a1a1a]">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} className="font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
    </>
  );
};
