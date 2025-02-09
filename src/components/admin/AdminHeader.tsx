
import { Button } from "@/components/ui/button";
import { UserRoundPlus } from "lucide-react";
import { CreateCustomerDialog } from "./CreateCustomerDialog";

interface AdminHeaderProps {
  onCustomerCreated: () => void;
}

export const AdminHeader = ({ onCustomerCreated }: AdminHeaderProps) => {
  return (
    <div className="flex justify-end items-center mb-6">
      <CreateCustomerDialog onCustomerCreated={onCustomerCreated}>
        <Button 
          className="
            text-[#000000] bg-[#72e3ad] border-[#16b674bf] hover:bg-[#3fcf8ecc] hover:border-[#097c4f]
            dark:text-white dark:bg-[#3ecf8e80] dark:border-[#3ecf8e] dark:hover:bg-[#3ecf8e80] dark:hover:border-[#3ecf8e]
            border flex items-center gap-2 py-[0.25rem] px-[0.625rem]
          "
        >
          <UserRoundPlus className="h-4 w-4 text-[#097c4f] dark:text-[#85e0ba]" />
          Add Customer
        </Button>
      </CreateCustomerDialog>
    </div>
  );
};
