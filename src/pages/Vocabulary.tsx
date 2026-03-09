import { useState } from 'react'
import { useStore } from '@/store/main'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { BookOpen, Upload, Database } from 'lucide-react'
import { CEFRLists } from '@/lib/cefr-data'

export default function Vocabulary() {
  const { addWord, words } = useStore()
  const { toast } = useToast()
  const [bulkText, setBulkText] = useState('')

  const handleBulkUpload = () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (!lines.length) return
    let added = 0
    lines.forEach((line) => {
      const [word, translation] = line.split(',').map((s) => s.trim())
      if (word && !words.find((w) => w.word.toLowerCase() === word.toLowerCase())) {
        addWord({
          word,
          translation: translation || 'N/A',
          contextSentence: `This is a context sentence for ${word}.`,
          status: 'builder',
        })
        added++
      }
    })
    setBulkText('')
    toast({ title: 'Upload concluído', description: `${added} palavras adicionadas com sucesso.` })
  }

  const handleSeedCEFR = (level: string) => {
    const list = CEFRLists[level as keyof typeof CEFRLists] || []
    let added = 0
    list.forEach((item) => {
      if (!words.find((w) => w.word.toLowerCase() === item.word.toLowerCase())) {
        addWord({
          word: item.word,
          translation: item.translation,
          contextSentence: item.contextSentence,
          status: 'builder',
        })
        added++
      }
    })
    toast({
      title: 'Semente concluída',
      description: `${added} palavras do nível ${level} adicionadas.`,
    })
  }

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto pb-12 pt-4">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <BookOpen className="w-10 h-10 text-primary" />
          Gerenciamento de Vocabulário
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Importe novas palavras em lote ou utilize nossas listas curadas por nível CEFR.
        </p>
      </header>

      <Tabs defaultValue="bulk" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl p-1 bg-secondary/50">
          <TabsTrigger value="bulk" className="rounded-xl text-base data-[state=active]:shadow-sm">
            <Upload className="w-5 h-5 mr-2" /> Upload em Lote
          </TabsTrigger>
          <TabsTrigger value="cefr" className="rounded-xl text-base data-[state=active]:shadow-sm">
            <Database className="w-5 h-5 mr-2" /> Listas CEFR (Sementes)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk" className="mt-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Upload em Lote</CardTitle>
              <CardDescription>
                Cole uma lista de palavras e traduções (separadas por vírgula), uma por linha.
                Exemplo: "apple, maçã"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="apple, maçã&#10;car, carro&#10;house, casa"
                className="min-h-[250px] font-mono text-base p-4"
              />
              <Button
                onClick={handleBulkUpload}
                size="lg"
                className="w-full h-14 text-lg rounded-xl shadow-md"
              >
                Importar Palavras
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cefr" className="mt-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Listas CEFR</CardTitle>
              <CardDescription>
                Adicione palavras essenciais baseadas no Quadro Europeu Comum de Referência.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(CEFRLists).map((level) => (
                  <Card
                    key={level}
                    className="bg-secondary/20 border-border/50 shadow-sm transition-all hover:bg-secondary/40"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-2xl text-primary">Nível {level}</CardTitle>
                      <CardDescription className="text-sm font-medium">
                        {CEFRLists[level as keyof typeof CEFRLists].length} palavras disponíveis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full h-12"
                        onClick={() => handleSeedCEFR(level)}
                      >
                        Adicionar ao meu vocabulário
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
