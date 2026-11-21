import React from "react";

export default function StepSection({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-base font-semibold text-primary md:text-lg">
        <span className="flex size-5 items-center justify-center rounded-full border border-primary text-xs">
          i
        </span>
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}
