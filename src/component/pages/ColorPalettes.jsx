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
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div 
    onClick={() => onCopy(color)}
      className="flex-1 relative group cursor-pointer"
      style={{ backgroundColor: color }}
      whileHover={{ flex: 2 }}
    >
      <button
            onClick={() =>  navigator.clipboard.writeText(color)}
            className={`absolute bottom-2 right-[50%] translate-x-[50%] p-1.5 opacity-0 group-hover:opacity-100 `}
      >
        <LuClipboard size={16} style={{color: getContrastColor(color)}} />
      </button>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <span 
          className="px-2 py-1 rounded-md text-sm font-medium "
          style={{ 
            backgroundColor: color,
            color: getContrastColor(color)
          }}
        >
          {color.toUpperCase()}
        </span>
      </div>
    </motion.div>
  );
};

const PaletteCard = React.memo(({ palette, darkMode, toggleLike, copyToClipboard, toggleSave, downloadPalette, sharePalette }) => {
  return (
    <motion.div 
      layout
      transition={{ duration: 0.3 }}
      className={`rounded-lg shadow-sm hover:shadow-md overflow-hidden ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="flex h-32">
        {palette.colors.map((color, index) => (
          <ColorSwatch 
          key={index} 
          color={color} 
          onCopy={copyToClipboard}/>
        ))}
      </div>
      <div className={`p-4 ${darkMode ? 'border-t border-gray-700' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {palette.name}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              by {palette.author}
            </p>
          </div>
          <button 
            onClick={() => toggleLike(palette.id)}
            className="flex items-center space-x-1 text-sm"
          >
            <LuHeart 
              size={18} 
              className={palette.liked ? 'text-red-500 fill-current' : 'text-gray-400'} 
            />
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              {palette.likes}
            </span>
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {formatTimeAgo(palette.createdAt)}
            </span>
            {palette.tags.slice(0, 2).map(tag => (
              <span 
                key={tag}
                className={`px-2 py-1 rounded-full text-xs ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => toggleSave(palette.id)}
              className={`p-1.5 rounded-full ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <LuBookmark 
                size={16} 
                className={palette.saved ? 'text-purple-500' : 'text-gray-400'} 
              />
            </button>
            <button 
               onClick={() => downloadPalette(palette)}
               className={`p-1.5 rounded-full ${
                 darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
               }`}
            >
              <LuDownload size={16} />
            </button>
            <button 
              onClick={() => sharePalette(palette)}
              className={`p-1.5 rounded-full ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <LuShare2 size={16} />
            </button>
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
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} sticky top-0 z-10`}>
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <LuSearch 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                size={18} 
              />
              <input
                type="text"
                placeholder="Search palettes..."
                className={`pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  <LuX size={18} />
                </button>
              )}
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <LuSun size={20} /> : <LuMoon size={20} />}
            </button>
            <button 
              onClick={handleCreatePalette}
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-blue-600 transition"
            >
              <LuPlus size={16} />
              <span className="hidden md:inline">Create</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-500 text-white">
        <div className="max-w-screen-xl mx-auto px-4 py-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Beautiful Color Palettes</h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              Discover, create, and share stunning color combinations for your next design project
            </p>
            <button 
              onClick={handleCreatePalette}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition flex items-center space-x-2"
            >
              <span>Generate Palette</span>
              <LuArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b sticky top-16 z-10`}>
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap md:flex-nowrap justify-between items-center">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide pb-1 flex-grow">
            {TAGS.map(tag => (
              <button
                key={tag}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  filterTag === tag 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterTag(tag)}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4 mt-2 md:mt-0 ml-auto">
            <div className="flex items-center space-x-2">
              <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Sort:
              </label>
              <select 
                className={`border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'
                }`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={`flex border rounded-lg overflow-hidden shadow-sm ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button 
                className={`px-3 py-1.5 flex items-center ${
                  view === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}
                onClick={() => setView('grid')}
              >
                <LuGrid2X2 size={16} />
              </button>
              <button 
                className={`px-3 py-1.5 flex items-center ${
                  view === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}
                onClick={() => setView('list')}
              >
                <LuList size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className={`${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'} gap-6`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm animate-pulse`}>
                <div className={`h-32 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`p-4 ${darkMode ? 'border-t border-gray-700' : ''}`}>
                  <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded mb-2`}></div>
                  <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-3/4`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {notification.type === 'success' && <LuCheck className="text-green-500" />}
            {notification.type === 'error' && <LuX className="text-red-500" />}
            <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
              {notification.message}
            </span>
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