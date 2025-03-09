
export const sharedEmailStyles = `
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
`;

export const passwordResetStyles = sharedEmailStyles;
export const activationEmailStyles = sharedEmailStyles;

