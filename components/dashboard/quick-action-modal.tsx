"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, MessageSquare, Users, FileText, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type ActionType = "user" | "whatsapp" | "email" | "template" | null

interface QuickActionModalProps {
  open: boolean
  actionType: ActionType
  onOpenChange: (open: boolean) => void
}

export function QuickActionModal({ open, actionType, onOpenChange }: QuickActionModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Dados do usuário
    name: '',
    email: '',
    phone: '',
    tags: '',
    
    // Dados de WhatsApp
    waNumber: '',
    waMessage: '',
    
    // Dados de Email
    emailTo: '',
    emailSubject: '',
    emailMessage: '',
    
    // Dados de Template
    templateName: '',
    templateType: 'whatsapp',
    templateContent: ''
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Lógica de cada tipo de ação
      if (actionType === "user") {
        // Adicionar usuário
        const response = await fetch('http://localhost:3001/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao adicionar usuário')
        }
        
        toast.success('Usuário adicionado com sucesso!')
      router.push("/usuarios")
      } 
      else if (actionType === "whatsapp") {
        // Enviar WhatsApp
        const response = await fetch('http://localhost:3001/api/evo/sendMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            number: formData.waNumber,
            text: formData.waMessage
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao enviar WhatsApp')
        }
        
        toast.success('Mensagem enviada com sucesso!')
      router.push("/mensagens")
      } 
      else if (actionType === "email") {
        // Enviar Email
        const response = await fetch('http://localhost:3002/api/mail/sendEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: formData.emailTo,
            subject: formData.emailSubject,
            text: formData.emailMessage,
            html: formData.emailMessage, // Usar o mesmo texto como HTML
            provider: 'gmail'
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao enviar email')
        }
        
        toast.success('Email enviado com sucesso!')
      router.push("/emails")
      } 
      else if (actionType === "template") {
        // Simular criação de template (no futuro, conectar com API real)
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success('Template criado com sucesso!')
      router.push("/templates")
      }
      
      // Limpar formulário e fechar modal
      resetFormData()
      onOpenChange(false)
      
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro na operação')
    } finally {
      setLoading(false)
    }
  }
  
  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      tags: '',
      waNumber: '',
      waMessage: '',
      emailTo: '',
      emailSubject: '',
      emailMessage: '',
      templateName: '',
      templateType: 'whatsapp',
      templateContent: ''
    })
  }

  const renderContent = () => {
    switch (actionType) {
      case "user":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-[#00979B]">
                <Users className="mr-2 h-5 w-5" />
                Adicionar Novo Usuário
              </DialogTitle>
              <DialogDescription>Preencha os dados abaixo para adicionar um novo usuário ao sistema.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome*</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nome completo" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email" 
                    placeholder="email@exemplo.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="5511999887766" 
                  />
                </div>
              </div>
                <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input 
                  id="tags" 
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="cliente, prospect, vip" 
                />
                <p className="text-xs text-muted-foreground">Separe as tags por vírgula</p>
              </div>
            </div>
          </>
        )
      case "whatsapp":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-[#00979B]">
                <MessageSquare className="mr-2 h-5 w-5" />
                Enviar WhatsApp Rápido
              </DialogTitle>
              <DialogDescription>Envie uma mensagem rápida para um contato.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="waNumber">Número*</Label>
                <Input 
                  id="waNumber" 
                  name="waNumber"
                  value={formData.waNumber}
                  onChange={handleInputChange}
                  placeholder="5511999887766" 
                  required
                />
                <p className="text-xs text-muted-foreground">Formato: código do país + DDD + número</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="waMessage">Mensagem*</Label>
                <Textarea 
                  id="waMessage" 
                  name="waMessage"
                  value={formData.waMessage}
                  onChange={handleInputChange}
                  placeholder="Digite sua mensagem aqui..." 
                  className="min-h-[100px]" 
                  required
                />
              </div>
            </div>
          </>
        )
      case "email":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-[#00979B]">
                <Mail className="mr-2 h-5 w-5" />
                Enviar Email Rápido
              </DialogTitle>
              <DialogDescription>Envie um email rápido para um contato.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="emailTo">Para*</Label>
                <Input 
                  id="emailTo" 
                  name="emailTo"
                  value={formData.emailTo}
                  onChange={handleInputChange}
                  type="email"
                  placeholder="destinatario@exemplo.com" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailSubject">Assunto*</Label>
                <Input 
                  id="emailSubject" 
                  name="emailSubject"
                  value={formData.emailSubject}
                  onChange={handleInputChange}
                  placeholder="Assunto do email" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailMessage">Conteúdo*</Label>
                <Textarea
                  id="emailMessage"
                  name="emailMessage"
                  value={formData.emailMessage}
                  onChange={handleInputChange}
                  placeholder="Digite o conteúdo do email aqui..."
                  className="min-h-[100px]"
                  required
                />
              </div>
            </div>
          </>
        )
      case "template":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center text-[#00979B]">
                <FileText className="mr-2 h-5 w-5" />
                Criar Template Rápido
              </DialogTitle>
              <DialogDescription>Crie um novo template para mensagens ou emails.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="templateType">Tipo de Template*</Label>
                <Select 
                  defaultValue={formData.templateType}
                  onValueChange={(value) => handleSelectChange('templateType', value)}
                >
                  <SelectTrigger id="templateType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateName">Nome do Template*</Label>
                <Input 
                  id="templateName" 
                  name="templateName"
                  value={formData.templateName}
                  onChange={handleInputChange}
                  placeholder="Ex: Boas-vindas" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateContent">Conteúdo*</Label>
                <Textarea
                  id="templateContent"
                  name="templateContent"
                  value={formData.templateContent}
                  onChange={handleInputChange}
                  placeholder="Digite o conteúdo do template. Use {nome} para incluir o nome do destinatário."
                  className="min-h-[100px]"
                  required
                />
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetFormData()
      onOpenChange(isOpen)
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          {renderContent()}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#00979B] hover:bg-[#007a7c] gap-1"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Enviar'}
              <Send className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
