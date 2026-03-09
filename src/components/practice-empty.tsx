import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Zap, ArrowRight } from 'lucide-react'

export function PracticeEmpty() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in space-y-6">
      <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-2 border border-primary/20 shadow-sm">
        <Zap className="w-16 h-16 text-primary" />
      </div>
      <h2 className="text-4xl font-bold text-foreground tracking-tight">Sessão Concluída!</h2>
      <p className="text-muted-foreground max-w-md text-xl">
        Você completou todas as palavras na fila de prática. Vá para a Biblioteca capturar novos
        termos.
      </p>
      <Button
        size="lg"
        className="mt-4 text-base h-14 px-8 rounded-xl"
        onClick={() => navigate('/reader')}
      >
        Ir para a Biblioteca <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  )
}
