"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLOR_MAP: Record<string, string> = {
  violet: "#8b5cf6",
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
};

const PRIORITY_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface BarDataItem {
  name: string;
  color: string;
  "1a Opção": number;
  "2a Opção": number;
  "3a Opção": number;
  "4a Opção": number;
}

export function PreferenceCharts({
  pieData,
  barData,
}: {
  pieData: PieDataItem[];
  barData: BarDataItem[];
}) {
  const totalVotes = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Pie chart - 1st choice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1a Opção dos Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          {totalVotes === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhum aluno fez sua escolha ainda.
            </p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={COLOR_MAP[entry.color] || "#8b5cf6"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} aluno${Number(value) !== 1 ? "s" : ""}`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="space-y-3">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: COLOR_MAP[item.color] || "#8b5cf6",
                      }}
                    />
                    <span className="text-sm">{item.name}</span>
                    <span className="ml-auto text-sm font-bold">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar chart - all priorities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Distribuição por Prioridade
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalVotes === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nenhum aluno fez sua escolha ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} barGap={2}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="1a Opção" fill={PRIORITY_COLORS[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="2a Opção" fill={PRIORITY_COLORS[1]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="3a Opção" fill={PRIORITY_COLORS[2]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="4a Opção" fill={PRIORITY_COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
