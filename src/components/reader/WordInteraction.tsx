import { useState, useEffect, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, Loader2 } from 'lucide-react'
import { useStore } from '@/store/main'
import { useToast } from '@/hooks/use-toast'

interface WordInteractionProps {
  word: string
  sentence: string
  onCapture: (word: string, translation: string, sentence: string) => void
}

const mockDictionary: Record<string, { translation: string; explanation: string }> = {
  the: {
    translation: 'o, a, os, as',
    explanation: 'Artigo definido usado para indicar um substantivo específico.',
  },
  is: { translation: 'é, está', explanation: 'Terceira pessoa do singular do verbo "to be".' },
  quick: {
    translation: 'rápido',
    explanation: 'Adjetivo que descreve algo que se move com velocidade.',
  },
  brown: {
    translation: 'marrom',
    explanation: 'Cor resultante da mistura de vermelho, amarelo e preto.',
  },
  fox: { translation: 'raposa', explanation: 'Mamífero carnívoro da família dos canídeos.' },
  jumps: { translation: 'pula', explanation: 'Terceira pessoa do singular do verbo "to jump".' },
  over: { translation: 'sobre', explanation: 'Preposição que indica posição superior.' },
  lazy: {
    translation: 'preguiçoso',
    explanation: 'Adjetivo para descrever alguém que evita esforço.',
  },
  dog: {
    translation: 'cachorro',
    explanation: 'Mamífero doméstico frequentemente mantido como pet.',
  },
  serendipity: {
    translation: 'serendipidade',
    explanation: 'Ocorrência de eventos por acaso de maneira feliz.',
  },
  ephemeral: {
    translation: 'efêmero',
    explanation: 'Algo que dura por um tempo muito curto; transitório.',
  },
  ubiquitous: {
    translation: 'onipresente',
    explanation: 'Presente ou encontrado em todos os lugares.',
  },
}

export function WordInteraction({ word, sentence, onCapture }: WordInteractionProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [wordData, setWordData] = useState<{ translation: string; explanation: string } | null>(
    null,
  )

  const { settings } = useStore()
  const { toast } = useToast()

  const cleanWord = word.replace(/[^\w-]/g, '').toLowerCase()
  const fetched = useRef(false)

  useEffect(() => {
    if (open && !wordData && !fetched.current) {
      setIsLoading(true)
      fetched.current = true

      const fetchDefinition = async () => {
        if (!settings.apiKey) {
          setTimeout(() => {
            setWordData(
              mockDictionary[cleanWord] || {
                translation: `tradução de "${cleanWord}"`,
                explanation: `(Modo Offline) Análise simulada. Configure sua API Key para usar o modelo ${settings.aiModel || 'gpt-4o-mini'} em tempo real.`,
              },
            )
            setIsLoading(false)
          }, 600)
          return
        }

        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${settings.apiKey}`,
            },
            body: JSON.stringify({
              model: settings.aiModel || 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content:
                    'Você é um dicionário inteligente de inglês. Analise a palavra alvo dentro do contexto da frase fornecida. Retorne a tradução mais adequada para este contexto específico e uma breve explicação em português do papel e significado da palavra na frase. Responda apenas com JSON válido: {"translation": "...", "explanation": "..."}',
                },
                {
                  role: 'user',
                  content: `Palavra: "${cleanWord}"\nFrase de contexto: "${sentence}"`,
                },
              ],
              response_format: { type: 'json_object' },
            }),
          })

          const data = await res.json()
          if (data.error) throw new Error(data.error.message)

          const result = JSON.parse(data.choices[0].message.content)
          setWordData({
            translation: result.translation || cleanWord,
            explanation: result.explanation || 'Sem explicação disponível.',
          })
        } catch (error) {
          console.error(error)
          setWordData({
            translation: 'Erro na tradução',
            explanation:
              'Não foi possível conectar à IA. Verifique sua API Key e a conexão com a internet.',
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchDefinition()
    }
  }, [open, cleanWord, sentence, settings.apiKey, settings.aiModel, wordData])

  if (!cleanWord) return <span>{word}</span>

  const handleCaptureClick = () => {
    if (wordData) {
      onCapture(cleanWord, wordData.translation, sentence.trim())
      setOpen(false)
      toast({
        title: 'Palavra capturada',
        description: `"${cleanWord}" foi adicionada à sua lista com sucesso.`,
      })
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          fetched.current = false
        }
      }}
    >
      <PopoverTrigger asChild>
        <span className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors rounded px-1 py-0.5 mx-0.5 inline-block border-b-2 border-transparent hover:border-primary/40 data-[state=open]:bg-primary/20 data-[state=open]:text-primary">
          {word}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={6}
        className="w-[280px] p-4 shadow-xl border-border/60 bg-popover rounded-xl z-50"
      >
        {isLoading || !wordData ? (
          <div className="py-6 flex justify-center items-center flex-col gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm font-medium animate-pulse">Consultando modelo...</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-lg leading-none text-foreground">{cleanWord}</h4>
                <p className="text-sm text-primary font-medium mt-1.5">{wordData.translation}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg leading-relaxed border border-border/50">
              {wordData.explanation}
            </div>

            <Button
              size="sm"
              className="w-full mt-2 shadow-sm h-9 text-sm font-semibold gap-2"
              onClick={handleCaptureClick}
              disabled={wordData.translation === 'Erro na tradução'}
            >
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
