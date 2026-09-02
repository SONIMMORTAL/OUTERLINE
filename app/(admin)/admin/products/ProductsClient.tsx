'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  PlusCircle, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Trash2, 
  Edit3, 
  Package, 
  Sparkles, 
  Check, 
  Layers,
  Image as ImageIcon
} from 'lucide-react'
import { 
  createProduct, 
  updateProductStatus, 
  updateVariantStock,
  deleteProduct 
} from './actions'
import { toast } from 'sonner'

export function ProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [collectionFilter, setCollectionFilter] = useState('all')
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [stockInput, setStockInput] = useState<Record<string, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New Merchandise Form State
  const [newTitle, setNewTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newCategory, setNewCategory] = useState('tees')
  const [newCollection, setNewCollection] = useState('So New York')
  const [newPrice, setNewPrice] = useState('')
  const [newComparePrice, setNewComparePrice] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newEditorialStory, setNewEditorialStory] = useState('')
  const [newImages, setNewImages] = useState<string[]>(['/blk_so_ny_wht_tee/blk_so_ny_wht_tee/so_ny_wht_tee.jpg'])
  const [newImageUrlInput, setNewImageUrlInput] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(true)

  // Dynamic Variants for new product
  const [variantsList, setVariantsList] = useState<Array<{ size: string; color: string; sku: string; inventory_quantity: number }>>([
    { size: 'S', color: 'White', sku: 'SNY-WHT-S', inventory_quantity: 15 },
    { size: 'M', color: 'White', sku: 'SNY-WHT-M', inventory_quantity: 25 },
    { size: 'L', color: 'White', sku: 'SNY-WHT-L', inventory_quantity: 20 },
    { size: 'M', color: 'Black', sku: 'SNY-BLK-M', inventory_quantity: 20 },
    { size: 'L', color: 'Black', sku: 'SNY-BLK-L', inventory_quantity: 15 },
  ])

  const handleTitleChange = (val: string) => {
    setNewTitle(val)
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setNewSlug(generatedSlug)
  }

  const handleAddImage = () => {
    if (!newImageUrlInput.trim()) return
    setNewImages([...newImages, newImageUrlInput.trim()])
    setNewImageUrlInput('')
  }

  const handleRemoveImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index))
  }

  const handleAddVariantRow = () => {
    setVariantsList([
      ...variantsList,
      { size: 'XL', color: 'Black', sku: `${newSlug || 'PROD'}-XL-BLK`.toUpperCase(), inventory_quantity: 10 }
    ])
  }

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variantsList]
    updated[index] = { ...updated[index], [field]: value }
    setVariantsList(updated)
  }

  const handleRemoveVariantRow = (index: number) => {
    setVariantsList(variantsList.filter((_, i) => i !== index))
  }

  const handleCreateMerchandise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newPrice) {
      toast.error('Please enter a product title and price.')
      return
    }

    setIsSubmitting(true)
    const numericPrice = parseFloat(newPrice)
    const numericCompare = newComparePrice ? parseFloat(newComparePrice) : null

    const productPayload = {
      title: newTitle,
      slug: newSlug || newTitle.toLowerCase().replace(/\s+/g, '-'),
      category: newCategory,
      collection: newCollection,
      price: numericPrice,
      compare_at_price: numericCompare,
      description: newDescription || 'Crafted with premium materials and signature NYC streetwear tailoring.',
      editorial_story: newEditorialStory || 'Forged in Brooklyn. Defined & Unconfined.',
      images: newImages.length > 0 ? newImages : ['/placeholder.jpg'],
      is_drop_active: isActive,
      is_featured: isFeatured,
      variants: variantsList
    }

    try {
      await createProduct(productPayload)
      
      // Update local state for immediate client feedback
      const createdItem = {
        id: `mock-${Date.now()}`,
        ...productPayload,
        product_variants: variantsList.map((v, i) => ({
          id: `v-${Date.now()}-${i}`,
          ...v
        }))
      }

      setProducts([createdItem, ...products])
      toast.success(`Successfully added "${newTitle}" to merchandise!`)
      setIsModalOpen(false)

      // Reset form
      setNewTitle('')
      setNewSlug('')
      setNewPrice('')
      setNewComparePrice('')
      setNewDescription('')
      setNewEditorialStory('')
    } catch (err) {
      toast.error('Failed to create product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleToggleStatus = async (id: string, currentActive: boolean, currentFeatured: boolean, type: 'active' | 'featured') => {
    const newActive = type === 'active' ? !currentActive : currentActive
    const newFeatured = type === 'featured' ? !currentFeatured : currentFeatured
    
    await updateProductStatus(id, newActive, newFeatured)
    setProducts(products.map(p => p.id === id ? { ...p, is_drop_active: newActive, is_featured: newFeatured } : p))
    toast.success(`Updated ${type === 'active' ? 'drop status' : 'featured status'}`)
  }

  const handleStockUpdate = async (variantId: string, productId: string) => {
    const val = parseInt(stockInput[variantId])
    if (isNaN(val)) return
    await updateVariantStock(variantId, val)
    
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
    await deleteProduct(id)
    setProducts(products.filter(p => p.id !== id))
    toast.success(`Removed "${title}"`)
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
            Upload new apparel, edit descriptions, adjust drop pricing, and manage live inventory stock.
          </p>
        </div>

        {/* Upload Merchandise Modal Trigger */}
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0A192F] text-[#FFFFFF] hover:bg-[#000000] gap-2 font-serif tracking-widest text-xs uppercase px-5 py-2.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Merchandise</span>
        </Button>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF] text-[#0A192F] border-[#E5E5E5]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl tracking-wide text-[#0A192F]">
                ADD NEW MERCHANDISE
              </DialogTitle>
              <DialogDescription className="text-xs text-[#666666]">
                Configure garment details, set pricing, assign collections, and define size/color inventory variants.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateMerchandise} className="space-y-6 py-4">
              {/* Section 1: Garment Basics */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A192F] border-b border-[#E5E5E5] pb-1">
                  1. Garment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A192F]">Item Title *</label>
                    <Input
                      placeholder="e.g. So New York Script Tee"
                      value={newTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                      className="border-[#E5E5E5] bg-[#FAFAFA]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A192F]">URL Slug</label>
                    <Input
                      placeholder="e.g. so-new-york-script-tee"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="border-[#E5E5E5] bg-[#FAFAFA] font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A192F]">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full h-9 rounded-md border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-1 text-xs text-[#0A192F]"
                    >
                      <option value="tees">Tees</option>
                      <option value="hoodies">Hoodies & Sweaters</option>
                      <option value="bottoms">Bottoms & Pants</option>
                      <option value="headwear">Headwear & Caps</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A192F]">Collection *</label>
                    <select
                      value={newCollection}
                      onChange={(e) => setNewCollection(e.target.value)}
                      className="w-full h-9 rounded-md border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-1 text-xs text-[#0A192F]"
                    >
                      <option value="So New York">So New York</option>
                      <option value="Been Brooklyn">Been Brooklyn</option>
                      <option value="Grey Baller">Grey Baller</option>
                      <option value="Brooklyn Heritage">Brooklyn Heritage</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A192F]">Retail Price ($) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="45.00"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      required
                      className="border-[#E5E5E5] bg-[#FAFAFA] font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A192F]">Compare At ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="55.00"
                      value={newComparePrice}
                      onChange={(e) => setNewComparePrice(e.target.value)}
                      className="border-[#E5E5E5] bg-[#FAFAFA] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Narrative & Editorial */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A192F] border-b border-[#E5E5E5] pb-1">
                  2. Descriptions & Editorial Story
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#0A192F]">Product Description</label>
                  <textarea
                    rows={2}
                    placeholder="Signature heavyweight garment with reinforced double-needle stitching..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3 text-xs text-[#0A192F] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#0A192F]">Editorial Brand Story (Luxury narrative)</label>
                  <textarea
                    rows={2}
                    placeholder="Forged in the heart of Brooklyn. Built for the kinetic pace of NYC street culture..."
                    value={newEditorialStory}
                    onChange={(e) => setNewEditorialStory(e.target.value)}
                    className="w-full rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3 text-xs text-[#0A192F] outline-none font-serif italic"
                  />
                </div>
              </div>

              {/* Section 3: Product Photography */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A192F] border-b border-[#E5E5E5] pb-1">
                  3. Garment Photography & Media
                </h3>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image path or URL (e.g. /blk_so_ny_wht_tee/blk_so_ny_wht_tee/so_ny_wht_tee.jpg)"
                    value={newImageUrlInput}
                    onChange={(e) => setNewImageUrlInput(e.target.value)}
                    className="border-[#E5E5E5] bg-[#FAFAFA] text-xs"
                  />
                  <Button type="button" onClick={handleAddImage} variant="outline" className="border-[#E5E5E5] text-xs">
                    Add Image
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {newImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-24 rounded border border-[#E5E5E5] bg-[#FAFAFA] overflow-hidden group">
                      <img src={img} alt="Product preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#0A192F] text-white text-[8px] px-1 py-0.5 rounded font-mono">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Variants & Stock */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A192F]">
                    4. Size & Color Inventory Variants
                  </h3>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddVariantRow} className="h-7 text-xs border-[#E5E5E5]">
                    + Add Variant Row
                  </Button>
                </div>

                <div className="rounded border border-[#E5E5E5] bg-[#FAFAFA] overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F3F3F3] border-b border-[#E5E5E5]">
                      <tr>
                        <th className="p-2 text-left font-medium text-[#666666]">Size</th>
                        <th className="p-2 text-left font-medium text-[#666666]">Color</th>
                        <th className="p-2 text-left font-medium text-[#666666]">SKU</th>
                        <th className="p-2 text-left font-medium text-[#666666]">Stock Qty</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantsList.map((v, idx) => (
                        <tr key={idx} className="border-b border-[#E5E5E5] last:border-none">
                          <td className="p-2">
                            <Input
                              value={v.size}
                              onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                              className="h-7 w-20 border-[#E5E5E5] bg-white text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={v.color}
                              onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                              className="h-7 w-28 border-[#E5E5E5] bg-white text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={v.sku}
                              onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                              className="h-7 w-36 border-[#E5E5E5] bg-white text-xs font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={v.inventory_quantity}
                              onChange={(e) => handleVariantChange(idx, 'inventory_quantity', parseInt(e.target.value) || 0)}
                              className="h-7 w-20 border-[#E5E5E5] bg-white text-xs font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 5: Visibility Controls */}
              <div className="flex items-center gap-6 p-4 rounded bg-[#FAFAFA] border border-[#E5E5E5]">
                <label className="flex items-center gap-2 text-xs font-medium text-[#0A192F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-[#E5E5E5] text-[#0A192F]"
                  />
                  <span>Live / Published to Store</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-[#0A192F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-[#E5E5E5] text-[#0A192F]"
                  />
                  <span>Featured in "Latest Drop" Grid</span>
                </label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-[#E5E5E5] text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[#0A192F] text-white hover:bg-black text-xs font-serif tracking-wider uppercase">
                  {isSubmitting ? 'Saving Merchandise...' : 'Publish Merchandise'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
          {['all', 'So New York', 'Been Brooklyn', 'Grey Baller'].map((coll) => (
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
              const mainImg = product.images?.[0] || '/placeholder.jpg'

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
                                    <Badge variant="outline" className="text-[9px] font-mono bg-white border-[#E5E5E5]">
                                      Stock: {variant.inventory_quantity}
                                    </Badge>
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
