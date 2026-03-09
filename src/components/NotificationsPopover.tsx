import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, Settings, Trash2 } from 'lucide-react'
import { useStore } from '@/store/main'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } =
    useStore()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-muted/50"
        >
          <Bell className="h-[1.2rem] w-[1.2rem] text-muted-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive border-[1.5px] border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0 shadow-xl border-border/50 rounded-2xl md:mr-4"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h4 className="font-semibold text-sm tracking-tight">Notificações</h4>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={markAllNotificationsAsRead}
                title="Marcar todas como lidas"
              >
                <Check className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:text-destructive"
                onClick={clearNotifications}
                title="Limpar todas"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>

        <div className="h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                <Bell className="h-6 w-6 opacity-40" />
              </div>
              <p className="text-sm">Nenhuma notificação nova</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (!notification.read) markNotificationAsRead(notification.id)
                  }}
                  className={cn(
                    'flex flex-col items-start gap-1 p-4 text-left transition-colors hover:bg-muted/50 border-b border-border/50 last:border-0',
                    !notification.read ? 'bg-primary/5' : 'bg-transparent',
                  )}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span
                      className={cn(
                        'font-medium text-sm leading-tight',
                        !notification.read && 'text-primary',
                      )}
                    >
                      {notification.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap font-medium">
                      {new Intl.DateTimeFormat('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(notification.date))}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    {notification.body}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-border/50 bg-muted/10">
          <Button
            asChild
            variant="ghost"
            className="w-full text-xs h-9 justify-center gap-2 rounded-xl"
            onClick={() => setOpen(false)}
          >
            <Link to="/settings">
              <Settings className="h-3.5 w-3.5" />
              Configurar Notificações
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
