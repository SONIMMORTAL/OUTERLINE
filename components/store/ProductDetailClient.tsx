'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ShoppingCart, Check, ChevronLeft, ChevronRight, Ruler, Maximize2, X } from 'lucide-react'
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
  
  // Build paired gallery: Put front views alongside their corresponding back views without duplicates
  const buildGallery = () => {
    const galleryItems: { url: string; type: 'model' | 'front' | 'back'; label?: string }[] = []
    const seenUrls = new Set<string>()

    const addImage = (url: string, type: 'model' | 'front' | 'back', label?: string) => {
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url)
        galleryItems.push({ url, type, label })
      }
    }

    // Model editorial photo first if present
    if (modelImage) {
      addImage(modelImage, 'model', 'EDITORIAL')
    }

    // Pair front and back views
    images.forEach((img: string, idx: number) => {
      addImage(img, img === modelImage ? 'model' : 'front', 'FRONT')
      if (imagesBack && imagesBack[idx]) {
        addImage(imagesBack[idx], 'back', 'BACK')
      }
    })

    // Include any variant specific views
    variants.forEach(v => {
      if (v.image) addImage(v.image, 'front', v.color ? `${v.color.toUpperCase()}` : 'FRONT')
      if (v.image_back) addImage(v.image_back, 'back', v.color ? `${v.color.toUpperCase()} BACK` : 'BACK')
    })

    return galleryItems
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
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false)

  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const lightboxThumbnailsRef = useRef<HTMLDivElement>(null)
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([])
  const lightboxThumbnailRefs = useRef<(HTMLDivElement | null)[]>([])

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  const addItem = useCartStore((s) => s.addItem)

  // Get current variant images for active color
  const currentVariant = variants.find(v => v.color === selectedColor) || variants[0]
  const currentFront = currentVariant?.image || images[0]
  const currentBack = currentVariant?.image_back || imagesBack[0]

  // Active image index in gallery
  const currentIndex = Math.max(0, gallery.findIndex(item => item.url === activeImage))

  // Cycle to next / prev image
  const goToNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (gallery.length <= 1) return
    const nextIdx = (currentIndex + 1) % gallery.length
    const nextItem = gallery[nextIdx]
    handleThumbnailClick(nextItem.url, nextItem.type)
  }

  const goToPrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (gallery.length <= 1) return
    const prevIdx = (currentIndex - 1 + gallery.length) % gallery.length
    const prevItem = gallery[prevIdx]
    handleThumbnailClick(prevItem.url, prevItem.type)
  }

  // Auto-scroll thumbnails when active image changes
  useEffect(() => {
    if (thumbnailRefs.current[currentIndex]) {
      thumbnailRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
    if (isLightboxOpen && lightboxThumbnailRefs.current[currentIndex]) {
      lightboxThumbnailRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [currentIndex, isLightboxOpen])

  // Keyboard navigation and body scroll lock for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false)
      } else if (e.key === 'ArrowRight') {
        if (gallery.length <= 1) return
        const nextIdx = (currentIndex + 1) % gallery.length
        const nextItem = gallery[nextIdx]
        setActiveImage(nextItem.url)
        setActiveImageType(nextItem.type)
      } else if (e.key === 'ArrowLeft') {
        if (gallery.length <= 1) return
        const prevIdx = (currentIndex - 1 + gallery.length) % gallery.length
        const prevItem = gallery[prevIdx]
        setActiveImage(prevItem.url)
        setActiveImageType(prevItem.type)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLightboxOpen, currentIndex, gallery])

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    if (isLeftSwipe) {
      goToNextImage()
    } else if (isRightSwipe) {
      goToPrevImage()
    }
  }

  // Scroll thumbnails strip left / right
  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailsRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220
      thumbnailsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollLightboxThumbnails = (direction: 'left' | 'right') => {
    if (lightboxThumbnailsRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220
      lightboxThumbnailsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

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
        <div 
          className="aspect-[4/5] rounded-lg border border-[#E5E5E5] relative overflow-hidden bg-[#F9F9F9] transition-all duration-300 group cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          title="Click to expand full screen gallery"
        >
          {/* Quick Front / Back Toggle Pill */}
          {currentBack && (
            <div 
              className="absolute top-4 right-4 z-20 flex bg-white/95 backdrop-blur-md rounded-full p-1 border border-[#E5E5E5] shadow-xs text-xs font-mono"
              onClick={(e) => e.stopPropagation()}
            >
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
                className={`px-3 py-1 rounded-full uppercase tracking-wider transition-all font-semibold cursor-pointer ${
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
                className={`px-3 py-1 rounded-full uppercase tracking-wider transition-all font-semibold cursor-pointer ${
                  activeImageType === 'back'
                    ? 'bg-[#0A192F] text-white' 
                    : 'text-[#666666] hover:text-[#0A192F]'
                }`}
              >
                Back
              </button>
            </div>
          )}

          {/* Left / Right Chevron Controls On Image */}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrevImage}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-[#E5E5E5] shadow-md flex items-center justify-center text-[#0A192F] hover:bg-[#0A192F] hover:text-white transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goToNextImage}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-[#E5E5E5] shadow-md flex items-center justify-center text-[#0A192F] hover:bg-[#0A192F] hover:text-white transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Click To Enlarge Indicator Badge */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E5E5E5] text-[10px] font-mono tracking-wider text-[#0A192F] shadow-xs pointer-events-none">
            <Maximize2 className="w-3 h-3 text-[#0A192F]" />
            <span>EXPAND • {currentIndex + 1} / {gallery.length}</span>
          </div>

          {activeImage ? (
            <Image 
              src={activeImage} 
              alt={product.title} 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`${getImageFit()} transition-all duration-300`} 
              priority
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#E5E5E5]">No Image</div>
          )}
        </div>

        {/* Scrollable Thumbnails Strip Below */}
        {gallery.length > 1 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-[#666666] px-1">
              <span>Scroll views ({gallery.length} photos)</span>
              <span className="font-semibold text-[#0A192F]">{gallery[currentIndex]?.label || ''}</span>
            </div>
            <div className="relative flex items-center group/thumbs">
              {gallery.length > 4 && (
                <button
                  type="button"
                  onClick={() => scrollThumbnails('left')}
                  className="absolute -left-3 z-10 w-7 h-7 rounded-full bg-white border border-[#E5E5E5] shadow-md flex items-center justify-center text-[#0A192F] hover:bg-[#0A192F] hover:text-white transition-all opacity-90 sm:opacity-0 sm:group-hover/thumbs:opacity-100 cursor-pointer"
                  aria-label="Scroll thumbnails left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div 
                ref={thumbnailsRef}
                className="flex gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x scrollbar-none w-full"
              >
                {gallery.map((item, idx) => {
                  const isSelected = activeImage === item.url
                  return (
                    <div 
                      key={idx} 
                      ref={(el) => { thumbnailRefs.current[idx] = el }}
                      onClick={() => handleThumbnailClick(item.url, item.type)}
                      className={`shrink-0 w-20 h-24 sm:w-24 sm:h-28 rounded-md border relative overflow-hidden cursor-pointer transition-all snap-center bg-[#F9F9F9] ${
                        isSelected ? 'border-[#0A192F] ring-2 ring-[#0A192F]/20 scale-[1.02]' : 'border-[#E5E5E5] hover:border-[#0A192F]'
                      }`}
                    >
                      <Image 
                        src={item.url} 
                        alt={`${product.title} ${item.type} view ${idx + 1}`} 
                        fill 
                        sizes="(max-width: 1024px) 20vw, 10vw"
                        className="object-contain p-1"
                      />
                      {item.label && (
                        <span className={`absolute bottom-0.5 right-0.5 text-[7px] px-1 rounded font-mono font-bold tracking-widest ${
                          item.type === 'back' ? 'bg-[#0A192F] text-white' : 'bg-black/50 text-white'
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              {gallery.length > 4 && (
                <button
                  type="button"
                  onClick={() => scrollThumbnails('right')}
                  className="absolute -right-3 z-10 w-7 h-7 rounded-full bg-white border border-[#E5E5E5] shadow-md flex items-center justify-center text-[#0A192F] hover:bg-[#0A192F] hover:text-white transition-all opacity-90 sm:opacity-0 sm:group-hover/thumbs:opacity-100 cursor-pointer"
                  aria-label="Scroll thumbnails right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
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
              {['DETAILS & SPECS', 'SIZING & CARE'].map((tab) => {
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

              {/* Story / Narrative note at bottom of product description */}
              {product.editorial_story && (
                <div className="pt-3 border-t border-[#E5E5E5]">
                  <p className="text-[#666666] text-xs leading-relaxed font-serif italic">
                    "{product.editorial_story}"
                  </p>
                </div>
              )}
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

      {/* Fullscreen Interactive Clothing Gallery Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Product Image Gallery Lightbox"
        >
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 text-white z-30">
            <div className="flex items-center gap-3">
              <span className="font-brand font-bold tracking-[0.15em] text-xs sm:text-sm uppercase text-white truncate max-w-[200px] sm:max-w-md">
                {product.title}
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="text-[11px] font-mono text-white/70 tracking-widest uppercase">
                {currentIndex + 1} of {gallery.length} {gallery[currentIndex]?.label ? `(${gallery[currentIndex].label})` : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-colors font-mono text-xs tracking-wider cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">CLOSE (ESC)</span>
            </button>
          </div>

          {/* Lightbox Main Stage: Enlarged Clothing Image */}
          <div className="relative flex-1 w-full min-h-0 flex items-center justify-center p-4 sm:p-8">
            {/* Prev Button */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={goToPrevImage}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all backdrop-blur-md cursor-pointer shadow-xl"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}

            {/* Enlarged Photo Container */}
            <div 
              className="relative w-full h-full max-w-4xl flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {activeImage && (
                <Image
                  src={activeImage}
                  alt={`${product.title} view ${currentIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain drop-shadow-2xl transition-all duration-300"
                  priority
                />
              )}
            </div>

            {/* Next Button */}
            {gallery.length > 1 && (
              <button
                type="button"
                onClick={goToNextImage}
                aria-label="Next photo"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all backdrop-blur-md cursor-pointer shadow-xl"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Tray — Scroll Through Images Below */}
          <div className="border-t border-white/10 bg-black/85 backdrop-blur-xl px-4 py-3 sm:py-4 z-30">
            <div className="max-w-5xl mx-auto space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-white/70 uppercase px-1">
                <span>SCROLL OR CLICK TO VIEW ALL {gallery.length} IMAGES</span>
                <span className="text-white font-semibold">{gallery[currentIndex]?.label || 'GARMENT VIEW'}</span>
              </div>

              <div className="relative flex items-center">
                {gallery.length > 5 && (
                  <button
                    type="button"
                    onClick={() => scrollLightboxThumbnails('left')}
                    className="shrink-0 mr-2 p-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-colors cursor-pointer"
                    aria-label="Scroll images left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                <div 
                  ref={lightboxThumbnailsRef}
                  className="flex gap-3 overflow-x-auto py-1 scroll-smooth snap-x scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent flex-1"
                >
                  {gallery.map((item, idx) => {
                    const isSelected = activeImage === item.url
                    return (
                      <div
                        key={idx}
                        ref={(el) => { lightboxThumbnailRefs.current[idx] = el }}
                        onClick={() => handleThumbnailClick(item.url, item.type)}
                        className={`relative shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded cursor-pointer overflow-hidden border transition-all snap-center bg-black/40 ${
                          isSelected 
                            ? 'border-white ring-2 ring-white/70 scale-105 shadow-xl' 
                            : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/60'
                        }`}
                      >
                        <Image
                          src={item.url}
                          alt={`${product.title} thumbnail ${idx + 1}`}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                        {item.label && (
                          <span className="absolute bottom-0.5 inset-x-0 text-center text-[7px] font-mono uppercase bg-black/80 text-white font-bold tracking-tighter truncate px-0.5">
                            {item.label}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {gallery.length > 5 && (
                  <button
                    type="button"
                    onClick={() => scrollLightboxThumbnails('right')}
                    className="shrink-0 ml-2 p-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-colors cursor-pointer"
                    aria-label="Scroll images right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
