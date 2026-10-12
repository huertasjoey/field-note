import { useState } from "react";
import SafeImage from "./SafeImage";
import { CATEGORIES } from "../lib/format";

const empty = { title: "", excerpt: "", content: "", category: CATEGORIES[0], author: "", image: "", featured: false };

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function validate(v) {
  const e = {};
  if (!v.title.trim()) e.title = "Title is required";
  else if (v.title.length > 160) e.title = "Title must be 160 characters or fewer";
  if (!v.excerpt.trim()) e.excerpt = "Excerpt is required";
  else if (v.excerpt.length > 400) e.excerpt = "Excerpt must be 400 characters or fewer";
  if (!v.content.trim()) e.content = "Content is required";
  if (!v.author.trim()) e.author = "Author is required";
  if (!v.image.trim()) e.image = "Image URL is required";
  else if (!isHttpUrl(v.image.trim())) e.image = "Enter a valid http(s) URL";
  return e;
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-line bg-white px-3 py-2";

function ArticleForm({ article, onSubmit, onCancel }) {
  const [values, setValues] = useState(
    article
      ? {
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category,
          author: article.author,
          image: article.image,
          featured: article.featured,
        }
      : empty,
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSubmitError("");
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSubmit({ ...values, title: values.title.trim(), image: values.image.trim() });
    } catch (err) {
      setSubmitError(err.message);
      setSaving(false);
    }
  }

  const fieldProps = (key) => ({
    id: key,
    value: values[key],
    onChange: set(key),
    className: `${inputClass} ${errors[key] ? "border-accent" : ""}`,
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl border border-line bg-white p-6">
      <Field id="title" label="Blog Title" error={errors.title}>
        <input type="text" {...fieldProps("title")} />
      </Field>
      <Field id="excerpt" label="Excerpt" error={errors.excerpt}>
        <textarea rows={2} {...fieldProps("excerpt")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="category" label="Category" error={errors.category}>
          <select {...fieldProps("category")}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field id="author" label="Author" error={errors.author}>
          <input type="text" {...fieldProps("author")} />
        </Field>
      </div>
      <Field id="image" label="Cover Image URL" error={errors.image}>
        <input type="url" placeholder="https://images.unsplash.com/…" {...fieldProps("image")} />
      </Field>
      {isHttpUrl(values.image.trim()) && (
        <figure>
          <SafeImage
            key={values.image.trim()}
            src={values.image.trim()}
            alt="Cover image preview"
            className="aspect-[16/9] w-full max-w-md rounded-xl border border-line object-cover"
          />
          <figcaption className="mt-1 text-xs text-muted">Cover preview</figcaption>
        </figure>
      )}
      <Field id="content" label="Blog Content (separate paragraphs with a blank line)" error={errors.content}>
        <textarea rows={12} {...fieldProps("content")} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.featured} onChange={set("featured")} className="size-4 accent-brand" />
        Featured article (replaces the current featured article on the homepage)
      </label>

      {submitError && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-accent">
          {submitError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? (article ? "Saving…" : "Publishing…") : article ? "Save changes" : "Publish Blog"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-line px-6 py-2.5 text-sm hover:border-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ArticleForm;
