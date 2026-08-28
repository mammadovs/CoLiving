import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import Navbar from './components/Navbar/Navbar'
import Layout from './components/Layout/Layout'

import Home from './pages/Home'
import Rooms from './pages/Rooms'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import RoomDetail from './pages/RoomDetail'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import ConversationView from './pages/ConversationView'
import ListingEditor from './pages/ListingEditor'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/messages/:userId" element={<ProtectedRoute><ConversationView /></ProtectedRoute>} />
            <Route path="/listings/new" element={<ProtectedRoute><ListingEditor /></ProtectedRoute>} />
            <Route path="/listings/:id/edit" element={<ProtectedRoute><ListingEditor /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App