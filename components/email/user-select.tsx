"use client"

import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, UserIcon, XIcon, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator 
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"

// URL base da API - usando URL relativa para evitar problemas de CORS
const API_BASE_URL = '/api';

interface User {
  id: string
  name: string
  email: string
  phone: string
  tags: string[]
}

interface Tag {
  id: string
  name: string
  count: number
}

interface UserSelectProps {
  onSelectedUsersChange: (users: User[]) => void
  onSelectedTagsChange?: (tags: Tag[]) => void
}

export function UserSelect({ onSelectedUsersChange, onSelectedTagsChange }: UserSelectProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Obter usuários da API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
          throw new Error("Erro ao carregar usuários");
        }
        const data = await response.json();
        setUsers(data);
        
        // Extrair tags de todos os usuários
        const allTags = new Map<string, number>();
        data.forEach((user: User) => {
          user.tags.forEach(tag => {
            const count = allTags.get(tag) || 0;
            allTags.set(tag, count + 1);
          });
        });
        
        // Converter Map para array de objetos Tag
        const tagArray: Tag[] = Array.from(allTags).map(([name, count]) => ({
          id: name,
          name,
          count
        }));
        
        setTags(tagArray);
      } catch (error) {
        console.error("Erro:", error);
        toast.error("Falha ao carregar usuários");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Atualizar o componente pai quando a seleção mudar
  useEffect(() => {
    onSelectedUsersChange(selectedUsers);
  }, [selectedUsers, onSelectedUsersChange]);

  // Atualizar o componente pai quando as tags selecionadas mudarem
  useEffect(() => {
    if (onSelectedTagsChange) {
      onSelectedTagsChange(selectedTags);
    }
  }, [selectedTags, onSelectedTagsChange]);

  // Verificar se um usuário está selecionado
  const isSelected = (user: User) => {
    return selectedUsers.some(u => u.id === user.id);
  };

  // Selecionar ou desselecionar um usuário
  const toggleUser = (user: User) => {
    if (isSelected(user)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Verificar se uma tag está selecionada
  const isTagSelected = (tag: Tag) => {
    return selectedTags.some(t => t.id === tag.id);
  };

  // Selecionar ou desselecionar uma tag
  const toggleTag = (tag: Tag) => {
    if (isTagSelected(tag)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Adicionar todos os usuários com a tag selecionada
  const addUsersByTag = (tagName: string) => {
    const usersWithTag = users.filter(user => 
      user.tags.some(tag => tag === tagName) && 
      !selectedUsers.some(u => u.id === user.id)
    );
    
    if (usersWithTag.length > 0) {
      setSelectedUsers([...selectedUsers, ...usersWithTag]);
      toast.success(`${usersWithTag.length} usuários adicionados pela tag "${tagName}"`);
    } else {
      toast.info(`Nenhum usuário novo com a tag "${tagName}" encontrado`);
    }
  };

  // Remover todos os usuários
  const removeAllUsers = () => {
    setSelectedUsers([]);
    setSelectedTags([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Destinatários</label>
        {selectedUsers.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={removeAllUsers}
            className="h-6 px-2 text-xs"
          >
            Limpar seleção
          </Button>
        )}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-auto min-h-10 w-full justify-between px-3 py-2"
          >
            <div className="flex flex-wrap gap-1">
              {selectedUsers.length > 0 ? (
                selectedUsers.map(user => (
                  <Badge key={user.id} variant="secondary" className="mr-1 mb-1">
                    {user.name}
                    <button
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onMouseDown={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleUser(user);
                      }}
                    >
                      <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Selecione usuários ou tags</span>
              )}
            </div>
            <div>
              <Badge variant="outline" className="rounded-full">
                {selectedUsers.length}
              </Badge>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar usuário ou tag..." />
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup heading="Tags">
                {tags.map(tag => (
                  <CommandItem
                    key={tag.id}
                    value={`tag-${tag.name}`}
                    onSelect={() => {
                      addUsersByTag(tag.name);
                      toggleTag(tag);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <TagIcon className="h-4 w-4" />
                      <span>{tag.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {tag.count}
                      </Badge>
                      {isTagSelected(tag) && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Usuários">
                {users.map(user => (
                  <CommandItem
                    key={user.id}
                    value={`${user.name} ${user.email}`}
                    onSelect={() => toggleUser(user)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <UserIcon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email || user.phone}
                        </span>
                      </div>
                      {isSelected(user) && (
                        <CheckIcon className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedUsers.length > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          {selectedUsers.length} destinatário(s) selecionado(s)
        </div>
      )}
    </div>
  )
} 