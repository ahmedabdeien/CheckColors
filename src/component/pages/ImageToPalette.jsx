import { useState, useEffect } from 'react';
import {
  FaUpload, FaCopy, FaCheck, FaPalette, FaImage,
  FaDownload, FaCircleInfo, FaXmark, FaArrowRotateLeft, FaClipboard
} from 'react-icons/fa6';
import { useDropzone } from 'react-dropzone';
import { Vibrant } from 'node-vibrant/browser';
import { motion, AnimatePresence } from 'framer-motion';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const ImageToPalette = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [colors, setColors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedColor, setCopiedColor] = useState(null);
  const [paletteName, setPaletteName] = useState('');
  const [showTips, setShowTips] = useState(true);
  const [notification, setNotification] = useState(null);
  useEffect(() => {
    const extractColors = async () => {
      if (!imageUrl) return;
      try {
        const palette = await Vibrant.from(imageUrl).getPalette();
        // ... existing color extraction
      } catch (err) {
        setError('Error processing image. Please try another one.');
      } finally {
        setIsLoading(false);
      }
    };
    extractColors();
  }, [imageUrl]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: files => {
      handleImageUpload(files[0]);
    }
  });

  const handleImageUpload = file => {
    setIsLoading(true);
    setError(null);
    setColors([]);
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      setIsLoading(false);
      return;
    }

    // Generate a palette name based on the file name
    const fileName = file.name.split('.')[0];
    setPaletteName(fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/[-_]/g, ' ') + ' Palette');

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetAll = () => {
    setImageUrl(null);
    setColors([]);
    setPaletteName('');
    setError(null);
  };

  useEffect(() => {
    const extractColors = async () => {
      if (!imageUrl) return;

      try {
        const palette = await Vibrant.from(imageUrl).getPalette();
        const extractedColors = [
          palette.Vibrant?.hex,
          palette.Muted?.hex,
          palette.DarkVibrant?.hex,
          palette.LightVibrant?.hex,
          palette.DarkMuted?.hex,
          palette.LightMuted?.hex
        ].filter(color => color);
        
        setColors(extractedColors);
      } catch (err) {
        setError('Error processing image. Please try another one.');
      } finally {
        setIsLoading(false);
      }
    };

    extractColors();
  }, [imageUrl]);

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    showNotification(`${color} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const copyPalette = () => {
    navigator.clipboard.writeText(colors.join(', '));
    showNotification('All colors copied to clipboard!', 'success');
  };

  const savePalette = () => {
    // This would typically save to a database or local storage
    showNotification('Palette saved!', 'success');
  };

  const downloadPalette = () => {
    // Create a simple html file with the colors
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${paletteName}</title>
        <style>
          body { font-family: sans-serif; margin: 0; padding: 20px; }
          h1 { margin-bottom: 20px; }
          .palette { display: flex; height: 100px; margin-bottom: 20px; }
          .color { flex: 1; display: flex; align-items: flex-end; justify-content: center; padding: 10px; }
          .hex { background: rgba(0,0,0,0.5); color: white; padding: 5px 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>${paletteName}</h1>
        <div class="palette">
          ${colors.map(color => `
            <div class="color" style="background-color: ${color}">
              <span class="hex">${color}</span>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paletteName.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Palette downloaded!', 'success');
  };

  // Calculate whether to use black or white text on a color
  const getContrastColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} className="p-4 md:p-8">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3"
            style={{ border: `1px solid ${LI_BORDER}` }}
            initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
          >
            <div className="p-1.5 rounded-full"
              style={{ backgroundColor: notification.type === 'success' ? '#F0FFF6' : '#FFF0F0' }}>
              {notification.type === 'success' && <FaCheck style={{ color: '#057642', fontSize: 12 }} />}
              {notification.type === 'error' && <FaXmark style={{ color: '#CC1016', fontSize: 12 }} />}
              {notification.type === 'info' && <FaCircleInfo style={{ color: LI_BLUE, fontSize: 12 }} />}
            </div>
            <span className="text-sm font-medium" style={{ color: LI_TEXT }}>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3" style={{ color: LI_TEXT }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF3F8' }}>
              <FaPalette style={{ color: LI_BLUE, fontSize: 16 }} />
            </div>
            Image to Palette Generator
          </h1>
          <p className="text-sm" style={{ color: LI_MUTED }}>Extract beautiful color palettes from your favorite images</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1">
            {/* Upload */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: LI_BORDER }}>
                <FaUpload style={{ color: LI_BLUE, fontSize: 14 }} />
                <h2 className="font-semibold text-sm" style={{ color: LI_TEXT }}>Upload Image</h2>
              </div>
              <div
                {...getRootProps()}
                className="border-2 border-dashed m-4 rounded-xl p-8 text-center cursor-pointer transition-all"
                style={{ borderColor: isDragActive ? LI_BLUE : LI_BORDER, backgroundColor: isDragActive ? '#EEF3F8' : '#fff' }}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: '#EEF3F8' }}>
                  <FaUpload style={{ color: LI_BLUE, fontSize: 18 }} />
                </div>
                {isDragActive ? (
                  <p className="text-sm font-medium" style={{ color: LI_BLUE }}>Drop to generate palette!</p>
                ) : (
                  <>
                    <p className="text-sm font-medium" style={{ color: LI_TEXT }}>
                      Drag & drop or <span style={{ color: LI_BLUE }}>browse</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: LI_MUTED }}>Supports: JPEG, PNG, WEBP</p>
                  </>
                )}
                {error && <p className="text-xs mt-2 font-medium" style={{ color: '#CC1016' }}>{error}</p>}
              </div>
            </div>

            {/* Tips */}
            {showTips && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 mt-4" style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-sm flex items-center gap-2" style={{ color: LI_TEXT }}>
                    <FaCircleInfo style={{ color: LI_BLUE, fontSize: 13 }} /> Pro Tips
                  </h2>
                  <button onClick={() => setShowTips(false)} className="p-1 rounded hover:bg-gray-50">
                    <FaXmark style={{ color: LI_MUTED, fontSize: 12 }} />
                  </button>
                </div>
                <ul className="space-y-2">
                  {[
                    'Use high-contrast images for vibrant palettes',
                    'Landscape photos often produce great results',
                    'Click color swatches to copy HEX codes',
                    'Adjust palette name before saving',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: LI_MUTED }}>
                      <div className="w-1.5 h-1.5 mt-1 rounded-full flex-shrink-0" style={{ backgroundColor: LI_BLUE }} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          <div className="md:col-span-2">
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-xl p-8 text-center" style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                  style={{ borderColor: `${LI_BLUE}30`, borderTopColor: LI_BLUE }} />
                <p className="text-sm font-medium" style={{ color: LI_TEXT }}>Analyzing image colors...</p>
              </motion.div>
            )}

            {imageUrl && !isLoading && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Image Preview */}
                  <motion.div initial={{ y: 20 }} animate={{ y: 0 }}
                    className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
                    <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: LI_BORDER }}>
                      <h2 className="font-semibold text-sm flex items-center gap-2" style={{ color: LI_TEXT }}>
                        <FaImage style={{ color: LI_BLUE, fontSize: 13 }} /> Image Preview
                      </h2>
                      <button onClick={resetAll} className="p-1.5 rounded hover:bg-gray-50"
                        title="Reset">
                        <FaArrowRotateLeft style={{ color: LI_MUTED, fontSize: 12 }} />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="aspect-square max-h-80 w-full rounded-lg overflow-hidden"
                        style={{ backgroundColor: '#F3F2EF' }}>
                        <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Palette */}
                  {colors.length > 0 && (
                    <motion.div initial={{ y: 20 }} animate={{ y: 0 }}
                      className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
                      <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: LI_BORDER }}>
                        <div className="flex items-center gap-2">
                          <FaPalette style={{ color: LI_BLUE, fontSize: 13 }} />
                          <input
                            type="text"
                            value={paletteName}
                            onChange={e => setPaletteName(e.target.value)}
                            className="text-sm font-semibold bg-transparent outline-none"
                            style={{ color: LI_TEXT }}
                            placeholder="Name your palette"
                          />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={copyPalette} className="p-1.5 rounded hover:bg-gray-50" title="Copy All">
                            <FaClipboard style={{ color: LI_MUTED, fontSize: 12 }} />
                          </button>
                          <button onClick={downloadPalette} className="p-1.5 rounded hover:bg-gray-50" title="Download">
                            <FaDownload style={{ color: LI_MUTED, fontSize: 12 }} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-6 gap-2 h-28">
                          {colors.map((color, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="relative group cursor-pointer rounded-lg overflow-hidden"
                              style={{ backgroundColor: color }}
                              onClick={() => copyToClipboard(color)}
                            >
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <span className="px-2 py-1 rounded text-[10px] font-bold"
                                  style={{ backgroundColor: color, color: getContrastColor(color) }}>
                                  {color.toUpperCase()}
                                </span>
                              </div>
                              {copiedColor === color && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <FaCheck style={{ color: '#4ade80', fontSize: 14 }} />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ImageToPalette
