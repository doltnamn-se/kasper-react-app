// This file manages the application version by reading from package.json
// Format: MAJOR.MINOR.PATCH follows semantic versioning

import { version } from '../../package.json';

export const APP_VERSION = version;