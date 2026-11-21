import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getPages(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];

  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function SimplePagination({
  total,
  page,
  pageSize,
  onPageChange,
  className,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = getPages(page, totalPages);

  const goTo = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    onPageChange(newPage);
  };

  return (
    <div
      className={cn(
        "mt-6 flex items-center justify-between text-sm",
        className
      )}
    >
      {/* Previous */}
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl flex items-center gap-2 px-4"
        disabled={page === 1}
        onClick={() => goTo(page - 1)}
      >
        <ChevronLeft className="size-4" />
        <span>Previous</span>
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-2">
        {pages.map((p, idx) =>
          p === "..." ? (
            <span
              key={`dots-${idx}`}
              className="px-3 py-1 text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={cn(
                "min-w-8 rounded-lg px-3 py-1 text-sm border border-gray-200 bg-white shadow-sm",
                "hover:bg-gray-50",
                p === page && "bg-primary text-white border-primary"
              )}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl flex items-center gap-2 px-4"
        disabled={page === totalPages}
        onClick={() => goTo(page + 1)}
      >
        <span>Next</span>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
