import { useState, useCallback } from 'react';
import { FaCopy, FaCheck, FaArrowsLeftRight, FaPlus, FaTrash, FaDownload, FaShuffle } from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const PRESETS = [
  { name: 'Ocean',     stops: ['#0A66C2', '#00C6FF'] },
  { name: 'Sunset',    stops: ['#FF6B6B', '#FFE66D'] },
  { name: 'Forest',    stops: ['#057642', '#96E6A1'] },
  { name: 'Purple',    stops: ['#5B4FE8', '#C471ED'] },
  { name: 'Fire',      stops: ['#f12711', '#f5af19'] },
  { name: 'Night',     stops: ['#0f0c29', '#302b63', '#24243e'] },
  { name: 'Rose Gold', stops: ['#b8860b', '#e8c39e', '#f7d3b5'] },
  { name: 'Arctic',    stops: ['#1a6dff', '#c3d7ff'] },
];

const randomHex = () => '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');

export default function GradientGenerator() {
  const [stops, setStops] = useState(['#0A66C2', '#00C6FF']);
  const [type, setType] = useState('linear');
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  const css = type === 'linear'
    ? `linear-gradient(${angle}deg, ${stops.join(', ')})`
    : `radial-gradient(circle, ${stops.join(', ')})`;

  const cssCode = `background: ${css};`;

  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const randomize = () => {
    setStops([randomHex(), randomHex()]);
    setAngle(Math.floor(Math.random() * 360));
  };

  const addStop = () => stops.length < 5 && setStops([...stops, randomHex()]);
  const removeStop = (i) => stops.length > 2 && setStops(stops.filter((_, idx) => idx !== i));
  const updateStop = (i, val) => setStops(stops.map((s, idx) => idx === i ? val : s));
  const reverse = () => setStops([...stops].reverse());

  const downloadImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 630;
    const ctx = canvas.getContext('2d');
    const grad = type === 'linear'
      ? (() => {
          const rad = angle * Math.PI / 180;
          const grd = ctx.createLinearGradient(
            canvas.width / 2 - Math.cos(rad) * canvas.width / 2,
            canvas.height / 2 - Math.sin(rad) * canvas.height / 2,
            canvas.width / 2 + Math.cos(rad) * canvas.width / 2,
            canvas.height / 2 + Math.sin(rad) * canvas.height / 2,
          );
          stops.forEach((s, i) => grd.addColorStop(i / (stops.length - 1), s));
          return grd;
        })()
      : (() => {
          const grd = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
          stops.forEach((s, i) => grd.addColorStop(i / (stops.length - 1), s));
          return grd;
        })();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'gradient.png';
    a.click();
  };

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: LI_TEXT }}>Gradient Generator</h1>
          <p className="text-sm" style={{ color: LI_MUTED }}>Create beautiful CSS gradients for your designs</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Preview */}
        <div className="rounded-2xl overflow-hidden h-56 md:h-72 w-full shadow-sm"
          style={{ background: css, border: `1px solid ${LI_BORDER}` }} />

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left: stops & type */}
          <div className="bg-white rounded-xl p-5 space-y-4" style={{ border: `1px solid ${LI_BORDER}` }}>
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: LI_MUTED }}>TYPE</p>
              <div className="flex gap-2">
                {['linear', 'radial'].map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
                    style={{
                      backgroundColor: type === t ? LI_BLUE : '#F3F2EF',
                      color: type === t ? '#fff' : LI_MUTED,
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {type === 'linear' && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: LI_MUTED }}>ANGLE — {angle}°</p>
                <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(+e.target.value)}
                  className="w-full accent-blue-600" />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: LI_MUTED }}>COLOR STOPS</p>
                <div className="flex gap-1">
                  <button onClick={reverse} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Reverse" style={{ color: LI_MUTED }}>
                    <FaArrowsLeftRight className="text-xs" />
                  </button>
                  <button onClick={addStop} disabled={stops.length >= 5}
                    className="p-1.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-40" title="Add stop" style={{ color: LI_BLUE }}>
                    <FaPlus className="text-xs" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {stops.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer relative"
                      style={{ border: `2px solid ${LI_BORDER}` }}>
                      <input type="color" value={s} onChange={e => updateStop(i, e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="w-full h-full" style={{ backgroundColor: s }} />
                    </div>
                    <input type="text" value={s.toUpperCase()} onChange={e => updateStop(i, e.target.value)}
                      className="flex-1 text-sm font-mono px-3 py-2 rounded-md outline-none"
                      style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }} />
                    {stops.length > 2 && (
                      <button onClick={() => removeStop(i)} style={{ color: '#B0B0B0' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#CC1016'}
                        onMouseLeave={e => e.currentTarget.style.color = '#B0B0B0'}>
                        <FaTrash className="text-xs" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: CSS output & actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
              <p className="text-xs font-semibold mb-3" style={{ color: LI_MUTED }}>CSS CODE</p>
              <div className="rounded-lg p-3 font-mono text-xs break-all" style={{ backgroundColor: '#F3F2EF', color: LI_TEXT }}>
                {cssCode}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={copyCSS}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: copied ? '#057642' : LI_BLUE }}>
                  {copied ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy CSS</>}
                </button>
                <button onClick={randomize}
                  className="p-2.5 rounded-lg transition-colors"
                  style={{ backgroundColor: '#F3F2EF', color: LI_MUTED }}
                  title="Random gradient">
                  <FaShuffle />
                </button>
                <button onClick={downloadImage}
                  className="p-2.5 rounded-lg transition-colors"
                  style={{ backgroundColor: '#F3F2EF', color: LI_MUTED }}
                  title="Download PNG">
                  <FaDownload />
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
              <p className="text-xs font-semibold mb-3" style={{ color: LI_MUTED }}>PRESETS</p>
              <div className="grid grid-cols-4 gap-2">
                {PRESETS.map(p => (
                  <button key={p.name} onClick={() => setStops(p.stops)}
                    className="rounded-lg overflow-hidden h-12 hover:scale-105 transition-transform relative group"
                    style={{ border: `1px solid ${LI_BORDER}` }}>
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${p.stops.join(', ')})` }} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-[9px] font-semibold">{p.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
