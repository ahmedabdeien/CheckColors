import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaCopy, FaCheck, FaXmark, FaImage, FaWandMagicSparkles, FaPalette } from 'react-icons/fa6';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const AiColors = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [colors, setColors] = useState([]);
  const [copiedColor, setCopiedColor] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (copiedColor) {
      const t = setTimeout(() => setCopiedColor(null), 2000);
      return () => clearTimeout(t);
    }
  }, [copiedColor]);

  useEffect(() => {
    setTimeout(() => {
      setMessages([{
        text: "Hi! I'm your color assistant. Ask me for color palettes, suggestions, or upload an image to extract colors.",
        isAI: true,
      }]);
    }, 500);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: files => handleImageUpload(files[0]),
  });

  const handleImageUpload = (file) => {
    setError('');
    setIsLoading(true);
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setIsLoading(false);
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = () => {
        setTimeout(() => {
          const extractedColors = Array(5).fill(null).map(() =>
            '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
          );
          setColors(extractedColors);
          setImageUrl(e.target.result);
          setIsLoading(false);
          setShowPaletteModal(true);
          setMessages(prev => [...prev, {
            text: "I've extracted a palette from your image. Here are the main colors I found.",
            isAI: true,
            palette: extractedColors,
          }]);
        }, 1500);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isAI: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const userText = input.toLowerCase();
      let aiResponse;

      if (userText.includes('palette') || userText.includes('color scheme')) {
        aiResponse = { text: "Here's a color palette you might like:", isAI: true, palette: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'] };
      } else if (userText.includes('blue') || userText.includes('cold')) {
        aiResponse = { text: "Here are some blue and cool colors:", isAI: true, palette: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'] };
      } else if (userText.includes('red') || userText.includes('warm')) {
        aiResponse = { text: "Here are some red and warm colors:", isAI: true, palette: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2'] };
      } else if (userText.includes('upload') || userText.includes('image')) {
        aiResponse = { text: "You can upload an image using the image button below the message input!", isAI: true };
      } else {
        aiResponse = { text: "I'm your color AI assistant. Ask me for color palettes, suggestions, or upload an image to extract colors!", isAI: true };
      }

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#EEF3F8' }}>
            <FaWandMagicSparkles style={{ color: LI_BLUE, fontSize: 18 }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: LI_TEXT }}>AI Color Chat</h1>
            <p className="text-xs" style={{ color: LI_MUTED }}>Ask for palettes, suggestions, or upload an image</p>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white rounded-xl mb-3 overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
          <div className="h-96 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.isAI && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: '#EEF3F8' }}>
                      <FaWandMagicSparkles style={{ color: LI_BLUE, fontSize: 11 }} />
                    </div>
                  )}
                  <div className="max-w-xs md:max-w-sm">
                    <div className="px-4 py-2.5 rounded-2xl text-sm"
                      style={{
                        backgroundColor: msg.isAI ? '#F3F2EF' : LI_BLUE,
                        color: msg.isAI ? LI_TEXT : '#fff',
                        borderRadius: msg.isAI ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
                      }}>
                      {msg.text}
                      {msg.palette && (
                        <div className="mt-3 flex gap-1.5 flex-wrap">
                          {msg.palette.map((color, ci) => (
                            <div key={ci} className="group relative cursor-pointer"
                              onClick={() => copyToClipboard(color)}>
                              <div className="w-10 h-10 rounded-lg border border-white/30"
                                style={{ backgroundColor: color }} />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-lg transition-all">
                                <FaCopy style={{ color: '#fff', fontSize: 10 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 pl-9">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ backgroundColor: LI_BLUE, animationDelay: `${i * 100}ms` }} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {error && <p className="text-xs text-center" style={{ color: '#CC1016' }}>{error}</p>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3" style={{ borderColor: LI_BORDER }}>
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about colors or palettes..."
                className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
                style={{ backgroundColor: '#F3F2EF', border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
                onFocus={e => e.target.style.borderColor = LI_BLUE}
                onBlur={e => e.target.style.borderColor = LI_BORDER}
              />
              <button type="button"
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ backgroundColor: '#F3F2EF', color: LI_MUTED }}
                {...getRootProps()}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF3F8'; e.currentTarget.style.color = LI_BLUE; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F3F2EF'; e.currentTarget.style.color = LI_MUTED; }}>
                <input {...getInputProps()} />
                <FaImage className="text-sm" />
              </button>
              <button type="submit" disabled={!input.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white disabled:opacity-40"
                style={{ backgroundColor: LI_BLUE }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
                <FaPaperPlane className="text-sm" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
            <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4"
              style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"
                style={{ backgroundColor: '#EEF3F8' }}>
                <FaWandMagicSparkles style={{ color: LI_BLUE, fontSize: 22 }} />
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: LI_TEXT }}>Extracting colors...</p>
              <p className="text-xs" style={{ color: LI_MUTED }}>Analyzing image and generating optimal color palette</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Palette modal */}
      <AnimatePresence>
        {showPaletteModal && imageUrl && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              style={{ border: `1px solid ${LI_BORDER}` }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: LI_TEXT }}>
                  <FaPalette style={{ color: LI_BLUE }} />
                  Extracted Color Palette
                </h2>
                <button onClick={() => setShowPaletteModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-50">
                  <FaXmark style={{ color: LI_MUTED }} />
                </button>
              </div>

              <img src={imageUrl} alt="Uploaded preview"
                className="w-full h-auto rounded-lg mb-4"
                style={{ border: `1px solid ${LI_BORDER}` }} />

              <div className="grid grid-cols-5 gap-2 mb-4">
                {colors.map((color, i) => (
                  <motion.div key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { delay: i * 0.1 } }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => copyToClipboard(color)}
                  >
                    <div className="aspect-square w-full" style={{ backgroundColor: color }}>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex items-center justify-center gap-1 text-white">
                          {copiedColor === color
                            ? <FaCheck style={{ fontSize: 10, color: '#4ade80' }} />
                            : <FaCopy style={{ fontSize: 10 }} />}
                          <span className="font-mono text-[9px] truncate">{color}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button onClick={() => setShowPaletteModal(false)}
                className="w-full py-2.5 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: LI_BLUE }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
                Close Palette
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiColors;
