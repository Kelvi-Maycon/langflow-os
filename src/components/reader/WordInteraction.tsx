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
    explanation:
      'This is a definite article used to indicate a specific noun that is known to the reader or listener. It helps point out particular objects or people. For example, "the book" refers to a specific book.',
  },
  is: {
    translation: 'é, está',
    explanation:
      'This is the third-person singular form of the verb "to be" in the present tense. It is used to describe a state of being or existence. For example, "she is happy".',
  },
  quick: {
    translation: 'rápido',
    explanation:
      'An adjective that describes something moving or functioning with high speed. It can refer to physical movement or mental sharpness. For instance, a "quick learner".',
  },
  brown: {
    translation: 'marrom',
    explanation:
      'This word describes a color often found in nature, like wood or soil. It is commonly used as an adjective to detail the appearance of an object or animal.',
  },
  fox: {
    translation: 'raposa',
    explanation:
      'A small to medium-sized carnivorous mammal known for its bushy tail and cleverness. It belongs to the dog family and is often featured in folklore.',
  },
  serendipity: {
    translation: 'serendipidade',
    explanation:
      'Serendipity refers to the occurrence of events by chance in a happy or beneficial way. It describes those lucky moments when you find something wonderful without looking for it. A great example is accidentally discovering a new favorite restaurant.',
  },
  ephemeral: {
    translation: 'efêmero',
    explanation:
      'Ephemeral describes something that lasts for a very short time. It is often used for things like delicate flowers, beautiful sunsets, or passing feelings. The temporary nature of ephemeral things often makes them more precious.',
  },
  ubiquitous: {
    translation: 'onipresente',
    explanation:
      'When something is ubiquitous, it is present, appearing, or found everywhere. In modern times, smartphones have become a ubiquitous part of daily life. It emphasizes how common and widespread something is.',
  },
}

export function WordInteraction({ word, sentence, onCapture }: WordInteractionProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [wordData, setWordData] = useState<{ translation: string; explanation: string } | null>(
    null,
  )

  const { settings, words, addWord, updateWordStatus } = useStore()
  const { toast } = useToast()

  const cleanWord = word.replace(/[^\w-]/g, '').toLowerCase()
  const fetched = useRef(false)

  useEffect(() => {
    if (open && !wordData && !fetched.current) {
      setIsLoading(true)
      fetched.current = true

      const fetchDefinition = async () => {
        const cacheKey = `langflow_cache_${cleanWord}_${settings.level}`
        const cached = localStorage.getItem(cacheKey)

        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            if (parsed.translation && parsed.explanation) {
              setWordData(parsed)
              setIsLoading(false)
              return
            }
          } catch (e) {
            // Ignore cache parse error
          }
        }

        if (!settings.apiKey) {
          setTimeout(() => {
            const fallbackData = mockDictionary[cleanWord] || {
              translation: `tradução de "${cleanWord}"`,
              explanation: `(Offline Mode) Explanation unavailable. Please configure your ${
                settings.aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'
              } key to get personalized, 2-3 sentence explanations.`,
            }
            setWordData(fallbackData)
            setIsLoading(false)
          }, 600)
          return
        }

        try {
          let result: any = null
          const aiPrompt = `You are an intelligent English dictionary. The user is at CEFR level ${
            settings.level || 'B1'
          }. Analyze the target word within the provided context sentence. Return the most accurate Portuguese translation for this specific context, and provide a 2-3 sentence explanation in English of the word's meaning and usage, tailored to the user's level. Respond ONLY with valid JSON: {"translation": "...", "explanation": "..."}`

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
                          text: `${aiPrompt}\n\nTarget word: "${cleanWord}"\nContext: "${sentence}"`,
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
                    content: aiPrompt,
                  },
                  {
                    role: 'user',
                    content: `Target word: "${cleanWord}"\nContext: "${sentence}"`,
                  },
                ],
                response_format: { type: 'json_object' },
              }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error.message)
            result = JSON.parse(data.choices[0].message.content)
          }

          const dataToCache = {
            translation: result.translation || cleanWord,
            explanation: result.explanation || 'Explanation unavailable.',
          }

          localStorage.setItem(cacheKey, JSON.stringify(dataToCache))
          setWordData(dataToCache)
        } catch (error) {
          console.error(error)
          setWordData({
            translation: 'Erro na tradução',
            explanation:
              'Explanation unavailable. Please check your AI provider settings and API key.',
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchDefinition()
    }
  }, [
    open,
    cleanWord,
    sentence,
    settings.apiKey,
    settings.aiModel,
    settings.aiProvider,
    settings.level,
    wordData,
  ])

  if (!cleanWord) return <span>{word}</span>

  const handleCaptureClick = () => {
    if (wordData) {
      const existing = words.find((w) => w.word.toLowerCase() === cleanWord.toLowerCase())

      if (!existing) {
        addWord({
          word: cleanWord,
          translation: wordData.translation,
          contextSentence: sentence.trim(),
          status: 'learning',
        })
      } else {
        updateWordStatus(existing.id, 'learning')
      }

      onCapture(cleanWord, wordData.translation, sentence.trim())
      setOpen(false)
      toast({
        title: 'Palavra reconhecida',
        description: `"${cleanWord}" foi salva no seu banco de vocabulário.`,
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
        className="w-[320px] p-4 shadow-xl border-border/60 bg-popover rounded-xl z-50"
      >
        {isLoading || !wordData ? (
          <div className="py-8 flex justify-center items-center flex-col gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm font-medium animate-pulse">Analisando contexto...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-xl leading-none text-foreground">{cleanWord}</h4>
                <p className="text-sm text-primary font-medium mt-1.5">{wordData.translation}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-secondary/50 p-3.5 rounded-xl leading-relaxed border border-border/50">
              {wordData.explanation}
            </div>

            <Button
              size="sm"
              className="w-full mt-1 shadow-sm h-10 text-sm font-semibold gap-2 rounded-lg"
              onClick={handleCaptureClick}
              disabled={wordData.translation === 'Erro na tradução'}
            >
              <Plus className="w-4 h-4" /> Salvar Palavra
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
