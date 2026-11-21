import * as React from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

function Table({
  className,
  containerClassName,
  ...props
}) {
  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto", containerClassName)}
    >
      <table
        data-slot="table"
        className={cn("w-full  caption-bottom text-sm", className)}
        {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b  ", className)}
      {...props} />
  );
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0 ", className)}
      {...props} />
  );
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0 ", className)}
      {...props} />
  );
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 py-2 data-[state=selected]:bg-muted border-b transition-colors ",
        className
      )}
      {...props} />
  );
}

function TableHead({
  className,
  ...props
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <th
      data-slot="table-head"
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "text-foreground h-10 align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5 px-6 py-9",
        isRTL ? "text-right" : "text-left",
        className
      )}
      {...props} />
  );
}

function TableCell({
  className,
  ...props
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <td
      data-slot="table-cell"
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "py-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5 px-6",
        isRTL ? "text-right" : "text-left",
        className
      )}
      {...props} />
  );
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props} />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
