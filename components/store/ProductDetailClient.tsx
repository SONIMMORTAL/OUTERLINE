'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart, Check, ChevronRight, Ruler } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'
import { SizeGuideModal } from '@/components/store/SizeGuideModal'

interface ProductDetailClientProps {
  product: any
  variants: any[]
}

export function ProductDetailClient({ product, variants }: ProductDetailClientProps) {
  const images = product.images || []
  const imagesBack = product.images_back || []
  const modelImage = product.model_image || null
  
  // Build paired gallery: Put front views alongside their corresponding back views
  const buildGallery = () => {
    const gallery: { url: string; type: 'model' | 'front' | 'back'; label?: string }[] = []
    
    // Distinct model editorial photo if present and separate from product shots
    if (modelImage && !images.includes(modelImage)) {
      gallery.push({ url: modelImage, type: 'model', label: 'EDITORIAL' })
    }
    
    // Pair each front view directly with its matching back view
    images.forEach((img: string, idx: number) => {
      gallery.push({ url: img, type: img === modelImage ? 'model' : 'front', label: 'FRONT' })
      if (imagesBack && imagesBack[idx]) {
        gallery.push({ url: imagesBack[idx], type: 'back', label: 'BACK' })
      }
    })
    
    return gallery
  }
  
  const gallery = buildGallery()
  
  // Extract unique colors and sizes from variants
  const colors = Array.from(new Set(variants.map(v => v.color))).filter(Boolean)
  const sizes = Array.from(new Set(variants.map(v => v.size))).filter(Boolean)

  // Start with the primary front view
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || 'Standard')
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || 'M')
  const [activeImage, setActiveImage] = useState<string>(gallery[0]?.url || images[0] || '/placeholder.jpg')
  const [activeImageType, setActiveImageType] = useState<'model' | 'front' | 'back'>(gallery[0]?.type || 'front')
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false)
  
  const addItem = useCartStore((s) => s.addItem)

  // Get current variant images for active color
  const currentVariant = variants.find(v => v.color === selectedColor) || variants[0]
  const currentFront = currentVariant?.image || images[0]
  const currentBack = currentVariant?.image_back || imagesBack[0]

  // Map color selection to the correct garment image
  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    
    const variantMatch = variants.find(
      v => v.color && v.color.toLowerCase() === color.toLowerCase() && v.image
    )
    if (variantMatch?.image) {
      setActiveImage(activeImageType === 'back' && variantMatch.image_back ? variantMatch.image_back : variantMatch.image)
      return
    }

    const colorIdx = colors.indexOf(color)
    if (colorIdx >= 0 && colorIdx < images.length) {
      setActiveImage(activeImageType === 'back' && imagesBack[colorIdx] ? imagesBack[colorIdx] : images[colorIdx])
    }
  }

  // When user clicks an image thumbnail, sync color and active view
  const handleThumbnailClick = (imgUrl: string, type: 'model' | 'front' | 'back') => {
    setActiveImage(imgUrl)
    setActiveImageType(type)
    
    const variantMatch = variants.find(v => v.image === imgUrl || v.image_back === imgUrl)
    if (variantMatch?.color) {
      setSelectedColor(variantMatch.color)
    }
  }

  const handleAddToCart = () => {
    const matchedVariant = variants.find(
      v => (v.color === selectedColor || !selectedColor) && (v.size === selectedSize || !selectedSize)
    ) || variants[0]

    const variantId = matchedVariant?.id || `${product.id}-${selectedSize}-${selectedColor}`
    const sku = matchedVariant?.sku || `${product.slug}-${selectedSize}-${selectedColor}`.toUpperCase()

    addItem({
      id: variantId,
      productId: product.id,
      productTitle: product.title,
      slug: product.slug,
      sku: sku,
      size: selectedSize,
      color: selectedColor,
      price: Number(product.price),
      compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : undefined,
      image: currentFront || activeImage,
    })

    toast.success(`Added ${product.title} (${selectedColor} / ${selectedSize}) to cart!`)
  }

  const getSwatchStyle = (colorName: string): React.CSSProperties => {
    const c = colorName.toLowerCase()
    const colorMap: Record<string, string> = {
      black: '#111111',
      blk: '#111111',
      white: '#FFFFFF',
      wht: '#FFFFFF',
      pink: '#F472B6',
      red: '#DC2626',
      blue: '#1E3A8A',
      navy: '#0A192F',
      grey: '#9CA3AF',
      gray: '#9CA3AF'
    }

    if (c.includes('/')) {
      const parts = c.split('/')
      const p1 = parts[0].trim()
      const p2 = parts[1].trim()
      const primaryKey = Object.keys(colorMap).find(k => p1.includes(k)) || 'black'
      const secondaryKey = Object.keys(colorMap).find(k => p2.includes(k)) || 'white'
      const c1 = colorMap[primaryKey] || '#111111'
      const c2 = colorMap[secondaryKey] || '#FFFFFF'
      return {
        background: `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`
      }
    }

    const matched = Object.keys(colorMap).find(k => c.includes(k))
    return {
      backgroundColor: matched ? colorMap[matched] : '#111111'
    }
  }

  // Use object-contain for all images to prevent any cropping of heads/foreheads or garment edges
  const getImageFit = () => {
    return 'object-contain'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
      {/* Left Column: Live Interactive Gallery — 4:5 Standard */}
      <div className="flex flex-col space-y-4">
        <div className="aspect-[4/5] rounded-lg border border-[#E5E5E5] relative overflow-hidden bg-[#F9F9F9] transition-all duration-300">
          {/* Quick Front / Back Toggle Pill */}
          {currentBack && (
            <div className="absolute top-4 right-4 z-20 flex bg-white/95 backdrop-blur-md rounded-full p-1 border border-[#E5E5E5] shadow-xs text-xs font-mono">
              <button 
                type="button"
                onClick={() => {
                  const backIdx = imagesBack.indexOf(activeImage)
                  if (backIdx !== -1 && images[backIdx]) {
                    setActiveImage(images[backIdx])
                    setActiveImageType('front')
                  } else if (currentFront) {
                    setActiveImage(currentFront)
                    setActiveImageType('front')
                  }
                }}
                className={`px-3 py-1 rounded-full uppercase tracking-wider transition-all font-semibold ${
                  activeImageType === 'front' || activeImageType === 'model'
                    ? 'bg-[#0A192F] text-white' 
                    : 'text-[#666666] hover:text-[#0A192F]'
                }`}
              >
                Front
              </button>
              <button 
                type="button"
                onClick={() => {
                  const frontIdx = images.indexOf(activeImage)
                  if (frontIdx !== -1 && imagesBack[frontIdx]) {
                    setActiveImage(imagesBack[frontIdx])
                    setActiveImageType('back')
                  } else if (currentBack) {
                    setActiveImage(currentBack)
                    setActiveImageType('back')
                  }
                }}
                className={`px-3 py-1 rounded-full uppercase tracking-wider transition-all font-semibold ${
                  activeImageType === 'back'
                    ? 'bg-[#0A192F] text-white' 
                    : 'text-[#666666] hover:text-[#0A192F]'
                }`}
              >
                Back
              </button>
            </div>
          )}

          {activeImage ? (
            <Image 
              src={activeImage} 
              alt={product.title} 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`${getImageFit()} transition-all duration-500`} 
              priority
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#E5E5E5]">No Image</div>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {gallery.slice(0, 12).map((item, idx) => {
              const isSelected = activeImage === item.url
              return (
                <div 
                  key={idx} 
                  onClick={() => handleThumbnailClick(item.url, item.type)}
                  className={`aspect-square rounded border relative overflow-hidden cursor-pointer transition-all bg-[#F9F9F9] ${
                    isSelected ? 'border-[#0A192F] ring-2 ring-[#0A192F]/20' : 'border-[#E5E5E5] hover:border-[#0A192F]'
                  }`}
                >
                  <Image 
                    src={item.url} 
                    alt={`${product.title} ${item.type} view ${idx + 1}`} 
                    fill 
                    sizes="(max-width: 1024px) 20vw, 10vw"
                    className="object-contain"
                  />
                  {item.label && (
                    <span className={`absolute bottom-0.5 right-0.5 text-[7px] px-1 rounded font-mono font-bold tracking-widest ${
                      item.type === 'back' ? 'bg-[#0A192F] text-white' : 'bg-black/40 text-white'
                    }`}>
                      {item.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right Column: Garment Meta & Selectors */}
      <div className="flex flex-col">
        {/* Title & Price Header */}
        <div className="mb-8">
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] font-semibold text-[#0A192F]/70 mb-2 block">
            {product.collection || `${product.category} Collection`}
          </span>
          <h1 className="font-brand text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.08em] text-[#0A192F] uppercase mb-4 leading-tight">
            {product.title}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xl text-[#0A192F] font-medium font-mono">${Number(product.price).toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-[#666666] line-through font-mono">${Number(product.compare_at_price).toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Color Swatch Selector */}
        <div className="space-y-8">
          {colors.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-[#666666]">Colorway</span>
                <span className="text-xs text-[#0A192F] font-medium">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map(color => {
                  const isSelected = selectedColor === color
                  const swatchStyle = getSwatchStyle(color)
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`w-9 h-9 rounded-full border-2 transition-all relative flex items-center justify-center shadow-xs ${
                        isSelected 
                          ? 'border-[#0A192F] scale-110 ring-2 ring-[#0A192F]/20' 
                          : 'border-white/80 ring-1 ring-[#E5E5E5] hover:scale-105'
                      }`}
                      style={swatchStyle}
                      title={color}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-[#666666]">Size</span>
                <button 
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[10px] uppercase tracking-widest text-[#0A192F] hover:text-[#000000] transition-colors border-b border-[#0A192F] font-semibold flex items-center gap-1"
                >
                  <Ruler className="w-3 h-3" />
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map(size => {
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-sm font-medium border rounded transition-colors ${
                        isSelected
                          ? 'border-[#0A192F] bg-[#0A192F] text-[#FFFFFF]'
                          : 'border-[#E5E5E5] text-[#0A192F] hover:border-[#0A192F] bg-[#FAFAFA]'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 hover:bg-[#000000] transition-colors shadow-sm cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>

          {/* Tabs: Specifications & Sizing */}
          <Tabs.Root defaultValue="details" className="w-full pt-8 border-t border-[#E5E5E5]">
            <Tabs.List className="flex w-full border-b border-[#E5E5E5]">
              {['DETAILS & SPECS', 'EDITORIAL STORY', 'SIZING & CARE'].map((tab) => {
                const val = tab.toLowerCase().split(' ')[0]
                return (
                  <Tabs.Trigger
                    key={tab}
                    value={val}
                    className="flex-1 pb-3 text-[10px] uppercase tracking-widest font-medium text-[#666666] hover:text-[#0A192F] data-[state=active]:text-[#0A192F] data-[state=active]:border-b-2 data-[state=active]:border-[#0A192F] transition-colors"
                  >
                    {tab}
                  </Tabs.Trigger>
                )
              })}
            </Tabs.List>

            {/* Details & Specs Tab */}
            <Tabs.Content value="details" className="pt-6 space-y-4 text-xs leading-relaxed outline-none">
              <p className="text-[#0A192F] font-medium leading-relaxed">
                {product.description || 'Crafted with premium materials and signature NYC tailoring.'}
              </p>

              {product.specs && Array.isArray(product.specs) && product.specs.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-[#E5E5E5]">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#0A192F] block pt-2">
                    Garment Specifications
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-[#666666]">
                    {product.specs.map((spec: string, i: number) => (
                      <li key={i} className="leading-normal">
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Tabs.Content>

            {/* Editorial Story Tab */}
            <Tabs.Content value="editorial" className="pt-6 space-y-3 text-xs leading-relaxed outline-none">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#0A192F] block">
                The Brooklyn Narrative
              </span>
              <p className="text-[#666666] text-sm leading-relaxed font-serif italic">
                "{product.editorial_story || 'Outerline is a high-performance, editorial streetwear brand delivering the kinetic energy of NYC drop culture with timeless luxury craftsmanship.'}"
              </p>
            </Tabs.Content>

            {/* Sizing & Care Tab */}
            <Tabs.Content value="sizing" className="pt-6 space-y-3 text-xs text-[#666666] leading-relaxed outline-none">
              <div className="p-3.5 rounded bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                <span className="font-semibold text-[#0A192F] block">Fit Profile</span>
                <p>
                  {product.category === 'hoodies' 
                    ? 'Generous, relaxed luxury streetwear fit with fleece-lined hood. True to size for a classic streetwear drape; size down for a slim tailored fit.'
                    : 'Regular luxury fit with side seams and 3/8" shoulder-to-shoulder binding. True to size.'
                  }
                </p>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#0A192F] font-semibold border-b border-[#0A192F] hover:text-[#000000] transition-colors pt-1"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  View Interactive US Size Chart (XS - 5XL)
                </button>
              </div>
              <div className="space-y-1 pt-1">
                <span className="font-semibold text-[#0A192F] block">Garment Care</span>
                <p>Machine wash cold with like colors. Tumble dry low or hang dry to preserve garment longevity and 32 singles face yarn texture.</p>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>

      {/* Interactive Size Guide Modal */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onOpenChange={setSizeGuideOpen}
        initialCategory={product.category === 'tees' ? 'tees' : 'hoodies'}
      />
    </div>
  )
}
