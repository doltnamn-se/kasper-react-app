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
        borderRadiusButton: '0.5rem',
        buttonBorderRadius: '0.5rem',
        inputBorderRadius: '0.5rem',
      },
    },
  },
  style: {
    input: {
      backgroundColor: isDarkMode ? '#3f3f46' : 'white',
      color: isDarkMode ? '#fff' : '#6B7280',
      borderColor: isDarkMode ? '#303032' : '#E5E7EB',
    },
    label: {
      fontWeight: 500,
    },
    message: {
      backgroundColor: '#ff22221e',
      border: 'none',
      color: '#ff6369',
      fontWeight: 600,
      padding: '12px 16px',
      borderRadius: '0.5rem',
    }
  },
  className: {
    anchor: 'text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300',
    button: 'bg-black hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg dark:bg-white dark:text-black dark:hover:bg-gray-100',
    container: 'space-y-4',
    divider: 'my-4',
    label: 'text-gray-700 dark:text-gray-300',
    loader: 'border-black dark:border-white',
    message: 'text-[#ff6369] bg-[#ff22221e]',
  },
});