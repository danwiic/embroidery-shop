import { forwardRef, type ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "contained" | "outlined" | "text";
  size?: "sm" | "md" | "lg";
};

const VARIANTS = {
  contained:
    "bg-navy text-white hover:bg-navy-light active:bg-navy-dark shadow-sm hover:shadow-raised transition-all",
  outlined:
    "border border-navy text-navy hover:bg-navy/5 active:bg-navy/10 transition-colors",
  text: "text-navy hover:bg-navy/5 active:bg-navy/10 transition-colors",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "contained", size = "md", className = "", disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/30 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";
