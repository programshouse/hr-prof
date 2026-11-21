import React from 'react';

export default function StepSection({ title, children }) {
  return (
    <section className="space-y-4">
      <div className="border-b pb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}