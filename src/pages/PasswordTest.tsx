import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPasswordResetTemplate } from "@/utils/emailTemplates";

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
                  __html: `
                    <!DOCTYPE html>
                    <html style="margin: 0; padding: 0; min-height: 100%; background-color: #f4f4f4;">
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Aktivera ditt konto</title>
                      <style>
                        html {
                          margin: 0;
                          padding: 0;
                          height: 100%;
                          background-color: #f4f4f4;
                        }
                        body {
                          font-family: 'Roboto', sans-serif;
                          line-height: 1.6;
                          color: #333333;
                          margin: 0;
                          padding: 0;
                          min-height: 100%;
                          background-color: #f4f4f4;
                          -webkit-font-smoothing: antialiased;
                          -moz-osx-font-smoothing: grayscale;
                        }
                        .container {
                          max-width: 600px;
                          margin: 0 auto;
                          padding: 40px 20px;
                        }
                        .logo {
                          text-align: center;
                          margin-bottom: 30px;
                        }
                        .logo img {
                          max-width: 150px;
                          height: auto;
                        }
                        .email-wrapper {
                          background-color: #ffffff;
                          border-radius: 8px;
                          padding: 40px;
                          margin: 0;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                          color: #333333;
                          font-size: 24px;
                          margin-bottom: 32px;
                          text-align: center;
                          font-weight: 700;
                        }
                        p {
                          color: #333333;
                          margin-bottom: 20px;
                          font-size: 16px;
                        }
                        .credentials {
                          background-color: #eeeeee;
                          padding: 30px;
                          border-radius: 4px;
                          margin: 20px 0;
                          text-align: center;
                        }
                        .password-label {
                          font-size: 14px;
                          color: #333333;
                          margin-bottom: 10px;
                          font-weight: 500;
                        }
                        .password-value {
                          font-size: 24px;
                          color: #333333;
                          font-weight: 700;
                          letter-spacing: 1px;
                        }
                        .button {
                          display: inline-block;
                          background-color: #000000;
                          color: #ffffff !important;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 4px;
                          margin: 20px 0;
                          font-weight: 500;
                        }
                        .button:hover {
                          background-color: #333333;
                        }
                        .footer {
                          text-align: center;
                          color: #666666;
                          font-size: 12px;
                          margin-top: 30px;
                          padding-top: 20px;
                          border-top: 1px solid #eeeeee;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="logo">
                          <img src="https://app.doltnamn.se/lovable-uploads/doltnamn.se-app-logo-black.svg" alt="Doltnamn Logo">
                        </div>
                        <div class="email-wrapper">
                          <h1>Aktivera ditt konto</h1>
                          <p>
                            Välkommen till Doltnamn.se, <b>${sampleDisplayName}</b>!
                            <br><br>
                            Ditt konto har skapats och du kan nu logga in för att aktivera ditt konto. Du loggar in med din e-postadress samt det lösenord vi genererat åt dig nedan. Du blir ombedd att välja ditt eget lösenord när du loggar in första gången.
                          </p>
                          <div class="credentials">
                            <div class="password-label">Ditt lösenord</div>
                            <div class="password-value">${samplePassword}</div>
                          </div>
                          <div style="text-align: center;">
                            <a href="https://app.doltnamn.se/auth" class="button">Logga in på ditt konto</a>
                          </div>
                          <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} Doltnamn. Alla rättigheter förbehållna.</p>
                          </div>
                        </div>
                      </div>
                    </body>
                    </html>
                  `
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