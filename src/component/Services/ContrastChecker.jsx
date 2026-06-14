import React, { useState, useEffect } from "react";
import { FaArrowRightArrowLeft, FaEye, FaEyeSlash, FaCircleQuestion, FaCircleInfo, FaCheck, FaCircleExclamation } from "react-icons/fa6";

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';
const GREEN = '#057642';
const RED = '#CC1016';

const ContrastChecker = () => {
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showPreview, setShowPreview] = useState(true);
  const [customText, setCustomText] = useState("The quick brown fox jumps over the lazy dog");
  const [colorHistory, setColorHistory] = useState([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("text");

  useEffect(() => {
    const newPair = { fg: fgColor, bg: bgColor };
    const pairExists = colorHistory.some(p => p.fg === fgColor && p.bg === bgColor);
    if (!pairExists && fgColor !== bgColor) {
      setColorHistory(prev => [newPair, ...prev.slice(0, 4)]);
    }
  }, [fgColor, bgColor]);

  const calculateLuminance = (hex) => {
    const normalizedHex = hex.replace("#", "");
    const hasFullHex = normalizedHex.length === 6;
    const r = parseInt(hasFullHex ? normalizedHex.substring(0, 2) : normalizedHex[0].repeat(2), 16);
    const g = parseInt(hasFullHex ? normalizedHex.substring(2, 4) : normalizedHex[1].repeat(2), 16);
    const b = parseInt(hasFullHex ? normalizedHex.substring(4, 6) : normalizedHex[2].repeat(2), 16);
    const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r / 255) + 0.7152 * toLinear(g / 255) + 0.0722 * toLinear(b / 255);
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
  const isGraphicsAA = contrastRatio >= 3;

  const swapColors = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  const generateRandomColor = () =>
    "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

  const randomizeColors = () => {
    setFgColor(generateRandomColor());
    setBgColor(generateRandomColor());
  };

  const generateComplementaryColor = (hex) => {
    let color = hex.replace('#', '');
    const r = 255 - parseInt(color.substr(0, 2), 16);
    const g = 255 - parseInt(color.substr(2, 2), 16);
    const b = 255 - parseInt(color.substr(4, 2), 16);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const suggestBetterContrast = () => {
    if (contrastRatio >= 4.5) return;
    const fgLum = calculateLuminance(fgColor);
    const bgLum = calculateLuminance(bgColor);
    setFgColor(fgLum > bgLum ? "#FFFFFF" : "#000000");
  };

  const colorPairs = [
    { fg: "#000000", bg: "#ffffff", name: "Black on White" },
    { fg: "#ffffff", bg: "#000000", name: "White on Black" },
    { fg: "#ffffff", bg: "#0057B7", name: "White on Blue" },
    { fg: "#333333", bg: "#f5f5f5", name: "Dark Gray on Light" },
    { fg: "#F7F7F7", bg: "#4338CA", name: "Light on Indigo" },
    { fg: "#212121", bg: "#FFEB3B", name: "Dark on Yellow" },
  ];

  const getContrastRating = () => {
    if (isAAA) return { level: "Excellent", color: GREEN };
    if (isAA) return { level: "Good", color: LI_BLUE };
    if (isAALarge) return { level: "Fair", color: '#915907' };
    return { level: "Poor", color: RED };
  };

  const rating = getContrastRating();

  const levels = [
    { label: 'AA (Large Text)', pass: isAALarge },
    { label: 'AA (Normal Text)', pass: isAA },
    { label: 'AAA', pass: isAAA },
    ...(activeTab === 'graphic' ? [{ label: 'Graphics AA', pass: isGraphicsAA }] : []),
  ];

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: LI_TEXT }}>Color Contrast Checker</h1>
          <p className="text-sm" style={{ color: LI_MUTED }}>Ensure your color combinations meet WCAG accessibility standards</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex rounded-lg p-1" style={{ backgroundColor: '#fff', border: `1px solid ${LI_BORDER}` }}>
            {[['text', 'Text Contrast'], ['graphic', 'UI Elements']].map(([val, label]) => (
              <button key={val} onClick={() => setActiveTab(val)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === val ? LI_BLUE : 'transparent',
                  color: activeTab === val ? '#fff' : LI_MUTED,
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="mb-5 p-6 rounded-xl border transition-all" style={{ backgroundColor: bgColor, color: fgColor, borderColor: LI_BORDER }}>
            {activeTab === "text" ? (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-3">Text Preview</h2>
                <p className="text-base mb-4">{customText}</p>
                <div className="flex justify-center gap-6 mb-4">
                  <div>
                    <span className="text-xs">Normal Text</span>
                    <p className="text-sm">Content text</p>
                  </div>
                  <div>
                    <span className="text-xs">Large Text</span>
                    <p className="text-xl font-bold">Heading text</p>
                  </div>
                </div>
                <input type="text" value={customText} onChange={e => setCustomText(e.target.value)}
                  className="w-full p-2 rounded text-sm outline-none bg-transparent border"
                  style={{ color: fgColor, borderColor: fgColor }}
                  placeholder="Enter custom text to preview" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-bold">UI Elements Preview</h2>
                <div className="flex gap-6 justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs">Button</span>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: fgColor, color: bgColor }}>
                      Click Me
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs">Icon</span>
                    <FaCircleInfo size={24} style={{ color: fgColor }} />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs">Border</span>
                    <div className="w-14 h-14 rounded-lg" style={{ border: `2px solid ${fgColor}` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Color selection */}
          <div className="bg-white rounded-xl p-5 space-y-4" style={{ border: `1px solid ${LI_BORDER}` }}>
            {[
              { label: 'Text / Foreground Color', value: fgColor, onChange: setFgColor, placeholder: '#000000' },
              { label: 'Background Color', value: bgColor, onChange: setBgColor, placeholder: '#FFFFFF' },
            ].map(({ label, value, onChange, placeholder }, i) => (
              <div key={i}>
                {i === 1 && (
                  <div className="flex flex-wrap items-center gap-2 py-3">
                    <button onClick={swapColors}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: '#F3F2EF', color: LI_TEXT, border: `1px solid ${LI_BORDER}` }}>
                      <FaArrowRightArrowLeft className="text-xs" /> Swap
                    </button>
                    <button onClick={() => setFgColor(generateComplementaryColor(bgColor))}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: '#F3F2EF', color: LI_TEXT, border: `1px solid ${LI_BORDER}` }}>
                      Complement
                    </button>
                    <button onClick={randomizeColors}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: '#F3F2EF', color: LI_TEXT, border: `1px solid ${LI_BORDER}` }}>
                      Random
                    </button>
                    <button onClick={suggestBetterContrast}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: '#EEF3F8', color: LI_BLUE, border: `1px solid ${LI_BLUE}` }}>
                      Fix Contrast
                    </button>
                  </div>
                )}
                <label className="block mb-2 text-sm font-medium" style={{ color: LI_TEXT }}>{label}</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={value} onChange={e => onChange(e.target.value)}
                    className="w-10 h-10 p-1 rounded-lg cursor-pointer" title={label} />
                  <input type="text" value={value.toUpperCase()}
                    onChange={e => { const v = e.target.value; if (v.startsWith('#') && v.length <= 7) onChange(v); }}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-mono outline-none"
                    style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
                    placeholder={placeholder}
                    onFocus={e => e.target.style.borderColor = LI_BLUE}
                    onBlur={e => e.target.style.borderColor = LI_BORDER}
                  />
                </div>
              </div>
            ))}

            {/* Presets */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium" style={{ color: LI_TEXT }}>Preset Color Pairs</label>
                <div className="relative">
                  <button className="text-gray-400 hover:text-gray-600"
                    onClick={() => setTooltipVisible(!tooltipVisible)}>
                    <FaCircleQuestion className="text-xs" />
                  </button>
                  {tooltipVisible && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded text-white whitespace-nowrap"
                      style={{ backgroundColor: LI_TEXT }}>
                      Predefined WCAG-compliant color combinations
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {colorPairs.map((pair, i) => (
                  <button key={i} onClick={() => { setFgColor(pair.fg); setBgColor(pair.bg); }}
                    className="flex flex-col items-center p-2 rounded-lg text-xs transition-colors hover:scale-105"
                    style={{ backgroundColor: pair.bg, color: pair.fg, border: `1px solid ${LI_BORDER}` }}>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full border mb-1"
                      style={{ backgroundColor: pair.fg, borderColor: pair.bg }}>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pair.bg }} />
                    </div>
                    <span className="font-medium text-[10px] text-center leading-tight">{pair.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl p-5 space-y-4" style={{ border: `1px solid ${LI_BORDER}` }}>
            <h3 className="font-semibold text-sm" style={{ color: LI_TEXT }}>Contrast Ratio</h3>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#F3F2EF' }}>
              <span className="text-5xl font-bold" style={{ color: rating.color }}>{contrastRatio}:1</span>
              <p className="text-sm font-semibold mt-1" style={{ color: rating.color }}>{rating.level} Contrast</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: LI_TEXT }}>Accessibility Levels</h4>
              <div className="space-y-2">
                {levels.map(({ label, pass }) => (
                  <div key={label} className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{ backgroundColor: pass ? '#F0FFF6' : '#FFF0F0' }}>
                    {pass
                      ? <FaCheck style={{ color: GREEN, fontSize: 13, flexShrink: 0 }} />
                      : <FaCircleExclamation style={{ color: RED, fontSize: 13, flexShrink: 0 }} />}
                    <span className="text-sm" style={{ color: pass ? GREEN : RED }}>
                      {label}: {pass ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        {colorHistory.length > 0 && (
          <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold" style={{ color: LI_TEXT }}>Color History</h3>
              <button onClick={() => setColorHistory([])} className="text-xs" style={{ color: RED }}>
                Clear History
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {colorHistory.map((pair, i) => (
                <button key={i} onClick={() => { setFgColor(pair.fg); setBgColor(pair.bg); }}
                  className="flex flex-col items-center p-2 rounded-lg flex-shrink-0 hover:bg-gray-50 transition-colors"
                  style={{ border: `1px solid ${LI_BORDER}` }}>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border mb-1"
                    style={{ backgroundColor: pair.fg }}>
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: pair.bg }} />
                  </div>
                  <div className="text-[10px] text-center" style={{ color: LI_MUTED }}>
                    {pair.fg}<br />{pair.bg}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContrastChecker;
