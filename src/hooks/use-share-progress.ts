import { useToast } from '@/hooks/use-toast'
import { useStore } from '@/store/main'
import { getLevelTier } from '@/lib/gamification'

export function useShareProgress() {
  const { toast } = useToast()
  const { stats } = useStore()
  const { current } = getLevelTier(stats?.xp || 0)

  const share = async (customText?: string) => {
    const text =
      customText ||
      `I just reached Level ${current.name} in Langflow! My current streak is ${stats?.streak || 0} days. #LangflowLearning`

    const fallbackCopy = async () => {
      try {
        await navigator.clipboard.writeText(text)
        toast({
          title: 'Copiado!',
          description: 'Progresso copiado para a área de transferência.',
        })
      } catch (err) {
        toast({
          title: 'Erro ao copiar',
          description: 'Não foi possível copiar o texto.',
          variant: 'destructive',
        })
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Langflow Progress',
          text,
        })
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          await fallbackCopy()
        }
      }
    } else {
      await fallbackCopy()
    }
  }

  return { share }
}
