
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
                <h3 className="font-semibold text-lg">1.2.0</h3>
                <span className="text-sm text-muted-foreground">2025-04-10</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Added version log page</li>
                <li>Improved UI for mobile devices</li>
                <li>Fixed issues with dark mode</li>
              </ul>
            </div>

            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">1.1.0</h3>
                <span className="text-sm text-muted-foreground">2025-03-15</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Added customer management</li>
                <li>Improved deindexing workflow</li>
                <li>Added new notification system</li>
              </ul>
            </div>

            <div className="pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">1.0.0</h3>
                <span className="text-sm text-muted-foreground">2025-02-01</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Initial release</li>
                <li>Basic monitoring features</li>
                <li>User authentication</li>
                <li>Dashboard analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVersionLog;
