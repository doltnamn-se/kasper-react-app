
import { Table } from "@tanstack/react-table";
import { CustomerWithProfile } from "@/types/customer";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomerTableHeaderProps {
  table: Table<CustomerWithProfile>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  onRefresh: () => void;
}

export const CustomerTableHeader = ({
  table,
}: CustomerTableHeaderProps) => {
  const { t, language } = useLanguage();

  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id} colSpan={header.colSpan}>
              {header.isPlaceholder
                ? null
                : header.column.getCanSort() ? (
                    <div
                      className={`flex items-center gap-1 cursor-pointer select-none`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.column.columnDef.header}
                      {{
                        asc: <span className="text-xs">▲</span>,
                        desc: <span className="text-xs">▼</span>,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  ) : (
                    header.column.columnDef.header
                  )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
};
