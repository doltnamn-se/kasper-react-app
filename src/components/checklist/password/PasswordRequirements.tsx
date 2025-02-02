import { useLanguage } from "@/contexts/LanguageContext";
import { PasswordRequirement } from "./PasswordRequirement";

interface PasswordRequirementsProps {
  password: string;
  currentPassword?: string;
  showCurrentPassword?: boolean;
}

export const PasswordRequirements = ({ 
  password, 
  currentPassword = "", 
  showCurrentPassword = false 
}: PasswordRequirementsProps) => {
  const { language } = useLanguage();

  const requirements = [
    {
      id: 1,
      label: language === 'en' ? "At least 8 characters" : "Minst 8 tecken",
      validate: (pass: string) => pass.length >= 8,
    },
    {
      id: 2,
      label: language === 'en' ? "A capital letter" : "Ett versaltecken",
      validate: (pass: string) => /[A-Z]/.test(pass),
    },
    {
      id: 3,
      label: language === 'en' ? "A number or a symbol" : "Ett nummer eller en symbol",
      validate: (pass: string) => /[0-9!@#$%^&*(),.?":{}|<>]/.test(pass),
    },
    ...(showCurrentPassword ? [{
      id: 4,
      label: language === 'en' ? "Different from current password" : "Annorlunda än nuvarande lösenord",
      validate: (pass: string) => {
        if (!currentPassword || !pass) return false;
        return pass !== currentPassword;
      },
    }] : []),
  ];

  return (
    <div className="space-y-2">
      {requirements.map((req) => (
        <PasswordRequirement
          key={req.id}
          isValid={req.validate(password)}
          label={req.label}
        />
      ))}
    </div>
  );
};

export const checkAllRequirements = (
  password: string, 
  currentPassword: string = "", 
  showCurrentPassword: boolean = false
): boolean => {
  const requirements = [
    (pass: string) => pass.length >= 8,
    (pass: string) => /[A-Z]/.test(pass),
    (pass: string) => /[0-9!@#$%^&*(),.?":{}|<>]/.test(pass),
    ...(showCurrentPassword ? [
      (pass: string) => pass !== currentPassword
    ] : [])
  ];

  return requirements.every(req => req(password));
};