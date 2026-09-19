import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ServicesPage from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Inquiry from './pages/Inquiry';
import About from './pages/About';
import Contact from './pages/Contact';
import { Privacy, Terms } from './pages/Legal';
import NotFound from './pages/NotFound';
import PassportStudio from './pages/PassportStudio';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LanguageProvider } from './lib/i18n';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isStudio = pathname.startsWith('/studio') || pathname.startsWith('/tools');
  
  if (isStudio) {
    return (
      <Routes>
        <Route path="/studio/passport-photo" element={<PassportStudio />} />
        <Route path="/tools/passport-photo" element={<PassportStudio />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ScrollToTop />
        <AppLayout />
      </LanguageProvider>
    </BrowserRouter>
  );
}
