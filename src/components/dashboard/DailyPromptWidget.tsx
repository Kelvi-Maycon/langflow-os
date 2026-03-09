import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/store/main'
import { useToast } from '@/hooks/use-toast'
import { PenTool, CheckCircle2, Sparkles } from 'lucide-react'

const DAILY_PROMPTS = [
  {
    word: 'Resilient',
    prompt: 'Write about a time you had to be strong and overcome a difficulty.',
  },
  { word: 'Ephemeral', prompt: 'Describe something beautiful that is temporary and fleeting.' },
  { word: 'Serendipity', prompt: 'Tell a story about a happy accident or unexpected good luck.' },
  { word: 'Eloquent', prompt: 'Describe someone whose words move people deeply.' },
  { word: 'Nostalgia', prompt: 'Write about a memory that brings a bittersweet feeling.' },
  { word: 'Vibrant', prompt: 'Describe a scene full of life and vivid colors.' },
  { word: 'Meticulous', prompt: 'Explain a process that requires extreme attention to detail.' },
]

export function DailyPromptWidget() {
  const { stats, submitDailyPrompt } = useStore()
  const { toast } = useToast()
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const dayOfYear = useMemo(() => {
    const today = new Date()
    return Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24,
    )
  }, [])

  const challenge = useMemo(() => DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length], [dayOfYear])

  const todaysSubmission = stats.dailyPromptsHistory?.find((h) => h.date === todayStr)

  const handleSubmit = () => {
    if (text.trim().length < 10) {
      toast({
        title: 'Texto muito curto',
        description: 'Escreva um pouco mais para completar o desafio.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      const success = submitDailyPrompt(text, challenge.prompt, challenge.word)
      setIsSubmitting(false)

      if (success) {
        toast({
          title: '✨ Desafio Concluído!',
          description: 'Você ganhou +50 XP e progrediu nas missões!',
        })
      } else {
        toast({
          title: 'Palavra ausente',
          description: `Certifique-se de usar a palavra "${challenge.word}" na sua resposta.`,
          variant: 'destructive',
        })
      }
    }, 600)
  }

  if (todaysSubmission) {
    return (
      <Card className="p-6 md:p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20 shadow-sm rounded-[24px] hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <CheckCircle2 className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Desafio do Dia Concluído!</h3>
            <p className="text-sm text-muted-foreground">
              Você usou a palavra{' '}
              <span className="font-bold text-indigo-500">{challenge.word}</span> brilhantemente.
            </p>
          </div>
        </div>
        <div className="p-5 bg-background/60 rounded-xl border border-indigo-500/10 italic text-muted-foreground shadow-inner relative">
          <div className="absolute top-2 left-2 text-indigo-500/20 text-4xl leading-none font-serif">
            "
          </div>
          <p className="relative z-10 pl-4">{todaysSubmission.response}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 md:p-8 bg-gradient-to-br from-indigo-500/10 via-card to-purple-500/5 border-indigo-500/20 shadow-sm rounded-[24px] relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors duration-700" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl shadow-inner border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
              <PenTool className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                Daily Prompt <Sparkles className="w-4 h-4 text-indigo-500" />
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Pratique sua escrita criativa hoje
              </p>
            </div>
          </div>
          <div className="bg-indigo-500/10 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-500/20 whitespace-nowrap hidden sm:block">
            +50 XP
          </div>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-background/50 border border-border/50">
          <p className="text-foreground font-medium mb-3 text-lg leading-relaxed">
            {challenge.prompt}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Palavra obrigatória:
            <span className="font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-md tracking-wide">
              {challenge.word}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Escreva sua resposta aqui. Tente elaborar pelo menos duas frases para um melhor contexto..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[120px] bg-background/50 border-indigo-500/20 focus-visible:ring-indigo-500 text-base resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              {text.length} caracteres
            </span>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !text.trim()}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-8 shadow-[0_4px_14px_0_rgba(99,102,241,0.25)] h-12 text-base font-bold w-full sm:w-auto"
            >
              {isSubmitting ? 'Avaliando...' : 'Enviar Resposta'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
