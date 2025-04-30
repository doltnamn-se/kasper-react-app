import { AuthTranslations } from './auth';
import { NavigationTranslations } from './navigation';
import { ErrorTranslations } from './errors';
import { FeaturesTranslations } from './features';
import { UITranslations } from './ui';

export type Language = 'en' | 'sv';

export interface Translations extends 
  AuthTranslations,
  NavigationTranslations,
  ErrorTranslations,
  FeaturesTranslations,
  UITranslations {}