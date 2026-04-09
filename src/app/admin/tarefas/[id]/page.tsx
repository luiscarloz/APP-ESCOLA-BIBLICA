import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { Task, TaskSubmissionWithStudent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TarefaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (!task) notFound();

  const { data: submissions } = await supabase
    .from("task_submissions")
    .select("*, students(name, email)")
    .eq("task_id", id)
    .order("submitted_at", { ascending: false });

  const typedTask = task as Task;
  const typedSubmissions = (submissions ?? []) as TaskSubmissionWithStudent[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tarefas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{typedTask.title}</h1>
          {typedTask.due_date && (
            <p className="text-muted-foreground">
              Prazo: {typedTask.due_date}
            </p>
          )}
        </div>
      </div>

      {typedTask.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{typedTask.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Entregas</CardTitle>
          <CardDescription>
            {typedSubmissions.length} entrega(s) recebida(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typedSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma entrega recebida ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typedSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {sub.students.name}
                    </TableCell>
                    <TableCell>{sub.students.email}</TableCell>
                    <TableCell>
                      {sub.content ? (
                        <span className="line-clamp-2 text-sm">
                          {sub.content}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.file_url ? (
                        <a
                          href={sub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Ver arquivo
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(sub.submitted_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
