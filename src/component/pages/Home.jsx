import { useState } from 'react';
import { LuPalette, LuRocket, LuUsers, LuStar, LuDownload, LuHeart } from 'react-icons/lu';
import { motion } from 'framer-motion';

const Home = () => {
  const [email, setEmail] = useState('');
  const [selectedPalette, setSelectedPalette] = useState(0);

  const palettes = [
    ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'],
    ['#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
    ['#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5'],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-500 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Create Beautiful Color Palettes
          </motion.h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Discover, create, and share stunning color combinations for your next design project
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
              Get Started
            </button>
            <a href="/ColorPalettes">
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all">
              Explore Palettes
            </button></a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <LuPalette className="w-12 h-12" />,
              title: "Endless Inspiration",
              description: "Explore thousands of beautiful color combinations"
            },
            {
              icon: <LuRocket className="w-12 h-12" />,
              title: "Easy Export",
              description: "Export palettes to multiple formats in one click"
            },
            {
              icon: <LuUsers className="w-12 h-12" />,
              title: "Community Driven",
              description: "Share and collaborate with other creatives"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl shadow-lg text-center"
            >
              <div className="text-purple-600 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending Palettes */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Trending Palettes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {palettes.map((colors, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="rounded-xl overflow-hidden shadow-lg cursor-pointer"
                onClick={() => setSelectedPalette(index)}
              >
                <div className="flex h-32">
                  {colors.map((color, colorIndex) => (
                    <div 
                      key={colorIndex}
                      className="flex-1 relative group"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute bottom-2 right-2 text-xs font-mono text-white/80">
                        {color}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Popular Palette #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <LuHeart className="text-red-500" />
                      <span>{(Math.random() * 500 + 100).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-center">
          {[
            { number: '50K+', label: 'Active Users' },
            { number: '1M+', label: 'Palettes Created' },
            { number: '98%', label: 'Satisfaction Rate' },
            { number: '150+', label: 'Countries' },
          ].map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="p-4"
            >
              <div className="text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
          <p className="text-gray-600 mb-8">
            Get weekly updates about new features and trending palettes
          </p>
          <form className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2023 ColorPalettes. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;