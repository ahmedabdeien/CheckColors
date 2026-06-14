import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'

// Providers
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ui/ProtectedRoute'

// Layouts (pages with Navbar/Footer)
import Navbar from './component/navbar/Navbar'
import Footer from './component/Footer'

// Public pages
import Home from './component/pages/Home'
import About from './component/pages/About'
import NotFound from './component/NotFound'
import ContrastChecker from './component/Services/ContrastChecker'
import Contact from './component/pages/Contact'
import ColorPalettes from './component/pages/ColorPalettes'
import ImageToPalette from './component/pages/ImageToPalette'
import GeneratePalette from './component/pages/GeneratePalette '
import AiColors from './component/pages/AiColors'
import Colors from './component/pages/Colors'
import ExplorerColor from './component/pages/ExplorerColor'

// Auth pages (no Navbar/Footer)
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Protected pages
import Dashboard from './pages/dashboard/Dashboard'
import Pricing from './pages/Pricing'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
)

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />
        <Routes>
          {/* Public with layout */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/About" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/Contrast-Checker" element={<PublicLayout><ContrastChecker /></PublicLayout>} />
          <Route path="/Contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/Color-Palettes" element={<PublicLayout><ColorPalettes /></PublicLayout>} />
          <Route path="/image-to-palette" element={<PublicLayout><ImageToPalette /></PublicLayout>} />
          <Route path="/Generate-Palette" element={<PublicLayout><GeneratePalette /></PublicLayout>} />
          <Route path="/Ai-Colors" element={<PublicLayout><AiColors /></PublicLayout>} />
          <Route path="/colors" element={<PublicLayout><Colors /></PublicLayout>} />
          <Route path="/ExplorerColor" element={<PublicLayout><ExplorerColor /></PublicLayout>} />
          <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />

          {/* Auth (no layout) */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
