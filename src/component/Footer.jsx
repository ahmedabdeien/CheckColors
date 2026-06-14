import { Link } from 'react-router-dom';
import { FaPalette, FaXTwitter, FaGithub, FaLinkedin } from 'react-icons/fa6';
import CheckColorslogo from '../assets/cc-logo.svg';

const LI_BLUE = '#0A66C2';
const LI_BORDER = '#E0DFDC';
const LI_MUTED = '#00000099';
const LI_TEXT = '#000000E6';

const links = {
  Product: [
    { to: '/explore',            label: 'Explore Palettes' },
    { to: '/Contrast-Checker',   label: 'Contrast Checker' },
    { to: '/gradient-generator', label: 'Gradient Generator' },
    { to: '/tints-shades',       label: 'Tints & Shades' },
    { to: '/image-to-palette',   label: 'Image to Palette' },
    { to: '/Ai-Colors',          label: 'AI Colors' },
  ],
  Company: [
    { to: '/About', label: 'About' },
    { to: '/Contact', label: 'Contact' },
    { to: '/pricing', label: 'Pricing' },
  ],
  Account: [
    { to: '/login', label: 'Sign In' },
    { to: '/register', label: 'Join Now' },
    { to: '/dashboard', label: 'Dashboard' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t" style={{ borderColor: LI_BORDER }}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={CheckColorslogo} alt="CheckColors" className="w-8 h-8" />
              <span className="font-bold text-base" style={{ color: LI_BLUE }}>CheckColors</span>
            </Link>
            <p className="text-xs leading-relaxed mb-4" style={{ color: LI_MUTED }}>
              Professional color tools for modern designers and developers.
            </p>
            <div className="flex items-center gap-3">
              {[FaXTwitter, FaGithub, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#F3F2EF', color: LI_MUTED }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF3F8'; e.currentTarget.style.color = LI_BLUE; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F3F2EF'; e.currentTarget.style.color = LI_MUTED; }}>
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: LI_TEXT }}>{heading}</h3>
              <ul className="space-y-2">
                {items.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-xs transition-colors"
                      style={{ color: LI_MUTED }}
                      onMouseEnter={e => e.currentTarget.style.color = LI_BLUE}
                      onMouseLeave={e => e.currentTarget.style.color = LI_MUTED}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderColor: LI_BORDER }}>
          <p className="text-xs" style={{ color: LI_MUTED }}>© 2024 CheckColors. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
              <a key={t} href="#" className="text-xs" style={{ color: LI_MUTED }}
                onMouseEnter={e => e.currentTarget.style.color = LI_BLUE}
                onMouseLeave={e => e.currentTarget.style.color = LI_MUTED}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
