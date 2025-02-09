
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface URLTableToolbarProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  onRefresh: () => void;
}

export const URLTableToolbar = ({
  globalFilter,
  setGlobalFilter,
  onRefresh,
}: URLTableToolbarProps) => {
  const { t, language } = useLanguage();

  return (
    <div className="flex items-center gap-4 py-2 px-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 [&.lucide]:h-3.5 [&.lucide]:w-3.5 text-[#777777] dark:text-[#898989]" />
        <Input
          placeholder={t('search.urls.placeholder')}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="
            w-[275px] text-xs border-[#c7c7c7] rounded-[0.375rem] placeholder-[#777777] text-[#000000] h-8 pl-8 pr-[0.625rem] focus:placeholder-[#777777]
            dark:bg-[#212121] dark:border-[#393939] dark:placeholder-[#898989] dark:text-[#FFFFFF]
          "
        />
      </div>
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
    </div>
  );
};
