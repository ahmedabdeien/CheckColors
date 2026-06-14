import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  FaMagnifyingGlass, FaHeart, FaCopy, FaDownload, FaShareNodes,
  FaCircleInfo, FaXmark, FaCheck, FaTableCells, FaList
} from 'react-icons/fa6';
import chroma from 'chroma-js';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const PaletteCard = ({ palette, view }) => {
  const [hoveredColorIndex, setHoveredColorIndex] = useState(-1);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const cardRef = useRef(null);

  const handleCopyColor = (color, index) => {
    navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const generateImageAndDownload = (format) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const paletteName = `palette-${palette.id}`;
    const colorCount = palette.colors.length;
    if (view === 'grid') {
      canvas.width = 600;
      canvas.height = 300;
    } else {
      canvas.width = 800;
      canvas.height = 200;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (view === 'grid') {
      const colorHeight = canvas.height * 0.7;
      const colorWidth = canvas.width / colorCount;
      palette.colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(i * colorWidth, 0, colorWidth, colorHeight);
        ctx.fillStyle = chroma.contrast(color, 'white') > 3 ? 'white' : 'black';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(color, (i * colorWidth) + (colorWidth / 2), colorHeight - 20);
      });
      ctx.fillStyle = '#333333';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(palette.tags.map(t => `#${t}`).join(' '), 20, colorHeight + 40);
    } else {
      const colorWidth = canvas.width;
      const colorHeight = canvas.height / colorCount;
      palette.colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(0, i * colorHeight, colorWidth, colorHeight);
        ctx.fillStyle = chroma.contrast(color, 'white') > 3 ? 'white' : 'black';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(color, 20, (i * colorHeight) + (colorHeight / 2) + 6);
        ctx.font = '12px sans-serif';
        ctx.fillText(chroma(color).name(), 120, (i * colorHeight) + (colorHeight / 2) + 6);
      });
    }
    let dataURL = format === 'png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = `${paletteName}.${format}`;
    link.href = dataURL;
    link.click();
  };

  const exportPDF = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);
  };

  const copyAllColors = () => {
    const colorText = palette.colors.join('\n');
    navigator.clipboard.writeText(colorText);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1500);
  };

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-xl overflow-hidden transition-shadow duration-300 relative ${view === 'grid' ? '' : 'p-4'}`}
      style={{ border: `1px solid ${LI_BORDER}` }}
    >
      <div className={`flex ${view === 'grid' ? 'flex-col' : 'mb-4'}`}>
        {palette.colors.map((color, colorIndex) => (
          <div
            key={colorIndex}
            className={`relative group ${view === 'grid' ? 'h-20' : 'h-14 flex-1'}`}
            style={{ backgroundColor: color }}
            onMouseEnter={() => setHoveredColorIndex(colorIndex)}
            onMouseLeave={() => setHoveredColorIndex(-1)}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <div className="bg-black/70 text-white px-3 py-2 rounded text-xs font-mono flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  {color}
                  <button
                    onClick={() => handleCopyColor(color, colorIndex)}
                    className="p-1 hover:bg-white/20 rounded"
                    aria-label="Copy color code"
                  >
                    {copiedIndex === colorIndex
                      ? <FaCheck className="text-xs" />
                      : <FaCopy className="text-xs" />}
                  </button>
                </div>
                {hoveredColorIndex === colorIndex && (
                  <span className="block text-[0.6rem] opacity-75">
                    {chroma(color).name()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: LI_BORDER }}>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 text-xs"
            style={{ color: LI_MUTED }}
            aria-label={`Like ${palette.likes} times`}
          >
            <FaHeart className="text-xs" />
            <span className="font-medium">{palette.likes.toLocaleString()}</span>
          </button>

          <div className="relative">
            <button
              onClick={copyAllColors}
              className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
              style={{ color: LI_MUTED }}
              aria-label="Copy all colors"
            >
              <FaCopy className="text-xs" />
            </button>
            {showTooltip && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10"
                style={{ backgroundColor: LI_TEXT }}>
                Copied to clipboard
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 max-w-[40%]">
          {palette.tags.slice(0, 2).map(tag => (
            <span key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>
              #{tag}
            </span>
          ))}
          {palette.tags.length > 2 && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#EEF3F8', color: LI_MUTED }}>
              +{palette.tags.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button onClick={() => setShowDownload(!showDownload)}
              className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
              style={{ color: LI_MUTED }}
              aria-label="Download palette"
            >
              <FaDownload className="text-xs" />
            </button>
            {showDownload && (
              <div className="absolute right-0 bottom-full mb-2 bg-white shadow-lg rounded-lg p-2 z-10 w-20"
                style={{ border: `1px solid ${LI_BORDER}` }}>
                {['png', 'jpg'].map(fmt => (
                  <button key={fmt}
                    onClick={() => generateImageAndDownload(fmt)}
                    className="block w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-50 uppercase"
                    style={{ color: LI_TEXT }}>
                    {fmt}
                  </button>
                ))}
                <button onClick={exportPDF}
                  className="block w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-50"
                  style={{ color: LI_TEXT }}>
                  PDF
                </button>
              </div>
            )}
          </div>
          <span className="text-xs" style={{ color: LI_MUTED }}>{palette.timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

const usePalettes = (count) => {
  const generatePalettes = useCallback((count) => {
    const timeUnits = ['hours', 'days', 'weeks', 'months'];
    const basePalettes = [
      chroma.scale(['#FAE1D5', '#2B31AD', '#161C7C', '#080E3A']).colors(4),
      chroma.scale(['#3C7553', '#E8EDF0', '#E89D50', '#E24E34']).colors(4),
      chroma.scale(['#F2EBD9', '#6599A8', '#29647D', '#7C3162']).colors(4),
      chroma.scale(['#FFFFFF', '#65BED0', '#006160', '#F24C3D']).colors(4),
      chroma.scale(['#FFD700', '#FF6347', '#4682B4', '#2E8B57']).colors(4),
      chroma.scale(['#E6DADA', '#274046']).colors(4),
      chroma.scale(['#2193b0', '#6dd5ed']).colors(4),
      chroma.scale(['#8360c3', '#2ebf91']).colors(4),
      chroma.scale(['#544a7d', '#ffd452']).colors(4),
      chroma.scale(['#009FFF', '#ec2F4B']).colors(4),
    ];

    return Array.from({ length: count }).map((_, i) => {
      const base = basePalettes[i % basePalettes.length];
      const colors = base.map(color =>
        chroma(color).set('hsl.h', `+${i * 13 % 360}`).hex()
      );
      const timeValue = Math.floor(Math.random() * 30) + 1;
      const timeUnit = timeUnits[Math.floor(Math.random() * timeUnits.length)];
      const timeAgo = `${timeValue} ${timeUnit} ago`;
      const tags = Array.from(new Set([
        chroma.average(colors).luminance() > 0.6 ? 'bright' : null,
        chroma.average(colors).luminance() < 0.3 ? 'dark' : null,
        chroma.average(colors).luminance() > 0.4 && chroma.average(colors).luminance() < 0.7 ? 'pastel' : null,
        ...colors.map(color => chroma(color).get('hsl.h')).map(hue => {
          if (hue < 30) return 'red';
          if (hue < 90) return 'yellow';
          if (hue < 150) return 'green';
          if (hue < 210) return 'cyan';
          if (hue < 270) return 'blue';
          if (hue < 330) return 'purple';
          return 'pink';
        })
      ])).filter(Boolean).slice(0, 4);

      return { colors, likes: Math.floor(Math.random() * 1000) + 50, timeAgo, tags, id: `palette-${i}` };
    }).sort((a, b) => b.likes - a.likes);
  }, []);

  return useMemo(() => generatePalettes(count), [count, generatePalettes]);
};

export default function ExplorerColor() {
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const palettes = usePalettes(200);
  const [showHelp, setShowHelp] = useState(false);

  const popularTags = ['bright', 'pastel', 'dark', 'blue', 'red', 'green', 'purple', 'yellow'];

  const filteredPalettes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const activeTags = selectedTags.length > 0 ? selectedTags : [];
    return palettes.filter(palette => {
      if (query) {
        const colorMatch = palette.colors.some(c => c.toLowerCase().includes(query));
        const tagMatch = palette.tags.some(t => t.toLowerCase().includes(query));
        if (!colorMatch && !tagMatch) return false;
      }
      if (activeTags.length > 0) {
        if (!activeTags.every(t => palette.tags.includes(t))) return false;
      }
      return true;
    });
  }, [palettes, searchQuery, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>

      {/* Help modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto"
            style={{ border: `1px solid ${LI_BORDER}` }}>
            <button onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-50">
              <FaXmark style={{ color: LI_MUTED }} />
            </button>
            <h2 className="text-lg font-bold mb-4" style={{ color: LI_TEXT }}>Color Palette Explorer Help</h2>
            <div className="space-y-4 text-sm" style={{ color: LI_MUTED }}>
              <div>
                <p className="font-semibold mb-1" style={{ color: LI_TEXT }}>Features:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>View color palettes in grid or list view</li>
                  <li>Copy individual colors by clicking the copy icon on hover</li>
                  <li>Copy all colors in a palette with the copy button</li>
                  <li>Download palettes as PNG or JPG</li>
                  <li>Filter palettes by tags or search by color code</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: LI_TEXT }}>Tips:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Hover over a color to see its name and hex code</li>
                  <li>Select multiple tags to find palettes matching all criteria</li>
                  <li>Search for specific hex codes or color names</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold" style={{ color: LI_TEXT }}>Color Palette Explorer</h1>
            <button onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
              style={{ color: LI_MUTED, border: `1px solid ${LI_BORDER}` }}>
              <FaCircleInfo className="text-xs" />
              <span className="hidden sm:inline">Help</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: LI_MUTED }} />
              <input
                type="text"
                placeholder="Search colors or tags (e.g. #F24C3D, pastel, blue)"
                className="block w-full pl-9 pr-9 py-2.5 rounded-lg text-sm outline-none"
                style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT, backgroundColor: '#fff' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={e => e.target.style.borderColor = LI_BLUE}
                onBlur={e => e.target.style.borderColor = LI_BORDER}
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                >
                  <FaXmark className="text-xs" style={{ color: LI_MUTED }} />
                </button>
              )}
            </div>
            <div className="flex bg-white rounded-lg overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
              {[['grid', FaTableCells], ['list', FaList]].map(([viewType, Icon]) => (
                <button key={viewType}
                  className="px-4 py-2.5 flex items-center gap-2 text-sm transition-colors"
                  style={{
                    backgroundColor: view === viewType ? '#EEF3F8' : 'transparent',
                    color: view === viewType ? LI_BLUE : LI_MUTED,
                  }}
                  onClick={() => setView(viewType)}>
                  <Icon className="text-xs" />
                  <span className="hidden sm:inline capitalize">{viewType}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl p-4 mb-6" style={{ border: `1px solid ${LI_BORDER}` }}>
          <div className="flex flex-wrap justify-between items-center mb-3">
            <p className="text-sm" style={{ color: LI_MUTED }}>
              Showing <span className="font-semibold" style={{ color: LI_TEXT }}>{filteredPalettes.length}</span> palettes
            </p>
            {selectedTags.length > 0 && (
              <button className="text-xs font-semibold" style={{ color: LI_BLUE }}
                onClick={() => setSelectedTags([])}>
                Clear filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <button key={tag}
                className="px-3 py-1 rounded-full text-xs transition-colors"
                style={{
                  backgroundColor: selectedTags.includes(tag) ? '#EEF3F8' : '#F3F2EF',
                  color: selectedTags.includes(tag) ? LI_BLUE : LI_MUTED,
                  border: `1px solid ${selectedTags.includes(tag) ? LI_BLUE : LI_BORDER}`,
                }}
                onClick={() => toggleTag(tag)}>
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filteredPalettes.length > 0 ? (
          <div className={view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'}>
            {filteredPalettes.map(palette => (
              <PaletteCard key={palette.id} palette={palette} view={view} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl" style={{ border: `1px solid ${LI_BORDER}` }}>
            <h3 className="font-semibold mb-1" style={{ color: LI_TEXT }}>No palettes found</h3>
            <p className="text-sm mb-4" style={{ color: LI_MUTED }}>Try searching for a different color or tag</p>
            <button onClick={() => { setSearchQuery(''); setSelectedTags([]); }}
              className="px-5 py-2 rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: LI_BLUE }}>
              Reset filters
            </button>
          </div>
        )}

        <div className="mt-8 py-6 text-center text-xs border-t" style={{ color: LI_MUTED, borderColor: LI_BORDER }}>
          Built with React and Tailwind CSS • Color information powered by chroma.js
        </div>
      </div>
    </div>
  );
}
