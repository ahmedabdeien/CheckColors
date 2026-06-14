import { useState } from 'react';
import { FaCopy, FaCheck, FaShuffle, FaDownload } from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
};

const rgbToHex = (r, g, b) =>
  '#' + [r,g,b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,'0')).join('').toUpperCase();

const getLuminance = (hex) => {
  const [r,g,b] = hexToRgb(hex).map(v => v/255);
  return 0.299*r + 0.587*g + 0.114*b;
};

const getContrast = (hex) => getLuminance(hex) > 0.5 ? '#000' : '#fff';

const randomHex = () => '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');

const STEPS = 10;

export default function TintsShades() {
  const [base, setBase] = useState('#0A66C2');
  const [input, setInput] = useState('#0A66C2');
  const [copied, setCopied] = useState(null);
  const [mode, setMode] = useState('both'); // 'tints' | 'shades' | 'both'

  const [r, g, b] = hexToRgb(base);

  const tints = Array.from({ length: STEPS }, (_, i) => {
    const t = (i + 1) / STEPS;
    return rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
  }).reverse();

  const shades = Array.from({ length: STEPS }, (_, i) => {
    const t = (i + 1) / STEPS;
    return rgbToHex(r * (1 - t), g * (1 - t), b * (1 - t));
  });

  const copy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  const exportCSS = () => {
    const lines = [
      `/* Base */`,
      `--color-base: ${base};`,
      ...tints.map((h, i) => `--color-tint-${(i + 1) * 10}: ${h};`),
      ...shades.map((h, i) => `--color-shade-${(i + 1) * 10}: ${h};`),
    ];
    navigator.clipboard.writeText(':root {\n  ' + lines.join('\n  ') + '\n}');
    setCopied('css');
    setTimeout(() => setCopied(null), 2000);
  };

  const applyInput = () => {
    const clean = input.startsWith('#') ? input : '#' + input;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) { setBase(clean); setInput(clean); }
  };

  const Swatch = ({ hex, label }) => (
    <button onClick={() => copy(hex)}
      className="group relative rounded-xl overflow-hidden transition-transform hover:scale-105 flex flex-col"
      style={{ border: `1px solid rgba(0,0,0,0.06)` }}>
      <div className="h-16 w-full" style={{ backgroundColor: hex }} />
      <div className="p-2 bg-white text-left">
        <p className="text-[10px] font-semibold" style={{ color: LI_TEXT }}>{label}</p>
        <p className="text-[9px] font-mono mt-0.5" style={{ color: LI_MUTED }}>{hex}</p>
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-black/20">
        {copied === hex
          ? <FaCheck className="text-white text-[10px]" />
          : <FaCopy className="text-white text-[10px]" />}
      </div>
    </button>
  );

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: LI_TEXT }}>Tints & Shades Generator</h1>
          <p className="text-sm" style={{ color: LI_MUTED }}>Generate light tints and dark shades from any color</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-xl p-5 flex flex-wrap gap-4 items-end" style={{ border: `1px solid ${LI_BORDER}` }}>
          {/* Color picker */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: LI_MUTED }}>BASE COLOR</p>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden relative cursor-pointer flex-shrink-0"
                style={{ border: `2px solid ${LI_BORDER}` }}>
                <input type="color" value={base} onChange={e => { setBase(e.target.value); setInput(e.target.value); }}
                  className="absolute inset-0 w-[200%] h-[200%] opacity-0 cursor-pointer" style={{ top: '-50%', left: '-50%' }} />
                <div className="w-full h-full" style={{ backgroundColor: base }} />
              </div>
              <input type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onBlur={applyInput}
                onKeyDown={e => e.key === 'Enter' && applyInput()}
                className="font-mono text-sm px-3 py-2 rounded-lg outline-none w-28"
                style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }} />
            </div>
          </div>

          {/* Mode */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: LI_MUTED }}>SHOW</p>
            <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: '#F3F2EF' }}>
              {[['both','Both'],['tints','Tints'],['shades','Shades']].map(([v, l]) => (
                <button key={v} onClick={() => setMode(v)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={{ backgroundColor: mode === v ? '#fff' : 'transparent', color: mode === v ? LI_TEXT : LI_MUTED,
                    boxShadow: mode === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 ml-auto">
            <button onClick={() => { const h = randomHex(); setBase(h); setInput(h); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#F3F2EF', color: LI_MUTED }}>
              <FaShuffle /> Random
            </button>
            <button onClick={exportCSS}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-colors text-white"
              style={{ backgroundColor: copied === 'css' ? '#057642' : LI_BLUE }}>
              {copied === 'css' ? <><FaCheck /> Copied!</> : <><FaDownload /> Export CSS</>}
            </button>
          </div>
        </div>

        {/* Base color banner */}
        <div className="rounded-xl h-20 flex items-center justify-center shadow-sm"
          style={{ backgroundColor: base, border: `1px solid rgba(0,0,0,0.06)` }}>
          <div className="text-center">
            <p className="text-xs font-semibold" style={{ color: getContrast(base) }}>BASE</p>
            <p className="font-mono text-sm font-bold" style={{ color: getContrast(base) }}>{base.toUpperCase()}</p>
          </div>
        </div>

        {/* Tints */}
        {(mode === 'both' || mode === 'tints') && (
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: LI_MUTED }}>TINTS (lighter)</p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {tints.map((h, i) => <Swatch key={h} hex={h} label={`${(i+1)*10}%`} />)}
            </div>
          </div>
        )}

        {/* Shades */}
        {(mode === 'both' || mode === 'shades') && (
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: LI_MUTED }}>SHADES (darker)</p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {shades.map((h, i) => <Swatch key={h} hex={h} label={`${(i+1)*10}%`} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
