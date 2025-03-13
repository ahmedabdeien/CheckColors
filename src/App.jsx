
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './component/pages/Home';
import About from './component/pages/About';
import NotFound from './component/NotFound';

function App() {


  return<BrowserRouter>
  <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/About" element={<About />} />
  <Route path="*" element={<NotFound />} />

  </Routes>
 </BrowserRouter>
}

export default App
