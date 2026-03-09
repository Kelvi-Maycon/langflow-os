import { useState, useCallback, useEffect } from 'react'
import { ReaderInputTabs } from '@/components/reader/ReaderInputTabs'
import { ReaderContent } from '@/components/reader/ReaderContent'
import { ReaderActiveSession } from '@/components/reader/ReaderActiveSession'
import { ReaderHeader } from '@/components/reader/ReaderHeader'
import { useStore } from '@/store/main'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { StatsSidebar } from '@/components/dashboard/StatsSidebar'

const defaultText = `The quick brown fox jumps over the lazy dog. 
This is a serendipity moment where you can learn new words.
Reading ephemeral texts ubiquitous on the internet helps improve your active vocabulary.`

interface CapturedWord {
  word: string
  translation: string
  sentence: string
}

function extractYoutubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  )
  return match ? match[1] : null
}

export default function Reader() {
  const [inputText, setInputText] = useState(defaultText)
  const [ytUrl, setYtUrl] = useState('')
  const [processedText, setProcessedText] = useState('')
  const [isReadingMode, setIsReadingMode] = useState(false)
  const [isProcessingYt, setIsProcessingYt] = useState(false)
  const [capturedWords, setCapturedWords] = useState<CapturedWord[]>([])
  const [isPlayingTTS, setIsPlayingTTS] = useState(false)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const { settings, updateSettings, words: globalWords, updateWordStatus } = useStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  const handleProcessText = () => {
    const text = inputText.trim()
    if (!text) return
    setProcessedText(text)
    setActiveVideoId(null)
    setIsReadingMode(true)
  }

  const handleProcessYt = async () => {
    const url = ytUrl.trim()
    if (!url) return

    const videoId = extractYoutubeId(url)
    if (!videoId) {
      toast({
        title: 'URL Inválida',
        description: 'Por favor, insira um link válido do YouTube.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessingYt(true)
    setTimeout(() => {
      setProcessedText(
        'This is a simulated transcript from the YouTube video you pasted. The quick brown fox jumps over the lazy dog. Here we can find serendipity and ephemeral moments. Exploring ubiquitous features is genuinely fun and helps you learn new things easily.',
      )
      setActiveVideoId(videoId)
      setIsReadingMode(true)
      setIsProcessingYt(false)
    }, 1500)
  }

  const handleTTS = () => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
        setIsPlayingTTS(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(processedText)
        utterance.lang = 'en-US'
        utterance.onend = () => setIsPlayingTTS(false)
        utterance.onerror = () => setIsPlayingTTS(false)
        window.speechSynthesis.speak(utterance)
        setIsPlayingTTS(true)
      }
    } else {
      toast({
        title: 'Erro',
        description: 'Text-to-speech não é suportado neste navegador.',
        variant: 'destructive',
      })
    }
  }

  const handleCapture = useCallback((word: string, translation: string, sentence: string) => {
    setCapturedWords((prev) => {
      if (prev.some((w) => w.word === word)) return prev
      return [...prev, { word, translation, sentence }]
    })
  }, [])

  const handleNextPhase = () => {
    capturedWords.forEach((cw) => {
      const existing = globalWords.find((w) => w.word.toLowerCase() === cw.word.toLowerCase())
      if (existing) updateWordStatus(existing.id, 'builder')
    })
    navigate('/practice')
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <ReaderHeader
        isReadingMode={isReadingMode}
        isPlayingTTS={isPlayingTTS}
        aiModel={settings.aiModel || 'gpt-4o-mini'}
        onToggleTTS={handleTTS}
        onModelChange={(v) => updateSettings({ aiModel: v })}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {!isReadingMode ? (
            <ReaderInputTabs
              inputText={inputText}
              setInputText={setInputText}
              ytUrl={ytUrl}
              setYtUrl={setYtUrl}
              isProcessingYt={isProcessingYt}
              onProcessText={handleProcessText}
              onProcessYt={handleProcessYt}
            />
          ) : (
            <div className="flex flex-col gap-6 animate-fade-in-up h-full">
              <ReaderContent
                processedText={processedText}
                isReadingMode={isReadingMode}
                activeVideoId={activeVideoId}
                onCapture={handleCapture}
              />
              <ReaderActiveSession
                capturedWords={capturedWords}
                onExit={() => {
                  setIsReadingMode(false)
                  setActiveVideoId(null)
                  setCapturedWords([])
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
                  setIsPlayingTTS(false)
                }}
                onNextPhase={handleNextPhase}
              />
            </div>
          )}
        </div>
        <div className="xl:col-span-1 hidden xl:block">
          <StatsSidebar />
        </div>
      </div>
    </div>
  )
}
