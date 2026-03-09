import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Zap, BrainCircuit, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const mainNav = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/reader', label: 'Biblioteca', icon: BookOpen },
  { path: '/practice', label: 'Prática Rápida', icon: Zap, badge: 'HOT' },
  { path: '/flashcards', label: 'Revisão', icon: BrainCircuit },
]

function SidebarContent() {
  const location = useLocation()

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-border text-sidebar-foreground w-full">
      <div className="p-6 flex items-center gap-3 font-bold text-xl tracking-tight mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary shadow-sm flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground fill-current" />
        </div>
        LangFlow
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8">
        <div>
          <h4 className="text-[10px] font-bold text-sidebar-foreground/50 tracking-widest uppercase mb-3 px-4">
            Menu Principal
          </h4>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:scale-[1.02]',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform group-hover:scale-110',
                      isActive && 'text-primary',
                    )}
                  />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-pink-500 text-white text-[9px] px-2 py-0.5 rounded-sm font-bold shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 mt-auto">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/50 border border-border hover:bg-secondary transition-colors"
        >
          <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
            <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
            <AvatarFallback>BS</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">Bruno Silva</span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider">
              PLANO PRO
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-sidebar border-b border-border z-10 shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-sidebar-foreground">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-primary-foreground fill-current" />
          </div>
          LangFlow
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-sidebar border-r-border w-[280px]">
            <SheetTitle className="sr-only">Menu Principal</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] shrink-0 z-10">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-background">
        <div className="max-w-[1400px] mx-auto w-full p-4 md:p-8 lg:px-12">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
