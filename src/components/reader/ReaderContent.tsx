import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { WordInteraction } from './WordInteraction'

interface ReaderContentProps {
  processedText: string
  isReadingMode: boolean
  activeVideoId: string | null
  onCapture: (word: string, translation: string, sentence: string) => void
}

export function ReaderContent({
  processedText,
  isReadingMode,
  activeVideoId,
  onCapture,
}: ReaderContentProps) {
  const processedContent = useMemo(() => {
    if (!isReadingMode) return null
    const paragraphs = processedText.split('\n')
    return paragraphs.map((paragraph, pIdx) => {
      if (!paragraph.trim()) return null
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph]
      return (
        <p key={pIdx} className="mb-4 leading-[2.2]">
          {sentences.map((sentence, sIdx) => {
            const tokens = sentence.split(/([\s.,!?;:]+)/)
            return (
              <span key={sIdx} className="mr-1">
                {tokens.map((token, tIdx) => {
                  if (/^[\s.,!?;:]+$/.test(token)) return <span key={tIdx}>{token}</span>
                  return (
                    <WordInteraction
                      key={`${pIdx}-${sIdx}-${tIdx}`}
                      word={token}
                      sentence={sentence.trim()}
                      onCapture={onCapture}
                    />
                  )
                })}
              </span>
            )
          })}
        </p>
      )
    })
  }, [processedText, isReadingMode, onCapture])

  if (!isReadingMode) return null

  return (
    <>
      {activeVideoId && (
        <Card className="overflow-hidden rounded-[24px] border-border shadow-md shrink-0 mb-2">
          <div className="aspect-video w-full bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${activeVideoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </Card>
      )}
      <Card className="flex-1 p-8 md:p-12 text-lg md:text-xl leading-relaxed font-serif bg-card text-foreground overflow-y-auto max-h-[65vh] border-t-4 border-t-primary shadow-md relative rounded-[24px]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-[24px]" />
        <div className="relative z-10">{processedContent}</div>
      </Card>
    </>
  )
}
