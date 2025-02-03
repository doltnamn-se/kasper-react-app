export const getActivationEmailTemplate = (displayName: string, password: string) => {
  // Get first name by splitting on space and taking first part
  const firstName = displayName.split(' ')[0];

  return `
<!DOCTYPE html>
<html style="margin: 0; padding: 0; min-height: 100%; background-color: #f4f4f4 !important;">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Välkommen till Doltnamn! Här är dina inloggningsuppgifter för att komma igång.">
  <title>Välkommen till Doltnamn.se – Aktivera ditt konto</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      background-color: #f4f4f4 !important;
    }
    body {
      font-family: 'Roboto', sans-serif;
      line-height: 1.6;
      color: #333333;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px 20px;
      background-color: #f4f4f4 !important;
    }
    .logo {
      text-align: center;
      margin-bottom: 15px;
      width: 100%;
      background-color: #f4f4f4 !important;
    }
    .logo img {
      max-width: 150px;
      height: auto;
      margin: 0 auto;
      display: block;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      margin: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    .email-link {
      color: #333333;
      text-decoration: underline;
    }
  </style>
</head>
<body style="background-color: #f4f4f4 !important; margin: 0; padding: 0; min-height: 100%;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    Välkommen till Doltnamn! Här är dina inloggningsuppgifter för att komma igång.
    <!-- Add padding to prevent email clients from pulling other text into the preview -->
    &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
  </div>
  <div class="container">
    <div class="logo">
      <img src="https://app.doltnamn.se/lovable-uploads/doltnamn.se-logo-email-black.png" alt="Doltnamn Logo" style="margin: 0 auto; display: block;">
    </div>
    <div class="email-wrapper">
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
        <a href="https://app.doltnamn.se/auth" class="button">Aktivera ditt konto</a>
      </div>
      <p style="text-align: left;">
        Om du har några frågor eller behöver hjälp med att komma igång, maila
        oss på <a href="mailto:support@doltnamn.se" class="email-link">support@doltnamn.se</a>. Vi är glada att ha dig ombord!
      </p>
    </div>
  </div>
  <p style="text-align: center; color: #666666; font-size: 11px; margin-top: 15px; margin-bottom: 10px;">
    Skickat från teamet på <a href="https://doltnamn.se/" style="color: #666666; text-decoration: underline;">Doltnamn.se</a>
  </p>
  <p style="text-align: center; color: #666666; font-size: 11px; margin-top: 0; padding-bottom: 20px;">
    &copy; ${new Date().getFullYear()} Doltnamn. Alla rättigheter förbehållna.
  </p>
</body>
</html>
`;
};
