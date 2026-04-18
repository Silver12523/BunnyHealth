import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'

function App() {
  const isLoggedIn = localStorage.getItem('user_id') !== null

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/home" /> : <LoginPage />}
        />
        <Route
          path="/home"
          element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={isLoggedIn ? '/home' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
