export type FilterGroup = {
  id: string;
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
};

type ProductFiltersProps = {
  groups: FilterGroup[];
  onClear: () => void;
  hasActiveFilters: boolean;
  idPrefix: string;
  clearLabel?: string;
};

export function ProductFilters({
  groups,
  onClear,
  hasActiveFilters,
  idPrefix,
  clearLabel = "Clear all filters",
}: ProductFiltersProps) {
  const visibleGroups = groups.filter((group) => group.options.length > 0);

  return (
    <div className="space-y-7">
      {visibleGroups.map((group) => (
        <fieldset key={group.id}>
          <legend className="text-xs font-medium tracking-[0.16em] text-foreground uppercase">
            {group.label}
          </legend>
          <ul className="mt-3 space-y-1">
            {group.options.map((option) => {
              const inputId = `${idPrefix}-${group.id}-${option}`
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-");

              return (
                <li key={option}>
                  <label htmlFor={inputId} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground">
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={group.selected.includes(option)}
                      onChange={() => group.onToggle(option)}
                      className="size-4 accent-accent"
                    />
                    {option}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
      {hasActiveFilters ? (
        <button type="button" className="min-h-11 text-sm font-medium text-accent" onClick={onClear}>
          {clearLabel}
        </button>
      ) : null}
    </div>
  );
}
