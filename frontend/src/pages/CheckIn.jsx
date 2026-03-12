import { useState } from 'react'
import { Activity, Brain, CheckCircle2, HeartPulse, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function CheckIn() {
  const [mood, setMood] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const moods = [
    { id: 'motivated', label: 'Motivated & Energized', icon: '🔥', color: 'from-warning/20 to-warning/5 border-warning/30 text-warning' },
    { id: 'neutral', label: 'Just Okay', icon: '😐', color: 'from-accent/20 to-accent/5 border-accent/30 text-accent' },
    { id: 'tired', label: 'Tired / Low Energy', icon: '🥱', color: 'from-primary/20 to-primary/5 border-primary/30 text-primary' },
    { id: 'overwhelmed', label: 'Stressed / Overwhelmed', icon: '🤯', color: 'from-danger/20 to-danger/5 border-danger/30 text-danger' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!mood) return
    
    const userId = localStorage.getItem('lifesync_user_id')
    if (!userId) {
      alert("Please login first to log your mood.")
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/ai/emotional-checkin?user_id=${userId}`, { mood, notes: '' })
      setResponse(res.data.ai_response)
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">How are you feeling today?</h1>
        <p className="text-lg text-textMuted">LifeSync AI adjusts your schedule dynamically based on your energy levels.</p>
      </header>

      {!response ? (
        <form onSubmit={handleSubmit} className="space-y-8 mt-12">
          <div className="grid grid-cols-2 gap-4">
            {moods.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                  mood === m.id 
                    ? `bg-gradient-to-br ${m.color} ring-2 ring-white/20 scale-[1.02]` 
                    : 'bg-surface border-white/5 hover:border-white/20 text-textMuted hover:bg-surfaceHover'
                }`}
              >
                <div className="text-4xl mb-3">{m.icon}</div>
                <h3 className={`font-bold text-lg ${mood === m.id ? 'text-white' : ''}`}>{m.label}</h3>
                {mood === m.id && <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 shrink-0" />}
              </button>
            ))}
          </div>
          
          <div className="flex justify-center">
             <button 
               type="submit" 
               className="btn-primary w-full max-w-sm py-4 text-lg" 
               disabled={!mood || loading}
             >
               {loading ? (
                 <><span className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full"></span> Optimizing Schedule...</>
               ) : (
                 <><HeartPulse className="w-5 h-5"/> Update AI Engine</>
               )}
             </button>
          </div>
        </form>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 mt-12 border-primary/30 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-lg shadow-primary/20">
               <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                Schedule Adjusted <CheckCircle2 className="w-6 h-6 text-success" />
              </h2>
              <p className="text-lg text-textMuted leading-relaxed">
                {response.suggestion}
              </p>
              
              <div className="mt-6 flex gap-4">
                <button onClick={() => setResponse(null)} className="btn-secondary">Check in again</button>
                <button className="btn-primary">View New Calendar</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
