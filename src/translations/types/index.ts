import { AuthTranslations } from './auth';
import { NavigationTranslations } from './navigation';
import { ErrorTranslations } from './errors';
import { GuideTranslations } from './guides';
import { SettingsTranslations } from './settings';

export interface Translations extends 
  AuthTranslations,
  NavigationTranslations,
  ErrorTranslations,
  GuideTranslations,
  SettingsTranslations {}

export type Language = 'en' | 'sv';