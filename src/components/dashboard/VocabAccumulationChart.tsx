import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useStore } from '@/store/main'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BookOpen } from 'lucide-react'

export function VocabAccumulationChart() {
  const { words } = useStore()

  const data = useMemo(() => {
    const result = []
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const wordsPerDay: Record<string, number> = {}
    words.forEach((w) => {
      const createdAt = w.createdAt || Date.now()
      const d = new Date(createdAt).toISOString().split('T')[0]
      wordsPerDay[d] = (wordsPerDay[d] || 0) + 1
    })

    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(today.getDate() - 90)

    let baseCount = words.filter(
      (w) => (w.createdAt || Date.now()) < ninetyDaysAgo.getTime(),
    ).length

    for (let i = 89; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]

      baseCount += wordsPerDay[dateStr] || 0

      result.push({
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        acumulado: baseCount,
      })
    }
    return result
  }, [words])

  const chartConfig = {
    acumulado: {
      label: 'Total de Palavras',
      color: 'hsl(var(--success))',
    },
  }

  return (
    <Card className="p-6 md:p-8 bg-card border-border shadow-sm rounded-[24px] hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Acúmulo de Vocabulário <BookOpen className="w-5 h-5 text-success" />
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Crescimento contínuo do seu dicionário
          </p>
        </div>
        <div className="px-3 py-1.5 bg-success/10 text-success text-xs font-bold rounded-full border border-success/20 shadow-sm">
          Últimos 90 dias
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
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
                width={35}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Area
                type="monotone"
                dataKey="acumulado"
                stroke="hsl(var(--success))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAcumulado)"
                activeDot={{
                  r: 6,
                  fill: 'hsl(var(--success))',
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
