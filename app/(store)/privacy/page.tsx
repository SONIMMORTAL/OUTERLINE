import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for outerlineusa.com, dba Ensink LLC.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen pt-28 sm:pt-32 md:pt-36 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666]">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="space-y-4 border-b border-[#E5E5E5] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0A192F] text-[10px] uppercase tracking-[0.25em] font-mono font-semibold">
            LEGAL DOCUMENT
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A192F]">
            PRIVACY POLICY
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#666666]">
            Effective Date: 09/06/2026 • outerlineusa.com
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-[#333333] space-y-8 leading-relaxed text-sm">
          <p className="font-medium text-base text-[#0A192F]">
            This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from <strong>outerlineusa.com</strong> (the &ldquo;Site&rdquo;).
          </p>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              1. Information We Collect
            </h2>
            <p>
              When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies installed on your device.
            </p>
            <p>
              Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site. We refer to this automatically-collected information as &ldquo;Device Information.&rdquo;
            </p>
            <p>
              We collect Device Information using the following technologies:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>&ldquo;Cookies&rdquo;</strong> are data files that are placed on your device or computer and often include an anonymous unique identifier.
              </li>
              <li>
                <strong>&ldquo;Log files&rdquo;</strong> track actions occurring on the Site, and collect data including your IP address, browser type, Internet service provider, referring/exit pages, and date/time stamps.
              </li>
              <li>
                <strong>&ldquo;Web beacons,&rdquo; &ldquo;tags,&rdquo; and &ldquo;pixels&rdquo;</strong> are electronic files used to record information about how you browse the Site.
              </li>
            </ul>
            <p>
              Additionally, when you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information (including credit card numbers, PayPal, and other payment details), email address, and phone number. We refer to this information as &ldquo;Order Information.&rdquo;
            </p>
            <p>
              When we talk about &ldquo;Personal Information&rdquo; in this Privacy Policy, we are talking both about Device Information and Order Information.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              2. How We Use Your Personal Information
            </h2>
            <p>
              We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Communicate with you;</li>
              <li>Screen our orders for potential risk or fraud; and</li>
              <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
            </ul>
            <p>
              We use the Device Information that we collect to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our Site (for example, by generating analytics about how our customers browse and interact with the Site, and to assess the success of our marketing and advertising campaigns).
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              3. Sharing Your Personal Information
            </h2>
            <p>
              We share your Personal Information with third parties to help us use your Personal Information, as described above. For example:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>We use Stripe and PayPal to process payments securely.</li>
              <li>We use Mailchimp to send the marketing emails and text messages you sign up for.</li>
              <li>We use analytics services to help us understand how our customers use the Site.</li>
            </ul>
            <p>
              <strong>Text messaging.</strong> If you opt in to our text messages, we collect your mobile number and a record of your consent. Mobile numbers and SMS opt-in consent are never sold, rented, or shared with third parties or affiliates for their own marketing or promotional purposes. We share them only with the service providers that deliver messages on our behalf. Reply STOP to any message to opt out.
            </p>
            <p>
              Finally, we may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant, or other lawful request for information we receive, or to otherwise protect our rights.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              4. Behavioral Advertising
            </h2>
            <p>
              As described above, we use your Personal Information to provide you with targeted advertisements or marketing communications we believe may be of interest to you.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              5. Your Rights
            </h2>
            <p>
              If you are a resident of certain jurisdictions (such as the European Economic Area or California), you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              6. Data Retention
            </h2>
            <p>
              When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              7. Changes
            </h2>
            <p>
              We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <h2 className="font-serif text-xl font-bold text-[#0A192F] uppercase tracking-wide">
              8. Contact Us
            </h2>
            <p>
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at{' '}
              <a href="mailto:Support@outerlineusa.com" className="font-mono text-[#0A192F] font-semibold underline">
                Support@outerlineusa.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-[#E5E5E5] flex items-center justify-between text-xs font-mono">
          <Link href="/terms" className="text-[#666666] hover:text-[#0A192F] transition-colors">
            &larr; View Terms of Use
          </Link>
          <Link href="/policies" className="text-[#666666] hover:text-[#0A192F] transition-colors">
            All Store Policies &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
