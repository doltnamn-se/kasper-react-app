import { activationEmailStyles } from './styles';

export const getActivationEmailTemplate = (displayName: string, password: string) => {
  const firstName = displayName.split(' ')[0];

  return `
<!DOCTYPE html>
<html style="margin: 0; padding: 0; min-height: 100%; background-color: #f4f4f4 !important;">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aktivera ditt konto</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    ${activationEmailStyles}
  </style>
</head>
<body style="background-color: #f4f4f4 !important; margin: 0; padding: 0; min-height: 100%;">
  <div class="container">
    <div class="logo">
      <img src="https://app.digitaltskydd.se/lovable-uploads/digitaltskydd.se-app-logo-dark-full-png.png" alt="Digitaltskydd Logo" style="margin: 0 auto; display: block; max-width: 150px; height: auto;">
    </div>
    <div class="email-wrapper">
      <h1 style="font-size: 24px; margin-bottom: 20px; text-align: center;">Aktivera ditt konto</h1>
      <p>
        Välkommen ${firstName} 👋
        <br><br>
        Ditt konto har skapats och du kan nu logga in för att aktivera ditt konto. Du loggar in med din e-postadress samt det lösenord vi genererat åt dig nedan.
      </p>
      <div class="credentials">
        <div class="password-label">Ditt lösenord</div>
        <div class="password-value">${password}</div>
      </div>
      <div style="text-align: center; margin-bottom: 40px;">
        <a href="https://app.digitaltskydd.se/auth" class="button">Aktivera ditt konto</a>
      </div>
      <p style="text-align: left;">
        Om du har några frågor eller behöver hjälp med att komma igång, maila
        oss på <a href="mailto:support@digitaltskydd.se" class="email-link">support@digitaltskydd.se</a>. Vi är glada att ha dig ombord!
      </p>
    </div>
  </div>
  <p style="text-align: center; color: #666666; font-size: 11px; margin-top: 15px; margin-bottom: 10px;">
    Skickat från teamet på <a href="https://digitaltskydd.se/" style="color: #666666; text-decoration: underline;">Digitaltskydd.se</a>
  </p>
  <p style="text-align: center; color: #666666; font-size: 11px; margin-top: 0; padding-bottom: 20px;">
    &copy; ${new Date().getFullYear()} Digitaltskydd. Alla rättigheter förbehållna.
  </p>
</body>
</html>
`;
