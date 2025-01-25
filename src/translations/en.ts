import { Translations } from './types';
import { authEn } from './categories/auth';
import { navigationEn } from './categories/navigation';
import { errorsEn } from './categories/errors';
import { guidesEn } from './categories/guides';
import { settingsEn } from './categories/settings';

export const en: Translations = {
  ...authEn,
  ...navigationEn,
  ...errorsEn,
  ...guidesEn,
  ...settingsEn,
} as const;