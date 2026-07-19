import { Loader2 } from "lucide-react";

type Props = {
  text?: string;
};

export const PageLoader = ({ text = "Loading..." }: Props) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
    <Loader2 className="w-6 h-6 text-navy animate-spin" />
    <p className="text-sm text-muted">{text}</p>
  </div>
);
