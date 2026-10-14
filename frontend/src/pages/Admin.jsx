import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Loading, ErrorState, EmptyState } from "../components/StateMessage";
import { useAsync } from "../hooks/useAsync";
import { api } from "../lib/api";
import { formatDate } from "../lib/format";

function ConfirmDelete({ article, busy, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  // Move focus into the dialog (on the safe action), and put it back on close
  useEffect(() => {
    const opener = document.activeElement;
    cancelRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      onCancel();
      return;
    }
    if (e.key !== "Tab") return;
    const items = dialogRef.current.querySelectorAll("button:not(:disabled)");
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onKeyDown={handleKeyDown}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="font-serif text-xl font-bold">
          Delete this article?
        </h2>
        <p className="mt-2 text-sm text-muted">
          “{article.title}” will be permanently deleted. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-full border border-line px-5 text-sm hover:border-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="min-h-11 rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-rose-800 disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Admin() {
  const [version, setVersion] = useState(0);
  const fetchList = useCallback(
    (signal) => api.getArticles({ limit: 50 }, signal),
    // `version` forces a refetch after each create/update/delete
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const { data, error, loading } = useAsync(fetchList);

  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  // Success message handed over by the editor page after saving
  const { state } = useLocation();
  const [notice, setNotice] = useState(state?.notice ? { type: "success", message: state.notice } : null);

  const refresh = () => setVersion((v) => v + 1);

  async function handleFeature(article) {
    setNotice(null);
    try {
      await api.updateArticle(article._id, { featured: true });
      setNotice({ type: "success", message: `“${article.title}” is now the featured article.` });
      refresh();
    } catch (err) {
      setNotice({ type: "error", message: err.message });
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await api.deleteArticle(toDelete._id);
      setNotice({ type: "success", message: "Article deleted." });
      refresh();
    } catch (err) {
      setNotice({ type: "error", message: err.message });
    } finally {
      setBusy(false);
      setToDelete(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-bold">Manage articles</h1>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          <Plus size={16} aria-hidden="true" /> Upload Blog
        </Link>
      </div>

      {notice && (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            notice.type === "error" ? "bg-rose-50 text-accent" : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.message}
        </p>
      )}

      <div className="mt-6">
          <>
            {loading && <Loading label="Loading articles…" />}
            {error && <ErrorState message={error.message} onRetry={refresh} />}
            {data && data.articles.length === 0 && (
              <EmptyState title="No articles yet">Click “Upload Blog” to write your first one.</EmptyState>
            )}
            {data && data.articles.length > 0 && (
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
                {data.articles.map((a) => (
                  <li key={a._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <Link to={`/articles/${a._id}`} className="font-medium hover:text-brand">
                          {a.title}
                        </Link>
                        {a.featured && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Featured
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {a.category} · {a.author} · {formatDate(a.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                      <Link
                        to={`/articles/${a._id}`}
                        className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-3 text-sm sm:min-h-9 hover:border-brand"
                      >
                        <Eye size={14} aria-hidden="true" /> View
                      </Link>
                      {!a.featured && (
                        <button
                          type="button"
                          onClick={() => handleFeature(a)}
                          className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-3 text-sm sm:min-h-9 hover:border-amber-500"
                        >
                          <Star size={14} aria-hidden="true" /> Feature
                        </button>
                      )}
                      <Link to={`/admin/articles/${a._id}/edit`} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-3 text-sm sm:min-h-9 hover:border-brand">
                        <Pencil size={14} aria-hidden="true" /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete(a)}
                        className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-3 text-sm sm:min-h-9 text-accent hover:border-accent"
                      >
                        <Trash2 size={14} aria-hidden="true" /> Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
      </div>

      {toDelete && (
        <ConfirmDelete article={toDelete} busy={busy} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
      )}
    </div>
  );
}

export default Admin;
