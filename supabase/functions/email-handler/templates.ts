import { sharedEmailStyles } from "../_shared/styles.ts";

export function getActivationEmailTemplate(displayName: string, password: string): string {
  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aktivera ditt konto - Kasper</title>
      <style>
        ${sharedEmailStyles}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://upfapfohwnkiugvebujh.supabase.co/storage/v1/object/public/avatars/kasper-logo-app-light.svg" alt="Kasper" />
        </div>
        <div class="email-wrapper">
          <p>Hej ${displayName},</p>
          <p>Ditt konto har skapats! Här är dina inloggningsuppgifter:</p>
          <div class="credentials">
            <div class="password-label">Ditt tillfälliga lösenord:</div>
            <div class="password-value">${password}</div>
          </div>
          <p>Du kan logga in på <a href="https://app.joinkasper.com" class="email-link">app.joinkasper.com</a> med din e-post och detta lösenord.</p>
          <p>Vi rekommenderar att du byter lösenord direkt efter första inloggningen i inställningarna.</p>
          <p>Välkommen till Kasper!</p>
          <p>Med vänliga hälsningar,<br>Kasper-teamet</p>
        </div>
      </div>
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
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://upfapfohwnkiugvebujh.supabase.co/storage/v1/object/public/avatars/kasper-logo-app-light.svg" alt="Kasper" />
        </div>
        <div class="email-wrapper">
          <p>Hej,</p>
          <p>Du har begärt att återställa ditt lösenord för ditt Kasper-konto.</p>
          <p>Klicka på knappen nedan för att återställa ditt lösenord:</p>
          <a href="${resetLink}" class="button">Återställ lösenord</a>
          <p>Om knappen inte fungerar kan du kopiera och klistra in följande länk i din webbläsare:</p>
          <p><a href="${resetLink}" class="email-link">${resetLink}</a></p>
          <p>Om du inte begärde denna återställning kan du ignorera detta e-postmeddelande.</p>
          <p>Med vänliga hälsningar,<br>Kasper-teamet</p>
        </div>
      </div>
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
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://upfapfohwnkiugvebujh.supabase.co/storage/v1/object/public/avatars/kasper-logo-app-light.svg" alt="Kasper" />
        </div>
        <div class="email-wrapper">
          <h1 style="color: #121212; font-size: 24px; margin-bottom: 20px;">${title}</h1>
          <p>${message}</p>
          <p>Du kan logga in på <a href="https://app.joinkasper.com" class="email-link">app.joinkasper.com</a> för att se mer information.</p>
          <p>Med vänliga hälsningar,<br>Kasper-teamet</p>
        </div>
      </div>
    </body>
    </html>
  `;
}