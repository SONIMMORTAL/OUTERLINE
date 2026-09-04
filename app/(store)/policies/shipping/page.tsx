import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white min-h-screen pt-28 sm:pt-32 md:pt-36 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666] mb-12">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/policies" className="hover:text-[#0A192F] transition-colors">Policies</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Shipping</span>
        </nav>

        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#0A192F] mb-12">
          Shipping
        </h1>

        <div className="space-y-6 text-[#333333] leading-relaxed">
          <p>
            Worldwide shipping via USPS, UPS, FedEx, and DHL.
          </p>
          <p>
            Standard shipping takes <strong>3–7 business days</strong> unless otherwise stated in the product listing. Free standard shipping is automatically applied to all domestic orders over $150.
          </p>
          <p>
            Shipping rates can be estimated in your cart or calculated at checkout.
          </p>
          <p>
            Tracking information is automatically sent once an order ships. If you have questions about your delivery, reach out to <a href="mailto:support@outerline.com" className="font-mono hover:underline text-[#0A192F]">Support@outerline.com</a>.
          </p>
          <p>
            Shipping addresses cannot be changed after an order is placed. Customers are responsible for entering a complete and accurate shipping address at checkout.
          </p>
          <p>
            Orders placed separately cannot be combined. Shipping charges apply to each individual order and are non-refundable.
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
