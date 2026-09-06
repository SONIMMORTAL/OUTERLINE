import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Terms of Use | Outerline NYC',
  description: 'Terms of Use for Outerline NYC operated by Ensink Inc.',
}

export default function TermsOfUsePage() {
  return (
    <div className="bg-white min-h-screen pt-28 sm:pt-32 md:pt-36 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666]">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Terms of Use</span>
        </nav>

        {/* Header */}
        <div className="space-y-4 border-b border-[#E5E5E5] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0A192F] text-[10px] uppercase tracking-[0.25em] font-mono font-semibold">
            LEGAL DOCUMENT
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A192F]">
            TERMS OF USE
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#666666]">
            Effective Date: September 6, 2026 • Ensink Inc, dba Outerline
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-[#333333] space-y-8 leading-relaxed text-sm">
          <p className="font-medium text-base text-[#0A192F]">
            Please read these Terms of Use (&ldquo;Terms&rdquo;, &ldquo;Terms of Use&rdquo;) carefully before using the Outerline website (the &ldquo;Service&rdquo;) operated by Ensink Inc (&ldquo;us&rdquo;, &ldquo;we&rdquo;, or &ldquo;our&rdquo;).
          </p>

          <p>
            Outerline is a dba under Ensink Inc.
          </p>

          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
          </p>

          <p>
            By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              Purchases
            </h2>
            <p>
              If you wish to purchase any product or service made available through the Service (&ldquo;Purchase&rdquo;), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
            </p>
            <p>
              You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct, and complete.
            </p>
            <p>
              By submitting such information, you grant us the right to provide the information to third parties for purposes of facilitating the completion of Purchases.
            </p>
            <p>
              We reserve the right to refuse or cancel your order at any time for certain reasons including but not limited to: product or service availability, errors in the description or price of the product or service, error in your order, or other reasons.
            </p>
            <p>
              We reserve the right to refuse or cancel your order if fraud or an unauthorized or illegal transaction is suspected.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              Availability, Errors, and Inaccuracies
            </h2>
            <p>
              We are constantly updating our offerings of products and services on the Service. The products or services available on our Service may be mispriced, described inaccurately, or unavailable, and we may experience delays in updating information on the Service and in our advertising on other websites.
            </p>
            <p>
              We cannot and do not guarantee the accuracy or completeness of any information, including prices, product images, specifications, availability, and services. We reserve the right to change or update information and to correct errors, inaccuracies, or omissions at any time without prior notice.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of Ensink Inc, dba Outerline and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Ensink Inc.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              Links To Other Web Sites
            </h2>
            <p>
              Our Service may contain links to third-party web sites or services that are not owned or controlled by Ensink Inc.
            </p>
            <p>
              Ensink Inc has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that Ensink Inc shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.
            </p>
            <p>
              We strongly advise you to read the terms and conditions and privacy policies of any third-party web sites or services that you visit.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              Termination
            </h2>
            <p>
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p>
              All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              Governing Law
            </h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of New York, United States, without regard to its conflict of law provisions.
            </p>
            <p>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              Changes
            </h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:Support@outerlineusa.com" className="font-mono text-[#0A192F] font-semibold underline">
                Support@outerlineusa.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-mono">
          <Link href="/privacy" className="text-[#666666] hover:text-[#0A192F] transition-colors">
            &rarr; View Privacy Policy
          </Link>
          <Link href="/policies" className="text-[#666666] hover:text-[#0A192F] transition-colors">
            All Store Policies &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
