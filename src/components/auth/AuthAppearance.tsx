import { ThemeSupa } from "@supabase/auth-ui-shared";

export const getAuthAppearance = (isDarkMode: boolean) => ({
  theme: ThemeSupa,
  variables: {
    default: {
      colors: {
        brand: '#000000',
        brandAccent: '#333333',
        inputBackground: 'white',
        inputBorder: '#E5E7EB',
        inputBorderFocus: '#000000',
        inputBorderHover: '#000000',
        messageText: '#ff6369',
        messageBackground: '#ff22221e',
        messageTextDanger: '#ff6369',
      },
      borderWidths: {
        buttonBorderWidth: '1px',
        inputBorderWidth: '1px',
      },
      radii: {
        borderRadiusButton: '10px',
        buttonBorderRadius: '10px',
        inputBorderRadius: '4px',
      },
      fonts: {
        bodyFontFamily: 'system-ui',
        buttonFontFamily: 'system-ui',
        inputFontFamily: 'system-ui',
        labelFontFamily: 'system-ui',
      },
    },
  },
  style: {
    input: {
      backgroundColor: isDarkMode ? '#1a1a1a' : 'white',
      color: isDarkMode ? '#fff' : '#6B7280',
      borderColor: isDarkMode ? '#303032' : '#E5E7EB',
      height: '48px',
      fontFamily: 'system-ui',
    },
    message: {
      backgroundColor: '#ff22221e',
      border: 'none',
      color: '#ff6369',
      fontWeight: 600,
      padding: '12px 16px',
      borderRadius: '4px',
      fontFamily: 'system-ui',
    }
  },
  className: {
    anchor: 'text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300 font-system-ui',
    button: 'bg-black hover:bg-gray-900 text-white font-medium py-2 px-4 h-12 dark:bg-white dark:text-black dark:hover:bg-gray-100 font-system-ui',
    container: 'space-y-4 font-system-ui',
    divider: 'my-4',
    label: 'text-sm font-bold text-gray-700 dark:text-gray-300 font-system-ui',
    loader: 'border-black dark:border-white',
    message: 'text-[#ff6369] bg-[#ff22221e] font-system-ui',
  },
});