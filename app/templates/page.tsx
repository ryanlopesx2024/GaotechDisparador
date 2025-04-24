import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"

export default function TemplatesPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#00979B]">Templates</h1>
        <Button className="bg-[#00979B] hover:bg-[#007a7c]">
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <Tabs defaultValue="whatsapp">
        <TabsList className="mb-4 bg-gray-100">
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-[#00979B] data-[state=active]:text-white">
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-[#00979B] data-[state=active]:text-white">
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Boas-vindas",
                description: "Olá {nome}, seja bem-vindo à Gaotech! Estamos felizes em tê-lo conosco.",
              },
              {
                title: "Promoção",
                description:
                  "{nome}, temos uma oferta especial para você! Aproveite 20% de desconto em nossos serviços.",
              },
              {
                title: "Acompanhamento",
                description: "Olá {nome}, como está sendo sua experiência com nossos serviços? Estamos à disposição.",
              },
            ].map((template, i) => (
              <Card key={i} className="border-[#B3B3B3] hover:border-[#00979B] transition-colors">
                <CardHeader>
                  <CardTitle className="text-base text-[#00979B]">{template.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#00979B] text-[#00979B] hover:bg-[#00979B] hover:text-white"
                  >
                    Editar
                  </Button>
                  <Button size="sm" className="bg-[#00979B] hover:bg-[#007a7c]">
                    Usar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Newsletter",
                description: "Template para newsletter mensal com as últimas novidades da Gaotech.",
              },
              {
                title: "Promoção",
                description: "Template para anúncio de promoções e ofertas especiais.",
              },
              {
                title: "Atualização",
                description: "Template para comunicar atualizações de produtos e serviços.",
              },
            ].map((template, i) => (
              <Card key={i} className="border-[#B3B3B3] hover:border-[#00979B] transition-colors">
                <CardHeader>
                  <CardTitle className="text-base text-[#00979B]">{template.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#00979B] text-[#00979B] hover:bg-[#00979B] hover:text-white"
                  >
                    Editar
                  </Button>
                  <Button size="sm" className="bg-[#00979B] hover:bg-[#007a7c]">
                    Usar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
