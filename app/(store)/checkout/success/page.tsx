import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const supabase = await createClient()

  let order: any = null

  if (session_id) {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(*))')
      .eq('stripe_session_id', session_id)
      .single()
    
    order = data
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-24 bg-[#FFFFFF]">
      <div className="max-w-xl w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl p-8 md:p-12 flex flex-col items-center text-center space-y-6">
        <CheckCircle className="w-16 h-16 text-[#0A192F]" />
        
        <h1 className="font-serif text-3xl md:text-4xl text-[#0A192F]">
          ORDER CONFIRMED
        </h1>
        
        <p className="text-[#666666]">
          Thank you for your purchase. We've received your order and will begin processing it shortly.
        </p>

        {order && (
          <div className="w-full bg-[#F3F3F3] border border-[#E5E5E5] rounded-lg p-6 text-left space-y-4 my-6">
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-4">
              <span className="text-[#666666] text-sm">Order Number</span>
              <span className="text-[#0A192F] font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-4">
              <span className="text-[#666666] text-sm">Total Paid</span>
              <span className="text-[#0A192F]">${(order.total_amount || 0).toFixed(2)}</span>
            </div>

            <div className="pt-2">
              <h3 className="text-[#666666] text-sm mb-2">Shipping to</h3>
              <p className="text-[#0A192F] text-sm whitespace-pre-wrap">
                {order.shipping_address ? JSON.stringify(order.shipping_address, null, 2) : 'Address not found'}
              </p>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="w-full py-4 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-widest text-sm hover:bg-[#000000] transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  )
}
