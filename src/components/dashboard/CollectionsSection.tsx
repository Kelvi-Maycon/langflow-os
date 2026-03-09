import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function CollectionsSection() {
  const { toast } = useToast()

  return (
    <section className="space-y-6 pb-8">
      <header className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground tracking-tight">Suas Coleções</h3>
        <button
          onClick={() =>
            toast({
              title: 'Nova Coleção',
              description: 'Abrindo o menu de criação de coleções...',
            })
          }
          className="w-8 h-8 rounded-full border border-border bg-card shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-250 ease-out active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          onClick={() =>
            toast({
              title: 'Acessando Coleção',
              description: 'Carregando os 124 flashcards de Viagem para Londres.',
            })
          }
          className="p-6 bg-card border-border shadow-sm rounded-[24px] group cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md hover:border-primary/30 active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 mb-4 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <span className="text-2xl">✈️</span>
          </div>
          <h4 className="font-bold text-lg text-foreground group-hover:text-blue-600 transition-colors">
            Viagem para Londres
          </h4>
          <p className="text-sm text-muted-foreground mt-1">124 palavras • 80% retido</p>
        </Card>

        <Card
          onClick={() =>
            toast({
              title: 'Nova Coleção',
              description: 'Iniciando assistente de criação com IA...',
            })
          }
          className="p-6 bg-secondary/30 border-border shadow-sm rounded-[24px] group cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md hover:border-border/80 border-dashed active:scale-[0.98]"
        >
          <div className="h-full min-h-[100px] flex flex-col items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
            <div className="w-10 h-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-medium text-sm">Criar nova coleção</span>
          </div>
        </Card>
      </div>
    </section>
  )
}
