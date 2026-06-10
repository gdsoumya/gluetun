import { useState, useRef, useEffect, useMemo } from 'react';

/**
 * Searchable multi-select with chips.
 * options: [{ value, hint }] where hint is an optional right-aligned
 * annotation (e.g. server count).
 */
const MultiSelect = ({ label, options, selected, onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter(
      (o) => !selected.includes(o.value) && (!q || o.value.toLowerCase().includes(q)),
    );
  }, [options, selected, query]);

  const add = (value) => {
    onChange([...selected, value]);
    setQuery('');
  };

  const remove = (value) => onChange(selected.filter((v) => v !== value));

  return (
    <div ref={rootRef} className="relative">
      {label && <p className="label-xs mb-1.5">{label}</p>}

      <div
        className="input flex flex-wrap items-center gap-1.5 cursor-text min-h-[42px]"
        onClick={() => setOpen(true)}
      >
        {selected.map((value) => (
          <span key={value} className="chip">
            {value}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(value);
              }}
              className="hover:text-fog rounded px-0.5"
              aria-label={`remove ${value}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // exact match first, else free-text entry (manual fallback)
              const match = filtered.find(
                (o) => o.value.toLowerCase() === query.trim().toLowerCase(),
              );
              const value = match?.value || query.trim();
              if (value) add(value);
            } else if (e.key === 'Backspace' && !query && selected.length > 0) {
              remove(selected[selected.length - 1]);
            }
          }}
          placeholder={selected.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none ring-0 focus:ring-0 p-0 text-sm placeholder:text-fog-mute"
        />
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto bg-ink-700 border border-ink-500 rounded-lg shadow-xl shadow-ink-950/60">
          {filtered.slice(0, 200).map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => add(o.value)}
                className="w-full flex justify-between items-center gap-3 px-3 py-2 text-left text-sm text-fog-dim hover:text-fog hover:bg-ink-600 transition-colors"
              >
                <span>{o.value}</span>
                {o.hint && <span className="font-mono text-xs text-fog-mute">{o.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && query && (
        <div className="absolute z-30 mt-1 w-full bg-ink-700 border border-ink-500 rounded-lg px-3 py-2 text-sm text-fog-mute">
          no match for “{query}” — press Enter to add it anyway
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
