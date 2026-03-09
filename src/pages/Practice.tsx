import { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '@/store/main'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, ArrowRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

const practiceMocks: Record<string, { pt: string; en: string }> = {
  serendipity: { pt: 'Foi um momento de serendipidade.', en: 'It was a moment of serendipity.' },
  ephemeral: { pt: 'A beleza é efêmera.', en: 'Beauty is ephemeral.' },
}

interface Block {
  id: number
  text: string
}

export default function Practice() {
  const { words, updateWordStatus, settings, recordPracticeAttempt } = useStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const builderWords = useMemo(() => words.filter((w) => w.status === 'builder'), [words])
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentWord = builderWords[currentIndex]

  const [practiceData, setPracticeData] = useState<{ pt: string; en: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Builder States
  const [shuffledBlocks, setShuffledBlocks] = useState<Block[]>([])
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle')
  const [feedback, setFeedback] = useState<boolean[]>([])

  const fetchedId = useRef<string | null>(null)

  useEffect(() => {
    if (!currentWord || fetchedId.current === currentWord.id) return

    fetchedId.current = currentWord.id
    setIsLoading(true)
    setStatus('idle')
    setAttempts(0)
    setSelectedIndices([])
    setFeedback([])

    const fetchPractice = async () => {
      let result = null

      if (!settings.apiKey) {
        setTimeout(() => {
          result = practiceMocks[currentWord.word.toLowerCase()] || {
            pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
            en: `I saw a ${currentWord.word} today.`,
          }
          setupBlocks(result)
        }, 800)
        return
      }

      try {
        if (settings.aiProvider === 'gemini') {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${
              settings.aiModel || 'gemini-1.5-flash'
            }:generateContent?key=${settings.apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Você é um professor de inglês. Usando a frase de contexto original, crie uma frase simples em inglês focada na palavra alvo. Forneça também a tradução em português. Retorne apenas JSON: {"pt": "frase em português", "en": "frase em inglês"}\nPalavra alvo: "${currentWord.word}"\nContexto: "${currentWord.contextSentence}"`,
                      },
                    ],
                  },
                ],
                generationConfig: { responseMimeType: 'application/json' },
              }),
            },
          )
          const data = await res.json()
          if (data.error) throw new Error(data.error.message)
          result = JSON.parse(data.candidates[0].content.parts[0].text)
        } else {
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
                    'Você é um professor de inglês. Usando a frase de contexto original, crie uma frase simples em inglês focada na palavra alvo. Forneça também a tradução natural e exata em português. Retorne apenas JSON: {"pt": "frase em português", "en": "frase em inglês"}',
                },
                {
                  role: 'user',
                  content: `Palavra: "${currentWord.word}"\nTradução: "${currentWord.translation}"\nContexto: "${currentWord.contextSentence}"`,
                },
              ],
              response_format: { type: 'json_object' },
            }),
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error.message)
          result = JSON.parse(data.choices[0].message.content)
        }
      } catch (err) {
        console.error(err)
        result = practiceMocks[currentWord.word.toLowerCase()] || {
          pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
          en: `I saw a ${currentWord.word} today.`,
        }
      }

      setupBlocks(result)
    }

    const setupBlocks = (data: { pt: string; en: string }) => {
      setPracticeData(data)
      const words = data.en.split(' ').filter(Boolean)
      const blocks: Block[] = words.map((text, i) => ({ id: i, text }))
      setShuffledBlocks([...blocks].sort(() => Math.random() - 0.5))
      setIsLoading(false)
    }

    fetchPractice()
  }, [currentWord, settings.apiKey, settings.aiModel, settings.aiProvider])

  const toggleSelect = (id: number) => {
    if (status !== 'idle' && status !== 'checking') return
    if (selectedIndices.includes(id)) {
      setSelectedIndices(selectedIndices.filter((x) => x !== id))
    } else {
      setSelectedIndices([...selectedIndices, id])
    }
    if (status === 'checking') setStatus('idle')
  }

  const checkAnswer = () => {
    if (!practiceData) return
    const targetWords = practiceData.en.split(' ').filter(Boolean)

    if (selectedIndices.length !== targetWords.length) {
      toast({
        title: 'Faltam blocos',
        description: 'Utilize todas as palavras para montar a frase.',
        variant: 'destructive',
      })
      return
    }

    let isCorrect = true
    const newFeedback = selectedIndices.map((id, i) => {
      const blockText = shuffledBlocks.find((b) => b.id === id)!.text
      const correct =
        blockText.toLowerCase().replace(/[.,!?]/g, '') ===
        targetWords[i].toLowerCase().replace(/[.,!?]/g, '')
      if (!correct) isCorrect = false
      return correct
    })

    setFeedback(newFeedback)

    if (isCorrect) {
      setStatus('correct')
      recordPracticeAttempt(true)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= 3) {
        setStatus('incorrect')
        recordPracticeAttempt(false)
      } else {
        setStatus('checking')
        setTimeout(() => {
          setStatus('idle')
          setFeedback([])
          setSelectedIndices([])
        }, 1500)
      }
    }
  }

  const handleNext = () => {
    if (status === 'correct' || status === 'incorrect') {
      updateWordStatus(currentWord.id, 'srs')
    }
    if (currentIndex >= builderWords.length - 1) {
      setCurrentIndex(0)
    }
  }

  if (builderWords.length === 0) {
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

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto h-full flex flex-col pt-4">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            Sentence Builder
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Monte a frase correta ordenando os blocos.
          </p>
        </div>
        <div className="text-sm font-medium bg-card px-4 py-2 rounded-full border border-border shadow-sm text-foreground">
          {currentIndex + 1} de {builderWords.length}
        </div>
      </header>

      <Card className="flex-1 p-8 md:p-12 flex flex-col border-2 border-border/50 shadow-sm bg-card/80 backdrop-blur-sm relative overflow-hidden">
        {isLoading || !practiceData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium text-lg animate-pulse">
              Gerando exercício ideal com IA...
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full z-10">
            <div className="mb-8 text-center">
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold text-sm border border-primary/20 uppercase tracking-wider inline-block mb-6">
                Construa a frase em inglês
              </span>
              <p className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
                {practiceData.pt}
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-end space-y-6">
              {/* Drop Zone */}
              <div
                className={cn(
                  'min-h-[100px] p-6 rounded-3xl border-2 flex flex-wrap gap-3 items-center transition-colors',
                  selectedIndices.length === 0
                    ? 'border-dashed border-border/80 bg-secondary/20'
                    : 'border-solid border-primary/30 bg-primary/5',
                )}
              >
                {selectedIndices.length === 0 && (
                  <span className="text-muted-foreground/60 italic px-2 font-medium w-full text-center">
                    Clique nos blocos abaixo para inseri-los aqui...
                  </span>
                )}
                {selectedIndices.map((id, i) => {
                  const block = shuffledBlocks.find((b) => b.id === id)!
                  let stateClass = 'bg-background border-border shadow-sm text-foreground'

                  if (status === 'checking') {
                    stateClass = feedback[i]
                      ? 'bg-success text-success-foreground border-success shadow-[0_0_15px_rgba(22,163,74,0.3)]'
                      : 'bg-destructive text-destructive-foreground border-destructive shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  } else if (status === 'correct') {
                    stateClass =
                      'bg-success text-success-foreground border-success shadow-[0_0_15px_rgba(22,163,74,0.3)]'
                  } else if (status === 'incorrect') {
                    stateClass = 'bg-destructive/10 text-destructive border-destructive/30'
                  }

                  return (
                    <button
                      key={id}
                      onClick={() => toggleSelect(id)}
                      className={cn(
                        'px-5 py-3 rounded-xl font-bold text-lg border-2 transition-all active:scale-95 cursor-pointer',
                        stateClass,
                      )}
                    >
                      {block.text}
                    </button>
                  )
                })}
              </div>

              {/* Status Message for failure */}
              {status === 'incorrect' && (
                <div className="text-destructive flex items-start gap-4 bg-destructive/10 border border-destructive/20 p-5 rounded-2xl animate-fade-in-up">
                  <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="font-bold text-lg">Tentativas esgotadas</p>
                    <p className="text-base opacity-90">
                      A frase correta era:{' '}
                      <strong className="font-semibold bg-background px-3 py-1 rounded-md ml-1 shadow-sm border border-border/50">
                        {practiceData.en}
                      </strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Status Message for success */}
              {status === 'correct' && (
                <div className="text-success-foreground flex items-center gap-4 bg-success/10 border border-success/20 p-5 rounded-2xl animate-fade-in-up">
                  <CheckCircle2 className="w-7 h-7 shrink-0 text-success" />
                  <span className="font-bold text-lg text-success">
                    Excelente! Construção perfeita.
                  </span>
                </div>
              )}

              {/* Available Blocks */}
              <div className="flex flex-wrap justify-center gap-3 py-6">
                {shuffledBlocks.map((block) => {
                  const isSelected = selectedIndices.includes(block.id)
                  return (
                    <button
                      key={block.id}
                      onClick={() => toggleSelect(block.id)}
                      disabled={isSelected || status === 'correct' || status === 'incorrect'}
                      className={cn(
                        'px-6 py-3 rounded-xl font-bold text-lg transition-all border-2 active:scale-95',
                        isSelected
                          ? 'bg-secondary/50 text-transparent border-transparent shadow-none scale-95 pointer-events-none'
                          : 'bg-card border-border shadow-sm hover:bg-secondary text-foreground hover:-translate-y-1 hover:shadow-md cursor-pointer',
                      )}
                    >
                      {block.text}
                    </button>
                  )
                })}
              </div>

              <div className="pt-4 border-t border-border mt-auto">
                {status === 'correct' || status === 'incorrect' ? (
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className={cn(
                      'w-full h-16 text-lg rounded-2xl group shadow-md animate-fade-in',
                      status === 'correct'
                        ? 'bg-success hover:bg-success/90 text-success-foreground shadow-[0_0_20px_rgba(22,163,74,0.3)]'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground',
                    )}
                  >
                    {currentIndex < builderWords.length - 1 ? 'Próxima Palavra' : 'Concluir Sessão'}{' '}
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button
                    onClick={checkAnswer}
                    size="lg"
                    className="w-full h-16 text-lg rounded-2xl shadow-md"
                    disabled={selectedIndices.length === 0}
                  >
                    Verificar Resposta
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
