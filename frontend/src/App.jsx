import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'

import Navbar from './components/Navbar/Navbar'
import Layout from './components/Layout/Layout'

// ── Eager (kritik ilk yükləmə yolları — bundle-a daxildir) ──────────────────
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'

// ── Lazy (route-based code splitting — ayrı chunk-lara bölünür) ──────────────
const Rooms          = lazy(() => import('./pages/Rooms'))
const About          = lazy(() => import('./pages/About'))
const Onboarding     = lazy(() => import('./pages/Onboarding'))
const ListingDetail  = lazy(() => import('./pages/ListingDetail'))
const ListingForm    = lazy(() => import('./pages/ListingForm'))
const MyListings     = lazy(() => import('./pages/MyListings'))
const Profile        = lazy(() => import('./pages/Profile'))
const ProfileEdit    = lazy(() => import('./pages/ProfileEdit'))
const UserProfile    = lazy(() => import('./pages/UserProfile'))
const Inbox          = lazy(() => import('./pages/Inbox'))
const Conversation   = lazy(() => import('./pages/Conversation'))

// ── Fallback UI Suspense üçün ────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 64px)',
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '4px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        animation: 'spin 0.75s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Layout>
          {/* Suspense boundary — bütün lazy route-lar üçün ortaq fallback */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public ── */}
              <Route path="/"       element={<Home />} />
              <Route path="/rooms"  element={<Navigate to="/listings" replace />} />
              <Route path="/about"  element={<About />} />
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* ── Public (lazy) ── */}
              <Route path="/listings"    element={<Rooms />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/users/:id"    element={<UserProfile />} />

              {/* ── Protected (lazy) ── */}
              <Route
                path="/listings/new"
                element={
                  <ProtectedRoute>
                    <ListingForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/listings/:id/edit"
                element={
                  <ProtectedRoute>
                    <ListingForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-listings"
                element={
                  <ProtectedRoute>
                    <MyListings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <ProfileEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Inbox />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/:userId"
                element={
                  <ProtectedRoute>
                    <Conversation />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App