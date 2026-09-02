'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export interface ProductCardProps {
  product: {
    id: string
    title: string
    slug: string
    price: number
    compare_at_price?: number | null
    images: string[]
    images_back?: string[]
    model_image?: string | null
    category: string
    collection: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { title, slug, price, compare_at_price, images, images_back, model_image, collection } = product
  const compareAtPrice = compare_at_price
  
  const frontImage = model_image || images[0] || '/placeholder.jpg'
  const backImage = (images_back && images_back.length > 0) ? images_back[0] : null

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: "easeOut" }}>
      <Link href={`/products/${slug}`} className="block group">
        <div className="rounded-lg overflow-hidden bg-[#F9F9F9] border border-[#E5E5E5] group-hover:border-[#0A192F]/30 transition-all duration-300">
          
          {/* Image Container — 4:5 Aspect Ratio (1200x1500 standard) */}
          <div className="aspect-[4/5] relative overflow-hidden bg-[#F3F3F3]">
            {backImage ? (
              <>
                <Image
                  src={frontImage}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center opacity-100 group-hover:opacity-0 transition-opacity duration-500"
                />
                <Image
                  src={backImage}
                  alt={`${title} back`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 absolute inset-0"
                />
              </>
            ) : (
              <Image
                src={frontImage}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFFFFF]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-[#0A192F] font-medium">
              {collection}
            </span>
            <h3 className="font-serif text-[#0A192F] text-sm line-clamp-1 group-hover:text-[#0A192F] transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#0A192F] font-medium text-sm">
                ${price.toFixed(2)}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-[#666666] line-through text-xs">
                  ${compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
