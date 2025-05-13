
import React from "react";
import { Table } from "@tanstack/react-table";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface TablePaginationProps<TData> {
  table: Table<TData>;
}

export function TablePagination<TData>({ table }: TablePaginationProps<TData>) {
  const { t } = useLanguage();
  const isMobile = useBreakpoint('(max-width: 767px)');
  const pageSize = table.getState().pagination.pageSize;

  return (
    <div className="flex items-center justify-between px-2 text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <p>
            {isMobile ? (
              <>
                {table.getState().pagination.pageIndex + 1} {t('pagination.of')}{' '}
                {table.getPageCount() || 1}
              </>
            ) : (
              <>
                {t('pagination.page')} {table.getState().pagination.pageIndex + 1} {t('pagination.of')}{' '}
                {table.getPageCount() || 1} {t('pagination.pages')}
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
  );
}
