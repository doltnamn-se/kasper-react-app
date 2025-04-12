
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminVersionLog = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('nav.admin.version.log')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('nav.admin.version.log')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">2.1.0</h3>
                <span className="text-sm text-muted-foreground">2025-04-12</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Added version log for tracking application changes</li>
                <li>Improved mobile responsiveness across admin dashboard</li>
                <li>Added Swedish translations for new features</li>
                <li>Fixed dark mode toggle issues on Safari</li>
              </ul>
            </div>

            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">2.0.1</h3>
                <span className="text-sm text-muted-foreground">2025-03-28</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Fixed customer data loading issue in admin panel</li>
                <li>Improved error handling for deindexing requests</li>
                <li>Updated dependencies to address security vulnerabilities</li>
              </ul>
            </div>

            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">2.0.0</h3>
                <span className="text-sm text-muted-foreground">2025-03-15</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Complete UI redesign using Tailwind CSS</li>
                <li>New admin dashboard with enhanced customer management</li>
                <li>Improved deindexing workflow with status tracking</li>
                <li>Added real-time notifications system</li>
                <li>Enhanced address monitoring capabilities</li>
              </ul>
            </div>

            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">1.5.2</h3>
                <span className="text-sm text-muted-foreground">2025-02-20</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Performance optimizations for large customer datasets</li>
                <li>Added address history tracking</li>
                <li>Improved authentication flow and password reset</li>
              </ul>
            </div>

            <div className="pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">1.0.0</h3>
                <span className="text-sm text-muted-foreground">2025-01-15</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Initial production release</li>
                <li>Basic monitoring and deindexing features</li>
                <li>User authentication and account management</li>
                <li>Customer onboarding workflow</li>
                <li>Swedish and English language support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVersionLog;
