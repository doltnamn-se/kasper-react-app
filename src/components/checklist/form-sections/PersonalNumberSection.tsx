import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface PersonalNumberSectionProps {
  register: UseFormRegister<any>;
  errors: any;
}

export const PersonalNumberSection = ({ register, errors }: PersonalNumberSectionProps) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {language === 'sv' ? 'Personnummer' : 'Personal Number'}
      </h3>
      <div>
        <Input
          {...register("personalNumber", {
            pattern: {
              value: /^\d{8}-\d{4}$/,
              message: language === 'sv' 
                ? 'Personnummer måste vara i formatet ÅÅÅÅMMDD-XXXX' 
                : 'Personal number must be in the format YYYYMMDD-XXXX'
            }
          })}
          placeholder={language === 'sv' ? 'ÅÅÅÅMMDD-XXXX' : 'YYYYMMDD-XXXX'}
          className={errors.personalNumber ? "border-red-500" : ""}
        />
        {errors.personalNumber && (
          <p className="text-red-500 text-sm mt-1">
            {errors.personalNumber.message}
          </p>
        )}
      </div>
    </div>
  );
};