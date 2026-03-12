import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, AlertCircle, Plus, CheckCircle, ChevronDown, List, Circle } from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Assignments() {
  const [tasks, setTasks] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    // In a real app we'd fetch actual tasks. For now, trigger the mock sync on load
    syncClassroom()
  }, [])

  const syncClassroom = async () => {
    const userId = localStorage.getItem('lifesync_user_id')
    if (!userId) {
      alert("Please login first to sync Google Classroom.")
      return
    }

    setAnalyzing(true)
    try {
      const res = await axios.get(`${API_BASE}/ai/sync-classroom?user_id=${userId}`)
      if (res.data.data) {
         setTasks(res.data.data)
      } else {
         alert(res.data.message || "No assignments found.")
      }
    } catch (e) {
      console.error(e)
      alert(e.response?.data?.detail || "Failed to sync Classroom. Ensure your Google account is connected.")
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Assignment Planner
          </h1>
          <p className="text-textMuted mt-1">AI-powered assignment breakdown from Google Classroom.</p>
        </div>
        <button 
          onClick={syncClassroom}
          disabled={analyzing}
          className="btn-primary"
        >
          {analyzing ? (
             <><span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span> Analyzing...</>
          ) : (
            <><Plus className="w-5 h-5"/> Sync Google Classroom</>
          )}
        </button>
      </header>

      {analyzing && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 animate-pulse">
          <AlertCircle className="text-primary w-5 h-5 flex-shrink-0" />
          <p className="text-sm text-primary">AI Engine is digesting your syllabi and breaking down complex assignments into manageable subtasks...</p>
        </div>
      )}

      <div className="grid gap-4">
        <AnimatePresence>
          {tasks.map((task, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel overflow-hidden"
            >
              <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(expanded === idx ? null : idx)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${task.difficulty === 'High' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{task.original_title}</h3>
                    <p className="text-sm text-textMuted flex items-center gap-2">
                       <span className="text-primary">{task.difficulty} Difficulty</span> • ~{Math.round(task.total_estimated_minutes / 60)} Hours Total Est.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-white">{task.subtasks.length} Subtasks Created</p>
                    <p className="text-xs text-textMuted">Expand to view plan</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-textMuted transition-transform ${expanded === idx ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {expanded === idx && (
                <div className="border-t border-white/5 bg-surfaceHover p-5">
                  <h4 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4 flex items-center gap-2">
                    <List className="w-4 h-4" /> AI Generated Breakdown
                  </h4>
                  <div className="space-y-3">
                    {task.subtasks.map((st, sidx) => (
                      <div key={sidx} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 hover:border-primary/30 transition-colors bg-background/50">
                        <button className="mt-0.5 text-textMuted hover:text-success transition-colors">
                          <Circle className="w-4 h-4" />
                        </button>
                        <div>
                          <p className="text-sm font-medium text-white">{st}</p>
                          <p className="text-xs text-textMuted inline-block mt-1 px-2 py-0.5 rounded-full bg-white/5">Auto-Scheduled</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
