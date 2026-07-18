"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ClipboardList, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

type StockLog = {
  id: number;
  change: number;
  note?: string;
  createdAt: string;
  product: { id: number; name: string };
};

const StockLogsContent = () => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stock-logs")
      .then((r) => r.json())
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted py-8 text-center">Loading...</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-5 h-5 text-muted" />
        <h1 className="text-xl font-semibold text-foreground">Stock Adjustment Log</h1>
      </div>

      <Card className="overflow-hidden">
        {logs.length === 0 ? (
          <EmptyState icon="inbox" title="No adjustments yet" message="Stock changes will be logged here." />
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-5 py-3.5 text-sm hover:bg-surface/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  log.change > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}>
                  {log.change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/inventory`} className="font-medium text-foreground hover:text-navy transition-colors">
                    {log.product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`font-semibold text-sm ${log.change > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {log.change > 0 ? "+" : ""}{log.change}
                    </span>
                    {log.note && <span className="text-muted">— {log.note}</span>}
                  </div>
                </div>
                <span className="text-xs text-muted shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const AdminStockLogsPage = () => <ErrorBoundary><StockLogsContent /></ErrorBoundary>;
export default AdminStockLogsPage;
