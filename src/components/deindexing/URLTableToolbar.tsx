
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface URLTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  onRefresh: () => void;
  onBulkStatusUpdate?: () => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

export const URLTableToolbar = <TData,>({
  table,
  globalFilter,
  setGlobalFilter,
  onRefresh,
  onBulkStatusUpdate,
  statusFilter,
  setStatusFilter,
}: URLTableToolbarProps<TData>) => {
  const { t, language } = useLanguage();
  const isMobile = useBreakpoint('(max-width: 767px)');

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received':
        return 'Mottagna';
      case 'case_started':
        return 'Ärende påbörjat';
      case 'request_submitted':
        return 'Begäran inskickad';
      case 'removal_approved':
        return 'Borttagning godkänd';
      default:
        return status;
    }
  };

  const statusOptions = [
    { value: '', label: 'Alla statusar' },
    { value: 'received', label: 'Mottagna' },
    { value: 'case_started', label: 'Ärende påbörjat' },
    { value: 'request_submitted', label: 'Begäran inskickad' },
    { value: 'removal_approved', label: 'Borttagning godkänd' },
  ];

  return (
    <div className="flex items-center gap-4 py-2 px-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 [&.lucide]:h-3.5 [&.lucide]:w-3.5 text-[#777777] dark:text-[#898989]" />
        <Input
          placeholder={t('search.global')}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="
            w-[275px] text-xs border-[#c7c7c7] rounded-[0.375rem] placeholder-[#777777] text-[#000000] h-8 pl-8 pr-[0.625rem] focus:placeholder-[#777777]
            dark:bg-[#212121] dark:border-[#393939] dark:placeholder-[#898989] dark:text-[#FFFFFF]
          "
        />
      </div>
      {!isMobile && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="
                  text-xs font-medium border-dashed flex items-center gap-2 text-[#000000] border-[#d4d4d4] hover:text-[#000000] hover:bg-background/80 hover:border-[#8f8f8f]
                  dark:text-[#FFFFFF] dark:border-[#363636] dark:hover:text-[#FFFFFF] dark:hover:border-[#454545] dark:hover:bg-transparent
                  border border-[1px] h-8 rounded-[0.375rem] px-[0.625rem]
                "
              >
                {statusFilter ? getStatusLabel(statusFilter) : 'Filtrera status'}
                <ChevronDown className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="text-xs bg-white dark:bg-[#212121] border-[#d4d4d4] dark:border-[#363636] z-50"
            >
              <DropdownMenuLabel className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
                Filtrera efter status
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#e8e8e8] dark:bg-[#333333]" />
              {statusOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF] bg-white dark:bg-[#212121] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] [&>span]:flex [&>span]:items-center [&>span]:justify-center [&>span]:h-4 [&>span]:w-4 [&>span]:shrink-0 [&>span]:rounded-[4px] [&>span]:border [&>span]:border-[#c7c7c7] [&>span]:bg-[#f3f3f340] [&>span]:data-[state=checked]:border-[#000000] [&>span]:data-[state=checked]:bg-[#000000] dark:[&>span]:border-[#393939] dark:[&>span]:bg-[#24242440] dark:[&>span]:data-[state=checked]:border-[#FFFFFF] dark:[&>span]:data-[state=checked]:bg-[#FFFFFF] [&>span_svg]:h-3 [&>span_svg]:w-3 [&>span_svg]:stroke-[#FFFFFF] dark:[&>span_svg]:stroke-[#000000] [&>span_svg]:stroke-[3px]"
                  checked={statusFilter === option.value}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter(option.value);
                    } else if (statusFilter === option.value) {
                      setStatusFilter('');
                    }
                  }}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={onRefresh}
            className="
              text-xs font-medium border flex items-center gap-2 text-[#000000] border-[#d4d4d4] hover:text-[#000000] hover:bg-background/80 hover:border-[#8f8f8f]
              dark:text-[#FFFFFF] dark:border-[#363636] dark:hover:text-[#FFFFFF] dark:hover:border-[#454545] dark:hover:bg-transparent
              h-8 rounded-[0.375rem] px-[0.625rem]
            "
          >
            <RefreshCw className="[&.lucide]:h-3.5 [&.lucide]:w-3.5 text-[#000000A6] dark:text-[#FFFFFFA6]" />
            {language === 'sv' ? 'Uppdatera' : 'Refresh'}
          </Button>
        </>
      )}
      {!isMobile && onBulkStatusUpdate && (
        <Button
          variant="outline"
          onClick={onBulkStatusUpdate}
          className="
            text-xs font-medium border flex items-center gap-2 text-[#000000] border-[#d4d4d4] hover:text-[#000000] hover:bg-background/80 hover:border-[#8f8f8f]
            dark:text-[#FFFFFF] dark:border-[#363636] dark:hover:text-[#FFFFFF] dark:hover:border-[#454545] dark:hover:bg-transparent
            h-8 rounded-[0.375rem] px-[0.625rem]
          "
        >
          {language === 'sv' ? 'Uppdatera till "Begäran inskickad"' : 'Update to "Request Submitted"'}
        </Button>
      )}
    </div>
  );
};
