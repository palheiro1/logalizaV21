import React from "react";

interface BrandWordmarkProps {
  inline?: boolean;
}

/** The in-app brand is the name alone; the G symbol is reserved for app icons. */
export function BrandWordmark({ inline = false }: BrandWordmarkProps) {
  const accentClassName = inline ? "text-red-600 dark:text-red-400" : "text-red-500";

  return (
    <span className="whitespace-nowrap font-extrabold tracking-tight">
      LO<span className={accentClassName}>G</span>ALI<span className={accentClassName}>Z</span>A
    </span>
  );
}
