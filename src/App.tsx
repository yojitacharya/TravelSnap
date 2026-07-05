import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { GalleryView } from './pages/GalleryView'
import { LandingPage } from './pages/LandingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LandingPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gallery/:destinationId"
        element={
          <ProtectedRoute>
            <GalleryView />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
