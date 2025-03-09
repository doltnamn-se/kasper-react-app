
import { removeSpecificUrls } from './removeSpecificUrls';

// Execute the removal
removeSpecificUrls()
  .then(() => {
    console.log('URLs have been successfully removed');
  })
  .catch((error) => {
    console.error('Failed to remove URLs:', error);
  });
