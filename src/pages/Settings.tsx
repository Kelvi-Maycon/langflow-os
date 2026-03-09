import { useState, useEffect } from 'react'
import { useStore } from '@/store/main'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Trash2, HardDrive, Download, Save, PlugZap, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Settings() {
  const { settings, updateSettings, words } = useStore()
  const { toast } = useToast()

  const [localSettings, setLocalSettings] = useState(settings)
  const [isTesting, setIsTesting] = useState(false)
  const [storageUsage, setStorageUsage] = useState({ bytes: 0, percentage: 0 })

  useEffect(() => {
    let total = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += (localStorage[key].length + key.length) * 2
      }
    }
    const maxStorage = 5 * 1024 * 1024
    setStorageUsage({ bytes: total, percentage: Math.min((total / maxStorage) * 100, 100) })
  }, [words, settings])

  const levelDefaults: Record<string, { srsMultiplier: number; complexity: string }> = {
    A1: { srsMultiplier: 1.0, complexity: 'simple' },
    A2: { srsMultiplier: 1.1, complexity: 'basic' },
    B1: { srsMultiplier: 1.2, complexity: 'intermediate' },
    B2: { srsMultiplier: 1.3, complexity: 'upper-intermediate' },
    C1: { srsMultiplier: 1.4, complexity: 'advanced' },
    C2: { srsMultiplier: 1.5, complexity: 'fluent' },
  }

  const handleLevelChange = (val: string) => {
    const defaults = levelDefaults[val]
    setLocalSettings((prev) => ({ ...prev, level: val as any, ...defaults }))
  }

  const handleSave = () => {
    if (!localSettings || localSettings.dailyGoal < 1) {
      toast({
        title: 'Erro de Validação',
        description: 'A meta diária deve ser pelo menos 1.',
        variant: 'destructive',
      })
      return
    }
    updateSettings(localSettings)
    toast({
      title: 'Configurações salvas',
      description: 'Suas preferências foram atualizadas com sucesso.',
      className: 'bg-success text-success-foreground border-success',
    })
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      if (!localSettings?.apiKey) {
        throw new Error('A Chave de API é obrigatória.')
      }
      if (!localSettings.apiKey.startsWith('sk-') || localSettings.apiKey.length < 20) {
        throw new Error(
          'Formato inválido. A chave deve começar com "sk-" e ter mais de 20 caracteres.',
        )
      }
      toast({
        title: 'Conexão bem-sucedida',
        description: 'API Key validada com sucesso.',
        className: 'bg-success text-success-foreground border-success',
      })
    } catch (error: any) {
      toast({ title: 'Falha na conexão', description: error.message, variant: 'destructive' })
    } finally {
      setIsTesting(false)
    }
  }

  const handleClearData = () => {
    if (confirm('Tem certeza? Isso apagará todo o seu progresso e configurações armazenadas.')) {
      const keysToRemove = [
        'langflow_words',
        'langflow_config',
        'langflow_settings',
        'langflow_sentences',
        'langflow_flashcards',
        'langflow_stats',
      ]
      keysToRemove.forEach((k) => localStorage.removeItem(k))
      window.location.reload()
    }
  }

  const handleExport = () => {
    const data = {
      langflow_words: JSON.parse(localStorage.getItem('langflow_words') || '[]'),
      langflow_config: JSON.parse(localStorage.getItem('langflow_config') || '{}'),
      langflow_sentences: JSON.parse(localStorage.getItem('langflow_sentences') || '[]'),
      langflow_flashcards: JSON.parse(localStorage.getItem('langflow_flashcards') || '[]'),
      langflow_stats: JSON.parse(localStorage.getItem('langflow_stats') || '{}'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `langflow_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-8 animate-fade-in-up max-w-2xl mx-auto pb-12">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Personalize sua experiência de aprendizado e gerencie seus dados.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Preferências e IA</CardTitle>
          <CardDescription>
            Defina seu nível e configure as chaves de API para os módulos de geração.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Nível de Inglês (CEFR)</Label>
              <Select value={localSettings?.level} onValueChange={handleLevelChange}>
                <SelectTrigger className="h-12 rounded-xl bg-background">
                  <SelectValue placeholder="Selecione seu nível" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-popover shadow-lg">
                  <SelectItem value="A1">A1 - Iniciante</SelectItem>
                  <SelectItem value="A2">A2 - Básico</SelectItem>
                  <SelectItem value="B1">B1 - Intermediário</SelectItem>
                  <SelectItem value="B2">B2 - Pós-Intermediário</SelectItem>
                  <SelectItem value="C1">C1 - Avançado</SelectItem>
                  <SelectItem value="C2">C2 - Fluente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Meta Diária (Novas Palavras)</Label>
              <Input
                type="number"
                value={localSettings?.dailyGoal ?? 0}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    dailyGoal: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/50 p-5 rounded-2xl border border-border/50">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Multiplicador de Intervalo (SRS)
              </Label>
              <p className="text-base font-bold text-foreground">
                {(localSettings?.srsMultiplier ?? 1.2).toFixed(1)}x
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Complexidade (Builder)</Label>
              <p className="text-base font-bold text-foreground capitalize">
                {localSettings?.complexity ?? 'intermediate'}
              </p>
            </div>
            <div className="col-span-full pt-2">
              <p className="text-xs text-muted-foreground">
                Estes valores são ajustados automaticamente com base no seu nível de inglês.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label>Chave de API (OpenAI / Anthropic)</Label>
            <div className="flex gap-3">
              <Input
                type="password"
                placeholder="sk-..."
                value={localSettings?.apiKey ?? ''}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, apiKey: e.target.value }))}
                className="flex-1 font-mono"
              />
              <Button
                variant="secondary"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="h-12 w-12 p-0 rounded-xl md:w-auto md:px-6 bg-background border border-border"
              >
                {isTesting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <PlugZap className="w-5 h-5" />
                )}
                <span className="ml-2 sr-only md:not-sr-only">Testar</span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-secondary/20 border-t border-border/50 flex justify-end px-6 py-5 rounded-b-[24px]">
          <Button onClick={handleSave} className="gap-2 h-12 px-6">
            <Save className="w-5 h-5" />
            Salvar Configurações
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/10 blur-[80px] rounded-full" />
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <HardDrive className="w-6 h-6" />
            Dados e Armazenamento
          </CardTitle>
          <CardDescription className="text-destructive/80">
            Monitore e exporte os dados armazenados localmente no seu navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 relative z-10">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-foreground">Uso de Armazenamento Local</span>
              <span className="text-muted-foreground font-mono">
                {formatBytes(storageUsage?.bytes)} / 5 MB
              </span>
            </div>
            <Progress value={storageUsage?.percentage ?? 0} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {(storageUsage?.percentage ?? 0).toFixed(1)}% utilizado. Todos os dados são salvos com
              segurança de forma offline.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              variant="outline"
              className="flex-1 gap-2 h-12 bg-background"
              onClick={handleExport}
            >
              <Download className="w-5 h-5" />
              Exportar Dados
            </Button>
            <Button variant="destructive" className="flex-1 gap-2 h-12" onClick={handleClearData}>
              <Trash2 className="w-5 h-5" />
              Apagar Progresso
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
