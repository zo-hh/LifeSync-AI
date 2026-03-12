import { useState, useEffect } from 'react'
import { Target, Activity, Flame, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    const userId = localStorage.getItem('lifesync_user_id')
    if (!userId) return
    try {
      const res = await axios.get(`${API_BASE}/goals/?user_id=${userId}`)
      setGoals(res.data)
    } catch(e) { console.error(e) }
  }

  const addGoal = async (e) => {
    e.preventDefault()
    if (!newTitle) return
    const userId = localStorage.getItem('lifesync_user_id')
    if (!userId) {
      alert("Please login first to log a goal.")
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/goals/?user_id=${userId}`, { title: newTitle, frequency: 'weekly' })
      setNewTitle('')
      fetchGoals()
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Target className="w-8 h-8 text-secondary" />
          Personal Goals
        </h1>
        <p className="text-textMuted mt-1">AI builds your habit schedule based on these targets.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <form onSubmit={addGoal} className="glass-panel p-5">
            <h3 className="font-bold text-white mb-4">Add New Goal</h3>
            <input 
              type="text" 
              className="input-field mb-4" 
              placeholder="e.g. Go to the gym, Read 30 mins"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button type="submit" className="w-full btn-primary" disabled={loading}>
              <Plus className="w-5 h-5" /> Add Goal
            </button>
          </form>

          <div className="glass-panel p-5 bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/20">
            <h3 className="font-bold text-white flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-secondary" /> Habit Optimizer Active
            </h3>
            <p className="text-sm text-textMuted">The AI takes your active goals and weaves them into your schedule dynamically around empty blocks.</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {goals.map((goal, idx) => (
            <motion.div 
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: idx * 0.1}}
              key={goal.id} 
              className="glass-panel p-5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                  <p className="text-sm text-textMuted">Tracked Weekly • Optimized Schedule</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                  Active
                </span>
              </div>
            </motion.div>
          ))}
          {goals.length === 0 && (
             <div className="glass-panel p-10 text-center text-textMuted border-dashed border-2 border-white/10">
                No goals set yet. Let the AI help you build habits!
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
