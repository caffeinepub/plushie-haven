import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { articles } from '../content/articles';
import { Clock } from 'lucide-react';

export default function ArticlesPage() {
  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Articles & Guides</h1>
        <p className="text-lg text-muted-foreground">
          Expert advice and insights for adult plushie enthusiasts. From care tips to lifestyle guides.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.slug} to="/articles/$slug" params={{ slug: article.slug }}>
            <Card className="h-full border-2 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary">{article.category}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                <CardDescription className="line-clamp-3">{article.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary hover:underline">Read More →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
