import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";
import { formatDate } from "../lib/format";

function ArticleCard({ article }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-lg">
      <Link to={`/articles/${article._id}`} className="block overflow-hidden" tabIndex={-1} aria-hidden="true">
        <SafeImage
          src={article.image}
          alt=""
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">{article.category}</span>
        <h3 className="mt-2 font-serif text-xl font-bold leading-snug">
          <Link to={`/articles/${article._id}`} className="transition-colors hover:text-brand">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{article.excerpt}</p>
        <p className="mt-auto pt-4 text-xs text-muted">
          {article.author} · {formatDate(article.createdAt)} · {article.readTime} min read
        </p>
      </div>
    </article>
  );
}

export default ArticleCard;
