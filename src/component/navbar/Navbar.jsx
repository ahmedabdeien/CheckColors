import React, { useState, useRef, useEffect } from 'react';
import { 
  FaHome, 
  FaInfoCircle, 
  FaPhone, 
  FaSearch, 
  FaCogs,
  FaBars,
  FaUser,
  FaShoppingCart,
  FaTimes,
  FaPalette,
  FaAdjust,
  FaImage,
  FaRandom
} from 'react-icons/fa';
import { BsStars } from "react-icons/bs";
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import CheckColorslogo from '../../assets/Check-Colors.png';
const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [flyoutOneOpen, setFlyoutOneOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const flyoutRef = useRef(null);
  const searchRef = useRef(null);

  // Handle outside clicks for flyout
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target)) {
        setFlyoutOneOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle search input submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchInput);
  };

  // Handle ESC key press to close dropdowns
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setFlyoutOneOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Check if the current route matches the link
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Links data for reusability
  const mainLinks = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/About', label: 'About', icon: <FaInfoCircle /> },
    { path: '/Contact', label: 'Contact', icon: <FaPhone /> }
  ];

  const serviceLinks = [
    { path: '/Color-Palettes', label: 'Color Explorer', icon: <FaPalette /> },
    { path: '/Contrast-Checker', label: 'Contrast Checker', icon: <FaAdjust /> },
    { path: '/image-to-palette', label: 'Image to Palette', icon: <FaImage /> },
    { path: '/Generate-Palette', label: 'Generate Palette', icon: <FaRandom /> },
    { path: '/Ai-Colors', label: 'Ai Colors', icon: <BsStars/> },
  ];

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
            {/* Main Nav Links */}
            {mainLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                  isActiveRoute(link.path) 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Services Flyout */}
            <div className="relative" ref={flyoutRef}>
              <button 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  flyoutOneOpen 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFlyoutOneOpen(!flyoutOneOpen);
                }}
                aria-expanded={flyoutOneOpen}
                aria-haspopup="true"
              >
                <span>Services</span>
                {flyoutOneOpen ? <MdExpandLess aria-hidden="true" /> : <MdExpandMore aria-hidden="true" />}
              </button>

              {flyoutOneOpen && (
                <div 
                  className="absolute z-10 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 transform opacity-100 scale-100 origin-top-right"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b">
                      Available Services
                    </h3>
                    <div className="space-y-2">
                      {serviceLinks.map((service) => (
                        <Link 
                          key={service.path}
                          to={service.path}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                            isActiveRoute(service.path) 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          role="menuitem"
                        >
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

          {/* Search and Icons */}
          <div className="flex items-center space-x-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className={`relative group transition-all duration-300 ${searchFocused ? 'w-64' : 'w-40'}`}>
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  searchFocused ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`bg-gray-100 text-gray-800 rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 ${
                    searchInput ? 'pr-8' : 'pr-4'
                  }`}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
            
            <Link to="/account" className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200" aria-label="User Account">
              <FaUser className="h-5 w-5 text-gray-600" />
            </Link>
            
            <Link to="/cart" className="p-2 rounded-full hover:bg-gray-100 relative transition-all duration-200" aria-label="Shopping Cart">
              <FaShoppingCart className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center" aria-label="2 items in cart">
                2
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              className="p-2 rounded-md hover:bg-gray-100 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6 text-gray-600 " />
              ) : (
                <FaBars className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fadeIn  transition-all duration-300">
          <div className="pt-2 pb-3 px-4 space-y-1">
            {mainLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isActiveRoute(link.path) 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-gray-500">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">
                Services
              </h3>
              {serviceLinks.map((service) => (
                <Link 
                  key={service.path}
                  to={service.path}
                  className={`flex items-center space-x-3 pl-6 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActiveRoute(service.path) 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-gray-500">{service.icon}</span>
                  <span>{service.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 pb-3 px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <FaUser />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium">User Account</div>
                <div className="text-sm font-medium text-gray-500">Sign in or Register</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;