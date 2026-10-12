import { useCallback, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import SafeImage from "../components/SafeImage";
import { Loading, ErrorState } from "../components/StateMessage";
import { useAsync } from "../hooks/useAsync";
import { api } from "../lib/api";
import { formatDate } from "../lib/format";
import NotFound from "./NotFound";

function ArticlePage() {
  const { id } = useParams();
  const { state } = useLocation();
  const fetchArticle = useCallback((signal) => api.getArticle(id, signal), [id]);
  const { data: article, error, loading } = useAsync(fetchArticle);

  useEffect(() => {
    if (article) document.title = `${article.title} · Fieldnote`;
    return () => {
      document.title = "Fieldnote";
    };
  }, [article]);

  if (loading) return <Loading label="Loading article…" />;
  if (error?.status === 404 || error?.status === 400) return <NotFound message="We couldn't find that article." />;
  if (error) return <ErrorState message={error.message} />;

  const paragraphs = article.content.split(/\n\s*\n/).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {state?.notice && (
        <p role="status" className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {state.notice}
        </p>
      )}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ArrowLeft size={14} aria-hidden="true" /> All stories
      </Link>

      <header className="mt-6">
        <Link
          to={`/?category=${article.category}#recent`}
          className="text-xs font-semibold uppercase tracking-widest text-accent hover:underline"
        >
          {article.category}
        </Link>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">{article.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{article.excerpt}</p>
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>
            By <span className="font-medium text-ink">{article.author}</span>
          </span>
          <span>{formatDate(article.createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} aria-hidden="true" /> {article.readTime} min read
          </span>
        </p>
      </header>

      <SafeImage
        src={article.image}
        alt={article.title}
        className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
      />

      <div className="mt-10 space-y-6 font-serif text-lg leading-8">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}

export default ArticlePage;
