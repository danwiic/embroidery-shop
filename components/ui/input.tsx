import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  suffix?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, suffix, className = "", id, ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={`w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/30 transition-colors ${suffix ? "pr-10" : ""} ${className}`}
          {...props}
        />
        {suffix && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
            {suffix}
          </div>
        )}
      </div>
    </div>
  ),
);
Input.displayName = "Input";
