import { useMemo } from 'react'
import { Bar, BarChart, XAxis, YAxis, LabelList, Cell } from 'recharts'
import { useStore } from '@/store/main'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card } from '@/components/ui/card'

export function VocabFunnelChart() {
  const { words } = useStore()

  const data = useMemo(() => {
    const learning = words.filter((w) => w.status === 'learning' || w.interval === 0).length
    const builder = words.filter((w) => w.status === 'builder').length
    const srs = words.filter((w) => w.status === 'srs' && w.interval <= 21).length
    const mastered = words.filter((w) => w.status === 'mastered' || w.interval > 21).length

    return [
      { stage: 'Aprendizado', count: learning, fill: 'hsl(var(--muted-foreground))' },
      { stage: 'Construção', count: builder, fill: 'hsl(var(--primary))' },
      { stage: 'Revisão', count: srs, fill: 'hsl(var(--warning))' },
      { stage: 'Dominadas', count: mastered, fill: 'hsl(var(--success))' },
    ]
  }, [words])

  const config = {
    count: { label: 'Palavras', color: 'hsl(var(--primary))' },
  }

  return (
    <Card className="p-6 bg-card border-border shadow-sm rounded-[24px] h-full hover:shadow-md transition-all duration-300">
      <h3 className="text-xl font-bold text-foreground mb-2">Funil de Vocabulário</h3>
      <p className="text-sm text-muted-foreground mb-6">Métricas de transição do conhecimento.</p>

      <ChartContainer config={config} className="h-[250px] w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            dataKey="stage"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
            width={90}
          />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--secondary))' }}
            content={<ChartTooltipContent hideIndicator />}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              fill="hsl(var(--foreground))"
              fontSize={12}
              fontWeight={700}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </Card>
  )
}
