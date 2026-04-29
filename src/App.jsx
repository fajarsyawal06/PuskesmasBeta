import React from 'react'
import Dashboard from './pages/Dashboard'
import { AuthProvider, useAuth } from './AuthContext'
import InputPage from './pages/InputPage'
import LoginPage from './pages/LoginPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserLayout from './layouts/UserLayout'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="/input-data/:desa/:bulan/:spreadsheetId/:kategori" element={<InputPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  )
}

export default App
