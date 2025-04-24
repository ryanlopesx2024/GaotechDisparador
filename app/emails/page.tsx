'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, RefreshCw, FileText, Users } from "lucide-react";
import { toast } from "sonner";
import { UserSelect } from "@/components/email/user-select";
import { CheckIcon, TagIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// URL base da API - usando URL relativa para evitar problemas de CORS
const API_BASE_URL = '/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
}

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: 'enviado' | 'falha';
  date: string;
}

interface Tag {
  id: string;
  name: string;
  count: number;
}

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState('individual');
  
  // Estado para email individual
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    text: '',
    html: '',
    provider: 'gmail'
  });
  
  // Estado para email em massa
  const [bulkFormData, setBulkFormData] = useState({
    subject: '',
    text: '',
    html: '',
    provider: 'gmail'
  });
  
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [recentTemplates, setRecentTemplates] = useState([
    { id: '1', name: 'Boas-vindas', subject: 'Bem-vindo à nossa plataforma', text: 'Olá, seja bem-vindo à nossa plataforma! Estamos felizes em tê-lo conosco.' },
    { id: '2', name: 'Promoção', subject: 'Ofertas especiais para você', text: 'Olá, temos ofertas especiais para você! Confira agora mesmo.' },
    { id: '3', name: 'Acompanhamento', subject: 'Como está sendo sua experiência?', text: 'Olá, como está sendo sua experiência com nosso produto? Estamos à disposição para ajudá-lo.' }
  ]);
  const [selectionType, setSelectionType] = useState<'users' | 'tags'>('users');

  // Carregar logs de emails enviados recentemente
  useEffect(() => {
    const fetchEmailLogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mail/logs`);
        if (response.ok) {
          const data = await response.json();
          setEmailLogs(data);
          return;
        }
        
        // Se não foi possível buscar logs reais, usar dados simulados
        const mockLogs: EmailLog[] = [
          { id: '1', to: 'cliente1@exemplo.com', subject: 'Boas-vindas', status: 'enviado', date: '2025-04-15 14:30' },
          { id: '2', to: 'cliente2@exemplo.com', subject: 'Promoção especial', status: 'enviado', date: '2025-04-15 10:15' },
          { id: '3', to: 'cliente3@exemplo.com', subject: 'Acompanhamento', status: 'falha', date: '2025-04-14 16:45' },
        ];
        setEmailLogs(mockLogs);
      } catch (error) {
        console.error('Erro ao carregar logs:', error);
        // Usar dados simulados em caso de erro
        const mockLogs: EmailLog[] = [
          { id: '1', to: 'cliente1@exemplo.com', subject: 'Boas-vindas', status: 'enviado', date: '2025-04-15 14:30' },
          { id: '2', to: 'cliente2@exemplo.com', subject: 'Promoção especial', status: 'enviado', date: '2025-04-15 10:15' },
          { id: '3', to: 'cliente3@exemplo.com', subject: 'Acompanhamento', status: 'falha', date: '2025-04-14 16:45' },
        ];
        setEmailLogs(mockLogs);
      }
    };
    
    // Buscar tags disponíveis para seleção
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/tags`);
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data);
        }
      } catch (error) {
        console.error('Erro ao carregar tags:', error);
      }
    };
    
    fetchEmailLogs();
    fetchTags();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBulkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBulkFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBulkSelectChange = (name: string, value: string) => {
    setBulkFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectedUsersChange = (users: User[]) => {
    setSelectedUsers(users);
  };

  const handleSelectedTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  const handleTemplateSelect = (template: any) => {
    setBulkFormData(prev => ({
      ...prev,
      subject: template.subject,
      text: template.text || '',
    }));
    toast.success(`Template "${template.name}" aplicado`);
  };

  const handleSelectionTypeChange = (value: 'users' | 'tags') => {
    setSelectionType(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/mail/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          html: formData.text // Usar texto como HTML se HTML não for fornecido
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar email');
      }

      const data = await response.json();
      
      // Adicionar ao log de emails
      const newLog: EmailLog = {
        id: Date.now().toString(),
        to: formData.to,
        subject: formData.subject,
        status: 'enviado',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      
      setEmailLogs([newLog, ...emailLogs]);
      toast.success('Email enviado com sucesso!');
      
      // Limpar formulário
      setFormData({
        to: '',
        subject: '',
        text: '',
        html: '',
        provider: formData.provider // Manter o provedor selecionado
      });
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar email');
      
      // Adicionar ao log como falha
      const failedLog: EmailLog = {
        id: Date.now().toString(),
        to: formData.to,
        subject: formData.subject,
        status: 'falha',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      
      setEmailLogs([failedLog, ...emailLogs]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectionType === 'users' && selectedUsers.length === 0) {
      toast.error('Selecione pelo menos um destinatário');
      return;
    }
    
    if (selectionType === 'tags' && selectedTags.length === 0) {
      toast.error('Selecione pelo menos uma tag');
      return;
    }
    
    if (!bulkFormData.subject) {
      toast.error('Assunto é obrigatório');
      return;
    }
    
    if (!bulkFormData.text) {
      toast.error('Mensagem é obrigatória');
      return;
    }
    
    try {
      setBulkLoading(true);
      
      let endpoint = selectionType === 'users' 
        ? `${API_BASE_URL}/bulk/email/users`
        : `${API_BASE_URL}/bulk/email/tags`;
      
      let requestBody = selectionType === 'users'
        ? {
            userIds: selectedUsers.map(user => user.id),
            subject: bulkFormData.subject,
            text: bulkFormData.text,
            html: bulkFormData.text,
            provider: bulkFormData.provider
          }
        : {
            tags: selectedTags.map(tag => tag.name),
            subject: bulkFormData.subject,
            text: bulkFormData.text,
            html: bulkFormData.text,
            provider: bulkFormData.provider
          };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar emails em massa');
      }

      const result = await response.json();
      
      // Adicionar novas entradas aos logs
      const recipientCount = selectionType === 'users' 
        ? selectedUsers.length 
        : result.totalUsers || 0;
      
      const newLogs: EmailLog[] = Array(recipientCount).fill(0).map((_, index) => ({
        id: Date.now() + index.toString(),
        to: selectionType === 'users' && index < selectedUsers.length 
          ? selectedUsers[index].email 
          : `grupo:${selectedTags.map(t => t.name).join(',')}`,
        subject: bulkFormData.subject,
        status: 'enviado',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16)
      }));
      
      setEmailLogs([...newLogs, ...emailLogs]);
      toast.success(`${result.success || recipientCount} emails enviados com sucesso!`);
      
      // Limpar formulário, mas manter seleção para repetir o envio facilmente
      setBulkFormData({
        subject: '',
        text: '',
        html: '',
        provider: bulkFormData.provider
      });
      
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar emails em massa');
      
      // Adicionar ao log como falha
      const failedLog: EmailLog = {
        id: Date.now().toString(),
        to: selectionType === 'users' 
          ? `múltiplos:${selectedUsers.length}` 
          : `tags:${selectedTags.map(t => t.name).join(',')}`,
        subject: bulkFormData.subject,
        status: 'falha',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      
      setEmailLogs([failedLog, ...emailLogs]);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="individual">Email Individual</TabsTrigger>
              <TabsTrigger value="bulk">Email em Massa</TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual" className="space-y-4">
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Mail className="mr-2 h-5 w-5 text-[#00979B]" />
                    Enviar Email Individual
                  </CardTitle>
                  <CardDescription>
                    Envie um email para um destinatário específico.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="provider">
                        Provedor
                      </label>
                      <Select defaultValue={formData.provider} onValueChange={(value) => handleSelectChange('provider', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o provedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gmail">Gmail</SelectItem>
                          <SelectItem value="outlook">Outlook</SelectItem>
                          <SelectItem value="webmail">Webmail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="to">
                        Para
                      </label>
                      <Input
                        type="email"
                        id="to"
                        name="to"
                        value={formData.to}
                        onChange={handleChange}
                        placeholder="destinatario@exemplo.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="subject">
                        Assunto
                      </label>
                      <Input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Assunto do email"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="text">
                        Mensagem
                      </label>
                      <Textarea
                        id="text"
                        name="text"
                        value={formData.text}
                        onChange={handleChange}
                        placeholder="Digite sua mensagem"
                        required
                        rows={8}
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Button type="submit" disabled={loading} className="bg-[#00979B] hover:bg-[#007a7c]">
                        {loading ? 'Enviando...' : 'Enviar Email'}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bulk" className="space-y-4">
              <Card>
                <CardHeader className="bg-gray-50">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Users className="mr-2 h-5 w-5 text-[#00979B]" />
                    Enviar Email em Massa
                  </CardTitle>
                  <CardDescription>
                    Envie emails para múltiplos destinatários de uma vez.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <Label>Tipo de Seleção</Label>
                      <RadioGroup 
                        value={selectionType} 
                        onValueChange={(value) => handleSelectionTypeChange(value as 'users' | 'tags')}
                        className="flex items-center space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="users" id="users" />
                          <Label htmlFor="users" className="cursor-pointer">Por Usuários</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tags" id="tags" />
                          <Label htmlFor="tags" className="cursor-pointer">Por Tags</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {selectionType === 'users' ? (
                      <div className="space-y-2">
                        <Label>Selecionar Usuários</Label>
                        <UserSelect 
                          onSelectedUsersChange={handleSelectedUsersChange} 
                          onSelectedTagsChange={handleSelectedTagsChange}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Selecionar Tags</Label>
                        <div className="flex flex-wrap items-center gap-2 border rounded-md p-2 min-h-10">
                          {selectedTags.length > 0 ? (
                            selectedTags.map((tag) => (
                              <Badge key={tag.id} variant="secondary" className="py-1 px-2">
                                <TagIcon className="w-3 h-3 mr-1" />
                                {tag.name}
                                <span className="ml-1 text-xs">({tag.count})</span>
                                <button
                                  type="button"
                                  className="ml-1"
                                  onClick={() => setSelectedTags(selectedTags.filter(t => t.id !== tag.id))}
                                >
                                  <XIcon className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">Selecione uma ou mais tags</span>
                          )}
                        </div>
                        
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                          {availableTags.map((tag) => (
                            <Button
                              key={tag.id}
                              type="button"
                              variant={selectedTags.some(t => t.id === tag.id) ? "default" : "outline"}
                              size="sm"
                              className="justify-start"
                              onClick={() => {
                                if (selectedTags.some(t => t.id === tag.id)) {
                                  setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
                                } else {
                                  setSelectedTags([...selectedTags, tag]);
                                }
                              }}
                            >
                              <TagIcon className="mr-1 h-3 w-3" />
                              {tag.name}
                              <Badge variant="outline" className="ml-auto">
                                {tag.count}
                              </Badge>
                              {selectedTags.some(t => t.id === tag.id) && (
                                <CheckIcon className="ml-1 h-3 w-3" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="bulk-subject">Assunto</Label>
                        <div className="text-sm text-muted-foreground">
                          <Select
                            onValueChange={(id) => {
                              const template = recentTemplates.find(t => t.id === id);
                              if (template) handleTemplateSelect(template);
                            }}
                          >
                            <SelectTrigger className="h-7 w-[160px]">
                              <SelectValue placeholder="Usar template" />
                            </SelectTrigger>
                            <SelectContent>
                              {recentTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Input
                        id="bulk-subject"
                        name="subject"
                        value={bulkFormData.subject}
                        onChange={handleBulkChange}
                        placeholder="Assunto do email"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bulk-text">Mensagem</Label>
                      <Textarea
                        id="bulk-text"
                        name="text"
                        value={bulkFormData.text}
                        onChange={handleBulkChange}
                        placeholder="Digite sua mensagem. Use {name} para incluir o nome do destinatário."
                        required
                        rows={8}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bulk-provider">Provedor</Label>
                      <Select
                        value={bulkFormData.provider}
                        onValueChange={(value) => handleBulkSelectChange('provider', value)}
                      >
                        <SelectTrigger id="bulk-provider">
                          <SelectValue placeholder="Selecione o provedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gmail">Gmail</SelectItem>
                          <SelectItem value="outlook">Outlook</SelectItem>
                          <SelectItem value="webmail">Webmail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={bulkLoading}
                      className="w-full"
                    >
                      {bulkLoading ? 'Enviando...' : `Enviar para ${
                        selectionType === 'users' 
                          ? selectedUsers.length + ' usuários' 
                          : selectedTags.length + ' tags'
                      }`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center text-sm font-medium">
                <FileText className="mr-2 h-4 w-4 text-[#00979B]" />
                Templates Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {recentTemplates.map(template => (
                  <div key={template.id} className="flex justify-between items-center rounded-md border p-3">
                    <div>
                      <h4 className="text-sm font-medium">{template.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      Usar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center text-sm font-medium">
                <RefreshCw className="mr-2 h-4 w-4 text-[#00979B]" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {emailLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center gap-2">
                    <div 
                      className={`h-2 w-2 rounded-full ${
                        log.status === 'enviado' ? 'bg-green-500' : 'bg-red-500'
                      }`} 
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-medium truncate">{log.to}</p>
                      <p className="text-xs text-muted-foreground truncate">{log.subject}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.date.slice(5)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-lg font-medium">Histórico de Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.to}</TableCell>
                    <TableCell>{log.subject}</TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          log.status === 'enviado' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell>{log.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
