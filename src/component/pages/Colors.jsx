import React, { useState, useEffect } from 'react';

export default function Colors() {
  const [copied, setCopied] = useState(null);
  const [filter, setFilter] = useState('');
  const [showHex, setShowHex] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Generate the 200 color palette, organized by categories
  const colorPalette = {
    grayscale: [
      { name: 'black', value: '#000000' },
      { name: 'gray-50', value: '#FAFAFA' },
      { name: 'gray-100', value: '#F5F5F5' },
      { name: 'gray-200', value: '#E5E5E5' },
      { name: 'gray-300', value: '#D4D4D4' },
      { name: 'gray-400', value: '#A3A3A3' },
      { name: 'gray-500', value: '#737373' },
      { name: 'gray-600', value: '#525252' },
      { name: 'gray-700', value: '#404040' },
      { name: 'gray-800', value: '#262626' },
      { name: 'gray-900', value: '#171717' },
      { name: 'white', value: '#FFFFFF' },
    ],
    red: generateColorScale('red', '#FF0000'),
    pink: generateColorScale('pink', '#FF69B4'),
    orange: generateColorScale('orange', '#FFA500'),
    amber: generateColorScale('amber', '#FFBF00'),
    yellow: generateColorScale('yellow', '#FFFF00'),
    lime: generateColorScale('lime', '#BFFF00'),
    green: generateColorScale('green', '#00FF00'),
    emerald: generateColorScale('emerald', '#50C878'),
    teal: generateColorScale('teal', '#008080'),
    cyan: generateColorScale('cyan', '#00FFFF'),
    lightBlue: generateColorScale('lightBlue', '#ADD8E6'),
    blue: generateColorScale('blue', '#0000FF'),
    indigo: generateColorScale('indigo', '#4B0082'),
    purple: generateColorScale('purple', '#800080'),
    fuchsia: generateColorScale('fuchsia', '#FF00FF'),
    violet: generateColorScale('violet', '#8F00FF'),
    rose: generateColorScale('rose', '#FF007F'),
    brown: generateColorScale('brown', '#A52A2A'),
  };
  
  // Function to generate a color scale with 10 variants
  function generateColorScale(name, baseColor) {
    // Convert hex to rgb
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Generate the scale
    const scale = [];
    for (let i = 1; i <= 10; i++) {
      // Calculate the intensity factor (darker to lighter)
      const factor = i / 10;
      
      // For lighter colors (50, 100, 200)
      if (i <= 3) {
        const lightFactor = 0.5 + (0.5 * (3 - i + 1) / 3);
        const newR = Math.min(255, Math.round(r + (255 - r) * lightFactor));
        const newG = Math.min(255, Math.round(g + (255 - g) * lightFactor));
        const newB = Math.min(255, Math.round(b + (255 - b) * lightFactor));
        
        scale.push({
          name: `${name}-${i * 100}`,
          value: rgbToHex(newR, newG, newB)
        });
      } 
      // For mid to dark colors (300-900)
      else {
        const darkFactor = 1 - (0.9 * (i - 3) / 7);
        const newR = Math.max(0, Math.round(r * darkFactor));
        const newG = Math.max(0, Math.round(g * darkFactor));
        const newB = Math.max(0, Math.round(b * darkFactor));
        
        scale.push({
          name: `${name}-${i * 100}`,
          value: rgbToHex(newR, newG, newB)
        });
      }
    }
    return scale;
  }
  
  // Helper function to convert RGB to HEX
  function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }
  
  // Convert the palette to a flat array with categories
  const colors = Object.entries(colorPalette).flatMap(([category, colorList]) => 
    colorList.map(color => ({ ...color, category }))
  );
  
  const categories = Object.keys(colorPalette);
  
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(index);
      setTimeout(() => setCopied(null), 1500);
    });
  };
  
  const getTextColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  const filteredColors = colors.filter(color => 
    (activeCategory === 'all' || color.category === activeCategory) &&
    (color.name.toLowerCase().includes(filter.toLowerCase()) || 
    color.value.toLowerCase().includes(filter.toLowerCase()))
  );

  const LI_BLUE = '#0A66C2';
  const LI_BG = '#F3F2EF';
  const LI_BORDER = '#E0DFDC';
  const LI_TEXT = '#000000E6';
  const LI_MUTED = '#00000099';

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} className="p-4 md:p-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-3">
          <h2 className="text-2xl font-bold" style={{ color: LI_TEXT }}>Color Palette (200 Colors)</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search colors..."
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT, backgroundColor: '#fff' }}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              onFocus={e => e.target.style.borderColor = LI_BLUE}
              onBlur={e => e.target.style.borderColor = LI_BORDER}
            />
            <div className="flex gap-2">
              {[['grid', 'Grid'], ['list', 'List']].map(([mode, label]) => (
                <button key={mode}
                  className="px-3 py-1.5 text-sm rounded-lg"
                  style={{
                    backgroundColor: viewMode === mode ? LI_BLUE : '#fff',
                    color: viewMode === mode ? '#fff' : LI_MUTED,
                    border: `1px solid ${LI_BORDER}`,
                  }}
                  onClick={() => setViewMode(mode)}>
                  {label}
                </button>
              ))}
              <button
                className="px-3 py-1.5 text-sm rounded-lg"
                style={{ backgroundColor: '#fff', color: LI_MUTED, border: `1px solid ${LI_BORDER}` }}
                onClick={() => setShowHex(!showHex)}>
                {showHex ? 'RGB' : 'HEX'}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-2 pb-1">
            {['all', ...categories].map(cat => (
              <button key={cat}
                className="px-3 py-1 text-xs rounded-full whitespace-nowrap"
                style={{
                  backgroundColor: activeCategory === cat ? LI_BLUE : '#fff',
                  color: activeCategory === cat ? '#fff' : LI_MUTED,
                  border: `1px solid ${activeCategory === cat ? LI_BLUE : LI_BORDER}`,
                }}
                onClick={() => setActiveCategory(cat)}>
                {cat === 'all' ? 'All Colors' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredColors.map(color => (
              <div key={`${color.category}-${color.name}`}
                className="flex flex-col rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                style={{ border: `1px solid ${LI_BORDER}` }}
                onClick={() => copyToClipboard(color.value, `${color.category}-${color.name}`)}>
                <div className="w-full h-14 flex items-center justify-center relative"
                  style={{ backgroundColor: color.value, color: getTextColor(color.value) }}>
                  {copied === `${color.category}-${color.name}` && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-medium">
                      Copied!
                    </div>
                  )}
                </div>
                <div className="p-1.5 bg-white">
                  <div className="text-xs font-medium truncate" style={{ color: LI_TEXT }}>{color.name}</div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: LI_MUTED }}>
                    {showHex ? color.value : hexToRgb(color.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${LI_BORDER}` }}>
            <table className="min-w-full divide-y" style={{ borderColor: LI_BORDER }}>
              <thead style={{ backgroundColor: '#F3F2EF' }}>
                <tr>
                  {['Color', 'Name', 'Category', 'Value'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: LI_MUTED }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y" style={{ borderColor: LI_BORDER }}>
                {filteredColors.map(color => (
                  <tr key={`${color.category}-${color.name}`}
                    className="cursor-pointer"
                    style={{ borderColor: LI_BORDER }}
                    onClick={() => copyToClipboard(color.value, `${color.category}-${color.name}`)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F2EF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}>
                    <td className="px-4 py-2 whitespace-nowrap relative">
                      <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: color.value }} />
                      {copied === `${color.category}-${color.name}` && (
                        <span className="absolute text-xs font-medium ml-3" style={{ color: '#057642' }}>Copied!</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs font-medium" style={{ color: LI_TEXT }}>{color.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs" style={{ color: LI_MUTED }}>{color.category}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs font-mono" style={{ color: LI_MUTED }}>
                      {showHex ? color.value : hexToRgb(color.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-5">
          <p className="text-xs" style={{ color: LI_MUTED }}>Click on any color to copy its {showHex ? 'hex' : 'RGB'} code</p>
          <p className="text-xs" style={{ color: LI_MUTED }}>Showing {filteredColors.length} of {colors.length} colors</p>
        </div>
      </div>
    </div>
  );
}