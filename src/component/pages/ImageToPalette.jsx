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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            className={`fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg px-4 py-3 flex items-center space-x-2 ${
              notification.type === 'success' ? 'border-l-4 border-green-500' : 
              notification.type === 'error' ? 'border-l-4 border-red-500' : 
              'border-l-4 border-blue-500'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {notification.type === 'success' && <LuCheck className="text-green-500" />}
            {notification.type === 'error' && <LuX className="text-red-500" />}
            {notification.type === 'info' && <LuInfo className="text-blue-500" />}
            <span>{notification.message}</span>
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                <h2 className="font-semibold text-xl flex items-center gap-2">
                  <LuUpload />
                  Upload Image
                </h2>
              </div>
              <div 
                {...getRootProps()}
                className={`border-2 border-dashed m-4 rounded-xl p-8 text-center cursor-pointer transition-colors duration-300
                  ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}
                  ${error ? 'border-red-500 bg-red-50' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <LuUpload className="w-12 h-12 text-gray-400" />
                  </div>
                  {isDragActive ? (
                    <p className="text-purple-600 font-medium">Drop the image here...</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium">
                        Drag & drop an image, or click to select
                      </p>
                      <p className="text-sm text-gray-500">
                        Supported formats: JPEG, PNG, WEBP
                      </p>
                    </>
                  )}
                  {error && (
                    <p className="text-red-500 mt-2 font-medium">{error}</p>
                  )}
                </div>
              </div>
              {imageUrl && (
                <div className="p-4 border-t">
                  <button 
                    onClick={resetAll}
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                  >
                    <LuRefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tips */}
            {showTips && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-4 mt-6"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <LuInfo className="text-blue-500" />
                    Tips
                  </h2>
                  <button onClick={() => setShowTips(false)} className="text-gray-400 hover:text-gray-600">
                    <LuX />
                  </button>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 text-sm">
                  <li>For best results, use images with a variety of colors</li>
                  <li>Click on any color to copy its HEX value</li>
                  <li>You can save or download your palette for later use</li>
                  <li>Try different images to see how the palette changes</li>
                </ul>
              </motion.div>
            )}
          </div>

          <div className="md:col-span-2">
            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-6 text-gray-600">Analyzing image colors...</p>
              </div>
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
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white flex justify-between items-center">
                      <h2 className="font-semibold text-xl flex items-center gap-2">
                        <LuImage />
                        Image Preview
                      </h2>
                    </div>
                    <div className="p-4">
                      <div className="max-w-full mx-auto bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt="Uploaded preview" 
                          className="max-h-96 w-full object-contain"
                        />
                      </div>
                    </div>

                  </motion.div>




                  {/* Color Palette */}
                  {/* Color Palette */}
{colors.length > 0 && (
  <motion.div 
    initial={{ y: 20 }}
    animate={{ y: 0 }}
    className="bg-white rounded-lg shadow-md overflow-hidden"
  >
    <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl flex items-center gap-2">
          <LuPalette />
          <input
            type="text"
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value)}
            className="bg-transparent border-b border-white/50 text-white placeholder-white/70 outline-none focus:border-white"
            placeholder="Palette Name"
          />
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={copyPalette}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Copy all colors"
          >
            <LuClipboard />
          </button>
          <button 
            onClick={savePalette}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Save palette"
          >
            <LuSave />
          </button>
          <button 
            onClick={downloadPalette}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Download palette"
          >
            <LuDownload />
          </button>
        </div>
      </div>
    </div>
    <div className="p-4">
      <div className="flex h-16"> {/* Fixed height container */}
        {colors.map((color, index) => (
          <div 
            key={index}
            className="flex-1 relative group cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => copyToClipboard(color)}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span 
                className="px-2 py-1 rounded-md text-sm font-medium"
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
                <LuCheck className="text-green-400 text-xl" />
              </div>
            )}
          </div>
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
        
    )   
}
export default ImageToPalette
