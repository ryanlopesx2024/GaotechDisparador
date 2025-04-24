"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserFilters } from "@/components/usuarios/user-filters"
import { Send, Upload } from "lucide-react"
import Link from "next/link"

export function WhatsAppMessaging() {
  const [selectedTab, setSelectedTab] = useState("message")

  return (
    <Tabs defaultValue="message" className="space-y-4" onValueChange={setSelectedTab}>
      <TabsList className="bg-gray-100">
        <TabsTrigger value="message" className="data-[state=active]:bg-[#00979B] data-[state=active]:text-white">
          Mensagem
        </TabsTrigger>
        <TabsTrigger value="recipients" className="data-[state=active]:bg-[#00979B] data-[state=active]:text-white">
          Destinatários
        </TabsTrigger>
      </TabsList>
      <TabsContent value="message" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#00979B]">Mensagem WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Campanha</Label>
              <Input id="title" placeholder="Ex: Promoção de Verão" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea id="message" placeholder="Digite sua mensagem aqui..." className="min-h-[150px]" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="attachment">Anexo (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input id="attachment" type="file" className="hidden" />
                  <Button
                    variant="outline"
                    className="w-full border-[#00979B] text-[#00979B] hover:bg-[#00979B] hover:text-white"
                    asChild
                  >
                    <label htmlFor="attachment" className="flex items-center justify-center cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar arquivo
                    </label>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Usar template</Label>
                <Select>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="welcome">Boas-vindas</SelectItem>
                    <SelectItem value="promo">Promoção</SelectItem>
                    <SelectItem value="followup">Acompanhamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/templates/novo">
              <Button variant="outline" className="border-[#00979B] text-[#00979B] hover:bg-[#00979B] hover:text-white">
                Salvar como template
              </Button>
            </Link>
            <Button onClick={() => setSelectedTab("recipients")} className="bg-[#00979B] hover:bg-[#007a7c]">
              Próximo
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="recipients" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#00979B]">Selecionar Destinatários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UserFilters />
            <div className="mt-4 p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Destinatários selecionados</h3>
                <span className="text-sm text-muted-foreground">Total: 125 contatos</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setSelectedTab("message")}
              className="border-[#00979B] text-[#00979B] hover:bg-[#00979B] hover:text-white"
            >
              Voltar
            </Button>
            <Button className="flex items-center bg-[#00979B] hover:bg-[#007a7c]">
              <Send className="mr-2 h-4 w-4" />
              Enviar Mensagens
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
