import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function DeliveryPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666] mb-12">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/policies" className="hover:text-[#0A192F] transition-colors">Policies</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Delivery</span>
        </nav>

        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#0A192F] mb-12">
          Delivery
        </h1>

        <div className="space-y-6 text-[#333333] leading-relaxed">
          <p>
            Once an order is transferred to the carrier, delivery is subject to the carrier's procedures and timelines.
          </p>
          <p>
            A carrier scan marked "Delivered" constitutes confirmation of delivery to the address provided at checkout.
          </p>
          <p>
            Claims for packages marked delivered must be filed directly with the carrier. We do not issue refunds or replacements for orders marked delivered due to claims of non-receipt.
          </p>
          <p>
            Orders returned due to incorrect or incomplete addresses are the buyer's responsibility, including reshipping costs.
          </p>
          <p>
            International customers are responsible for all duties, taxes, customs fees, and import charges assessed by their country.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-[#E5E5E5]">
          <Link href="/policies" className="text-xs uppercase tracking-widest text-[#666666] hover:text-[#0A192F] transition-colors">
            &larr; Back to all policies
          </Link>
        </div>
      </div>
    </div>
  )
}
