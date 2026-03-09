import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, FileText, Loader2, Youtube, Link as LinkIcon } from 'lucide-react'

interface ReaderInputTabsProps {
  inputText: string
  setInputText: (val: string) => void
  ytUrl: string
  setYtUrl: (val: string) => void
  isProcessingYt: boolean
  onProcessText: () => void
  onProcessYt: () => void
}

export function ReaderInputTabs({
  inputText,
  setInputText,
  ytUrl,
  setYtUrl,
  isProcessingYt,
  onProcessText,
  onProcessYt,
}: ReaderInputTabsProps) {
  return (
    <Tabs defaultValue="youtube" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 h-14 bg-secondary/50 rounded-[20px] p-1.5 border border-border/50">
        <TabsTrigger
          value="youtube"
          className="text-base h-11 rounded-2xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-red-500 font-semibold gap-2 transition-all"
        >
          <Youtube className="w-5 h-5" /> YouTube
        </TabsTrigger>
        <TabsTrigger
          value="text"
          className="text-base h-11 rounded-2xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-semibold gap-2 transition-all"
        >
          <FileText className="w-5 h-5" /> Texto Livre
        </TabsTrigger>
      </TabsList>

      <TabsContent value="youtube" className="space-y-4 animate-fade-in-up mt-0">
        <Card className="p-8 border-border bg-card/80 backdrop-blur-sm shadow-sm flex flex-col gap-6 rounded-[24px]">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-foreground">
              Importar Legendas
            </h3>
            <p className="text-muted-foreground">
              Cole o link do YouTube abaixo para extrairmos automaticamente o transcript em inglês
              do vídeo.
            </p>
          </div>

          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Ex: https://www.youtube.com/watch?v=..."
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              className="pl-12 h-16 text-lg rounded-[20px] bg-secondary/30 shadow-inner"
            />
          </div>

          <div className="bg-secondary/40 rounded-[20px] p-6 text-center border border-border/50 text-muted-foreground mt-2">
            <Youtube className="w-12 h-12 mx-auto text-red-500/40 mb-3" />
            <p className="font-semibold text-foreground text-lg">Prática com Vídeos Reais</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">
              Aprenda inglês com o conteúdo que você já gosta de assistir. Nós tokenizamos as
              palavras para facilitar sua absorção.
            </p>
          </div>
        </Card>
        <Button
          size="lg"
          className="w-full h-16 text-lg shadow-md group rounded-[20px] bg-red-500 hover:bg-red-600 text-white"
          onClick={onProcessYt}
          disabled={!ytUrl.trim() || isProcessingYt}
        >
          {isProcessingYt ? (
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
          ) : (
            <Youtube
              className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform"
              fill="currentColor"
            />
          )}
          {isProcessingYt ? 'Processando Vídeo...' : 'Carregar Vídeo'}
        </Button>
      </TabsContent>

      <TabsContent value="text" className="space-y-4 animate-fade-in-up mt-0">
        <Card className="p-8 border-border bg-card/80 backdrop-blur-sm shadow-sm flex flex-col gap-4 rounded-[24px]">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-foreground">
              Leitura de Textos
            </h3>
            <p className="text-muted-foreground">
              Cole artigos, notícias ou trechos de livros que você gostaria de ler.
            </p>
          </div>
          <Textarea
            className="flex-1 min-h-[300px] resize-none text-base md:text-lg p-6 font-sans bg-secondary/30 border-border rounded-[20px] focus-visible:ring-primary shadow-inner leading-relaxed"
            placeholder="Cole seu texto aqui..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </Card>
        <Button
          size="lg"
          className="w-full h-16 text-lg shadow-md group rounded-[20px]"
          onClick={onProcessText}
          disabled={!inputText.trim()}
        >
          <Play
            className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform"
            fill="currentColor"
          />
          Iniciar Leitura
        </Button>
      </TabsContent>
    </Tabs>
  )
}
