import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeMobile } from './mobile.ts'

// Initialize mobile-specific features
initializeMobile();

createRoot(document.getElementById("root")!).render(<App />);
