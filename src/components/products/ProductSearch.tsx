type ProductSearchProps = {
  id: string;
  value: string;
  label?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function ProductSearch({
  id,
  value,
  label = "Search products by name, material, or category",
  placeholder = "Search by name, material, or category",
  onChange,
}: ProductSearchProps) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
      />
    </div>
  );
}
