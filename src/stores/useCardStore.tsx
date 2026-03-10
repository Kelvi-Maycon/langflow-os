import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { Flashcard } from '@/lib/types'
import { calculateSM2, getNextReviewDate } from '@/lib/sm2'

interface CardStoreType {
  cards: Flashcard[]
  addCard: (
    card: Omit<
      Flashcard,
      'id' | 'createdAt' | 'nextReviewDate' | 'interval' | 'easeFactor' | 'repetitions'
    >,
  ) => void
  reviewCard: (id: string, quality: number, srsMultiplier: number) => void
  removeCard: (id: string) => void
  resetProgress: () => void
}

const CardStoreContext = createContext<CardStoreType | null>(null)

export function CardStoreProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<Flashcard[]>(() => {
    try {
      const savedCards = localStorage.getItem('langflow_cards')
      let parsedCards: Flashcard[] = savedCards ? JSON.parse(savedCards) : []

      const savedWordsStr = localStorage.getItem('langflow_words')
      if (savedWordsStr) {
        const savedWords = JSON.parse(savedWordsStr)
        const srsWords = savedWords.filter(
          (w: any) => w.status === 'srs' || w.status === 'mastered',
        )

        let needsSave = false
        const updatedCards = [...parsedCards]

        srsWords.forEach((w: any) => {
          if (!updatedCards.find((c) => c.wordId === w.id)) {
            updatedCards.push({
              id: crypto.randomUUID(),
              wordId: w.id,
              targetText: w.word,
              translation: w.translation,
              contextSentenceEn: w.contextSentence || `This is a sentence for ${w.word}.`,
              contextSentencePt: w.translation,
              nextReviewDate: w.nextReviewDate || Date.now(),
              interval: w.interval || 1,
              easeFactor: w.easeFactor || 2.5,
              repetitions: w.repetitions || 1,
              createdAt: w.createdAt || Date.now(),
            })
            needsSave = true
          }
        })

        if (needsSave) {
          localStorage.setItem('langflow_cards', JSON.stringify(updatedCards))
          return updatedCards
        }
      }
      return parsedCards
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('langflow_cards', JSON.stringify(cards))
  }, [cards])

  const addCard = useCallback(
    (
      data: Omit<
        Flashcard,
        'id' | 'createdAt' | 'nextReviewDate' | 'interval' | 'easeFactor' | 'repetitions'
      >,
    ) => {
      const newCard: Flashcard = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        nextReviewDate: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
      }
      setCards((prev) => [newCard, ...prev])
    },
    [],
  )

  const reviewCard = useCallback((id: string, quality: number, srsMultiplier: number) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const sm2 = calculateSM2(quality, c.repetitions, c.interval, c.easeFactor, srsMultiplier)
        const nextReviewDate = getNextReviewDate(sm2.interval)
        return { ...c, ...sm2, nextReviewDate }
      }),
    )
  }, [])

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const resetProgress = useCallback(() => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        nextReviewDate: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
      })),
    )
  }, [])

  return (
    <CardStoreContext.Provider value={{ cards, addCard, reviewCard, removeCard, resetProgress }}>
      {children}
    </CardStoreContext.Provider>
  )
}

export default function useCardStore() {
  const ctx = useContext(CardStoreContext)
  if (!ctx) throw new Error('useCardStore must be used within CardStoreProvider')
  return ctx
}
