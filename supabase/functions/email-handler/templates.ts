export const getPasswordResetTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .logo {
      max-width: 200px;
      height: auto;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #000000;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
    .link-fallback {
      word-break: break-all;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body style="background-color: #f6f6f4;">
  <div class="container">
    <div class="header">
      <img src="https://app.doltnamn.se/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png" alt="Doltnamn" class="logo">
    </div>
    <div class="content">
      <h1 style="margin-top: 0;">Reset Your Password</h1>
      <p>We received a request to reset your password for your Doltnamn account. Click the button below to create a new password:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
      <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
      <p class="link-fallback">${resetLink}</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Doltnamn. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const getWelcomeTemplate = (firstName: string, activationLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Doltnamn</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .logo {
      max-width: 200px;
      height: auto;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #000000;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
    .link-fallback {
      word-break: break-all;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body style="background-color: #f6f6f4;">
  <div class="container">
    <div class="header">
      <img src="https://app.doltnamn.se/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png" alt="Doltnamn" class="logo">
    </div>
    <div class="content">
      <h1 style="margin-top: 0;">Welcome to Doltnamn, ${firstName}!</h1>
      <p>Thank you for creating your Doltnamn account. We're excited to help you protect your privacy online.</p>
      <p>To get started, please activate your account by clicking the button below:</p>
      <div style="text-align: center;">
        <a href="${activationLink}" class="button">Activate Account</a>
      </div>
      <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
      <p class="link-fallback">${activationLink}</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Doltnamn. All rights reserved.</p>
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
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Test Email from Doltnamn</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .logo {
      max-width: 200px;
      height: auto;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body style="background-color: #f6f6f4;">
  <div class="container">
    <div class="header">
      <img src="https://app.doltnamn.se/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png" alt="Doltnamn" class="logo">
    </div>
    <div class="content">
      <h1 style="margin-top: 0;">Test Email from Doltnamn</h1>
      <p>If you received this email, it means your email functionality is working correctly!</p>
      <p>The email system is properly configured and ready to send notifications to users.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Doltnamn. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;