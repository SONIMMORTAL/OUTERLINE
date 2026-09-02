import Navbar from '@/components/store/Navbar'
import CartDrawer from '@/components/store/CartDrawer'
import Footer from '@/components/store/Footer'
import DiscountModal from '@/components/store/DiscountModal'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A192F] flex flex-col selection:bg-[#0A192F] selection:text-[#FFFFFF]">
      <Navbar />
      <CartDrawer />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
      <DiscountModal />
    </div>
  )
}
