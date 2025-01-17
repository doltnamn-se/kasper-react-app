import { CreateCustomerDialog } from "./CreateCustomerDialog";

interface AdminHeaderProps {
  onCustomerCreated: () => void;
}

export const AdminHeader = ({ onCustomerCreated }: AdminHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-[#000000] dark:text-gray-300">Admin Dashboard</h1>
      <CreateCustomerDialog onCustomerCreated={onCustomerCreated} />
    </div>
  );
};