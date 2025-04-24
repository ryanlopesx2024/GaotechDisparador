"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Trash, Send, Mail, MessageSquare } from "lucide-react"
import { UserAddModal } from "./UserAddModal"
import { SendMessageModal } from "./SendMessageModal"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  phone: string
  tags: string[]
  createdAt: string
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [messageType, setMessageType] = useState<"whatsapp" | "email" | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      )
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/users")
      if (!response.ok) {
        throw new Error("Erro ao carregar usuários")
      }
      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir usuário")
      }

      // Atualizar lista local
      setUsers(users.filter(user => user.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir usuário")
    }
  }

  const handleClearAllUsers = async () => {
    if (!confirm("Tem certeza que deseja apagar TODOS os usuários? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/users`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Erro ao limpar usuários")
      }
      
      // Atualizar lista local
      setUsers([]);
      setFilteredUsers([]);
      toast.success("Todos os usuários foram removidos");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao limpar usuários")
    }
  }

  const handleUserAdded = (newUser: User) => {
    setUsers([...users, newUser])
  }

  const handleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(userId => userId !== id))
    } else {
      setSelectedUsers([...selectedUsers, id])
    }
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
    setIsAllSelected(!isAllSelected)
  }

  const handleOpenSendModal = (type: "whatsapp" | "email") => {
    if (selectedUsers.length === 0) {
      alert("Selecione pelo menos um usuário")
      return
    }
    setMessageType(type)
    setIsSendModalOpen(true)
  }

  if (loading) {
    return <div>Carregando usuários...</div>
  }

  if (error) {
    return <div>Erro: {error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenSendModal("whatsapp")}
            disabled={selectedUsers.length === 0}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Enviar WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOpenSendModal("email")}
            disabled={selectedUsers.length === 0}
          >
            <Mail className="mr-2 h-4 w-4" />
            Enviar Email
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
          <Button variant="destructive" onClick={handleClearAllUsers}>
            <Trash className="mr-2 h-4 w-4" />
            Limpar Usuários
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.tags && user.tags.length > 0 ? (
                          user.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          "-"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isAddModalOpen && (
        <UserAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onUserAdded={handleUserAdded}
        />
      )}

      {isSendModalOpen && (
        <SendMessageModal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          selectedUsers={users.filter(user => selectedUsers.includes(user.id))}
        />
      )}
    </div>
  )
} 