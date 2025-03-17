import React, { useState, useEffect } from "react";
import { BsArrowRepeat, BsEyeFill, BsEyeSlashFill, BsQuestionCircle, BsInfoCircle } from "react-icons/bs";

// Custom SVG icons
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ExclamationCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ContrastChecker = () => {
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showPreview, setShowPreview] = useState(true);
  const [customText, setCustomText] = useState("The quick brown fox jumps over the lazy dog");
  const [colorHistory, setColorHistory] = useState([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("text"); // "text" or "graphic"

  // Add colors to history when they change
  useEffect(() => {
    const newPair = { fg: fgColor, bg: bgColor };
    const pairExists = colorHistory.some(
      pair => pair.fg === fgColor && pair.bg === bgColor
    );
    
    if (!pairExists && fgColor !== bgColor) {
      setColorHistory(prev => [newPair, ...prev.slice(0, 4)]);
    }
  }, [fgColor, bgColor]);

  const calculateLuminance = (hex) => {
    const normalizedHex = hex.replace("#", "");
    const hasFullHex = normalizedHex.length === 6;
    const r = parseInt(
      hasFullHex ? normalizedHex.substring(0, 2) : normalizedHex[0].repeat(2),
      16
    );
    const g = parseInt(
      hasFullHex ? normalizedHex.substring(2, 4) : normalizedHex[1].repeat(2),
      16
    );
    const b = parseInt(
      hasFullHex ? normalizedHex.substring(4, 6) : normalizedHex[2].repeat(2),
      16
    );

    const toLinear = (c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const R = toLinear(r / 255);
    const G = toLinear(g / 255);
    const B = toLinear(b / 255);

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const getContrastRatio = () => {
    const lum1 = calculateLuminance(fgColor);
    const lum2 = calculateLuminance(bgColor);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const contrastRatio = getContrastRatio().toFixed(2);
  const isAALarge = contrastRatio >= 3;
  const isAA = contrastRatio >= 4.5;
  const isAAA = contrastRatio >= 7;
  const isGraphicsAA = contrastRatio >= 3; // For non-text elements

  const swapColors = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  // Function to generate a random color
  const generateRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  // Generate random colors
  const randomizeColors = () => {
    setFgColor(generateRandomColor());
    setBgColor(generateRandomColor());
  };

  // Complementary color
  const generateComplementaryColor = (hex) => {
    // Remove the hash
    let color = hex.replace('#', '');
    
    // Convert to RGB
    let r = parseInt(color.substr(0, 2), 16);
    let g = parseInt(color.substr(2, 2), 16);
    let b = parseInt(color.substr(4, 2), 16);
    
    // Invert the colors
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    
    // Convert back to hex
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  // Adjust color for better contrast
  const suggestBetterContrast = () => {
    if (contrastRatio >= 4.5) return; // Already good enough

    // Determine if we should adjust foreground or background
    const fgLum = calculateLuminance(fgColor);
    const bgLum = calculateLuminance(bgColor);
    
    if (fgLum > bgLum) {
      // Make foreground lighter
      setFgColor("#FFFFFF");
    } else {
      // Make foreground darker
      setFgColor("#000000");
    }
  };

  // Predefined color pairs
  const colorPairs = [
    { fg: "#000000", bg: "#ffffff", name: "Black on White" },
    { fg: "#ffffff", bg: "#000000", name: "White on Black" },
    { fg: "#ffffff", bg: "#0057B7", name: "White on Blue" },
    { fg: "#333333", bg: "#f5f5f5", name: "Dark Gray on Light" },
    { fg: "#F7F7F7", bg: "#4338CA", name: "Light on Indigo" },
    { fg: "#212121", bg: "#FFEB3B", name: "Dark on Yellow" },
  ];

  // Get color contrast rating description
  const getContrastRating = () => {
    if (isAAA) return { level: "Excellent", class: "text-green-600" };
    if (isAA) return { level: "Good", class: "text-blue-600" };
    if (isAALarge) return { level: "Fair", class: "text-yellow-600" };
    return { level: "Poor", class: "text-red-600" };
  };

  const rating = getContrastRating();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl m-auto ">
      <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Color Contrast Checker
      </h1>
      <p className="text-center text-gray-500 mb-6">
        Ensure your color combinations meet WCAG accessibility standards
      </p>
      
      {/* Mode tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-100">
          <button
            onClick={() => setActiveTab("text")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "text" 
                ? "bg-white shadow-sm text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Text Contrast
          </button>
          <button
            onClick={() => setActiveTab("graphic")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "graphic" 
                ? "bg-white shadow-sm text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            UI Elements
          </button>
        </div>
      </div>
      
      {/* Preview section */}
      {showPreview && (
        <div 
          className="mb-6 p-6 rounded-lg transition-all duration-300 border shadow-sm overflow-hidden"
          style={{ backgroundColor: bgColor, color: fgColor }}
        >
          {activeTab === "text" ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">Text Preview</h2>
              <p className="text-lg mb-4">{customText}</p>
              <div className="flex justify-center gap-6">
                <div>
                  <span className="text-sm">Normal Text</span>
                  <p className="text-base">Content text</p>
                </div>
                <div>
                  <span className="text-sm">Large Text</span>
                  <p className="text-xl font-bold">Heading text</p>
                </div>
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full p-2 rounded bg-opacity-20 bg-white border"
                  style={{ color: fgColor, borderColor: fgColor }}
                  placeholder="Enter custom text to preview"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-2xl font-bold mb-2">UI Elements Preview</h2>
              <div className="flex gap-6 w-full justify-center">
                <div className="flex flex-col items-center">
                  <div className="mb-2">Button</div>
                  <button 
                    className="px-4 py-2 rounded-md" 
                    style={{
                      backgroundColor: fgColor,
                      color: bgColor,
                      border: `1px solid ${fgColor}`
                    }}
                  >
                    Click Me
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-2">Icon</div>
                  <div style={{ color: fgColor }}>
                    <BsInfoCircle size={24} />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-2">Border</div>
                  <div 
                    className="w-16 h-16 rounded-md" 
                    style={{ 
                      backgroundColor: 'transparent', 
                      border: `2px solid ${fgColor}`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Color selection */}
        <div className="space-y-5 bg-white shadow-lg p-5 rounded-xl">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Text/Foreground Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-12 h-12 p-1 rounded-md cursor-pointer"
                title="Choose foreground color"
              />
              <input
                type="text"
                value={fgColor.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith("#") && val.length <= 7) {
                    setFgColor(val);
                  }
                }}
                className="flex-1 p-2 border rounded font-mono"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={swapColors}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors flex items-center justify-center"
              aria-label="Swap colors"
              title="Swap colors"
            >
              <BsArrowRepeat className="text-2xl hover:rotate-180 duration-300" />
            </button>
            
            <button
              onClick={() => setFgColor(generateComplementaryColor(bgColor))}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors text-sm"
              title="Generate complementary color"
            >
              Complement
            </button>
            
            <button
              onClick={randomizeColors}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors text-sm"
              title="Generate random colors"
            >
              Random
            </button>
            
            <button
              onClick={suggestBetterContrast}
              className="bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors text-sm text-blue-700"
              title="Suggest better contrast"
            >
              Fix Contrast
            </button>
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700">Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-12 h-12 p-1 rounded-md cursor-pointer"
                title="Choose background color"
              />
              <input
                type="text"
                value={bgColor.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith("#") && val.length <= 7) {
                    setBgColor(val);
                  }
                }}
                className="flex-1 p-2 border rounded font-mono"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">Preset Color Pairs</label>
              <div className="relative">
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setTooltipVisible(!tooltipVisible)}
                >
                                  
                  <BsQuestionCircle />
                </button>
                {tooltipVisible && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap">
                    Predefined WCAG-compliant color combinations
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {colorPairs.map((pair, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFgColor(pair.fg);
                    setBgColor(pair.bg);
                  }}
                  className="flex flex-col items-center p-2 rounded hover:bg-gray-100 transition-colors"
                  style={{ backgroundColor: pair.bg, color: pair.fg }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border mb-1"
                       style={{ backgroundColor: pair.fg }}>
                    <div className="w-5 h-5 rounded-full"
                         style={{ backgroundColor: pair.bg }} />
                  </div>
                  <span className="text-xs font-medium">{pair.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contrast results */}
        <div className="space-y-4 p-5 bg-white shadow-lg rounded-xl">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Contrast Ratio</h3>
            <div className={`p-3 rounded-lg flex flex-col items-center ${
              rating.class.replace('text-', 'bg-') + ' bg-opacity-20'
            }`}>
              <span className="text-4xl font-bold">{contrastRatio}:1</span>
              <span className={`text-sm font-medium ${rating.class}`}>
                {rating.level} Contrast
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-md font-medium">Accessibility Levels</h4>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {isAALarge ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                <span className={`${isAALarge ? 'text-green-600' : 'text-red-600'}`}>
                  AA (Large Text): {isAALarge ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isAA ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                <span className={`${isAA ? 'text-green-600' : 'text-red-600'}`}>
                  AA (Normal Text): {isAA ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isAAA ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                <span className={`${isAAA ? 'text-green-600' : 'text-red-600'}`}>
                  AAA: {isAAA ? 'Passed' : 'Failed'}
                </span>
              </div>
              {activeTab === "graphic" && (
                <div className="flex items-center gap-2">
                  {isGraphicsAA ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                  <span className={`${isGraphicsAA ? 'text-green-600' : 'text-red-600'}`}>
                    Graphics AA: {isGraphicsAA ? 'Passed' : 'Failed'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Color History</h3>
          <button 
            onClick={() => setColorHistory([])}
            className="text-sm text-red-600 hover:underline"
          >
            Clear History
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {colorHistory.map((pair, index) => (
            <button
              key={index}
              onClick={() => {
                setFgColor(pair.fg);
                setBgColor(pair.bg);
              }}
              className="flex flex-col items-center p-2 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full border mb-1"
                   style={{ backgroundColor: pair.fg }}>
                <div className="w-5 h-5 rounded-full"
                     style={{ backgroundColor: pair.bg }} />
              </div>
              <div className="text-xs text-gray-500">
                {pair.fg.substring(0,7)}<br/>{pair.bg.substring(0,7)}
              </div>
            </button>
          ))}
        </div>
      </div>

      </div>
    </div>
  );
};

export default ContrastChecker;