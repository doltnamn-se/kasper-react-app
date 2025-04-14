
import { Table } from "@tanstack/react-table";
import { CustomerWithProfile } from "@/types/customer";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

interface CustomerTableBodyProps {
  table: Table<CustomerWithProfile>;
  onRowClick: (customer: CustomerWithProfile, isCheckboxCell: boolean) => void;
}

export const CustomerTableBody = ({
  table,
  onRowClick,
}: CustomerTableBodyProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-3 py-2 px-1">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <Card 
              key={row.id} 
              className="bg-[#f8f8f8] dark:bg-[#171717] border border-[#ededed] dark:border-[#242424] cursor-pointer hover:bg-[#f3f3f3] dark:hover:bg-[#212121] shadow-sm"
              onClick={() => onRowClick(row.original, false)}
            >
              <CardContent className="p-3">
                <div className="grid gap-2">
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id} className="grid grid-cols-2 gap-2">
                      <div className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] truncate">
                        {cell.column.columnDef.header?.toString()}
                      </div>
                      <div className="text-xs text-[#000000] dark:text-[#ffffff] font-medium truncate">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 text-sm text-gray-600 dark:text-gray-400">
            No results.
          </div>
        )}
      </div>
    );
  }

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
                className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
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
