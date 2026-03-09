import { useState, useMemo, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Play, FileText, CheckCircle2, Settings2, ArrowRight } from 'lucide-react'
import { WordInteraction } from '@/components/reader/WordInteraction'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/store/main'
import { useNavigate } from 'react-router-dom'

const defaultText = `The quick brown fox jumps over the lazy dog. 
This is a serendipity moment where you can learn new words.
Reading ephemeral texts ubiquitous on the internet helps improve your active vocabulary.`

interface CapturedWord {
  word: string
  translation: string
  sentence: string
}

export default function Reader() {
  const [inputText, setInputText] = useState(defaultText)
  const [isReadingMode, setIsReadingMode] = useState(false)
  const [capturedWords, setCapturedWords] = useState<CapturedWord[]>([])

  const { settings, updateSettings, words: globalWords, addWord } = useStore()
  const navigate = useNavigate()

  const handleCapture = useCallback((word: string, translation: string, sentence: string) => {
    setCapturedWords((prev) => {
      if (prev.some((w) => w.word === word)) return prev
      return [...prev, { word, translation, sentence }]
    })
  }, [])

  const handleNextPhase = () => {
    capturedWords.forEach((cw) => {
      const exists = globalWords.some((w) => w.word.toLowerCase() === cw.word.toLowerCase())
      if (!exists) {
        addWord({
          word: cw.word,
          translation: cw.translation,
          contextSentence: cw.sentence,
          status: 'builder',
        })
      }
    })
    navigate('/practice')
  }

  const processedContent = useMemo(() => {
    if (!isReadingMode) return null

    const sentences = inputText.match(/[^.!?]+[.!?]+/g) || [inputText]

    return sentences.map((sentence, sIdx) => {
      const tokens = sentence.split(/([\s.,!?;:]+)/)

      return (
        <span key={sIdx} className="mr-1 leading-[2.2]">
          {tokens.map((token, tIdx) => {
            if (/^[\s.,!?;:]+$/.test(token)) {
              return <span key={tIdx}>{token}</span>
            }
            return (
              <WordInteraction
                key={`${sIdx}-${tIdx}`}
                word={token}
                sentence={sentence}
                onCapture={handleCapture}
              />
            )
          })}
        </span>
      )
    })
  }, [inputText, isReadingMode, handleCapture])

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto h-full flex flex-col">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leitor Imersivo</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Cole um texto em inglês, leia e clique nas palavras que não conhece.
          </p>
        </div>

        {isReadingMode && (
          <div className="flex items-center gap-2 bg-secondary/40 p-1.5 rounded-xl border border-border animate-fade-in shadow-sm shrink-0">
            <Settings2 className="w-4 h-4 text-primary ml-2" />
            <Select
              value={settings.aiModel || 'gpt-4o-mini'}
              onValueChange={(v) => updateSettings({ aiModel: v })}
            >
              <SelectTrigger className="w-[160px] h-9 border-0 bg-transparent focus:ring-0 shadow-none font-medium">
                <SelectValue placeholder="Modelo de IA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </header>

      {!isReadingMode ? (
        <div className="flex-1 flex flex-col gap-6 animate-fade-in-up">
          <Card className="flex-1 p-6 flex flex-col border-border bg-card/80 backdrop-blur-sm min-h-[400px] shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-primary">
              <FileText className="w-5 h-5" /> Cole seu texto aqui:
            </div>
            <Textarea
              className="flex-1 resize-none text-base md:text-lg p-6 font-sans bg-secondary/30 border-border rounded-[20px] focus-visible:ring-primary shadow-inner leading-relaxed"
              placeholder="Paste English text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </Card>
          <Button
            size="lg"
            className="w-full h-16 text-lg shadow-md group rounded-2xl shrink-0"
            onClick={() => {
              if (inputText.trim()) setIsReadingMode(true)
            }}
          >
            <Play
              className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"
              fill="currentColor"
            />
            Iniciar Leitura
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 animate-fade-in-up overflow-hidden">
          <Card className="flex-1 p-8 md:p-12 text-lg md:text-xl leading-relaxed font-serif bg-card text-foreground overflow-y-auto border-t-4 border-t-primary shadow-md relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-[24px]" />
            <div className="relative z-10">{processedContent}</div>
          </Card>

          {capturedWords.length > 0 ? (
            <div className="bg-card/95 backdrop-blur-md p-5 rounded-[24px] border border-primary/30 shadow-lg animate-fade-in-up shrink-0 ring-1 ring-primary/20">
              <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <div className="flex-1">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-foreground uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Palavras Capturadas ({capturedWords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                    {capturedWords.map((cw) => (
                      <div
                        key={cw.word}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm transition-all hover:bg-primary/20"
                      >
                        {cw.word}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:w-auto w-full shrink-0 items-end md:items-center justify-end">
                  <Button
                    variant="ghost"
                    className="h-12 rounded-xl text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setIsReadingMode(false)
                      setCapturedWords([])
                    }}
                  >
                    Sair do Leitor
                  </Button>
                  <Button
                    className="h-12 rounded-xl shadow-md group text-base px-6 w-full sm:w-auto"
                    onClick={handleNextPhase}
                  >
                    Próxima Fase{' '}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-center bg-card/80 backdrop-blur-md p-4 px-6 rounded-2xl border border-border shadow-sm shrink-0 gap-4">
              <div className="text-sm font-medium flex items-center gap-3 text-muted-foreground w-full sm:w-auto text-center sm:text-left">
                <div className="p-2 bg-primary/10 rounded-full hidden sm:block">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                Clique nas palavras no texto acima para capturar o contexto.
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 bg-background hover:bg-secondary border-border w-full sm:w-auto"
                onClick={() => setIsReadingMode(false)}
              >
                Editar Texto
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
