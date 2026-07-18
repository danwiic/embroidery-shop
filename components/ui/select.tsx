import { forwardRef, type SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, className = "", id, children, ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/30 transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  ),
);
Select.displayName = "Select";
