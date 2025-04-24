"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ArrowUpIcon, ArrowDownIcon, MessageSquare, Mail } from "lucide-react"

interface MetricsSummary {
  whatsapp: {
    total: number
    success: number
    failed: number
    successRate: string
  }
  email: {
    total: number
    success: number
    failed: number
    successRate: string
  }
  total: {
    messages: number
    success: number
    failed: number
  }
}

export function MetricsSummary() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/metrics/summary")
        if (!response.ok) {
          throw new Error("Failed to fetch metrics")
        }
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error("Error fetching metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    // Atualizar a cada 60 segundos
    const interval = setInterval(fetchMetrics, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div>Carregando métricas...</div>
  }

  if (error) {
    return <div>Erro ao carregar métricas: {error}</div>
  }

  if (!metrics) {
    return <div>Nenhuma métrica disponível</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total.messages}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.total.success} enviadas com sucesso
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
          <MessageSquare className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.whatsapp.total}</div>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground">
              Taxa de sucesso: {metrics.whatsapp.successRate}
            </p>
            {parseFloat(metrics.whatsapp.successRate) > 90 ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">E-mails</CardTitle>
          <Mail className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.email.total}</div>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground">
              Taxa de sucesso: {metrics.email.successRate}
            </p>
            {parseFloat(metrics.email.successRate) > 90 ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Falhas</CardTitle>
          <div className="h-4 w-4 rounded-full bg-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total.failed}</div>
          <p className="text-xs text-muted-foreground">
            {((metrics.total.failed / metrics.total.messages) * 100).toFixed(2)}% de falhas
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 