import { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '@/store/main'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, ArrowRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

const practiceMocks: Record<string, { pt: string; en: string }> = {
  the: { pt: 'O carro é azul.', en: 'The car is blue.' },
  is: { pt: 'Ele é alto.', en: 'He is tall.' },
  quick: { pt: 'A raposa rápida corre.', en: 'The quick fox runs.' },
  brown: { pt: 'A raposa é marrom.', en: 'The fox is brown.' },
  fox: { pt: 'A raposa pulou.', en: 'The fox jumped.' },
  jumps: { pt: 'O gato pula alto.', en: 'The cat jumps high.' },
  over: { pt: 'O avião voa sobre a cidade.', en: 'The plane flies over the city.' },
  lazy: { pt: 'O cachorro preguiçoso dorme.', en: 'The lazy dog sleeps.' },
  dog: { pt: 'O cachorro late.', en: 'The dog barks.' },
  serendipity: { pt: 'Foi um momento de serendipidade.', en: 'It was a moment of serendipity.' },
  ephemeral: { pt: 'A beleza é efêmera.', en: 'Beauty is ephemeral.' },
  ubiquitous: { pt: 'A tecnologia é onipresente hoje.', en: 'Technology is ubiquitous today.' },
}

export default function Practice() {
  const { words, updateWordStatus, settings, recordPracticeAttempt } = useStore()
  const navigate = useNavigate()

  const builderWords = useMemo(() => words.filter((w) => w.status === 'builder'), [words])
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentWord = builderWords[currentIndex]

  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [practiceData, setPracticeData] = useState<{ pt: string; en: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchedId = useRef<string | null>(null)

  useEffect(() => {
    if (!currentWord || fetchedId.current === currentWord.id) return

    fetchedId.current = currentWord.id
    setIsLoading(true)
    setAnswer('')
    setStatus('idle')

    const fetchPractice = async () => {
      if (!settings.apiKey) {
        setTimeout(() => {
          setPracticeData(
            practiceMocks[currentWord.word.toLowerCase()] || {
              pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
              en: `I saw a ${currentWord.word} today.`,
            },
          )
          setIsLoading(false)
        }, 500)
        return
      }

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  'Você é um professor de inglês. Usando a frase de contexto original como base, crie uma frase simples em inglês (máx 8 palavras) focada na palavra alvo. A frase deve ser idêntica ou muito parecida com o contexto, mas simplificada se necessário. Forneça também a tradução natural e exata em português. Retorne apenas JSON: {"pt": "frase em português", "en": "frase em inglês"}',
              },
              {
                role: 'user',
                content: `Palavra alvo: "${currentWord.word}"\nTradução: "${currentWord.translation}"\nContexto original: "${currentWord.contextSentence}"`,
              },
            ],
            response_format: { type: 'json_object' },
          }),
        })
        const data = await response.json()
        if (data.error) throw new Error(data.error.message)
        const result = JSON.parse(data.choices[0].message.content)
        setPracticeData(result)
      } catch (err) {
        console.error(err)
        setPracticeData(
          practiceMocks[currentWord.word.toLowerCase()] || {
            pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
            en: `I saw a ${currentWord.word} today.`,
          },
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchPractice()
  }, [currentWord, settings.apiKey, settings.aiModel])

  const checkAnswer = () => {
    if (!practiceData) return
    const normalize = (str: string) =>
      str
        .trim()
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
    const cleanInput = normalize(answer)
    const cleanExpected = normalize(practiceData.en)

    if (cleanInput === cleanExpected) {
      setStatus('correct')
      recordPracticeAttempt(true)
    } else {
      setStatus('incorrect')
      recordPracticeAttempt(false)
    }
  }

  const handleNext = () => {
    if (status === 'correct') {
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
            Prática Rápida
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Traduza as frases para interiorizar a estrutura.
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
              Gerando exercício ideal...
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full z-10">
            <div className="mb-8">
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold text-sm border border-primary/20 uppercase tracking-wider inline-block mb-6">
                Traduza para o inglês
              </span>
              <p className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
                {practiceData.pt}
              </p>
            </div>

            <div className="space-y-6 mt-auto">
              <Input
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value)
                  if (status !== 'idle') setStatus('idle')
                }}
                placeholder="Digite a tradução exata em inglês..."
                className={cn(
                  'h-16 text-xl px-6 transition-all duration-300 rounded-2xl border-2',
                  status === 'incorrect'
                    ? 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive text-foreground bg-destructive/5'
                    : status === 'correct'
                      ? 'border-success focus-visible:ring-success focus-visible:border-success bg-success/5 text-success-foreground font-medium'
                      : 'bg-background/80 border-border/60 focus-visible:border-primary',
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (status === 'correct') handleNext()
                    else if (answer.trim()) checkAnswer()
                  }
                }}
                autoFocus
              />

              <div className="min-h-[80px]">
                {status === 'incorrect' && (
                  <div className="text-destructive flex items-start gap-4 bg-destructive/10 border border-destructive/20 p-5 rounded-2xl animate-fade-in-up">
                    <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="font-bold text-lg">Tradução incorreta</p>
                      <p className="text-base opacity-90">
                        A frase exata esperada era:{' '}
                        <strong className="font-semibold bg-background px-2 py-0.5 rounded-md">
                          "{practiceData.en}"
                        </strong>
                      </p>
                      <p className="text-sm opacity-75 mt-2 font-medium">
                        Verifique a estrutura e tente novamente.
                      </p>
                    </div>
                  </div>
                )}

                {status === 'correct' && (
                  <div className="text-success-foreground flex items-center gap-4 bg-success/10 border border-success/20 p-5 rounded-2xl animate-fade-in-up">
                    <CheckCircle2 className="w-7 h-7 shrink-0 text-success" />
                    <span className="font-bold text-lg text-success">
                      Excelente! Tradução validada com sucesso.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                {status === 'correct' ? (
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="w-full h-16 text-lg rounded-2xl group bg-success hover:bg-success/90 text-success-foreground shadow-[0_0_20px_rgba(22,163,74,0.3)] animate-fade-in"
                  >
                    {currentIndex < builderWords.length - 1 ? 'Próxima Palavra' : 'Concluir Sessão'}{' '}
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button
                    onClick={checkAnswer}
                    size="lg"
                    className="w-full h-16 text-lg rounded-2xl shadow-md"
                    disabled={!answer.trim()}
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
