import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import chroma from 'chroma-js';
import toast from 'react-hot-toast';
import {
  FaLock, FaLockOpen, FaCopy, FaCheck, FaDownload,
  FaCode, FaHeart, FaRegHeart, FaMagnifyingGlass,
  FaArrowsRotate, FaXmark, FaWandMagicSparkles, FaArrowRight,
  FaSliders, FaPalette,
} from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

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
        chroma.hsl(h, s, 0.75), chroma.hsl(h, s, 0.55), chroma.hsl(h, s, l),
        chroma.hsl((h + 180) % 360, s, 0.55), chroma.hsl((h + 180) % 360, s, 0.75),
      ];
      break;
    }
    case 'Triadic': {
      const h = base.hsl()[0];
      colors = [
        chroma.hsl(h, 0.6, 0.7), chroma.hsl(h, 0.7, 0.5),
        chroma.hsl((h + 120) % 360, 0.7, 0.55),
        chroma.hsl((h + 240) % 360, 0.6, 0.55), chroma.hsl((h + 240) % 360, 0.5, 0.72),
      ];
      break;
    }
    case 'Monochromatic': {
      const [h, s] = base.hsl();
      colors = [0.85, 0.7, 0.55, 0.4, 0.25].map(l => chroma.hsl(h, s * 0.9, l));
      break;
    }
    case 'Pastel':
      colors = Array.from({ length: 5 }, () => chroma.hsl(randomHue(), 0.4 + Math.random() * 0.2, 0.78 + Math.random() * 0.1));
      break;
    case 'Dark':
      colors = Array.from({ length: 5 }, () => chroma.hsl(randomHue(), 0.5 + Math.random() * 0.3, 0.15 + Math.random() * 0.2));
      break;
    default:
      colors = Array.from({ length: 5 }, () => chroma.hsl(randomHue(), 0.45 + Math.random() * 0.4, 0.35 + Math.random() * 0.4));
  }
  return colors.map((c, i) => locked[i] && prev[i] ? prev[i] : c.hex());
}

const COMMUNITY = [
  { id: 1,  name: 'Ocean Breeze',   colors: ['#03045e','#023e8a','#0077b6','#0096c7','#00b4d8'], likes: 214, tags: ['blue','ocean'] },
  { id: 2,  name: 'Warm Sunset',    colors: ['#ff6b6b','#feca57','#ff9f43','#ee5a24','#c0392b'], likes: 189, tags: ['warm','sunset'] },
  { id: 3,  name: 'Forest Walk',    colors: ['#2d6a4f','#40916c','#52b788','#74c69d','#b7e4c7'], likes: 176, tags: ['green','nature'] },
  { id: 4,  name: 'Lavender Dream', colors: ['#7b2d8b','#9b5de5','#c77dff','#e0aaff','#f3d9fa'], likes: 163, tags: ['purple','pastel'] },
  { id: 5,  name: 'Midnight City',  colors: ['#0f0c29','#302b63','#24243e','#3a3a6e','#6c63ff'], likes: 151, tags: ['dark','purple'] },
  { id: 6,  name: 'Coral Reef',     colors: ['#ff4d6d','#ff758f','#ff8fa3','#ffb3c1','#ffccd5'], likes: 144, tags: ['pink','coral'] },
  { id: 7,  name: 'Earth Tones',    colors: ['#7f4f24','#936639','#a68a64','#b6ad90','#c2c5aa'], likes: 138, tags: ['earth','neutral'] },
  { id: 8,  name: 'Neon Nights',    colors: ['#080808','#00ff41','#00b4d8','#ff006e','#8338ec'], likes: 132, tags: ['neon','dark'] },
  { id: 9,  name: 'Autumn Leaves',  colors: ['#bc6c25','#dda15e','#fefae0','#606c38','#283618'], likes: 127, tags: ['autumn','warm'] },
  { id: 10, name: 'Arctic Frost',   colors: ['#caf0f8','#90e0ef','#48cae4','#0096c7','#023e8a'], likes: 121, tags: ['blue','cool'] },
  { id: 11, name: 'Rose Garden',    colors: ['#590d22','#800f2f','#a4133c','#c9184a','#ff4d6d'], likes: 119, tags: ['red','rose'] },
  { id: 12, name: 'Desert Sand',    colors: ['#f4e285','#f4a259','#8cb369','#5c4033','#bc4b51'], likes: 113, tags: ['desert','warm'] },
  { id: 13, name: 'Mint Fresh',     colors: ['#80ffdb','#72efdd','#64dfdf','#48cae4','#0096c7'], likes: 108, tags: ['green','cool'] },
  { id: 14, name: 'Golden Hour',    colors: ['#f9c74f','#f8961e','#f3722c','#f94144','#90be6d'], likes: 102, tags: ['warm','sunset'] },
  { id: 15, name: 'Nordic Mist',    colors: ['#e8eaf6','#c5cae9','#9fa8da','#7986cb','#5c6bc0'], likes: 98,  tags: ['blue','pastel'] },
  { id: 16, name: 'Cherry Blossom', colors: ['#ff9a9e','#fad0c4','#ffecd2','#a18cd1','#fbc2eb'], likes: 94,  tags: ['pink','pastel'] },
];

const ALL_TAGS = [...new Set(COMMUNITY.flatMap(p => p.tags))];
const getContrast = hex => { try { return chroma(hex).luminance() > 0.35 ? '#000' : '#fff'; } catch { return '#000'; } };

export default function ExplorePalettes() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [mode, setMode] = useState('Random');
  const [colors, setColors] = useState(() => generatePalette('Random'));
  const [locked, setLocked] = useState([false, false, false, false, false]);
  const [copied, setCopied] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportTab, setExportTab] = useState('css');
  const [history, setHistory] = useState([]);
  const [liked, setLiked] = useState({});
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [showModePanel, setShowModePanel] = useState(false);

  const generate = useCallback((newMode = mode) => {
    const next = generatePalette(newMode, locked, colors);
    setHistory(h => [colors, ...h].slice(0, 10));
    setColors(next);
  }, [mode, locked, colors]);

  useEffect(() => {
    const handler = e => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !showExport) {
        e.preventDefault();
        generate();
      }
      if (e.code === 'Escape') { setShowExport(false); setShowModePanel(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generate, showExport]);

  const copyHex = (hex, id) => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopied(id);
    toast.success(hex.toUpperCase());
    setTimeout(() => setCopied(null), 1500);
  };

  const toggleLock = i => setLocked(prev => prev.map((v, idx) => idx === i ? !v : v));

  const downloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1500; canvas.height = 300;
    const ctx = canvas.getContext('2d');
    colors.forEach((hex, i) => {
      ctx.fillStyle = hex;
      ctx.fillRect(i * 300, 0, 300, 300);
      ctx.fillStyle = getContrast(hex);
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hex.toUpperCase(), i * 300 + 150, 160);
    });
    const a = document.createElement('a'); a.download = 'palette.png';
    a.href = canvas.toDataURL(); a.click();
  };

  const exportCSS      = () => colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n');
  const exportTailwind = () => `colors: {\n${colors.map((c, i) => `  'palette-${i + 1}': '${c}',`).join('\n')}\n}`;
  const exportSCSS     = () => colors.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');

  const communityFiltered = COMMUNITY.filter(p => {
    const matchTag    = activeTag === 'all' || p.tags.includes(activeTag);
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.tags.some(tg => tg.includes(search.toLowerCase()));
    return matchTag && matchSearch;
  });

  const modeLabel = m => t(`explore.harmonies.${m}`, m);

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Full-screen generator ───────────────────────────────────────── */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white z-20"
          style={{ borderBottom: `1px solid ${LI_BORDER}` }}>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FaPalette size={16} style={{ color: LI_BLUE }} />
              <span className="text-sm font-bold hidden sm:block" style={{ color: LI_TEXT }}>
                {t('explore.title')}
              </span>
            </div>
            <span className="hidden md:block text-[11px] px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>
              {t('explore.pressSpace')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode dropdown */}
            <div className="relative z-30">
              <button
                onClick={() => setShowModePanel(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ border: `1px solid ${LI_BORDER}`, backgroundColor: showModePanel ? '#EEF3F8' : '#fff', color: LI_TEXT }}>
                <FaSliders size={11} style={{ color: LI_BLUE }} />
                <span className="hidden sm:block">{modeLabel(mode)}</span>
              </button>

              {showModePanel && (
                <div className="absolute top-full mt-1.5 bg-white rounded-xl shadow-xl py-1.5 min-w-[170px]"
                  style={{ border: `1px solid ${LI_BORDER}`, [isRTL ? 'left' : 'right']: 0 }}>
                  {HARMONY_MODES.map(m => (
                    <button key={m}
                      onClick={() => { setMode(m); generate(m); setShowModePanel(false); }}
                      className="w-full px-4 py-2.5 text-xs font-medium flex items-center justify-between gap-3 transition-colors"
                      style={{
                        textAlign: isRTL ? 'right' : 'left',
                        backgroundColor: mode === m ? '#EEF3F8' : 'transparent',
                        color: mode === m ? LI_BLUE : LI_TEXT,
                      }}>
                      {modeLabel(m)}
                      {mode === m && <FaCheck size={9} style={{ color: LI_BLUE }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => generate()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: LI_BLUE, color: '#fff' }}>
              <FaArrowsRotate size={11} />
              <span className="hidden sm:block">{t('explore.generate')}</span>
            </button>

            <button onClick={() => setShowExport(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT, backgroundColor: '#fff' }}>
              <FaCode size={11} />
              <span className="hidden sm:block">{t('explore.export')}</span>
            </button>

            <button onClick={downloadPNG}
              className="p-2 rounded-lg"
              style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT, backgroundColor: '#fff' }}>
              <FaDownload size={11} />
            </button>
          </div>
        </div>

        {/* Swatches */}
        <div className="flex flex-1 overflow-hidden">
          {colors.map((hex, i) => {
            const fg = getContrast(hex);
            return (
              <div key={i}
                className="relative group flex-1 transition-all duration-300 ease-out cursor-pointer"
                style={{ backgroundColor: hex, minWidth: 0 }}>

                {locked[i] && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>
                      <FaLock size={11} style={{ color: fg }} />
                    </div>
                  </div>
                )}

                {/* Hex info shown on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <span className="text-base md:text-lg font-bold font-mono tracking-widest mb-1" style={{ color: fg }}>
                    {hex.toUpperCase()}
                  </span>
                  <span className="text-[10px] md:text-xs font-mono opacity-70" style={{ color: fg }}>
                    {(() => { try { const [h, s, l] = chroma(hex).hsl(); return `${Math.round(h || 0)}° ${Math.round((s || 0) * 100)}% ${Math.round((l || 0) * 100)}%`; } catch { return ''; } })()}
                  </span>
                </div>

                {/* Controls */}
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => copyHex(hex, `sw-${i}`)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}>
                    {copied === `sw-${i}` ? <FaCheck size={11} style={{ color: fg }} /> : <FaCopy size={11} style={{ color: fg }} />}
                  </button>
                  <button onClick={() => toggleLock(i)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: locked[i] ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.22)' }}>
                    {locked[i] ? <FaLock size={11} style={{ color: fg }} /> : <FaLockOpen size={11} style={{ color: fg }} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info bar */}
        <div className="bg-white flex items-stretch overflow-x-auto flex-shrink-0"
          style={{ borderTop: `1px solid ${LI_BORDER}`, height: 48 }}>
          {colors.map((hex, i) => (
            <button key={i}
              onClick={() => copyHex(hex, `bar-${i}`)}
              className="flex-1 flex items-center justify-center gap-2 px-2 text-xs font-mono font-semibold min-w-[100px] transition-colors"
              style={{ color: LI_TEXT, borderRight: i < 4 ? `1px solid ${LI_BORDER}` : 'none' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9F9F9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <div className="w-5 h-5 rounded-md flex-shrink-0" style={{ backgroundColor: hex }} />
              {hex.toUpperCase()}
              {copied === `bar-${i}` && <FaCheck size={9} style={{ color: '#057642' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* ── History ─────────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="bg-white border-b" style={{ borderColor: LI_BORDER }}>
          <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center gap-3">
            <span className="text-xs font-semibold flex-shrink-0" style={{ color: LI_MUTED }}>
              {t('explore.recentPalettes')}
            </span>
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {history.map((pal, idx) => (
                <button key={idx} onClick={() => setColors(pal)}
                  className="flex-shrink-0 rounded-lg overflow-hidden transition-transform hover:scale-105"
                  style={{ border: `1px solid ${LI_BORDER}`, width: 80, height: 24 }}>
                  <div className="flex h-full">
                    {pal.map((hex, j) => <div key={j} style={{ flex: 1, backgroundColor: hex }} />)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Community ───────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div>
            <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-3"
              style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>
              Community
            </span>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: LI_TEXT }}>
              {t('explore.communityTitle')}
            </h2>
            <p className="text-sm mt-1" style={{ color: LI_MUTED }}>{t('explore.communityDesc')}</p>
          </div>
          <div className="relative flex-shrink-0">
            <FaMagnifyingGlass className="absolute start-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: LI_MUTED }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('explore.searchPlaceholder')}
              className="ps-8 pe-3 py-2 text-sm rounded-xl outline-none w-52"
              style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT, backgroundColor: '#fff' }}
              onFocus={e => e.target.style.borderColor = LI_BLUE}
              onBlur={e => e.target.style.borderColor = LI_BORDER} />
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-7 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {['all', ...ALL_TAGS].map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)}
              className="px-3.5 py-1.5 text-xs rounded-full whitespace-nowrap font-semibold transition-all"
              style={{
                backgroundColor: activeTag === tag ? LI_BLUE : '#fff',
                color: activeTag === tag ? '#fff' : LI_MUTED,
                border: `1px solid ${activeTag === tag ? LI_BLUE : LI_BORDER}`,
              }}>
              {tag === 'all' ? t('explore.all') : `#${tag}`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {communityFiltered.length === 0 ? (
          <div className="text-center py-20" style={{ color: LI_MUTED }}>
            <FaMagnifyingGlass size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('explore.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {communityFiltered.map(palette => (
              <PaletteCard key={palette.id} palette={palette}
                liked={!!liked[palette.id]}
                onLike={() => setLiked(l => ({ ...l, [palette.id]: !l[palette.id] }))}
                onUse={() => { setColors(palette.colors); window.scrollTo({ top: 0, behavior: 'smooth' }); toast.success(`"${palette.name}"`); }}
                tUse={t('explore.usePalette')} />
            ))}
          </div>
        )}

        {/* AI upsell */}
        <div className="mt-12 rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0A66C2 0%, #7C3AED 100%)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-7">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <FaWandMagicSparkles size={22} style={{ color: '#fff' }} />
              </div>
              <div>
                <p className="font-bold text-white text-base">Generate AI Palettes</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Describe your vision — LLaMA 3.3 creates a tailored palette in seconds
                </p>
              </div>
            </div>
            <Link to="/ai-colors"
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-sm font-bold"
              style={{ color: LI_BLUE }}>
              Try AI Colors <FaArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Export Modal ─────────────────────────────────────────────────── */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={e => e.target === e.currentTarget && setShowExport(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            style={{ border: `1px solid ${LI_BORDER}` }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: LI_BORDER }}>
              <h3 className="font-bold" style={{ color: LI_TEXT }}>{t('explore.exportTitle')}</h3>
              <button onClick={() => setShowExport(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: LI_BG, color: LI_MUTED }}>
                <FaXmark size={12} />
              </button>
            </div>
            <div className="p-6">
              {/* Preview */}
              <div className="flex rounded-xl overflow-hidden mb-5" style={{ height: 56, border: `1px solid ${LI_BORDER}` }}>
                {colors.map((hex, i) => (
                  <div key={i} className="flex-1 flex items-end justify-center pb-1.5" style={{ backgroundColor: hex }}>
                    <span className="text-[8px] font-mono" style={{ color: getContrast(hex), opacity: 0.8 }}>
                      {hex.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex gap-0 mb-4 rounded-xl overflow-hidden p-1"
                style={{ border: `1px solid ${LI_BORDER}`, backgroundColor: LI_BG }}>
                {[['css', 'CSS Vars'], ['tailwind', 'Tailwind'], ['scss', 'SCSS']].map(([tab, label]) => (
                  <button key={tab} onClick={() => setExportTab(tab)}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
                    style={{
                      backgroundColor: exportTab === tab ? '#fff' : 'transparent',
                      color: exportTab === tab ? LI_BLUE : LI_MUTED,
                      boxShadow: exportTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              <pre className="text-xs rounded-xl p-4 overflow-auto font-mono leading-relaxed"
                style={{ backgroundColor: '#1E1E2E', color: '#A6E3A1', minHeight: 100 }}>
                {exportTab === 'css'      && `:root {\n${exportCSS()}\n}`}
                {exportTab === 'tailwind' && exportTailwind()}
                {exportTab === 'scss'     && exportSCSS()}
              </pre>

              <button
                onClick={() => {
                  const code = exportTab === 'css' ? `:root {\n${exportCSS()}\n}` : exportTab === 'tailwind' ? exportTailwind() : exportSCSS();
                  navigator.clipboard.writeText(code);
                  toast.success(t('explore.copied'));
                }}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: LI_BLUE, color: '#fff' }}>
                <FaCopy size={12} /> {t('explore.copyCode')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModePanel && <div className="fixed inset-0 z-20" onClick={() => setShowModePanel(false)} />}
    </div>
  );
}

function PaletteCard({ palette, liked, onLike, onUse, tUse }) {
  const [copied, setCopied] = useState(null);

  const copyHex = (hex, id) => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopied(id);
    toast.success(hex.toUpperCase());
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ border: `1px solid ${LI_BORDER}` }}>

      <div className="relative" style={{ height: 90 }}>
        <div className="flex h-full">
          {palette.colors.map((hex, i) => (
            <div key={i} className="flex-1 cursor-pointer relative" style={{ backgroundColor: hex }}
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
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.2))' }}>
          <button onClick={onUse}
            className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: LI_TEXT }}>
            {tUse}
          </button>
          <button onClick={() => { navigator.clipboard.writeText(palette.colors.join(', ')); toast.success('All copied'); }}
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <FaCopy size={11} style={{ color: LI_TEXT }} />
          </button>
        </div>
      </div>

      <div className="px-3.5 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: LI_TEXT }}>{palette.name}</p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {palette.tags.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: LI_BG, color: LI_MUTED }}>#{tag}</span>
            ))}
          </div>
        </div>
        <button onClick={onLike}
          className="flex items-center gap-1 text-xs flex-shrink-0 ms-2 transition-transform active:scale-125"
          style={{ color: liked ? '#CC1016' : LI_MUTED }}>
          {liked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
          <span className="text-[11px] font-semibold">{palette.likes + (liked ? 1 : 0)}</span>
        </button>
      </div>

      <div className="flex gap-1 px-3.5 pb-3">
        {palette.colors.map((hex, i) => (
          <span key={i}
            className="text-[9px] font-mono px-1 py-0.5 rounded cursor-pointer hover:opacity-70 transition-opacity"
            style={{ backgroundColor: LI_BG, color: LI_MUTED }}
            onClick={() => copyHex(hex, `chip-${palette.id}-${i}`)}>
            {hex.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
