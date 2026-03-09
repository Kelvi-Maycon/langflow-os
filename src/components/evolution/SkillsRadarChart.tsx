import { useMemo } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { useStore } from '@/store/main'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card } from '@/components/ui/card'

export function SkillsRadarChart() {
  const { stats, words } = useStore()

  const data = useMemo(() => {
    // Map existing stats into 0-100 scores to represent different skill masteries
    const vocabScore = Math.min((words.length / 500) * 100, 100) || 5
    const consScore = Math.min((stats.streak / 30) * 100, 100) || 5
    const retScore = stats.flashcardAttempts
      ? (stats.flashcardCorrect / stats.flashcardAttempts) * 100
      : 5
    const accScore = stats.practiceAttempts
      ? (stats.practiceCorrect / stats.practiceAttempts) * 100
      : 5
    const writingScore = Math.min(((stats.dailyPromptsHistory?.length || 0) / 10) * 100, 100) || 5

    return [
      { subject: 'Vocabulário', score: Math.round(vocabScore) },
      { subject: 'Retenção', score: Math.round(retScore) },
      { subject: 'Precisão', score: Math.round(accScore) },
      { subject: 'Escrita', score: Math.round(writingScore) },
      { subject: 'Consistência', score: Math.round(consScore) },
    ]
  }, [stats, words])

  const config = {
    score: { label: 'Maestria (%)', color: 'hsl(var(--primary))' },
  }

  return (
    <Card className="p-6 bg-card border-border shadow-sm rounded-[24px] h-full flex flex-col group hover:shadow-md transition-all duration-300">
      <h3 className="text-xl font-bold text-foreground mb-2">Equilíbrio de Habilidades</h3>
      <p className="text-sm text-muted-foreground mb-4">Visão geral do seu desempenho.</p>

      <ChartContainer config={config} className="flex-1 w-full min-h-[250px] relative z-10">
        <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid gridType="polygon" stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Radar
            name="Maestria"
            dataKey="score"
            fill="var(--color-score)"
            fillOpacity={0.35}
            stroke="var(--color-score)"
            strokeWidth={2}
            className="group-hover:fill-opacity-50 transition-all duration-500"
          />
        </RadarChart>
      </ChartContainer>
    </Card>
  )
}
