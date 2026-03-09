import { useState, useEffect, useRef } from 'react'
import { WordEntry, UserSettings } from '@/lib/types'

export interface Block {
  id: number
  text: string
}

export type ExerciseType = 'builder' | 'cloze' | 'transform'

export function usePracticeEngine(currentWord: WordEntry | undefined, settings: UserSettings) {
  const [practiceData, setPracticeData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shuffledBlocks, setShuffledBlocks] = useState<Block[]>([])
  const [exerciseType, setExerciseType] = useState<ExerciseType>('builder')
  const fetchedId = useRef<string | null>(null)

  useEffect(() => {
    if (!currentWord || fetchedId.current === currentWord.id) return
    fetchedId.current = currentWord.id
    setIsLoading(true)

    let type: ExerciseType = 'builder'
    if (currentWord.status === 'srs') {
      const types: ExerciseType[] = ['cloze', 'transform', 'builder']
      type = types[Math.floor(Math.random() * types.length)]
    }
    setExerciseType(type)

    const fetchPractice = async () => {
      let result = null
      if (!settings.apiKey) {
        setTimeout(() => {
          if (type === 'cloze') {
            result = {
              pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
              en: `I saw a ${currentWord.word} today.`,
              word: currentWord.word,
            }
          } else if (type === 'transform') {
            result = {
              instruction: 'Change to past tense',
              original: `I see a ${currentWord.word} today.`,
              transformed: `I saw a ${currentWord.word} today.`,
              pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
            }
          } else {
            result = {
              pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
              en: `I saw a ${currentWord.word} today.`,
            }
          }
          setupData(result, type)
        }, 800)
        return
      }

      try {
        let systemPrompt = ''
        if (type === 'builder')
          systemPrompt = `Você é professor de inglês. Nível: ${settings.complexity || 'intermediate'}. Crie frase focada na palavra "${currentWord.word}" baseada no contexto: "${currentWord.contextSentence}". Retorne JSON: {"pt": "frase pt", "en": "frase en"}`
        else if (type === 'cloze')
          systemPrompt = `Você é professor de inglês. Nível: ${settings.complexity || 'intermediate'}. Crie uma frase com a palavra "${currentWord.word}". Retorne JSON: {"pt": "frase pt", "en": "frase completa em ingles", "word": "${currentWord.word}"}`
        else if (type === 'transform')
          systemPrompt = `Você é professor de inglês. Nível: ${settings.complexity || 'intermediate'}. Crie uma frase simples usando a palavra "${currentWord.word}", uma instrução de transformação gramatical em inglês (ex: 'Change to negative', 'Change to past tense'), e a frase transformada. Retorne JSON: {"instruction": "instrução", "original": "frase original", "transformed": "frase transformada", "pt": "tradução da frase transformada"}`

        const payload =
          settings.aiProvider === 'gemini'
            ? {
                url: `https://generativelanguage.googleapis.com/v1beta/models/${settings.aiModel || 'gemini-1.5-flash'}:generateContent?key=${settings.apiKey}`,
                body: {
                  contents: [{ parts: [{ text: systemPrompt }] }],
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
                      content: 'You are an english teacher. Always return valid JSON.',
                    },
                    { role: 'user', content: systemPrompt },
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
        if (type === 'cloze')
          result = {
            pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
            en: `I saw a ${currentWord.word} today.`,
            word: currentWord.word,
          }
        else if (type === 'transform')
          result = {
            instruction: 'Change to past tense',
            original: `I see a ${currentWord.word} today.`,
            transformed: `I saw a ${currentWord.word} today.`,
            pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
          }
        else
          result = {
            pt: `Eu vi um(a) ${currentWord.translation} hoje.`,
            en: `I saw a ${currentWord.word} today.`,
          }
      }
      setupData(result, type)
    }

    const setupData = (data: any, type: ExerciseType) => {
      setPracticeData(data)
      if (type === 'builder') {
        const words = data.en.split(' ').filter(Boolean)
        const blocks: Block[] = words.map((text: string, i: number) => ({ id: i, text }))
        setShuffledBlocks([...blocks].sort(() => Math.random() - 0.5))
      }
      setIsLoading(false)
    }
    fetchPractice()
  }, [currentWord, settings])

  return { practiceData, isLoading, shuffledBlocks, exerciseType }
}
