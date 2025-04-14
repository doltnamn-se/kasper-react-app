
import { Table } from "@tanstack/react-table";
import { CustomerWithProfile } from "@/types/customer";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";

interface CustomerTableBodyProps {
  table: Table<CustomerWithProfile>;
  onRowClick: (customer: CustomerWithProfile, isCheckboxCell: boolean) => void;
}

export const CustomerTableBody = ({
  table,
  onRowClick,
}: CustomerTableBodyProps) => {
  return (
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow 
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className="bg-[#f8f8f8] dark:bg-[#171717] border-b border-[#ededed] dark:border-[#242424] cursor-pointer hover:bg-[#f3f3f3] dark:hover:bg-[#212121]"
          >
            {row.getVisibleCells().map((cell, cellIndex) => (
              <TableCell 
                key={cell.id}
                onClick={() => onRowClick(row.original, cellIndex === 0)}
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
            colSpan={table.getAllColumns().length}
            className="h-24 text-center"
          >
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};
