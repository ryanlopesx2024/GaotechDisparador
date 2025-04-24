"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Tipo para métricas por dia
interface DailyMetrics {
  name: string // Data formatada
  whatsapp: number
  email: number
}

export function Overview() {
  const [data, setData] = useState<DailyMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDailyMetrics() {
      try {
        const response = await fetch("/api/metrics/byDay")
        if (!response.ok) {
          throw new Error("Failed to fetch daily metrics")
        }
        const metricsData = await response.json()
        
        // Transformar dados recebidos no formato esperado pelo gráfico
        const formattedData: DailyMetrics[] = []
        const dates = new Set([
          ...Object.keys(metricsData.whatsapp || {}),
          ...Object.keys(metricsData.email || {})
        ])
        
        // Ordenar datas
        const sortedDates = Array.from(dates).sort()
        
        sortedDates.forEach(date => {
          formattedData.push({
            name: formatDate(date), // Formatação da data
            whatsapp: metricsData.whatsapp[date]?.total || 0,
            email: metricsData.email[date]?.total || 0
          })
        })
        
        setData(formattedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        // Usar dados de exemplo em caso de erro
        setData(sampleData)
      } finally {
        setLoading(false)
      }
    }

    fetchDailyMetrics()
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchDailyMetrics, 300000)
    return () => clearInterval(interval)
  }, [])

  // Formatar data YYYY-MM-DD para DD/MM
  function formatDate(dateStr: string): string {
    try {
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}`
    } catch {
      return dateStr
    }
  }

  // Se não tiver dados reais, mostrar dados de exemplo
  if (data.length === 0 && !loading && !error) {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={sampleData}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
          <Tooltip />
          <Bar dataKey="email" fill="#adfa1d" radius={[4, 4, 0, 0]} className="fill-primary" />
          <Bar dataKey="whatsapp" fill="#82ca9d" radius={[4, 4, 0, 0]} className="fill-blue-400" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="email" fill="#adfa1d" radius={[4, 4, 0, 0]} className="fill-primary" />
        <Bar dataKey="whatsapp" fill="#82ca9d" radius={[4, 4, 0, 0]} className="fill-blue-400" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Dados de exemplo para o caso de não haver dados disponíveis
const sampleData = [
  { name: "01/07", whatsapp: 400, email: 240 },
  { name: "02/07", whatsapp: 300, email: 139 },
  { name: "03/07", whatsapp: 200, email: 980 },
  { name: "04/07", whatsapp: 278, email: 390 },
  { name: "05/07", whatsapp: 189, email: 480 },
  { name: "06/07", whatsapp: 239, email: 380 },
  { name: "07/07", whatsapp: 349, email: 430 },
]
