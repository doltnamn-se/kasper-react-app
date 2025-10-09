import { Company } from "./useCompanies";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CompaniesTableProps {
  companies: Company[];
  onRefresh: () => void;
}

export const CompaniesTable = ({ companies, onRefresh }: CompaniesTableProps) => {
  const { language } = useLanguage();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${language === 'sv' ? 'Ta bort' : 'Delete'} ${name}?`)) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(language === 'sv' ? 'Företag borttaget' : 'Company deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error(language === 'sv' ? 'Kunde inte ta bort företag' : 'Failed to delete company');
    }
  };

  return (
    <div className="rounded-md border border-[#e5e7eb] dark:border-[#232325] bg-white dark:bg-[#1c1c1e]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-[#e5e7eb] dark:border-[#232325]">
            <TableHead className="text-[#000000A6] dark:text-[#FFFFFFA6]">
              {language === 'sv' ? 'Företagsnamn' : 'Company Name'}
            </TableHead>
            <TableHead className="text-[#000000A6] dark:text-[#FFFFFFA6]">
              {language === 'sv' ? 'Organisationsnummer' : 'Org Number'}
            </TableHead>
            <TableHead className="text-[#000000A6] dark:text-[#FFFFFFA6]">
              {language === 'sv' ? 'Kontakt' : 'Contact'}
            </TableHead>
            <TableHead className="text-[#000000A6] dark:text-[#FFFFFFA6]">
              {language === 'sv' ? 'Skapad' : 'Created'}
            </TableHead>
            <TableHead className="text-right text-[#000000A6] dark:text-[#FFFFFFA6]">
              {language === 'sv' ? 'Åtgärder' : 'Actions'}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow 
              key={company.id}
              className="border-[#e5e7eb] dark:border-[#232325]"
            >
              <TableCell className="font-medium text-[#000000] dark:text-[#FFFFFF]">
                {company.name}
              </TableCell>
              <TableCell className="text-[#000000A6] dark:text-[#FFFFFFA6]">
                {company.organization_number || '-'}
              </TableCell>
              <TableCell className="text-[#000000A6] dark:text-[#FFFFFFA6]">
                {company.contact_email || '-'}
              </TableCell>
              <TableCell className="text-[#000000A6] dark:text-[#FFFFFFA6]">
                {format(new Date(company.created_at), 'yyyy-MM-dd')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(company.id, company.name)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
