
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { splashScreenService } from './services/splashScreen';

// Initialize splash screen
splashScreenService.initialize();

// Call this to define all custom elements from Capacitor
defineCustomElements(window);

// Render app
createRoot(document.getElementById("root")!).render(<App />);

// Hide splash screen after app has rendered
setTimeout(() => {
  splashScreenService.hide();
}, 2000); // Adjust timing as needed
