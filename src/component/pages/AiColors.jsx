import { useState, useRef, useEffect } from 'react';
import {
  FaPaperPlane, FaCopy, FaCheck, FaWandMagicSparkles,
  FaImage, FaLightbulb, FaRobot, FaUser, FaBookmark, FaArrowRight, FaCrown,
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Vibrant } from 'node-vibrant/browser';
import chroma from 'chroma-js';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const getContrast = hex => {
  try { return chroma(hex).luminance() > 0.35 ? '#000' : '#fff'; } catch { return '#000'; }
};

const SUGGESTIONS = [
  { label: 'Ocean vibes',       prompt: 'Ocean vibes — calm and deep blues' },
  { label: 'Warm sunset',       prompt: 'Warm sunset with orange and golden tones' },
  { label: 'Forest green',      prompt: 'Lush forest green and earth tones' },
  { label: 'Dark moody',        prompt: 'Dark moody dramatic night palette' },
  { label: 'Soft pastel',       prompt: 'Soft gentle pastel colors for baby' },
  { label: 'Luxury gold',       prompt: 'Luxury premium gold and black' },
  { label: 'Cyberpunk neon',    prompt: 'Cyberpunk neon digital tech palette' },
  { label: 'Arabic heritage',   prompt: 'Arabic heritage rich colors with gold and deep red' },
];

export default function AiColors() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [messages, setMessages] = useState([{
    isAI: true,
    text: "مرحباً! I'm CheckColors AI, powered by Groq LLaMA 3.3 🤖\n\nDescribe any mood, theme, or style and I'll generate a perfect color palette for you. You can also upload an image to extract its colors!",
    palette: null,
    meta: null,
  }]);
  const [input, setInput]         = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const copyColor = (hex) => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopiedColor(hex);
    toast.success(`Copied ${hex.toUpperCase()}`);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const saveColorToAccount = async (hex, name) => {
    if (!user) { toast.error('Sign in to save colors'); return; }
    try {
      await api.post('/colors/saved', { hex, name });
      toast.success(`Saved ${hex}`);
    } catch { toast.error('Could not save color'); }
  };

  // ── Image drop ────────────────────────────────────────────────────────────
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: async ([file]) => {
      if (!file) return;
      setImageLoading(true);
      addUserMsg(`Uploaded image: ${file.name}`);
      try {
        const url = URL.createObjectURL(file);
        const vPalette = await Vibrant.from(url).getPalette();
        URL.revokeObjectURL(url);
        const colors = Object.entries(vPalette)
          .filter(([, sw]) => sw)
          .map(([role, sw]) => ({ hex: sw.hex, name: role.replace(/([A-Z])/g, ' $1').trim(), role }));
        addAIMsg(
          "Here are the dominant colors I extracted from your image — click any swatch to copy, or hover to save!",
          colors,
          null,
        );
      } catch {
        addAIMsg("Couldn't extract colors from that image. Try a clearer photo!", null, null);
      } finally { setImageLoading(false); }
    },
  });

  const addUserMsg = (text) => setMessages(prev => [...prev, { isAI: false, text, palette: null }]);
  const addAIMsg   = (text, palette, meta) => setMessages(prev => [...prev, { isAI: true, text, palette, meta }]);

  // ── Send to Groq via backend ───────────────────────────────────────────────
  const send = async (promptText = input) => {
    const text = promptText.trim();
    if (!text || isTyping) return;
    setInput('');
    addUserMsg(text);
    setIsTyping(true);

    try {
      const { data } = await api.post('/ai/palette', { prompt: text });
      const { palette } = data;
      addAIMsg(
        `**${palette.name}** — ${palette.description}`,
        palette.colors,
        { tags: palette.tags },
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'AI service error';
      if (msg.includes('limit')) {
        addAIMsg("You've reached your AI generation limit for this month. Upgrade to Pro for 100 generations/month!", null, null);
      } else {
        addAIMsg(`Sorry, something went wrong: ${msg}`, null, null);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const planLimit = user?.subscription?.plan === 'enterprise' ? Infinity : user?.subscription?.plan === 'pro' ? 100 : 5;
  const usedCount = user?.aiGenerations || 0;
  const limitReached = user && usedCount >= planLimit;

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${LI_BLUE}, #7C3AED)` }}>
            <FaWandMagicSparkles style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: LI_TEXT }}>{t('ai.title')}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs" style={{ color: LI_MUTED }}>Powered by Groq · LLaMA 3.3 70B</span>
            </div>
          </div>
          {user && (
            <div className="ms-auto text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: limitReached ? '#FFF3F3' : '#EEF3F8', color: limitReached ? '#CC1016' : LI_BLUE }}>
              {usedCount} / {planLimit === Infinity ? '∞' : planLimit} {t('ai.used')}
            </div>
          )}
        </div>

        {/* Pro upgrade banner when limit reached */}
        {limitReached && (
          <div className="mb-4 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: 'linear-gradient(135deg, #0A66C2, #7C3AED)', color: '#fff' }}>
            <FaCrown style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }} />
            <div className="flex-1">
              <p className="font-bold text-sm mb-0.5">{t('ai.proDesc')}</p>
              <p className="text-xs opacity-80">{t('ai.upgradeTo')}</p>
            </div>
            <Link to="/pricing"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#fff', color: LI_BLUE }}>
              {t('common.upgrade')} <FaArrowRight size={10} />
            </Link>
          </div>
        )}

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map(s => (
            <button key={s.label} onClick={() => !limitReached && send(s.prompt)}
              disabled={limitReached}
              className="text-xs px-3 py-1.5 rounded-full font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: LI_BORDER, color: LI_MUTED, backgroundColor: '#fff' }}
              onMouseEnter={e => { if (!limitReached) { e.currentTarget.style.borderColor = LI_BLUE; e.currentTarget.style.color = LI_BLUE; e.currentTarget.style.backgroundColor = '#EEF3F8'; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = LI_BORDER; e.currentTarget.style.color = LI_MUTED; e.currentTarget.style.backgroundColor = '#fff'; }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="bg-white rounded-2xl overflow-hidden mb-3" style={{ border: `1px solid ${LI_BORDER}` }}>
          <div className="h-[500px] overflow-y-auto p-5 space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${msg.isAI ? 'justify-start' : 'justify-end'}`}>

                  {msg.isAI && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `linear-gradient(135deg, ${LI_BLUE}, #7C3AED)` }}>
                      <FaRobot style={{ color: '#fff', fontSize: 12 }} />
                    </div>
                  )}

                  <div className="max-w-sm">
                    {/* Bubble */}
                    <div className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                      style={{
                        backgroundColor: msg.isAI ? '#F3F2EF' : LI_BLUE,
                        color: msg.isAI ? LI_TEXT : '#fff',
                        borderRadius: msg.isAI ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
                      }}>
                      {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </div>

                    {/* Palette swatches */}
                    {msg.palette && (
                      <div className="mt-3 bg-white rounded-xl overflow-hidden"
                        style={{ border: `1px solid ${LI_BORDER}` }}>
                        {/* Color strip */}
                        <div className="flex" style={{ height: 56 }}>
                          {msg.palette.map((c, ci) => {
                            const hex = c.hex || c;
                            return (
                              <div key={ci} className="flex-1 cursor-pointer relative group"
                                style={{ backgroundColor: hex }}
                                onClick={() => copyColor(hex)}>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                                  {copiedColor === hex
                                    ? <FaCheck size={10} style={{ color: getContrast(hex) }} />
                                    : <FaCopy size={10} style={{ color: getContrast(hex) }} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Color details */}
                        <div className="divide-y" style={{ borderColor: '#F3F2EF' }}>
                          {msg.palette.map((c, ci) => {
                            const hex   = c.hex  || c;
                            const name  = c.name || hex;
                            const role  = c.role || '';
                            return (
                              <div key={ci}
                                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => copyColor(hex)}>
                                <div className="flex items-center gap-2.5">
                                  <div className="w-6 h-6 rounded-md flex-shrink-0"
                                    style={{ backgroundColor: hex, border: `1px solid ${LI_BORDER}` }} />
                                  <div>
                                    <p className="text-xs font-semibold" style={{ color: LI_TEXT }}>{name}</p>
                                    {role && <p className="text-[10px]" style={{ color: LI_MUTED }}>{role}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-mono" style={{ color: LI_MUTED }}>{hex.toUpperCase()}</span>
                                  {user && (
                                    <button
                                      onClick={e => { e.stopPropagation(); saveColorToAccount(hex, name); }}
                                      className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                                      style={{ color: LI_MUTED }}
                                      onMouseEnter={e => e.currentTarget.style.color = LI_BLUE}
                                      onMouseLeave={e => e.currentTarget.style.color = LI_MUTED}
                                      title="Save to my colors">
                                      <FaBookmark size={9} />
                                    </button>
                                  )}
                                  {copiedColor === hex
                                    ? <FaCheck size={10} style={{ color: '#057642' }} />
                                    : <FaCopy size={10} style={{ color: LI_MUTED }} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Export row */}
                        <div className="flex items-center gap-2 px-3 py-2 border-t" style={{ borderColor: LI_BORDER }}>
                          {['CSS', 'HEX LIST'].map(fmt => (
                            <button key={fmt}
                              onClick={() => {
                                const hexes = msg.palette.map(c => c.hex || c);
                                const text = fmt === 'CSS'
                                  ? `:root {\n${hexes.map((h, i) => `  --color-${i + 1}: ${h};`).join('\n')}\n}`
                                  : hexes.join(', ');
                                navigator.clipboard.writeText(text);
                                toast.success(`${fmt} copied!`);
                              }}
                              className="text-[10px] px-2 py-1 rounded font-semibold border transition-colors"
                              style={{ borderColor: LI_BORDER, color: LI_BLUE, backgroundColor: '#EEF3F8' }}>
                              Copy {fmt}
                            </button>
                          ))}
                          {msg.meta?.tags?.length > 0 && (
                            <div className="flex gap-1 ml-auto flex-wrap">
                              {msg.meta.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: LI_BG, color: LI_MUTED }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {!msg.isAI && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold"
                      style={{ backgroundColor: LI_BLUE }}>
                      {user?.name?.charAt(0).toUpperCase() || <FaUser size={12} />}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${LI_BLUE}, #7C3AED)` }}>
                    <FaRobot style={{ color: '#fff', fontSize: 12 }} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                    style={{ backgroundColor: '#F3F2EF' }}>
                    <span className="text-xs mr-1" style={{ color: LI_MUTED }}>Generating palette</span>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: LI_BLUE, animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="border-t p-3" style={{ borderColor: LI_BORDER }}>
            <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 items-center">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t('ai.placeholder')}
                className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
                style={{ backgroundColor: '#F3F2EF', border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
                onFocus={e => e.target.style.borderColor = LI_BLUE}
                onBlur={e => e.target.style.borderColor = LI_BORDER}
                disabled={isTyping || limitReached}
              />
              {/* Image upload */}
              <div {...getRootProps()}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer border transition-all"
                style={{ borderColor: LI_BORDER, backgroundColor: '#fff', color: LI_MUTED }}
                title="Upload image to extract colors"
                onMouseEnter={e => { e.currentTarget.style.borderColor = LI_BLUE; e.currentTarget.style.color = LI_BLUE; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = LI_BORDER; e.currentTarget.style.color = LI_MUTED; }}>
                <input {...getInputProps()} />
                {imageLoading
                  ? <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                  : <FaImage size={14} />}
              </div>
              {/* Send */}
              <button type="submit" disabled={!input.trim() || isTyping || limitReached}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white disabled:opacity-40 transition-all"
                style={{ background: `linear-gradient(135deg, ${LI_BLUE}, #7C3AED)` }}>
                <FaPaperPlane size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2 text-xs px-4 py-3 rounded-xl"
          style={{ backgroundColor: '#EEF3F8', color: LI_MUTED }}>
          <FaLightbulb style={{ color: LI_BLUE, flexShrink: 0, marginTop: 1 }} />
          <span>
            {t('ai.subtitle')}
            {user
              ? ` ${t('ai.saveColor')}`
              : ` ${t('auth.signIn')}`}
          </span>
        </div>
      </div>
    </div>
  );
}
