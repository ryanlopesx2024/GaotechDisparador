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
import { Bold, Italic, Link, Send } from "lucide-react"

export function EmailMessaging() {
  const [selectedTab, setSelectedTab] = useState("compose")

  return (
    <Tabs defaultValue="compose" className="space-y-4" onValueChange={setSelectedTab}>
      <TabsList className="bg-gray-100">
        <TabsTrigger value="compose" className="data-[state=active]:bg-[#00979B] data-[state=active]:text-white">
          Compor Email
        </TabsTrigger>
        <TabsTrigger value="recipients" className="data-[state=active]:bg-[#00979B] data-[state=active]:text-white">
          Destinatários
        </TabsTrigger>
      </TabsList>
      <TabsContent value="compose" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#00979B]">Compor Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign">Nome da Campanha</Label>
              <Input id="campaign" placeholder="Ex: Newsletter Mensal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input id="subject" placeholder="Digite o assunto do email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-content">Conteúdo</Label>
              <div className="border rounded-md p-1 mb-2">
                <div className="flex items-center gap-1 border-b p-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#00979B]">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#00979B]">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#00979B]">
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="email-content"
                  placeholder="Escreva o conteúdo do seu email aqui..."
                  className="min-h-[150px] border-0 focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email-template">Usar template</Label>
                <Select>
                  <SelectTrigger id="email-template">
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="promo">Promoção</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="border-[#00979B] text-[#00979B] hover:bg-[#00979B] hover:text-white">
              Salvar como template
            </Button>
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
            <div className="space-y-2">
              <Label htmlFor="sender">Remetente</Label>
              <Select defaultValue="comercial">
                <SelectTrigger id="sender">
                  <SelectValue placeholder="Selecione o remetente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comercial">comercial@gaotech.com</SelectItem>
                  <SelectItem value="marketing">marketing@gaotech.com</SelectItem>
                  <SelectItem value="suporte">suporte@gaotech.com</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setSelectedTab("compose")}
              className="border-[#00979B] text-[#00979B] hover:bg-[#00979B] hover:text-white"
            >
              Voltar
            </Button>
            <Button className="flex items-center bg-[#00979B] hover:bg-[#007a7c]">
              <Send className="mr-2 h-4 w-4" />
              Enviar Emails
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
