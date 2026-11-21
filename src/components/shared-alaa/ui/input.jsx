import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", icon: Icon, ...props }) {
  return (
    <div className="relative w-full">
      {Icon && (
        <span className="absolute start-3 top-1/2 -translate-y-1/2 text-grey text-muted-foreground">
          <Icon size={16} />
        </span>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-grey selection:bg-primary font-medium dark:bg-input/30 border-input border-light-default h-9 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          Icon ? "ps-8" : "px-3",
          className
        )}
        {...props}
      />
    </div>
  );
}

export { Input };
