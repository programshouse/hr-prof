import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-roboto font-medium w-28 shrink-0 gap-1 transition-colors duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        nearExpire: "bg-light-yellow text-yellow",      
        active: "bg-light-success  text-success ",         
        draft: "bg-light-default text-gray",           
        expired: "bg-light-warning text-warning",         

        default: "bg-gray-200 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function StatueBadge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { StatueBadge, badgeVariants };
