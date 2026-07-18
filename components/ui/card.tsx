import type { ReactNode } from "react";

export const Card = ({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-lg shadow-card ${className}`}
    {...props}
  >
    {children}
  </div>
);
