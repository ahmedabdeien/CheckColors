import { useState, useEffect } from 'react';
import { 
  LuUpload, 
  LuCopy, 
  LuCheck, 
  LuPalette, 
  LuImage, 
  LuDownload, 
  LuInfo, 
  LuX, 
  LuRefreshCw,
  LuClipboard,
  LuSave
} from 'react-icons/lu';
import { useDropzone } from 'react-dropzone';
import { Vibrant } from 'node-vibrant/browser';
import { motion, AnimatePresence } from 'framer-motion';

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
     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            className={`fixed top-4 right-4 z-50 bg-white shadow-xl rounded-lg px-4 py-3 flex items-center space-x-3 border-l-[6px] ${
              notification.type === 'success' ? 'border-emerald-500' : 
              notification.type === 'error' ? 'border-rose-500' : 
              'border-sky-500'
            }`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className={`p-2 rounded-full bg-opacity-20 ${
              notification.type === 'success' ? 'bg-emerald-500' : 
              notification.type === 'error' ? 'bg-rose-500' : 
              'bg-sky-500'
            }`}>
              {notification.type === 'success' && <LuCheck className="text-emerald-600" />}
              {notification.type === 'error' && <LuX className="text-rose-600" />}
              {notification.type === 'info' && <LuInfo className="text-sky-600" />}
            </div>
            <span className="font-medium text-gray-700">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 mb-2 flex items-center gap-3">
            <LuPalette className="w-8 h-8 text-purple-600" />
            Image to Palette Generator
          </h1>
          <p className="text-gray-600 md:text-lg">Extract beautiful color palettes from your favorite images</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                <h2 className="font-semibold text-xl flex items-center gap-2">
                  <LuUpload className="w-5 h-5" />
                  Upload Image
                </h2>
              </div>
              <div 
                {...getRootProps()}
                className={`border-3 border-dashed m-4 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group
                  ${isDragActive ? 'border-purple-500 bg-purple-50 scale-[0.98]' : 'border-gray-200 hover:border-purple-400'}
                  ${error ? 'animate-shake border-rose-500 bg-rose-50' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                      <LuUpload className="w-8 h-8 text-purple-600 group-hover:text-purple-700" />
                    </div>
                  </div>
                  {isDragActive ? (
                    <p className="text-purple-600 font-medium">Drop to generate palette!</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium">
                        Drag & drop or <span className="text-purple-600">browse</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Supports: JPEG, PNG, WEBP
                      </p>
                    </>
                  )}
                  {error && (
                    <p className="text-rose-500 mt-2 font-medium animate-pulse">{error}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tips */}
            {showTips && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-4 mt-6 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg flex items-center gap-2 text-gray-700">
                    <LuInfo className="text-sky-500 w-5 h-5" />
                    Pro Tips
                  </h2>
                  <button 
                    onClick={() => setShowTips(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close tips"
                  >
                    <LuX className="w-5 h-5" />
                  </button>
                </div>
                <ul className="space-y-3 text-gray-600 text-sm">
                  {[
                    'Use high-contrast images for vibrant palettes',
                    'Landscape photos often produce great results',
                    'Click color swatches to copy HEX codes',
                    'Adjust palette name before saving'
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-2 bg-purple-500 rounded-full flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          <div className="md:col-span-2">
            {/* Loading State */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6"
              >
                <div className="space-y-4">
                  <div className="animate-pulse bg-gradient-to-r from-purple-500 to-blue-500 h-2 w-32 rounded-full mx-auto" />
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto" />
                  <p className="text-gray-600 font-medium">Analyzing image colors...</p>
                  <div className="h-4 bg-gray-100 rounded-full w-48 mx-auto animate-pulse" />
                </div>
              </motion.div>
            )}

            {/* Results */}
            {imageUrl && !isLoading && (
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Image Preview */}
                  <motion.div 
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white flex justify-between items-center">
                      <h2 className="font-semibold text-xl flex items-center gap-2">
                        <LuImage className="w-5 h-5" />
                        Image Preview
                      </h2>
                      <button
                        onClick={resetAll}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Reset"
                      >
                        <LuRefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="aspect-square max-h-96 w-full bg-gray-50 rounded-lg overflow-hidden shadow-inner">
                        <img 
                          src={imageUrl} 
                          alt="Uploaded preview" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Color Palette */}
                  {colors.length > 0 && (
                    <motion.div 
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                        <div className="flex justify-between items-center">
                          <h2 className="font-semibold text-xl flex items-center gap-2">
                            <LuPalette className="w-5 h-5" />
                            <input
                              type="text"
                              value={paletteName}
                              onChange={(e) => setPaletteName(e.target.value)}
                              className="bg-transparent border-b-2 border-white/30 focus:border-white/80 placeholder-white/70 outline-none text-lg font-medium max-w-[60%] transition-colors"
                              placeholder="Name your palette"
                            />
                          </h2>
                          <div className="flex gap-2">
                            <button 
                              onClick={copyPalette}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors tooltip"
                              data-tooltip="Copy All"
                            >
                              <LuClipboard className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={downloadPalette}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors tooltip"
                              data-tooltip="Download"
                            >
                              <LuDownload className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-6 gap-2 h-32">
                          {colors.map((color, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                              style={{ backgroundColor: color }}
                              onClick={() => copyToClipboard(color)}
                            >
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <span 
                                  className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm"
                                  style={{ 
                                    backgroundColor: color,
                                    color: getContrastColor(color)
                                  }}
                                >
                                  {color.toUpperCase()}
                                </span>
                              </div>
                              {copiedColor === color && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <LuCheck className="text-emerald-400 text-xl animate-pop-in" />
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
