import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ArticleForm from "../components/ArticleForm";
import { Loading, ErrorState } from "../components/StateMessage";
import { useAsync } from "../hooks/useAsync";
import { api } from "../lib/api";
import NotFound from "./NotFound";

// One editor for both routes: /admin/articles/new and /admin/articles/:id/edit
function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchArticle = useCallback((signal) => (id ? api.getArticle(id, signal) : Promise.resolve(null)), [id]);
  const { data: article, error, loading } = useAsync(fetchArticle);

  async function handleSubmit(values) {
    if (id) {
      await api.updateArticle(id, values);
      navigate("/admin", { state: { notice: "Article updated." } });
    } else {
      const created = await api.createArticle(values);
      navigate(`/articles/${created._id}`, { state: { notice: "Your blog was published successfully." } });
    }
  }

  const goBack = () => navigate("/admin");

  let body;
  if (loading) body = <Loading label="Loading article…" />;
  else if (error?.status === 404 || error?.status === 400) return <NotFound message="We couldn't find that article." />;
  else if (error) body = <ErrorState message={error.message} />;
  else body = <ArticleForm key={article?._id ?? "new"} article={article} onSubmit={handleSubmit} onCancel={goBack} />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ArrowLeft size={14} aria-hidden="true" /> Manage articles
      </Link>
      <h1 className="mb-6 mt-4 font-serif text-3xl font-bold">{id ? "Edit blog" : "Upload a blog"}</h1>
      {body}
    </div>
  );
}

export default ArticleEditor;
