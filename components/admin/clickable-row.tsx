"use client";

import { useRouter } from "next/navigation";
import type { ReactNode, MouseEventHandler, KeyboardEvent } from "react";

type Props = { href?: string; onClick?: MouseEventHandler; children: ReactNode };

export const ClickableRow = ({ href, onClick, children }: Props) => {
  const router = useRouter();
  const handle: MouseEventHandler = (e) => {
    if (onClick) { onClick(e); return; }
    if (href) router.push(href);
  };
  return (
    <tr
      className="border-b border-border/50 text-sm hover:bg-surface/50 transition-colors cursor-pointer"
      onClick={handle}
      onKeyDown={(e: KeyboardEvent<HTMLTableRowElement>) => { if (e.key === "Enter") handle(e as unknown as React.MouseEvent); }}
      tabIndex={0}
    >
      {children}
    </tr>
  );
};
