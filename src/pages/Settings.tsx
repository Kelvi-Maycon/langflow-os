import { useState, useEffect } from 'react'
import { useStore } from '@/store/main'
import { UserSettings } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import {
  Trash2,
  HardDrive,
  Download,
  Save,
  PlugZap,
  Loader2,
  Upload,
  Bell,
  Clock,
  Check,
} from 'lucide-react'
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

  const handleNotificationChange = async (key: keyof UserSettings, checked: boolean) => {
    if (checked && 'Notification' in window && Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        toast({
          title: 'Permissão Negada',
          description: 'Você precisa permitir notificações no navegador para ativar este recurso.',
          variant: 'destructive',
        })
        return
      }
    }
    setLocalSettings((prev) => ({ ...prev, [key]: checked }))
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
      if (localSettings.aiProvider === 'openai' && !localSettings.apiKey.startsWith('sk-')) {
        throw new Error('Formato de chave OpenAI inválido. Deve começar com "sk-".')
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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.langflow_words)
          localStorage.setItem('langflow_words', JSON.stringify(data.langflow_words))
        if (data.langflow_config)
          localStorage.setItem('langflow_config', JSON.stringify(data.langflow_config))
        if (data.langflow_stats)
          localStorage.setItem('langflow_stats', JSON.stringify(data.langflow_stats))
        toast({
          title: 'Importação Concluída',
          description: 'Recarregando a aplicação com os novos dados...',
          className: 'bg-success text-success-foreground',
        })
        setTimeout(() => window.location.reload(), 1500)
      } catch (err) {
        toast({
          title: 'Erro',
          description: 'Arquivo inválido para importação.',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto pb-12 pt-4">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Personalize sua experiência de aprendizado e gerencie seus dados.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Preferências de Ensino</CardTitle>
            <CardDescription>Ajuste o seu nível e metas diárias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
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

            <div className="grid grid-cols-2 gap-4 bg-secondary/50 p-4 rounded-2xl border border-border/50">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Multiplicador SRS</Label>
                <p className="text-base font-bold text-foreground">
                  {(localSettings?.srsMultiplier ?? 1.2).toFixed(1)}x
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Complexidade</Label>
                <p className="text-base font-bold text-foreground capitalize">
                  {localSettings?.complexity ?? 'intermediate'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <PlugZap className="w-5 h-5" />
              Provedor de IA
            </CardTitle>
            <CardDescription>
              A inteligência artificial é usada para criar exercícios e explicações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="space-y-3">
              <Label>Plataforma</Label>
              <Select
                value={localSettings?.aiProvider}
                onValueChange={(v) =>
                  setLocalSettings((prev) => ({ ...prev, aiProvider: v as any }))
                }
              >
                <SelectTrigger className="h-12 rounded-xl bg-background border-border shadow-sm">
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Modelo Recomendado</Label>
              <Select
                value={localSettings?.aiModel}
                onValueChange={(v) => setLocalSettings((prev) => ({ ...prev, aiModel: v }))}
              >
                <SelectTrigger className="h-12 rounded-xl bg-background border-border shadow-sm">
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  {localSettings?.aiProvider === 'openai' ? (
                    <>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Rápido)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o (Avançado)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Rápido)</SelectItem>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Avançado)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Chave de API</Label>
              <div className="flex gap-3">
                <Input
                  type="password"
                  placeholder={localSettings?.aiProvider === 'openai' ? 'sk-...' : 'AIzaSy...'}
                  value={localSettings?.apiKey ?? ''}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                  className="flex-1 font-mono bg-background"
                />
                <Button
                  variant="secondary"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="h-12 w-12 p-0 rounded-xl bg-background border border-border shadow-sm"
                >
                  {isTesting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col md:col-span-2 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notificações e Lembretes
            </CardTitle>
            <CardDescription>
              Configure como e quando você quer ser lembrado de estudar.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Prompt</Label>
                  <p className="text-sm text-muted-foreground">
                    Alerta diário para o desafio de escrita.
                  </p>
                </div>
                <Switch
                  checked={localSettings?.dailyPromptReminder || false}
                  onCheckedChange={(c) => handleNotificationChange('dailyPromptReminder', c)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label className="text-base">Sessão de Estudo (SRS)</Label>
                  <p className="text-sm text-muted-foreground">
                    Avisos de revisões pendentes no sistema.
                  </p>
                </div>
                <Switch
                  checked={localSettings?.studySessionReminder || false}
                  onCheckedChange={(c) => handleNotificationChange('studySessionReminder', c)}
                />
              </div>
            </div>

            <div className="space-y-3 bg-secondary/30 p-5 rounded-2xl border border-border/50">
              <Label className="text-base">Horário Preferido para Estudo</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Enviaremos lembretes inteligentes a partir deste horário, caso você ainda não tenha
                completado suas tarefas.
              </p>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="time"
                  value={localSettings?.preferredStudyTime || '18:00'}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, preferredStudyTime: e.target.value }))
                  }
                  className="pl-10 h-12 bg-background shadow-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4 pb-8 border-b border-border/60">
        <Button onClick={handleSave} size="lg" className="gap-2 h-14 px-8 rounded-full shadow-md">
          <Save className="w-5 h-5" />
          Salvar Alterações
        </Button>
      </div>

      <Card className="border-destructive/30 bg-destructive/5 relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <HardDrive className="w-6 h-6" />
            Dados e Armazenamento
          </CardTitle>
          <CardDescription className="text-destructive/80">
            Todos os seus dados são salvos localmente. Exporte um backup regularmente.
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
            <Progress value={storageUsage?.percentage ?? 0} className="h-3 bg-destructive/20" />
            <p className="text-xs text-muted-foreground">
              {(storageUsage?.percentage ?? 0).toFixed(1)}% utilizado no navegador.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Button
              variant="outline"
              className="gap-2 h-12 bg-background rounded-xl"
              onClick={handleExport}
            >
              <Download className="w-5 h-5" />
              Exportar
            </Button>
            <Label
              htmlFor="import-data"
              className="flex items-center justify-center gap-2 h-12 bg-background border border-border rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm font-medium text-sm"
            >
              <Upload className="w-5 h-5" />
              Importar Backup
              <input
                id="import-data"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </Label>
            <Button
              variant="destructive"
              className="gap-2 h-12 rounded-xl"
              onClick={handleClearData}
            >
              <Trash2 className="w-5 h-5" />
              Apagar Tudo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
