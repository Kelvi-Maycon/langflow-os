import { Settings2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ReaderHeaderProps {
  isReadingMode: boolean
  aiModel: string
  onModelChange: (model: string) => void
}

export function ReaderHeader({ isReadingMode, aiModel, onModelChange }: ReaderHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Leitor Imersivo</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Processe textos ou vídeos do YouTube e capture vocabulário em contexto.
        </p>
      </div>

      {isReadingMode && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-secondary/40 p-1.5 rounded-xl border border-border animate-fade-in shadow-sm shrink-0">
            <Settings2 className="w-4 h-4 text-primary ml-2" />
            <Select value={aiModel || 'gpt-4o-mini'} onValueChange={onModelChange}>
              <SelectTrigger className="w-[160px] h-9 border-0 bg-transparent focus:ring-0 shadow-none font-medium">
                <SelectValue placeholder="Modelo de IA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </header>
  )
}
