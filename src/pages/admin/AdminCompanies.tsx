import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { CompaniesTable } from "@/components/admin/companies/CompaniesTable";
import { useCompanies } from "@/components/admin/companies/useCompanies";
import { CreateCompanyDialog } from "@/components/admin/CreateCompanyDialog";

const AdminCompanies = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.title = "Admin | Företag | Kasper";
  }, []);

  const { companies, isLoading, fetchCompanies } = useCompanies();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>
          {language === 'sv' ? 'Företag' : 'Companies'}
        </h1>
        
        <CreateCompanyDialog onCompanyCreated={fetchCompanies}>
          <Button 
            className="
              text-[#000000] bg-[#72e3ad] border-[#16b674bf] hover:bg-[#3fcf8ecc] hover:border-[#097c4f]
              dark:text-white dark:bg-[#006239] dark:border-[#3ecf8e4d] dark:hover:bg-[#3ecf8e80] dark:hover:border-[#3ecf8e]
              border flex items-center gap-2 text-xs rounded-md h-8 px-[0.625rem]
            "
          >
            <Building2 className="[&.lucide]:h-3.5 [&.lucide]:w-3.5 text-[#097c4f] dark:text-[#85e0ba]" />
            {language === 'sv' ? 'Lägg till företag' : 'Add Company'}
          </Button>
        </CreateCompanyDialog>
      </div>

      <div className="shadow-sm transition-colors duration-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : companies.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">
            {language === 'sv' ? 'Inga företag hittades.' : 'No companies found.'}
          </p>
        ) : (
          <CompaniesTable 
            companies={companies}
            onRefresh={fetchCompanies}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCompanies;
