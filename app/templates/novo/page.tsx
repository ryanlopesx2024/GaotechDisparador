import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NovoTemplatePage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-4">Novo Template</h1>
      </div>

      <Tabs defaultValue="whatsapp">
        <TabsList className="mb-4">
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Template de WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input id="template-name" placeholder="Ex: Boas-vindas" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-content">Conteúdo</Label>
                <Textarea
                  id="template-content"
                  placeholder="Digite o conteúdo do template. Use {nome} para incluir o nome do destinatário."
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Salvar Template</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Template de Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-template-name">Nome do Template</Label>
                <Input id="email-template-name" placeholder="Ex: Newsletter" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Assunto</Label>
                <Input id="email-subject" placeholder="Digite o assunto do email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-template-content">Conteúdo</Label>
                <Textarea
                  id="email-template-content"
                  placeholder="Digite o conteúdo do template. Use {nome} para incluir o nome do destinatário."
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Salvar Template</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
