import { Card } from '@/components/ui/card'
import { BrainCircuit, Zap, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/main'

export function RetentionOverview() {
  const navigate = useNavigate()
  const { words } = useStore()

  const now = Date.now()
  const reviewsDue = words.filter((w) => w.status === 'srs' && w.nextReviewDate <= now).length
  const newContent = words.filter((w) => w.status === 'builder').length

  return (
    <Card className="p-6 bg-card border-border shadow-sm flex flex-col justify-between rounded-[24px] hover:shadow-md transition-all duration-300">
      <div>
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-5">
          Retenção & Revisão
        </h3>
        <div className="space-y-3">
          <div
            onClick={() => navigate('/practice')}
            className="flex items-center justify-between p-4 bg-orange-500/10 rounded-2xl cursor-pointer hover:bg-orange-500/20 transition-all duration-300 group border border-orange-500/20 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-card rounded-xl shadow-sm border border-orange-500/20 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground leading-tight">Revisões Pendentes</span>
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground mt-0.5">
                  PARA HOJE
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-orange-600 tracking-tight">
                {reviewsDue}
              </span>
              <ArrowRight className="w-4 h-4 text-orange-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          <div
            onClick={() => navigate('/practice')}
            className="flex items-center justify-between p-4 bg-primary/10 rounded-2xl cursor-pointer hover:bg-primary/20 transition-all duration-300 group border border-primary/20 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-card rounded-xl shadow-sm border border-primary/20 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground leading-tight">Novo Conteúdo</span>
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground mt-0.5">
                  NA FILA
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-primary tracking-tight">{newContent}</span>
              <ArrowRight className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
