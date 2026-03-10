import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-12 min-h-[400px] animate-fade-in-up bg-secondary/20 rounded-[24px] border border-dashed border-border/60',
        className,
      )}
    >
      <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center border border-border shadow-sm mb-6 text-muted-foreground/60">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-foreground tracking-tight mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-md text-base mb-8 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
