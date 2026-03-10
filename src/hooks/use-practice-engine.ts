import { useState, useEffect, useRef } from 'react'
import { UserSettings } from '@/lib/types'

export interface Block {
  id: number
  text: string
}

export type ExerciseType = 'builder' | 'cloze' | 'transform'

export function usePracticeEngine(currentItem: any | undefined, settings: UserSettings) {
  const [practiceData, setPracticeData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shuffledBlocks, setShuffledBlocks] = useState<Block[]>([])
  const [exerciseType, setExerciseType] = useState<ExerciseType>('builder')
  const fetchedId = useRef<string | null>(null)

  useEffect(() => {
    if (!currentItem || fetchedId.current === currentItem.id) return
    fetchedId.current = currentItem.id
    setIsLoading(true)

    let type: ExerciseType = 'builder'
    if (currentItem.isCard) {
      const types: ExerciseType[] = ['cloze', 'transform', 'builder']
      type = types[Math.floor(Math.random() * types.length)]
    }
    setExerciseType(type)

    const fetchPractice = async () => {
      let result = null
      const targetWord = currentItem.isCard ? currentItem.targetText : currentItem.word

      if (currentItem.isCard && type !== 'transform') {
        setTimeout(() => {
          if (type === 'cloze') {
            result = {
              pt: currentItem.contextSentencePt,
              en: currentItem.contextSentenceEn,
              word: targetWord,
            }
          } else {
            result = { pt: currentItem.contextSentencePt, en: currentItem.contextSentenceEn }
          }
          setupData(result, type)
        }, 150)
        return
      }

      if (!settings.apiKey) {
        setTimeout(() => {
          const isAdvanced = settings.level === 'C1' || settings.level === 'C2'
          const isIntermediate = settings.level === 'B1' || settings.level === 'B2'

          let sentenceEn = currentItem.isCard
            ? currentItem.contextSentenceEn
            : `I saw a ${targetWord} today.`
          let sentencePt = currentItem.isCard
            ? currentItem.contextSentencePt
            : `Eu vi um(a) ${currentItem.translation} hoje.`

          if (!currentItem.isCard) {
            if (isAdvanced) {
              sentenceEn = `The unexpected presence of a ${targetWord} drastically altered the situation.`
              sentencePt = `A presença inesperada de um(a) ${currentItem.translation} alterou drasticamente a situação.`
            } else if (isIntermediate) {
              sentenceEn = `I quickly noticed a ${targetWord} while walking outside.`
              sentencePt = `Eu notei rapidamente um(a) ${currentItem.translation} enquanto caminhava lá fora.`
            }
          }

          if (type === 'cloze') {
            result = { pt: sentencePt, en: sentenceEn, word: targetWord }
          } else if (type === 'transform') {
            result = {
              instruction: isAdvanced ? 'Change to passive voice' : 'Change to past tense',
              original: currentItem.isCard
                ? currentItem.contextSentenceEn
                : isAdvanced
                  ? `They notice a ${targetWord} in the room.`
                  : `I see a ${targetWord} today.`,
              transformed: currentItem.isCard
                ? currentItem.contextSentenceEn
                : isAdvanced
                  ? `A ${targetWord} is noticed in the room.`
                  : sentenceEn,
              pt: sentencePt,
            }
          } else {
            result = { pt: sentencePt, en: sentenceEn }
          }
          setupData(result, type)
        }, 800)
        return
      }

      try {
        let systemPrompt = ''
        const baseLevelInfo = `Nível do aluno: ${settings.level} (${settings.complexity || 'intermediate'}). Adapte a complexidade do vocabulário e gramática.`
        const entityLabel = currentItem.type === 'collocation' ? 'expressão' : 'palavra'

        if (type === 'builder')
          systemPrompt = `Você é professor de inglês. ${baseLevelInfo} Crie frase focada na ${entityLabel} "${targetWord}" baseada no contexto: "${currentItem.contextSentence || currentItem.contextSentenceEn}". Retorne JSON: {"pt": "frase pt", "en": "frase en"}`
        else if (type === 'cloze')
          systemPrompt = `Você é professor de inglês. ${baseLevelInfo} Crie uma frase com a ${entityLabel} "${targetWord}". Retorne JSON: {"pt": "frase pt", "en": "frase completa em ingles", "word": "${targetWord}"}`
        else if (type === 'transform') {
          const original = currentItem.isCard
            ? currentItem.contextSentenceEn
            : `I see a ${targetWord} today.`
          systemPrompt = `Você é professor de inglês. ${baseLevelInfo} Pegue a frase: "${original}". Crie uma instrução de transformação gramatical em inglês (ex: 'Change to negative'), e a frase transformada. Retorne JSON: {"instruction": "instrução", "original": "${original}", "transformed": "frase transformada", "pt": "tradução da frase transformada"}`
        }

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
            pt: `Eu vi um(a) ${currentItem.translation || 'item'} hoje.`,
            en: `I saw a ${targetWord} today.`,
            word: targetWord,
          }
        else if (type === 'transform')
          result = {
            instruction: 'Change to past tense',
            original: currentItem.isCard
              ? currentItem.contextSentenceEn
              : `I see a ${targetWord} today.`,
            transformed: currentItem.isCard
              ? currentItem.contextSentenceEn
              : `I saw a ${targetWord} today.`,
            pt: `Eu vi um(a) ${currentItem.translation || 'item'} hoje.`,
          }
        else
          result = {
            pt: `Eu vi um(a) ${currentItem.translation || 'item'} hoje.`,
            en: `I saw a ${targetWord} today.`,
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
  }, [currentItem, settings])

  return { practiceData, isLoading, shuffledBlocks, exerciseType }
}
