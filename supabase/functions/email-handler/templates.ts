const sharedStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    background-color: #f6f6f4;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .email-wrapper {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 40px;
    margin: 20px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .logo {
    text-align: center;
    margin-bottom: 30px;
  }
  .logo img {
    max-width: 150px;
    height: auto;
  }
  h1 {
    color: #161618;
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
  }
  p {
    color: #4a4a4a;
    margin-bottom: 20px;
  }
  .button {
    display: inline-block;
    background-color: #000000;
    color: #ffffff;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 4px;
    margin: 20px 0;
  }
  .button:hover {
    background-color: #333333;
  }
  .footer {
    text-align: center;
    color: #666666;
    font-size: 12px;
    margin-top: 30px;
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
    color: #121212;
    margin-bottom: 10px;
    font-weight: 500;
  }
  .password-value {
    font-size: 24px;
    color: #121212;
    font-weight: 700;
    letter-spacing: 1px;
  }
  @media only screen and (max-width: 480px) {
    .container {
      padding: 10px;
    }
    .email-wrapper {
      padding: 20px;
    }
  }
`;

export const getPasswordResetTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    ${sharedStyles}
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="logo">
        <img src="https://app.joinkasper.com/lovable-uploads/kasper-wp-logo.png" alt="Kasper Logo">
      </div>
      <h1>Återställ ditt lösenord</h1>
      <p>Hej,</p>
      <p>Vi har fått en begäran om att återställa lösenordet för ditt Kasper-konto. Klicka på knappen nedan för att återställa det:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Återställ lösenord</a>
      </div>
      <p>Om du inte begärde detta kan du ignorera detta e-postmeddelande. Länken kommer att upphöra inom 24 timmar.</p>
      <p>Av säkerhetsskäl rekommenderar vi att du kopierar och klistrar in denna länk om knappen inte fungerar:</p>
      <p style="word-break: break-all; font-size: 12px; color: #666666;">${resetLink}</p>
      <p>Om du har några frågor, maila oss på <a href="mailto:support@joinkasper.com" style="color: #333333; text-decoration: underline;">support@joinkasper.com</a>.</p>
      <div class="footer">
        <p>Skickat från teamet på <a href="https://joinkasper.com/" style="color: #666666; text-decoration: underline;">Kasper</a></p>
        <p>&copy; ${new Date().getFullYear()} Kasper. Alla rättigheter förbehållna.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const getActivationEmailTemplate = (displayName: string, password: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aktivera ditt konto</title>
  <style>
    ${sharedStyles}
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="logo">
        <img src="https://app.joinkasper.com/lovable-uploads/kasper-wp-logo.png" alt="Kasper Logo">
      </div>
      <h1>Aktivera ditt konto</h1>
      <p>Välkommen ${displayName || ''}! 👋</p>
      <p>Ditt konto har skapats och du kan nu logga in för att aktivera ditt konto. Du loggar in med din e-postadress samt det lösenord vi genererat åt dig nedan.</p>
      <div class="credentials">
        <div class="password-label">Ditt lösenord</div>
        <div class="password-value">${password}</div>
      </div>
      <div style="text-align: center;">
        <a href="https://app.joinkasper.com/auth" class="button">Aktivera ditt konto</a>
      </div>
      <p>Om du har några frågor eller behöver hjälp med att komma igång, maila oss på <a href="mailto:support@joinkasper.com" style="color: #333333; text-decoration: underline;">support@joinkasper.com</a>. Vi är glada att ha dig ombord!</p>
      <div class="footer">
        <p>Skickat från teamet på <a href="https://joinkasper.com/" style="color: #666666; text-decoration: underline;">Kasper</a></p>
        <p>&copy; ${new Date().getFullYear()} Kasper. Alla rättigheter förbehållna.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const getWelcomeTemplate = (firstName: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Välkommen till Kasper</title>
  <style>
    ${sharedStyles}
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="logo">
        <img src="https://app.joinkasper.com/lovable-uploads/kasper-wp-logo.png" alt="Kasper Logo">
      </div>
      <h1>Välkommen till Kasper!</h1>
      <p>Hej ${firstName || ''},</p>
      <p>Välkommen till Kasper! Vi är glada att ha dig ombord.</p>
      <p>För att komma igång, klicka på knappen nedan för att komma åt ditt konto:</p>
      <div style="text-align: center;">
        <a href="${resetLink || 'https://app.joinkasper.com/auth'}" class="button">Kom igång</a>
      </div>
      <p>Om du har några frågor eller behöver hjälp med att komma igång, maila oss på <a href="mailto:support@joinkasper.com" style="color: #333333; text-decoration: underline;">support@joinkasper.com</a>. Vi är glada att ha dig ombord!</p>
      <div class="footer">
        <p>Skickat från teamet på <a href="https://joinkasper.com/" style="color: #666666; text-decoration: underline;">Kasper</a></p>
        <p>&copy; ${new Date().getFullYear()} Kasper. Alla rättigheter förbehållna.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const getTestEmailTemplate = () => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test från Kasper</title>
  <style>
    ${sharedStyles}
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="logo">
        <img src="https://app.joinkasper.com/lovable-uploads/kasper-wp-logo.png" alt="Kasper Logo">
      </div>
      <h1>Test Email</h1>
      <p>Detta är ett test-email från Kasper.</p>
      <p>Om du får detta meddelande fungerar email-systemet korrekt.</p>
      <div style="text-align: center;">
        <a href="https://app.joinkasper.com/auth" class="button">Gå till Kasper</a>
      </div>
      <p>Om du har några frågor, maila oss på <a href="mailto:support@joinkasper.com" style="color: #333333; text-decoration: underline;">support@joinkasper.com</a>.</p>
      <div class="footer">
        <p>Skickat från teamet på <a href="https://joinkasper.com/" style="color: #666666; text-decoration: underline;">Kasper</a></p>
        <p>&copy; ${new Date().getFullYear()} Kasper. Alla rättigheter förbehållna.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;