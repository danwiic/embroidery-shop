"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { CheckCircle, XCircle, Package, Truck, Store } from "lucide-react";
import Image from "next/image";
import type { OrderStatus } from "@prisma/client";

type Order = {
  id: string;
  orderNumber: string;
  serviceType: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  paymentRef: string;
  deliveryAddress?: string;
  fulfillment?: string;
  estimatedCompletion?: string;
  pickupDate?: string;
  garmentPhotoUrl?: string;
  fitPreference?: string;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string };
  category?: { name: string };
  items?: { id: string; quantity: number; price: number; product: { name: string; imageUrl?: string } }[];
  measurements?: Record<string, number | null>;
  statusHistory?: { id: string; status: OrderStatus; note?: string; createdAt: string }[];
};

const STATUS_FLOW: Record<string, string[]> = {
  PENDING_PAYMENT: ["PAYMENT_VERIFIED", "CANCELLED"],
  PAYMENT_VERIFIED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

type Props = { orderId: string | null; onClose: () => void };

export const OrderDetailModal = ({ orderId, onClose }: Props) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState("");
  const [note, setNote] = useState("");
  const [assignee, setAssignee] = useState("");

  useEffect(() => {
    if (!orderId) { setOrder(null); return; }
    setLoading(true);
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId]);

  const doAction = async () => {
    if (!actionStatus || updating) return;
    setUpdating(true);
    const body: any = { status: actionStatus };
    if (note.trim()) body.note = note.trim();
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setActionModal(null);
      const data = await res.json();
      setOrder(data);
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to update order");
    }
    setUpdating(false);
  };

  const actionMeta = (status: string) => {
    const map: Record<string, { title: string; icon: any; desc: string }> = {
      PAYMENT_VERIFIED: { title: "Verify Payment", icon: CheckCircle, desc: "Confirm payment reference and verify the transaction." },
      PROCESSING: { title: "Process Order", icon: Package, desc: order?.serviceType === "ALTERATION" ? "Assign the alteration to a tailor." : "Prepare items for delivery or pickup." },
      READY_FOR_PICKUP: { title: "Mark Ready for Pickup", icon: Store, desc: "Update status to ready for customer pickup." },
      OUT_FOR_DELIVERY: { title: "Out for Delivery", icon: Truck, desc: "Mark order as out for delivery." },
      COMPLETED: { title: "Complete Order", icon: CheckCircle, desc: "Mark the order as completed." },
      CANCELLED: { title: "Cancel Order", icon: XCircle, desc: "Cancel this order. Cannot be undone." },
    };
    return map[status] ?? { title: status.replace(/_/g, " "), icon: CheckCircle, desc: "" };
  };

  const ActionIcon = actionMeta(actionStatus).icon;

  // Small modal for action
  const actionForm = actionModal && order && (
    <Modal open={!!actionModal} onClose={() => setActionModal(null)}
      title={actionMeta(actionStatus).title}
      footer={<>
        <Button type="button" variant="outlined" onClick={() => setActionModal(null)}>Cancel</Button>
        <Button type="submit" form="action-form" disabled={updating}>
          {updating ? "Updating..." : actionMeta(actionStatus).title}
        </Button>
      </>}
    >
      <form id="action-form" onSubmit={(e) => { e.preventDefault(); doAction(); }} className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-navy/5 border border-navy/10">
          <ActionIcon className="w-5 h-5 text-navy shrink-0" />
          <p className="text-sm text-muted">{actionMeta(actionStatus).desc}</p>
        </div>
        {(actionStatus === "PROCESSING" || actionStatus === "READY_FOR_PICKUP" || actionStatus === "OUT_FOR_DELIVERY") && (
          <Input label="Assign to" value={assignee} onChange={(e) => setAssignee(e.target.value)}
            placeholder={order.serviceType === "ALTERATION" ? "Tailor name" : "Staff name"} />
        )}
        <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this update..." />
        {actionStatus === "CANCELLED" && (
          <p className="text-xs text-red-600">This will cancel the order. The customer will be notified.</p>
        )}
      </form>
    </Modal>
  );

  return (
    <>
      <Modal open={!!orderId} onClose={onClose} title=""
        footer={<Button type="button" variant="outlined" onClick={onClose}>Close</Button>}
      >
        {loading ? (
          <PageLoader />
        ) : !order ? (
          <p className="text-red-600 text-sm text-center py-8">Order not found</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy">Order #{order.orderNumber.slice(0, 8)}</h2>
                <p className="text-muted text-xs mt-0.5">
                  {new Date(order.createdAt).toLocaleString()} &middot;{" "}
                  <span className="capitalize">{order.serviceType.toLowerCase().replace("_", " ")}</span>
                </p>
              </div>
              <Badge status={order.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl shadow-card p-4">
                <h3 className="text-xs font-semibold text-navy mb-2">Customer</h3>
                <p className="text-sm text-foreground">{order.user.name}</p>
                <p className="text-sm text-muted">{order.user.email}</p>
                {order.user.phone && <p className="text-sm text-muted">{order.user.phone}</p>}
              </div>
              <div className="bg-white rounded-xl shadow-card p-4">
                <h3 className="text-xs font-semibold text-navy mb-2">Payment</h3>
                <p className="text-sm">Method: {order.paymentMethod}</p>
                <p className="text-sm text-muted">Ref: {order.paymentRef}</p>
                <p className="text-sm font-semibold text-navy mt-1">₱{Number(order.totalAmount).toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-card p-4">
                <h3 className="text-xs font-semibold text-navy mb-2">Fulfillment</h3>
                {order.fulfillment && <p className="text-sm capitalize">{order.fulfillment.toLowerCase()}</p>}
                {order.deliveryAddress && <p className="text-sm text-muted">{order.deliveryAddress}</p>}
                {order.pickupDate && <p className="text-sm text-muted">Pickup: {new Date(order.pickupDate).toLocaleDateString()}</p>}
                {order.estimatedCompletion && <p className="text-sm text-muted">Est. completion: {new Date(order.estimatedCompletion).toLocaleDateString()}</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-card p-4">
              <h3 className="text-xs font-semibold text-navy mb-3">Details</h3>
              {order.serviceType === "ALTERATION" ? (
                <div className="space-y-2 text-sm">
                  <p>Garment: {order.category?.name}</p>
                  <p>Fit: {order.fitPreference?.replace("_", " ") ?? "N/A"}</p>
                  {order.garmentPhotoUrl && <div className="relative max-w-[200px]"><Image src={order.garmentPhotoUrl} alt="Garment" fill sizes="200px" className="object-contain rounded-lg shadow-card" /></div>}
                  {order.measurements && (
                    <div className="mt-2">
                      <p className="font-medium mb-1">Measurements:</p>
                      <div className="grid grid-cols-3 gap-1 text-xs text-muted">
                        {Object.entries(order.measurements).map(([key, val]) =>
                          val && !["id", "orderId"].includes(key) && (
                            <p key={key} className="capitalize">{key.replace(/([A-Z])/g, " $1")}: {val} cm</p>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b border-border">
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium">Qty</th>
                      <th className="pb-2 font-medium">Price</th>
                      <th className="pb-2 font-medium text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => (
                      <tr key={item.id} className="border-b border-border/50">
                        <td className="py-2">{item.product.name}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">₱{Number(item.price).toFixed(2)}</td>
                        <td className="py-2 text-right">₱{(Number(item.price) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {(STATUS_FLOW[order.status] ?? []).length > 0 && (
              <div className="bg-white rounded-xl shadow-card p-4">
                <h3 className="text-xs font-semibold text-navy mb-3">Actions</h3>
                <div className="flex flex-wrap gap-2">
                {(STATUS_FLOW[order.status] ?? []).map((s) => {
                    const meta = actionMeta(s);
                    const Icon = meta.icon;
                    const isCancel = s === "CANCELLED";
                    return (
                      <button key={s} onClick={() => { setActionStatus(s); setNote(""); setAssignee(""); setActionModal(s); }}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isCancel
                            ? "border border-red-200 text-red-700 hover:bg-red-50"
                            : "bg-navy text-white hover:bg-navy-light shadow-sm hover:shadow-raised"
                        }`}>
                        <Icon className="w-4 h-4" /> {meta.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-card p-4">
              <h3 className="text-xs font-semibold text-navy mb-3">Status History</h3>
              {order.statusHistory && order.statusHistory.length > 0 ? (
                <div className="space-y-2">
                  {order.statusHistory.map((h, i) => (
                    <div key={h.id} className="flex items-start gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? "bg-navy" : "bg-border"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge status={h.status} />
                          <span className="text-xs text-muted">{new Date(h.createdAt).toLocaleString()}</span>
                        </div>
                        {h.note && <p className="text-muted mt-0.5 text-sm">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No status updates yet.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
      {actionForm}
    </>
  );
};
