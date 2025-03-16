import React, { useState, useEffect } from 'react';
import { LuHeart, LuClipboard, LuDownload, LuSearch, LuPlus, LuShare2, LuGrid2X2 , LuList, LuX, LuCheck, LuRefreshCw } from "react-icons/lu";
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

// Extract smaller components
const ColorSwatch = ({ color, onCopy }) => {
  const getContrastColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#000000' : '#FFFFFF';
  };

  return (
    <motion.div
      className="flex-1 relative group"
      style={{ backgroundColor: color }}
      whileHover={{ flex: 2 }}
    >
      <button
        onClick={() => onCopy(color)}
        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-sm transition"
        style={{ color: getContrastColor(color) }}
      >
        <LuClipboard size={16} />
      </button>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <span 
          className="px-2 py-1 rounded-md text-sm font-medium shadow-sm"
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

const Notification = ({ notification }) => (
  <AnimatePresence>
    {notification && (
      <motion.div 
      
        className={`fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg px-4 py-3 flex items-center space-x-2 ${
          notification.type === 'success' ? 'border-l-4 border-green-500' : 
          notification.type === 'error' ? 'border-l-4 border-red-500' : 
          'border-l-4 border-blue-500'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        {notification.type === 'success' && <LuCheck className="text-green-500" />}
        {notification.type === 'error' && <LuX className="text-red-500" />}
        {notification.type === 'info' && <LuSearch className="text-blue-500" />}
        <span>{notification.message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

const PaletteCard = ({ palette, onToggleLike, onCopyColor, onDownload, onShare }) => (
  <div className='grid grid-cols-3'>
  <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 ">
    {/* Color Swatches */}
    <div className="flex h-32 cursor-pointer">
      {palette.colors.map((color, index) => (
        <ColorSwatch key={index} color={color} onCopy={onCopyColor} />
      ))}
    </div>

    {/* Palette Info */}
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{palette.name}</h3>
          <p className="text-sm text-gray-500">by {palette.author}</p>
        </div>
        <button 
          onClick={() => onToggleLike(palette.id)}
          className="flex items-center space-x-1 text-sm"
        >
          <LuHeart 
            size={18} 
            className={palette.liked ? 'text-red-500 fill-current' : 'text-gray-400'} 
          />
          <span>{palette.likes}</span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">
            {formatDistanceToNow(new Date(palette.createdAt))} ago
          </span>
          {palette.tags.slice(0, 2).map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onDownload(palette)}
            className="p-1.5 hover:bg-gray-100 rounded-full"
          >
            <LuDownload size={16} />
          </button>
          <button 
            onClick={() => onShare(palette)}
            className="p-1.5 hover:bg-gray-100 rounded-full"
          >
            <LuShare2 size={16} />
          </button>
        </div>
      </div>
    </div>
  </div></div>
);

const ColorPaletteExplorer = () => {
  const [palettes, setPalettes] = useState([]);
  const [filterTag, setFilterTag] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simplified random data generation
  const randomFrom = (array) => array[Math.floor(Math.random() * array.length)];
  
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  const generateRandomPalette = (index) => {
    const adjectives = ['Vibrant', 'Serene', 'Bold', 'Muted', 'Autumn', 'Summer', 'Winter', 'Spring', 'Urban', 'Forest'];
    const nouns = ['Harmony', 'Symphony', 'Palette', 'Spectrum', 'Collection', 'Theme', 'Atmosphere', 'Tones', 'Shades'];
    const names = ['ColorMaster', 'PaletteCreator', 'HueGenius', 'ChromaDesigner', 'PigmentPro'];
    const tagOptions = ['bright', 'dark', 'pastel', 'neon', 'vintage'];
    
    return {
      id:`palette-${Date.now()}-${index}`,
      name: `${randomFrom(adjectives)} ${randomFrom(nouns)}`,
      author: randomFrom(names),
      colors: Array(5).fill().map(() => generateRandomColor()),
      likes: Math.floor(Math.random() * 1000),
      tags: ['random', 'new', randomFrom(tagOptions)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      liked: false
    };
  };
  
  // Initialize with some random palettes
  useEffect(() => {
    const fetchPalettes = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const initialPalettes = Array.from({ length: 16 }, (_, i) => 
        generateRandomPalette(i) // Pass index to generator
      );
      setPalettes(initialPalettes);
      setIsLoading(false);
    };
    
    fetchPalettes();
  }, []);
  
  // Notification helper
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Action handlers
  const handleCreatePalette = () => {
    const newPalette = generateRandomPalette();
    setPalettes([newPalette, ...palettes]);
    showNotification('New palette created!', 'success');
  };
  
  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    showNotification(`${color} copied to clipboard!`, 'success');
  };
  
  const toggleLike = (id) => {
    setPalettes(palettes.map(palette => {
      if (palette.id === id) {
        const newLiked = !palette.liked;
        showNotification(newLiked ? 'Added to favorites!' : 'Removed from favorites', newLiked ? 'success' : 'info');
        return { 
          ...palette, 
          likes: newLiked ? palette.likes + 1 : palette.likes - 1, 
          liked: newLiked 
        };
      }
      return palette;
    }));
  };

  const downloadPalette = (palette => {
    const blob = new Blob([JSON.stringify(palette)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${palette.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
   }) 
    
 

  const sharePalette = (palette) => {
    if (navigator.share) {
      navigator.share({
        title: palette.name,
        url: `https://color-palette-generator.vercel.app/palette/${palette.id}`,
        text: `Check out this beautiful color palette by ${palette.author}!`,
      })
       .then(() => showNotification('Palette shared!','success'))
       .catch(() => showNotification('Failed to share palette', 'error'));
    } else {
      showNotification('Sharing not supported on this device', 'error');
    }
  };
  
  
  // Filter and sort palettes
  const filteredPalettes = palettes.filter(palette => {
    const matchesTag = filterTag === 'all' || palette.tags.includes(filterTag);
    const matchesSearch = !searchTerm || 
      palette.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      palette.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTag && matchesSearch;
  });
  
  const sortedPalettes = [...filteredPalettes].sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes;
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });
  
  // Available tags for filtering
  const tags = ['all', 'bright', 'dark', 'pastel', 'neon', 'vintage', 'random', 'new'];

  return (
    <div className="bg-gray-50 min-h-screen w-full font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">ColorPalettes</div>
            <div className="hidden md:flex space-x-1">
              {['red', 'yellow', 'green', 'blue', 'purple'].map(color => (
                <div key={color} className={`w-4 h-4 bg-${color}-500 rounded-full`}></div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuSearch size={16} className="text-gray-400" />
              </div>
              <input 
                type="text"
                placeholder="Search palettes..." 
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm('')}
                >
                  <LuX size={16} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <button 
              onClick={handleCreatePalette}
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-blue-600 transition shadow-sm hover:shadow"
            >
              <LuPlus size={16} />
              <span className="hidden md:inline">Create</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Filters */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap md:flex-nowrap justify-between items-center">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide pb-1 flex-grow">
            {tags.map(tag => (
              <button
                key={tag}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  filterTag === tag 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterTag(tag)}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4 mt-2 md:mt-0 ml-auto">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort:</label>
              <select 
                className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setView('grid')}
                className={`p-2 rounded-lg hover:bg-gray-100 ${view === 'grid' ? 'bg-gray-200' : ''}`}
              >
                <LuGrid2X2 size={18} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-2 rounded-lg hover:bg-gray-100 ${view === 'list' ? 'bg-gray-200' : ''}`}
              >
                <LuList size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {sortedPalettes.length === 0 ? (
              <div className="text-center py-12">
                <LuSearch size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No palettes found</p>
              </div>
            ) : (
              <div className={`${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'} gap-6`}>
                {sortedPalettes.map(palette => (
                  <PaletteCard 
                    key={palette.id}
                    palette={palette}
                    onToggleLike={toggleLike}
                    onCopyColor={copyToClipboard}
                    onDownload={downloadPalette}
                    onShare={sharePalette}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Notification System */}
      <Notification notification={notification} />

      {/* Create Palette FAB */}
      <button 
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 rounded-full shadow-lg hover:from-purple-700 hover:to-blue-600 transition transform hover:scale-105 active:scale-95"
        onClick={handleCreatePalette}
      >
        <LuPlus size={24} />
      </button>
    </div>
  );
};

export default ColorPaletteExplorer;