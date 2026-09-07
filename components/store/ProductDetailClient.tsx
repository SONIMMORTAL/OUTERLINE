'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ShoppingCart, Check, ChevronLeft, ChevronRight, Ruler } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'
import { SizeGuideModal } from '@/components/store/SizeGuideModal'

interface ProductDetailClientProps {
  product: any
  variants: any[]
}

export interface GalleryItem {
  url: string
  type: 'model' | 'front' | 'back'
  label?: string
  color?: string
  viewKind?: 'model' | 'render'
}

export function ProductDetailClient({ product, variants }: ProductDetailClientProps) {
  const images = product.images || []
  const imagesBack = product.images_back || []
  const modelImage = product.model_image || null
  const imagesByColor = product.images_by_color || null
  
  // Build paired gallery: Put front views alongside their corresponding back views without duplicates
  const buildGallery = (): GalleryItem[] => {
    const galleryItems: GalleryItem[] = []
    const seenUrls = new Set<string>()

    const addImage = (
      url?: string | null,
      type: 'model' | 'front' | 'back' = 'front',
      label?: string,
      color?: string,
      viewKind?: 'model' | 'render'
    ) => {
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url)
        galleryItems.push({ url, type, label: label || type.toUpperCase(), color, viewKind })
      }
    }

    // Structured views keyed by colorway
    if (imagesByColor) {
      const colorKeys = colors.length > 0 
        ? [
            ...colors.filter(c => imagesByColor[c]),
            ...Object.keys(imagesByColor).filter(c => !colors.includes(c))
          ]
        : Object.keys(imagesByColor)

      colorKeys.forEach((colorName) => {
        const colorData = imagesByColor[colorName]
        if (colorData.model_front) {
          addImage(colorData.model_front, 'model', 'EDITORIAL', colorName, 'model')
        }
        if (colorData.model_back) {
          addImage(colorData.model_back, 'back', 'BACK', colorName, 'model')
        }
        if (colorData.render_front) {
          addImage(colorData.render_front, 'front', 'RENDER', colorName, 'render')
        }
        if (colorData.render_back) {
          addImage(colorData.render_back, 'back', 'RENDER BACK', colorName, 'render')
        }
      })
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
      if (v.image) addImage(v.image, 'front', v.color ? `${v.color.toUpperCase()}` : 'FRONT', v.color)
      if (v.image_back) addImage(v.image_back, 'back', v.color ? `${v.color.toUpperCase()} BACK` : 'BACK', v.color)
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
  const [currentViewKind, setCurrentViewKind] = useState<'model' | 'render'>(gallery[0]?.viewKind || 'model')
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false)

  const thumbnailsRef = useRef<HTMLDivElement>(null)
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([])

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  const addItem = useCartStore((s) => s.addItem)

  // Get current variant images for active color
  const currentVariant = variants.find(v => v.color === selectedColor) || variants[0]
  const currentFront = currentVariant?.image || images[0]
  const currentBack = currentVariant?.image_back || imagesBack[0]
  const hasBackImage = Boolean(
    currentBack || 
    (imagesByColor && (imagesByColor[selectedColor]?.model_back || imagesByColor[selectedColor]?.render_back)) || 
    imagesBack.length > 0
  )

  // Active image index in gallery
  const currentIndex = Math.max(0, gallery.findIndex(item => item.url === activeImage))
  const currentItem = gallery[currentIndex]

  // Cycle to next / prev image
  const goToNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (gallery.length <= 1) return
    const nextIdx = (currentIndex + 1) % gallery.length
    const nextItem = gallery[nextIdx]
    handleThumbnailClick(nextItem)
  }

  const goToPrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (gallery.length <= 1) return
    const prevIdx = (currentIndex - 1 + gallery.length) % gallery.length
    const prevItem = gallery[prevIdx]
    handleThumbnailClick(prevItem)
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
  }, [currentIndex])

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

  // Map color selection to the correct garment image and synchronize view mode
  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    
    if (imagesByColor && imagesByColor[color]) {
      const c = imagesByColor[color]
      const hasModel = Boolean(c.model_front || c.model_back)
      const hasRender = Boolean(c.render_front || c.render_back)

      // If switching from a colorway that had NO model (only renders) to one that HAS a model,
      // default back to model view so editorial photos are showcased
      const prevColorData = imagesByColor[selectedColor]
      const prevHadModel = Boolean(prevColorData?.model_front || prevColorData?.model_back)

      if (currentViewKind === 'render' && hasRender && prevHadModel) {
        const target = activeImageType === 'back' && c.render_back 
          ? c.render_back 
          : (c.render_front || c.model_front)
        if (target) {
          setActiveImage(target)
          return
        }
      } else if (hasModel) {
        setCurrentViewKind('model')
        const target = activeImageType === 'back' && c.model_back 
          ? c.model_back 
          : (c.model_front || c.render_front)
        if (target) {
          setActiveImage(target)
          return
        }
      } else if (hasRender) {
        setCurrentViewKind('render')
        const target = activeImageType === 'back' && c.render_back 
          ? c.render_back 
          : (c.render_front || c.model_front)
        if (target) {
          setActiveImage(target)
          return
        }
      }
    }

    const colorItems = gallery.filter(g => g.color && g.color.toLowerCase() === color.toLowerCase())
    if (colorItems.length > 0) {
      const match = colorItems.find(g => g.type === activeImageType) || colorItems[0]
      setActiveImage(match.url)
      setActiveImageType(match.type)
      if (match.viewKind) setCurrentViewKind(match.viewKind)
      return
    }

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
  const handleThumbnailClick = (item: GalleryItem) => {
    setActiveImage(item.url)
    setActiveImageType(item.type)
    if (item.viewKind) {
      setCurrentViewKind(item.viewKind)
    }
    
    // Keyed to its proper color pill
    if (item.color) {
      setSelectedColor(item.color)
      return
    }

    const variantMatch = variants.find(v => v.image === item.url || v.image_back === item.url)
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
      blue: '#2563EB',
      navy: '#2563EB',
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
          className="aspect-[4/5] rounded-lg border border-[#E5E5E5] relative overflow-hidden bg-[#F9F9F9] transition-all duration-300 group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Quick Front / Back Toggle Pill */}
          {hasBackImage && (
            <div 
              className="absolute top-4 right-4 z-20 flex bg-white/95 backdrop-blur-md rounded-full p-1 border border-[#E5E5E5] shadow-xs text-xs font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                type="button"
                onClick={() => {
                  setActiveImageType('front')
                  if (imagesByColor && imagesByColor[selectedColor]) {
                    const c = imagesByColor[selectedColor]
                    if (currentViewKind === 'render' && c.render_front) {
                      setActiveImage(c.render_front)
                      return
                    }
                    if (c.model_front) {
                      setActiveImage(c.model_front)
                      return
                    }
                    if (c.render_front) {
                      setActiveImage(c.render_front)
                      return
                    }
                  }
                  const backIdx = imagesBack.indexOf(activeImage)
                  if (backIdx !== -1 && images[backIdx]) {
                    setActiveImage(images[backIdx])
                  } else if (currentFront) {
                    setActiveImage(currentFront)
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
                  setActiveImageType('back')
                  if (imagesByColor && imagesByColor[selectedColor]) {
                    const c = imagesByColor[selectedColor]
                    if (currentViewKind === 'render' && c.render_back) {
                      setActiveImage(c.render_back)
                      return
                    }
                    if (c.model_back) {
                      setActiveImage(c.model_back)
                      return
                    }
                    if (c.render_back) {
                      setActiveImage(c.render_back)
                      return
                    }
                  }
                  const frontIdx = images.indexOf(activeImage)
                  if (frontIdx !== -1 && imagesBack[frontIdx]) {
                    setActiveImage(imagesBack[frontIdx])
                  } else if (currentBack) {
                    setActiveImage(currentBack)
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

          {/* Photo Count Indicator */}
          {gallery.length > 1 && (
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E5E5E5] text-[10px] font-mono tracking-wider text-[#0A192F] shadow-xs pointer-events-none">
              <span>{currentIndex + 1} / {gallery.length}</span>
            </div>
          )}

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
              <span className="font-semibold text-[#0A192F]">
                {currentItem?.color ? `${currentItem.color} • ${currentItem.label || ''}` : (currentItem?.label || '')}
              </span>
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
                      onClick={() => handleThumbnailClick(item)}
                      className={`shrink-0 w-20 h-24 sm:w-24 sm:h-28 rounded-md relative overflow-hidden cursor-pointer transition-all snap-center bg-[#F9F9F9] ${
                        isSelected ? 'border-2 border-[#0A192F] ring-2 ring-[#0A192F]/30 scale-[1.03] shadow-sm' : 'border border-[#E5E5E5] hover:border-[#0A192F]/60'
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
                          item.type === 'back' ? 'bg-[#0A192F] text-white' : item.viewKind === 'render' ? 'bg-[#2563EB] text-white' : 'bg-black/60 text-white'
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
                      className={`w-9 h-9 rounded-full transition-all relative flex items-center justify-center shadow-xs ${
                        isSelected 
                          ? 'border-2 border-white ring-2 ring-[#0A192F] ring-offset-2 scale-110 shadow-md' 
                          : 'border border-[#E5E5E5] hover:scale-105 hover:border-[#0A192F]/50'
                      }`}
                      style={swatchStyle}
                      title={color}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
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
    </div>
  )
}
