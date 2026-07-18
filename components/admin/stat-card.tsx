export const StatCard = ({
  label,
  value,
  color = "text-navy",
}: {
  label: string;
  value: string | number;
  color?: string;
}) => (
  <div className="bg-white rounded-xl border border-border p-5">
    <p className="text-sm text-muted">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);
