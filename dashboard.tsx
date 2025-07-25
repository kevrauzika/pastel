// dashboard.tsx

"use client"

import { useState, useEffect, useMemo } from "react"
import { Filter, BarChart3, Package, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChamadosChart } from "@/components/chamados-chart"

// Interface para tipar os dados do chamado
interface IChamado {
  id: string;
  titulo: string;
  status: string;
  prioridade: string;
  squad: string;
  produto: string;
  dataAbertura: string;
  dataConclusao?: string | null;
  responsavel: string;
}

// --- CORREÇÃO AQUI: Função retorna classes do Tailwind em vez de variantes ---
const getStatusClass = (status: string) => {
  const statusNormalizado = status.toLowerCase();
  switch (statusNormalizado) {
    case "concluído":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700";
    case "em trativa":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700";
    case "pendente":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700";
    case "em análise":
    case "retorno para área":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700";
    default:
      return "border-gray-300 dark:border-gray-700";
  }
};

const getPrioridadeColor = (prioridade: string) => {
  const prioridadeNormalizada = prioridade.toLowerCase();
  switch (prioridadeNormalizada) {
    case "crítico": return "destructive";
    case "alta": return "destructive";
    case "média": return "default";
    case "baixa": return "secondary";
    default: return "outline";
  }
};

export default function Component() {
  // Estados para os dados
  const [chamados, setChamados] = useState<IChamado[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [jornadaOptions, setJornadaOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para os filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroSquad, setFiltroSquad] = useState("todos");
  const [filtroProduto, setFiltroProduto] = useState("todos");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [chamadosResponse, statusResponse] = await Promise.all([
          fetch('/api/chamados'),
          fetch('/api/status-options')
        ]);

        if (!chamadosResponse.ok) {
            const errorData = await chamadosResponse.json();
            throw new Error(errorData.error || 'Falha ao buscar a lista de chamados.');
        }
        const chamadosData = await chamadosResponse.json();
        
        if (!statusResponse.ok) {
            const errorData = await statusResponse.json();
            throw new Error(errorData.error || 'Falha ao buscar as opções de status.');
        }
        const statusData = await statusResponse.json();

        setChamados(chamadosData);
        setStatusOptions(statusData);

        const squadsUnicos: string[] = [...new Set(chamadosData.map((c: IChamado) => c.squad).filter(Boolean))];
        setJornadaOptions(squadsUnicos.sort());

      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((chamado) => {
      if (filtroStatus !== "todos" && chamado.status !== filtroStatus) return false;
      if (filtroSquad !== "todos" && chamado.squad !== filtroSquad) return false;
      if (filtroProduto !== "todos" && chamado.produto !== filtroProduto) return false;
      if (filtroPeriodo !== "todos") {
        const dataAbertura = new Date(chamado.dataAbertura);
        const hoje = new Date();
        let dataLimite = new Date();
        switch (filtroPeriodo) {
          case '7_dias': dataLimite.setDate(hoje.getDate() - 7); break;
          case '30_dias': dataLimite.setDate(hoje.getDate() - 30); break;
          case '3_meses': dataLimite.setMonth(hoje.getMonth() - 3); break;
          case '6_meses': dataLimite.setMonth(hoje.getMonth() - 6); break;
          case '1_ano': dataLimite.setFullYear(hoje.getFullYear() - 1); break;
        }
        if (dataAbertura < dataLimite) return false;
      }
      return true;
    });
  }, [chamados, filtroStatus, filtroSquad, filtroProduto, filtroPeriodo]);

  useEffect(() => {
    const processDataForChart = (data: IChamado[]) => {
      const countsByDate = data.reduce((acc, chamado) => {
        const creationDate = new Date(chamado.dataAbertura).toISOString().split('T')[0];
        acc[creationDate] = acc[creationDate] || { date: creationDate, criados: 0, concluidos: 0 };
        acc[creationDate].criados += 1;
        if (chamado.dataConclusao) {
          const conclusionDate = new Date(chamado.dataConclusao).toISOString().split('T')[0];
          acc[conclusionDate] = acc[conclusionDate] || { date: conclusionDate, criados: 0, concluidos: 0 };
          acc[conclusionDate].concluidos += 1;
        }
        return acc;
      }, {} as any);
      const sortedChartData = Object.values(countsByDate).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setChartData(sortedChartData);
    };
    if (chamados.length > 0) {
      processDataForChart(chamadosFiltrados);
    }
  }, [chamadosFiltrados, chamados.length]);

  const totalChamadosFiltrados = chamadosFiltrados.length;
  const chamadosAbertos = chamadosFiltrados.filter((c) => c.status.toLowerCase() === "pendente").length;
  const chamadosEmAndamento = chamadosFiltrados.filter((c) => ["em trativa", "em análise", "retorno para área"].includes(c.status.toLowerCase())).length;
  const chamadosConcluidos = chamadosFiltrados.filter((c) => c.status.toLowerCase() === "concluído").length;

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl animate-pulse">Carregando dados...</p></div>;
  }
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">Ocorreu um Erro</h2>
        <p className="text-muted-foreground mt-2">Não foi possível carregar os dados do SharePoint.</p>
        <code className="mt-4 p-2 bg-muted rounded text-sm text-destructive-foreground">{error}</code>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50/40">
       <header className="flex items-center h-16 px-4 border-b bg-white shrink-0 md:px-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="w-6 h-6" />
          <span>Painel de Chamados</span>
        </div>
        <nav className="hidden font-medium sm:flex flex-row items-center gap-5 text-sm lg:gap-6 ml-6">
          <a href="#" className="font-bold">Dashboard</a>
          <a href="#" className="text-muted-foreground">Chamados</a>
          <a href="#" className="text-muted-foreground">Relatórios</a>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5" />Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Períodos</SelectItem>
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
                  <SelectTrigger><SelectValue placeholder="Selecione um status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    {statusOptions.map((option, index) => (
                      <SelectItem key={`${option}-${index}`} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Squad</label>
                <Select value={filtroSquad} onValueChange={setFiltroSquad}>
                  <SelectTrigger><SelectValue placeholder="Selecione um squad" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {jornadaOptions.map((option, index) => (
                      <SelectItem key={`${option}-${index}`} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Produto</label>
                <Select value={filtroProduto} onValueChange={setFiltroProduto}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <ChamadosChart data={chartData} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Chamados</CardTitle><Package className="w-4 h-4 text-muted-foreground" /></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChamadosFiltrados}</div>
              <p className="text-xs text-muted-foreground">{chamados.length} no total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle><AlertCircle className="w-4 h-4 text-red-500" /></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{chamadosAbertos}</div>
              <p className="text-xs text-muted-foreground">{totalChamadosFiltrados > 0 ? ((chamadosAbertos / totalChamadosFiltrados) * 100).toFixed(1) : 0}% dos filtrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Em Andamento</CardTitle><Clock className="w-4 h-4 text-yellow-500" /></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{chamadosEmAndamento}</div>
              <p className="text-xs text-muted-foreground">{totalChamadosFiltrados > 0 ? ((chamadosEmAndamento / totalChamadosFiltrados) * 100).toFixed(1) : 0}% dos filtrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Concluídos</CardTitle><CheckCircle className="w-4 h-4 text-green-500" /></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{chamadosConcluidos}</div>
              <p className="text-xs text-muted-foreground">{totalChamadosFiltrados > 0 ? ((chamadosConcluidos / totalChamadosFiltrados) * 100).toFixed(1) : 0}% dos filtrados</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Lista de Chamados</CardTitle><CardDescription>Mostrando {totalChamadosFiltrados} de {chamados.length} chamados</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Título</TableHead><TableHead>Status</TableHead><TableHead>Prioridade</TableHead><TableHead>Squad</TableHead><TableHead>Produto</TableHead><TableHead>Data</TableHead><TableHead>Responsável</TableHead></TableRow></TableHeader>
              <TableBody>
                {chamadosFiltrados.map((chamado) => (
                  <TableRow key={chamado.id}>
                    <TableCell className="font-medium">{chamado.id}</TableCell>
                    <TableCell className="max-w-xs truncate">{chamado.titulo}</TableCell>
                    <TableCell>
                      {/* --- CORREÇÃO AQUI: Usando className para aplicar as cores --- */}
                      <Badge variant="outline" className={getStatusClass(chamado.status)}>
                        {chamado.status}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant={getPrioridadeColor(chamado.prioridade)}>{chamado.prioridade}</Badge></TableCell>
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
  );
}