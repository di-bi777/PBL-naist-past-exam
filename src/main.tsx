import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App.tsx';
import { LanguageProvider } from './app/contexts/LanguageContext.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename="/PBL-naist-past-exam/">
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </BrowserRouter>
);
