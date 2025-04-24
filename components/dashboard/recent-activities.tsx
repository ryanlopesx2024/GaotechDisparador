"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Users, FileText } from "lucide-react"

interface Activity {
  id: string
  user: string
  action: string
  type: "whatsapp" | "email" | "user" | "template"
  timestamp: string
  timeAgo: string
}

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Em um ambiente de produção, isso seria uma chamada à API real
    const fetchRecentActivities = async () => {
      try {
        setLoading(true)
        
        // Simulação de dados de atividades recentes
        const mockActivities: Activity[] = [
          {
            id: "1",
            user: "Carlos Silva",
            action: "enviou 50 mensagens WhatsApp",
            type: "whatsapp",
            timestamp: "2025-04-15T14:25:00",
            timeAgo: "há 5 minutos"
          },
          {
            id: "2",
            user: "Ana Oliveira",
            action: "adicionou 25 novos usuários",
            type: "user",
            timestamp: "2025-04-15T13:30:00",
            timeAgo: "há 1 hora"
          },
          {
            id: "3",
            user: "Roberto Martins",
            action: "enviou campanha de email",
            type: "email",
            timestamp: "2025-04-15T11:45:00",
            timeAgo: "há 3 horas"
          },
          {
            id: "4",
            user: "Juliana Santos",
            action: "criou template de WhatsApp",
            type: "template",
            timestamp: "2025-04-15T10:15:00",
            timeAgo: "há 4 horas"
          },
          {
            id: "5",
            user: "Lucas Ferreira",
            action: "enviou 10 emails para clientes",
            type: "email",
            timestamp: "2025-04-15T09:20:00",
            timeAgo: "há 5 horas"
          }
        ]
        
        setActivities(mockActivities)
      } catch (error) {
        console.error("Erro ao carregar atividades recentes:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecentActivities()
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchRecentActivities, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
  
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "email":
        return <Mail className="h-4 w-4 text-blue-500" />
      case "user":
        return <Users className="h-4 w-4 text-purple-500" />
      case "template":
        return <FileText className="h-4 w-4 text-orange-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#00979B]">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Carregando atividades...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma atividade recente encontrada.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 