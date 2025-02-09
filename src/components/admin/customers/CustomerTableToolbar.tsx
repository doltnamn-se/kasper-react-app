
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, UserRoundPlus, ChevronDown } from "lucide-react";
import { CustomerWithProfile } from "@/types/customer";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomerTableToolbarProps {
  table: Table<CustomerWithProfile>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

export const CustomerTableToolbar = ({
  table,
  globalFilter,
  setGlobalFilter,
}: CustomerTableToolbarProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-4 py-2 px-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777777] dark:text-[#898989]" />
        <Input
          placeholder={t('search.placeholder')}
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="
            max-w-sm text-xs border-[#c7c7c7] rounded-[0.375rem] placeholder-[#777777] text-[#000000] h-8 pl-8 pr-[0.625rem] focus:placeholder-[#777777]
            dark:bg-[#212121] dark:border-[#393939] dark:placeholder-[#898989] dark:text-[#FFFFFF]
          "
        />
      </div>
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
            {t('view.all.columns')}
            <ChevronDown className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('toggle.columns')}</DropdownMenuLabel>
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id === 'profile.display_name' ? t('name') :
                   column.id === 'profile.email' ? t('email') :
                   column.id === 'checklist_completed' ? t('checklist') :
                   column.id === 'online_status' ? t('last.online') :
                   column.id === 'subscription_plan' ? t('plan') :
                   column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex-1" />
      <CreateCustomerDialog onCustomerCreated={() => table.resetRowSelection()}>
        <Button 
          className="
            text-[#000000] bg-[#72e3ad] border-[#16b674bf] hover:bg-[#3fcf8ecc] hover:border-[#097c4f]
            dark:text-white dark:bg-[#006239] dark:border-[#3ecf8e4d] dark:hover:bg-[#3ecf8e80] dark:hover:border-[#3ecf8e]
            border flex items-center gap-2 text-xs rounded-md h-8 px-[0.625rem]
          "
        >
          <UserRoundPlus className="h-4 w-4 text-[#097c4f] dark:text-[#85e0ba]" />
          {t('add.customer')}
        </Button>
      </CreateCustomerDialog>
    </div>
  );
};
