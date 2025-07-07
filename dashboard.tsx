"use client"

import { useState } from "react"
import { Filter, BarChart3, Package, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Dados mockados para demonstração
const chamados = [
  {
    id: "CH001",
    titulo: "Sistema de login não funciona",
    status: "aberto",
    prioridade: "alta",
    squad: "Frontend",
    produto: "Portal Web",
    dataAbertura: "2024-01-15",
    responsavel: "João Silva",
  },
  {
    id: "CH002",
    titulo: "Erro na integração de pagamento",
    status: "em_andamento",
    prioridade: "crítica",
    squad: "Backend",
    produto: "API Pagamentos",
    dataAbertura: "2024-01-14",
    responsavel: "Maria Santos",
  },
  {
    id: "CH003",
    titulo: "Interface mobile responsiva",
    status: "concluido",
    prioridade: "média",
    squad: "Mobile",
    produto: "App Mobile",
    dataAbertura: "2024-01-10",
    responsavel: "Pedro Costa",
  },
  {
    id: "CH004",
    titulo: "Otimização de performance",
    status: "aberto",
    prioridade: "baixa",
    squad: "DevOps",
    produto: "Infraestrutura",
    dataAbertura: "2024-01-12",
    responsavel: "Ana Lima",
  },
  {
    id: "CH005",
    titulo: "Bug no relatório de vendas",
    status: "em_andamento",
    prioridade: "alta",
    squad: "Backend",
    produto: "Dashboard",
    dataAbertura: "2024-01-13",
    responsavel: "Carlos Oliveira",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "aberto":
      return "destructive"
    case "em_andamento":
      return "default"
    case "concluido":
      return "secondary"
    default:
      return "outline"
  }
}

const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade) {
    case "crítica":
      return "destructive"
    case "alta":
      return "destructive"
    case "média":
      return "default"
    case "baixa":
      return "secondary"
    default:
      return "outline"
  }
}

export default function Component() {
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroPeriodo, setFiltroPeriodo] = useState("30_dias")
  const [filtroSquad, setFiltroSquad] = useState("todos")
  const [filtroProduto, setFiltroProduto] = useState("todos")

  // Estatísticas calculadas
  const totalChamados = chamados.length
  const chamadosAbertos = chamados.filter((c) => c.status === "aberto").length
  const chamadosEmAndamento = chamados.filter((c) => c.status === "em_andamento").length
  const chamadosConcluidos = chamados.filter((c) => c.status === "concluido").length

  // Filtrar chamados baseado nos filtros selecionados
  const chamadosFiltrados = chamados.filter((chamado) => {
    if (filtroStatus !== "todos" && chamado.status !== filtroStatus) return false
    if (filtroSquad !== "todos" && chamado.squad !== filtroSquad) return false
    if (filtroProduto !== "todos" && chamado.produto !== filtroProduto) return false
    return true
  })

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50/40">
      <header className="flex items-center h-16 px-4 border-b bg-white shrink-0 md:px-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="w-6 h-6" />
          <span>Painel de Chamados</span>
        </div>
        <nav className="hidden font-medium sm:flex flex-row items-center gap-5 text-sm lg:gap-6 ml-6">
          <a href="#" className="font-bold">
            Dashboard
          </a>
          <a href="#" className="text-muted-foreground">
            Chamados
          </a>
          <a href="#" className="text-muted-foreground">
            Relatórios
          </a>
        </nav>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7_dias">Últimos 7 dias</SelectItem>
                    <SelectItem value="30_dias">Últimos 30 dias</SelectItem>
                    <SelectItem value="3_meses">Últimos 3 meses</SelectItem>
                    <SelectItem value="6_meses">Últimos 6 meses</SelectItem>
                    <SelectItem value="1_ano">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Squad</label>
                <Select value={filtroSquad} onValueChange={setFiltroSquad}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="Frontend">Frontend</SelectItem>
                    <SelectItem value="Backend">Backend</SelectItem>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Produto</label>
                <Select value={filtroProduto} onValueChange={setFiltroProduto}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Portal Web">Portal Web</SelectItem>
                    <SelectItem value="API Pagamentos">API Pagamentos</SelectItem>
                    <SelectItem value="App Mobile">App Mobile</SelectItem>
                    <SelectItem value="Dashboard">Dashboard</SelectItem>
                    <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Chamados</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChamados}</div>
              <p className="text-xs text-muted-foreground">{chamadosFiltrados.length} após filtros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{chamadosAbertos}</div>
              <p className="text-xs text-muted-foreground">
                {((chamadosAbertos / totalChamados) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{chamadosEmAndamento}</div>
              <p className="text-xs text-muted-foreground">
                {((chamadosEmAndamento / totalChamados) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{chamadosConcluidos}</div>
              <p className="text-xs text-muted-foreground">
                {((chamadosConcluidos / totalChamados) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico Visual */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Status</CardTitle>
            <CardDescription>Visualização dos chamados por status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Abertos</span>
                </div>
                <span className="text-sm font-medium">{chamadosAbertos}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(chamadosAbertos / totalChamados) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Em Andamento</span>
                </div>
                <span className="text-sm font-medium">{chamadosEmAndamento}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(chamadosEmAndamento / totalChamados) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Concluídos</span>
                </div>
                <span className="text-sm font-medium">{chamadosConcluidos}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(chamadosConcluidos / totalChamados) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Chamados */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Chamados</CardTitle>
            <CardDescription>
              Mostrando {chamadosFiltrados.length} de {totalChamados} chamados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Squad</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chamadosFiltrados.map((chamado) => (
                  <TableRow key={chamado.id}>
                    <TableCell className="font-medium">{chamado.id}</TableCell>
                    <TableCell className="max-w-xs truncate">{chamado.titulo}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(chamado.status)}>{chamado.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPrioridadeColor(chamado.prioridade)}>{chamado.prioridade}</Badge>
                    </TableCell>
                    <TableCell>{chamado.squad}</TableCell>
                    <TableCell>{chamado.produto}</TableCell>
                    <TableCell>{new Date(chamado.dataAbertura).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{chamado.responsavel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
