import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Zap, Info } from 'lucide-react'
import axios from 'axios'

export default function SmartCalendar() {
  const [currentDate] = useState(new Date())
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
  const [aiSchedule, setAiSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    const userId = localStorage.getItem('lifesync_user_id')
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      // Fetch combined assigned, goals, and rests from new backend route
      const res = await axios.get(`http://localhost:8000/ai/schedule?user_id=${userId}`)
      console.log("AI Schedule fetch response:", res.data);
      if (res.data) {
        setAiSchedule(res.data)
      }
    } catch (e) {
      console.error("AI Schedule fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))
  const hours = Array.from({ length: 13 }).map((_, i) => i + 8) // 8 AM to 8 PM

  const getTypeStyle = (type) => {
    switch(type) {
      case 'study': return 'bg-primary/20 border-primary/50 text-white shadow-primary/10'
      case 'class': return 'bg-accent/20 border-accent/50 text-white shadow-accent/10'
      case 'personal': return 'bg-secondary/20 border-secondary/50 text-white shadow-secondary/10'
      case 'social': return 'bg-warning/20 border-warning/50 text-white shadow-warning/10'
      case 'rest': return 'bg-success/20 border-success/50 text-white shadow-success/10'
      default: return 'bg-surfaceHover border-white/10 text-textMuted'
    }
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-primary" />
            AI Smart Calendar
          </h1>
          <p className="text-textMuted mt-1">Schedules dynamically adjusting to avoid burnout.</p>
        </div>
        
        <div className="flex bg-surfaceHover rounded-lg p-1 border border-white/5">
          <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-white/10 text-white shadow">Week</button>
          <button className="px-4 py-1.5 rounded-md text-sm font-medium text-textMuted hover:text-white">Day</button>
        </div>
      </header>

      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
        <Zap className="text-primary w-5 h-5 flex-shrink-0" />
        <p className="text-sm text-white"><span className="font-semibold text-primary">AI Re-scheduled:</span> Moved your History Essay from Tuesday night to Wednesday afternoon due to reported exhaustion levels.</p>
      </div>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
        {/* Calendar Header layout */}
        <div className="grid grid-cols-8 border-b border-white/5 bg-surface/50">
          <div className="p-4 text-center border-r border-white/5">
             <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Time</span>
          </div>
          {weekDays.map((day, i) => (
            <div key={i} className={`p-4 text-center border-r border-white/5 last:border-0 ${format(day, 'MM/dd') === format(currentDate, 'MM/dd') ? 'bg-primary/10' : ''}`}>
              <div className="text-xs font-bold text-textMuted uppercase">{format(day, 'EEE')}</div>
              <div className={`text-xl font-bold mt-1 ${format(day, 'MM/dd') === format(currentDate, 'MM/dd') ? 'text-primary' : 'text-white'}`}>{format(day, 'd')}</div>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto mac-scrollbar bg-background/50">
          <div className="grid grid-cols-8 relative border-t-0" style={{ height: `${hours.length * 60}px` }}>
            {/* Hour lines */}
            <div className="col-span-1 border-r border-white/5 bg-surface/50 flex flex-col">
              {hours.map(h => (
                <div key={h} className="h-[60px] border-b border-white/5 pr-4 pt-2 text-right text-xs text-textMuted">
                  {h}:00 {h >= 12 ? 'PM' : 'AM'}
                </div>
              ))}
            </div>

            {/* Grid cells */}
            <div className="col-span-7 grid grid-cols-7 relative">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={`col-${i}`} className="border-r border-white/5 last:border-0 relative h-full">
                  {hours.map(h => (
                    <div key={`cell-${i}-${h}`} className="h-[60px] border-b border-white/5 pointer-events-none" />
                  ))}
                  
                  {/* Render Events */}
                  {aiSchedule.filter(ev => ev.day === i).map((ev, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`absolute left-1 right-1 rounded-lg border p-2 shadow-lg backdrop-blur-md ${getTypeStyle(ev.type)} z-10 cursor-pointer hover:ring-2 hover:ring-white/20 transition-all`}
                      style={{ height: `${ev.height}px`, top: `${Math.max(0, ev.top - 480)}px` }}
                    >
                      <h4 className="text-xs font-semibold leading-tight">{ev.title}</h4>
                      <p className="text-[10px] mt-1 opacity-80">{ev.time}</p>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
