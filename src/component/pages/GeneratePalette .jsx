import React, { useState, useEffect } from 'react';
import { FaCopy, FaPalette, FaSync, FaDownload, FaShareAlt, FaMoon, FaSun, FaLock, FaUnlock, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const GeneratePalette = () => {
  const [palette, setPalette] = useState([]);
  const [previousPalette, setPreviousPalette] = useState([]);
  const [lockedColors, setLockedColors] = useState(Array(5).fill(false));
  const [darkMode, setDarkMode] = useState(false);
  const [notification, setNotification] = useState(null);
  const [colorFormat, setColorFormat] = useState('hsl'); // 'hsl' or 'hex'

  // Initialize palette on component mount
  useEffect(() => {
    generateNewPalette();
  }, []);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Improved random color generation with better contrast
  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30 + 70); // 70-100% saturation
    const lightness = Math.floor(Math.random() * 30 + 20); // 20-50% lightness for better contrast
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Convert HSL to HEX
  const hslToHex = (hslColor) => {
    // Extract hsl values
    const matches = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i) || 
                    hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i);
    
    if (!matches) return hslColor; // Return original if no match
    
    const h = parseInt(matches[1]) / 360;
    const s = parseInt(matches[2]) / 100;
    const l = parseInt(matches[3]) / 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Get color in desired format
  const getFormattedColor = (color) => {
    return colorFormat === 'hex' ? hslToHex(color) : color;
  };

  // Toggle color format between HSL and HEX
  const toggleColorFormat = () => {
    setColorFormat(prev => prev === 'hsl' ? 'hex' : 'hsl');
  };

  // Generate new palette with locked colors preserved
  const generateNewPalette = () => {
    setPreviousPalette([...palette]);
    setPalette(prev => {
      if (prev.length === 0) {
        // Initial palette generation
        return Array.from({ length: 5 }, () => generateRandomColor());
      } else {
        // Subsequent generations - respect locked colors
        return prev.map((color, i) => lockedColors[i] ? color : generateRandomColor());
      }
    });
  };

  // Toggle lock status for a color
  const toggleLock = (index) => {
    setLockedColors(prev => {
      const newLocks = [...prev];
      newLocks[index] = !newLocks[index];
      return newLocks;
    });
  };

  // Enhanced copy to clipboard with notification
  const copyToClipboard = (color) => {
    const formattedColor = getFormattedColor(color);
    navigator.clipboard.writeText(formattedColor).then(() => {
      setNotification({ 
        message: `Copied ${formattedColor}`, 
        type: 'success',
        icon: <FaCopy />
      });
    });
  };

  // Calculate text color based on background
  const getTextStyle = (hslColor) => {
    // Extract lightness from HSL
    const matches = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i) || 
                    hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i);
    
    if (!matches) return 'text-black';
    
    const lightness = parseInt(matches[3], 10);
    return lightness < 50 ? 'text-white' : 'text-black';
  };

  // Download palette as PNG
  const downloadPalette = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 200;
    
    palette.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * 240, 0, 240, 200);
      ctx.fillStyle = getTextStyle(color) === 'text-white' ? '#FFFFFF' : '#000000';
      ctx.font = '20px Arial';
      ctx.fillText(getFormattedColor(color), i * 240 + 10, 100);
      
      // Draw lock icon if color is locked
      if (lockedColors[i]) {
        ctx.fillText('🔒', i * 240 + 10, 130);
      }
    });

    const link = document.createElement('a');
    link.download = 'color-palette.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    setNotification({ 
      message: 'Palette downloaded', 
      type: 'success',
      icon: <FaDownload />
    });
  };

  // Share palette using Web Share API
  const sharePalette = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Color Palette',
          text: `Check out this palette: ${palette.map(color => getFormattedColor(color)).join(', ')}`
        });
        setNotification({ 
          message: 'Shared successfully!', 
          type: 'success',
          icon: <FaShareAlt />
        });
      } catch (err) {
        setNotification({ 
          message: 'Sharing failed', 
          type: 'error',
          icon: <FaExclamationTriangle />
        });
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard(palette.map(color => getFormattedColor(color)).join(', '));
      setNotification({
        message: 'Palette copied to clipboard (share not supported in this browser)',
        type: 'success',
        icon: <FaCopy />
      });
    }
  };

  // Notification component
  const Notification = ({ notification }) => (
    <AnimatePresence>
      {notification && (
        <motion.div 
          className={`fixed top-3 right-3 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
            notification.type === 'success' ? 'bg-white border-l-4 border-green-600' : 'bg-red-500'
          }`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
        >
          <span className="mr-2">{notification.icon}</span>
          <span className="text-black">{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300 p-4`}>
      {/* Dark mode toggle */}
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg transition-all hover:scale-110"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-blue-900" />}
      </button>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className={`text-4xl font-bold mb-8 flex items-center justify-center ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FaPalette className="mr-3 text-purple-600" />
          Color Palette Generator
        </h1>

        {/* Color Format Toggle */}
        <div className="flex justify-center mb-6">
          <button 
            onClick={toggleColorFormat}
            className={`px-4 py-2 rounded-md shadow transition-all ${
              darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            Format: {colorFormat.toUpperCase()}
          </button>
        </div>

        {/* Color Palette Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {palette.map((color, index) => (
            <motion.div 
              key={index} 
              className="relative group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div 
                className="h-48 rounded-lg shadow-md flex items-center justify-center transition-all"
                style={{ backgroundColor: color }}
              >
                {/* Color code display */}
                <motion.span 
                  className={`text-lg font-mono px-3 py-1 rounded  ${
                    getTextStyle(color)
                   
                  }`}
                  style={{ Color: getFormattedColor(color) }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {getFormattedColor(color)}
                </motion.span>
              </div>

              {/* Action buttons */}
              <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => toggleLock(index)}
                  className="p-2 bg-white bg-opacity-90 rounded-full shadow hover:bg-opacity-100 transition-all"
                  aria-label={lockedColors[index] ? "Unlock color" : "Lock color"}
                >
                  {lockedColors[index] ? 
                    <FaLock className="text-gray-800" /> : 
                    <FaUnlock className="text-gray-800" />
                  }
                </button>
                <button 
                  onClick={() => copyToClipboard(color)}
                  className="p-2 bg-white bg-opacity-90 rounded-full shadow hover:bg-opacity-100 transition-all"
                  aria-label="Copy color code"
                >
                  <FaCopy className="text-gray-800" />
                </button>
              </div>
              
              {/* Lock indicator */}
              {lockedColors[index] && (
                <div className="absolute top-2 left-2">
                  <FaLock className={`${getTextStyle(color)} text-opacity-80`} />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={generateNewPalette}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <FaSync className="mr-2" />
            Generate Palette
          </button>
          <button
            onClick={downloadPalette}
            className="flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <FaDownload className="mr-2" />
            Download
          </button>
          <button
            onClick={sharePalette}
            className="flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <FaShareAlt className="mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Notification System */}
      <Notification notification={notification} />
    </div>
  );
};

export default GeneratePalette;