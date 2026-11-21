import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { FiCheck, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { translateRequestStatus } from "@/utils/requestLabels";

const requestStatusVariants = cva(
  "inline-flex items-center gap-2 px-4 py-2  rounded-xl text-sm font-medium transition-colors duration-200 w-28",
  {
    variants: {
      variant: {
        approved: "bg-success text-light-success ",
        rejected: "bg-warning text-light-warning",
      },
    },
    defaultVariants: {
      variant: "approved",
    },
  }
);

function RequestStatus({
  className,
  variant = "approved",
  asChild = false,
  ...props
}) {
  const { t } = useTranslation();
  const Comp = asChild ? Slot : "span";

  const Icon = variant === "approved" ? FiCheck : FiX;
  const label = translateRequestStatus(t, variant);

  return (
    <Comp
      className={cn(requestStatusVariants({ variant }), className)}
      {...props}
    >
      <span
        className={`flex items-center justify-center w-4 h-4 rounded-full ${
          variant === "approved"
            ? "bg-light-success  text-success"
            : "bg-light-warning text-warning"
        }`}
      >
        <Icon size={16} />
      </span>
      {label}
    </Comp>
  );
}

export { RequestStatus };
