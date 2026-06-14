import { useState, useEffect, useCallback } from 'react';
import {
  FaCopy, FaWandMagicSparkles, FaDownload, FaClockRotateLeft,
  FaLock, FaLockOpen, FaCheck, FaPalette, FaCode, FaArrowsRotate,
  FaXmark, FaShuffle
} from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import chroma from 'chroma-js';
import toast from 'react-hot-toast';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const MODES = [
  { id: 'random',          label: 'Random' },
  { id: 'analogous',       label: 'Analogous' },
  { id: 'complementary',   label: 'Complementary' },
  { id: 'triadic',         label: 'Triadic' },
  { id: 'split',           label: 'Split Comp.' },
  { id: 'tetradic',        label: 'Tetradic' },
  { id: 'monochromatic',   label: 'Monochromatic' },
  { id: 'pastel',          label: 'Pastel' },
  { id: 'dark',            label: 'Dark' },
];

const generateByMode = (mode, locked, prev) => {
  const base = chroma.random();
  const h = base.get('hsl.h');
  const s = base.get('hsl.s');
  const l = base.get('hsl.l');

  let raw;
  switch (mode) {
    case 'analogous':
      raw = [-40, -20, 0, 20, 40].map(d => chroma.hsl((h + d + 360) % 360, s, Math.max(0.25, Math.min(0.85, l))).hex());
      break;
    case 'complementary':
      raw = [
        chroma.hsl(h, s, 0.8).hex(),
        chroma.hsl(h, s, 0.6).hex(),
        base.hex(),
        chroma.hsl((h + 180) % 360, s, 0.6).hex(),
        chroma.hsl((h + 180) % 360, s, 0.4).hex(),
      ];
      break;
    case 'triadic':
      raw = [
        chroma.hsl(h, s, 0.7).hex(),
        chroma.hsl((h + 120) % 360, s, 0.6).hex(),
        chroma.hsl((h + 240) % 360, s, 0.6).hex(),
        chroma.hsl(h, s * 0.6, 0.85).hex(),
        chroma.hsl((h + 180) % 360, s * 0.5, 0.4).hex(),
      ];
      break;
    case 'split':
      raw = [
        base.hex(),
        chroma.hsl((h + 150) % 360, s, l).hex(),
        chroma.hsl((h + 210) % 360, s, l).hex(),
        chroma.hsl(h, s * 0.7, 0.8).hex(),
        chroma.hsl((h + 180) % 360, s * 0.5, 0.35).hex(),
      ];
      break;
    case 'tetradic':
      raw = [
        chroma.hsl(h, s, 0.6).hex(),
        chroma.hsl((h + 90) % 360, s, 0.6).hex(),
        chroma.hsl((h + 180) % 360, s, 0.6).hex(),
        chroma.hsl((h + 270) % 360, s, 0.6).hex(),
        chroma.hsl(h, s * 0.4, 0.9).hex(),
      ];
      break;
    case 'monochromatic':
      raw = chroma.scale([base.brighten(2).hex(), base.darken(2).hex()]).colors(5);
      break;
    case 'pastel':
      raw = Array(5).fill(null).map((_, i) =>
        chroma.hsl((h + i * 72) % 360, 0.35 + Math.random() * 0.15, 0.78 + Math.random() * 0.1).hex()
      );
      break;
    case 'dark':
      raw = Array(5).fill(null).map((_, i) =>
        chroma.hsl((h + i * 30) % 360, 0.5 + Math.random() * 0.3, 0.15 + Math.random() * 0.2).hex()
      );
      break;
    default: // random
      raw = Array(5).fill(null).map(() => chroma.random().hex());
  }

  return raw.map((color, i) => (locked?.[i] && prev?.[i]) ? prev[i] : color);
};

const getTextColor = (hex) => {
  try { return chroma(hex).luminance() > 0.35 ? '#000000' : '#ffffff'; } catch { return '#000'; }
};

const toRgb = (hex) => {
  try { const [r, g, b] = chroma(hex).rgb(); return `rgb(${r}, ${g}, ${b})`; } catch { return ''; }
};

export default function GeneratePalette() {
  const [palette, setPalette] = useState([]);
  const [locked, setLocked] = useState(Array(5).fill(false));
  const [mode, setMode] = useState('random');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(null);
  const [exportTab, setExportTab] = useState('css');

  const generate = useCallback((m = mode, lk = locked, prev = palette) => {
    if (prev.length > 0) setHistory(h => [prev, ...h].slice(0, 10));
    setPalette(generateByMode(m, lk, prev));
  }, [mode, locked, palette]);

  useEffect(() => { generate('random', Array(5).fill(false), []); }, []);

  // Spacebar to regenerate
  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space' && !e.target.matches('input,textarea')) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [generate]);

  const copyColor = (hex, id) => {
    navigator.clipboard.writeText(hex);
    setCopied(id);
    toast.success(`Copied ${hex}`);
    setTimeout(() => setCopied(null), 1500);
  };

  const toggleLock = (i) => setLocked(l => l.map((v, idx) => idx === i ? !v : v));

  const downloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000; canvas.height = 300;
    const ctx = canvas.getContext('2d');
    palette.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * 200, 0, 200, 300);
      ctx.fillStyle = getTextColor(color);
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(color.toUpperCase(), i * 200 + 100, 155);
      ctx.font = '12px monospace';
      ctx.fillText(toRgb(color), i * 200 + 100, 178);
    });
    const a = document.createElement('a');
    a.download = 'palette.png';
    a.href = canvas.toDataURL();
    a.click();
    toast.success('PNG downloaded');
  };

  const cssVars = palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n');
  const cssVarsRoot = `:root {\n${cssVars}\n}`;
  const tailwindColors = `colors: {\n${palette.map((c, i) => `  'palette-${i + 1}': '${c}',`).join('\n')}\n}`;
  const scssVars = palette.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');

  const EXPORT_TABS = [
    { id: 'css', label: 'CSS Vars', code: cssVarsRoot },
    { id: 'tailwind', label: 'Tailwind', code: tailwindColors },
    { id: 'scss', label: 'SCSS', code: scssVars },
  ];

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF3F8' }}>
            <FaPalette style={{ color: LI_BLUE, fontSize: 18 }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: LI_TEXT }}>Palette Generator</h1>
        </div>
        <p className="text-sm" style={{ color: LI_MUTED }}>
          Press <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: '#E0DFDC' }}>Space</kbd> to generate · Click a color to copy · Lock colors to keep them
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Mode selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {MODES.map(({ id, label }) => (
            <button key={id} onClick={() => { setMode(id); generate(id, locked, palette); }}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: mode === id ? LI_BLUE : '#fff',
                color: mode === id ? '#fff' : LI_MUTED,
                border: `1px solid ${mode === id ? LI_BLUE : LI_BORDER}`,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Palette swatches */}
        <div className="flex gap-2 mb-5 rounded-2xl overflow-hidden" style={{ height: 280, border: `1px solid ${LI_BORDER}` }}>
          {palette.map((color, i) => (
            <motion.div key={i}
              className="flex-1 relative flex flex-col items-center justify-end cursor-pointer group"
              style={{ backgroundColor: color }}
              onClick={() => copyColor(color, i)}
              whileHover={{ flex: 1.8 }}
              transition={{ duration: 0.2 }}>

              {/* Lock button */}
              <button
                onClick={e => { e.stopPropagation(); toggleLock(i); }}
                className="absolute top-3 opacity-0 group-hover:opacity-100 p-2 rounded-full transition-all"
                style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                {locked[i]
                  ? <FaLock className="text-xs" style={{ color: '#fff' }} />
                  : <FaLockOpen className="text-xs" style={{ color: '#fff' }} />}
              </button>

              {/* Lock indicator */}
              {locked[i] && (
                <div className="absolute top-3 flex items-center justify-center p-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <FaLock className="text-xs text-white" />
                </div>
              )}

              {/* Copied flash */}
              <AnimatePresence>
                {copied === i && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <FaCheck className="text-2xl text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Color info */}
              <div className="w-full px-2 pb-3 text-center">
                <p className="text-xs font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: getTextColor(color) }}>
                  {color.toUpperCase()}
                </p>
                <p className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: getTextColor(color) + 'bb' }}>
                  {toRgb(color)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* HEX strip below */}
        <div className="flex gap-2 mb-6">
          {palette.map((color, i) => (
            <div key={i} className="flex-1 text-center">
              <p className="text-xs font-mono font-semibold" style={{ color: LI_TEXT }}>{color.toUpperCase()}</p>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button onClick={() => generate()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: LI_BLUE }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
            <FaArrowsRotate /> Generate
          </button>
          <button onClick={() => generate('random', Array(5).fill(false), [])}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border"
            style={{ borderColor: LI_BORDER, color: LI_TEXT, backgroundColor: '#fff' }}>
            <FaShuffle className="text-xs" style={{ color: LI_MUTED }} /> Random
          </button>
          <button onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border"
            style={{ borderColor: LI_BORDER, color: LI_TEXT, backgroundColor: '#fff' }}>
            <FaCode className="text-xs" style={{ color: LI_BLUE }} /> Export
          </button>
          <button onClick={downloadPNG}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border"
            style={{ borderColor: LI_BORDER, color: LI_TEXT, backgroundColor: '#fff' }}>
            <FaDownload className="text-xs" style={{ color: '#057642' }} /> PNG
          </button>
          <button onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border"
            style={{ borderColor: LI_BORDER, color: LI_TEXT, backgroundColor: '#fff' }}>
            <FaClockRotateLeft className="text-xs" style={{ color: LI_MUTED }} /> History
          </button>
        </div>

        {/* History */}
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl p-4 mb-6" style={{ border: `1px solid ${LI_BORDER}` }}>
              <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: LI_MUTED }}>Recent Palettes</p>
              <div className="space-y-2">
                {history.map((h, idx) => (
                  <div key={idx} onClick={() => { setPalette(h); setShowHistory(false); }}
                    className="flex rounded-lg overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
                    style={{ height: 36 }}>
                    {h.map((c, ci) => <div key={ci} style={{ flex: 1, backgroundColor: c }} />)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowExport(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
              style={{ border: `1px solid ${LI_BORDER}` }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: LI_TEXT }}>Export Palette</h3>
                <button onClick={() => setShowExport(false)} className="p-1 rounded-full hover:bg-gray-100">
                  <FaXmark style={{ color: LI_MUTED }} />
                </button>
              </div>

              {/* Preview strip */}
              <div className="flex rounded-lg overflow-hidden mb-4 h-10">
                {palette.map((c, i) => <div key={i} style={{ flex: 1, backgroundColor: c }} />)}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
                {EXPORT_TABS.map(({ id, label }) => (
                  <button key={id} onClick={() => setExportTab(id)}
                    className="flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: exportTab === id ? '#fff' : 'transparent',
                      color: exportTab === id ? LI_TEXT : LI_MUTED,
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              <pre className="text-xs rounded-lg p-3 overflow-auto mb-4 font-mono"
                style={{ backgroundColor: '#F3F2EF', color: LI_TEXT, maxHeight: 180 }}>
                {EXPORT_TABS.find(t => t.id === exportTab)?.code}
              </pre>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(EXPORT_TABS.find(t => t.id === exportTab)?.code || '');
                  toast.success('Copied to clipboard!');
                }}
                className="w-full py-2.5 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: LI_BLUE }}>
                <FaCopy /> Copy Code
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
