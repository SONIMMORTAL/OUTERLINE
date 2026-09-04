import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function CustomerServicePolicyPage() {
  return (
    <div className="bg-white min-h-screen pt-28 sm:pt-32 md:pt-36 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666] mb-12">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/policies" className="hover:text-[#0A192F] transition-colors">Policies</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Customer Service</span>
        </nav>

        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#0A192F] mb-12">
          Customer Service
        </h1>

        <div className="space-y-6 text-[#333333] leading-relaxed">
          <p>
            All orders are fulfilled directly with speed and precision. For all inquiries, reach out to our team at <a href="mailto:support@outerline.com" className="font-mono hover:underline text-[#0A192F] font-medium">Support@outerline.com</a>.
          </p>
          <p>
            Our customer service team responds within <strong>48–72 hours</strong>. Response times may be slightly longer during major drop launches and high-volume holiday periods.
          </p>
          <p>
            All inquiries are reviewed in the order received. Sending multiple messages regarding the same inquiry will not expedite a response.
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
