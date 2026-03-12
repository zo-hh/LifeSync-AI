import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar as CalendarIcon, Target, SmilePlus, ListTodo, Zap, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Layout() {
  const [workload, setWorkload] = useState(null)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Check URL params for login success
    const params = new URLSearchParams(location.search)
    const userId = params.get('user_id')
    
    if (userId) {
      localStorage.setItem('lifesync_user_id', userId)
      // Clean up URL
      window.history.replaceState({}, document.title, location.pathname)
    }

    const storedUserId = localStorage.getItem('lifesync_user_id')
    if (!storedUserId && location.pathname !== '/login') {
      navigate('/login')
    } else if (storedUserId) {
      // Setup mock user for now, in a real app fetch from /api/users/{id}
      setUser({ id: storedUserId, name: 'Student', email: 'student@university.edu' })
      
      // Fetch workload prediction on mount
      axios.get(`${API_BASE}/ai/workload?user_id=${storedUserId}`).then(res => setWorkload(res.data)).catch(console.error)
    }
  }, [location, navigate])

  const handleLogout = () => {
    localStorage.removeItem('lifesync_user_id')
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Smart Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Assignments', path: '/planner', icon: ListTodo },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Check-In', path: '/checkin', icon: SmilePlus },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-surface/50 flex flex-col pt-8 pb-6 px-4 shrink-0">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            LifeSync AI
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                  isActive ? 'text-white' : 'text-textMuted hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                <span className="font-medium relative z-10">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-4">
          {/* AI Workload Prediction Widget */}
          {workload && (
            <div className={`p-4 rounded-xl border ${
              workload.status === 'warning' ? 'bg-danger/10 border-danger/20' : 
              workload.status === 'moderate' ? 'bg-warning/10 border-warning/20' : 
              'bg-success/10 border-success/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className={`w-4 h-4 ${
                  workload.status === 'warning' ? 'text-danger' : 
                  workload.status === 'moderate' ? 'text-warning' : 
                  'text-success'
                }`} />
                <h3 className="text-sm font-semibold text-white">AI Prediction</h3>
              </div>
              <p className="text-xs text-textMuted leading-relaxed">
                {workload.message}
              </p>
            </div>
          )}

          {/* User Profile / Logout */}
          {user && (
            <div className="p-3 bg-surface border border-white/5 rounded-xl flex items-center justify-between group">
               <div className="flex flex-col">
                  <span className="text-sm font-medium text-white shadow-sm">{user.name}</span>
                  <span className="text-xs text-textMuted truncate max-w-[120px]">{user.email}</span>
               </div>
               <button onClick={handleLogout} className="p-2 text-textMuted hover:text-danger hover:bg-white/5 rounded-lg transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
               </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto mac-scrollbar font-sans relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto py-10 px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
