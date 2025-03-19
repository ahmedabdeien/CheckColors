import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Search, Heart, Copy, Download, Share, Info, X, Check, Grid, List } from 'lucide-react';
import chroma from 'chroma-js';

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
    
    // Set canvas dimensions based on view
    const colorCount = palette.colors.length;
    if (view === 'grid') {
      canvas.width = 600;
      canvas.height = 300;
    } else {
      canvas.width = 800;
      canvas.height = 200;
    }
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw colors
    if (view === 'grid') {
      const colorHeight = canvas.height * 0.7;
      const colorWidth = canvas.width / colorCount;
      
      palette.colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(i * colorWidth, 0, colorWidth, colorHeight);
        
        // Add hex code
        ctx.fillStyle = chroma.contrast(color, 'white') > 3 ? 'white' : 'black';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(color, (i * colorWidth) + (colorWidth / 2), colorHeight - 20);
      });
      
      // Add tags at bottom
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
        
        // Add hex code
        ctx.fillStyle = chroma.contrast(color, 'white') > 3 ? 'white' : 'black';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(color, 20, (i * colorHeight) + (colorHeight / 2) + 6);
        
        // Add color name
        ctx.font = '12px sans-serif';
        ctx.fillText(chroma(color).name(), 120, (i * colorHeight) + (colorHeight / 2) + 6);
      });
    }
    
    // Convert canvas to data URL
    let dataURL;
    if (format === 'png') {
      dataURL = canvas.toDataURL('image/png');
    } else if (format === 'jpg') {
      dataURL = canvas.toDataURL('image/jpeg', 0.9);
    }
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${paletteName}.${format}`;
    link.href = dataURL;
    link.click();
  };

  const exportPDF = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);
    // Note: In a real implementation, we would integrate with PDF.js or similar library
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
      className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative ${view === 'grid' ? '' : 'p-4'}`}
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
                  {co}
                  <button 
                    onClick={() => handleCopyColor(color, colorIndex)}
                    className="p-1 hover:bg-white/20 rounded"
                    aria-label="Copy color code"
                  >
                    {copiedIndex === colorIndex ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
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

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button 
            className="flex items-center text-gray-500 hover:text-red-500 focus:outline-none transition-colors"
            aria-label={`Like ${palette.likes} times`}
          >
            <Heart className="h-4 w-4" />
            <span className="ml-1 text-sm font-medium">{palette.likes.toLocaleString()}</span>
          </button>
          
          <div className="relative">
            <button 
              onClick={copyAllColors}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Copy all colors"
            >
              <Copy className="h-4 w-4" />
            </button>
            {showTooltip && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Copied to clipboard
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 max-w-[40%]">
          {palette.tags.slice(0, 2).map(tag => (
            <span 
              key={tag} 
              className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
          {palette.tags.length > 2 && (
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
              +{palette.tags.length - 2}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <div className="relative">
            <button onClick={() => setShowDownload(!showDownload)} 
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Download palette"
            >
              <Download className="h-4 w-4" />
            </button>
            <div className={`absolute right-0 bottom-full mb-2  hidden group-hover:block bg-white shadow-lg rounded-lg p-2 z-10 w-24`} style={{ display: showDownload ? 'block' : 'none' }}>
              <button 
                onClick={() => generateImageAndDownload('png')} 
                className="block w-full text-left text-sm px-2 py-1 hover:bg-gray-100 rounded"
              >
                PNG
              </button>
              <button 
                onClick={() => generateImageAndDownload('jpg')} 
                className="block w-full text-left text-sm px-2 py-1 hover:bg-gray-100 rounded"
              >
                JPG
              </button>
              <button 
                onClick={exportPDF} 
                className="block w-full text-left text-sm px-2 py-1 hover:bg-gray-100 rounded"
              >
                PDF
              </button>
            </div>
          </div>
          <span className="text-xs text-gray-500">{palette.timeAgo}</span>
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

      return {
        colors,
        likes: Math.floor(Math.random() * 1000) + 50,
        timeAgo,
        tags,
        id: `palette-${i}`
      };
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
      // Filter by search query
      if (query) {
        const colorMatch = palette.colors.some(color => 
          color.toLowerCase().includes(query)
        );
        const tagMatch = palette.tags.some(tag => 
          tag.toLowerCase().includes(query)
        );
        if (!colorMatch && !tagMatch) return false;
      }
      
      // Filter by selected tags
      if (activeTags.length > 0) {
        const hasAllTags = activeTags.every(tag => 
          palette.tags.includes(tag)
        );
        if (!hasAllTags) return false;
      }
      
      return true;
    });
  }, [palettes, searchQuery, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {showHelp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative max-h-[80vh] overflow-y-auto">
              <button 
                onClick={() => setShowHelp(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Color Palette Explorer Help</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Features:</h3>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>View color palettes in grid or list view</li>
                    <li>Copy individual colors by clicking the copy icon on hover</li>
                    <li>Copy all colors in a palette with the copy button</li>
                    <li>Download palettes as PNG, JPG, or PDF</li>
                    <li>Filter palettes by tags or search by color code</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Tips:</h3>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Hover over a color to see its name and hex code</li>
                    <li>Select multiple tags to find palettes that match all selected criteria</li>
                    <li>Search for specific hex codes or color names</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Color Palette Explorer
            </h1>
            <button 
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1 text-gray-600"
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Help</span>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search colors or tags (e.g. #F24C3D, pastel, blue)"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
              )}
            </div>
            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <button
                className={`px-4 py-2.5 ${
                  view === 'grid' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                } flex items-center gap-2`}
                onClick={() => setView('grid')}
              >
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                className={`px-4 py-2.5 ${
                  view === 'list' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                } flex items-center gap-2`}
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap justify-between items-center mb-2">
            <div className="text-gray-700 mb-2 sm:mb-0">
              Showing <span className="font-semibold">{filteredPalettes.length}</span> palettes
            </div>
            
            {selectedTags.length > 0 && (
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setSelectedTags([])}
              >
                Clear filters
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {popularTags.map(tag => (
              <button
                key={tag}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                onClick={() => toggleTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {filteredPalettes.length > 0 ? (
          <div className={view === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredPalettes.map(palette => (
              <PaletteCard 
                key={palette.id}
                palette={palette}
                view={view}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No palettes found
            </h3>
            <p className="text-gray-600 mb-4">
              Try searching for a different color hex code or tag
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedTags([]);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}
        
        <div className="mt-8 py-6 text-center text-sm text-gray-500 border-t border-gray-200">
          Built with React and Tailwind CSS • Color information powered by chroma.js
        </div>
      </div>
    </div>
  );
}