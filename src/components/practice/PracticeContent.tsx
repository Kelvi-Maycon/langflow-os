import { useState, useEffect } from 'react'
import { useStore } from '@/store/main'
import { useToast } from '@/hooks/use-toast'
import { PracticeBuilder } from './PracticeBuilder'
import { PracticeCloze } from './PracticeCloze'
import { PracticeTransform } from './PracticeTransform'
import { PracticeFooter } from './PracticeFooter'
import { WordEntry } from '@/lib/types'
import { Block, ExerciseType } from '@/hooks/use-practice-engine'
import { cn } from '@/lib/utils'

interface Props {
  currentWord: WordEntry
  practiceData: any
  shuffledBlocks: Block[]
  exerciseType: ExerciseType
  onNext: (id: string) => void
}

export function PracticeContent({
  currentWord,
  practiceData,
  shuffledBlocks,
  exerciseType,
  onNext,
}: Props) {
  const { recordPracticeAttempt, reviewWord } = useStore()
  const { toast } = useToast()

  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [textInput, setTextInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle')
  const [feedback, setFeedback] = useState<boolean[]>([])

  useEffect(() => {
    setSelectedIndices([])
    setTextInput('')
    setAttempts(0)
    setStatus('idle')
    setFeedback([])
  }, [currentWord.id, exerciseType])

  const checkAnswer = () => {
    if (!practiceData) return

    if (exerciseType === 'builder') {
      const targetWords = practiceData.en.split(' ').filter(Boolean)
      if (selectedIndices.length !== targetWords.length) {
        toast({
          title: 'Faltam blocos',
          description: 'Utilize todas as palavras.',
          variant: 'destructive',
        })
        return
      }
      let isCorrect = true
      const newFeedback = selectedIndices.map((id, i) => {
        const text = shuffledBlocks.find((b) => b.id === id)!.text
        const correct =
          text.toLowerCase().replace(/[.,!?]/g, '') ===
          targetWords[i].toLowerCase().replace(/[.,!?]/g, '')
        if (!correct) isCorrect = false
        return correct
      })
      setFeedback(newFeedback)
      handleResult(isCorrect)
    } else if (exerciseType === 'cloze') {
      const targetWord = practiceData.word.toLowerCase().trim()
      const userAnswer = textInput.toLowerCase().trim()
      handleResult(userAnswer === targetWord)
    } else if (exerciseType === 'transform') {
      const targetSentence = practiceData.transformed
        .toLowerCase()
        .replace(/[.,!?]/g, '')
        .trim()
      const userAnswer = textInput
        .toLowerCase()
        .replace(/[.,!?]/g, '')
        .trim()
      handleResult(userAnswer === targetSentence)
    }
  }

  const handleResult = (isCorrect: boolean) => {
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
        setTimeout(() => setStatus('idle'), 1500)
      }
    }
  }

  const handleRate = (quality: number) => {
    reviewWord(currentWord.id, quality)
    onNext(currentWord.id)
  }

  return (
    <div className="flex-1 flex flex-col h-full z-10">
      <div className="mb-8 text-center flex-shrink-0">
        <span
          className={cn(
            'px-4 py-1.5 rounded-full font-bold text-sm border uppercase tracking-wider inline-block mb-6',
            currentWord.status === 'srs'
              ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
              : 'bg-primary/10 text-primary border-primary/20',
          )}
        >
          {currentWord.status === 'srs'
            ? exerciseType === 'transform'
              ? 'Transformação de Frase'
              : exerciseType === 'cloze'
                ? 'Preencha a Lacuna'
                : 'Revisão da Frase'
            : 'Construa a frase'}
        </span>
        {exerciseType === 'builder' && (
          <p className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
            {practiceData.pt}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {exerciseType === 'builder' && (
          <PracticeBuilder
            shuffledBlocks={shuffledBlocks}
            selectedIndices={selectedIndices}
            setSelectedIndices={setSelectedIndices}
            status={status}
            feedback={feedback}
          />
        )}
        {exerciseType === 'cloze' && (
          <PracticeCloze
            practiceData={practiceData}
            textInput={textInput}
            setTextInput={setTextInput}
            status={status}
            onEnter={checkAnswer}
          />
        )}
        {exerciseType === 'transform' && (
          <PracticeTransform
            practiceData={practiceData}
            textInput={textInput}
            setTextInput={setTextInput}
            status={status}
            onEnter={checkAnswer}
          />
        )}
      </div>

      <div className="flex-shrink-0 mt-6">
        <PracticeFooter
          status={status}
          currentWord={currentWord}
          practiceData={practiceData}
          exerciseType={exerciseType}
          selectedIndicesLength={selectedIndices.length}
          textInputLength={textInput.trim().length}
          checkAnswer={checkAnswer}
          handleRate={handleRate}
        />
      </div>
    </div>
  )
}
