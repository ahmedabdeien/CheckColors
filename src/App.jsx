import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'

// Providers
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ui/ProtectedRoute'

// Layouts
import Navbar from './component/navbar/Navbar'
import Footer from './component/Footer'
import GlobalSearch from './component/GlobalSearch'

// Public pages
import Home from './component/pages/Home'
import About from './component/pages/About'
import NotFound from './component/NotFound'
import ContrastChecker from './component/Services/ContrastChecker'
import Contact from './component/pages/Contact'
import ExplorePalettes from './component/pages/ExplorePalettes'
import ImageToPalette from './component/pages/ImageToPalette'
import GeneratePalette from './component/pages/GeneratePalette '
import AiColors from './component/pages/AiColors'
import Colors from './component/pages/Colors'
import GradientGenerator from './component/pages/GradientGenerator'
import TintsShades from './component/pages/TintsShades'

// Auth pages
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
        <Toaster position="top-center" toastOptions={{ style: { background: '#fff', color: '#000000E6', border: '1px solid #E0DFDC', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }} />
        <GlobalSearch />
        <Routes>
          {/* Public with layout */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/About" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/Contrast-Checker" element={<PublicLayout><ContrastChecker /></PublicLayout>} />
          <Route path="/Contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/explore" element={<PublicLayout><ExplorePalettes /></PublicLayout>} />
          <Route path="/Color-Palettes" element={<PublicLayout><ExplorePalettes /></PublicLayout>} />
          <Route path="/image-to-palette" element={<PublicLayout><ImageToPalette /></PublicLayout>} />
          <Route path="/Generate-Palette" element={<PublicLayout><GeneratePalette /></PublicLayout>} />
          <Route path="/Ai-Colors" element={<PublicLayout><AiColors /></PublicLayout>} />
          <Route path="/colors" element={<PublicLayout><Colors /></PublicLayout>} />
          <Route path="/gradient-generator" element={<PublicLayout><GradientGenerator /></PublicLayout>} />
          <Route path="/tints-shades" element={<PublicLayout><TintsShades /></PublicLayout>} />
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
