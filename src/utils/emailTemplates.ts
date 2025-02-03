export const getPasswordResetTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html style="margin: 0; padding: 0; min-height: 100%; background-color: #f4f4f4;">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      background-color: #f4f4f4 !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
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
      width: 100%;
    }
    .logo img {
      max-width: 150px;
      height: auto;
      margin: 0 auto;
      display: block;
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
    }
  </style>
</head>
<body style="background-color: #f4f4f4 !important; margin: 0; padding: 0; min-height: 100%;">
  <div class="container">
    <div class="logo">
      <img src="https://app.doltnamn.se/lovable-uploads/doltnamn.se-app-logo-black.svg" alt="Doltnamn Logo" style="margin: 0 auto; display: block;">
    </div>
    <div class="email-wrapper">
      <h1>Reset Your Password</h1>
      <p>Hello,</p>
      <p>We received a request to reset your password for your Doltnamn account. Click the button below to reset it:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>If you didn't request this, you can safely ignore this email. The link will expire in 24 hours.</p>
      <p>For security reasons, we recommend copying and pasting this link if the button doesn't work:</p>
      <p style="word-break: break-all; font-size: 12px; color: #666666;">${resetLink}</p>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Doltnamn. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
