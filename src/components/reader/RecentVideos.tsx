import { Card } from '@/components/ui/card'
import { Clock, PlayCircle } from 'lucide-react'
import { useStore } from '@/store/main'
import { RecentVideo } from '@/lib/types'

interface RecentVideosProps {
  onLoadVideo: (video: RecentVideo) => void
}

export function RecentVideos({ onLoadVideo }: RecentVideosProps) {
  const { recentVideos } = useStore()

  if (!recentVideos || recentVideos.length === 0) {
    return null
  }

  return (
    <Card className="p-6 bg-card border-border shadow-sm rounded-[32px] flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Vídeos Recentes</h3>
      </div>
      <div className="space-y-3">
        {recentVideos.map((video) => (
          <button
            key={video.id}
            onClick={() => onLoadVideo(video)}
            className="w-full text-left flex items-start gap-3 p-3 rounded-[20px] bg-secondary/30 hover:bg-secondary/80 transition-all duration-200 group border border-transparent hover:border-border hover:shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
              <PlayCircle className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
            </div>
            <div className="overflow-hidden flex-1 py-1">
              <div className="font-semibold text-[15px] leading-tight text-foreground truncate group-hover:text-primary transition-colors">
                {video.title}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-1">
                {new Date(video.timestamp).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
