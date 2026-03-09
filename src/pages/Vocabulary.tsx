import { useState } from 'react'
import { useStore } from '@/store/main'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Library, Upload, Database, List, Trash2, Edit2, Search } from 'lucide-react'
import { CEFRLists } from '@/lib/cefr-data'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { WordEntry } from '@/lib/types'

function EditWordDialog({ wordEntry }: { wordEntry: WordEntry }) {
  const { editWord } = useStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [wordText, setWordText] = useState(wordEntry.word)
  const [translation, setTranslation] = useState(wordEntry.translation)
  const [context, setContext] = useState(wordEntry.contextSentence)

  const handleSave = () => {
    if (!wordText.trim() || !translation.trim()) {
      toast({
        title: 'Erro',
        description: 'Palavra e tradução são obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    editWord(wordEntry.id, { word: wordText, translation, contextSentence: context })
    setOpen(false)
    toast({ title: 'Palavra atualizada', description: 'As alterações foram salvas com sucesso.' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 hover:text-primary transition-colors h-8 w-8"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Palavra</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Palavra (Inglês)</Label>
            <Input value={wordText} onChange={(e) => setWordText(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tradução</Label>
            <Input value={translation} onChange={(e) => setTranslation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Frase de Contexto</Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Vocabulary() {
  const { addWord, removeWord, words } = useStore()
  const { toast } = useToast()
  const [bulkText, setBulkText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredWords = words.filter(
    (w) =>
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.translation.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-8 animate-fade-in-up max-w-5xl mx-auto pb-12 pt-4">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Library className="w-10 h-10 text-primary" />
          Gerenciamento de Vocabulário
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Gerencie suas palavras salvas, importe listas ou utilize coleções CEFR.
        </p>
      </header>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-14 rounded-2xl p-1 bg-secondary/50 gap-1 md:gap-0">
          <TabsTrigger
            value="list"
            className="rounded-xl text-base data-[state=active]:shadow-sm h-10 md:h-auto"
          >
            <List className="w-5 h-5 mr-2" /> Meu Vocabulário
          </TabsTrigger>
          <TabsTrigger
            value="bulk"
            className="rounded-xl text-base data-[state=active]:shadow-sm h-10 md:h-auto"
          >
            <Upload className="w-5 h-5 mr-2" /> Upload em Lote
          </TabsTrigger>
          <TabsTrigger
            value="cefr"
            className="rounded-xl text-base data-[state=active]:shadow-sm h-10 md:h-auto"
          >
            <Database className="w-5 h-5 mr-2" /> Listas CEFR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card className="border-border shadow-sm rounded-[24px] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle>Palavras Salvas</CardTitle>
              <CardDescription>
                Visualize e edite as palavras que você capturou durante suas leituras.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6 gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por palavra ou tradução..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-11 bg-background rounded-xl border-border/60 shadow-sm"
                  />
                </div>
                <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
                  {filteredWords.length} palavra{filteredWords.length === 1 ? '' : 's'}
                </div>
              </div>

              {filteredWords.length === 0 ? (
                <div className="text-center py-16 px-4 bg-secondary/20 rounded-2xl border border-dashed border-border/50">
                  <Library className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Nenhuma palavra encontrada
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Capture palavras novas no Leitor ou importe uma lista.
                  </p>
                </div>
              ) : (
                <div className="border border-border/60 rounded-xl overflow-hidden bg-background">
                  <Table>
                    <TableHeader className="bg-secondary/40">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[20%] font-semibold">Palavra</TableHead>
                        <TableHead className="w-[25%] font-semibold">Tradução</TableHead>
                        <TableHead className="font-semibold">Contexto Original</TableHead>
                        <TableHead className="text-right font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWords.map((w) => (
                        <TableRow key={w.id} className="group">
                          <TableCell className="font-bold text-foreground">{w.word}</TableCell>
                          <TableCell className="text-muted-foreground font-medium">
                            {w.translation}
                          </TableCell>
                          <TableCell
                            className="text-muted-foreground text-sm max-w-[300px] truncate"
                            title={w.contextSentence}
                          >
                            "{w.contextSentence}"
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <EditWordDialog wordEntry={w} />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 h-8 w-8"
                                onClick={() => removeWord(w.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <Card className="border-border shadow-sm rounded-[24px]">
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
                className="min-h-[250px] font-mono text-base p-6 rounded-2xl bg-secondary/30"
              />
              <Button
                onClick={handleBulkUpload}
                size="lg"
                className="w-full h-14 text-lg rounded-xl shadow-md gap-2"
              >
                <Upload className="w-5 h-5" /> Importar Palavras
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cefr" className="mt-6">
          <Card className="border-border shadow-sm rounded-[24px]">
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
                    className="bg-secondary/20 border-border/50 shadow-sm transition-all hover:bg-secondary/40 rounded-2xl"
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
                        className="w-full h-12 rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
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
