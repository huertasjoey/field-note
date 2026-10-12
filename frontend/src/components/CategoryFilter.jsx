import { CATEGORIES } from "../lib/format";

const options = ["All", ...CATEGORIES];

function CategoryFilter({ active, onChange }) {
  return (
    <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
      {options.map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={active === c}
          onClick={() => onChange(c)}
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
            active === c ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand hover:text-brand"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
