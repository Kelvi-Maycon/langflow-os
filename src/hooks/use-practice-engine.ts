import { useState, useEffect, useRef } from 'react'
import { WordEntry, UserSettings } from '@/lib/types'

export interface Block {
  id: number
  text: string
}

export function usePracticeEngine(currentWord: WordEntry | undefined, settings: UserSettings) {
  const [practiceData, setPracticeData] = useState<{ pt: string; en: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shuffledBlocks, setShuffledBlocks] = useState<Block[]>([])
  const fetchedId = useRef<string | null>(null)

  useEffect(() => {
    if (!currentWord || fetchedId.current === currentWord.id) return
    fetchedId.current = currentWord.id
    setIsLoading(true)

    const fetchPractice = async () => {
      let result = null
      if (!settings.apiKey) {
        setTimeout(() => {
          result = {
            pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
            en: `I saw a ${currentWord.word} today.`,
          }
          setupBlocks(result)
        }, 800)
        return
      }

      try {
        const payload =
          settings.aiProvider === 'gemini'
            ? {
                url: `https://generativelanguage.googleapis.com/v1beta/models/${
                  settings.aiModel || 'gemini-1.5-flash'
                }:generateContent?key=${settings.apiKey}`,
                body: {
                  contents: [
                    {
                      parts: [
                        {
                          text: `Você é professor de inglês. Crie frase focada na palavra "${currentWord.word}" baseada no contexto: "${currentWord.contextSentence}". Retorne JSON: {"pt": "frase pt", "en": "frase en"}`,
                        },
                      ],
                    },
                  ],
                  generationConfig: { responseMimeType: 'application/json' },
                },
              }
            : {
                url: 'https://api.openai.com/v1/chat/completions',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${settings.apiKey}`,
                },
                body: {
                  model: settings.aiModel || 'gpt-4o-mini',
                  messages: [
                    {
                      role: 'system',
                      content:
                        'Você é professor de inglês. Crie frase focada na palavra alvo. Retorne JSON: {"pt": "frase pt", "en": "frase en"}',
                    },
                    {
                      role: 'user',
                      content: `Palavra: "${currentWord.word}"\nContexto: "${currentWord.contextSentence}"`,
                    },
                  ],
                  response_format: { type: 'json_object' },
                },
              }

        const res = await fetch(payload.url, {
          method: 'POST',
          headers: 'headers' in payload ? payload.headers : { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload.body),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        result = JSON.parse(
          settings.aiProvider === 'gemini'
            ? data.candidates[0].content.parts[0].text
            : data.choices[0].message.content,
        )
      } catch (err) {
        result = {
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
  }, [currentWord, settings])

  return { practiceData, isLoading, shuffledBlocks }
}
