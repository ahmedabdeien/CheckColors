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

  return (
    <div className="p-4 md:p-8 bg-gray-50 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold">Color Palette (200 Colors)</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search colors..."
            className="px-3 py-2 border rounded-md text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 text-sm rounded-md border ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md border ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button 
              className="px-3 py-1 text-sm rounded-md border bg-white"
              onClick={() => setShowHex(!showHex)}
            >
              {showHex ? 'Show RGB' : 'Show HEX'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          <button 
            className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${activeCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
            onClick={() => setActiveCategory('all')}
          >
            All Colors
          </button>
          {categories.map(category => (
            <button 
              key={category}
              className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${activeCategory === category ? 'bg-blue-500 text-white' : 'bg-white border'}`}
              onClick={() => setActiveCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
          {filteredColors.map((color, index) => (
            <div 
              key={`${color.category}-${color.name}`} 
              className="flex flex-col rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg hover:scale-105"
              onClick={() => copyToClipboard(color.value, `${color.category}-${color.name}`)}
            >
              <div 
                style={{ 
                  backgroundColor: color.value,
                  color: getTextColor(color.value)
                }} 
                className="w-full h-16 flex items-center justify-center cursor-pointer relative"
              >
                {copied === `${color.category}-${color.name}` && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white">
                    Copied!
                  </div>
                )}
              </div>
              <div className="p-2 bg-white">
                <div className="text-xs font-medium truncate">{color.name}</div>
                <div className="text-xs text-gray-500 font-mono mt-1">
                  {showHex ? color.value : hexToRgb(color.value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredColors.map((color, index) => (
                <tr 
                  key={`${color.category}-${color.name}`}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => copyToClipboard(color.value, `${color.category}-${color.name}`)}
                >
                  <td className="px-4 py-2 whitespace-nowrap relative">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: color.value }}></div>
                    {copied === `${color.category}-${color.name}` && (
                      <span className="absolute text-xs font-medium text-green-600 ml-3">Copied!</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{color.name}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{color.category}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-500">
                      {showHex ? color.value : hexToRgb(color.value)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-500">Click on any color to copy its {showHex ? 'hex' : 'RGB'} code to clipboard</p>
        <p className="text-sm text-gray-500">Showing {filteredColors.length} of {colors.length} colors</p>
      </div>
    </div>
  );
}