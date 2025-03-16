
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './component/pages/Home';
import About from './component/pages/About';
import NotFound from './component/NotFound';
import Navbar from './component/navbar/Navbar';
import Footer from './component/Footer';
import ColorPaletteExplorer from './component/Services/ColorPaletteExplorer';
import ContrastChecker from './component/Services/ContrastChecker';
import Contact from './component/pages/Contact';
import ColorPalettes from './component/pages/ColorPalettes';
import ImageToPalette from './component/pages/ImageToPalette';
import GeneratePalette from './component/pages/GeneratePalette ';

function App() {


  return<BrowserRouter>
  <Navbar />

  <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/About" element={<About />} />
  <Route path="/Contrast-Checker" element={<ContrastChecker />} />
  <Route path="/Contact" element={<Contact />} />
  <Route path="/Color-Palettes" element={<ColorPalettes />} />
  <Route path="/image-to-palette" element={<ImageToPalette />} />
  <Route path="/Generate-Palette" element={<GeneratePalette/>} />

  <Route path="*" element={<NotFound />} />
  </Routes>

  <Footer />
 </BrowserRouter>
}

export default App
