import React, { useState } from "react";
import { BsArrowRepeat } from "react-icons/bs";


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

  const swapColors = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  // Predefined color pairs
  const colorPairs = [
    { fg: "#000000", bg: "#ffffff", name: "Black on White" },
    { fg: "#ffffff", bg: "#000000", name: "White on Black" },
    { fg: "#ffffff", bg: "#0057B7", name: "White on Blue" },
    { fg: "#333333", bg: "#f5f5f5", name: "Dark Gray on Light Gray" },
    { fg: "#F7F7F7", bg: "#4338CA", name: "Light Gray on Indigo" },
    { fg: "#212121", bg: "#FFEB3B", name: "Dark Gray on Yellow" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Color Contrast Checker
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Check if your color combinations meet WCAG accessibility standards
      </p>
      
      {/* Preview section */}
      {showPreview && (
        <div 
          className="mb-8 p-6 rounded-lg transition-all duration-300 border text-center"
          style={{ backgroundColor: bgColor, color: fgColor }}
        >
          <h2 className="text-2xl font-bold mb-2">Sample Text Preview</h2>
          <p className="text-lg mb-4">{customText}</p>
          <div className="flex justify-center gap-4">
            <span className="text-sm">Normal Text</span>
            <span className="text-xl font-bold">Large Text</span>
          </div>
          <div className="mt-4">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-2 rounded bg-opacity-20 bg-white border border-gray-300"
              style={{ color: fgColor }}
              placeholder="Enter custom text to preview"
            />
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Color selection */}
        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Text Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-16 h-10 p-1 rounded cursor-pointer"
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
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={swapColors}
              className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full transition-colors"
              aria-label="Swap colors"
            >
              <BsArrowRepeat className="text-3xl hover:rotate-180  duration-300" />
            </button>
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700">Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-16 h-10 p-1 rounded cursor-pointer"
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
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700">Preset Color Pairs</label>
            <div className="grid grid-cols-2 gap-2">
              {colorPairs.map((pair, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFgColor(pair.fg);
                    setBgColor(pair.bg);
                  }}
                  className="p-2 border rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: pair.fg }}
                  ></div>
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: pair.bg }}
                  ></div>
                  <span className="text-xs">{pair.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-xl font-semibold mb-4">Contrast Analysis</h2>
          
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {contrastRatio}:1
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  isAAA ? 'bg-green-500' : isAA ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, contrastRatio * 100 / 21)}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full mt-4">
              <div className={`p-3 rounded-lg border ${isAALarge ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={isAALarge ? 'text-green-600' : 'text-red-600'}>
                    {isAALarge ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                  </span>
                  <span className="font-semibold">AA Large</span>
                </div>
                <div className="text-sm text-gray-600">
                  {isAALarge ? 'Pass' : 'Fail'} (≥3:1)
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border ${isAA ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={isAA ? 'text-green-600' : 'text-red-600'}>
                    {isAA ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                  </span>
                  <span className="font-semibold">AA Normal</span>
                </div>
                <div className="text-sm text-gray-600">
                  {isAA ? 'Pass' : 'Fail'} (≥4.5:1)
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border ${isAAA ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={isAAA ? 'text-green-600' : 'text-red-600'}>
                    {isAAA ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
                  </span>
                  <span className="font-semibold">AAA</span>
                </div>
                <div className="text-sm text-gray-600">
                  {isAAA ? 'Pass' : 'Fail'} (≥7:1)
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg w-full">
              <h3 className="font-semibold text-blue-700 mb-2">WCAG Guidelines</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>AA requires contrast ratio of at least 4.5:1 for normal text</li>
                <li>AA requires contrast ratio of at least 3:1 for large text (≥18pt or bold ≥14pt)</li>
                <li>AAA requires contrast ratio of at least 7:1 for normal text</li>
                <li>AAA requires contrast ratio of at least 4.5:1 for large text</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
        >
          {showPreview ? 'Hide' : 'Show'} Text Preview
        </button>
      </div>
    </div>
  );
};

export default ContrastChecker;