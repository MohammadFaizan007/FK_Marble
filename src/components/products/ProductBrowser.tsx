"use client";

import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ProductFilters, type FilterGroup } from "@/components/products/ProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductSearch } from "@/components/products/ProductSearch";
import { useChrome } from "@/i18n/use-chrome";
import { hasListedPrice } from "@/lib/price";
import { queryProducts, uniqueProductValues } from "@/lib/product-query";
import { cn } from "@/lib/utils";
import type { Product, ProductCategory, ProductSort } from "@/types/product";

const pageSize = 6;

const sortOptions: { value: ProductSort; priced?: boolean }[] = [
  { value: "newest" },
  { value: "name-asc" },
  { value: "name-desc" },
  { value: "price-asc", priced: true },
  { value: "price-desc", priced: true },
];

type Chip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type ProductBrowserProps = {
  products: Product[];
  categories: ProductCategory[];
  lockedCategorySlug?: string;
};

export function ProductBrowser({
  products,
  categories,
  lockedCategorySlug,
}: ProductBrowserProps) {
  const { copy } = useChrome();
  const searchId = useId();
  const sortId = useId();
  const drawerTitleId = useId();
  const [search, setSearch] = useState("");
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [finishes, setFinishes] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [sort, setSort] = useState<ProductSort>("newest");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const showPriceSort = hasListedPrice(products);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  const filtered = useMemo(
    () =>
      queryProducts(products, {
        search,
        categorySlugs: lockedCategorySlug ? [lockedCategorySlug] : categorySlugs,
        materials,
        colors,
        finishes,
        sizes,
        sort,
      }),
    [products, search, lockedCategorySlug, categorySlugs, materials, colors, finishes, sizes, sort],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  function toggle(values: string[], setValues: (next: string[]) => void, value: string) {
    startTransition(() => {
      setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
      setPage(1);
    });
  }

  function clearFilters() {
    startTransition(() => {
      setSearch("");
      setCategorySlugs([]);
      setMaterials([]);
      setColors([]);
      setFinishes([]);
      setSizes([]);
      setSort("newest");
      setPage(1);
    });
  }

  const groups: FilterGroup[] = [
    ...(lockedCategorySlug
      ? []
      : [
          {
            id: "category",
            label: copy.filters.category,
            options: categories.map((category) => category.name),
            selected: categories
              .filter((category) => categorySlugs.includes(category.slug))
              .map((category) => category.name),
            onToggle: (name: string) => {
              const category = categories.find((item) => item.name === name);
              if (category) {
                toggle(categorySlugs, setCategorySlugs, category.slug);
              }
            },
          },
        ]),
    {
      id: "material",
      label: copy.filters.material,
      options: uniqueProductValues(products, "material"),
      selected: materials,
      onToggle: (value) => toggle(materials, setMaterials, value),
    },
    {
      id: "color",
      label: copy.filters.color,
      options: uniqueProductValues(products, "color"),
      selected: colors,
      onToggle: (value) => toggle(colors, setColors, value),
    },
    {
      id: "finish",
      label: copy.filters.finish,
      options: uniqueProductValues(products, "finish"),
      selected: finishes,
      onToggle: (value) => toggle(finishes, setFinishes, value),
    },
    {
      id: "size",
      label: copy.filters.size,
      options: uniqueProductValues(products, "size"),
      selected: sizes,
      onToggle: (value) => toggle(sizes, setSizes, value),
    },
  ];

  const chips: Chip[] = [
    ...(!lockedCategorySlug
      ? categorySlugs.flatMap((slug) => {
          const category = categories.find((item) => item.slug === slug);
          return category
            ? [
                {
                  key: `category-${slug}`,
                  label: category.name,
                  onRemove: () => toggle(categorySlugs, setCategorySlugs, slug),
                },
              ]
            : [];
        })
      : []),
    ...materials.map((value) => ({
      key: `material-${value}`,
      label: value,
      onRemove: () => toggle(materials, setMaterials, value),
    })),
    ...colors.map((value) => ({
      key: `color-${value}`,
      label: value,
      onRemove: () => toggle(colors, setColors, value),
    })),
    ...finishes.map((value) => ({
      key: `finish-${value}`,
      label: value,
      onRemove: () => toggle(finishes, setFinishes, value),
    })),
    ...sizes.map((value) => ({
      key: `size-${value}`,
      label: value,
      onRemove: () => toggle(sizes, setSizes, value),
    })),
  ];

  if (search.trim()) {
    chips.unshift({
      key: "search",
      label: `${copy.search.chip}: ${search.trim()}`,
      onRemove: () => {
        startTransition(() => {
          setSearch("");
          setPage(1);
        });
      },
    });
  }

  const hasActiveFilters = chips.length > 0 || sort !== "newest";
  const availableSorts = sortOptions.filter((option) => !option.priced || showPriceSort);

  return (
    <div className="mt-10 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-lg border border-border bg-surface p-5">
          <h2 className="font-heading text-2xl text-foreground">{copy.buttons.filters}</h2>
          <div className="mt-6">
            <ProductFilters
              idPrefix="desktop"
              groups={groups}
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
              clearLabel={copy.buttons.clearFilters}
            />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row">
          <ProductSearch
            id={searchId}
            label={copy.search.label}
            placeholder={copy.search.placeholder}
            value={search}
            onChange={(value) => {
              startTransition(() => {
                setSearch(value);
                setPage(1);
              });
            }}
          />
          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-outline lg:hidden"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              {copy.buttons.filters}{chips.length > 0 ? ` (${chips.length})` : ""}
            </button>
            <div className="min-w-0 flex-1 sm:w-52 sm:flex-none">
              <label htmlFor={sortId} className="sr-only">
                {copy.buttons.sortProducts}
              </label>
              <select
                id={sortId}
                value={sort}
                onChange={(event) => {
                  startTransition(() => {
                    setSort(event.target.value as ProductSort);
                    setPage(1);
                  });
                }}
                className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
              >
                {availableSorts.map((option) => (
                  <option key={option.value} value={option.value}>
                    {copy.sort[option.value === "name-asc" ? "nameAsc" : option.value === "name-desc" ? "nameDesc" : option.value === "price-asc" ? "priceAsc" : option.value === "price-desc" ? "priceDesc" : "newest"]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2" aria-live="polite">
          <p className="text-sm text-muted-foreground">
            {filtered.length === 0
              ? copy.zeroProducts
              : copy.showingProducts(rangeStart, rangeEnd, filtered.length)}
          </p>
          {pending ? <LoadingState label={copy.updating} /> : null}
        </div>

        {chips.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm text-foreground"
                >
                  {chip.label}
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">{copy.search.remove} {chip.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button type="button" className="min-h-10 px-2 text-sm font-medium text-accent" onClick={clearFilters}>
                {copy.buttons.clearAll}
              </button>
            </li>
          </ul>
        ) : null}

        <div className={cn("mt-6", pending && "opacity-70")} aria-busy={pending}>
          {visible.length > 0 ? (
            <ProductGrid products={visible} />
          ) : (
            <EmptyState
              title={copy.noMatchTitle}
              description={copy.noMatchMessage}
              action={
                <button type="button" className="btn btn-outline" onClick={clearFilters}>
                  {copy.buttons.clearFilters}
                </button>
              }
            />
          )}
        </div>

        {pageCount > 1 ? (
          <nav aria-label={copy.buttons.pagination} className="mt-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn btn-outline"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              {copy.buttons.previous}
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-current={pageNumber === currentPage ? "page" : undefined}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-md border text-sm",
                  pageNumber === currentPage
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground",
                )}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-outline"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              {copy.buttons.next}
            </button>
          </nav>
        ) : null}
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-primary/50"
            aria-label={copy.buttons.closeFilters}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={drawerTitleId}
            className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col bg-background shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 id={drawerTitleId} className="font-heading text-2xl">
                {copy.buttons.filters}
              </h2>
              <button type="button" className="min-h-11 px-2 text-sm" onClick={() => setDrawerOpen(false)}>
                {copy.buttons.close}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <ProductFilters
                idPrefix="mobile"
                groups={groups}
                onClear={clearFilters}
                hasActiveFilters={hasActiveFilters}
                clearLabel={copy.buttons.clearFilters}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
