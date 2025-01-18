import { CreateCustomerDialog } from "./CreateCustomerDialog";

interface AdminHeaderProps {
  onCustomerCreated: () => void;
}

export const AdminHeader = ({ onCustomerCreated }: AdminHeaderProps) => {
  return (
    <div className="flex justify-end items-center mb-6">
      <CreateCustomerDialog onCustomerCreated={onCustomerCreated} />
    </div>
  );
};