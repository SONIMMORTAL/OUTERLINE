'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  PlusCircle,
  ChevronDown,
  ChevronRight,
  Pencil,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react'
import {
  syncWithStripe,
  updateProductStatus,
  updateVariantStock,
  deleteProduct
} from './actions'
import { ProductFormDialog, STOREFRONT_COLLECTIONS } from './ProductForm'
import { toast } from 'sonner'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function ProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [collectionFilter, setCollectionFilter] = useState('all')
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [stockInput, setStockInput] = useState<Record<string, string>>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  // A fresh key resets the form to the product being edited (or to a blank form).
  const openForm = (product: any | null) => {
    setEditingProduct(product)
    setFormKey((key) => key + 1)
    setIsFormOpen(true)
  }

  const handleSaved = (saved: any) => {
    setProducts((current) =>
      current.some((p) => p.id === saved.id)
        ? current.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...current]
    )
  }

  const handleSyncWithStripe = async () => {
    setIsSyncing(true)
    try {
      const result = await syncWithStripe()
      if (!result.success) {
        toast.error(result.error, { duration: 10000 })
        return
      }
      const { counts, createdInStripe, notes } = result.summary
      toast.success(
        `Stripe sync done: ${counts.linked} matched, ${counts.imported} added from Stripe, ${counts.updated} updated, ${createdInStripe} added to Stripe.`,
        { description: notes.length > 0 ? notes.join(' · ') : undefined, duration: 12000 }
      )
      router.refresh()
    } catch {
      toast.error('Stripe sync failed. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleToggleStatus = async (id: string, currentActive: boolean, currentFeatured: boolean, type: 'active' | 'featured') => {
    const newActive = type === 'active' ? !currentActive : currentActive
    const newFeatured = type === 'featured' ? !currentFeatured : currentFeatured

    const result = await updateProductStatus(id, newActive, newFeatured)
    if (!result.success) {
      toast.error(result.error || 'Could not update the product.')
      return
    }
    setProducts(products.map(p => p.id === id ? { ...p, is_drop_active: newActive, is_featured: newFeatured } : p))
    toast.success(`Updated ${type === 'active' ? 'drop status' : 'featured status'}`)
    if (result.warning) toast.warning(result.warning, { duration: 10000 })
  }

  const handleStockUpdate = async (variantId: string, productId: string) => {
    const val = parseInt(stockInput[variantId])
    if (isNaN(val)) return
    const result = await updateVariantStock(variantId, val)
    if (!result.success) {
      toast.error(result.error || 'Could not update stock.')
      return
    }

    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          product_variants: (p.product_variants || []).map((v: any) =>
            v.id === variantId ? { ...v, inventory_quantity: val } : v
          )
        }
      }
      return p
    }))
    toast.success('Stock quantity updated')
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    const result = await deleteProduct(id)
    if (!result.success) {
      toast.error(result.error || `Could not delete "${title}".`)
      return
    }
    setProducts(products.filter(p => p.id !== id))
    toast.success(`Removed "${title}"`)
    if (result.warning) toast.warning(result.warning, { duration: 10000 })
  }

  // Filter products by search and collection
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.collection && p.collection.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCollection = collectionFilter === 'all' ||
                             (p.collection_slug === collectionFilter || p.collection?.toLowerCase() === collectionFilter.toLowerCase())
    return matchesSearch && matchesCollection
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wider text-[#0A192F]">
            MERCHANDISE & CATALOG
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Upload new apparel, edit names, photos, and pricing, and manage live inventory stock. Changes stay in sync with Stripe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSyncWithStripe}
            disabled={isSyncing}
            className="border-[#E5E5E5] text-[#0A192F] gap-2 font-serif tracking-widest text-xs uppercase px-4 py-2.5"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing…' : 'Sync with Stripe'}</span>
          </Button>
          <Button
            onClick={() => openForm(null)}
            className="bg-[#0A192F] text-[#FFFFFF] hover:bg-[#000000] gap-2 font-serif tracking-widest text-xs uppercase px-5 py-2.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Merchandise</span>
          </Button>
        </div>

        <ProductFormDialog
          key={formKey}
          product={editingProduct}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSaved={handleSaved}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
          <Input
            placeholder="Search merchandise by title or collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs border-[#E5E5E5] bg-[#FAFAFA]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-[#666666] whitespace-nowrap">Filter:</span>
          {['all', ...STOREFRONT_COLLECTIONS].map((coll) => (
            <button
              key={coll}
              onClick={() => setCollectionFilter(coll)}
              className={`px-3 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${
                collectionFilter === coll
                  ? 'bg-[#0A192F] text-[#FFFFFF] font-medium'
                  : 'bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5] hover:text-[#0A192F]'
              }`}
            >
              {coll === 'all' ? 'All Collections' : coll}
            </button>
          ))}
        </div>
      </div>

      {/* Merchandise Table */}
      <div className="rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-[#666666] text-xs">Garment</TableHead>
              <TableHead className="text-[#666666] text-xs">Collection</TableHead>
              <TableHead className="text-[#666666] text-xs">Category</TableHead>
              <TableHead className="text-[#666666] text-xs">Price</TableHead>
              <TableHead className="text-[#666666] text-xs">Variants</TableHead>
              <TableHead className="text-[#666666] text-xs">Total Stock</TableHead>
              <TableHead className="text-[#666666] text-xs">Status</TableHead>
              <TableHead className="text-right text-[#666666] text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const isExpanded = expandedRows[product.id]
              const totalStock = product.product_variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0
              const mainImg = product.images?.[0] || '/OUTERLINE LOGO.png'

              return (
                <React.Fragment key={product.id}>
                  <TableRow className={`border-b border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors ${isExpanded ? 'bg-[#FAFAFA]' : ''}`}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-[#666666] hover:text-[#0A192F]"
                        onClick={() => toggleExpand(product.id)}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>

                    <TableCell className="font-medium text-[#0A192F]">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded border border-[#E5E5E5] bg-[#FAFAFA] overflow-hidden shrink-0">
                          <img src={mainImg} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-semibold block text-sm">{product.title}</span>
                          <span className="text-[10px] text-[#666666] font-mono">/{product.slug}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-[#F3F3F3] text-[#0A192F] border-[#E5E5E5]">
                        {product.collection || 'Brooklyn Heritage'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-[#666666] text-xs capitalize">
                      {product.category}
                    </TableCell>

                    <TableCell className="text-[#0A192F] font-mono text-xs font-semibold">
                      ${Number(product.price).toFixed(2)}
                      {product.compare_at_price && (
                        <span className="text-[#666666] line-through text-[10px] ml-1.5 font-normal">
                          ${Number(product.compare_at_price).toFixed(2)}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-[#666666] font-mono text-xs">
                      {product.product_variants?.length || 0} variants
                    </TableCell>

                    <TableCell>
                      <span className={`font-mono text-xs font-semibold ${totalStock < 10 ? 'text-[#F59E0B]' : 'text-[#0A192F]'}`}>
                        {totalStock} units
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase tracking-widest ${
                            product.is_drop_active || product.active
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-[#E5E5E5] text-[#666666]'
                          }`}
                        >
                          {product.is_drop_active || product.active ? 'Active' : 'Draft'}
                        </Badge>
                        {(product.is_featured || product.featured) && (
                          <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        {UUID_PATTERN.test(product.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 border-[#E5E5E5] text-[#0A192F] hover:bg-[#0A192F] hover:text-white"
                            onClick={() => openForm(product)}
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] border-[#E5E5E5] text-[#666666] hover:text-[#0A192F]"
                          onClick={() => handleToggleStatus(
                            product.id,
                            product.is_drop_active ?? product.active ?? true,
                            product.is_featured ?? product.featured ?? false,
                            'active'
                          )}
                        >
                          {product.is_drop_active || product.active ? 'Hide' : 'Publish'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] border-[#E5E5E5] text-[#666666] hover:text-[#0A192F]"
                          onClick={() => handleToggleStatus(
                            product.id,
                            product.is_drop_active ?? product.active ?? true,
                            product.is_featured ?? product.featured ?? false,
                            'featured'
                          )}
                        >
                          {product.is_featured || product.featured ? 'Unfeature' : 'Feature'}
                        </Button>

                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          className="p-1.5 text-[#666666] hover:text-red-600 transition-colors"
                          title="Delete merchandise"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Variants Accordion */}
                  {isExpanded && (
                    <TableRow className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                      <TableCell colSpan={9} className="p-4">
                        <div className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-[#E5E5E5] pb-2">
                            <span className="font-bold uppercase tracking-widest text-[#0A192F]">
                              Inventory Variants for {product.title}
                            </span>
                            <span className="text-[#666666]">
                              Edit individual sizes, colorways, and real-time inventory counts
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {product.product_variants && product.product_variants.length > 0 ? (
                              product.product_variants.map((variant: any) => (
                                <div key={variant.id} className="p-3 rounded border border-[#E5E5E5] bg-[#FAFAFA] flex flex-col justify-between space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-semibold text-xs text-[#0A192F] block">
                                        Size {variant.size || 'OS'} • {variant.color || 'Standard'}
                                      </span>
                                      <span className="text-[10px] text-[#666666] font-mono">
                                        SKU: {variant.sku}
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <Badge variant="outline" className="text-[9px] font-mono bg-white border-[#E5E5E5]">
                                        Stock: {variant.inventory_quantity}
                                      </Badge>
                                      {variant.is_active === false && (
                                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-[#E5E5E5] text-[#666666]">
                                          Hidden color
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-1">
                                    <Input
                                      type="number"
                                      placeholder="Stock"
                                      defaultValue={variant.inventory_quantity}
                                      onChange={(e) => setStockInput({ ...stockInput, [variant.id]: e.target.value })}
                                      className="h-7 w-20 bg-white border-[#E5E5E5] text-xs font-mono"
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs border-[#E5E5E5] hover:bg-[#0A192F] hover:text-white"
                                      onClick={() => handleStockUpdate(variant.id, product.id)}
                                    >
                                      Update
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-[#666666] col-span-3 py-2 text-center">
                                No individual variants configured. Standard single item stock.
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
