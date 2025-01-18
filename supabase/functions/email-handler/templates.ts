export const getPasswordResetTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your Doltnamn Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f6f6f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://app.doltnamn.se/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png" alt="Doltnamn Logo" style="height: 40px;">
    </div>
    <div style="background: white; border-radius: 8px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="margin: 0 0 20px; color: #000; font-size: 24px; font-weight: 600;">Reset Your Password</h1>
      <p style="margin: 0 0 20px; color: #374151; line-height: 1.5;">We received a request to reset your Doltnamn password. Click the button below to choose a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="display: inline-block; background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Reset Password</a>
      </div>
      <p style="margin: 20px 0 0; color: #6B7280; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
      <p style="margin: 20px 0 0; color: #6B7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="margin: 10px 0 0; color: #6B7280; font-size: 14px; word-break: break-all;">${resetLink}</p>
    </div>
    <div style="text-align: center; color: #6B7280; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} Doltnamn. All rights reserved.</p>
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
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Doltnamn</title>
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f6f6f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://app.doltnamn.se/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png" alt="Doltnamn Logo" style="height: 40px;">
    </div>
    <div style="background: white; border-radius: 8px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="margin: 0 0 20px; color: #000; font-size: 24px; font-weight: 600;">Welcome to Doltnamn${firstName ? `, ${firstName}` : ''}!</h1>
      <p style="margin: 0 0 20px; color: #374151; line-height: 1.5;">Thank you for joining Doltnamn. We're excited to help you protect your privacy online.</p>
      <p style="margin: 0 0 20px; color: #374151; line-height: 1.5;">To get started, please set up your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="display: inline-block; background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Set Password</a>
      </div>
      <p style="margin: 20px 0 0; color: #6B7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="margin: 10px 0 0; color: #6B7280; font-size: 14px; word-break: break-all;">${resetLink}</p>
    </div>
    <div style="text-align: center; color: #6B7280; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} Doltnamn. All rights reserved.</p>
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
</head>
<body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f6f6f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://app.doltnamn.se/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png" alt="Doltnamn Logo" style="height: 40px;">
    </div>
    <div style="background: white; border-radius: 8px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="margin: 0 0 20px; color: #000; font-size: 24px; font-weight: 600;">Test Email</h1>
      <p style="margin: 0 0 20px; color: #374151; line-height: 1.5;">This is a test email from Doltnamn. If you're seeing this, email sending is working correctly!</p>
    </div>
    <div style="text-align: center; color: #6B7280; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} Doltnamn. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;