"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Trash, MessageSquare, Mail, RefreshCw, PlusCircle, DownloadCloud, TagIcon } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  phone: string
  tags: string[]
  createdAt: string
  empresa?: string
  estado?: string
  cidade?: string
}

export default function UsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string>("")
  const [allTags, setAllTags] = useState<{id: string, name: string, count: number}[]>([])

  useEffect(() => {
    fetchUsers()
    fetchTags()
  }, [])

  useEffect(() => {
    if (searchTerm || tagFilter) {
      const filtered = users.filter(user => {
        const matchesSearch = searchTerm 
          ? user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.phone && user.phone.includes(searchTerm)) ||
            (user.empresa && user.empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.cidade && user.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.estado && user.estado.toLowerCase().includes(searchTerm.toLowerCase()))
          : true
        
        const matchesTag = tagFilter
          ? user.tags.includes(tagFilter)
          : true
          
        return matchesSearch && matchesTag
      })
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, tagFilter, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('http://localhost:3002/api/users')
      if (!response.ok) {
        throw new Error("Erro ao carregar usuários")
      }
      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/users/tags')
      if (!response.ok) {
        throw new Error('Erro ao buscar tags')
      }
      const data = await response.json()
      setAllTags(data)
    } catch (error) {
      console.error('Erro ao buscar tags:', error)
    }
  }

  const handleDeleteUser = async (id: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) {
      try {
        const response = await fetch(`http://localhost:3002/api/users/${id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Erro ao excluir usuário')
        }
        
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id))
        toast.success(`Usuário ${userName} excluído com sucesso!`)
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        toast.error('Erro ao excluir o usuário. Tente novamente mais tarde.')
      }
    }
  }

  const handleTagClick = (tag: string) => {
    setTagFilter(tag === tagFilter ? '' : tag)
  }

  const renderLoading = () => (
    <div className="p-8 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      <p className="mt-4">Carregando usuários...</p>
    </div>
  )

  const renderUserList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredUsers.length > 0 ? (
        filteredUsers.map(user => (
          <Card key={user.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDeleteUser(user.id, user.name)}
                >
                  <Trash className="h-5 w-5" />
                </Button>
              </div>
              {user.empresa && (
                <CardDescription className="text-sm">{user.empresa}</CardDescription>
              )}
              {user.cidade && user.estado && (
                <CardDescription className="text-xs">{user.cidade}, {user.estado}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pb-4">
              {user.email && (
                <div className="flex items-center mb-1 text-sm overflow-hidden">
                  <span className="font-medium mr-2">Email:</span>
                  <span className="text-muted-foreground overflow-ellipsis">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center mb-2 text-sm">
                  <span className="font-medium mr-2">Telefone:</span>
                  <span className="text-muted-foreground">{user.phone}</span>
                </div>
              )}
              {user.tags && user.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.tags.map(tag => (
                    <Badge 
                      key={`${user.id}-${tag}`} 
                      variant={tagFilter === tag ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
        </div>
      )}
    </div>
  )

  // Função para remover contatos
  const importContacts = async () => {
    if (!window.confirm('Tem certeza que deseja remover todos os contatos?')) return;
    
    try {
      const response = await fetch('http://localhost:3002/api/users/import-contacts', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao remover contatos');
      }
      
      const data = await response.json();
      toast.success('Todos os contatos foram removidos com sucesso!');
      fetchUsers();
      fetchTags();
    } catch (error) {
      console.error('Erro ao remover contatos:', error);
      toast.error('Erro ao remover contatos. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={importContacts} 
            className="flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            Remover Contatos
          </Button>
          <Button 
            onClick={() => router.push('/usuarios/novo')} 
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários por nome, email, telefone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium mb-2 flex items-center gap-1">
            <TagIcon className="h-4 w-4" /> Filtrar por tags:
          </h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge 
                key={tag.id} 
                variant={tagFilter === tag.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagClick(tag.id)}
              >
                {tag.name} ({tag.count})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {loading ? renderLoading() : renderUserList()}

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {filteredUsers.length} usuários {searchTerm || tagFilter ? 'encontrados' : 'cadastrados'} {tagFilter && `com a tag "${tagFilter}"`}
      </div>
    </div>
  )
}
