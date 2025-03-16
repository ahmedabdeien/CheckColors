import React, { useState } from 'react';
import { 
  FaHome, 
  FaInfoCircle, 
  FaPhone, 
  FaSearch, 
  FaCogs,
  FaBars,
  FaUser,
  FaShoppingCart
} from 'react-icons/fa';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import CheckColorsLogo from '../../assets/Check-Colors.png';
import { Link } from 'react-router-dom';
const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [flyoutOneOpen, setFlyoutOneOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close flyout when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (flyoutOneOpen) setFlyoutOneOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [flyoutOneOpen]);

  return (
    <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" >
             <img className='w-16 ' src={CheckColorsLogo} alt="CheckColorsLogo" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Main Nav Links */}
            <Link to="/" label="" >Home</Link>
            <Link to="/About" label="">About</Link>
            <Link to="/Contact" label="" >Contact</Link>
            
            {/* Services Flyout */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlyoutOneOpen(!flyoutOneOpen);
                }}
              >
                <span>Services</span>
                {flyoutOneOpen ? <MdExpandLess /> : <MdExpandMore />}
              </button>

              {flyoutOneOpen && (
                <div className="absolute z-10 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 transform origin-top-right transition-all duration-200">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b">
                      Available Services
                    </h3>
                    <div className="space-y-1 *:cursor-pointer flex flex-col ">
                      <Link to="/Color-Palettes" >Color Explorer</Link>
                      <Link to="/Contrast-Checker"  >Contrast Checker</Link>
                      <Link to="/image-to-palette" >image to palette</Link>
                      <Link to="/Generate-Palette"  >Generate Palette </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search and Icons */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-gray-100 text-gray-800 rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
            
            <a href="/account" className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200">
              <FaUser className="h-5 w-5 text-gray-600" />
            </a>
            
            <a href="/cart" className="p-2 rounded-full hover:bg-gray-100 relative transition-all duration-200">
              <FaShoppingCart className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              className="p-2 rounded-md hover:bg-gray-100 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <FaBars className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fadeIn">
          <div className="pt-2 pb-3 px-4 space-y-1">
            <MobileNavLink href="/" label="Home" icon={<FaHome className="h-5 w-5" />} />
            <MobileNavLink href="/About" label="About" icon={<FaInfoCircle className="h-5 w-5" />} />
            <MobileNavLink href="/Contact" label="Contact" icon={<FaPhone className="h-5 w-5" />} />
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">
                Services
              </h3>
              <MobileNavLink href="/Color-Palettes" label="Color Explorer" className="pl-6" />
              <MobileNavLink href="/Contrast-Checker" label="Contrast Checker" className="pl-6" />
              <MobileNavLink href="/image-to-palette" label="Image to palette" className="pl-6" />
              <MobileNavLink href="/Generate-Palette " label="Generate Palette " className="pl-6" />
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

// Helper Components
const NavLink = ({ href, label, icon }) => (
  <a 
    href={href}
    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 text-gray-700 hover:text-blue-600 transition-all duration-200"
  >
    {icon && <span className="text-gray-500">{icon}</span>}
    <span>{label}</span>
  </a>
);

const FlyoutLink = ({ href, label }) => (
  <a
    href={href}
    className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
  >
    {label}
  </a>
);

const MobileNavLink = ({ href, label, icon, className = "" }) => (
  <a
    href={href}
    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 text-gray-700 hover:text-blue-600 transition-all duration-200 ${className}`}
  >
    {icon && <span className="text-gray-500">{icon}</span>}
    <span>{label}</span>
  </a>
);

export default Navbar;