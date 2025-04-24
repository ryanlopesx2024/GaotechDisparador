'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TagIcon, Users, Send, RefreshCw, Loader2 } from "lucide-react";

// URL base da API - usando URL relativa para evitar problemas de CORS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://prolific-fulfillment-production.up.railway.app/api';

// Função para tratar e formatar mensagens de erro
const formatErrorMessage = (data: any): string => {
  // Caso padrão
  let errorMessage = 'Verifique a conexão';
  
  try {
    // Se não tem dados, retorna mensagem padrão
    if (!data) return errorMessage;
    
    // Tratamento de array message com objetos de erro
    if (data && data.message && Array.isArray(data.message)) {
      const firstError = data.message[0];
      if (firstError) {
        // Caso específico: número não existe no WhatsApp
        if (firstError.exists === false) {
          return `O número ${firstError.number} não está ativo no WhatsApp`;
        }
        // Outros erros representados como objetos
        if (typeof firstError === 'object') {
          return JSON.stringify(firstError);
        }
      }
      // Array de strings
      if (typeof data.message[0] === 'string') {
        return data.message.join(', ');
      }
    }
    
    // Caso quando temos uma resposta aninhada
    if (data.response && data.response.message) {
      if (Array.isArray(data.response.message)) {
        const firstMsg = data.response.message[0];
        if (firstMsg && typeof firstMsg === 'object' && firstMsg.exists === false) {
          return `O número ${firstMsg.number} não está ativo no WhatsApp`;
        }
        return data.response.message.map((m: any) => 
          typeof m === 'object' ? JSON.stringify(m) : m
        ).join(', ');
      }
      return data.response.message;
    }
    
    // Outros casos comuns
    if (data.error) {
      return data.error;
    } else if (data.message && typeof data.message === 'string') {
      return data.message;
    } else if (data.internal_error) {
      return data.internal_error;
    } else if (data.details) {
      return typeof data.details === 'string' ? data.details : JSON.stringify(data.details);
    }
    
    // Se chegou aqui e ainda não tem mensagem, tenta obter de outros lugares
    if (typeof data === 'string') {
      return data;
    } else if (typeof data === 'object') {
      return JSON.stringify(data);
    }
    
    // Retorna mensagem padrão se nada funcionar
    return errorMessage;
  } catch (e) {
    console.error('Erro ao formatar mensagem de erro:', e);
    return errorMessage;
  }
};

interface Tag {
  id: string;
  name: string;
  count: number;
}

export default function MensagensPage() {
  const [activeTab, setActiveTab] = useState('individual');
  const [formData, setFormData] = useState({
    number: '',
    text: '',
    media: '',
    instance_name: 'desenvolvimento',
    email: '',
    subject: '',
    provider: ''
  });
  const [bulkFormData, setBulkFormData] = useState({
    text: '',
    tags: [] as string[]
  });
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);

  // Carregar tags disponíveis
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        const response = await fetch(`${API_BASE_URL}/users/tags`);
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data);
        } else {
          console.error('Erro ao buscar tags:', await response.text());
        }
      } catch (error) {
        console.error('Erro ao carregar tags:', error);
      } finally {
        setLoadingTags(false);
      }
    };
    
    if (activeTab === 'bulk') {
      fetchTags();
    }
  }, [activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBulkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBulkFormData(prev => ({ ...prev, text: e.target.value }));
  };

  const handleTagClick = (tagId: string) => {
    setBulkFormData(prev => {
      const tagIndex = prev.tags.indexOf(tagId);
      if (tagIndex === -1) {
        return { ...prev, tags: [...prev.tags, tagId] };
      } else {
        const newTags = [...prev.tags];
        newTags.splice(tagIndex, 1);
        return { ...prev, tags: newTags };
      }
    });
  };

  // ENVIO INDIVIDUAL WHATSAPP (API-Leads)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBulk(true);
    try {
      const response = await fetch(`${API_BASE_URL}/evo/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: formData.number,
          text: formData.text,
          instance_name: formData.instance_name || 'desenvolvimento',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Mensagem enviada com sucesso!');
        setFormData(prev => ({ ...prev, text: '' }));
      } else {
        toast.error(formatErrorMessage(data));
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem individual.');
    } finally {
      setSendingBulk(false);
    }
  };

  // ENVIO DE MÍDIA WHATSAPP (API-Leads)
  const handleMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.number.trim()) {
        toast.error('Informe o número de telefone');
        return;
      }
      if (!formData.media.trim()) {
        toast.error('Informe a URL da mídia');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/evo/sendMedia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: formData.number,
          media: formData.media,
          instance_name: formData.instance_name || 'desenvolvimento',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Mídia enviada com sucesso!');
        setFormData(prev => ({ ...prev, media: '' }));
      } else {
        toast.error(formatErrorMessage(data));
      }
    } catch (error) {
      toast.error('Erro ao enviar mídia.');
    }
  };

  // ENVIO INDIVIDUAL EMAIL (API-Leads)
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBulk(true);
    try {
      const response = await fetch(`${API_BASE_URL}/evo/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.email,
          subject: formData.subject,
          text: formData.text,
          provider: formData.provider || 'gmail',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('E-mail enviado com sucesso!');
        setFormData(prev => ({ ...prev, text: '' }));
      } else {
        toast.error(formatErrorMessage(data));
      }
    } catch (error) {
      toast.error('Erro ao enviar e-mail.');
    } finally {
      setSendingBulk(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBulk(true);
    try {
      // Validação básica
      if (bulkFormData.tags.length === 0) {
        toast.error('Selecione pelo menos uma tag');
        return;
      }
      
      if (!bulkFormData.text.trim()) {
        toast.error('Informe o texto da mensagem');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/bulk/whatsapp/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkFormData),
      });
      const data = await response.json();
      if (response.ok) {
        setBulkResult(data);
        toast.success('Mensagens enviadas em massa com sucesso!');
      } else {
        toast.error(formatErrorMessage(data));
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagens em massa.');
    } finally {
      setSendingBulk(false);
    }
  };

  const handleBulkSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBulk(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bulk/email/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkFormData),
      });
      const data = await response.json();
      if (response.ok) {
        setBulkResult(data);
        toast.success('E-mails enviados em massa com sucesso!');
      } else {
        toast.error(formatErrorMessage(data));
      }
    } catch (error) {
      toast.error('Erro ao enviar e-mails em massa.');
    } finally {
      setSendingBulk(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Envio de Mensagens WhatsApp</h1>
      
      <Tabs defaultValue="individual" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="bulk">Envio em Massa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensagem de Texto</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Número do WhatsApp</label>
                    <Input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      placeholder="5565981039669"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Inclua código do país e DDD. Exemplo: 5511999887766</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mensagem</label>
                    <Textarea
                      name="text"
                      value={formData.text}
                      onChange={handleChange}
                      placeholder="Digite sua mensagem"
                      required
                    />
                  </div>
                  <Button type="submit">Enviar Mensagem</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enviar Mídia</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMediaSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Número do WhatsApp</label>
                    <Input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      placeholder="5565981039669"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Inclua código do país e DDD. Exemplo: 5511999887766</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL da Mídia</label>
                    <Input
                      type="text"
                      name="media"
                      value={formData.media}
                      onChange={handleChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">URL direta para uma imagem, vídeo ou documento</p>
                  </div>
                  <Button type="submit">Enviar Mídia</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enviar E-mail</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} method="POST" className="space-y-4" autoComplete="off">
                  <div>
                    <label className="block text-sm font-medium mb-1">E-mail do Destinatário</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      placeholder="exemplo@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assunto</label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject || ''}
                      onChange={handleChange}
                      placeholder="Assunto do e-mail"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mensagem</label>
                    <Textarea
                      name="text"
                      value={formData.text}
                      onChange={handleChange}
                      placeholder="Digite sua mensagem"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Proveedor de E-mail</label>
                    <Input
                      type="text"
                      name="provider"
                      value={formData.provider || ''}
                      onChange={handleChange}
                      placeholder="Proveedor de e-mail"
                      required
                    />
                  </div>
                  <Button type="submit">Enviar E-mail</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="bulk">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Mensagens em Massa</CardTitle>
                  <CardDescription>
                    Envie a mesma mensagem para vários usuários selecionando tags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                        <TagIcon className="h-4 w-4" /> Selecione as Tags
                      </label>
                      
                      {loadingTags ? (
                        <div className="flex items-center justify-center py-4">
                          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Carregando tags...</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {availableTags.length > 0 ? (
                            availableTags.map(tag => (
                              <Badge 
                                key={tag.id} 
                                variant={bulkFormData.tags.includes(tag.id) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleTagClick(tag.id)}
                              >
                                {tag.name} ({tag.count})
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma tag disponível</p>
                          )}
                        </div>
                      )}
                      
                      {bulkFormData.tags.length > 0 && (
                        <div className="bg-muted p-2 rounded-md mb-2">
                          <p className="text-sm font-medium mb-1 flex items-center gap-1">
                            <Users className="h-4 w-4" /> 
                            Tags selecionadas ({bulkFormData.tags.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {bulkFormData.tags.map(tagId => {
                              const tag = availableTags.find(t => t.id === tagId);
                              return (
                                <Badge key={tagId} variant="secondary" className="gap-1">
                                  {tag?.name || tagId}
                                  <button 
                                    type="button" 
                                    onClick={() => handleTagClick(tagId)}
                                    className="ml-1 h-3 w-3 rounded-full hover:bg-destructive hover:text-destructive-foreground inline-flex items-center justify-center"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mensagem para Envio em Massa
                      </label>
                      <Textarea
                        value={bulkFormData.text}
                        onChange={handleBulkChange}
                        placeholder="Digite a mensagem que será enviada para todos os usuários selecionados"
                        className="min-h-32"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={sendingBulk || bulkFormData.tags.length === 0}
                    >
                      {sendingBulk ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando mensagens...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Mensagens em Massa
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Envio</CardTitle>
                </CardHeader>
                <CardContent>
                  {bulkResult ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Resultado do envio:</p>
                      <div className="bg-muted p-3 rounded-md text-sm">
                        <p><span className="font-medium">Total de usuários:</span> {bulkResult.total || 0}</p>
                        <p><span className="font-medium">Enviados com sucesso:</span> {bulkResult.success || 0}</p>
                        <p><span className="font-medium">Falhas:</span> {bulkResult.failed || 0}</p>
                        {bulkResult.errors && bulkResult.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Erros:</p>
                            <ul className="list-disc list-inside text-xs">
                              {bulkResult.errors.slice(0, 5).map((error: string, index: number) => (
                                <li key={index}>{error}</li>
                              ))}
                              {bulkResult.errors.length > 5 && (
                                <li>...e mais {bulkResult.errors.length - 5} erros</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>Nenhum envio em massa realizado</p>
                      <p className="text-sm mt-2">Selecione tags e envie mensagens para ver o resumo aqui</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Instruções</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>1. Selecione uma ou mais tags para filtrar os usuários</p>
                  <p>2. Digite a mensagem que deseja enviar</p>
                  <p>3. Clique em "Enviar Mensagens em Massa"</p>
                  <p>4. Aguarde o processamento e veja o resumo</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    <strong>Nota:</strong> O envio em massa pode levar algum tempo dependendo do número de usuários.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="email">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enviar E-mail</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} method="POST" className="space-y-4" autoComplete="off">
                  <div>
                    <label className="block text-sm font-medium mb-1">E-mail do Destinatário</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      placeholder="exemplo@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assunto</label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject || ''}
                      onChange={handleChange}
                      placeholder="Assunto do e-mail"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mensagem</label>
                    <Textarea
                      name="text"
                      value={formData.text}
                      onChange={handleChange}
                      placeholder="Digite sua mensagem"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Proveedor de E-mail</label>
                    <Input
                      type="text"
                      name="provider"
                      value={formData.provider || ''}
                      onChange={handleChange}
                      placeholder="Proveedor de e-mail"
                      required
                    />
                  </div>
                  <Button type="submit">Enviar E-mail</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enviar E-mails em Massa</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBulkSendEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                      <TagIcon className="h-4 w-4" /> Selecione as Tags
                    </label>
                    
                    {loadingTags ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Carregando tags...</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {availableTags.length > 0 ? (
                          availableTags.map(tag => (
                            <Badge 
                              key={tag.id} 
                              variant={bulkFormData.tags.includes(tag.id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleTagClick(tag.id)}
                            >
                              {tag.name} ({tag.count})
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhuma tag disponível</p>
                        )}
                      </div>
                    )}
                    
                    {bulkFormData.tags.length > 0 && (
                      <div className="bg-muted p-2 rounded-md mb-2">
                        <p className="text-sm font-medium mb-1 flex items-center gap-1">
                          <Users className="h-4 w-4" /> 
                          Tags selecionadas ({bulkFormData.tags.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {bulkFormData.tags.map(tagId => {
                            const tag = availableTags.find(t => t.id === tagId);
                            return (
                              <Badge key={tagId} variant="secondary" className="gap-1">
                                {tag?.name || tagId}
                                <button 
                                  type="button" 
                                  onClick={() => handleTagClick(tagId)}
                                  className="ml-1 h-3 w-3 rounded-full hover:bg-destructive hover:text-destructive-foreground inline-flex items-center justify-center"
                                >
                                  ×
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mensagem para Envio em Massa
                    </label>
                    <Textarea
                      value={bulkFormData.text}
                      onChange={handleBulkChange}
                      placeholder="Digite a mensagem que será enviada para todos os usuários selecionados"
                      className="min-h-32"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={sendingBulk || bulkFormData.tags.length === 0}
                  >
                    {sendingBulk ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando e-mails...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar E-mails em Massa
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
