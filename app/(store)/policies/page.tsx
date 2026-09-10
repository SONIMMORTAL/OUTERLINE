import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function PoliciesPage() {
  const policies = [
    { name: 'Terms of Use', href: '/terms', description: 'Terms of service, purchases, SMS program, and intellectual property for outerlineusa.com, dba Ensink LLC.' },
    { name: 'Privacy Policy', href: '/privacy', description: 'Data collection, cookies, Stripe & PayPal processing, and customer privacy rights.' },
    { name: 'Customer Service', href: '/policies/customer-service', description: '24–48 hour response time and official Support@outerlineusa.com communications.' },
    { name: 'Shipping Policy', href: '/policies/shipping', description: 'Free shipping on orders over $100, carriers (USPS, UPS, FedEx, DHL), and 3–7 day delivery.' },
    { name: 'Delivery Policy', href: '/policies/delivery', description: 'Carrier tracking scans, delivery confirmation, and international customs policies.' },
    { name: 'Returns & Exchanges', href: '/policies/returns', description: 'All sales final. Defective or error items within 10 days of confirmed delivery.' },
  ]

  return (
    <div className="bg-white min-h-screen pt-28 sm:pt-32 md:pt-36 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666] mb-12">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Policies</span>
        </nav>

        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#0A192F] mb-12">
          Store Policies
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map((policy) => (
            <Link key={policy.name} href={policy.href} className="block group">
              <div className="border border-[#E5E5E5] p-8 h-full transition-colors hover:border-[#0A192F]">
                <h2 className="font-serif text-xl tracking-tight text-[#0A192F] mb-3 group-hover:underline">
                  {policy.name}
                </h2>
                <p className="text-[#333333] leading-relaxed">
                  {policy.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
