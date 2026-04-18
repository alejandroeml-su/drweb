import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Render the app directly — no runtime config loading needed
createRoot(document.getElementById('root')!).render(<App />);
