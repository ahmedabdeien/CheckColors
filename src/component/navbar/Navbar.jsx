import React, { useState, useRef, useEffect } from 'react';
import {
  FaBars, FaXmark, FaChevronDown, FaPalette, FaWandMagicSparkles,
  FaRightFromBracket, FaGauge, FaShieldHalved, FaCrown, FaMagnifyingGlass,
  FaEye, FaImage, FaShuffle, FaCircleHalfStroke,
  FaHouse, FaCircleInfo, FaEnvelope, FaTag, FaFill, FaDroplet, FaGlobe, FaSwatchbook
} from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import CheckColorslogo from '../../assets/cc-logo.svg';

const LI_BLUE  = '#0A66C2';
const LI_BORDER= '#E0DFDC';
const LI_MUTED = '#00000066';

const Navbar = () => {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const servicesRef = useRef(null);
  const userRef = useRef(null);
  const langRef = useRef(null);
  const { user, logout, isAdmin, isPro } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const h = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) setServicesOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMobileOpen(false); setServicesOpen(false); }, [location]);

  // Apply RTL to document
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRTL]);

  const plan = user?.subscription?.plan || 'free';
  const planLabel = plan === 'pro' ? 'Pro' : plan === 'enterprise' ? 'Enterprise' : null;

  const navLinks = [
    { to: '/',        label: t('nav.home'),    icon: FaHouse },
    { to: '/About',   label: t('nav.about'),   icon: FaCircleInfo },
    { to: '/Contact', label: t('nav.contact'), icon: FaEnvelope },
    { to: '/pricing', label: t('nav.pricing'), icon: FaTag },
  ];

  const services = [
    { to: '/explore',            label: t('services.explorePalettes'),   icon: FaPalette },
    { to: '/Contrast-Checker',   label: t('services.contrastChecker'),   icon: FaCircleHalfStroke },
    { to: '/image-to-palette',   label: t('services.imageToPalette'),    icon: FaImage },
    { to: '/Generate-Palette',   label: t('services.generatePalette'),   icon: FaShuffle },
    { to: '/gradient-generator', label: t('services.gradientGenerator'), icon: FaFill },
    { to: '/tints-shades',       label: t('services.tintsShades'),       icon: FaDroplet },
    { to: '/Ai-Colors',          label: t('services.aiColors'),          icon: FaWandMagicSparkles },
    { to: '/colors',             label: t('services.colorLibrary'),      icon: FaSwatchbook },
  ];

  const isActive = (p) => location.pathname === p;

  const switchLang = (lang) => {
    i18n.changeLanguage(lang);
    setLangOpen(false);
  };

  const openSearch = () => window.dispatchEvent(new CustomEvent('cc:open-search'));

  return (
    <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #E0DFDC' }} className="sticky top-0 z-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={CheckColorslogo} alt="CheckColors" className="w-8 h-8" />
        </Link>

        {/* Search bar */}
        <button onClick={openSearch}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{ backgroundColor: '#EEF3F8', border: '1px solid transparent', color: LI_MUTED, minWidth: 160 }}
          onMouseEnter={e => e.currentTarget.style.borderColor = LI_BLUE}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
          <FaMagnifyingGlass className="text-xs" />
          <span className="flex-1 text-left text-sm">{t('nav.search')}</span>
          <kbd className="text-[10px] font-mono px-1 py-0.5 rounded" style={{ backgroundColor: '#fff', border: `1px solid ${LI_BORDER}` }}>⌘K</kbd>
        </button>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-0.5 ml-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors"
              style={{ color: isActive(to) ? LI_BLUE : '#666', backgroundColor: isActive(to) ? '#EEF3F8' : 'transparent' }}
              onMouseEnter={e => !isActive(to) && (e.currentTarget.style.backgroundColor = '#F3F2EF')}
              onMouseLeave={e => !isActive(to) && (e.currentTarget.style.backgroundColor = 'transparent')}>
              <Icon className="text-xs" /> {label}
            </Link>
          ))}

          {/* Services dropdown */}
          <div className="relative" ref={servicesRef}>
            <button onClick={() => setServicesOpen(p => !p)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors"
              style={{ color: servicesOpen ? LI_BLUE : '#666', backgroundColor: servicesOpen ? '#EEF3F8' : 'transparent' }}>
              {t('nav.services')} <FaChevronDown className={`text-xs transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {servicesOpen && (
              <div className="absolute top-full mt-1 left-0 w-60 bg-white rounded-xl shadow-lg py-2 z-50"
                style={{ border: '1px solid #E0DFDC' }}>
                {services.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: '#333' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F2EF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Icon className="text-base flex-shrink-0" style={{ color: LI_BLUE }} />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1" />

        {/* Language switcher */}
        <div className="relative hidden sm:block" ref={langRef}>
          <button onClick={() => setLangOpen(p => !p)}
            className="flex items-center gap-1.5 p-2 rounded-lg transition-colors text-sm font-medium"
            style={{ color: LI_MUTED }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F2EF'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <FaGlobe className="text-sm" />
            <span className="text-xs">{i18n.language === 'ar' ? 'ع' : 'EN'}</span>
          </button>
          {langOpen && (
            <div className="absolute top-full mt-1 right-0 w-36 bg-white rounded-xl shadow-lg py-2 z-50"
              style={{ border: `1px solid ${LI_BORDER}` }}>
              {[['en','English','🇺🇸'],['ar','العربية','🇸🇦']].map(([code, name, flag]) => (
                <button key={code} onClick={() => switchLang(code)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                  style={{
                    color: i18n.language === code ? LI_BLUE : '#333',
                    backgroundColor: i18n.language === code ? '#EEF3F8' : 'transparent',
                  }}
                  onMouseEnter={e => i18n.language !== code && (e.currentTarget.style.backgroundColor = '#F3F2EF')}
                  onMouseLeave={e => i18n.language !== code && (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <span>{flag}</span> {name}
                  {i18n.language === code && <span className="ml-auto text-xs" style={{ color: LI_BLUE }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auth */}
        {user ? (
          <div className="relative" ref={userRef}>
            <button onClick={() => setUserMenuOpen(p => !p)}
              className="flex items-center gap-2 px-2 py-1 rounded-full transition-colors"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F2EF'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0A66C2, #5BA4CF)' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold leading-tight" style={{ color: '#000000E6' }}>{user.name?.split(' ')[0]}</p>
                {planLabel && <p className="text-[10px]" style={{ color: LI_BLUE }}>{planLabel}</p>}
              </div>
              <FaChevronDown className="text-xs text-gray-400" />
            </button>
            {userMenuOpen && (
              <div className="absolute top-full mt-1 right-0 w-60 bg-white rounded-xl shadow-xl py-2 z-50"
                style={{ border: '1px solid #E0DFDC' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: '#E0DFDC' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ background: 'linear-gradient(135deg, #0A66C2, #5BA4CF)' }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#000000E6' }}>{user.name}</p>
                      <p className="text-xs" style={{ color: '#00000099' }}>{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: '#333' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F2EF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <FaGauge style={{ color: LI_BLUE }} /> {t('nav.dashboard')}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#333' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F2EF'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <FaShieldHalved style={{ color: '#CC1016' }} /> {t('nav.adminPanel')}
                    </Link>
                  )}
                  {!isPro && (
                    <Link to="/pricing" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#915907' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFF9F0'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <FaCrown style={{ color: '#915907' }} /> {t('pricing.upgrade')}
                    </Link>
                  )}
                </div>
                <div className="border-t" style={{ borderColor: '#E0DFDC' }}>
                  <button onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors"
                    style={{ color: '#CC1016' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFF0F0'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <FaRightFromBracket /> {t('nav.signOut')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="hidden sm:block px-4 py-1.5 text-sm font-semibold rounded-full border transition-colors"
              style={{ borderColor: LI_BLUE, color: LI_BLUE }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EEF3F8'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              {t('nav.signIn')}
            </Link>
            <Link to="/register"
              className="px-4 py-1.5 text-sm font-semibold rounded-full text-white transition-colors"
              style={{ backgroundColor: LI_BLUE }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
              {t('nav.joinNow')}
            </Link>
          </div>
        )}

        {/* Mobile: search + burger */}
        <button onClick={openSearch} className="md:hidden p-2 rounded" style={{ color: '#666' }}>
          <FaMagnifyingGlass />
        </button>
        <button className="md:hidden p-2 rounded" onClick={() => setMobileOpen(p => !p)}>
          {mobileOpen ? <FaXmark className="text-gray-600" /> : <FaBars className="text-gray-600" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t" style={{ borderColor: '#E0DFDC' }}>
          <div className="px-4 py-2 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-2 px-3 py-2 text-sm rounded font-medium"
                style={{ color: isActive(to) ? LI_BLUE : '#333', backgroundColor: isActive(to) ? '#EEF3F8' : 'transparent' }}>
                <Icon className="text-xs" style={{ color: isActive(to) ? LI_BLUE : '#666' }} /> {label}
              </Link>
            ))}
            <div className="border-t pt-2 mt-2" style={{ borderColor: '#E0DFDC' }}>
              <p className="text-xs font-semibold px-3 pb-1" style={{ color: '#00000099' }}>{t('nav.services').toUpperCase()}</p>
              {services.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="flex items-center gap-2 px-3 py-2 text-sm rounded"
                  style={{ color: '#333' }}>
                  <Icon style={{ color: LI_BLUE }} /> {label}
                </Link>
              ))}
            </div>
            {/* Mobile lang switcher */}
            <div className="border-t pt-2 mt-2 flex gap-2" style={{ borderColor: '#E0DFDC' }}>
              {[['en','EN'],['ar','ع']].map(([code, label]) => (
                <button key={code} onClick={() => switchLang(code)}
                  className="flex-1 py-1.5 text-sm font-semibold rounded-full border"
                  style={{
                    borderColor: i18n.language === code ? LI_BLUE : LI_BORDER,
                    color: i18n.language === code ? LI_BLUE : LI_MUTED,
                    backgroundColor: i18n.language === code ? '#EEF3F8' : 'transparent',
                  }}>
                  {label}
                </button>
              ))}
            </div>
            {!user && (
              <div className="flex gap-2 pt-2 border-t" style={{ borderColor: '#E0DFDC' }}>
                <Link to="/login" className="flex-1 text-center py-2 text-sm font-semibold rounded-full border"
                  style={{ borderColor: LI_BLUE, color: LI_BLUE }}>{t('nav.signIn')}</Link>
                <Link to="/register" className="flex-1 text-center py-2 text-sm font-semibold rounded-full text-white"
                  style={{ backgroundColor: LI_BLUE }}>{t('nav.joinNow')}</Link>
              </div>
            )}
            {user && (
              <button onClick={logout} className="w-full text-left px-3 py-2 text-sm rounded font-medium"
                style={{ color: '#CC1016' }}>{t('nav.signOut')}</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
