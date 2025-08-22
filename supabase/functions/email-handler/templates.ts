// ============= PRODUCTION EMAIL TEMPLATES - DO NOT AUTO-OVERRIDE =============
// These templates contain manually customized Kasper branding and Swedish text
// Any automated changes should preserve the wave emoji and improved messaging
// =============================================================================

import { sharedEmailStyles } from "../_shared/styles.ts";

export function getActivationEmailTemplate(displayName: string, password: string): string {
  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aktivera ditt konto</title>
      <style>
        ${sharedEmailStyles}
      </style>
    </head>
<body style="background-color: #fafafa !important; margin: 0; padding: 0; min-height: 100%;">
    <div style="display: none; max-height: 0; overflow: hidden;">
        Hej ${displayName} 👋
        <br><br>
        Ditt konto har skapats och du kan nu logga in för att aktivera ditt konto.ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
    </div>
      <div class="container">
    <div class="logo">
      <img src="https://app.joinkasper.com/lovable-uploads/kasper-wp-logo.png" alt="Kasper Logo" style="margin: 0 auto; display: block; max-width: 100px; height: auto;">
    </div>
        <div class="email-wrapper">
            <h1 style="font-size: 20px; color: #121212; margin-bottom: 20px; text-align: center;">Aktivera ditt konto</h1>
            <p>
                Hej ${displayName} 👋
                <br><br>
                Ditt konto har skapats och du kan nu logga in för att aktivera ditt konto. Du loggar in med din e-postadress samt det lösenord vi genererat åt dig nedan.
            </p>
            <div class="credentials">
                <div class="password-label">Ditt lösenord</div>
                <div class="password-value">${password}</div>
            </div>
            <div style="text-align: center; margin-bottom: 40px;">
                <a href="https://app.joinkasper.com/auth" class="button">Aktivera ditt konto</a>
            </div>
            <p style="text-align: left;">
                Om du har några frågor eller behöver hjälp med att komma igång, maila
                oss på <a href="mailto:support@joinkasper.com" class="email-link">support@joinkasper.com</a>. Vi är glada att ha dig ombord!
            </p>
        </div>
    </div>
    <p style="text-align: center; color: #707070; font-size: 11px; margin-top: 15px; margin-bottom: 10px;">
        Skickat från teamet på <a href="https://joinkasper.com/" style="color: #707070; text-decoration: underline;">Kasper®</a>
    </p>
    <p style="text-align: center; color: #707070; font-size: 11px; margin-top: 0; padding-bottom: 20px;">
        &copy; 2025 Kasper®. Alla rättigheter förbehållna.
    </p>
</body>
    </html>
  `;
}

export function getPasswordResetTemplate(resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Återställ ditt lösenord - Kasper</title>
      <style>
        ${sharedEmailStyles}
      </style>
    </head>
    <body style="background-color: #fafafa !important; margin: 0; padding: 0; min-height: 100%;">
      <div class="container">
        <div class="logo">
          <img src="https://app.joinkasper.com/lovable-uploads/kasper-wp-logo.png" alt="Kasper Logo" style="margin: 0 auto; display: block; max-width: 100px; height: auto;">
        </div>
        <div class="email-wrapper">
          <h1 style="font-size: 20px; color: #121212; margin-bottom: 20px; text-align: center;">Återställ ditt lösenord</h1>
          <p>Hej,</p>
          <p>Du har begärt att återställa ditt lösenord för ditt Kasper-konto.</p>
          <p>Klicka på knappen nedan för att återställa ditt lösenord:</p>
          <div style="text-align: center; margin-bottom: 40px;">
            <a href="${resetLink}" class="button">Återställ lösenord</a>
          </div>
          <p>Om knappen inte fungerar kan du kopiera och klistra in följande länk i din webbläsare:</p>
          <p><a href="${resetLink}" class="email-link">${resetLink}</a></p>
          <p>Om du inte begärde denna återställning kan du ignorera detta e-postmeddelande.</p>
          <p>Med vänliga hälsningar,<br>Kasper-teamet</p>
        </div>
      </div>
      <p style="text-align: center; color: #707070; font-size: 11px; margin-top: 15px; margin-bottom: 10px;">
        Skickat från teamet på <a href="https://joinkasper.com/" style="color: #707070; text-decoration: underline;">Kasper®</a>
      </p>
      <p style="text-align: center; color: #707070; font-size: 11px; margin-top: 0; padding-bottom: 20px;">
        &copy; 2025 Kasper®. Alla rättigheter förbehållna.
      </p>
    </body>
    </html>
  `;
}

export function getNotificationEmailTemplate(title: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Kasper</title>
      <style>
        ${sharedEmailStyles}
      </style>
    </head>
    <body style="background-color: #fafafa !important; margin: 0; padding: 0; min-height: 100%;">
      <div style="display: none; max-height: 0; overflow: hidden;">
          🔔Logga in på appen för att se meddelandet.ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
      </div>
      <div class="container">
        <div class="logo">
          <img src="https://app.joinkasper.com/lovable-uploads/kasper-wp-logo.png" alt="Kasper Logo" style="margin: 0 auto; display: block; max-width: 100px; height: auto;">
        </div>
        <div class="email-wrapper">
          <h1 style="font-size: 20px; color: #121212; margin-bottom: 20px; text-align: center;">${title}</h1>
          <p>${message}</p>
          <div style="text-align: center; margin-bottom: 40px;">
            <a href="https://app.joinkasper.com" class="button">Gå till appen</a>
          </div>
          <p>Du kan logga in på <a href="https://app.joinkasper.com" class="email-link">app.joinkasper.com</a> för att se mer information.</p>
          <p>Med vänliga hälsningar,<br>Kasper-teamet</p>
        </div>
      </div>
      <p style="text-align: center; color: #707070; font-size: 11px; margin-top: 15px; margin-bottom: 10px;">
        Skickat från teamet på <a href="https://joinkasper.com/" style="color: #707070; text-decoration: underline;">Kasper®</a>
      </p>
      <p style="text-align: center; color: #707070; font-size: 11px; margin-top: 0; padding-bottom: 20px;">
        &copy; 2025 Kasper®. Alla rättigheter förbehållna.
      </p>
    </body>
    </html>
  `;
}