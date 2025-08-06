// ============= PRODUCTION EMAIL STYLES - DO NOT AUTO-OVERRIDE =============
// These styles contain manually customized Kasper branding elements
// Any automated changes should preserve the Google Sans font and border-radius values
// =========================================================================

export const sharedEmailStyles = `
        html,
        body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            background-color: #fafafa !important;
        }

        body {
            font-family: 'Google Sans', 'Segoe UI', 'Helvetica', sans-serif;
            line-height: 1.6;
            color: #121212;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px 20px;
            background-color: #fafafa !important;
        }

        .logo {
            text-align: center;
            margin-bottom: 15px;
            width: 100%;
            background-color: #fafafa !important;
        }

        .logo img {
            max-width: 100px;
            height: auto;
            margin: 0 auto;
            display: block;
        }

        .email-wrapper {
            background-color: #fafafa;
            border-radius: 0px;
            padding: 5px;
            margin: 0;
        }

        p {
            color: #121212;
            margin-bottom: 20px;
            font-size: 15px;
        }

        .button {
            display: inline-block;
            background-color: #121212;
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 1rem;
            margin: 20px 0;
            font-weight: 500;
        }

        .button:hover {
            background-color: #303030;
        }

        .email-link {
            color: #121212;
            text-decoration: underline;
        }

        .credentials {
            background-color: #eeeeee;
            padding: 30px;
            border-radius: 15px;
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
`;

export const passwordResetStyles = sharedEmailStyles;
export const activationEmailStyles = sharedEmailStyles;