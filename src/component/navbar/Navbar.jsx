import React, { useState, useRef, useEffect } from 'react';
import {
  FaBars, FaXmark, FaChevronDown, FaPalette, FaWandMagicSparkles,
  FaRightFromBracket, FaGauge, FaShieldHalved, FaCrown, FaMagnifyingGlass,
  FaEye, FaImage, FaShuffle, FaCircleHalfStroke,
  FaHouse, FaCircleInfo, FaEnvelope, FaTag, FaFill, FaDroplet
} from 'react-icons/fa6';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CheckColorslogo from '../../assets/cc-logo.svg';

const Navbar = () => {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const servicesRef = useRef(null);
  const userRef = useRef(null);
  const { user, logout, isAdmin, isPro } = useAuth();

  useEffect(() => {
    const h = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) setServicesOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMobileOpen(false); setServicesOpen(false); }, [location]);

  const plan = user?.subscription?.plan || 'free';
  const planLabel = plan === 'pro' ? 'Pro' : plan === 'enterprise' ? 'Enterprise' : null;

  const navLinks = [
    { to: '/', label: 'Home', icon: FaHouse },
    { to: '/About', label: 'About', icon: FaCircleInfo },
    { to: '/Contact', label: 'Contact', icon: FaEnvelope },
    { to: '/pricing', label: 'Pricing', icon: FaTag },
  ];

  const services = [
    { to: '/Color-Palettes', label: 'Color Explorer', icon: FaPalette },
    { to: '/ExplorerColor', label: 'Explorer Color', icon: FaEye },
    { to: '/Contrast-Checker', label: 'Contrast Checker', icon: FaCircleHalfStroke },
    { to: '/image-to-palette', label: 'Image to Palette', icon: FaImage },
    { to: '/Generate-Palette',    label: 'Generate Palette',    icon: FaShuffle },
    { to: '/Ai-Colors',           label: 'AI Colors',           icon: FaWandMagicSparkles },
    { to: '/gradient-generator',  label: 'Gradient Generator',  icon: FaFill },
    { to: '/tints-shades',        label: 'Tints & Shades',      icon: FaDroplet },
  ];

  const isActive = (p) => location.pathname === p;

  return (
    <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #E0DFDC' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={CheckColorslogo} alt="CheckColors" className="w-8 h-8" />
          <span className="font-bold text-base hidden sm:block" style={{ color: '#0A66C2' }}>CheckColors</span>
        </Link>

        {/* Search */}
        <div className="relative hidden md:block">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 text-sm rounded-md outline-none w-44 focus:w-52 transition-all"
            style={{ backgroundColor: '#EEF3F8', border: '1px solid transparent' }}
            onFocus={e => e.target.style.borderColor = '#0A66C2'}
            onBlur={e => e.target.style.borderColor = 'transparent'}
          />
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1 ml-2">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors"
              style={{ color: isActive(to) ? '#0A66C2' : '#666', backgroundColor: isActive(to) ? '#EEF3F8' : 'transparent' }}
              onMouseEnter={e => !isActive(to) && (e.currentTarget.style.backgroundColor = '#F3F2EF')}
              onMouseLeave={e => !isActive(to) && (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Icon className="text-xs" /> {label}
            </Link>
          ))}

          {/* Services dropdown */}
          <div className="relative" ref={servicesRef}>
            <button
              onClick={() => setServicesOpen(p => !p)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors"
              style={{ color: servicesOpen ? '#0A66C2' : '#666', backgroundColor: servicesOpen ? '#EEF3F8' : 'transparent' }}
            >
              Services <FaChevronDown className={`text-xs transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>

            {servicesOpen && (
              <div className="absolute top-full mt-1 left-0 w-56 bg-white rounded-lg shadow-lg py-2 z-50"
                style={{ border: '1px solid #E0DFDC' }}>
                {services.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: '#333' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F2EF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Icon className="text-base" style={{ color: '#0A66C2' }} />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Auth */}
        {user ? (
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(p => !p)}
              className="flex items-center gap-2 px-2 py-1 rounded-full transition-colors"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F2EF'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0A66C2, #5BA4CF)' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold leading-tight" style={{ color: '#000000E6' }}>{user.name?.split(' ')[0]}</p>
                {planLabel && <p className="text-[10px]" style={{ color: '#0A66C2' }}>{planLabel}</p>}
              </div>
              <FaChevronDown className="text-xs text-gray-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute top-full mt-1 right-0 w-60 bg-white rounded-lg shadow-xl py-2 z-50"
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
                    <FaGauge style={{ color: '#0A66C2' }} /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#333' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F2EF'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <FaShieldHalved style={{ color: '#CC1016' }} /> Admin Panel
                    </Link>
                  )}
                  {!isPro && (
                    <Link to="/pricing" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#915907' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFF9F0'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <FaCrown style={{ color: '#915907' }} /> Upgrade to Pro
                    </Link>
                  )}
                </div>
                <div className="border-t" style={{ borderColor: '#E0DFDC' }}>
                  <button onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors"
                    style={{ color: '#CC1016' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFF0F0'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <FaRightFromBracket /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="hidden sm:block px-4 py-1.5 text-sm font-semibold rounded-full border transition-colors"
              style={{ borderColor: '#0A66C2', color: '#0A66C2' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF3F8'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              Sign in
            </Link>
            <Link to="/register"
              className="px-4 py-1.5 text-sm font-semibold rounded-full text-white transition-colors"
              style={{ backgroundColor: '#0A66C2' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0A66C2'}>
              Join now
            </Link>
          </div>
        )}

        {/* Mobile toggle */}
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
                style={{ color: isActive(to) ? '#0A66C2' : '#333', backgroundColor: isActive(to) ? '#EEF3F8' : 'transparent' }}>
                <Icon className="text-xs" style={{ color: isActive(to) ? '#0A66C2' : '#666' }} /> {label}
              </Link>
            ))}
            <div className="border-t pt-2 mt-2" style={{ borderColor: '#E0DFDC' }}>
              <p className="text-xs font-semibold px-3 pb-1" style={{ color: '#00000099' }}>SERVICES</p>
              {services.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="flex items-center gap-2 px-3 py-2 text-sm rounded"
                  style={{ color: '#333' }}>
                  <Icon style={{ color: '#0A66C2' }} /> {label}
                </Link>
              ))}
            </div>
            {!user && (
              <div className="flex gap-2 pt-2 border-t" style={{ borderColor: '#E0DFDC' }}>
                <Link to="/login" className="flex-1 text-center py-2 text-sm font-semibold rounded-full border"
                  style={{ borderColor: '#0A66C2', color: '#0A66C2' }}>Sign in</Link>
                <Link to="/register" className="flex-1 text-center py-2 text-sm font-semibold rounded-full text-white"
                  style={{ backgroundColor: '#0A66C2' }}>Join now</Link>
              </div>
            )}
            {user && (
              <button onClick={logout} className="w-full text-left px-3 py-2 text-sm rounded font-medium"
                style={{ color: '#CC1016' }}>Sign Out</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
