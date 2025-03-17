import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LuHeart, 
  LuClipboard, 
  LuDownload, 
  LuSearch, 
  LuPlus, 
  LuShare2, 
  LuGrid2X2, 
  LuList, 
  LuX, 
  LuCheck, 
  LuRefreshCw,
  LuArrowRight,
  LuFilter,
  LuSun,
  LuMoon,
  LuBookmark
} from "react-icons/lu";
import { motion, AnimatePresence } from 'framer-motion'

// Constants
const TAGS = ['all', 'bright', 'dark', 'pastel', 'neon', 'vintage', 'modern', 'minimal', 'bold', 'random'];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' }
];

// Helper functions

const getContrastColor = (hexColor) => {
 
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.slice(0,2), 16);
  const g = parseInt(hex.slice(2,4), 16);
  const b = parseInt(hex.slice(4,6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#000000' : '#FFFFFF';
  
};
const downloadImage = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : `${minutes || 1}m ago`;
};

// Sub-components
const ColorSwatch = ({color, onCopy }) => {
    
  return (
    <motion.div  onClick={() => onCopy(color)}
    className="flex-1 relative group cursor-pointer"
    style={{ backgroundColor: color }}
    whileHover={{ flex: 2 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <motion.button
      onClick={() => onCopy(color)}
      className={`absolute bottom-2 right-[50%] translate-x-[50%] p-1.5 opacity-0 group-hover:opacity-100`}
      whileHover={{ scale: 1.1 }}
      aria-label="Copy color"
    >
      <LuClipboard size={16} style={{ color: getContrastColor(color) }} />
    </motion.button>
    <motion.div 
      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span 
        className="px-2 py-1 rounded-md text-sm font-medium"
        style={{ 
          color: getContrastColor(color),
      
        }}
      >
        {color.toUpperCase()}
      </span>
    </motion.div>
  </motion.div>
  );
};

const PaletteCard = React.memo(({ palette, darkMode, toggleLike, copyToClipboard, toggleSave, downloadPalette, sharePalette }) => {
  return (
    <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={`rounded-xl shadow-lg hover:shadow-xl overflow-hidden transition-all ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}
  >
    <div className="flex h-32">
      {palette.colors.map((color, index) => (
        <ColorSwatch 
          key={index} 
          color={color} 
          onCopy={copyToClipboard}
        />
      ))}
    </div>
    <div className={`p-4 ${darkMode ? 'border-t border-gray-700' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          <h3 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {palette.name}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            by {palette.author}
          </p>
        </div>
        <motion.button 
          onClick={() => toggleLike(palette.id)}
          whileTap={{ scale: 0.9 }}
          className="flex items-center space-x-1 text-sm"
          aria-label="Like palette"
        >
          <LuHeart 
            size={20} 
            className={palette.liked ? 'text-red-500 fill-current animate-heartbeat' : 'text-gray-400'} 
          />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            {palette.likes.toLocaleString()}
          </span>
        </motion.button>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
            {formatTimeAgo(palette.createdAt)}
          </span>
          {palette.tags.slice(0, 2).map(tag => (
            <motion.span 
              key={tag}
              className={`px-2 py-1 rounded-full text-xs ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
              whileHover={{ y: -1 }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <motion.button 
            onClick={() => toggleSave(palette.id)}
            className={`p-1.5 rounded-full ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Save palette"
          >
            <LuBookmark 
              size={18} 
              className={palette.saved ? 'text-purple-500 fill-current' : 'text-gray-400'} 
            />
          </motion.button>
          <motion.button 
            onClick={() => downloadPalette(palette)}
            className={`p-1.5 rounded-full ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Download palette"
          >
            <LuDownload size={18} />
          </motion.button>
          <motion.button 
            onClick={() => sharePalette(palette)}
            className={`p-1.5 rounded-full ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Share palette"
          >
            <LuShare2 size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
  );
});

const ColorPalettes = () => {
  const [palettes, setPalettes] = useState([]);
  const [filterTag, setFilterTag] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);


  // Data generation
  const generateRandomColor = useCallback(() => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }, []);
  // Add this inside your ColorPalettes component
  const randomFrom = (array) => {
    return array[Math.floor(Math.random() * array.length)];
   };
  const generateRandomPalette = useCallback(() => {
    const adjectives = ['Vibrant', 'Serene', 'Bold', 'Muted', 'Autumn', 'Summer', 'Winter'];
    const nouns = ['Harmony', 'Symphony', 'Palette', 'Spectrum', 'Collection'];
    
    return {
      id: Date.now() + Math.random(),
      name: `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`,
      author: ['ColorMaster', 'PaletteCreator', 'HueGenius'][Math.floor(Math.random() * 3)],
      colors: Array(5).fill().map(generateRandomColor),
      likes: Math.floor(Math.random() * 1000),
      // In generateRandomPalette, ensure tags are generated like this:
      tags: ['random', randomFrom(['bright', 'dark', 'pastel', 'neon', 'vintage', 'modern', 'minimal', 'bold'])],
      createdAt: new Date().toISOString(),
      liked: false,
      saved: false
    };
  }, [generateRandomColor]);
  const createPaletteImage = (palette) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
  
    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 450;
    const numColors = palette.colors.length;
    const colorHeight = 350;
    const sectionWidth = canvas.width / numColors;
  
    // Draw color blocks
    palette.colors.forEach((color, i) => {
      // Color area
      ctx.fillStyle = color;
      ctx.fillRect(i * sectionWidth, 0, sectionWidth, colorHeight);
  
      // Color text
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = getContrastColor(color);
      ctx.fillText(
        color.toUpperCase(),
        i * sectionWidth + sectionWidth / 2,
        colorHeight / 2
      );
    });
  
    // Draw info area
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, colorHeight, canvas.width, canvas.height - colorHeight);
  
    // Palette name
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(palette.name, 20, colorHeight + 50);
  
    // Author and likes
    ctx.font = '18px Arial';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`By ${palette.author} • ❤️ ${palette.likes}`, 20, colorHeight + 90);
  
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  
  // Data fetching
  useEffect(() => {
    const fetchPalettes = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      const initialPalettes = Array(16).fill().map(generateRandomPalette);
      setPalettes(initialPalettes);
      setIsLoading(false);
    };
    fetchPalettes();
  }, [generateRandomPalette]);

  // Filtering and sorting
  const filteredPalettes = useMemo(() => {
    return palettes.filter(palette => {
      const matchesTag = filterTag === 'all' || palette.tags.includes(filterTag);
      const matchesSearch = palette.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            palette.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesTag && matchesSearch;
    });
  }, [palettes, filterTag, searchTerm]);

  const sortedPalettes = useMemo(() => {
    return [...filteredPalettes].sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });
  }, [filteredPalettes, sortBy]);

  // Actions
  const handleCreatePalette = useCallback(() => {
    const newPalette = generateRandomPalette();
    setPalettes([newPalette, ...palettes]);
    showNotification('New palette created!', 'success');
  }, [generateRandomPalette , palettes]);
  
  const copyToClipboard = useCallback((color) => {
    navigator.clipboard.writeText(color);
    showNotification(`${color} copied to clipboard!`, 'success');
  }, []);


  const downloadPalette = useCallback((palette) => {
    const dataUrl = createPaletteImage(palette);
    if (!dataUrl) return;
    
    const filename = `${palette.name.replace(/[^a-z0-9]/gi, '_')}_palette.jpg`;
    downloadImage(dataUrl, filename);
    showNotification(`${palette.name} downloaded!`, 'success');
  }, []); // Added dependency

  const toggleLike = useCallback((id) => {
    setPalettes(palettes => palettes.map(palette => {
      if (palette.id === id) {
        const newLiked = !palette.liked;
        return { 
          ...palette, 
          likes: newLiked ? palette.likes + 1 : palette.likes - 1, 
          liked: newLiked 
        };
      }
      return palette;
    }));
  }, []);

  const toggleSave = useCallback((id) => {
    setPalettes(palettes => palettes.map(palette => {
      if (palette.id === id) {
        return { ...palette, saved: !palette.saved };
      }
      return palette;
    }));
  }, []);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);
  const sharePalette = useCallback((palette) => {
    const shareData = {
      title: `Color Palette: ${palette.name}`,
      text: `Check out this ${palette.tags.join(', ')} color palette: ${palette.colors.join(', ')}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData)
        .catch(() => showNotification('Sharing cancelled', 'error'));
    } else {
      navigator.clipboard.writeText(
        `Color Palette: ${palette.name}\n` +
        `Colors: ${palette.colors.join(', ')}\n` +
        `By ${palette.author} • Likes: ${palette.likes}`
      );
      showNotification('Palette copied to clipboard', 'success');
    }
  }, []);
  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Enhanced Header */}
      <header className={`${darkMode ? 'bg-gray-800 shadow-xl' : 'bg-white shadow-md'} z-20`}>
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-4 w-full max-w-2xl">
            <div className="relative flex-grow">
              <LuSearch 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                size={20} 
              />
              <input
                type="text"
                placeholder="Search palettes..."
                className={`pl-10 pr-8 py-2.5 rounded-xl w-full focus:outline-none focus:ring-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 focus:ring-purple-400 placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-200 focus:ring-purple-500 placeholder-gray-500'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <motion.button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                  whileHover={{ scale: 1.1 }}
                >
                  <LuX size={20} />
                </motion.button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle theme"
            >
              {darkMode ? <LuSun size={22} /> : <LuMoon size={22} />}
            </motion.button>
            <motion.button 
              onClick={handleCreatePalette}
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LuPlus size={18} />
              <span className="hidden md:inline">Create</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-500 text-white overflow-hidden"
      >
        <div className="max-w-screen-xl mx-auto px-4 py-16">
          <div className="relative z-10 max-w-2xl">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Craft Your Perfect Color Palette
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl opacity-90 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            >
              Discover and create stunning color combinations powered by AI
            </motion.p>
            <motion.button 
              onClick={handleCreatePalette}
              className="bg-white/10 backdrop-blur-sm px-8 py-4 rounded-xl font-medium shadow-xl hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            >
              <span>Generate New Palette</span>
              <LuArrowRight className="animate-bounce-x" />
            </motion.button>
          </div>
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <div className="absolute w-96 h-96 bg-purple-400 rounded-full -top-48 -right-48 filter blur-3xl opacity-40"></div>
            <div className="absolute w-96 h-96 bg-blue-400 rounded-full -bottom-48 -left-48 filter blur-3xl opacity-40"></div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Filters */}
      <motion.div 
        className={`sticky top-[64px] z-10 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b shadow-sm`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap md:flex-nowrap gap-3 items-center">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-grow">
            {TAGS.map(tag => (
              <motion.button
                key={tag}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filterTag === tag 
                    ? 'bg-purple-600 text-white shadow-inner' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterTag(tag)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </motion.button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Sort by:
              </label>
              <motion.select 
                className={`px-4 py-2 rounded-xl text-sm focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                whileHover={{ y: -1 }}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </motion.select>
            </div>
            
            <div className={`flex gap-1 p-1 rounded-xl ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {['grid', 'list'].map(viewType => (
                <motion.button
                  key={viewType}
                  className={`p-2 rounded-lg ${
                    view === viewType 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  onClick={() => setView(viewType)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {viewType === 'grid' ? <LuGrid2X2 size={20} /> : <LuList size={20} />}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className={`${view === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'} gap-6`}>
            {[...Array(9)].map((_, i) => (
              <motion.div 
                key={i}
                className={`rounded-xl shadow-sm overflow-hidden ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`h-32 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} animate-pulse`}></div>
                <div className="p-4 space-y-3">
                  <div className={`h-4 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} w-3/4`}></div>
                  <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} w-1/2`}></div>
                  <div className="flex gap-2">
                    <div className={`h-6 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                    <div className={`h-6 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ): (
          <>
            {sortedPalettes.length === 0 ? (
              <div className="text-center py-12">
                <LuSearch size={48} className={`mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} />
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No palettes found
                </p>
              </div>
            ) : (
              <div className={`${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'} gap-6`}>
                {sortedPalettes.map(palette => (
          <PaletteCard 
            key={palette.id}
            palette={palette}
            darkMode={darkMode}
            toggleLike={toggleLike}
            copyToClipboard={copyToClipboard} // Single color copy
            // Full palette copy
            toggleSave={toggleSave}
            downloadPalette={downloadPalette}
            sharePalette={sharePalette}
          />
        ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Notification System */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl  flex items-center gap-3 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={`p-2 rounded-full ${
              notification.type === 'success' ? 'bg-green-100 text-green-600' :
              notification.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {notification.type === 'success' ? <LuCheck size={20} /> : <LuX size={20} />}
            </div>
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Palette FAB */}
      <button 
        className={`fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 rounded-full shadow-lg hover:from-purple-700 hover:to-blue-600 transition-transform hover:scale-105 active:scale-95 ${
          darkMode && 'shadow-purple-500/50'
        }`}
        onClick={handleCreatePalette}
      >
        <LuPlus size={24} />
      </button>
    </div>
  );
};

export default ColorPalettes;