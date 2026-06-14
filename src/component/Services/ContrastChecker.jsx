import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowRightArrowLeft, FaEye, FaEyeSlash, FaCheck, FaCircleExclamation,
  FaCopy, FaShuffle, FaShareNodes, FaWandMagicSparkles, FaBolt,
  FaFont, FaCircleHalfStroke, FaLightbulb
} from "react-icons/fa6";

// ─── WCAG Color Science ───────────────────────────────────────────────────────
const toLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const luminance = (hex) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2),16)/255;
  const g = parseInt(h.slice(2,4),16)/255;
  const b = parseInt(h.slice(4,6),16)/255;
  return 0.2126*toLinear(r) + 0.7152*toLinear(g) + 0.0722*toLinear(b);
};
const contrastRatio = (fg, bg) => {
  const l1 = luminance(fg), l2 = luminance(bg);
  return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2);
};

// ─── Color Blindness Matrices ─────────────────────────────────────────────────
const CB_FILTERS = {
  normal:       null,
  protanopia:   'url(#protanopia)',
  deuteranopia: 'url(#deuteranopia)',
  tritanopia:   'url(#tritanopia)',
  achromatopsia:'url(#achromatopsia)',
};
const CB_LABELS = {
  normal:       'Normal Vision',
  protanopia:   'Protanopia (Red-blind)',
  deuteranopia: 'Deuteranopia (Green-blind)',
  tritanopia:   'Tritanopia (Blue-blind)',
  achromatopsia:'Achromatopsia (No color)',
};

// ─── Suggest accessible color (darken/lighten) ───────────────────────────────
const hexToRgb = h => { const v=h.replace('#',''); return [parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)]; };
const rgbToHex = (r,g,b) => '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('').toUpperCase();

const suggestFg = (fgHex, bgHex, target=4.5) => {
  const bgLum = luminance(bgHex);
  // Try making fg darker or lighter to hit target
  let [r,g,b] = hexToRgb(fgHex);
  for (let step = 0; step <= 255; step += 2) {
    const darkHex = rgbToHex(r-step,g-step,b-step);
    const lightHex = rgbToHex(r+step,g+step,b+step);
    if (parseFloat(contrastRatio(darkHex, bgHex)) >= target) return darkHex;
    if (parseFloat(contrastRatio(lightHex, bgHex)) >= target) return lightHex;
  }
  return bgLum > 0.5 ? '#000000' : '#FFFFFF';
};

// ─── Constants ────────────────────────────────────────────────────────────────
const LI_BLUE   = '#0A66C2';
const LI_BG     = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT   = '#000000E6';
const LI_MUTED  = '#00000099';
const GREEN     = '#057642';
const RED       = '#CC1016';
const GOLD      = '#915907';

const PRESETS = [
  { fg:'#000000', bg:'#FFFFFF', name:'Black / White' },
  { fg:'#FFFFFF', bg:'#000000', name:'White / Black' },
  { fg:'#FFFFFF', bg:'#0A66C2', name:'White / LinkedIn' },
  { fg:'#212121', bg:'#F5F5F5', name:'Dark / Light Gray' },
  { fg:'#FFFFFF', bg:'#CC1016', name:'White / Red' },
  { fg:'#1A1A1A', bg:'#FFEB3B', name:'Dark / Yellow' },
  { fg:'#FFFFFF', bg:'#057642', name:'White / Green' },
  { fg:'#000000', bg:'#FFC107', name:'Black / Amber' },
];

const RATIO_LEVELS = [
  { ratio: 1,   label: '1:1',    color: '#E5E7EB' },
  { ratio: 3,   label: 'AA Large', color: GOLD },
  { ratio: 4.5, label: 'AA',     color: LI_BLUE },
  { ratio: 7,   label: 'AAA',    color: GREEN },
  { ratio: 21,  label: '21:1',   color: '#000' },
];

// ─── SVG filters for color blindness ─────────────────────────────────────────
const SVGFilters = () => (
  <svg className="absolute w-0 h-0" aria-hidden="true">
    <defs>
      <filter id="protanopia">
        <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="deuteranopia">
        <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="tritanopia">
        <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="achromatopsia">
        <feColorMatrix type="matrix" values="0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0,0,0,1,0"/>
      </filter>
    </defs>
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────
const ColorPicker = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: LI_MUTED }}>{label}</label>
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer shadow-sm"
        style={{ border: `2px solid ${LI_BORDER}` }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" style={{ transform:'scale(2)' }} />
        <div className="w-full h-full" style={{ backgroundColor: value }} />
      </div>
      <input type="text" value={value.toUpperCase()}
        onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v.length===7?v:value); }}
        className="flex-1 font-mono text-sm px-3 py-2.5 rounded-lg outline-none"
        style={{ border:`1px solid ${LI_BORDER}`, color:LI_TEXT }}
        onFocus={e=>e.target.style.borderColor=LI_BLUE}
        onBlur={e=>e.target.style.borderColor=LI_BORDER}
      />
    </div>
  </div>
);

const Badge = ({ pass, label }) => (
  <div className="flex items-center justify-between p-3 rounded-xl"
    style={{ backgroundColor: pass ? '#F0FFF6' : '#FFF5F5', border:`1px solid ${pass?'#BBF7D0':'#FECACA'}` }}>
    <span className="text-sm font-medium" style={{ color: pass ? GREEN : RED }}>{label}</span>
    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: pass ? GREEN : RED, color:'#fff' }}>
      {pass ? <FaCheck className="text-[9px]"/> : <FaCircleExclamation className="text-[9px]"/>}
      {pass ? 'PASS' : 'FAIL'}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ContrastChecker() {
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#FFFFFF');
  const [customText, setCustomText] = useState('The quick brown fox jumps over the lazy dog.');
  const [fontSize, setFontSize] = useState(16);
  const [bold, setBold] = useState(false);
  const [cbMode, setCbMode] = useState('normal');
  const [activeTab, setActiveTab] = useState('text');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [suggestion, setSuggestion] = useState(null);

  const ratio = parseFloat(contrastRatio(fg, bg));
  const isLargeText = fontSize >= 18 || (bold && fontSize >= 14);
  const passAALarge  = ratio >= 3;
  const passAA       = isLargeText ? ratio >= 3 : ratio >= 4.5;
  const passAAA      = isLargeText ? ratio >= 4.5 : ratio >= 7;
  const passGraphics = ratio >= 3;

  const rating = ratio >= 7 ? { label:'AAA', color:GREEN }
               : ratio >= 4.5 ? { label:'AA', color:LI_BLUE }
               : ratio >= 3   ? { label:'AA Large', color:GOLD }
               : { label:'Fail', color:RED };

  // ratio bar position (log scale 1→21)
  const barPct = Math.min(100, (Math.log(ratio) / Math.log(21)) * 100);

  useEffect(() => {
    if (fg !== bg) setHistory(h => { const p={fg,bg}; return [p,...h.filter(x=>x.fg!==fg||x.bg!==bg)].slice(0,6); });
    setSuggestion(null);
  }, [fg, bg]);

  const swap = () => { setFg(bg); setBg(fg); };
  const randomize = () => {
    setFg('#'+Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0').toUpperCase());
    setBg('#'+Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0').toUpperCase());
  };

  const suggest = () => {
    const target = isLargeText ? 3 : 4.5;
    if (ratio >= target) return;
    setSuggestion(suggestFg(fg, bg, target));
  };

  const copyResults = () => {
    const text = `Contrast Ratio: ${ratio}:1\nForeground: ${fg}\nBackground: ${bg}\nAA: ${passAA?'PASS':'FAIL'} | AAA: ${passAAA?'PASS':'FAIL'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  };

  const shareURL = () => {
    const url = `${window.location.origin}/Contrast-Checker?fg=${fg.replace('#','')}&bg=${bg.replace('#','')}`;
    navigator.clipboard.writeText(url);
    setCopied('url');
    setTimeout(()=>setCopied(false), 2000);
  };

  const filterStyle = cbMode !== 'normal' ? { filter: CB_FILTERS[cbMode] } : {};

  return (
    <div style={{ backgroundColor:LI_BG, minHeight:'100vh' }}>
      <SVGFilters />

      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor:LI_BORDER }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color:LI_TEXT }}>Color Contrast Checker</h1>
          <p className="text-sm" style={{ color:LI_MUTED }}>
            WCAG 2.1 accessibility compliance checker with color blindness simulation
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

        {/* ── Top row: ratio + colors ── */}
        <div className="grid md:grid-cols-3 gap-4">

          {/* Ratio card */}
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{ border:`1px solid ${LI_BORDER}` }}>
            <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color:LI_MUTED }}>Contrast Ratio</p>
            <div className="text-6xl font-black leading-none mb-1" style={{ color:rating.color }}>{ratio}</div>
            <div className="text-sm font-semibold mb-4" style={{ color:rating.color }}>:1</div>

            {/* Bar */}
            <div className="w-full h-3 rounded-full relative overflow-hidden mb-2"
              style={{ background:'linear-gradient(to right, #CC1016, #915907 25%, #0A66C2 55%, #057642)' }}>
              <div className="absolute top-0 h-full w-1 bg-white rounded-full shadow-md -translate-x-1/2"
                style={{ left:`${barPct}%` }} />
            </div>
            <div className="flex justify-between w-full text-[9px] font-semibold mb-4" style={{ color:LI_MUTED }}>
              <span>1:1</span><span>3:1</span><span>4.5:1</span><span>7:1</span><span>21:1</span>
            </div>

            {/* Rating badge */}
            <span className="text-sm font-bold px-4 py-1.5 rounded-full text-white"
              style={{ backgroundColor:rating.color }}>
              {rating.label}
            </span>
          </div>

          {/* Color pickers */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 space-y-4"
            style={{ border:`1px solid ${LI_BORDER}` }}>
            <ColorPicker label="Foreground / Text Color" value={fg} onChange={setFg} />
            <ColorPicker label="Background Color" value={bg} onChange={setBg} />

            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={swap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor:'#F3F2EF', color:LI_TEXT, border:`1px solid ${LI_BORDER}` }}>
                <FaArrowRightArrowLeft /> Swap
              </button>
              <button onClick={randomize}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor:'#F3F2EF', color:LI_TEXT, border:`1px solid ${LI_BORDER}` }}>
                <FaShuffle /> Random
              </button>
              {ratio < (isLargeText?3:4.5) && (
                <button onClick={suggest}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ backgroundColor:'#EEF3F8', color:LI_BLUE, border:`1px solid ${LI_BLUE}` }}>
                  <FaWandMagicSparkles /> Fix Contrast
                </button>
              )}
              <button onClick={copyResults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ml-auto"
                style={{ backgroundColor: copied==='true'?'#F0FFF6':'#F3F2EF', color:LI_TEXT, border:`1px solid ${LI_BORDER}` }}>
                {copied&&copied!=='url' ? <FaCheck style={{color:GREEN}}/> : <FaCopy />}
                {copied&&copied!=='url' ? 'Copied!' : 'Copy Results'}
              </button>
              <button onClick={shareURL}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor:'#F3F2EF', color:LI_TEXT, border:`1px solid ${LI_BORDER}` }}>
                {copied==='url' ? <FaCheck style={{color:GREEN}}/> : <FaShareNodes />}
                {copied==='url' ? 'Copied!' : 'Share URL'}
              </button>
            </div>

            {/* Suggestion */}
            {suggestion && (
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor:'#F0FFF6', border:`1px solid #BBF7D0` }}>
                <FaLightbulb style={{ color:GREEN, flexShrink:0 }} />
                <div className="flex-1 text-xs" style={{ color:GREEN }}>
                  Suggested accessible foreground:
                  <span className="font-mono font-bold ml-1">{suggestion}</span>
                  <span className="ml-1" style={{ color:LI_MUTED }}>
                    (ratio {contrastRatio(suggestion, bg)}:1)
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor:suggestion, border:`1px solid ${LI_BORDER}` }} />
                  <button onClick={()=>{ setFg(suggestion); setSuggestion(null); }}
                    className="text-xs px-2 py-1 rounded font-semibold text-white"
                    style={{ backgroundColor:GREEN }}>Apply</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── WCAG Results ── */}
        <div className="bg-white rounded-2xl p-6" style={{ border:`1px solid ${LI_BORDER}` }}>
          <div className="flex items-center gap-2 mb-4">
            <FaBolt style={{ color:LI_BLUE }} />
            <h2 className="font-bold text-sm" style={{ color:LI_TEXT }}>WCAG 2.1 Compliance</h2>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs" style={{ color:LI_MUTED }}>Font size:</span>
              <input type="number" value={fontSize} min={8} max={72} onChange={e=>setFontSize(+e.target.value)}
                className="w-16 text-xs text-center px-2 py-1 rounded-lg outline-none"
                style={{ border:`1px solid ${LI_BORDER}`, color:LI_TEXT }} />
              <span className="text-xs" style={{ color:LI_MUTED }}>px</span>
              <button onClick={()=>setBold(!bold)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-bold transition-colors"
                style={{
                  backgroundColor: bold ? LI_BLUE : '#F3F2EF',
                  color: bold ? '#fff' : LI_MUTED,
                  border:`1px solid ${bold?LI_BLUE:LI_BORDER}`
                }}>
                <FaFont className="text-[10px]" /> Bold
              </button>
              {isLargeText && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor:'#EEF3F8', color:LI_BLUE }}>Large Text Mode</span>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Badge pass={passAALarge}  label="AA — Large Text (≥3:1)" />
            <Badge pass={passAA}       label={`AA — Normal Text (≥${isLargeText?3:4.5}:1)`} />
            <Badge pass={passAAA}      label={`AAA (≥${isLargeText?4.5:7}:1)`} />
            <Badge pass={passGraphics} label="UI Components / Graphics (≥3:1)" />
          </div>
        </div>

        {/* ── Preview + Color Blindness ── */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border:`1px solid ${LI_BORDER}` }}>
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor:LI_BORDER }}>
            {[['text','Text Preview'],['ui','UI Elements'],['blindness','Color Blindness']].map(([v,l])=>(
              <button key={v} onClick={()=>setActiveTab(v)}
                className="px-5 py-3 text-sm font-medium transition-colors border-b-2"
                style={{
                  borderColor: activeTab===v ? LI_BLUE : 'transparent',
                  color: activeTab===v ? LI_BLUE : LI_MUTED,
                  backgroundColor: activeTab===v ? '#F8FAFF' : 'transparent',
                }}>
                {l}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Text Preview */}
            {activeTab==='text' && (
              <div className="space-y-4">
                <div className="rounded-xl p-6" style={{ backgroundColor:bg, ...filterStyle }}>
                  <div style={{ color:fg }}>
                    <p className="font-bold mb-2" style={{ fontSize:'24px' }}>Large Text (24px Bold)</p>
                    <p className="mb-2" style={{ fontSize:'18px' }}>Large Text (18px Normal)</p>
                    <p className="mb-2" style={{ fontSize:`${fontSize}px`, fontWeight:bold?700:400 }}>
                      {customText}
                    </p>
                    <p style={{ fontSize:'12px' }}>Small Text (12px) — hardest to read</p>
                  </div>
                </div>
                <input type="text" value={customText} onChange={e=>setCustomText(e.target.value)}
                  placeholder="Type custom preview text..."
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{ border:`1px solid ${LI_BORDER}`, color:LI_TEXT }}
                  onFocus={e=>e.target.style.borderColor=LI_BLUE}
                  onBlur={e=>e.target.style.borderColor=LI_BORDER}
                />
              </div>
            )}

            {/* UI Elements */}
            {activeTab==='ui' && (
              <div className="rounded-xl p-8" style={{ backgroundColor:bg, ...filterStyle }}>
                <div className="flex flex-wrap gap-6 items-start" style={{ color:fg }}>
                  <div className="space-y-2 text-center">
                    <p className="text-xs font-semibold" style={{ color:fg, opacity:0.7 }}>Button</p>
                    <button className="px-5 py-2.5 rounded-lg font-semibold text-sm"
                      style={{ backgroundColor:fg, color:bg }}>Click Me</button>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-xs font-semibold" style={{ color:fg, opacity:0.7 }}>Badge</p>
                    <span className="px-3 py-1 rounded-full text-sm font-medium border"
                      style={{ color:fg, borderColor:fg }}>Badge</span>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-xs font-semibold" style={{ color:fg, opacity:0.7 }}>Icon</p>
                    <FaCircleHalfStroke size={28} style={{ color:fg }} />
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-xs font-semibold" style={{ color:fg, opacity:0.7 }}>Input</p>
                    <input defaultValue="Input field" readOnly
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ border:`2px solid ${fg}`, color:fg, backgroundColor:'transparent' }} />
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-xs font-semibold" style={{ color:fg, opacity:0.7 }}>Link</p>
                    <a href="#" className="text-sm underline font-medium" style={{ color:fg }}>Hyperlink</a>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-xs font-semibold" style={{ color:fg, opacity:0.7 }}>Card</p>
                    <div className="w-24 h-14 rounded-lg flex items-center justify-center text-xs font-semibold"
                      style={{ backgroundColor:fg, color:bg }}>Card</div>
                  </div>
                </div>
              </div>
            )}

            {/* Color Blindness */}
            {activeTab==='blindness' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.keys(CB_FILTERS).map(mode=>(
                    <button key={mode} onClick={()=>setCbMode(mode)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: cbMode===mode ? LI_BLUE : '#F3F2EF',
                        color: cbMode===mode ? '#fff' : LI_MUTED,
                        border:`1px solid ${cbMode===mode?LI_BLUE:LI_BORDER}`,
                      }}>
                      {CB_LABELS[mode]}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl p-6" style={{ backgroundColor:bg, filter: cbMode!=='normal'?CB_FILTERS[cbMode].slice(4,-1):undefined }}>
                  <p className="text-xl font-bold mb-2" style={{ color:fg }}>{customText}</p>
                  <p className="text-sm" style={{ color:fg }}>
                    This is how people with {CB_LABELS[cbMode].toLowerCase()} see this color combination.
                  </p>
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs" style={{ color:fg }}>
                      <div className="w-5 h-5 rounded border" style={{ backgroundColor:fg, borderColor:bg }} />
                      Foreground: {fg}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color:fg }}>
                      <div className="w-5 h-5 rounded border" style={{ backgroundColor:bg, borderColor:fg }} />
                      Background: {bg}
                    </div>
                  </div>
                </div>
                <p className="text-xs" style={{ color:LI_MUTED }}>
                  * Color blindness simulation uses SVG color matrix filters (sRGB approximation).
                  Actual perception varies between individuals.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Preset Pairs ── */}
        <div className="bg-white rounded-2xl p-6" style={{ border:`1px solid ${LI_BORDER}` }}>
          <h2 className="font-bold text-sm mb-4" style={{ color:LI_TEXT }}>Common Accessible Pairs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESETS.map(p => {
              const r = parseFloat(contrastRatio(p.fg, p.bg));
              const pass = r >= 4.5;
              return (
                <button key={p.name} onClick={()=>{ setFg(p.fg); setBg(p.bg); }}
                  className="rounded-xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.02]"
                  style={{ border:`1px solid ${LI_BORDER}` }}>
                  <div className="h-14 flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor:p.bg, color:p.fg }}>
                    Aa
                  </div>
                  <div className="px-3 py-2 bg-white">
                    <p className="text-[10px] font-semibold truncate" style={{ color:LI_TEXT }}>{p.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] font-mono" style={{ color:LI_MUTED }}>{r}:1</span>
                      <span className="text-[9px] font-bold" style={{ color:pass?GREEN:RED }}>
                        {pass?'AA ✓':'Fail'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── History ── */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl p-5" style={{ border:`1px solid ${LI_BORDER}` }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm" style={{ color:LI_TEXT }}>Recent Checks</h2>
              <button onClick={()=>setHistory([])} className="text-xs" style={{ color:RED }}>Clear</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
              {history.map((p,i) => {
                const r = parseFloat(contrastRatio(p.fg, p.bg));
                return (
                  <button key={i} onClick={()=>{ setFg(p.fg); setBg(p.bg); }}
                    className="flex-shrink-0 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                    style={{ border:`1px solid ${LI_BORDER}`, minWidth:80 }}>
                    <div className="h-10 w-full" style={{ background:`linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)` }} />
                    <div className="px-2 py-1.5 text-center">
                      <p className="text-[9px] font-bold" style={{ color:r>=4.5?GREEN:r>=3?GOLD:RED }}>{r}:1</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
