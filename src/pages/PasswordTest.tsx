import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

const PasswordTest = () => {
  const [password, setPassword] = useState("");

  const requirements = [
    {
      id: 1,
      label: "At least 8 characters long",
      validate: (pass: string) => pass.length >= 8,
    },
    {
      id: 2,
      label: "Contains at least one uppercase letter",
      validate: (pass: string) => /[A-Z]/.test(pass),
    },
    {
      id: 3,
      label: "Contains at least one lowercase letter",
      validate: (pass: string) => /[a-z]/.test(pass),
    },
    {
      id: 4,
      label: "Contains at least one number",
      validate: (pass: string) => /[0-9]/.test(pass),
    },
    {
      id: 5,
      label: "Contains at least one special character",
      validate: (pass: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Password Requirements Test</h1>
        
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
          />

          <div className="space-y-2">
            {requirements.map((req) => {
              const isValid = req.validate(password);
              return (
                <div
                  key={req.id}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    isValid ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  {isValid ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span>{req.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordTest;