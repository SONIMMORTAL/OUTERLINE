'use client'

import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { createClient as createBrowserSupabase } from '@/lib/supabase/client'
import { createProduct, updateProduct, type VariantInput } from './actions'

// Must match the size CHECK constraint on product_variants in supabase/migrations/001_init.sql
const VARIANT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'OS']
export const STOREFRONT_COLLECTIONS = ['So New York', 'Been Brooklyn', 'Been Brooklyn Baller']
const CATEGORIES = [
  { value: 'tees', label: 'Tees' },
  { value: 'hoodies', label: 'Hoodies & Sweaters' },
  { value: 'bottoms', label: 'Bottoms & Pants' },
  { value: 'headwear', label: 'Headwear & Caps' },
  { value: 'accessories', label: 'Accessories' },
]
const DEFAULT_NEW_VARIANTS: VariantInput[] = [
  { size: 'S', color: 'White', sku: '', inventory_quantity: 15 },
  { size: 'M', color: 'White', sku: '', inventory_quantity: 25 },
  { size: 'L', color: 'White', sku: '', inventory_quantity: 20 },
  { size: 'M', color: 'Black', sku: '', inventory_quantity: 20 },
  { size: 'L', color: 'Black', sku: '', inventory_quantity: 15 },
]

const fieldClass = 'border-[#E5E5E5] bg-[#FAFAFA]'
const selectClass = 'w-full h-9 rounded-md border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-1 text-xs text-[#0A192F]'
const sectionTitleClass = 'text-xs font-bold uppercase tracking-widest text-[#0A192F]'

function slugFromTitle(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-1">
        <h3 className={sectionTitleClass}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#0A192F]">{label}</label>
      {children}
    </div>
  )
}

function VariantRowsEditor({ rows, onChange }: { rows: VariantInput[]; onChange: (rows: VariantInput[]) => void }) {
  const update = (index: number, field: keyof VariantInput, value: string | number) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)))

  if (rows.length === 0) return null
  return (
    <div className="rounded border border-[#E5E5E5] bg-[#FAFAFA] overflow-x-auto">
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
          {rows.map((v, idx) => (
            <tr key={idx} className="border-b border-[#E5E5E5] last:border-none">
              <td className="p-2">
                <select
                  value={v.size}
                  onChange={(e) => update(idx, 'size', e.target.value)}
                  className="h-7 w-20 rounded-md border border-[#E5E5E5] bg-white px-2 text-xs"
                >
                  {VARIANT_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </td>
              <td className="p-2">
                <Input
                  value={v.color}
                  placeholder="e.g. Black/Red"
                  onChange={(e) => update(idx, 'color', e.target.value)}
                  className="h-7 w-28 border-[#E5E5E5] bg-white text-xs"
                />
              </td>
              <td className="p-2">
                <Input
                  value={v.sku ?? ''}
                  placeholder="Automatic"
                  onChange={(e) => update(idx, 'sku', e.target.value)}
                  className="h-7 w-36 border-[#E5E5E5] bg-white text-xs font-mono"
                />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  min={0}
                  value={v.inventory_quantity}
                  onChange={(e) => update(idx, 'inventory_quantity', parseInt(e.target.value) || 0)}
                  className="h-7 w-20 border-[#E5E5E5] bg-white text-xs font-mono"
                />
              </td>
              <td className="p-2">
                <button
                  type="button"
                  onClick={() => onChange(rows.filter((_, i) => i !== idx))}
                  aria-label="Remove variant"
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
  )
}

// Add and edit merchandise. `product` is null when adding. Remount with a new key to edit a different product.
export function ProductFormDialog({
  product,
  open,
  onOpenChange,
  onSaved,
}: {
  product: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (product: any) => void
}) {
  const isEdit = Boolean(product)
  const existingVariants: any[] = product?.product_variants ?? []
  const existingColors = [...new Set(existingVariants.map((v) => v.color).filter(Boolean))] as string[]

  const [title, setTitle] = useState<string>(product?.title ?? '')
  const [slug, setSlug] = useState<string>(product?.slug ?? '')
  const [category, setCategory] = useState<string>(product?.category ?? 'tees')
  const [collection, setCollection] = useState<string>(product?.collection ?? STOREFRONT_COLLECTIONS[0])
  const [price, setPrice] = useState<string>(product ? String(Number(product.price)) : '')
  const [comparePrice, setComparePrice] = useState<string>(product?.compare_at_price ? String(Number(product.compare_at_price)) : '')
  const [description, setDescription] = useState<string>(product?.description ?? '')
  const [editorialStory, setEditorialStory] = useState<string>(product?.editorial_story ?? '')
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [variants, setVariants] = useState<VariantInput[]>(isEdit ? [] : DEFAULT_NEW_VARIANTS)
  const [colorVisibility, setColorVisibility] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(existingColors.map((color) => [color, existingVariants.some((v) => v.color === color && v.is_active !== false)]))
  )
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const collectionOptions = STOREFRONT_COLLECTIONS.includes(collection) ? STOREFRONT_COLLECTIONS : [...STOREFRONT_COLLECTIONS, collection]

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!isEdit) setSlug(slugFromTitle(value))
  }

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return
    setImages([...images, imageUrlInput.trim()])
    setImageUrlInput('')
  }

  // Each file gets a signed upload URL from our API, then goes straight from the browser to Supabase Storage.
  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || isUploading) return
    setIsUploading(true)

    const supabase = createBrowserSupabase()
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Upload failed')

        const { error } = await supabase.storage
          .from(data.bucket)
          .uploadToSignedUrl(data.path, data.token, file, { contentType: file.type })
        if (error) throw error

        uploaded.push(data.publicUrl)
      } catch (err: any) {
        toast.error(`${file.name}: ${err?.message || 'Upload failed'}`)
      }
    }

    if (uploaded.length > 0) {
      setImages((prev) => [...prev, ...uploaded])
      toast.success(`Uploaded ${uploaded.length} photo${uploaded.length === 1 ? '' : 's'}`)
    }
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const moveImage = (index: number, offset: -1 | 1) => {
    const target = index + offset
    if (target < 0 || target >= images.length) return
    const reordered = [...images]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setImages(reordered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploading) {
      toast.error('Wait for the photo upload to finish.')
      return
    }
    if (images.length === 0) {
      toast.error('Add at least one product photo.')
      return
    }

    setIsSubmitting(true)
    const fields = {
      title,
      category,
      collection,
      price: parseFloat(price),
      compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
      images,
    }

    try {
      const result = isEdit
        ? await updateProduct(product.id, {
            fields: { ...fields, description, editorial_story: editorialStory },
            colorVisibility: Object.fromEntries(
              Object.entries(colorVisibility).filter(([color, visible]) =>
                visible !== existingVariants.some((v) => v.color === color && v.is_active !== false)
              )
            ),
            newVariants: variants,
          })
        : await createProduct({
            ...fields,
            slug,
            description: description || 'Crafted with premium materials and signature NYC streetwear tailoring.',
            editorial_story: editorialStory || 'Forged in Brooklyn. Defined & Unconfined.',
            is_drop_active: isActive,
            is_featured: isFeatured,
            variants,
          })

      if (result.data) onSaved(result.data)
      if (!result.success) {
        toast.error(result.error || 'Could not save the product.')
        return
      }
      if ('warning' in result && result.warning) toast.warning(result.warning, { duration: 10000 })
      toast.success(isEdit ? `Saved "${title}".` : `Published "${title}" to the store.`)
      onOpenChange(false)
    } catch {
      toast.error('Could not save the product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The base dialog caps width at sm:max-w-sm, so the width must be overridden at the same breakpoint. */}
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF] text-[#0A192F] border-[#E5E5E5]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-wide text-[#0A192F]">
            {isEdit ? 'EDIT MERCHANDISE' : 'ADD NEW MERCHANDISE'}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#666666]">
            {isEdit
              ? 'Change the name, price, category, photos, and colors. Changes go live on the store and in Stripe when you save.'
              : 'Configure garment details, set pricing, assign collections, and define size/color inventory variants.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Section title="1. Garment Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Item Name *">
                <Input
                  placeholder="e.g. So New York Script Tee"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  className={fieldClass}
                />
              </Field>
              <Field label="URL Slug">
                <Input
                  placeholder="e.g. so-new-york-script-tee"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  readOnly={isEdit}
                  title={isEdit ? 'The web address stays the same so existing links keep working.' : undefined}
                  className={`${fieldClass} font-mono text-xs ${isEdit ? 'text-[#666666]' : ''}`}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="Category *">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                  {CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Field>
              <Field label="Collection *">
                <select value={collection} onChange={(e) => setCollection(e.target.value)} className={selectClass}>
                  {collectionOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </Field>
              <Field label="Retail Price ($) *">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="45.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className={`${fieldClass} font-mono`}
                />
              </Field>
              <Field label="Compare At ($)">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="55.00"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  className={`${fieldClass} font-mono`}
                />
              </Field>
            </div>
          </Section>

          <Section title="2. Descriptions & Editorial Story">
            <Field label="Product Description">
              <textarea
                rows={2}
                placeholder="Signature heavyweight garment with reinforced double-needle stitching..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3 text-xs text-[#0A192F] outline-none"
              />
            </Field>
            <Field label="Editorial Brand Story (Luxury narrative)">
              <textarea
                rows={2}
                placeholder="Forged in the heart of Brooklyn. Built for the kinetic pace of NYC street culture..."
                value={editorialStory}
                onChange={(e) => setEditorialStory(e.target.value)}
                className="w-full rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3 text-xs text-[#0A192F] outline-none font-serif italic"
              />
            </Field>
          </Section>

          <Section title="3. Garment Photography & Media *">
            <label
              htmlFor="product-image-upload"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleImageFiles(e.dataTransfer.files) }}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
                isUploading ? 'cursor-wait' : 'cursor-pointer'
              } ${
                isDragging ? 'border-[#0A192F] bg-[#F3F3F3]' : 'border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#0A192F]/50'
              }`}
            >
              {isUploading
                ? <Loader2 className="w-5 h-5 animate-spin text-[#0A192F]" />
                : <Upload className="w-5 h-5 text-[#0A192F]" />}
              <span className="text-xs font-semibold text-[#0A192F]">
                {isUploading ? 'Uploading photos…' : 'Click to upload or drag photos here'}
              </span>
              <span className="text-[10px] text-[#666666]">
                JPG, PNG, WebP, or AVIF · up to 15 MB each · the first photo is the cover
              </span>
              <input
                ref={fileInputRef}
                id="product-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                disabled={isUploading}
                onChange={(e) => handleImageFiles(e.target.files)}
                className="sr-only"
              />
            </label>

            <div className="flex gap-2">
              <Input
                placeholder="Or paste an image URL or /public path"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className={`${fieldClass} text-xs`}
              />
              <Button type="button" onClick={handleAddImageUrl} variant="outline" className="border-[#E5E5E5] text-xs">
                Add URL
              </Button>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={`${img}-${idx}`} className="relative w-20 h-24 rounded border border-[#E5E5E5] bg-[#FAFAFA] overflow-hidden group">
                    <img src={img} alt="Product preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute inset-x-1 bottom-1 flex items-center justify-between">
                      {idx === 0
                        ? <span className="bg-[#0A192F] text-white text-[8px] px-1 py-0.5 rounded font-mono">Cover</span>
                        : <button type="button" onClick={() => moveImage(idx, -1)} aria-label="Move photo earlier" className="bg-white/90 text-[#0A192F] rounded p-0.5"><ChevronLeft className="w-3 h-3" /></button>}
                      {idx < images.length - 1 && (
                        <button type="button" onClick={() => moveImage(idx, 1)} aria-label="Move photo later" className="bg-white/90 text-[#0A192F] rounded p-0.5"><ChevronRight className="w-3 h-3" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isEdit && (
              <p className="text-[10px] text-[#666666]">
                On launch products, changing these photos replaces the color-by-color gallery with exactly the photos above.
              </p>
            )}
          </Section>

          <Section
            title={isEdit ? '4. Colors, Sizes & Stock' : '4. Size & Color Inventory Variants'}
            action={
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setVariants([...variants, { size: 'M', color: existingColors[0] ?? 'Black', sku: '', inventory_quantity: 10 }])}
                className="h-7 text-xs border-[#E5E5E5]"
              >
                {isEdit ? '+ Add Size or Color' : '+ Add Variant Row'}
              </Button>
            }
          >
            {isEdit && existingColors.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {existingColors.map((color) => {
                  const colorVariants = existingVariants.filter((v) => v.color === color)
                  const stock = colorVariants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0)
                  return (
                    <label key={color} className="flex items-center justify-between gap-3 rounded border border-[#E5E5E5] bg-[#FAFAFA] p-2.5 text-xs cursor-pointer">
                      <span>
                        <span className="font-semibold block">{color}</span>
                        <span className="text-[10px] text-[#666666] font-mono">
                          {colorVariants.map((v) => v.size).join(' · ')} — {stock} units
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={colorVisibility[color] ?? true}
                          onChange={(e) => setColorVisibility({ ...colorVisibility, [color]: e.target.checked })}
                        />
                        Show on site
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
            <VariantRowsEditor rows={variants} onChange={setVariants} />
            <p className="text-[10px] text-[#666666]">
              {isEdit
                ? 'Change stock for existing sizes from the product list. New rows are added when you save; leave SKU blank to generate one.'
                : 'Leave SKU blank to generate one. SKUs must be unique across the whole store.'}
            </p>
          </Section>

          {!isEdit && (
            <div className="flex flex-wrap items-center gap-6 p-4 rounded bg-[#FAFAFA] border border-[#E5E5E5]">
              <label className="flex items-center gap-2 text-xs font-medium text-[#0A192F] cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-[#E5E5E5] text-[#0A192F]" />
                <span>Live / Published to Store</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-[#0A192F] cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-[#E5E5E5] text-[#0A192F]" />
                <span>Featured in &quot;Latest Drop&quot; Grid</span>
              </label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#E5E5E5] text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="bg-[#0A192F] text-white hover:bg-black text-xs font-serif tracking-wider uppercase">
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Merchandise'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
