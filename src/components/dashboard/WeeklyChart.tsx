import { Card } from '@/components/ui/card'
import { Bar, BarChart, ResponsiveContainer, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { day: 'S', value: 40 },
  { day: 'T', value: 65 },
  { day: 'Q', value: 45 },
  { day: 'Q ', value: 100, isCurrent: true },
  { day: 'S ', value: 30 },
  { day: 'S  ', value: 20 },
  { day: 'D', value: 15 },
]

const chartConfig = {
  value: {
    label: 'Atividade',
    color: 'hsl(var(--primary))',
  },
}

export function WeeklyChart() {
  return (
    <Card className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-300 rounded-[24px]">
      <div className="flex items-center justify-between mb-8">
        <h4 className="font-bold text-foreground">Atividade Semanal</h4>
        <span className="text-[10px] font-bold bg-secondary px-2 py-1 rounded-md text-muted-foreground border border-border">
          ESSA SEMANA
        </span>
      </div>

      <div className="h-[120px] w-full">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isCurrent ? '#F472B6' : 'hsl(var(--muted))'}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="flex justify-between mt-4 px-2">
        {data.map((item, i) => (
          <span
            key={i}
            className={`text-xs font-bold ${item.isCurrent ? 'text-primary' : 'text-muted-foreground/60'}`}
          >
            {item.day.trim()}
          </span>
        ))}
      </div>
    </Card>
  )
}
