// components/chamados-chart.tsx

"use client"

import { Line, LineChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Legend, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart"

// Definindo a interface para os dados do gráfico
interface ChartData {
  date: string;
  criados: number;
  concluidos: number;
}

interface ChamadosChartProps {
  data: ChartData[];
}

export function ChamadosChart({ data }: ChamadosChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume de Chamados: Criados vs. Concluídos</CardTitle>
        <CardDescription>
          Análise da quantidade de chamados abertos e finalizados ao longo do tempo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            criados: {
              label: "Criados",
              color: "hsl(var(--chart-2))",
            },
            concluidos: {
              label: "Concluídos",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="aspect-auto h-[350px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => new Date(value).toLocaleDateString("pt-BR", { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={30}
              />
              <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Legend />
              <Line
                dataKey="criados"
                type="monotone"
                stroke="var(--color-criados)"
                strokeWidth={2}
                dot={true}
              />
              <Line
                dataKey="concluidos"
                type="monotone"
                stroke="var(--color-concluidos)"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}