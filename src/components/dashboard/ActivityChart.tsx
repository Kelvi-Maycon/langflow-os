import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useStore } from '@/store/main'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

type TimeRange = '7' | '30' | '90'

export function ActivityChart() {
  const { stats } = useStore()
  const [range, setRange] = useState<TimeRange>('30')

  const data = useMemo(() => {
    const history = stats.activityHistory || []
    const result = []
    const days = parseInt(range)
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const entry = history.find((h) => h.date === dateStr)
      result.push({
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        praticadas: entry ? entry.count : 0,
      })
    }
    return result
  }, [stats.activityHistory, range])

  const chartConfig = {
    praticadas: {
      label: 'Praticadas',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <Card className="p-6 md:p-8 bg-card border-border shadow-sm rounded-[24px] hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">
            Ritmo de Aprendizado
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Palavras e frases praticadas por dia</p>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary p-1.5 rounded-xl border border-border/60 shadow-inner">
          {(['7', '30', '90'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                range === r
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              {r} Dias
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={12}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                width={30}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Area
                type="monotone"
                dataKey="praticadas"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCount)"
                activeDot={{
                  r: 6,
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  )
}
