import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LanguageProvider } from './lib/i18n';
import A4DocumentStudio from './pages/A4DocumentStudio';
import PrintReadyStudio from './pages/PrintReadyStudio';
import ToolsHome from './pages/ToolsHome';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ToolsHome />} />
        <Route path="/passport-image" element={<PrintReadyStudio mode="passport" />} />
        <Route path="/nid-print-ready" element={<PrintReadyStudio mode="nid" />} />
        <Route path="/a4-print-ready" element={<A4DocumentStudio />} />

        {/* Older bookmarked passport links now open the focused passport tool. */}
        <Route path="/studio/passport-photo" element={<Navigate to="/passport-image" replace />} />
        <Route path="/tools/passport-photo" element={<Navigate to="/passport-image" replace />} />

        {/* The product is intentionally limited to the three tools above. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </BrowserRouter>
  );
}
