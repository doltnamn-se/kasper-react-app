
import { Button } from "@/components/ui/button";
import { UserRoundPlus } from "lucide-react";
import { CreateCustomerDialog } from "./CreateCustomerDialog";
import { ReactNode } from "react";

interface AdminHeaderProps {
  onCustomerCreated: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
}

export const AdminHeader = ({ onCustomerCreated, title, description, children }: AdminHeaderProps) => {
  return (
    <div className="mb-6">
      {(title || description) && (
        <div className="mb-4">
          {title && <h1 className="text-2xl font-bold text-black dark:text-white">{title}</h1>}
          {description && <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        {children}
        
        <CreateCustomerDialog onCustomerCreated={onCustomerCreated}>
          <Button 
            className="
              text-[#000000] bg-[#72e3ad] border-[#16b674bf] hover:bg-[#3fcf8ecc] hover:border-[#097c4f]
              dark:text-white dark:bg-[#3ecf8e80] dark:border-[#3ecf8e] dark:hover:bg-[#3ecf8e80] dark:hover:border-[#3ecf8e]
              border flex items-center gap-2
            "
          >
            <UserRoundPlus className="h-4 w-4 text-[#16b674bf] dark:text-[#3ecf8e]" />
            Add Customer
          </Button>
        </CreateCustomerDialog>
      </div>
    </div>
  );
};
