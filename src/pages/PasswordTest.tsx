import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, RectangleEllipsis } from "lucide-react";

const PasswordTest = () => {
  const [password, setPassword] = useState("");

  const requirements = [
    {
      id: 1,
      label: "At least 12 characters / Minst 12 tecken",
      validate: (pass: string) => pass.length >= 12,
    },
    {
      id: 2,
      label: "A lowercase character / Ett gemener-tecken",
      validate: (pass: string) => /[a-z]/.test(pass),
    },
    {
      id: 3,
      label: "A capital letter / Ett versaltecken",
      validate: (pass: string) => /[A-Z]/.test(pass),
    },
    {
      id: 4,
      label: "A number or a symbol / Ett nummer eller en symbol",
      validate: (pass: string) => /[0-9!@#$%^&*(),.?":{}|<>]/.test(pass),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Password Requirements Test</h1>
        
        <div className="space-y-4">
          <div className="relative">
            <RectangleEllipsis className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-0 border-b border-input rounded-none pl-7 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-2">
            {requirements.map((req) => {
              const isValid = req.validate(password);
              return (
                <div
                  key={req.id}
                  className="flex items-center gap-2"
                >
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 ${
                    isValid 
                      ? "border-[#00bda5] bg-[#00bda5]" 
                      : "border-[#e0e0e0] bg-white"
                  }`}>
                    {isValid && (
                      <Check className="h-3 w-3 text-white stroke-[4]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#000000A6]">
                    {req.label}
                  </span>
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