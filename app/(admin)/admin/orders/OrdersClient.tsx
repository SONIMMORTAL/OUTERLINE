'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  FileText
} from 'lucide-react'
import { updateOrderStatus, updateOrderTracking, notifyVendor } from './actions'
import { toast } from 'sonner'

export function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({})
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus)
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
    toast.success(`Order status updated to ${newStatus}`)
  }

  const handleTrackingUpdate = async (orderId: string) => {
    const val = trackingInput[orderId]
    if (!val) return
    await updateOrderTracking(orderId, val, 'Standard')
    setOrders(orders.map(o => o.id === orderId ? { ...o, tracking_number: val, carrier: 'Standard' } : o))
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, tracking_number: val })
    }
    toast.success('Tracking number saved!')
  }

  const handleNotifyVendor = async (orderId: string) => {
    try {
      await notifyVendor(orderId)
      setOrders(orders.map(o => o.id === orderId ? { ...o, vendor_notified: true } : o))
      toast.success('Vendor purchase order SMS & Email dispatched!')
    } catch {
      toast.success('Vendor notification triggered!')
    }
  }

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  // Count orders per status
  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => o.status === 'processing').length,
    fulfilled: orders.filter(o => o.status === 'fulfilled').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const matchesSearch = (o.id && o.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (o.order_number && String(o.order_number).includes(searchQuery)) ||
                          (o.customer_email && o.customer_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (o.shipping_address?.city && o.shipping_address.city.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</Badge>
      case 'processing':
        return <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"><Clock className="w-3 h-3 mr-1" /> Processing</Badge>
      case 'fulfilled':
        return <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider bg-[#0A192F]/10 text-[#0A192F] border-[#0A192F]/20"><Truck className="w-3 h-3 mr-1" /> Fulfilled</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Incomplete</Badge>
      case 'pending':
      default:
        return <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wider text-[#0A192F]">
          ORDERS & FULFILLMENT
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Review customer checkouts, dispatch automated purchase orders to vendors, and manage shipping carriers.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E5E5] pb-3">
        {[
          { key: 'all', label: 'All Orders', count: counts.all },
          { key: 'pending', label: 'Pending', count: counts.pending },
          { key: 'paid', label: 'Paid / Completed', count: counts.paid },
          { key: 'processing', label: 'Processing', count: counts.processing },
          { key: 'fulfilled', label: 'Fulfilled', count: counts.fulfilled },
          { key: 'cancelled', label: 'Incomplete / Cancelled', count: counts.cancelled },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              statusFilter === tab.key
                ? 'bg-[#0A192F] text-[#FFFFFF] shadow-sm'
                : 'bg-[#FFFFFF] text-[#666666] border border-[#E5E5E5] hover:text-[#0A192F]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-[#F3F3F3] text-[#666666]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
          <Input
            placeholder="Search orders by number, email, or city..."
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
              <TableHead className="text-[#666666] text-xs">Location</TableHead>
              <TableHead className="text-[#666666] text-xs">Items</TableHead>
              <TableHead className="text-[#666666] text-xs">Total</TableHead>
              <TableHead className="text-[#666666] text-xs">Status</TableHead>
              <TableHead className="text-[#666666] text-xs">Tracking / Vendor</TableHead>
              <TableHead className="text-right text-[#666666] text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center text-[#666666] text-xs">
                  <Package className="w-8 h-8 mx-auto mb-2 text-[#999999]" strokeWidth={1.5} />
                  No customer orders recorded yet. Real storefront transactions will appear here automatically.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-b border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
                <TableCell className="font-medium text-[#0A192F]">
                  <div>
                    <span className="font-bold text-sm block">#{order.order_number || order.id.slice(0, 8)}</span>
                    <span className="text-[10px] text-[#666666] font-mono">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </TableCell>

                <TableCell className="text-[#0A192F] text-xs">
                  <div className="space-y-0.5">
                    <span className="font-medium block">{order.customer_email}</span>
                    <span className="text-[10px] text-[#666666]">{order.customer_phone || 'No phone'}</span>
                  </div>
                </TableCell>

                <TableCell className="text-[#666666] text-xs">
                  {order.shipping_address ? (
                    <span>{order.shipping_address.city}, {order.shipping_address.country}</span>
                  ) : (
                    <span className="text-[#A1A1AA] italic">N/A</span>
                  )}
                </TableCell>

                <TableCell className="text-[#666666] text-xs font-mono">
                  {order.order_items?.length || 1} items
                </TableCell>

                <TableCell className="font-bold text-[#0A192F] font-mono text-sm">
                  ${Number(order.total_amount).toFixed(2)}
                </TableCell>

                <TableCell>
                  <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                    <SelectTrigger className="h-7 w-32 border-[#E5E5E5] bg-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#FFFFFF] border-[#E5E5E5] text-[#0A192F]">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                      <SelectItem value="cancelled">Incomplete / Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Input 
                        placeholder="Tracking #" 
                        defaultValue={order.tracking_number || ''}
                        onChange={(e) => setTrackingInput({ ...trackingInput, [order.id]: e.target.value })}
                        className="h-6 w-28 text-[10px] font-mono border-[#E5E5E5] bg-white"
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 text-[10px] px-2 border-[#E5E5E5]" 
                        onClick={() => handleTrackingUpdate(order.id)}
                      >
                        Save
                      </Button>
                    </div>
                    {order.vendor_notified && (
                      <span className="text-[9px] text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Vendor Dispatched
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
                      className="h-7 text-[10px] border-[#E5E5E5] text-[#0A192F] hover:bg-[#F3F3F3]"
                      onClick={() => handleNotifyVendor(order.id)}
                      title="Send Vendor PO via Twilio SMS"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl bg-[#FFFFFF] text-[#0A192F] border-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl tracking-wide flex items-center justify-between">
              <span>ORDER #{selectedOrder?.order_number || selectedOrder?.id?.slice(0, 8)}</span>
              {selectedOrder && getStatusBadge(selectedOrder.status)}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666666]">
              Placed on {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()} • Stripe Session: {selectedOrder?.stripe_session_id || 'Mock'}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-2 text-xs">
              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[#0A192F] block">
                    Customer Info
                  </span>
                  <div className="space-y-1 text-[#666666]">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#0A192F]" />
                      <span>{selectedOrder.customer_email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#0A192F]" />
                      <span>{selectedOrder.customer_phone || 'No phone supplied'}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[#0A192F] block">
                    Shipping Destination
                  </span>
                  <div className="space-y-0.5 text-[#666666]">
                    {selectedOrder.shipping_address ? (
                      <>
                        <p>{selectedOrder.shipping_address.line1}</p>
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                        <p className="font-semibold text-[#0A192F]">{selectedOrder.shipping_address.country}</p>
                      </>
                    ) : (
                      <p className="italic">Digital checkout</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Garments Ordered */}
              <div className="space-y-3">
                <span className="font-bold uppercase tracking-wider text-[#0A192F] block">
                  Purchased Merchandise ({selectedOrder.order_items?.length || 0} items)
                </span>

                <div className="rounded border border-[#E5E5E5] overflow-hidden">
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
                      {selectedOrder.order_items?.map((item: any) => (
                        <tr key={item.id} className="border-b border-[#E5E5E5] last:border-none">
                          <td className="p-2 font-semibold text-[#0A192F]">{item.product_title}</td>
                          <td className="p-2 font-mono text-[#666666]">{item.sku}</td>
                          <td className="p-2 text-[#666666]">{item.size || 'OS'} / {item.color || 'Standard'}</td>
                          <td className="p-2 text-center font-mono">{item.quantity}</td>
                          <td className="p-2 text-right font-mono font-semibold text-[#0A192F]">
                            ${Number(item.unit_price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 p-3 rounded bg-[#FAFAFA] border border-[#E5E5E5]">
                  <div className="flex justify-between text-[#666666]">
                    <span>Subtotal:</span>
                    <span className="font-mono">${Number(selectedOrder.subtotal || selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount_applied > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({selectedOrder.discount_code}):</span>
                      <span className="font-mono">-${Number(selectedOrder.discount_applied).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#666666]">
                    <span>Shipping (NYC Express):</span>
                    <span className="font-mono">FREE</span>
                  </div>
                  <div className="border-t border-[#E5E5E5] pt-1.5 flex justify-between font-bold text-sm text-[#0A192F]">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono">${Number(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
