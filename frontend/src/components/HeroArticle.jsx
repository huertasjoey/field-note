import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SafeImage from "./SafeImage";
import { formatDate } from "../lib/format";

function HeroArticle({ article }) {
  return (
    <section aria-label="Featured article" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <Link to={`/articles/${article._id}`} className="block overflow-hidden rounded-2xl" tabIndex={-1} aria-hidden="true">
          <SafeImage
            src={article.image}
            alt=""
            className="aspect-4/3 w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </Link>
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Featured · {article.category}
          </span>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{article.excerpt}</p>
          <p className="mt-5 text-sm text-muted">
            By <span className="font-medium text-ink">{article.author}</span> · {formatDate(article.createdAt)} ·{" "}
            {article.readTime} min read
          </p>
          <Link
            to={`/articles/${article._id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand"
          >
            Read article <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroArticle;
