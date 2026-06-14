import React, { useState, useRef, useEffect } from 'react';
import {
  FaHome, FaInfoCircle, FaPhone, FaSearch, FaBars, FaUser,
  FaTimes, FaPalette, FaAdjust, FaImage, FaRandom, FaSignOutAlt,
  FaTachometerAlt, FaCrown, FaShieldAlt
} from 'react-icons/fa';
import { BsStars } from "react-icons/bs";
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CheckColorslogo from '../../assets/Check-Colors.png';

const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [flyoutOneOpen, setFlyoutOneOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const flyoutRef = useRef(null);
  const userMenuRef = useRef(null);

  const { user, logout, isAdmin, isPro } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target)) setFlyoutOneOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') { setFlyoutOneOpen(false); setMobileMenuOpen(false); setUserMenuOpen(false); }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  const isActiveRoute = (path) => location.pathname === path;

  const mainLinks = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/About', label: 'About', icon: <FaInfoCircle /> },
    { path: '/Contact', label: 'Contact', icon: <FaPhone /> },
    { path: '/pricing', label: 'Pricing', icon: <FaCrown /> },
  ];

  const serviceLinks = [
    { path: '/Color-Palettes', label: 'Color Explorer', icon: <FaPalette /> },
    { path: '/colors', label: 'Colors', icon: <FaPalette /> },
    { path: '/ExplorerColor', label: 'Explorer Color', icon: <FaPalette /> },
    { path: '/Contrast-Checker', label: 'Contrast Checker', icon: <FaAdjust /> },
    { path: '/image-to-palette', label: 'Image to Palette', icon: <FaImage /> },
    { path: '/Generate-Palette', label: 'Generate Palette', icon: <FaRandom /> },
    { path: '/Ai-Colors', label: 'Ai Colors', icon: <BsStars /> },
  ];

  const PLAN_BADGE = {
    free: null,
    pro: { label: 'Pro', color: 'bg-indigo-100 text-indigo-700' },
    enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-700' },
  };

  const planBadge = user ? PLAN_BADGE[user.subscription?.plan] : null;

  return (
    <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
              <img className="w-10 h-10" src={CheckColorslogo} alt="CheckColors Logo" />
              <span className="font-bold text-lg text-blue-600 hidden sm:block">CheckColors</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {mainLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                  isActiveRoute(link.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                {link.label}
              </Link>
            ))}

            {/* Services Flyout */}
            <div className="relative" ref={flyoutRef}>
              <button
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  flyoutOneOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={(e) => { e.stopPropagation(); setFlyoutOneOpen(!flyoutOneOpen); }}>
                <span>Services</span>
                {flyoutOneOpen ? <MdExpandLess /> : <MdExpandMore />}
              </button>

              {flyoutOneOpen && (
                <div className="absolute z-10 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 origin-top-right">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b">Available Services</h3>
                    <div className="space-y-1">
                      {serviceLinks.map((service) => (
                        <Link key={service.path} to={service.path}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                            isActiveRoute(service.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                          }`}>
                          <span className="text-gray-500">{service.icon}</span>
                          <span>{service.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <form onSubmit={(e) => e.preventDefault()} className="relative hidden md:block">
              <div className={`relative transition-all duration-300 ${searchFocused ? 'w-56' : 'w-36'}`}>
                <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${searchFocused ? 'text-blue-500' : 'text-gray-400'}`} />
                <input type="text" placeholder="Search..." value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                  className="bg-gray-100 text-gray-800 rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200" />
              </div>
            </form>

            {/* Auth section */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.name?.split(' ')[0]}</span>
                  {planBadge && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${planBadge.color}`}>{planBadge.label}</span>
                  )}
                  <MdExpandMore className="text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FaTachometerAlt className="text-indigo-500" /> لوحة التحكم
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <FaShieldAlt className="text-red-500" /> إدارة الموقع
                      </Link>
                    )}
                    {!isPro && (
                      <Link to="/pricing" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">
                        <FaCrown className="text-yellow-500" /> ترقية إلى Pro
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                        <FaSignOutAlt /> تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors hidden sm:block">
                  دخول
                </Link>
                <Link to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FaTimes className="h-6 w-6 text-gray-600" /> : <FaBars className="h-6 w-6 text-gray-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 px-4 space-y-1">
            {mainLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all ${
                  isActiveRoute(link.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                <span className="text-gray-500">{link.icon}</span><span>{link.label}</span>
              </Link>
            ))}

            <div className="border-t border-gray-200 pt-2 mt-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">Services</h3>
              {serviceLinks.map((service) => (
                <Link key={service.path} to={service.path}
                  className={`flex items-center space-x-3 pl-6 py-2 rounded-md text-sm font-medium transition-all ${
                    isActiveRoute(service.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                  <span className="text-gray-500">{service.icon}</span><span>{service.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Auth */}
          <div className="border-t border-gray-200 py-3 px-4">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.subscription?.plan}</p>
                  </div>
                </div>
                <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <FaTachometerAlt className="text-indigo-500" /> لوحة التحكم
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <FaShieldAlt className="text-red-500" /> إدارة الموقع
                  </Link>
                )}
                <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md w-full">
                  <FaSignOutAlt /> تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1 text-center px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  دخول
                </Link>
                <Link to="/register" className="flex-1 text-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
