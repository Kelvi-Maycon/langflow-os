import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Target, CheckCircle2, Pencil, X, Check } from 'lucide-react'
import { useStore } from '@/store/main'

export function DailyGoalWidget() {
  const { words, settings, updateSettings } = useStore()
  const [isEditing, setIsEditing] = useState(false)
  const [goalStr, setGoalStr] = useState((settings.dailyGoal || 20).toString())

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const wordsLearnedToday = words.filter((w) => w.createdAt >= startOfToday.getTime()).length

  const goal = settings.dailyGoal || 20
  const progress = Math.min((wordsLearnedToday / goal) * 100, 100)
  const isReached = wordsLearnedToday >= goal && goal > 0

  const handleSave = () => {
    const val = parseInt(goalStr, 10)
    if (!isNaN(val) && val > 0) {
      updateSettings({ dailyGoal: val })
    } else {
      setGoalStr(goal.toString())
    }
    setIsEditing(false)
  }

  return (
    <Card
      className={`p-6 bg-card border-border shadow-sm flex flex-col justify-between rounded-[24px] transition-all duration-300 relative overflow-hidden group ${isReached ? 'bg-success/10 border-success/30' : 'hover:shadow-md'}`}
    >
      {isReached && (
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-success/20 rounded-full blur-2xl pointer-events-none transition-colors duration-700" />
      )}
      {!isReached && (
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-colors duration-700" />
      )}

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Meta Diária
            </h3>
            <div
              className={`p-2 rounded-full border ${isReached ? 'bg-success/20 border-success/30' : 'bg-primary/10 border-primary/20'}`}
            >
              <Target className={`w-4 h-4 ${isReached ? 'text-success' : 'text-primary'}`} />
            </div>
          </div>

          <div className="flex items-end gap-2 mb-8 h-12">
            <span className="text-5xl font-black text-foreground tracking-tighter leading-none">
              {wordsLearnedToday}
            </span>
            {isEditing ? (
              <div className="flex items-center gap-1 pb-1">
                <span className="text-xl font-bold text-muted-foreground">/</span>
                <Input
                  value={goalStr}
                  onChange={(e) => setGoalStr(e.target.value)}
                  className="w-16 h-8 text-center font-bold px-1 text-sm bg-background border-border shadow-inner"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <button
                  onClick={handleSave}
                  className="p-1.5 hover:bg-success/20 text-success rounded-md transition-colors ml-1 bg-secondary border border-border"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setGoalStr(goal.toString())
                  }}
                  className="p-1.5 hover:bg-destructive/20 text-destructive rounded-md transition-colors bg-secondary border border-border"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 pb-1.5 group/edit cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  / {goal} NOVAS
                </span>
                <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Progress
            value={progress}
            className={`h-2.5 ${isReached ? '[&>div]:bg-success shadow-[0_0_10px_rgba(34,197,94,0.3)]' : '[&>div]:bg-primary'}`}
          />
          <div className="flex justify-between items-center min-h-[16px]">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Progresso
            </span>
            {isReached && (
              <span className="text-[10px] font-bold text-success flex items-center gap-1 uppercase tracking-wider animate-in fade-in zoom-in">
                <CheckCircle2 className="w-3 h-3" /> Alcançada!
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
