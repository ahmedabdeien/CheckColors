import { useState, useRef, useEffect } from 'react';
import { FiSend, FiCopy, FiCheck, FiX, FiImage } from 'react-icons/fi';
import { GiArtificialHive } from 'react-icons/gi';
import { LuPalette, LuImage, LuCopy, LuUpload } from 'react-icons/lu';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

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
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Clear copied color notification after 2 seconds
    if (copiedColor) {
      const timer = setTimeout(() => setCopiedColor(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedColor]);

  // Initial welcome message
  useEffect(() => {
    setTimeout(() => {
      setMessages([
        { 
          text: "Hi there! I'm your color assistant. I can help you with color palettes, suggestions, and more. You can also upload an image to extract colors from it.", 
          isAI: true 
        }
      ]);
    }, 500);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: files => {
      handleImageUpload(files[0]);
    }
  });

  const handleImageUpload = (file) => {
    setError('');
    setIsLoading(true);
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = () => {
        // Extract colors (simulate for now)
        setTimeout(() => {
          // Set a dummy palette - in a real implementation this would use Vibrant.js or a color extraction API 
          const extractedColors = [
            '#' + Math.floor(Math.random()*16777215).toString(16),
            '#' + Math.floor(Math.random()*16777215).toString(16),
            '#' + Math.floor(Math.random()*16777215).toString(16),
            '#' + Math.floor(Math.random()*16777215).toString(16),
            '#' + Math.floor(Math.random()*16777215).toString(16),
          ];
          
          setColors(extractedColors);
          setImageUrl(e.target.result);
          setIsLoading(false);
          setShowPaletteModal(true);
          
          // Add to the chat history
          const aiMessage = { 
            text: `I've extracted a palette from your image. Here are the main colors I found.`, 
            isAI: true,
            palette: extractedColors
          };
          setMessages(prev => [...prev, aiMessage]);
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

    // Add user message
    const userMessage = { text: input, isAI: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response (with color intelligence)
    setIsTyping(true);
    setTimeout(() => {
      let aiResponse;
      const userText = input.toLowerCase();
      
      if (userText.includes('palette') || userText.includes('color scheme')) {
        aiResponse = {
          text: "Here's a color palette you might like based on your request:", 
          isAI: true,
          palette: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
        };
      } else if (userText.includes('blue') || userText.includes('cold colors')) {
        aiResponse = {
          text: "Here are some blue and cool colors:", 
          isAI: true,
          palette: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']
        };
      } else if (userText.includes('red') || userText.includes('warm colors')) {
        aiResponse = {
          text: "Here are some red and warm colors:", 
          isAI: true,
          palette: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2']
        };
      } else if (userText.includes('upload') || userText.includes('image')) {
        aiResponse = {
          text: "You can upload an image using the image button below the message input or by dragging an image into this chat window!", 
          isAI: true
        };
      } else {
        aiResponse = {
          text: "I'm your color AI assistant. Ask me for color palettes, color suggestions, or upload an image to extract colors!", 
          isAI: true
        };
      }
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">
      <div className="container mx-auto max-w-2xl p-4">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center mb-8 space-x-4"
        >
          <GiArtificialHive className="w-12 h-12 text-cyan-400" />
          <h1 className="text-3xl font-bold">AI Color Chat</h1>
        </motion.div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto mb-4 bg-black/20 rounded-lg p-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                    msg.isAI 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  {msg.text}
                  
                  {/* Display palette if exists */}
                  {msg.palette && (
                    <div className="mt-3 flex space-x-1 overflow-x-auto py-1">
                      {msg.palette.map((color, i) => (
                        <div 
                          key={i}
                          className="flex-shrink-0 group relative cursor-pointer"
                          onClick={() => copyToClipboard(color)}
                        >
                          <div 
                            className="w-12 h-12 rounded-md border border-white/20"
                            style={{ backgroundColor: color }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 rounded-md transition-all opacity-0 group-hover:opacity-100">
                            <FiCopy className="text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-cyan-400"
              >
                <div className="animate-bounce w-2 h-2 bg-current rounded-full"></div>
                <div className="animate-bounce w-2 h-2 bg-current rounded-full delay-100"></div>
                <div className="animate-bounce w-2 h-2 bg-current rounded-full delay-200"></div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={handleSubmit} 
          className="flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about colors or palettes..."
            className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            type="button"
            className="p-3 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <FiImage className="w-6 h-6" />
          </button>
          <button
            type="submit"
            className="p-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors"
            disabled={!input.trim()}
          >
            <FiSend className="w-6 h-6" />
          </button>
        </motion.form>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-10"
            >
              <div className="text-center p-8 rounded-xl bg-gray-900 max-w-sm mx-4">
                <div className="flex justify-center mb-6">
                  <div className="animate-pulse bg-gradient-to-r from-cyan-500 to-purple-500 w-16 h-16 rounded-full blur-lg opacity-50" />
                </div>
                <p className="text-lg font-medium text-white mb-2">
                  Extracting colors...
                </p>
                <p className="text-sm text-gray-300">
                  Analyzing image and generating optimal color palette
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Color Palette Modal */}
        <AnimatePresence>
          {showPaletteModal && imageUrl && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-10"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <LuPalette className="text-cyan-400" />
                    Extracted Color Palette
                  </h2>
                  <button
                    onClick={() => setShowPaletteModal(false)}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Image Preview */}
                <div className="mb-6">
                  <img 
                    src={imageUrl} 
                    alt="Uploaded preview" 
                    className="w-full h-auto rounded-lg border-2 border-gray-700"
                  />
                </div>

                {/* Color Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                  {colors.map((color, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, transition: { delay: index * 0.1 } }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => copyToClipboard(color)}
                    >
                      <div 
                        className="aspect-square w-full"
                        style={{ backgroundColor: color }}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="flex items-center justify-center gap-1 text-white">
                            {copiedColor === color ? (
                              <FiCheck className="w-3 h-3 text-green-400" />
                            ) : (
                              <FiCopy className="w-3 h-3 text-white/80" />
                            )}
                            <span className="font-mono text-xs font-medium truncate">
                              {color}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => setShowPaletteModal(false)}
                  className="w-full p-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors"
                >
                  Close Palette
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AiColors;
