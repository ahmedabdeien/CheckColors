import { useState, useMemo } from 'react';
import { FaCopy, FaCheck, FaMagnifyingGlass, FaTableCells, FaList } from 'react-icons/fa6';
import chroma from 'chroma-js';
import toast from 'react-hot-toast';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

// Tailwind-like named color scales using chroma.js
const COLOR_DEFS = [
  { name: 'Slate',   base: '#64748b' },
  { name: 'Gray',    base: '#6b7280' },
  { name: 'Zinc',    base: '#71717a' },
  { name: 'Stone',   base: '#78716c' },
  { name: 'Red',     base: '#ef4444' },
  { name: 'Orange',  base: '#f97316' },
  { name: 'Amber',   base: '#f59e0b' },
  { name: 'Yellow',  base: '#eab308' },
  { name: 'Lime',    base: '#84cc16' },
  { name: 'Green',   base: '#22c55e' },
  { name: 'Emerald', base: '#10b981' },
  { name: 'Teal',    base: '#14b8a6' },
  { name: 'Cyan',    base: '#06b6d4' },
  { name: 'Sky',     base: '#0ea5e9' },
  { name: 'Blue',    base: '#3b82f6' },
  { name: 'Indigo',  base: '#6366f1' },
  { name: 'Violet',  base: '#8b5cf6' },
  { name: 'Purple',  base: '#a855f7' },
  { name: 'Fuchsia', base: '#d946ef' },
  { name: 'Pink',    base: '#ec4899' },
  { name: 'Rose',    base: '#f43f5e' },
];

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function buildScale(base) {
  const light = chroma(base).brighten(3.5).hex();
  const dark  = chroma(base).darken(3.5).hex();
  const scale = chroma.scale([light, base, dark]).mode('lch').colors(STEPS.length);
  return STEPS.map((step, i) => ({ step, hex: scale[i] }));
}

// Build once
const PALETTE = COLOR_DEFS.map(({ name, base }) => ({
  name,
  base,
  scale: buildScale(base),
}));

const getContrast = (hex) => {
  try { return chroma(hex).luminance() > 0.35 ? '#000' : '#fff'; } catch { return '#000'; }
};

const toRgb = (hex) => {
  try { const [r, g, b] = chroma(hex).rgb(); return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`; } catch { return ''; }
};

const toHsl = (hex) => {
  try {
    const [h, s, l] = chroma(hex).hsl();
    return `hsl(${Math.round(h || 0)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  } catch { return ''; }
};

export default function Colors() {
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid | list | swatches
  const [colorFormat, setColorFormat] = useState('hex'); // hex | rgb | hsl
  const [activeCategory, setActiveCategory] = useState('all');
  const [copied, setCopied] = useState(null);

  const copyColor = (hex, id) => {
    const value = colorFormat === 'rgb' ? toRgb(hex) : colorFormat === 'hsl' ? toHsl(hex) : hex.toUpperCase();
    navigator.clipboard.writeText(value);
    setCopied(id);
    toast.success(`Copied ${value}`);
    setTimeout(() => setCopied(null), 1500);
  };

  const displayValue = (hex) => {
    if (colorFormat === 'rgb') return toRgb(hex);
    if (colorFormat === 'hsl') return toHsl(hex);
    return hex.toUpperCase();
  };

  const filteredPalette = useMemo(() => {
    const q = filter.toLowerCase();
    return PALETTE.filter(({ name, base, scale }) => {
      if (activeCategory !== 'all' && name.toLowerCase() !== activeCategory) return false;
      if (!q) return true;
      return name.toLowerCase().includes(q) ||
        scale.some(s => s.hex.toLowerCase().includes(q));
    });
  }, [filter, activeCategory]);

  // Flat list for list view
  const flatColors = useMemo(() =>
    filteredPalette.flatMap(({ name, scale }) =>
      scale.map(({ step, hex }) => ({ name: `${name}-${step}`, hex, category: name }))
    ), [filteredPalette]);

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} className="p-4 md:p-8">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ color: LI_TEXT }}>Color Library</h1>
            <p className="text-sm" style={{ color: LI_MUTED }}>{STEPS.length * PALETTE.length}+ colors · Click to copy</p>
          </div>

          {/* Search */}
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: LI_MUTED }} />
            <input value={filter} onChange={e => setFilter(e.target.value)}
              placeholder="Search colors…"
              className="pl-8 pr-3 py-2 text-sm rounded-lg outline-none w-44"
              style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT, backgroundColor: '#fff' }}
              onFocus={e => e.target.style.borderColor = LI_BLUE}
              onBlur={e => e.target.style.borderColor = LI_BORDER} />
          </div>

          {/* Format toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
            {['hex', 'rgb', 'hsl'].map(f => (
              <button key={f} onClick={() => setColorFormat(f)}
                className="px-3 py-1.5 text-xs font-semibold uppercase transition-colors"
                style={{
                  backgroundColor: colorFormat === f ? LI_BLUE : '#fff',
                  color: colorFormat === f ? '#fff' : LI_MUTED,
                }}>
                {f}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
            {[['grid', <FaTableCells key="g" />], ['list', <FaList key="l" />]].map(([mode, icon]) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className="px-3 py-1.5 text-sm transition-colors"
                style={{ backgroundColor: viewMode === mode ? LI_BLUE : '#fff', color: viewMode === mode ? '#fff' : LI_MUTED }}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {['all', ...COLOR_DEFS.map(c => c.name.toLowerCase())].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 text-xs rounded-full whitespace-nowrap font-medium"
              style={{
                backgroundColor: activeCategory === cat ? LI_BLUE : '#fff',
                color: activeCategory === cat ? '#fff' : LI_MUTED,
                border: `1px solid ${activeCategory === cat ? LI_BLUE : LI_BORDER}`,
              }}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid view — one row per color family */}
        {viewMode === 'grid' && (
          <div className="space-y-3">
            {filteredPalette.map(({ name, scale }) => (
              <div key={name} className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="flex">
                  {scale.map(({ step, hex }) => {
                    const id = `${name}-${step}`;
                    return (
                      <div key={step}
                        className="flex-1 relative group cursor-pointer"
                        style={{ backgroundColor: hex, minHeight: 52 }}
                        onClick={() => copyColor(hex, id)}
                        title={`${name}-${step} · ${hex}`}>
                        {copied === id && (
                          <div className="absolute inset-0 flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                            <FaCheck className="text-white text-xs" />
                          </div>
                        )}
                        <div className="absolute bottom-1 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity px-0.5">
                          <span className="text-[8px] font-mono" style={{ color: getContrast(hex) }}>{step}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 border-t" style={{ borderColor: LI_BORDER }}>
                  <span className="text-xs font-semibold" style={{ color: LI_TEXT }}>{name}</span>
                  <span className="text-[10px] font-mono" style={{ color: LI_MUTED }}>{displayValue(scale[5].hex)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#F3F2EF', borderBottom: `1px solid ${LI_BORDER}` }}>
                <tr>
                  {['Color', 'Name', 'Category', 'Value'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: LI_MUTED }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flatColors.map(({ name, hex, category }) => {
                  const id = `list-${name}`;
                  return (
                    <tr key={name}
                      className="border-b cursor-pointer transition-colors"
                      style={{ borderColor: '#F3F2EF' }}
                      onClick={() => copyColor(hex, id)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9F9F9'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}>
                      <td className="px-4 py-2.5">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: hex, border: `1px solid ${LI_BORDER}` }}>
                          {copied === id && <FaCheck className="text-xs" style={{ color: getContrast(hex) }} />}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-mono font-medium" style={{ color: LI_TEXT }}>{name}</td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: LI_MUTED }}>{category}</td>
                      <td className="px-4 py-2.5 text-xs font-mono" style={{ color: LI_MUTED }}>{displayValue(hex)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <p className="text-xs" style={{ color: LI_MUTED }}>Click any color to copy · Format: {colorFormat.toUpperCase()}</p>
          <p className="text-xs" style={{ color: LI_MUTED }}>
            {viewMode === 'list' ? flatColors.length : filteredPalette.length} {viewMode === 'list' ? 'colors' : 'families'}
          </p>
        </div>
      </div>
    </div>
  );
}
