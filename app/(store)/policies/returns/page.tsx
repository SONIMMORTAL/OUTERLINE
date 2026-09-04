import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-white min-h-screen pt-28 sm:pt-32 md:pt-36 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666] mb-12">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/policies" className="hover:text-[#0A192F] transition-colors">Policies</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Returns & Exchanges</span>
        </nav>

        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#0A192F] mb-12">
          Returns & Exchanges
        </h1>

        <div className="space-y-6 text-[#333333] leading-relaxed">
          <p>
            All sales are final.
          </p>
          <p>
            Returns or exchanges are accepted only for defective items or items shipped in error.
          </p>
          <p>
            Requests must be submitted to <a href="mailto:support@outerline.com" className="font-mono hover:underline text-[#0A192F]">Support@outerline.com</a> within 7 days of confirmed delivery. Our customer service team reviews all inquiries within 48–72 hours.
          </p>
          <p>
            Approved items must be unworn, unwashed, and returned in original condition and packaging.
          </p>
          <p>
            Items delivered as described are not eligible for return due to sizing, fit, or preference.
          </p>
          <p>
            Shipping costs are non-refundable.
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
