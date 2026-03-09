import { Button } from '@/components/ui/button'
import { Play, Map } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export function HeroWelcome() {
  const navigate = useNavigate()
  const { toast } = useToast()

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-card border border-border p-8 md:p-12 shadow-sm hover:shadow-md transition-all duration-300 ease-out flex flex-col md:flex-row items-center justify-between gap-8 group">
      {/* Background glowing effects - soft and light-mode friendly */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/15 transition-colors duration-700" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex-1 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border/60 text-xs font-bold tracking-wider text-muted-foreground mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          SESSÃO RECOMENDADA
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
          Pronto para <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-primary">
            Domínio Fluente?
          </span>
        </h2>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Você está a 85% do seu objetivo semanal. Mantenha o foco para desbloquear o Certificado
          B2.
        </p>

        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => navigate('/practice')}
            size="lg"
            className="rounded-full bg-pink-500 hover:bg-pink-600 text-white border-0 h-14 px-8 text-base font-bold shadow-[0_4px_14px_0_rgba(236,72,153,0.25)] transition-all duration-300 hover:scale-[1.04] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 mr-2 fill-current" /> Continuar Jornada
          </Button>
          <Button
            onClick={() =>
              toast({
                title: 'Mapa de Fluência',
                description: 'Acessando a visualização completa da sua jornada de aprendizado...',
              })
            }
            size="lg"
            variant="outline"
            className="rounded-full bg-background border-border hover:bg-secondary hover:text-foreground h-14 px-8 text-base font-bold transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] shadow-sm"
          >
            <Map className="w-5 h-5 mr-2" /> Ver Caminho
          </Button>
        </div>
      </div>

      <div className="relative z-10 hidden md:flex items-center justify-center w-64 h-64">
        {/* Abstract decorative element representing the badge/medal */}
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-primary/10 rounded-[40px] rotate-12 blur-sm" />
        <div className="absolute inset-0 bg-card border border-border/80 rounded-[40px] -rotate-6 shadow-md flex items-center justify-center transition-transform duration-500 group-hover:rotate-0">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-primary flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.2)] group-hover:scale-110 transition-transform duration-500">
            <svg
              viewBox="0 0 24 24"
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
