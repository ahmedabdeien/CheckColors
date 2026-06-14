import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  FaHeart, FaClipboard, FaDownload, FaMagnifyingGlass, FaPlus,
  FaShareNodes, FaTableCells, FaList, FaXmark, FaCheck,
  FaArrowRotateRight, FaFilter
} from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const getContrast = (hex) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#000000' : '#FFFFFF';
};

const ColorSwatch = ({ color, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    onCopy(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex-1 relative group h-24 cursor-pointer" style={{ backgroundColor: color }} onClick={handle}>
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {copied
          ? <FaCheck className="text-sm mb-1" style={{ color: getContrast(color) }} />
          : <FaClipboard className="text-sm mb-1" style={{ color: getContrast(color) }} />}
        <span className="text-[10px] font-mono font-medium px-1 rounded" style={{ color: getContrast(color) }}>
          {color.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

const PaletteCard = ({ palette, onToggleLike, onCopyColor, onDownload, onShare }) => (
  <div className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow" style={{ border: `1px solid ${LI_BORDER}` }}>
    <div className="flex h-24">
      {palette.colors.map((color, i) => (
        <ColorSwatch key={i} color={color} onCopy={onCopyColor} />
      ))}
    </div>
    <div className="p-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold leading-tight" style={{ color: LI_TEXT }}>{palette.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: LI_MUTED }}>by {palette.author}</p>
        </div>
        <button onClick={() => onToggleLike(palette.id)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors"
          style={{
            backgroundColor: palette.liked ? '#FFF0F0' : '#F3F2EF',
            color: palette.liked ? '#CC1016' : LI_MUTED
          }}>
          <FaHeart className={palette.liked ? 'fill-current' : ''} />
          <span>{palette.likes}</span>
        </button>
      </div>
      <div className="flex gap-1 mt-2">
        {palette.colors.slice(0, 3).map((c, i) => (
          <span key={i} className="text-[9px] font-mono" style={{ color: LI_MUTED }}>{c}</span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${LI_BORDER}` }}>
        <div className="flex gap-1">
          {palette.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>{tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onDownload(palette)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: LI_MUTED }}>
            <FaDownload className="text-xs" />
          </button>
          <button onClick={() => onShare(palette)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: LI_MUTED }}>
            <FaShareNodes className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TAGS = ['all', 'bright', 'dark', 'pastel', 'neon', 'vintage', 'random', 'new'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomHex = () => '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
const randomPalette = (i) => ({
  id: `p-${Date.now()}-${i}`,
  name: `${randomFrom(['Vibrant','Serene','Bold','Muted','Autumn','Urban','Forest','Sunset','Electric','Calm'])} ${randomFrom(['Harmony','Spectrum','Tones','Palette','Shades','Blend','Flow'])}`,
  author: randomFrom(['ColorMaster','HueGenius','ChromaDesigner','PigmentPro','PaletteCreator']),
  colors: Array(5).fill(null).map(randomHex),
  likes: Math.floor(Math.random() * 800) + 20,
  tags: ['random', 'new', randomFrom(['bright','dark','pastel','neon','vintage'])],
  createdAt: new Date().toISOString(),
  liked: false,
});

export default function ColorPaletteExplorer() {
  const [palettes, setPalettes] = useState([]);
  const [filterTag, setFilterTag] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setPalettes(Array.from({ length: 18 }, (_, i) => randomPalette(i)));
      setIsLoading(false);
    }, 700);
  }, []);

  const handleCreate = () => {
    setPalettes(prev => [randomPalette(Date.now()), ...prev]);
    showToast('New palette created!');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPalettes(Array.from({ length: 18 }, (_, i) => randomPalette(i)));
      setIsLoading(false);
      showToast('Palettes refreshed!');
    }, 500);
  };

  const copyColor = (color) => {
    navigator.clipboard.writeText(color);
    showToast(`${color} copied!`);
  };

  const toggleLike = (id) => {
    setPalettes(prev => prev.map(p => {
      if (p.id !== id) return p;
      const liked = !p.liked;
      showToast(liked ? 'Added to favorites!' : 'Removed from favorites', liked ? 'success' : 'info');
      return { ...p, liked, likes: liked ? p.likes + 1 : p.likes - 1 };
    }));
  };

  const download = (palette) => {
    const blob = new Blob([JSON.stringify(palette, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${palette.name}.json` });
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Palette downloaded!');
  };

  const share = (palette) => {
    if (navigator.share) {
      navigator.share({ title: palette.name, text: `Check out this palette by ${palette.author}!` })
        .then(() => showToast('Shared!'))
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(palette.colors.join(', '));
      showToast('Colors copied to clipboard!');
    }
  };

  const filtered = palettes
    .filter(p => filterTag === 'all' || p.tags.includes(filterTag))
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.includes(search.toLowerCase())))
    .sort((a, b) => sortBy === 'popular' ? b.likes - a.likes : new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>
      {/* Header */}
      <header className="bg-white sticky top-0 z-20" style={{ borderBottom: `1px solid ${LI_BORDER}` }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-3">
            <h1 className="text-base font-bold whitespace-nowrap" style={{ color: LI_TEXT }}>Color Palettes</h1>
            <div className="relative flex-1 max-w-xs">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: LI_MUTED }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search palettes..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg outline-none"
                style={{ backgroundColor: '#F3F2EF', border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
                onFocus={e => e.target.style.borderColor = LI_BLUE}
                onBlur={e => e.target.style.borderColor = LI_BORDER} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: LI_MUTED }}>
                  <FaXmark className="text-xs" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh}
              className="p-2 rounded-lg transition-colors" style={{ color: LI_MUTED, backgroundColor: '#F3F2EF' }}
              title="Refresh">
              <FaArrowRotateRight className="text-sm" />
            </button>
            <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
              {[['grid', FaTableCells], ['list', FaList]].map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className="p-2 transition-colors"
                  style={{ backgroundColor: view === v ? '#EEF3F8' : '#fff', color: view === v ? LI_BLUE : LI_MUTED }}>
                  <Icon className="text-sm" />
                </button>
              ))}
            </div>
            <button onClick={handleCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: LI_BLUE }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
              <FaPlus className="text-xs" /> Create
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white sticky top-[57px] z-10" style={{ borderBottom: `1px solid ${LI_BORDER}` }}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <FaFilter className="text-xs flex-shrink-0" style={{ color: LI_MUTED }} />
          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {TAGS.map(tag => (
              <button key={tag} onClick={() => setFilterTag(tag)}
                className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: filterTag === tag ? LI_BLUE : '#F3F2EF',
                  color: filterTag === tag ? '#fff' : LI_MUTED,
                  border: `1px solid ${filterTag === tag ? LI_BLUE : 'transparent'}`,
                }}>
                {tag === 'all' ? 'All' : tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
          <div className="ml-auto flex-shrink-0">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg outline-none"
              style={{ border: `1px solid ${LI_BORDER}`, color: LI_MUTED, backgroundColor: '#fff' }}>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse" style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="h-24 bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FaMagnifyingGlass className="text-4xl mx-auto mb-3" style={{ color: LI_BORDER }} />
            <p className="text-sm" style={{ color: LI_MUTED }}>No palettes found. Try a different search.</p>
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filtered.map(palette => (
              <PaletteCard
                key={palette.id}
                palette={palette}
                onToggleLike={toggleLike}
                onCopyColor={copyColor}
                onDownload={download}
                onShare={share}
              />
            ))}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <p className="text-center text-xs mt-6" style={{ color: LI_MUTED }}>
            Showing {filtered.length} palette{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </main>

      {/* FAB */}
      <button onClick={handleCreate}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: LI_BLUE }}>
        <FaPlus />
      </button>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium"
            style={{
              backgroundColor: '#fff',
              border: `1px solid ${LI_BORDER}`,
              color: toast.type === 'info' ? LI_MUTED : LI_TEXT,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
            <FaCheck className="text-xs" style={{ color: '#057642' }} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
