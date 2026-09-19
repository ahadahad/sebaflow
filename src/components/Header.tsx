import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Languages } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.services'), to: '/services' },
    { label: t('nav.how'), to: '/#how-it-works' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.contact'), to: '/contact' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setOpen(false), [location.pathname]);

  const handleNav = (to: string) => {
    if (to.includes('#')) {
      const [path, hash] = to.split('#');
      if (location.pathname !== path) {
        navigate(path);
        setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-all ${scrolled ? 'border-ink-100 bg-white/80 backdrop-blur-xl shadow-soft' : 'border-transparent bg-transparent'}`}>
      <div className="container-shell flex h-[70px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo-icon.png" alt="ShebaFlow logo" className="h-10 w-10 rounded-xl object-contain shadow-sm ring-1 ring-ink-100" />
          <div className="leading-none">
            <div className="font-display text-[18px] font-bold tracking-tight text-ink-900">ShebaFlow</div>
            <div className="mt-0.5 text-[10px] font-medium tracking-widest text-ink-400 uppercase">{t('nav.serviceHub')}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map(l => {
            const isActive = l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to.split('#')[0]) && l.to.split('#')[0] !== '/';
            return l.to.includes('#') ? (
              <button key={l.label} onClick={() => handleNav(l.to)} className={`rounded-full px-4 py-2 text-[14px] font-medium transition ${isActive ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`}>{l.label}</button>
            ) : (
              <Link key={l.label} to={l.to} className={`rounded-full px-4 py-2 text-[14px] font-medium transition ${isActive ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`}>{l.label}</Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center rounded-full border border-ink-200 bg-white p-1 shadow-sm">
            <button onClick={() => setLang('bn')} className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${lang === 'bn' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50'}`}>বাংলা</button>
            <button onClick={() => setLang('en')} className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${lang === 'en' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50'}`}>EN</button>
          </div>
          <Link to="/inquiry" className="hidden lg:inline-flex btn-primary h-10 px-5 text-[13px]"><span>{t('nav.getStarted')}</span><ArrowUpRight className="h-4 w-4" /></Link>
          <button onClick={() => setOpen(v => !v)} className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white shadow-sm">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={`lg:hidden overflow-hidden border-t border-ink-100 bg-white transition-all ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container-shell py-4 space-y-1">
          {navLinks.map(l => l.to.includes('#') ? (
            <button key={l.label} onClick={() => { handleNav(l.to); setOpen(false); }} className="w-full rounded-xl px-4 py-3 text-left text-[15px] font-medium text-ink-700 hover:bg-ink-50">{l.label}</button>
          ) : (
            <Link key={l.label} to={l.to} className={`block rounded-xl px-4 py-3 text-[15px] font-medium ${location.pathname === l.to ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-50'}`}>{l.label}</Link>
          ))}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-ink-50 p-3">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink-700"><Languages className="h-4 w-4" /> Language</span>
            <div className="flex rounded-full bg-white p-1 ring-1 ring-ink-200">
              <button onClick={() => setLang('bn')} className={`rounded-full px-3 py-1 text-[12px] font-semibold ${lang === 'bn' ? 'bg-ink-900 text-white' : 'text-ink-600'}`}>বাংলা</button>
              <button onClick={() => setLang('en')} className={`rounded-full px-3 py-1 text-[12px] font-semibold ${lang === 'en' ? 'bg-ink-900 text-white' : 'text-ink-600'}`}>EN</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3">
            <Link to="/services" className="btn-secondary justify-center rounded-full">{t('nav.explore')}</Link>
            <Link to="/inquiry" className="btn-primary justify-center rounded-full">{t('nav.getStarted')}</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
