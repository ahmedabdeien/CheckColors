import { useState, useEffect, useCallback, useRef } from 'react';
import chroma from 'chroma-js';
import toast from 'react-hot-toast';
import {
  FaLock, FaLockOpen, FaCopy, FaCheck, FaShuffle, FaDownload,
  FaCode, FaHeart, FaRegHeart, FaExpand, FaMagnifyingGlass,
  FaArrowsRotate, FaEllipsisVertical,
} from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

// ── Palette generation ───────────────────────────────────────────────────────

const HARMONY_MODES = ['Random', 'Analogous', 'Complementary', 'Triadic', 'Monochromatic', 'Pastel', 'Dark'];

function randomHue() { return Math.random() * 360; }

function generatePalette(mode = 'Random', locked = [], prev = []) {
  const base = chroma.hsl(randomHue(), 0.65 + Math.random() * 0.25, 0.45 + Math.random() * 0.15);

  let colors;
  switch (mode) {
    case 'Analogous':
      colors = [-40, -20, 0, 20, 40].map(d => chroma.hsl(base.hsl()[0] + d, 0.6, 0.5));
      break;
    case 'Complementary': {
      const [h, s, l] = base.hsl();
      colors = [
        chroma.hsl(h, s, 0.75),
        chroma.hsl(h, s, 0.55),
        chroma.hsl(h, s, l),
        chroma.hsl((h + 180) % 360, s, 0.55),
        chroma.hsl((h + 180) % 360, s, 0.75),
      ];
      break;
    }
    case 'Triadic': {
      const h = base.hsl()[0];
      colors = [
        chroma.hsl(h, 0.6, 0.7),
        chroma.hsl(h, 0.7, 0.5),
        chroma.hsl((h + 120) % 360, 0.7, 0.55),
        chroma.hsl((h + 240) % 360, 0.6, 0.55),
        chroma.hsl((h + 240) % 360, 0.5, 0.72),
      ];
      break;
    }
    case 'Monochromatic': {
      const [h, s] = base.hsl();
      colors = [0.85, 0.7, 0.55, 0.4, 0.25].map(l => chroma.hsl(h, s * 0.9, l));
      break;
    }
    case 'Pastel':
      colors = Array.from({ length: 5 }, () =>
        chroma.hsl(randomHue(), 0.4 + Math.random() * 0.2, 0.78 + Math.random() * 0.1));
      break;
    case 'Dark':
      colors = Array.from({ length: 5 }, () =>
        chroma.hsl(randomHue(), 0.5 + Math.random() * 0.3, 0.15 + Math.random() * 0.2));
      break;
    default: // Random
      colors = Array.from({ length: 5 }, () =>
        chroma.hsl(randomHue(), 0.45 + Math.random() * 0.4, 0.35 + Math.random() * 0.4));
  }

  return colors.map((c, i) =>
    locked[i] && prev[i] ? prev[i] : c.hex()
  );
}

// ── Community palettes (static sample) ──────────────────────────────────────

const COMMUNITY = [
  { id: 1, name: 'Ocean Breeze',    colors: ['#03045e','#023e8a','#0077b6','#0096c7','#00b4d8'], likes: 214, tags: ['blue','ocean'] },
  { id: 2, name: 'Warm Sunset',     colors: ['#ff6b6b','#feca57','#ff9f43','#ee5a24','#c0392b'], likes: 189, tags: ['warm','sunset'] },
  { id: 3, name: 'Forest Walk',     colors: ['#2d6a4f','#40916c','#52b788','#74c69d','#b7e4c7'], likes: 176, tags: ['green','nature'] },
  { id: 4, name: 'Lavender Dream',  colors: ['#7b2d8b','#9b5de5','#c77dff','#e0aaff','#f3d9fa'], likes: 163, tags: ['purple','pastel'] },
  { id: 5, name: 'Midnight City',   colors: ['#0f0c29','#302b63','#24243e','#3a3a6e','#6c63ff'], likes: 151, tags: ['dark','purple'] },
  { id: 6, name: 'Coral Reef',      colors: ['#ff4d6d','#ff758f','#ff8fa3','#ffb3c1','#ffccd5'], likes: 144, tags: ['pink','coral'] },
  { id: 7, name: 'Earth Tones',     colors: ['#7f4f24','#936639','#a68a64','#b6ad90','#c2c5aa'], likes: 138, tags: ['earth','neutral'] },
  { id: 8, name: 'Neon Nights',     colors: ['#080808','#00ff41','#00b4d8','#ff006e','#8338ec'], likes: 132, tags: ['neon','dark'] },
  { id: 9, name: 'Autumn Leaves',   colors: ['#bc6c25','#dda15e','#fefae0','#606c38','#283618'], likes: 127, tags: ['autumn','warm'] },
  { id:10, name: 'Arctic Frost',    colors: ['#caf0f8','#90e0ef','#48cae4','#0096c7','#023e8a'], likes: 121, tags: ['blue','cool'] },
  { id:11, name: 'Rose Garden',     colors: ['#590d22','#800f2f','#a4133c','#c9184a','#ff4d6d'], likes: 119, tags: ['red','rose'] },
  { id:12, name: 'Desert Sand',     colors: ['#f4e285','#f4a259','#8cb369','#5c4033','#bc4b51'], likes: 113, tags: ['desert','warm'] },
];

const ALL_TAGS = [...new Set(COMMUNITY.flatMap(p => p.tags))];

const getContrast = hex => {
  try { return chroma(hex).luminance() > 0.35 ? '#000' : '#fff'; } catch { return '#000'; }
};

// ── Main component ────────────────────────────────────────────────────────────

export default function ExplorePalettes() {
  const [mode, setMode] = useState('Random');
  const [colors, setColors] = useState(() => generatePalette('Random'));
  const [locked, setLocked] = useState([false, false, false, false, false]);
  const [copied, setCopied] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportTab, setExportTab] = useState('css');
  const [history, setHistory] = useState([]);
  const [liked, setLiked] = useState({});
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('all');

  const generate = useCallback((newMode = mode) => {
    const next = generatePalette(newMode, locked, colors);
    setHistory(h => [colors, ...h].slice(0, 10));
    setColors(next);
  }, [mode, locked, colors]);

  // Spacebar to generate
  useEffect(() => {
    const handler = e => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generate]);

  const copyHex = (hex, id) => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopied(id);
    toast.success(`Copied ${hex.toUpperCase()}`);
    setTimeout(() => setCopied(null), 1500);
  };

  const toggleLock = i => setLocked(prev => prev.map((v, idx) => idx === i ? !v : v));

  const downloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000; canvas.height = 200;
    const ctx = canvas.getContext('2d');
    colors.forEach((hex, i) => {
      ctx.fillStyle = hex;
      ctx.fillRect(i * 200, 0, 200, 200);
    });
    const a = document.createElement('a'); a.download = 'palette.png';
    a.href = canvas.toDataURL(); a.click();
  };

  const exportCSS = () => colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n');
  const exportTailwind = () => `colors: {\n${colors.map((c, i) => `  'palette-${i + 1}': '${c}',`).join('\n')}\n}`;
  const exportSCSS = () => colors.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');

  const communityFiltered = COMMUNITY.filter(p => {
    const matchTag = activeTag === 'all' || p.tags.includes(activeTag);
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.includes(search.toLowerCase()));
    return matchTag && matchSearch;
  });

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>
      {/* ── Full-screen Generator ─────────────────────────────────────────── */}
      <div className="w-full" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white" style={{ borderBottom: `1px solid ${LI_BORDER}` }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold" style={{ color: LI_TEXT }}>Explore Palettes</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e8f0fe', color: LI_BLUE }}>
              Press Space to generate
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode picker */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
              {HARMONY_MODES.map(m => (
                <button key={m}
                  onClick={() => { setMode(m); generate(m); }}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{ backgroundColor: mode === m ? LI_BLUE : '#fff', color: mode === m ? '#fff' : LI_MUTED }}>
                  {m}
                </button>
              ))}
            </div>

            <button onClick={() => generate()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: LI_BLUE, color: '#fff' }}>
              <FaArrowsRotate size={11} /> Generate
            </button>

            <button onClick={() => setShowExport(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg"
              style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT, backgroundColor: '#fff' }}>
              <FaCode size={11} /> Export
            </button>

            <button onClick={downloadPNG}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg"
              style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT, backgroundColor: '#fff' }}>
              <FaDownload size={11} />
            </button>
          </div>
        </div>

        {/* Swatches */}
        <div className="flex flex-1 overflow-hidden">
          {colors.map((hex, i) => {
            const fg = getContrast(hex);
            const isExpanded = expanded === i;
            return (
              <div key={i}
                className="relative group transition-all duration-300 ease-out"
                style={{ flex: isExpanded ? 2.5 : 1, backgroundColor: hex, cursor: 'pointer', minWidth: 0 }}
                onClick={() => setExpanded(expanded === i ? null : i)}>

                {/* Color value on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <span className="text-sm font-bold font-mono tracking-wider mb-1" style={{ color: fg }}>
                    {hex.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: fg, opacity: 0.7 }}>
                    {chroma(hex).css('hsl').replace(/hsl\(/, '').replace(/\)/, '').split(',').map(v => v.trim()).join(' ')}
                  </span>
                </div>

                {/* Controls */}
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={e => { e.stopPropagation(); copyHex(hex, `swatch-${i}`); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    {copied === `swatch-${i}` ? <FaCheck size={10} style={{ color: fg }} /> : <FaCopy size={10} style={{ color: fg }} />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); toggleLock(i); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: locked[i] ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)' }}>
                    {locked[i] ? <FaLock size={10} style={{ color: fg }} /> : <FaLockOpen size={10} style={{ color: fg }} />}
                  </button>
                </div>

                {/* Lock indicator */}
                {locked[i] && (
                  <div className="absolute top-4 left-0 right-0 flex justify-center">
                    <FaLock size={12} style={{ color: fg, opacity: 0.6 }} />
                  </div>
                )}

                {/* Index badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-mono rounded px-1 py-0.5"
                    style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: fg }}>
                    {i + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Export Modal ──────────────────────────────────────────────────────── */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" style={{ border: `1px solid ${LI_BORDER}` }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: LI_BORDER }}>
              <h3 className="font-bold text-base" style={{ color: LI_TEXT }}>Export Palette</h3>
              <button onClick={() => setShowExport(false)} style={{ color: LI_MUTED }} className="hover:text-black">✕</button>
            </div>
            <div className="p-5">
              {/* Preview strip */}
              <div className="flex rounded-lg overflow-hidden mb-4" style={{ height: 48 }}>
                {colors.map((hex, i) => <div key={i} style={{ flex: 1, backgroundColor: hex }} />)}
              </div>
              {/* Tab switcher */}
              <div className="flex gap-1 mb-3" style={{ borderBottom: `1px solid ${LI_BORDER}` }}>
                {['css', 'tailwind', 'scss'].map(t => (
                  <button key={t} onClick={() => setExportTab(t)}
                    className="px-4 py-2 text-xs font-semibold uppercase"
                    style={{ color: exportTab === t ? LI_BLUE : LI_MUTED, borderBottom: exportTab === t ? `2px solid ${LI_BLUE}` : '2px solid transparent' }}>
                    {t === 'css' ? 'CSS Variables' : t === 'tailwind' ? 'Tailwind' : 'SCSS'}
                  </button>
                ))}
              </div>
              <pre className="text-xs rounded-lg p-4 overflow-auto font-mono" style={{ backgroundColor: '#F9F9F9', color: LI_TEXT, border: `1px solid ${LI_BORDER}` }}>
                {exportTab === 'css' && `:root {\n${exportCSS()}\n}`}
                {exportTab === 'tailwind' && exportTailwind()}
                {exportTab === 'scss' && exportSCSS()}
              </pre>
              <button
                onClick={() => {
                  const code = exportTab === 'css' ? `:root {\n${exportCSS()}\n}` : exportTab === 'tailwind' ? exportTailwind() : exportSCSS();
                  navigator.clipboard.writeText(code);
                  toast.success('Copied to clipboard');
                }}
                className="mt-3 w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: LI_BLUE, color: '#fff' }}>
                <FaCopy size={13} /> Copy Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Community Section ────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: LI_TEXT }}>Community Palettes</h2>
            <p className="text-sm" style={{ color: LI_MUTED }}>Explore palettes created by our community</p>
          </div>
          {/* Search */}
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: LI_MUTED }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search palettes…"
              className="pl-8 pr-3 py-2 text-sm rounded-lg outline-none w-48"
              style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT, backgroundColor: '#fff' }}
              onFocus={e => e.target.style.borderColor = LI_BLUE}
              onBlur={e => e.target.style.borderColor = LI_BORDER} />
          </div>
        </div>

        {/* Tag filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {['all', ...ALL_TAGS].map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)}
              className="px-3 py-1 text-xs rounded-full whitespace-nowrap font-medium"
              style={{
                backgroundColor: activeTag === tag ? LI_BLUE : '#fff',
                color: activeTag === tag ? '#fff' : LI_MUTED,
                border: `1px solid ${activeTag === tag ? LI_BLUE : LI_BORDER}`,
              }}>
              {tag === 'all' ? 'All' : tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {communityFiltered.map(palette => (
            <PaletteCard key={palette.id} palette={palette}
              liked={!!liked[palette.id]}
              onLike={() => setLiked(l => ({ ...l, [palette.id]: !l[palette.id] }))}
              onUse={() => { setColors(palette.colors); window.scrollTo({ top: 0, behavior: 'smooth' }); toast.success(`Loaded "${palette.name}"`); }}
            />
          ))}
        </div>

        {communityFiltered.length === 0 && (
          <div className="text-center py-16" style={{ color: LI_MUTED }}>
            <FaMagnifyingGlass size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No palettes found</p>
          </div>
        )}
      </div>

      {/* ── History ──────────────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-6 pb-12">
          <h3 className="text-base font-semibold mb-3" style={{ color: LI_TEXT }}>Recent Palettes</h3>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {history.map((pal, idx) => (
              <button key={idx}
                onClick={() => setColors(pal)}
                className="flex-shrink-0 rounded-xl overflow-hidden transition-transform hover:scale-105"
                style={{ border: `1px solid ${LI_BORDER}`, width: 120, height: 36 }}>
                <div className="flex h-full">
                  {pal.map((hex, i) => <div key={i} style={{ flex: 1, backgroundColor: hex }} />)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PaletteCard({ palette, liked, onLike, onUse }) {
  const [copied, setCopied] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const copyHex = (hex, id) => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopied(id);
    toast.success(`Copied ${hex.toUpperCase()}`);
    setTimeout(() => setCopied(null), 1200);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(palette.colors.join(', '));
    toast.success('All colors copied');
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden group transition-shadow hover:shadow-md"
      style={{ border: `1px solid ${LI_BORDER}` }}>
      {/* Color strip */}
      <div className="relative" style={{ height: 80 }}>
        <div className="flex h-full">
          {palette.colors.map((hex, i) => (
            <div key={i} className="flex-1 relative cursor-pointer"
              style={{ backgroundColor: hex }}
              onClick={() => copyHex(hex, `${palette.id}-${i}`)}>
              {copied === `${palette.id}-${i}` && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <FaCheck size={10} style={{ color: getContrast(hex) }} />
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.15))' }}>
          <button onClick={onUse}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: LI_TEXT }}>
            Use Palette
          </button>
          <button onClick={copyAll}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
            <FaCopy size={10} style={{ color: LI_TEXT }} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold leading-tight" style={{ color: LI_TEXT }}>{palette.name}</p>
          <div className="flex gap-1 mt-1">
            {palette.tags.map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: LI_BG, color: LI_MUTED }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <button onClick={onLike} className="flex items-center gap-1 text-xs" style={{ color: liked ? '#CC1016' : LI_MUTED }}>
          {liked ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
          <span>{palette.likes + (liked ? 1 : 0)}</span>
        </button>
      </div>

      {/* Hex chips */}
      <div className="flex gap-1 px-3 pb-3">
        {palette.colors.map((hex, i) => (
          <span key={i} className="text-[9px] font-mono px-1 py-0.5 rounded"
            style={{ backgroundColor: LI_BG, color: LI_MUTED, cursor: 'default' }}>
            {hex.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
