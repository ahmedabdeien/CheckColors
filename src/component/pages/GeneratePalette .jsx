import React, { useState, useEffect } from 'react';
import {
  FaCopy, FaWandMagicSparkles, FaDownload, FaClockRotateLeft,
  FaLock, FaLockOpen, FaCircleInfo, FaCheck, FaLightbulb, FaPalette
} from 'react-icons/fa6';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import chroma from 'chroma-js';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';
const GeneratePalette = () => {
  const [palette, setPalette] = useState([]);
  const [previousPalettes, setPreviousPalettes] = useState([]);
  const [lockedColors, setLockedColors] = useState(Array(5).fill(false));
  const [isLoading, setIsLoading] = useState(false);
  const [colorMode, setColorMode] = useState('vibrant');
  const [notification, setNotification] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [paletteNames, setPaletteNames] = useState({});
  const controls = useAnimation();

  // Initialize palette on component mount
  useEffect(() => {
    generateAIPalette();
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
// Enhanced HSL to Hex conversion with chroma.js
const hslToHex = (hslColor) => {
  try {
    return chroma(hslColor).hex();
  } catch (e) {
    return hslColor;
  }
};
  // Generate colors based on the selected mode
  const generateColorByMode = () => {
    switch(colorMode) {
      case 'pastel':
        return generatePastelColor();
      case 'monochrome':
        return generateMonochromeColor();
      case 'autumn':
        return generateSeasonalColor('autumn');
      case 'winter':
        return generateSeasonalColor('winter');
      case 'spring':
        return generateSeasonalColor('spring');
      case 'summer':
        return generateSeasonalColor('summer');
      case 'vibrant':
      default:
        return generateVibrantColor();
    }
  };

  // Generate a vibrant color
  const generateVibrantColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30 + 70); // 70-100% saturation
    const lightness = Math.floor(Math.random() * 30 + 45); // 45-75% lightness
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Generate a pastel color
  const generatePastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 20 + 40); // 40-60% saturation
    const lightness = Math.floor(Math.random() * 15 + 75); // 75-90% lightness
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Generate a monochrome color
  const generateMonochromeColor = () => {
    // Use a base hue for the entire palette
    const baseHue = palette.length > 0 && palette[0].includes('hsl') 
      ? parseInt(palette[0].match(/hsl\((\d+)/)[1]) 
      : Math.floor(Math.random() * 360);
    
    const saturation = Math.floor(Math.random() * 20 + 15); // 15-35% saturation
    const lightness = Math.floor(Math.random() * 70 + 15); // 15-85% lightness
    return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  };

  // Generate a seasonal color
  const generateSeasonalColor = (season) => {
    let hueRange, satRange, lightRange;
    
    switch(season) {
      case 'autumn':
        hueRange = { min: 0, max: 60 }; // red to yellow
        satRange = { min: 40, max: 80 };
        lightRange = { min: 30, max: 60 };
        break;
      case 'winter':
        hueRange = { min: 180, max: 270 }; // cyan to blue-purple
        satRange = { min: 20, max: 60 };
        lightRange = { min: 40, max: 80 };
        break;
      case 'spring':
        hueRange = { min: 60, max: 150 }; // yellow to green
        satRange = { min: 40, max: 80 };
        lightRange = { min: 60, max: 85 };
        break;
      case 'summer':
        hueRange = { min: 270, max: 330 }; // purple to pink
        satRange = { min: 50, max: 90 };
        lightRange = { min: 50, max: 75 };
        break;
      default:
        hueRange = { min: 0, max: 360 };
        satRange = { min: 70, max: 100 };
        lightRange = { min: 45, max: 75 };
    }
    
    const hue = Math.floor(Math.random() * (hueRange.max - hueRange.min) + hueRange.min);
    const saturation = Math.floor(Math.random() * (satRange.max - satRange.min) + satRange.min);
    const lightness = Math.floor(Math.random() * (lightRange.max - lightRange.min) + lightRange.min);
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // HSL to Hex conversion
  // const hslToHex = (hslColor) => {
  //   // Extract hsl values
  //   const matches = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i) || 
  //                   hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i);
    
  //   if (!matches) return hslColor;
    
  //   const h = parseInt(matches[1]) / 360;
  //   const s = parseInt(matches[2]) / 100;
  //   const l = parseInt(matches[3]) / 100;
    
  //   let r, g, b;
    
  //   if (s === 0) {
  //     r = g = b = l;
  //   } else {
  //     const hue2rgb = (p, q, t) => {
  //       if (t < 0) t += 1;
  //       if (t > 1) t -= 1;
  //       if (t < 1/6) return p + (q - p) * 6 * t;
  //       if (t < 1/2) return q;
  //       if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  //       return p;
  //     };
      
  //     const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  //     const p = 2 * l - q;
      
  //     r = hue2rgb(p, q, h + 1/3);
  //     g = hue2rgb(p, q, h);
  //     b = hue2rgb(p, q, h - 1/3);
  //   }
    
  //   const toHex = (x) => {
  //     const hex = Math.round(x * 255).toString(16);
  //     return hex.length === 1 ? '0' + hex : hex;
  //   };
    
  //   return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  // };

  // Function to generate an AI palette
  const generateAIPalette = () => {
    setIsLoading(true);
    
    // Save current palette to history before generating a new one
    if (palette.length > 0) {
      setPreviousPalettes(prev => [palette, ...prev].slice(0, 10));
    }
    
    // Simulate an AI API call with a delay
    setTimeout(() => {
      setPalette(prev => {
        const newPalette = prev.map((color, index) => {
          if (lockedColors[index]) {
            return color;
          }
          return generateColorByMode();
        });
        
        // Initialize empty palette
        if (prev.length === 0) {
          return Array.from({ length: 5 }, () => generateColorByMode());
        }
        
        return newPalette;
      });
      setIsLoading(false);
    }, 1500);
  };

  // Function to copy color to clipboard
  const copyToClipboard = (color) => {
    const hexColor = color.startsWith('hsl') ? hslToHex(color) : color;
    navigator.clipboard.writeText(hexColor).then(() => {
      setNotification({
        message: `Copied: ${hexColor}`,
        icon: <FaCheck />,
        type: 'success'
      });
    });
  };

  // Function to toggle lock status of a color
  const toggleLock = (index) => {
    setLockedColors(prev => {
      const newLocked = [...prev];
      newLocked[index] = !newLocked[index];
      return newLocked;
    });
  };

  // Function to restore a previous palette
  const restorePalette = (oldPalette) => {
    setPalette(oldPalette);
    setShowHistory(false);
  };

  // Function to download palette as PNG
  const downloadPalette = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 200;
    
    palette.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * 200, 0, 200, 200);
      
      // Add color code
      ctx.fillStyle = getTextColor(color);
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(color, i * 200 + 100, 100);
      
      // Add hex code if it's HSL
      if (color.startsWith('hsl')) {
        ctx.fillText(hslToHex(color), i * 200 + 100, 130);
      }
    });
    
    const link = document.createElement('a');
    link.download = 'ai-palette.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    setNotification({
      message: 'Palette downloaded successfully',
      icon: <FaDownload />,
      type: 'success'
    });
  };

  // Function to get text color based on background color
  const getTextColor = (bgColor) => {
    let lightness;
    
    if (bgColor.startsWith('hsl')) {
      const matches = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i);
      if (matches) {
        lightness = parseInt(matches[3]);
      } else {
        lightness = 50;
      }
    } else {
      // For hex colors, approximate lightness
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      lightness = (r * 0.299 + g * 0.587 + b * 0.114) / 2.55;
    }
    
    return lightness > 60 ? '#000000' : '#FFFFFF';
  };

  // Save palette with a name
  const savePalette = (name) => {
    const paletteId = Date.now().toString();
    const newPaletteNames = { ...paletteNames, [paletteId]: name };
    setPaletteNames(newPaletteNames);
    
    // Save to localStorage
    localStorage.setItem('savedPalettes', JSON.stringify({
      palettes: [...previousPalettes, palette],
      names: newPaletteNames
    }));
    
    setNotification({
      message: `Palette saved as "${name}"`,
      icon: <FaCheck />,
      type: 'success'
    });
  };

  // Get a palette name suggestion based on color mode
  const getPaletteSuggestion = () => {
    const adjectives = ['Elegant', 'Serene', 'Bold', 'Dreamy', 'Vibrant', 'Soft', 'Dynamic'];
    const nouns = ['Horizon', 'Sunset', 'Garden', 'Ocean', 'Mountain', 'Forest', 'Breeze'];
    
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${randomAdj} ${randomNoun} (${colorMode})`;
  };

  const Notification = ({ notification }) => (
    <AnimatePresence>
      {notification && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3"
          style={{ border: `1px solid ${LI_BORDER}` }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-1.5 rounded-full"
            style={{ backgroundColor: notification.type === 'success' ? '#F0FFF6' : '#FFF0F0' }}>
            {notification.icon}
          </div>
          <p className="text-sm font-medium" style={{ color: LI_TEXT }}>{notification.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const PaletteGrid = () => (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-5xl mb-8"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      initial="hidden"
      animate="visible"
    >
      {palette.map((color, index) => (
        <motion.div key={index} className="relative group" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <div
            className="h-44 rounded-xl flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
            style={{ backgroundColor: color, border: `1px solid ${LI_BORDER}` }}
            onClick={() => copyToClipboard(color)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            <div className="relative z-10 p-4 text-center">
              <p className="font-semibold text-sm" style={{ color: getTextColor(color) }}>
                {hslToHex(color).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => toggleLock(index)} className="p-2 bg-white/90 rounded-full shadow">
              {lockedColors[index]
                ? <FaLock style={{ color: '#CC1016', fontSize: 12 }} />
                : <FaLockOpen style={{ color: '#057642', fontSize: 12 }} />}
            </button>
            <button onClick={() => copyToClipboard(color)} className="p-2 bg-white/90 rounded-full shadow">
              <FaCopy style={{ color: LI_TEXT, fontSize: 12 }} />
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const ModeSelector = () => (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-2">
        {['vibrant', 'pastel', 'monochrome', 'autumn', 'winter', 'spring', 'summer'].map(mode => (
          <button
            key={mode}
            onClick={() => setColorMode(mode)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: colorMode === mode ? LI_BLUE : '#fff',
              color: colorMode === mode ? '#fff' : LI_MUTED,
              border: `1px solid ${colorMode === mode ? LI_BLUE : LI_BORDER}`,
            }}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      <button onClick={generateAIPalette} disabled={isLoading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold disabled:opacity-60"
        style={{ backgroundColor: LI_BLUE }}>
        <FaWandMagicSparkles className="text-xs" /> Generate New
      </button>
      <button onClick={downloadPalette}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold"
        style={{ backgroundColor: '#057642' }}>
        <FaDownload className="text-xs" /> Download
      </button>
      <button onClick={() => savePalette(getPaletteSuggestion())}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border"
        style={{ borderColor: LI_BORDER, color: LI_TEXT, backgroundColor: '#fff' }}>
        <FaCheck className="text-xs" style={{ color: '#057642' }} /> Save
      </button>
      <button onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border"
        style={{ borderColor: LI_BORDER, color: LI_TEXT, backgroundColor: '#fff' }}>
        <FaClockRotateLeft className="text-xs" style={{ color: LI_MUTED }} /> History
      </button>
    </div>
  );

  const HistoryDrawer = () => (
    <AnimatePresence>
      {showHistory && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex justify-end"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="w-full md:w-2/3 lg:w-1/2 bg-white h-full overflow-y-auto p-6"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: LI_TEXT }}>Palette History</h2>
              <button onClick={() => setShowHistory(false)} className="p-1.5 rounded-full hover:bg-gray-50">
                <span style={{ color: LI_MUTED, fontSize: 18 }}>✕</span>
              </button>
            </div>
            {previousPalettes.length > 0 ? (
              previousPalettes.map((oldPalette, index) => (
                <motion.div key={index} className="grid grid-cols-5 gap-2 mb-4 cursor-pointer rounded-lg overflow-hidden"
                  whileHover={{ scale: 1.02 }} onClick={() => restorePalette(oldPalette)}>
                  {oldPalette.map((color, i) => (
                    <div key={i} className="h-16 rounded" style={{ backgroundColor: color }} />
                  ))}
                </motion.div>
              ))
            ) : (
              <div className="text-center mt-10">
                <FaLightbulb style={{ fontSize: 40, color: LI_MUTED, margin: '0 auto 12px' }} />
                <p className="text-sm font-medium" style={{ color: LI_TEXT }}>No history yet</p>
                <p className="text-xs" style={{ color: LI_MUTED }}>Generate some palettes to see history</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} className="py-10 px-4">
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#EEF3F8' }}>
            <FaPalette style={{ color: LI_BLUE, fontSize: 18 }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: LI_TEXT }}>Generate Color Palette</h1>
        </div>
        <p className="text-sm" style={{ color: LI_MUTED }}>
          Create beautiful, accessible color schemes with AI-powered suggestions
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <ModeSelector />
        <div className="flex justify-center">
          <PaletteGrid />
        </div>
        <ActionButtons />
        <HistoryDrawer />
        <Notification notification={notification} />
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: `${LI_BLUE}40`, borderTopColor: LI_BLUE }} />
          <p className="text-sm font-medium" style={{ color: LI_TEXT }}>Generating your palette...</p>
          <div className="w-64 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EEF3F8' }}>
            <motion.div className="h-full rounded-full" style={{ backgroundColor: LI_BLUE }}
              initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: 'linear' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratePalette;