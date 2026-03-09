import { useMemo } from 'react'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useStore } from '@/store/main'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card } from '@/components/ui/card'

export function EvolutionActivityChart() {
  const { stats } = useStore()

  const data = useMemo(() => {
    const history = stats.activityHistory || []
    const result = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const entry = history.find((h) => h.date === dateStr)
      result.push({
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        interacoes: entry ? entry.count : 0,
      })
    }
    return result
  }, [stats.activityHistory])

  const config = {
    interacoes: { label: 'Interações Diárias', color: 'hsl(var(--primary))' },
  }

  return (
    <Card className="p-6 bg-card border-border shadow-sm rounded-[24px] hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">Histórico de Engajamento</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Consistência diária nos últimos 30 dias.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
          Mês Atual
        </div>
      </div>

      <ChartContainer config={config} className="h-[280px] w-full">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
          <defs>
            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-interacoes)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-interacoes)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
            opacity={0.6}
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            minTickGap={25}
            tickMargin={10}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
          <Area
            type="monotone"
            dataKey="interacoes"
            stroke="var(--color-interacoes)"
            strokeWidth={3}
            fill="url(#colorActivity)"
            activeDot={{
              r: 6,
              fill: 'var(--color-interacoes)',
              stroke: 'hsl(var(--background))',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  )
}
