import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import HeroArticle from "../components/HeroArticle";
import ArticleCard from "../components/ArticleCard";
import CategoryFilter from "../components/CategoryFilter";
import NewsLetter from "../components/NewsLetter";
import { Loading, ErrorState, EmptyState } from "../components/StateMessage";
import { useAsync } from "../hooks/useAsync";
import { useDebounce } from "../hooks/useDebounce";
import { api } from "../lib/api";
import { CATEGORIES } from "../lib/format";

const PAGE_SIZE = 9;

function Featured() {
  const fetchFeatured = useCallback((signal) => api.getFeatured(signal), []);
  const { data, error, loading } = useAsync(fetchFeatured);

  if (loading) return <Loading label="Loading featured story…" />;
  if (error) {
    // 404 just means there are no articles yet; the list below shows the empty state.
    return error.status === 404 ? null : <ErrorState message={error.message} />;
  }
  return <HeroArticle article={data} />;
}

function Homepage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = CATEGORIES.includes(searchParams.get("category")) ? searchParams.get("category") : "All";

  const [input, setInput] = useState("");
  const search = useDebounce(input.trim());
  const [retry, setRetry] = useState(0);

  // Page resets to 1 whenever the filters change (state adjusted during render, not in an effect)
  const filterKey = `${category}|${search}`;
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const setPage = (p) => setPageState({ key: filterKey, page: p });

  const fetchList = useCallback(
    (signal) => api.getArticles({ category, search, page, limit: PAGE_SIZE }, signal),
    // `retry` is only here so the Try again button can force a new request
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, search, page, retry],
  );
  const { data, error, loading } = useAsync(fetchList);

  function selectCategory(c) {
    setSearchParams(c === "All" ? {} : { category: c }, { replace: true, preventScrollReset: true });
  }

  return (
    <>
      <Featured />

      <section id="recent" aria-labelledby="recent-heading" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
          <h2 id="recent-heading" className="font-serif text-3xl font-bold">
            Recent stories
          </h2>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} aria-hidden="true" />
            <label htmlFor="search" className="sr-only">
              Search articles
            </label>
            <input
              id="search"
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search stories…"
              className="w-full rounded-full border border-line bg-white py-2 pl-10 pr-4 text-sm"
            />
          </div>
        </div>

        <div className="mt-6">
          <CategoryFilter active={category} onChange={selectCategory} />
        </div>

        <div className="mt-8" aria-live="polite">
          {loading && <Loading label="Loading stories…" />}
          {error && <ErrorState message={error.message} onRetry={() => setRetry((r) => r + 1)} />}
          {data && data.articles.length === 0 && (
            <EmptyState title="No stories found">
              {search || category !== "All"
                ? "Try a different search or category."
                : "There are no articles yet. Add one from the admin page."}
            </EmptyState>
          )}
          {data && data.articles.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.articles.map((a) => (
                  <ArticleCard key={a._id} article={a} />
                ))}
              </div>
              {data.totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 text-sm">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-white px-4 hover:border-brand disabled:opacity-40"
                  >
                    <ArrowLeft size={14} aria-hidden="true" /> Previous
                  </button>
                  <span className="text-muted">
                    Page {data.page} of {data.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-white px-4 hover:border-brand disabled:opacity-40"
                  >
                    Next <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      <NewsLetter />
    </>
  );
}

export default Homepage;
