import { auth } from './auth';
import { navigation } from './navigation';
import { errors } from './errors';
import { features } from './features';
import { ui } from './ui';
import { Translations } from '../types';

export const en: Translations = {
  ...auth,
  ...navigation,
  ...errors,
  ...features,
  ...ui,
};