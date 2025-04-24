"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Users, FileText } from "lucide-react"
import { QuickActionModal } from "@/components/dashboard/quick-action-modal"
import { Overview } from "@/components/dashboard/overview"
import { MetricsSummary } from "@/components/dashboard/metrics-summary"
import { RecentActivities } from "@/components/dashboard/recent-activities"

interface MetricsData {
  whatsapp: {
    total: number
  }
  email: {
    total: number
  }
  total: {
    messages: number
  }
}

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [actionType, setActionType] = useState<"user" | "whatsapp" | "email" | "template" | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)

  const handleOpenModal = (type: "user" | "whatsapp" | "email" | "template") => {
    setActionType(type)
    setModalOpen(true)
  }

  useEffect(() => {
    // Carregar métricas do servidor
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/metrics/summary")
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error("Error fetching metrics:", error)
      }
    }

    fetchMetrics()
    // Atualizar métricas a cada 60 segundos
    const interval = setInterval(fetchMetrics, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        {/* Resumo de métricas */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#00979B]">Resumo</h2>
          <MetricsSummary />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-[#00979B] border-t-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-[#00979B]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <div className="flex justify-end mt-4">
                <Link href="/usuarios">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#00979B] text-[#00979B] hover:bg-[#00979B] hover:text-white"
                  >
                    Gerenciar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#00979B] border-t-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
              <MessageSquare className="h-4 w-4 text-[#00979B]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.whatsapp?.total || 0}</div>
              <div className="flex justify-end mt-4">
                <Link href="/mensagens">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#00979B] text-[#00979B] hover:bg-[#00979B] hover:text-white"
                  >
                    Enviar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#00979B] border-t-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Emails</CardTitle>
              <Mail className="h-4 w-4 text-[#00979B]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.email?.total || 0}</div>
              <div className="flex justify-end mt-4">
                <Link href="/emails">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#00979B] text-[#00979B] hover:bg-[#00979B] hover:text-white"
                  >
                    Enviar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de métricas */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#00979B]">Estatísticas de Envio</CardTitle>
            </CardHeader>
            <CardContent>
              <Overview />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#00979B]">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                className="w-full justify-start bg-white text-[#00979B] border border-[#00979B] hover:bg-[#00979B] hover:text-white"
                onClick={() => handleOpenModal("user")}
              >
                <Users className="mr-2 h-4 w-4" />
                Adicionar Novo Usuário
              </Button>
              <Button
                className="w-full justify-start bg-white text-[#00979B] border border-[#00979B] hover:bg-[#00979B] hover:text-white"
                onClick={() => handleOpenModal("whatsapp")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Enviar WhatsApp
              </Button>
              <Button
                className="w-full justify-start bg-white text-[#00979B] border border-[#00979B] hover:bg-[#00979B] hover:text-white"
                onClick={() => handleOpenModal("email")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email
              </Button>
              <Button
                className="w-full justify-start bg-white text-[#00979B] border border-[#00979B] hover:bg-[#00979B] hover:text-white"
                onClick={() => handleOpenModal("template")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Criar Template
              </Button>
            </CardContent>
          </Card>

          <RecentActivities />
        </div>
      </div>

      <QuickActionModal open={modalOpen} actionType={actionType} onOpenChange={setModalOpen} />
    </div>
  )
}
