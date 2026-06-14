import { useState, useEffect } from 'react';
import {
  FaUpload, FaCopy, FaCheck, FaPalette, FaImage,
  FaDownload, FaCircleInfo, FaXmark, FaArrowRotateLeft, FaCode
} from 'react-icons/fa6';
import { useDropzone } from 'react-dropzone';
import { Vibrant } from 'node-vibrant/browser';
import { motion, AnimatePresence } from 'framer-motion';
import chroma from 'chroma-js';
import toast from 'react-hot-toast';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const getContrast = (hex) => {
  try { return chroma(hex).luminance() > 0.35 ? '#000' : '#fff'; } catch { return '#fff'; }
};

const toRgb = (hex) => {
  try { const [r, g, b] = chroma(hex).rgb(); return `rgb(${r}, ${g}, ${b})`; } catch { return ''; }
};

export default function ImageToPalette() {
  const [imageUrl, setImageUrl] = useState(null);
  const [colors, setColors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [paletteName, setPaletteName] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [exportTab, setExportTab] = useState('css');

  // Extract colors whenever imageUrl changes
  useEffect(() => {
    if (!imageUrl) return;
    setIsLoading(true);
    setColors([]);
    setError(null);

    Vibrant.from(imageUrl).getPalette()
      .then(palette => {
        const extracted = [
          palette.Vibrant?.hex,
          palette.LightVibrant?.hex,
          palette.DarkVibrant?.hex,
          palette.Muted?.hex,
          palette.LightMuted?.hex,
          palette.DarkMuted?.hex,
        ].filter(Boolean);
        setColors(extracted);
      })
      .catch(() => setError('Could not extract colors. Try a different image.'))
      .finally(() => setIsLoading(false));
  }, [imageUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: ([file]) => {
      if (!file) return;
      const name = file.name.split('.')[0].replace(/[-_]/g, ' ');
      setPaletteName(name.charAt(0).toUpperCase() + name.slice(1) + ' Palette');
      const reader = new FileReader();
      reader.onload = e => setImageUrl(e.target.result);
      reader.readAsDataURL(file);
    },
  });

  const copyColor = (color, idx) => {
    navigator.clipboard.writeText(color);
    setCopiedIdx(idx);
    toast.success(`Copied ${color}`);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const downloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = colors.length * 200; canvas.height = 200;
    const ctx = canvas.getContext('2d');
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * 200, 0, 200, 200);
      ctx.fillStyle = getContrast(color);
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(color.toUpperCase(), i * 200 + 100, 110);
    });
    const a = document.createElement('a');
    a.download = `${paletteName || 'palette'}.png`;
    a.href = canvas.toDataURL();
    a.click();
    toast.success('PNG downloaded');
  };

  const cssVars = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
  const tailwindCode = `colors: {\n${colors.map((c, i) => `  'img-${i + 1}': '${c}',`).join('\n')}\n}`;
  const scssCode = colors.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');

  const EXPORT_TABS = [
    { id: 'css', label: 'CSS Vars', code: cssVars },
    { id: 'tailwind', label: 'Tailwind', code: tailwindCode },
    { id: 'scss', label: 'SCSS', code: scssCode },
  ];

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3" style={{ color: LI_TEXT }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF3F8' }}>
              <FaImage style={{ color: LI_BLUE, fontSize: 16 }} />
            </div>
            Image to Palette
          </h1>
          <p className="text-sm" style={{ color: LI_MUTED }}>Extract the dominant color palette from any image</p>
        </header>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Left: Upload + Tips */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: LI_BORDER }}>
                <FaUpload style={{ color: LI_BLUE, fontSize: 13 }} />
                <span className="font-semibold text-sm" style={{ color: LI_TEXT }}>Upload Image</span>
              </div>
              <div {...getRootProps()}
                className="m-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                style={{ borderColor: isDragActive ? LI_BLUE : LI_BORDER, backgroundColor: isDragActive ? '#EEF3F8' : 'transparent' }}>
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: '#EEF3F8' }}>
                  <FaUpload style={{ color: LI_BLUE, fontSize: 18 }} />
                </div>
                {isDragActive
                  ? <p className="text-sm font-medium" style={{ color: LI_BLUE }}>Drop to extract palette!</p>
                  : <>
                    <p className="text-sm font-medium" style={{ color: LI_TEXT }}>
                      Drag & drop or <span style={{ color: LI_BLUE }}>browse</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: LI_MUTED }}>JPEG, PNG, WEBP · Max 10MB</p>
                  </>}
                {error && <p className="text-xs mt-2 font-medium" style={{ color: '#CC1016' }}>{error}</p>}
              </div>
              {imageUrl && (
                <div className="px-4 pb-4">
                  <button onClick={() => { setImageUrl(null); setColors([]); setPaletteName(''); }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-full text-sm border transition-colors"
                    style={{ borderColor: LI_BORDER, color: LI_MUTED }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#CC1016'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = LI_BORDER}>
                    <FaArrowRotateLeft className="text-xs" /> Try another image
                  </button>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl p-4" style={{ border: `1px solid ${LI_BORDER}` }}>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3" style={{ color: LI_TEXT }}>
                <FaCircleInfo style={{ color: LI_BLUE, fontSize: 13 }} /> Tips
              </h3>
              <ul className="space-y-2">
                {[
                  'High-contrast images give more vibrant palettes',
                  'Landscape & nature photos work great',
                  'Click any swatch to copy the hex code',
                  'Use Export to get CSS variables',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: LI_MUTED }}>
                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: LI_BLUE }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Preview + Palette */}
          <div className="md:col-span-2 space-y-4">
            {isLoading && (
              <div className="bg-white rounded-xl p-12 flex flex-col items-center gap-4"
                style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="w-12 h-12 border-4 rounded-full animate-spin"
                  style={{ borderColor: `${LI_BLUE}30`, borderTopColor: LI_BLUE }} />
                <p className="text-sm font-medium" style={{ color: LI_TEXT }}>Analyzing image colors…</p>
              </div>
            )}

            {imageUrl && !isLoading && (
              <>
                {/* Image preview */}
                <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: LI_BORDER }}>
                    <span className="font-semibold text-sm" style={{ color: LI_TEXT }}>Preview</span>
                  </div>
                  <div className="p-4">
                    <img src={imageUrl} alt="Uploaded" className="w-full max-h-64 object-contain rounded-lg" />
                  </div>
                </div>

                {/* Palette */}
                {colors.length > 0 && (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
                      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: LI_BORDER }}>
                        <div className="flex items-center gap-2">
                          <FaPalette style={{ color: LI_BLUE, fontSize: 13 }} />
                          <input value={paletteName} onChange={e => setPaletteName(e.target.value)}
                            className="text-sm font-semibold bg-transparent outline-none"
                            style={{ color: LI_TEXT }}
                            placeholder="Name your palette" />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setShowExport(true)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold border"
                            style={{ borderColor: LI_BLUE, color: LI_BLUE }}>
                            <FaCode className="text-[10px]" /> Export
                          </button>
                          <button onClick={downloadPNG}
                            className="p-1.5 rounded hover:bg-gray-50" title="Download PNG">
                            <FaDownload style={{ color: LI_MUTED, fontSize: 13 }} />
                          </button>
                        </div>
                      </div>

                      {/* Color swatches strip */}
                      <div className="flex h-24">
                        {colors.map((color, i) => (
                          <motion.div key={i}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                            className="flex-1 relative group cursor-pointer flex items-end justify-center pb-2"
                            style={{ backgroundColor: color }}
                            onClick={() => copyColor(color, i)}>
                            <AnimatePresence>
                              {copiedIdx === i && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                  style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                  <FaCheck className="text-white" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <span className="text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity px-1 rounded"
                              style={{ color: getContrast(color), backgroundColor: 'rgba(0,0,0,0.3)' }}>
                              {color.toUpperCase()}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Color detail rows */}
                      <div className="divide-y" style={{ borderColor: LI_BORDER }}>
                        {colors.map((color, i) => (
                          <div key={i}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => copyColor(color, i)}>
                            <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ backgroundColor: color, border: `1px solid ${LI_BORDER}` }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold font-mono" style={{ color: LI_TEXT }}>{color.toUpperCase()}</p>
                              <p className="text-[10px]" style={{ color: LI_MUTED }}>{toRgb(color)}</p>
                            </div>
                            <button className="p-1.5 opacity-0 group-hover:opacity-100 rounded transition-colors"
                              style={{ color: copiedIdx === i ? '#057642' : LI_MUTED }}>
                              {copiedIdx === i ? <FaCheck className="text-xs" /> : <FaCopy className="text-xs" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </>
            )}

            {/* Empty state */}
            {!imageUrl && !isLoading && (
              <div className="bg-white rounded-xl p-16 text-center" style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#EEF3F8' }}>
                  <FaImage style={{ color: LI_BLUE, fontSize: 28 }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: LI_TEXT }}>Upload an image to extract its palette</p>
                <p className="text-xs" style={{ color: LI_MUTED }}>Supports JPEG, PNG, and WEBP</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowExport(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              style={{ border: `1px solid ${LI_BORDER}` }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: LI_TEXT }}>Export Palette</h3>
                <button onClick={() => setShowExport(false)} className="p-1 rounded hover:bg-gray-100">
                  <FaXmark style={{ color: LI_MUTED }} />
                </button>
              </div>
              <div className="flex rounded-lg overflow-hidden mb-4 h-8">
                {colors.map((c, i) => <div key={i} style={{ flex: 1, backgroundColor: c }} />)}
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-3">
                {EXPORT_TABS.map(({ id, label }) => (
                  <button key={id} onClick={() => setExportTab(id)}
                    className="flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors"
                    style={{ backgroundColor: exportTab === id ? '#fff' : 'transparent', color: exportTab === id ? LI_TEXT : LI_MUTED }}>
                    {label}
                  </button>
                ))}
              </div>
              <pre className="text-xs rounded-lg p-3 overflow-auto mb-4 font-mono"
                style={{ backgroundColor: '#F3F2EF', color: LI_TEXT, maxHeight: 160 }}>
                {EXPORT_TABS.find(t => t.id === exportTab)?.code}
              </pre>
              <button onClick={() => { navigator.clipboard.writeText(EXPORT_TABS.find(t => t.id === exportTab)?.code || ''); toast.success('Copied!'); }}
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
