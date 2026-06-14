import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FaMagnifyingGlass, FaXmark, FaHouse, FaCircleInfo, FaEnvelope,
  FaTag, FaPalette, FaCircleHalfStroke, FaWandMagicSparkles,
  FaImage, FaShuffle, FaFill, FaDroplet, FaArrowRight, FaClockRotateLeft
} from 'react-icons/fa6';

const LI_BLUE  = '#0A66C2';
const LI_BG    = '#F3F2EF';
const LI_BORDER= '#E0DFDC';
const LI_TEXT  = '#000000E6';
const LI_MUTED = '#00000099';

const ALL_ITEMS = [
  { label: 'Home',               path: '/',                   icon: FaHouse,              group: 'Pages',   keywords: ['home','main','index'] },
  { label: 'About',              path: '/About',              icon: FaCircleInfo,         group: 'Pages',   keywords: ['about','us','team'] },
  { label: 'Contact',            path: '/Contact',            icon: FaEnvelope,           group: 'Pages',   keywords: ['contact','email','support'] },
  { label: 'Pricing',            path: '/pricing',            icon: FaTag,                group: 'Pages',   keywords: ['pricing','plans','subscription','pro'] },
  { label: 'Explore Palettes',   path: '/explore',            icon: FaPalette,            group: 'Tools',   keywords: ['palettes','browse','discover','colors','explore'] },
  { label: 'Contrast Checker',   path: '/Contrast-Checker',   icon: FaCircleHalfStroke,   group: 'Tools',   keywords: ['contrast','wcag','accessibility','ratio'] },
  { label: 'AI Colors',          path: '/Ai-Colors',          icon: FaWandMagicSparkles,  group: 'Tools',   keywords: ['ai','artificial','intelligence','generate','chat'] },
  { label: 'Image to Palette',   path: '/image-to-palette',   icon: FaImage,              group: 'Tools',   keywords: ['image','photo','extract','palette','upload'] },
  { label: 'Generate Palette',   path: '/Generate-Palette',   icon: FaShuffle,            group: 'Tools',   keywords: ['generate','random','create','palette'] },
  { label: 'Gradient Generator', path: '/gradient-generator', icon: FaFill,               group: 'Tools',   keywords: ['gradient','css','linear','radial'] },
  { label: 'Tints & Shades',     path: '/tints-shades',       icon: FaDroplet,            group: 'Tools',   keywords: ['tints','shades','lighter','darker','scale'] },
  { label: 'Color Library',      path: '/colors',             icon: FaPalette,            group: 'Tools',   keywords: ['colors','library','200','hex','rgb'] },
];

const RECENT_KEY = 'cc_search_recent';

export default function GlobalSearch() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
  });
  const inputRef = useRef(null);
  const isRTL = i18n.language === 'ar';

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const openHandler = () => setOpen(true);
    window.addEventListener('keydown', handler);
    window.addEventListener('cc:open-search', openHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('cc:open-search', openHandler);
    };
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); setActive(0); }
  }, [open]);

  const results = query.trim()
    ? ALL_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : [];

  const grouped = results.reduce((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  const flatResults = results;

  const go = useCallback((item) => {
    navigate(item.path);
    setOpen(false);
    const newRecent = [item, ...recent.filter(r => r.path !== item.path)].slice(0, 5);
    setRecent(newRecent);
    localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
  }, [navigate, recent]);

  // Arrow key navigation
  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, flatResults.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
      if (e.key === 'Enter' && flatResults[active]) go(flatResults[active]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, flatResults, active, go]);

  const displayItems = query.trim() ? grouped : null;
  const showRecent = !query.trim() && recent.length > 0;

  return (
    <>
      {/* Expose open function globally for Navbar */}
      <script dangerouslySetInnerHTML={{ __html: '' }} />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-2xl"
              style={{ border: `1px solid ${LI_BORDER}` }}
              onClick={e => e.stopPropagation()}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: LI_BORDER }}>
                <FaMagnifyingGlass style={{ color: LI_MUTED, flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActive(0); }}
                  placeholder={t('search.placeholder')}
                  className="flex-1 text-sm outline-none bg-transparent"
                  style={{ color: LI_TEXT }}
                />
                {query && (
                  <button onClick={() => setQuery('')} style={{ color: LI_MUTED }}>
                    <FaXmark className="text-sm" />
                  </button>
                )}
                <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: LI_BG, color: LI_MUTED, border: `1px solid ${LI_BORDER}` }}>
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {/* Recent */}
                {showRecent && (
                  <div className="p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide px-2 mb-2" style={{ color: LI_MUTED }}>
                      <FaClockRotateLeft className="inline mr-1" />{t('search.recent')}
                    </p>
                    {recent.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <button key={i} onClick={() => go(item)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors hover:bg-gray-50"
                          style={{ color: LI_TEXT }}>
                          <Icon className="text-sm flex-shrink-0" style={{ color: LI_MUTED }} />
                          <span className="flex-1">{item.label}</span>
                          <FaArrowRight className="text-xs" style={{ color: LI_BORDER }} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Search results */}
                {displayItems && Object.keys(displayItems).length > 0 && (
                  <div className="p-3 space-y-3">
                    {Object.entries(displayItems).map(([group, items]) => (
                      <div key={group}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide px-2 mb-1" style={{ color: LI_MUTED }}>{group}</p>
                        {items.map((item) => {
                          const Icon = item.icon;
                          const idx = flatResults.indexOf(item);
                          const isActive = idx === active;
                          return (
                            <button key={item.path} onClick={() => go(item)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors"
                              style={{
                                backgroundColor: isActive ? '#EEF3F8' : 'transparent',
                                color: isActive ? LI_BLUE : LI_TEXT,
                              }}
                              onMouseEnter={() => setActive(idx)}>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: isActive ? '#DBEAFE' : LI_BG }}>
                                <Icon className="text-sm" style={{ color: isActive ? LI_BLUE : LI_MUTED }} />
                              </div>
                              <span className="flex-1 font-medium">{item.label}</span>
                              <FaArrowRight className="text-xs" style={{ color: isActive ? LI_BLUE : LI_BORDER }} />
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* No results */}
                {query.trim() && flatResults.length === 0 && (
                  <div className="p-8 text-center">
                    <FaMagnifyingGlass className="text-3xl mx-auto mb-3" style={{ color: LI_BORDER }} />
                    <p className="text-sm" style={{ color: LI_MUTED }}>{t('search.noResults')} "<strong>{query}</strong>"</p>
                  </div>
                )}

                {/* Empty state */}
                {!query.trim() && !showRecent && (
                  <div className="p-8 text-center">
                    <p className="text-sm" style={{ color: LI_MUTED }}>{t('search.tip')}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t px-4 py-2 flex items-center gap-4" style={{ borderColor: LI_BORDER }}>
                <span className="text-[10px]" style={{ color: LI_MUTED }}>
                  <kbd className="font-mono">↑↓</kbd> navigate
                </span>
                <span className="text-[10px]" style={{ color: LI_MUTED }}>
                  <kbd className="font-mono">↵</kbd> open
                </span>
                <span className="text-[10px]" style={{ color: LI_MUTED }}>
                  <kbd className="font-mono">ESC</kbd> close
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Export open function for Navbar
export const openSearch = () => window.dispatchEvent(new CustomEvent('cc:open-search'));
