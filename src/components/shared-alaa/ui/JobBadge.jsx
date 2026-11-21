import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-roboto font-medium w-28  shrink-0 gap-1 transition-colors duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        webDesign: "bg-baby-blue text-main", 
        frontEnd: "bg-light-success text-success", 
        backEnd: "bg-light-warning text-warning", 
        fullstack: "bg-beige text-brown", 
        default: "bg-gray-200 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function JobBadge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { JobBadge, badgeVariants };
