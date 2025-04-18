
import { useLanguage } from "@/contexts/LanguageContext";
import { URLTableRow } from "./URLTableRow";
import { URLTableToolbar } from "./URLTableToolbar";
import { useState } from "react";
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    {
      id: "url",
      accessorKey: "url",
      header: t('deindexing.url'),
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
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleRefresh = () => {
    console.log("Refresh clicked");
  };

  return (
    <div className="space-y-4">
      <div className="border border-[#dfdfdf] dark:border-[#2e2e2e]">
        <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
          <div className="bg-[#f3f3f3] dark:bg-[#212121] p-4">
            <URLTableToolbar
              table={table}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              onRefresh={handleRefresh}
            />
          </div>
          <div className="divide-y divide-[#dfdfdf] dark:divide-[#2e2e2e]">
            {table.getFilteredRowModel().rows.map((row) => (
              <div key={row.original.id} className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[#000000A6] dark:text-[#FFFFFFA6] text-xs md:text-sm font-medium mb-2">
                      {t('deindexing.url')}
                    </div>
                    <a 
                      href={row.original.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs md:text-sm text-[#000000A6] dark:text-[#FFFFFFA6] hover:text-[#000000] dark:hover:text-white break-all block"
                    >
                      {row.original.url}
                    </a>
                  </div>
                  <div>
                    <div className="text-[#000000A6] dark:text-[#FFFFFFA6] text-xs md:text-sm font-medium mb-2">
                      {t('deindexing.status')}
                    </div>
                    <URLTableRow
                      url={row.original}
                      onStatusChange={onStatusChange}
                      onDelete={onDelete}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
