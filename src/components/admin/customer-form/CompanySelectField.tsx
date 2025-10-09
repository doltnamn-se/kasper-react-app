import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCompanies } from "@/components/admin/companies/useCompanies";

interface CompanySelectFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export const CompanySelectField = ({ value, onChange }: CompanySelectFieldProps) => {
  const { language } = useLanguage();
  const { companies, isLoading } = useCompanies();
  
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor="company">
        {language === 'sv' ? 'Företag' : 'Company'}
      </Label>
      <Select
        value={value || "none"}
        onValueChange={(val) => onChange(val === "none" ? null : val)}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={language === 'sv' ? 'Välj företag' : 'Select company'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            {language === 'sv' ? 'Inget företag' : 'No company'}
          </SelectItem>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
