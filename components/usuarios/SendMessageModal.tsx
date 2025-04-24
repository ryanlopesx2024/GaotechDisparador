"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Mail } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  tags: string[]
  createdAt: string
}

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  selectedUsers: User[]
}

interface SendResult {
  success: number
  failure: number
  details: {
    success: Array<{ id: string; name: string }>
    failure: Array<{ id: string; name: string; error: string }>
  }
}

export function SendMessageModal({ isOpen, onClose, selectedUsers }: SendMessageModalProps) {
  const [activeTab, setActiveTab] = useState("whatsapp")
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SendResult | null>(null)

  const handleSendWhatsApp = async () => {
    if (!whatsappMessage.trim()) {
      setError("A mensagem é obrigatória")
      return
    }

    if (selectedUsers.length === 0) {
      setError("Selecione pelo menos um usuário")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch("http://localhost:3002/api/bulk/whatsapp/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedUsers.map(user => user.id),
          text: whatsappMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao enviar mensagens")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar mensagens")
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      setError("Assunto e mensagem são obrigatórios")
      return
    }

    if (selectedUsers.length === 0) {
      setError("Selecione pelo menos um usuário")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch("http://localhost:3002/api/bulk/email/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedUsers.map(user => user.id),
          subject: emailSubject,
          html: emailMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao enviar emails")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar emails")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setWhatsappMessage("")
    setEmailSubject("")
    setEmailMessage("")
    setError(null)
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Enviar Mensagem para {selectedUsers.length} Usuários</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            {result && (
              <div className={`border px-4 py-2 rounded mb-4 ${
                result.failure === 0 
                  ? "bg-green-100 border-green-400 text-green-700" 
                  : result.success === 0 
                    ? "bg-red-100 border-red-400 text-red-700"
                    : "bg-yellow-100 border-yellow-400 text-yellow-700"
              }`}>
                <p>Resultado do envio:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Enviados com sucesso: {result.success}</li>
                  <li>Falhas: {result.failure}</li>
                </ul>
              </div>
            )}

            <TabsContent value="whatsapp" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp-message">Mensagem</Label>
                  <Textarea
                    id="whatsapp-message"
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Digite sua mensagem para WhatsApp"
                    rows={6}
                  />
                </div>
                
                <div>
                  <Button 
                    onClick={handleSendWhatsApp} 
                    disabled={loading} 
                    className="w-full"
                  >
                    {loading ? "Enviando..." : "Enviar por WhatsApp"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email-subject">Assunto</Label>
                  <Input
                    id="email-subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Assunto do email"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email-message">Mensagem</Label>
                  <Textarea
                    id="email-message"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Conteúdo do email (suporta HTML)"
                    rows={6}
                  />
                </div>
                
                <div>
                  <Button 
                    onClick={handleSendEmail} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Enviando..." : "Enviar por Email"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 