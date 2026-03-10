import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  BrainCircuit,
  TrendingUp,
  Library,
  Settings,
  Brain,
  Check,
  Plus,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
  SidebarSeparator,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { NotificationsPopover } from '@/components/NotificationsPopover'
import { useStore } from '@/store/main'

const mainNav = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/reader', label: 'Biblioteca', icon: BookOpen },
  { path: '/vocabulary', label: 'Vocabulário', icon: Library },
  { path: '/practice', label: 'Prática Rápida', icon: Zap, badge: 'HOT' },
  { path: '/flashcards', label: 'Revisão', icon: BrainCircuit },
  { path: '/evolution', label: 'Evolução', icon: TrendingUp },
]

const iconMap = {
  brain: Brain,
  book: BookOpen,
  zap: Zap,
  check: Check,
  plus: Plus,
  star: Star,
}

export function AppSidebar() {
  const location = useLocation()
  const { actionLogs } = useStore()

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-4">
        <Link
          to="/"
          className="flex items-center gap-3 font-bold text-xl tracking-tight text-foreground hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary shadow-sm flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          LangFlow
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold tracking-widest uppercase mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'h-10 transition-all duration-300 group rounded-xl px-3',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                      )}
                    >
                      <Link to={item.path}>
                        <Icon
                          className={cn(
                            'w-5 h-5 transition-transform group-hover:scale-110',
                            isActive && 'text-primary',
                          )}
                        />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-pink-500 text-white text-[9px] px-2 py-0.5 rounded-sm font-bold shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 mx-4" />

        <SidebarGroup className="flex-1 overflow-hidden flex flex-col">
          <SidebarGroupLabel className="text-[10px] font-bold tracking-widest uppercase mb-2">
            Atividade Recente
          </SidebarGroupLabel>
          <SidebarGroupContent className="overflow-y-auto pr-2">
            {actionLogs && actionLogs.length > 0 ? (
              <div className="space-y-4 px-2 py-2">
                {actionLogs.slice(0, 10).map((log) => {
                  const LogIcon = iconMap[log.icon as keyof typeof iconMap] || Check
                  return (
                    <div
                      key={log.id}
                      className="flex gap-3 relative before:absolute before:left-[11px] before:top-8 before:bottom-[-20px] before:w-px before:bg-border last:before:hidden group/log"
                    >
                      <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 z-10 shadow-sm group-hover/log:scale-110 transition-transform">
                        <LogIcon className="w-3 h-3 text-muted-foreground group-hover/log:text-foreground transition-colors" />
                      </div>
                      <div className="flex flex-col pb-2">
                        <span className="text-sm font-medium leading-tight text-foreground">
                          {log.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {log.description}
                        </span>
                        <span className="text-[9px] text-muted-foreground/60 mt-1 uppercase font-bold tracking-wider">
                          {new Intl.DateTimeFormat('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          }).format(new Date(log.date))}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                <Brain className="w-8 h-8 opacity-20 mb-2" />
                <p>Nenhuma atividade ainda.</p>
                <p className="text-xs opacity-70">Complete lições para ver seu histórico aqui.</p>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Link
          to="/settings"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors border border-transparent hover:border-sidebar-border"
        >
          <Avatar className="w-10 h-10 border border-border shadow-sm">
            <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
            <AvatarFallback>BS</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold text-foreground leading-tight truncate">
              Bruno Silva
            </span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider truncate">
              PLANO PRO
            </span>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-background">
          <header className="flex items-center justify-between px-4 md:px-6 h-16 border-b border-border/50 bg-background/90 backdrop-blur sticky top-0 z-30 shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
              <div className="md:hidden flex items-center gap-2 font-bold text-lg tracking-tight text-foreground">
                LangFlow
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsPopover />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto relative w-full">
            <div className="max-w-[1400px] mx-auto w-full p-4 md:p-8 lg:px-12 pb-24">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
