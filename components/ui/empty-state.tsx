import type { ReactNode } from "react";
import { Inbox, ShoppingBag, PackageSearch, SearchX, FileX } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

type EmptyStateProps = {
  icon?: "inbox" | "cart" | "products" | "search" | "orders";
  title: string;
  message?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
};

const ICONS = {
  inbox: Inbox,
  cart: ShoppingBag,
  products: PackageSearch,
  search: SearchX,
  orders: FileX,
};

export const EmptyState = ({ icon = "inbox", title, message, action }: EmptyStateProps) => {
  const Icon = ICONS[icon];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted/50" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {message && <p className="text-sm text-muted mt-1 max-w-xs text-center">{message}</p>}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Link href={action.href}>
              <Button size="sm">{action.label}</Button>
            </Link>
          ) : (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
