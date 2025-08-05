export const getPasswordResetTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
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
    @media only screen and (max-width: 480px) {
      .container {
        padding: 10px;
      }
      .email-wrapper {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="logo">
        <img src="https://app.joinkasper.com/lovable-uploads/kasper-wp-logo.png" alt="Kasper Logo">
      </div>
      <h1>Reset Your Password</h1>
      <p>Hello,</p>
      <p>We received a request to reset your password for your Kasper account. Click the button below to reset it:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>If you didn't request this, you can safely ignore this email. The link will expire in 24 hours.</p>
      <p>For security reasons, we recommend copying and pasting this link if the button doesn't work:</p>
      <p style="word-break: break-all; font-size: 12px; color: #666666;">${resetLink}</p>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Kasper. Alla rättigheter förbehållna.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;