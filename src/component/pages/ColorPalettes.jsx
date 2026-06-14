import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaHeart, FaClipboard, FaDownload, FaMagnifyingGlass, FaPlus,
  FaShareNodes, FaTableCells, FaList, FaXmark, FaCheck,
  FaArrowRotateRight, FaArrowRight, FaFilter, FaBookmark
} from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const TAGS = ['all', 'bright', 'dark', 'pastel', 'neon', 'vintage', 'modern', 'minimal', 'bold', 'random'];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

const getContrastColor = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
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

const ColorSwatch = ({ color, onCopy }) => (
  <motion.div
    onClick={() => onCopy(color)}
    className="flex-1 relative group cursor-pointer"
    style={{ backgroundColor: color }}
    whileHover={{ flex: 2 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <motion.button
      onClick={() => onCopy(color)}
      className="absolute bottom-2 right-[50%] translate-x-[50%] p-1.5 opacity-0 group-hover:opacity-100"
      whileHover={{ scale: 1.1 }}
      aria-label="Copy color"
    >
      <FaClipboard size={14} style={{ color: getContrastColor(color) }} />
    </motion.button>
    <motion.div
      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="px-2 py-1 rounded-md text-xs font-medium"
        style={{ color: getContrastColor(color) }}>
        {color.toUpperCase()}
      </span>
    </motion.div>
  </motion.div>
);

const PaletteCard = React.memo(({ palette, toggleLike, copyToClipboard, toggleSave, downloadPalette, sharePalette }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    className="rounded-xl overflow-hidden bg-white"
    style={{ border: `1px solid ${LI_BORDER}` }}
  >
    <div className="flex h-32">
      {palette.colors.map((color, i) => (
        <ColorSwatch key={i} color={color} onCopy={copyToClipboard} />
      ))}
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          <h3 className="font-semibold truncate text-sm" style={{ color: LI_TEXT }}>{palette.name}</h3>
          <p className="text-xs" style={{ color: LI_MUTED }}>by {palette.author}</p>
        </div>
        <motion.button
          onClick={() => toggleLike(palette.id)}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-1 text-xs"
          aria-label="Like palette"
        >
          <FaHeart size={16} style={{ color: palette.liked ? '#CC1016' : '#ccc' }} />
          <span style={{ color: LI_MUTED }}>{palette.likes.toLocaleString()}</span>
        </motion.button>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span style={{ color: LI_MUTED }}>{formatTimeAgo(palette.createdAt)}</span>
          {palette.tags.slice(0, 2).map(tag => (
            <motion.span key={tag}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}
              whileHover={{ y: -1 }}>
              {tag}
            </motion.span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <motion.button onClick={() => toggleSave(palette.id)}
            className="p-1.5 rounded-full hover:bg-gray-50"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Save">
            <FaBookmark size={14} style={{ color: palette.saved ? LI_BLUE : '#ccc' }} />
          </motion.button>
          <motion.button onClick={() => downloadPalette(palette)}
            className="p-1.5 rounded-full hover:bg-gray-50"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Download">
            <FaDownload size={14} style={{ color: LI_MUTED }} />
          </motion.button>
          <motion.button onClick={() => sharePalette(palette)}
            className="p-1.5 rounded-full hover:bg-gray-50"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Share">
            <FaShareNodes size={14} style={{ color: LI_MUTED }} />
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
));

const ColorPalettes = () => {
  const [palettes, setPalettes] = useState([]);
  const [filterTag, setFilterTag] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateRandomColor = useCallback(() => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
  }, []);

  const randomFrom = (array) => array[Math.floor(Math.random() * array.length)];

  const generateRandomPalette = useCallback(() => {
    const adjectives = ['Vibrant', 'Serene', 'Bold', 'Muted', 'Autumn', 'Summer', 'Winter'];
    const nouns = ['Harmony', 'Symphony', 'Palette', 'Spectrum', 'Collection'];
    return {
      id: Date.now() + Math.random(),
      name: `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`,
      author: ['ColorMaster', 'PaletteCreator', 'HueGenius'][Math.floor(Math.random() * 3)],
      colors: Array(5).fill(null).map(generateRandomColor),
      likes: Math.floor(Math.random() * 1000),
      tags: ['random', randomFrom(['bright', 'dark', 'pastel', 'neon', 'vintage', 'modern', 'minimal', 'bold'])],
      createdAt: new Date().toISOString(),
      liked: false,
      saved: false,
    };
  }, [generateRandomColor]);

  const createPaletteImage = (palette) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width = 800;
    canvas.height = 450;
    const numColors = palette.colors.length;
    const colorHeight = 350;
    const sectionWidth = canvas.width / numColors;
    palette.colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * sectionWidth, 0, sectionWidth, colorHeight);
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = getContrastColor(color);
      ctx.fillText(color.toUpperCase(), i * sectionWidth + sectionWidth / 2, colorHeight / 2);
    });
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, colorHeight, canvas.width, canvas.height - colorHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(palette.name, 20, colorHeight + 50);
    ctx.font = '18px Arial';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`By ${palette.author} • ❤️ ${palette.likes}`, 20, colorHeight + 90);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  useEffect(() => {
    const fetchPalettes = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setPalettes(Array(16).fill(null).map(generateRandomPalette));
      setIsLoading(false);
    };
    fetchPalettes();
  }, [generateRandomPalette]);

  const filteredPalettes = useMemo(() => palettes.filter(p => {
    const matchesTag = filterTag === 'all' || p.tags.includes(filterTag);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTag && matchesSearch;
  }), [palettes, filterTag, searchTerm]);

  const sortedPalettes = useMemo(() => [...filteredPalettes].sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes;
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  }), [filteredPalettes, sortBy]);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleCreatePalette = useCallback(() => {
    const newPalette = generateRandomPalette();
    setPalettes(prev => [newPalette, ...prev]);
    showNotification('New palette created!', 'success');
  }, [generateRandomPalette, showNotification]);

  const copyToClipboard = useCallback((color) => {
    navigator.clipboard.writeText(color);
    showNotification(`${color} copied!`, 'success');
  }, [showNotification]);

  const downloadPalette = useCallback((palette) => {
    const dataUrl = createPaletteImage(palette);
    if (!dataUrl) return;
    downloadImage(dataUrl, `${palette.name.replace(/[^a-z0-9]/gi, '_')}_palette.jpg`);
    showNotification(`${palette.name} downloaded!`, 'success');
  }, [showNotification]);

  const toggleLike = useCallback((id) => {
    setPalettes(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  }, []);

  const toggleSave = useCallback((id) => {
    setPalettes(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
  }, []);

  const sharePalette = useCallback((palette) => {
    const shareData = {
      title: `Color Palette: ${palette.name}`,
      text: `Check out this color palette: ${palette.colors.join(', ')}`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => showNotification('Sharing cancelled', 'error'));
    } else {
      navigator.clipboard.writeText(`${palette.name}\nColors: ${palette.colors.join(', ')}`);
      showNotification('Palette copied to clipboard', 'success');
    }
  }, [showNotification]);

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>

      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-grow max-w-xl">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search palettes..."
              className="pl-9 pr-8 py-2 rounded-lg w-full text-sm outline-none"
              style={{ backgroundColor: '#F3F2EF', border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={e => e.target.style.borderColor = LI_BLUE}
              onBlur={e => e.target.style.borderColor = LI_BORDER}
            />
            {searchTerm && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setSearchTerm('')}>
                <FaXmark className="text-xs" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={handleCreatePalette}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: LI_BLUE }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
              <FaPlus className="text-xs" />
              <span className="hidden md:inline">Create</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-screen-xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: LI_TEXT }}>
            Craft Your Perfect Color Palette
          </h1>
          <p className="text-base mb-6" style={{ color: LI_MUTED }}>
            Discover and create stunning color combinations powered by AI
          </p>
          <button onClick={handleCreatePalette}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: LI_BLUE }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
            Generate New Palette <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-14 z-10 bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap md:flex-nowrap gap-3 items-center">
          <div className="flex gap-2 overflow-x-auto flex-grow" style={{ scrollbarWidth: 'none' }}>
            {TAGS.map(tag => (
              <button key={tag}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: filterTag === tag ? LI_BLUE : '#F3F2EF',
                  color: filterTag === tag ? '#fff' : LI_MUTED,
                }}
                onClick={() => setFilterTag(tag)}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select className="px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT, backgroundColor: '#fff' }}
              value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: '#F3F2EF' }}>
              {[['grid', FaTableCells], ['list', FaList]].map(([viewType, Icon]) => (
                <button key={viewType}
                  className="p-1.5 rounded-md transition-colors"
                  style={{
                    backgroundColor: view === viewType ? LI_BLUE : 'transparent',
                    color: view === viewType ? '#fff' : LI_MUTED,
                  }}
                  onClick={() => setView(viewType)}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className={`${view === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'} gap-4`}>
            {[...Array(9)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white" style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="h-32 bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded-full bg-gray-100 w-3/4 animate-pulse" />
                  <div className="h-3 rounded-full bg-gray-100 w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedPalettes.length === 0 ? (
          <div className="text-center py-16">
            <FaMagnifyingGlass size={40} style={{ color: '#ccc', margin: '0 auto 12px' }} />
            <p className="text-sm" style={{ color: LI_MUTED }}>No palettes found</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className={`${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'} gap-4`}>
              {sortedPalettes.map(palette => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  toggleLike={toggleLike}
                  copyToClipboard={copyToClipboard}
                  toggleSave={toggleSave}
                  downloadPalette={downloadPalette}
                  sharePalette={sharePalette}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-white flex items-center gap-3 shadow-lg"
            style={{ border: `1px solid ${LI_BORDER}` }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="p-1.5 rounded-full"
              style={{
                backgroundColor: notification.type === 'success' ? '#F0FFF6' : '#FFF0F0',
                color: notification.type === 'success' ? '#057642' : '#CC1016',
              }}>
              {notification.type === 'success' ? <FaCheck size={14} /> : <FaXmark size={14} />}
            </div>
            <span className="text-sm font-medium" style={{ color: LI_TEXT }}>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <button
        className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg"
        style={{ backgroundColor: LI_BLUE }}
        onClick={handleCreatePalette}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
        <FaPlus size={20} />
      </button>
    </div>
  );
};

export default ColorPalettes;
