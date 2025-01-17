export const generateAndSendActivationEmail = async (
  supabaseAdmin: any,
  email: string,
  firstName: string,
  origin: string
) => {
  console.log("Generating magic link");
  const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
    options: {
      redirectTo: `${origin}/onboarding`,
    }
  });

  if (magicLinkError || !magicLinkData.properties?.action_link) {
    console.error("Error generating magic link:", magicLinkError);
    throw new Error("Failed to generate activation link");
  }

  console.log("Magic link generated successfully");

  try {
    console.log("Sending activation email");
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Doltnamn <no-reply@doltnamn.se>",
        to: [email],
        subject: "Activate Your Doltnamn Account",
        html: `
          <div>
            <h1>Welcome to Doltnamn, ${firstName}!</h1>
            <p>Your account has been created. Click the button below to set up your password and complete your onboarding:</p>
            <a href="${magicLinkData.properties.action_link}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Activate Account
            </a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${magicLinkData.properties.action_link}</p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Error sending activation email:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailData = await resendResponse.json();
    console.log("Activation email sent successfully:", emailData);
  } catch (emailError) {
    console.error("Error in email sending:", emailError);
    // We don't throw here as email sending failure shouldn't block account creation
  }
};