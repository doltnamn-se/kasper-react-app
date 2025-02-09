
import { FilterFn } from "@tanstack/react-table";
import { CustomerWithProfile } from "@/types/customer";

export const textFilterFn: FilterFn<CustomerWithProfile> = (row, columnId, value: string) => {
  const searchText = value.toLowerCase();
  const customer = row.original;
  const displayName = customer.profile?.display_name?.toLowerCase() || '';
  const email = customer.profile?.email?.toLowerCase() || '';
  
  return displayName.includes(searchText) || email.includes(searchText);
};

