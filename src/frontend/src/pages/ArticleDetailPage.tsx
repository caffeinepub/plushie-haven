import { useParams, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { articles } from '../content/articles';
import { ArrowLeft, Clock } from 'lucide-react';

export default function ArticleDetailPage() {
  const { slug } = useParams({ from: '/articles/$slug' });
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="container py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">Article Not Found</h1>
        <p className="mb-6 text-muted-foreground">The article you're looking for doesn't exist.</p>
        <Link to="/articles">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/articles">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </Link>

        <article className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge>{article.category}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{article.title}</h1>
            <p className="text-xl text-muted-foreground">{article.summary}</p>
          </div>

          <Separator />

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
