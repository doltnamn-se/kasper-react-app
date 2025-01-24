export type Language = 'en' | 'sv';

export interface Translations {
  // Auth related
  'welcome.back': string;
  'sign.in': string;
  'signing.in': string;
  'no.account': string;
  'register': string;
  'email': string;
  'password': string;
  'new.password': string;
  'email.placeholder': string;
  'password.placeholder': string;
  'new.password.placeholder': string;
  'phone.placeholder': string;
  'token.placeholder': string;
  'dark.mode': string;
  'forgot.password': string;
  'send.recovery.link': string;
  'sending.recovery.link': string;
  'update.password': string;
  'updating.password': string;
  'cancel': string;
  'loading': string;
  'reset.password': string;
  'reset.password.success': string;
  'password.updated': string;

  // Navigation
  'nav.checklist': string;
  'nav.home': string;
  'nav.my.links': string;
  'nav.address.alerts': string;
  'nav.guides': string;
  'nav.admin.dashboard': string;
  'nav.admin.customers': string;

  // Password requirements
  'password.requirement.length': string;
  'password.requirement.lowercase': string;
  'password.requirement.uppercase': string;
  'password.requirement.special': string;
  'error.password.requirements': string;

  // Steps
  'step.number': string;
  'step.progress': string;
  'step.password.title': string;
  'step.password.description': string;
  'step.sites.title': string;
  'step.sites.description': string;
  'step.urls.title': string;
  'step.urls.description': string;
  'step.info.title': string;
  'step.info.description': string;

  // General
  'error': string;
  'success': string;
  'getting.started': string;
  'set.password': string;
  'set.password.description': string;

  // Footer
  'privacy': string;
  'license': string;
  'terms': string;

  // Error messages
  'error.generic': string;
  'error.signin': string;
  'error.signout': string;
  'error.password.update': string;
  'error.invalid.credentials': string;
  'error.missing.email': string;
  'error.invalid.recovery.link': string;
  'error.passwords.dont.match': string;
  'error.password.too.short': string;

  // Profile & Settings
  'profile.manage': string;
  'profile.billing': string;
  'profile.settings': string;
  'profile.sign.out': string;
  'profile.signing.out': string;
  'settings.success': string;
  'settings.password.updated': string;
  'settings.change.password': string;
  'settings.current.password': string;
  'settings.new.password': string;
  'settings.confirm.password': string;
  'settings.update.password': string;
  'settings.updating.password': string;

  // Search
  'search.placeholder': string;

  // Notifications
  'notifications.title': string;
  'notifications.mark.all.read': string;
  'notifications.empty': string;

  // Overview
  'overview.welcome': string;
}