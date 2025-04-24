import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RecentActivityProps {
  showAll?: boolean
}

export function RecentActivity({ showAll = false }: RecentActivityProps) {
  const activities = [
    {
      user: {
        name: "Carlos Silva",
        email: "carlos@gaotech.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "CS",
      },
      action: "enviou 50 mensagens WhatsApp",
      timestamp: "há 5 minutos",
    },
    {
      user: {
        name: "Ana Oliveira",
        email: "ana@gaotech.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "AO",
      },
      action: "adicionou 25 novos usuários",
      timestamp: "há 1 hora",
    },
    {
      user: {
        name: "Roberto Martins",
        email: "roberto@gaotech.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "RM",
      },
      action: "enviou campanha de email",
      timestamp: "há 3 horas",
    },
    {
      user: {
        name: "Juliana Costa",
        email: "juliana@gaotech.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "JC",
      },
      action: "filtrou usuários por setor",
      timestamp: "há 5 horas",
    },
    {
      user: {
        name: "Marcos Pereira",
        email: "marcos@gaotech.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MP",
      },
      action: "atualizou template de mensagem",
      timestamp: "há 1 dia",
    },
    {
      user: {
        name: "Fernanda Lima",
        email: "fernanda@gaotech.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "FL",
      },
      action: "criou nova campanha",
      timestamp: "há 2 dias",
    },
    {
      user: {
        name: "Ricardo Souza",
        email: "ricardo@gaotech.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "RS",
      },
      action: "exportou relatório de desempenho",
      timestamp: "há 3 dias",
    },
  ]

  const displayActivities = showAll ? activities : activities.slice(0, 5)

  return (
    <div className="space-y-8">
      {displayActivities.map((activity, index) => (
        <div className="flex items-center" key={index}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.user.name}</p>
            <p className="text-sm text-muted-foreground">{activity.action}</p>
          </div>
          <div className="ml-auto font-medium text-sm text-muted-foreground">{activity.timestamp}</div>
        </div>
      ))}
    </div>
  )
}
