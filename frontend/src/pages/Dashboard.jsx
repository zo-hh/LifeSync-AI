import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, Flame } from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  
  useEffect(() => {
    // Fetch user's tasks
    const userId = localStorage.getItem('lifesync_user_id')
    if (userId) {
      axios.get(`${API_BASE}/tasks/?user_id=${userId}`).then(res => setTasks(res.data)).catch(console.error)
    }
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textMuted inline-block"> Good Morning, Student </h1>
        <p className="text-textMuted mt-1">Here is your AI-optimized summary for today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards */}
        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary">
            <CheckCircle2 className="w-5 h-5"/>
            <h3 className="font-semibold text-white">Tasks Due Today</h3>
          </div>
          <p className="text-4xl font-bold text-white">4</p>
          <span className="text-xs text-textMuted">2 High Priority</span>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-secondary">
            <Clock className="w-5 h-5"/>
            <h3 className="font-semibold text-white">Est. Work Time</h3>
          </div>
          <p className="text-4xl font-bold text-white">3.5h</p>
          <span className="text-xs text-textMuted">Optimized by AI</span>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-warning">
            <Flame className="w-5 h-5"/>
            <h3 className="font-semibold text-white">Productivity Streak</h3>
          </div>
          <p className="text-4xl font-bold text-white">5 Days</p>
          <span className="text-xs text-textMuted">Keep it up!</span>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow"></span>
          Up Next
        </h2>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {tasks.length > 0 ? (
            tasks.slice(0, 5).map(task => (
              <motion.div key={task.id} variants={item} className="flex items-center justify-between p-4 rounded-xl bg-surfaceHover border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex items-center gap-4">
                  <button className="text-textMuted hover:text-success transition-colors">
                    <Circle className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className="font-medium text-white group-hover:text-primary transition-colors">{task.title}</h4>
                    <span className="text-xs text-textMuted">{task.difficulty || 'Normal'} priority • ~{task.estimated_minutes || 30} mins</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
             <div className="text-center p-8 text-textMuted">No upcoming tasks! Enjoy your day.</div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
