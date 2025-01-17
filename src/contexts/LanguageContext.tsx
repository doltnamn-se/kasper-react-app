import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'sv';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Auth related
    'welcome.back': 'Welcome back',
    'sign.in': 'Sign in to your account',
    'no.account': "Don't have an account?",
    'register': 'Get started',
    'email': 'Email',
    'password': 'Password',
    'email.placeholder': 'Enter your email',
    'password.placeholder': 'Enter your password',
    'new.password.placeholder': 'Enter new password',
    'phone.placeholder': 'Enter phone number',
    'token.placeholder': 'Enter verification code',
    'dark.mode': 'Dark mode',
    'forgot.password': 'Forgot your password?',
    'send.recovery.link': 'Send recovery link',
    'cancel': 'Cancel',
    // Navigation
    'nav.home': 'Dashboard',
    'nav.checklist': 'Checklist',
    'nav.my.links': 'My Links',
    'nav.address.alerts': 'Address Alerts',
    'nav.guides': 'Guides',
    'nav.admin.dashboard': 'Dashboard',
    'nav.admin.customers': 'Customers',
    // Profile menu
    'profile.manage': 'Manage Profile',
    'profile.billing': 'Subscription',
    'profile.settings': 'Settings',
    'profile.sign.out': 'Sign out',
    'profile.signing.out': 'Signing out...',
    // Search
    'search.placeholder': 'Search...',
    // Footer links
    'privacy': 'Privacy',
    'license': 'License',
    'terms': 'Terms',
    // Page titles
    'overview.title': 'Overview',
    'overview.welcome': 'Welcome to your overview.',
    // Error messages
    'error.invalid.credentials': 'Invalid login credentials',
    'error.email.not.confirmed': 'Please confirm your email before logging in',
    'error.user.not.found': 'No user found with these credentials',
    'error.invalid.email.password': 'Invalid email or password',
    'error.missing.email.phone': 'Missing email or phone',
    'error.missing.password': 'Missing password',
    'error.password.too.short': 'Password is too short',
    'error.email.taken': 'Email is already taken',
    'error.phone.taken': 'Phone number is already taken',
    'error.weak.password': 'Password is too weak',
    'error.invalid.email': 'Invalid email',
    'error.invalid.phone': 'Invalid phone number',
    'error.generic': 'An error occurred. Please try again later.',
  },
  sv: {
    // Auth related
    'welcome.back': 'Välkommen tillbaka',
    'sign.in': 'Logga in på ditt konto',
    'no.account': 'Har du inget konto?',
    'register': 'Kom igång',
    'email': 'E-post',
    'password': 'Lösenord',
    'email.placeholder': 'Ange din e-postadress',
    'password.placeholder': 'Ange ditt lösenord',
    'new.password.placeholder': 'Ange nytt lösenord',
    'phone.placeholder': 'Ange telefonnummer',
    'token.placeholder': 'Ange verifieringskod',
    'dark.mode': 'Mörkt läge',
    'forgot.password': 'Glömt ditt lösenord?',
    'send.recovery.link': 'Skicka återställningslänk',
    'cancel': 'Avbryt',
    // Navigation
    'nav.home': 'Dashboard',
    'nav.checklist': 'Checklista',
    'nav.my.links': 'Mina länkar',
    'nav.address.alerts': 'Adresslarm',
    'nav.guides': 'Guider',
    'nav.admin.dashboard': 'Dashboard',
    'nav.admin.customers': 'Kunder',
    // Profile menu
    'profile.manage': 'Hantera profil',
    'profile.billing': 'Prenumeration',
    'profile.settings': 'Inställningar',
    'profile.sign.out': 'Logga ut',
    'profile.signing.out': 'Loggar ut...',
    // Search
    'search.placeholder': 'Sök...',
    // Footer links
    'privacy': 'Integritet',
    'license': 'Licensvillkor',
    'terms': 'Användarvillkor',
    // Page titles
    'overview.title': 'Översikt',
    'overview.welcome': 'Välkommen till din översikt.',
    // Error messages
    'error.invalid.credentials': 'Felaktigt användarnamn eller lösenord',
    'error.email.not.confirmed': 'Vänligen bekräfta din e-postadress innan du loggar in',
    'error.user.not.found': 'Ingen användare hittades med dessa uppgifter',
    'error.invalid.email.password': 'Ogiltig e-postadress eller lösenord',
    'error.missing.email.phone': 'E-postadress eller telefonnummer saknas',
    'error.missing.password': 'Lösenord saknas',
    'error.password.too.short': 'Lösenordet är för kort',
    'error.email.taken': 'E-postadressen används redan',
    'error.phone.taken': 'Telefonnumret används redan',
    'error.weak.password': 'Lösenordet är för svagt',
    'error.invalid.email': 'Ogiltig e-postadress',
    'error.invalid.phone': 'Ogiltigt telefonnummer',
    'error.generic': 'Ett fel uppstod. Försök igen senare.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'sv') ? saved : 'sv';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
