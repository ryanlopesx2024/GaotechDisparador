"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function NovoUsuarioPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!formData.email && !formData.phone) {
      toast.error('Email ou telefone é obrigatório')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao adicionar usuário')
      }

      const data = await response.json()
      setSuccess(true)
      toast.success('Usuário adicionado com sucesso!')
      
      // Limpar o formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        tags: '',
      })
      
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      tags: '',
    })
  }

  const handleDeleteAllUsers = async () => {
    if (!confirm('Tem certeza que deseja apagar TODOS os usuários? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir usuários')
      }

      toast.success('Todos os usuários foram excluídos com sucesso!')
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Usuário</CardTitle>
            <CardDescription>Preencha os dados do usuário que deseja adicionar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="5511999887766"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500">Formato: código do país + DDD + número (ex: 5511999887766)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="cliente, vip, prospect"
                  value={formData.tags}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500">Separe as tags por vírgula</p>
              </div>
              
              <div className="flex justify-between gap-4 pt-4">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Limpar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Usuário'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/usuarios')}>
              Voltar para Lista
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllUsers} disabled={loading}>
              Excluir Todos os Usuários
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 