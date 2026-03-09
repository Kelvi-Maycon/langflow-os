import { Card } from '@/components/ui/card'
import { ArrowRight, Check, Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const steps = [
  { id: 1, label: 'BÁSICO I', status: 'completed' },
  { id: 2, label: 'BÁSICO II', status: 'completed' },
  { id: 3, label: 'INTERMEDIÁRIO', status: 'current', tooltip: 'NÍVEL ATUAL B1' },
  { id: 4, label: 'AVANÇADO', status: 'locked' },
  { id: 5, label: 'MESTRE', status: 'locked' },
]

export function ProgressionRoadmap() {
  const { toast } = useToast()

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground tracking-tight">Jornada de Maestria</h3>
        <button
          onClick={() =>
            toast({
              title: 'Jornada Completa',
              description: 'O mapa interativo será liberado ao concluir o nível Intermediário.',
            })
          }
          className="text-sm font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1 transition-all duration-250 ease-out p-2 rounded-lg hover:bg-pink-500/10 active:scale-95"
        >
          Ver Mapa Completo <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      <Card className="p-8 bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-300 rounded-[24px] overflow-x-auto">
        <div className="min-w-[600px] relative flex items-center justify-between pt-8 pb-4">
          {/* Connecting Line */}
          <div className="absolute top-[48px] left-[10%] right-[10%] h-[4px] bg-secondary border border-border/40 -z-10 rounded-full">
            <div className="h-full bg-gradient-to-r from-pink-400 to-pink-500/30 w-1/2 rounded-full transition-all duration-1000 ease-out" />
          </div>

          {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col items-center gap-4 relative z-10 w-24 group"
            >
              {step.tooltip && (
                <div className="absolute -top-12 bg-foreground text-background text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md whitespace-nowrap animate-fade-in-up">
                  {step.tooltip}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
                </div>
              )}

              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-transform duration-300 ease-out group-hover:scale-110 ${
                  step.status === 'completed'
                    ? 'bg-foreground border-foreground text-background shadow-md'
                    : step.status === 'current'
                      ? 'bg-pink-500 border-pink-500/30 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] scale-125 group-hover:scale-[1.35]'
                      : 'bg-card border-border text-muted-foreground/60 shadow-sm'
                }`}
              >
                {step.status === 'completed' && <Check className="w-5 h-5" />}
                {step.status === 'current' && (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                )}
                {step.status === 'locked' && <Lock className="w-4 h-4" />}
              </div>

              <span
                className={`text-[11px] font-bold tracking-wider transition-colors duration-300 ${
                  step.status === 'current'
                    ? 'text-pink-600'
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
