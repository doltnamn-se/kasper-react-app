
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPasswordResetTemplate } from "@/utils/emailTemplates";
import { getActivationEmailTemplate } from "@/utils/emailTemplates/activation";
import { Spinner } from "@/components/ui/spinner";

const PasswordTest = () => {
  // Sample data for email templates
  const sampleResetLink = "https://app.doltnamn.se/auth/reset-password?token=sample";
  const samplePassword = "SamplePass123!";
  const sampleDisplayName = "John Doe";

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Email Templates Preview</h1>
        <p className="text-muted-foreground mb-8">
          Preview of all email templates sent to customers
        </p>

        <div className="flex items-center gap-4 mb-4">
          <Spinner size={32} />
          <span className="text-sm text-muted-foreground">Loading preview...</span>
        </div>

        <Tabs defaultValue="reset" className="w-full">
          <TabsList>
            <TabsTrigger value="reset">Password Reset Email</TabsTrigger>
            <TabsTrigger value="welcome">Welcome/Activation Email</TabsTrigger>
          </TabsList>

          <TabsContent value="reset" className="mt-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Password Reset Email</h2>
              <div 
                className="border rounded-md p-4"
                dangerouslySetInnerHTML={{ 
                  __html: getPasswordResetTemplate(sampleResetLink)
                }} 
              />
            </div>
          </TabsContent>

          <TabsContent value="welcome" className="mt-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Welcome/Activation Email</h2>
              <div 
                className="border rounded-md p-4"
                dangerouslySetInnerHTML={{ 
                  __html: getActivationEmailTemplate(sampleDisplayName, samplePassword)
                }} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PasswordTest;
