
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

function App() {


  return<BrowserRouter>
  <Navbar />

  <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/About" element={<About />} />
  <Route path="/ColorPaletteExplorer" element={<ColorPaletteExplorer />} />
  <Route path="/ContrastChecker" element={<ContrastChecker />} />
  <Route path="/Contact" element={<Contact />} />
  <Route path="/ColorPalettes" element={<ColorPalettes />} />
  <Route path="*" element={<NotFound />} />
  </Routes>

  <Footer />
 </BrowserRouter>
}

export default App
