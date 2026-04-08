import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Calendar } from "lucide-react";

interface NewsCardProps {
  title: string;
  content: string;
  published_at: string;
  image_url: string | null;
}

export function NewsCard({
  title,
  content,
  published_at,
  image_url,
}: NewsCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
      {image_url && (
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src={image_url}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(published_at), "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })}
        </div>
        <CardTitle className="text-base leading-snug">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}
