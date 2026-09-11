'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Search,
  Eye,
  Send,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  ExternalLink,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import type { OrderRecord } from '@/lib/orders'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/order-status'
import { CARRIERS, isCarrier, trackingUrl } from '@/lib/carriers'
import {
  notifyVendor,
  recordOrderPayment,
  updateOrderNotes,
  updateOrderStatus,
  updateOrderTracking
} from './actions'

type ActionResult = { success: true; order: OrderRecord } | { success: false; error: string }

const STATUS_STYLES: Record<OrderStatus, { className: string; Icon: typeof Clock }> = {
  pending: { className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', Icon: AlertCircle },
  paid: { className: 'bg-green-500/10 text-green-600 border-green-500/20', Icon: CheckCircle2 },
  processing: { className: 'bg-[#F59E0B]/10 text-[#B45309] border-[#F59E0B]/20', Icon: Clock },
  fulfilled: { className: 'bg-[#0A192F]/10 text-[#0A192F] border-[#0A192F]/20', Icon: Truck },
  cancelled: { className: 'bg-red-500/10 text-red-600 border-red-500/20', Icon: XCircle },
}

const money = (value: number) => `$${Number(value || 0).toFixed(2)}`
const itemCount = (order: OrderRecord) => order.order_items.reduce((sum, item) => sum + item.quantity, 0)

function StatusBadge({ status }: { status: OrderStatus }) {
  const { className, Icon } = STATUS_STYLES[status] ?? STATUS_STYLES.pending
  return (
    <Badge variant="outline" className={`text-[10px] uppercase font-mono tracking-wider ${className}`}>
      <Icon className="w-3 h-3 mr-1" /> {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export function OrdersClient({ initialOrders, loadError }: { initialOrders: OrderRecord[]; loadError: string | null }) {
  const [orders, setOrders] = useState(initialOrders)
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const [trackingDraft, setTrackingDraft] = useState('')
  const [carrierDraft, setCarrierDraft] = useState<string>('USPS')
  const [paymentDraft, setPaymentDraft] = useState('')
  const [notesDraft, setNotesDraft] = useState('')

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null

  const runAction = async (key: string, action: () => Promise<ActionResult>, successMessage: string) => {
    setBusyAction(key)
    try {
      const result = await action()
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setOrders((prev) => prev.map((o) => (o.id === result.order.id ? result.order : o)))
      toast.success(successMessage)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setBusyAction(null)
    }
  }

  const openOrderDetail = (order: OrderRecord) => {
    setSelectedId(order.id)
    setTrackingDraft(order.tracking_number ?? '')
    setCarrierDraft(isCarrier(order.carrier) ? order.carrier : 'USPS')
    setPaymentDraft(order.payment_reference ?? '')
    setNotesDraft(order.admin_notes ?? '')
  }

  const counts = ORDER_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: orders.filter((o) => o.status === status).length }),
    { all: orders.length } as Record<'all' | OrderStatus, number>
  )

  const query = searchQuery.trim().toLowerCase()
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const matchesSearch = !query ||
      String(o.order_number).includes(query) ||
      o.customer_email?.toLowerCase().includes(query) ||
      o.customer_name?.toLowerCase().includes(query) ||
      o.shipping_address?.city?.toLowerCase().includes(query)
    return matchesStatus && matchesSearch
  })

  const canSendToVendor = (order: OrderRecord) => order.status === 'paid' || order.status === 'processing'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wider text-[#0A192F]">
          ORDERS & FULFILLMENT
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Confirm PayPal payments, send purchase orders to the vendor, and add tracking. New orders arrive as Awaiting Payment.
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <strong className="block mb-1">Orders could not be loaded.</strong>
          {loadError}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E5E5] pb-3">
        {(['all', ...ORDER_STATUSES] as const).map((key) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              statusFilter === key
                ? 'bg-[#0A192F] text-[#FFFFFF] shadow-sm'
                : 'bg-[#FFFFFF] text-[#666666] border border-[#E5E5E5] hover:text-[#0A192F]'
            }`}
          >
            <span>{key === 'all' ? 'All Orders' : ORDER_STATUS_LABELS[key]}</span>
            <span className={`px-1.5 rounded-full text-[10px] font-mono ${
              statusFilter === key ? 'bg-white/20 text-white' : 'bg-[#F3F3F3] text-[#666666]'
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
          <Input
            placeholder="Search by order number, name, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs border-[#E5E5E5] bg-[#FAFAFA]"
          />
        </div>
        <span className="text-xs text-[#666666] font-mono whitespace-nowrap">
          Showing {filteredOrders.length} of {orders.length} orders
        </span>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-[#666666] text-xs">Order</TableHead>
              <TableHead className="text-[#666666] text-xs">Customer</TableHead>
              <TableHead className="text-[#666666] text-xs">Ship To</TableHead>
              <TableHead className="text-[#666666] text-xs">Items</TableHead>
              <TableHead className="text-[#666666] text-xs">Total</TableHead>
              <TableHead className="text-[#666666] text-xs">Status</TableHead>
              <TableHead className="text-[#666666] text-xs">Fulfillment</TableHead>
              <TableHead className="text-right text-[#666666] text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center text-[#666666] text-xs">
                  <Package className="w-8 h-8 mx-auto mb-2 text-[#999999]" strokeWidth={1.5} />
                  {orders.length === 0 ? 'No orders yet. Storefront checkouts will appear here automatically.' : 'No orders match these filters.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const link = trackingUrl(order.carrier, order.tracking_number)
                return (
                  <TableRow key={order.id} className="border-b border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
                    <TableCell className="font-medium text-[#0A192F]">
                      <span className="font-bold text-sm block">#{order.order_number}</span>
                      <span className="text-[10px] text-[#666666] font-mono">{new Date(order.created_at).toLocaleDateString()}</span>
                    </TableCell>

                    <TableCell className="text-[#0A192F] text-xs">
                      <span className="font-medium block">{order.customer_name || '—'}</span>
                      <span className="text-[10px] text-[#666666]">{order.customer_email}</span>
                    </TableCell>

                    <TableCell className="text-[#666666] text-xs">
                      {order.shipping_address ? `${order.shipping_address.city}, ${order.shipping_address.state}` : '—'}
                    </TableCell>

                    <TableCell className="text-[#666666] text-xs font-mono">
                      {itemCount(order)} {itemCount(order) === 1 ? 'item' : 'items'}
                    </TableCell>

                    <TableCell className="font-bold text-[#0A192F] font-mono text-sm">
                      {money(order.total_amount)}
                    </TableCell>

                    <TableCell>
                      <select
                        aria-label={`Status for order ${order.order_number}`}
                        value={order.status}
                        disabled={busyAction === `status-${order.id}`}
                        onChange={(e) => {
                          const status = e.target.value as OrderStatus
                          runAction(`status-${order.id}`, () => updateOrderStatus(order.id, status), `Order #${order.order_number} marked ${ORDER_STATUS_LABELS[status]}`)
                        }}
                        className="h-7 w-36 rounded-md border border-[#E5E5E5] bg-white px-2 text-xs text-[#0A192F] disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>
                        ))}
                      </select>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="space-y-1">
                        {order.tracking_number ? (
                          link ? (
                            <a href={link} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-[#0A192F] underline flex items-center gap-1">
                              {order.carrier} {order.tracking_number} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="font-mono text-[10px] text-[#0A192F]">{order.tracking_number}</span>
                          )
                        ) : (
                          <span className="text-[10px] text-[#999999]">No tracking yet</span>
                        )}
                        {order.vendor_notified && (
                          <span className="text-[9px] text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Sent to vendor
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-[#E5E5E5] gap-1 hover:bg-[#0A192F] hover:text-white"
                          onClick={() => openOrderDetail(order)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canSendToVendor(order) || busyAction === `vendor-${order.id}`}
                          className="h-7 text-[10px] border-[#E5E5E5] text-[#0A192F] hover:bg-[#F3F3F3]"
                          onClick={() => runAction(`vendor-${order.id}`, () => notifyVendor(order.id), `Purchase order for #${order.order_number} sent to the vendor`)}
                          title={canSendToVendor(order) ? 'Send purchase order to vendor (SMS + email)' : 'Mark the order Paid before sending it to the vendor'}
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => { if (!open) setSelectedId(null) }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF] text-[#0A192F] border-[#E5E5E5]">
          {selectedOrder && (
            <>
              <DialogHeader className="pr-8">
                <DialogTitle className="font-serif text-2xl tracking-wide flex flex-wrap items-center justify-between gap-3">
                  <span>ORDER #{selectedOrder.order_number}</span>
                  <StatusBadge status={selectedOrder.status} />
                </DialogTitle>
                <DialogDescription className="text-xs text-[#666666]">
                  Placed {new Date(selectedOrder.created_at).toLocaleString()} · {selectedOrder.payment_method === 'paypal' ? 'PayPal' : selectedOrder.payment_method} · Invoice OL-{selectedOrder.order_number}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2 text-xs">
                {/* Customer & Shipping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                  <div className="space-y-2">
                    <span className="font-bold uppercase tracking-wider text-[#0A192F] block">Customer</span>
                    <div className="space-y-1 text-[#666666]">
                      <p className="font-semibold text-[#0A192F]">{selectedOrder.customer_name || '—'}</p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#0A192F]" />
                        <a href={`mailto:${selectedOrder.customer_email}`} className="underline">{selectedOrder.customer_email}</a>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#0A192F]" />
                        <span>{selectedOrder.customer_phone || 'No phone supplied'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="font-bold uppercase tracking-wider text-[#0A192F] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Ship To
                    </span>
                    {selectedOrder.shipping_address ? (
                      <div className="space-y-0.5 text-[#666666]">
                        <p>{selectedOrder.shipping_address.line1}</p>
                        {selectedOrder.shipping_address.line2 && <p>{selectedOrder.shipping_address.line2}</p>}
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
                        <p>{selectedOrder.shipping_address.country}</p>
                      </div>
                    ) : (
                      <p className="italic text-[#666666]">No address</p>
                    )}
                  </div>
                </div>

                {/* Payment & Fulfillment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-[#E5E5E5] space-y-2.5">
                    <span className="font-bold uppercase tracking-wider text-[#0A192F] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Payment
                    </span>
                    <p className="text-[#666666]">
                      {selectedOrder.paid_at
                        ? `Paid ${new Date(selectedOrder.paid_at).toLocaleString()}`
                        : 'Not yet paid. Check PayPal for invoice OL-' + selectedOrder.order_number + '.'}
                    </p>
                    <label className="block text-[10px] uppercase tracking-wider text-[#666666]" htmlFor="payment-reference">
                      PayPal transaction ID
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="payment-reference"
                        value={paymentDraft}
                        onChange={(e) => setPaymentDraft(e.target.value)}
                        placeholder="e.g. 8XY12345AB6789012"
                        className="h-8 text-xs font-mono border-[#E5E5E5]"
                      />
                      <Button
                        size="sm"
                        disabled={busyAction === 'payment'}
                        className="h-8 text-xs bg-[#0A192F] text-white hover:bg-black shrink-0"
                        onClick={() => runAction('payment', () => recordOrderPayment(selectedOrder.id, paymentDraft), selectedOrder.status === 'pending' ? `Order #${selectedOrder.order_number} marked Paid` : 'Payment reference saved')}
                      >
                        {selectedOrder.status === 'pending' ? 'Mark Paid' : 'Save'}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-[#E5E5E5] space-y-2.5">
                    <span className="font-bold uppercase tracking-wider text-[#0A192F] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> Fulfillment
                    </span>
                    <div className="flex gap-2">
                      <select
                        aria-label="Carrier"
                        value={carrierDraft}
                        onChange={(e) => setCarrierDraft(e.target.value)}
                        className="h-8 rounded-md border border-[#E5E5E5] bg-white px-2 text-xs"
                      >
                        {CARRIERS.map((carrier) => <option key={carrier} value={carrier}>{carrier}</option>)}
                      </select>
                      <Input
                        aria-label="Tracking number"
                        value={trackingDraft}
                        onChange={(e) => setTrackingDraft(e.target.value)}
                        placeholder="Tracking number"
                        className="h-8 text-xs font-mono border-[#E5E5E5]"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyAction === 'tracking'}
                        className="h-8 text-xs border-[#E5E5E5] shrink-0"
                        onClick={() => runAction('tracking', () => updateOrderTracking(selectedOrder.id, trackingDraft, carrierDraft), 'Tracking saved')}
                      >
                        Save
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className={selectedOrder.vendor_notified ? 'text-green-600' : 'text-[#666666]'}>
                        {selectedOrder.vendor_notified && selectedOrder.vendor_notified_at
                          ? `Sent to vendor ${new Date(selectedOrder.vendor_notified_at).toLocaleString()}`
                          : 'Not sent to vendor'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!canSendToVendor(selectedOrder) || busyAction === 'vendor'}
                        className="h-7 text-[11px] border-[#E5E5E5] gap-1"
                        onClick={() => runAction('vendor', () => notifyVendor(selectedOrder.id), 'Purchase order sent to the vendor')}
                      >
                        <Send className="w-3 h-3" /> {selectedOrder.vendor_notified ? 'Resend PO' : 'Send PO'}
                      </Button>
                    </div>
                    <p className="text-[10px] text-[#999999]">
                      Setting the status to Shipped emails the customer their tracking details.
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[#0A192F] block">
                    Items ({itemCount(selectedOrder)})
                  </span>
                  <div className="rounded border border-[#E5E5E5] overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-[#F3F3F3] border-b border-[#E5E5E5]">
                        <tr>
                          <th className="p-2 text-left text-[#666666]">Garment</th>
                          <th className="p-2 text-left text-[#666666]">SKU</th>
                          <th className="p-2 text-left text-[#666666]">Size / Color</th>
                          <th className="p-2 text-center text-[#666666]">Qty</th>
                          <th className="p-2 text-right text-[#666666]">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.order_items.map((item) => (
                          <tr key={item.id} className="border-b border-[#E5E5E5] last:border-none">
                            <td className="p-2 font-semibold text-[#0A192F]">{item.product_title}</td>
                            <td className="p-2 font-mono text-[#666666]">{item.sku}</td>
                            <td className="p-2 text-[#666666]">{item.size || 'OS'} / {item.color || 'Standard'}</td>
                            <td className="p-2 text-center font-mono">{item.quantity}</td>
                            <td className="p-2 text-right font-mono font-semibold text-[#0A192F]">{money(item.unit_price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold uppercase tracking-wider text-[#0A192F] flex items-center gap-1.5" htmlFor="admin-notes">
                      <FileText className="w-3.5 h-3.5" /> Internal Notes
                    </label>
                    <textarea
                      id="admin-notes"
                      rows={3}
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Only visible to admins"
                      className="w-full rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-2.5 text-xs focus:outline-none focus:border-[#0A192F]"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyAction === 'notes'}
                      className="h-7 text-xs border-[#E5E5E5]"
                      onClick={() => runAction('notes', () => updateOrderNotes(selectedOrder.id, notesDraft), 'Notes saved')}
                    >
                      Save Notes
                    </Button>
                  </div>

                  <div className="space-y-1.5 p-3 rounded bg-[#FAFAFA] border border-[#E5E5E5] h-fit">
                    <div className="flex justify-between text-[#666666]">
                      <span>Subtotal</span>
                      <span className="font-mono">{money(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount_applied > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({selectedOrder.discount_code})</span>
                        <span className="font-mono">-{money(selectedOrder.discount_applied)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#666666]">
                      <span>Shipping</span>
                      <span className="font-mono">{selectedOrder.shipping_amount === 0 ? 'FREE' : money(selectedOrder.shipping_amount)}</span>
                    </div>
                    <div className="flex justify-between text-[#666666]">
                      <span>Tax</span>
                      <span className="font-mono">{money(selectedOrder.tax_amount)}</span>
                    </div>
                    <div className="border-t border-[#E5E5E5] pt-1.5 flex justify-between font-bold text-sm text-[#0A192F]">
                      <span>Total</span>
                      <span className="font-mono">{money(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
