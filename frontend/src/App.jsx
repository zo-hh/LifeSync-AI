import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SmartCalendar from './pages/SmartCalendar'
import Assignments from './pages/Assignments'
import Goals from './pages/Goals'
import CheckIn from './pages/CheckIn'
import Login from './pages/Login'

function App() {
  // A simple mock check for whether user is authenticated.
  // In a real app, you'd use a context/state or check local storage.
  const isAuthenticated = false // We'll toggle this shortly

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<SmartCalendar />} />
          <Route path="planner" element={<Assignments />} />
          <Route path="goals" element={<Goals />} />
          <Route path="checkin" element={<CheckIn />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
