
import { passwordResetStyles } from './styles';

export const getPasswordResetTemplate = (resetLink: string) => {
  return `
<!DOCTYPE html>
<html style="margin: 0; padding: 0; min-height: 100%; background-color: #f4f4f4 !important;">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Återställ ditt lösenord – Digitaltskydd.se</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    ${passwordResetStyles}
  </style>
</head>
<body style="background-color: #f4f4f4 !important; margin: 0; padding: 0; min-height: 100%;">
  <div class="container">
    <div class="logo">
      <img src="https://app.digitaltskydd.se/lovable-uploads/digitaltskydd.se-logo-email-dark.png" alt="Digitaltskydd Logo" style="margin: 0 auto; display: block; max-width: 150px; height: auto;">
    </div>
    <div class="email-wrapper">
      <p>
        Klicka på knappen nedan för att återställa ditt lösenord. Om du inte har begärt att återställa ditt lösenord kan du ignorera detta mail.
      </p>
      <div style="text-align: center; margin-bottom: 40px;">
        <a href="${resetLink}" class="button">Återställ lösenord</a>
      </div>
      <p style="text-align: left;">
        Om du har några frågor, maila oss på <a href="mailto:support@digitaltskydd.se" class="email-link">support@digitaltskydd.se</a>.
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
};

