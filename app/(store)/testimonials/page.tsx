'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ChevronRight, 
  Star, 
  Upload, 
  Play, 
  Pause, 
  CheckCircle2, 
  Camera, 
  Video as VideoIcon, 
  X, 
  MapPin, 
  Sparkles,
  ShoppingBag
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface Testimonial {
  id: string
  name: string
  handle: string
  location: string
  borough: 'Brooklyn' | 'Manhattan' | 'Queens' | 'Bronx' | 'Staten Island' | 'Other'
  rating: number
  product: string
  productSlug: string
  comment: string
  type: 'photo' | 'video'
  mediaUrl: string
  isUserUploaded?: boolean
  date: string
}

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Marcus Thorne',
    handle: '@marcust_nyc',
    location: 'Bushwick, Brooklyn',
    borough: 'Brooklyn',
    rating: 5,
    product: 'Been Brooklyn Hoodie',
    productSlug: 'been-brooklyn-hoodie',
    comment: 'The 10oz heavyweight fleece is completely unmatched. You can feel the quality the moment you put it on. Structured hood, heavy cuffs, and keeps the winter wind out. Five boroughs pride on lock.',
    type: 'photo',
    mediaUrl: '/outer-line-models-uniform-1200x1500/exec-400b6388-f8e0-4cd8-9e09-f7c5bbd41c20-4x5.png',
    date: 'August 28, 2026'
  },
  {
    id: 't-2',
    name: 'Jaylen Carter',
    handle: '@jaylenc_bx',
    location: 'Concourse, Bronx',
    borough: 'Bronx',
    rating: 5,
    product: 'Been Brooklyn Baller Tee',
    productSlug: 'been-brooklyn-baller-tee',
    comment: 'Check out the drape on this Baller Tee! Heavyweight cotton face that holds shape all day. Support answered my sizing questions right away, and shipping landed in 4 days.',
    type: 'video',
    mediaUrl: '/BEEN BROOKLYN BALLER BLK&BLUE .png',
    date: 'August 24, 2026'
  },
  {
    id: 't-3',
    name: 'Aaliyah Rivera',
    handle: '@aaliyah.st',
    location: 'Astoria, Queens',
    borough: 'Queens',
    rating: 5,
    product: 'So New York Hoodie',
    productSlug: 'so-new-york-emoji-hoodie',
    comment: 'The neon pink detailing against the pitch black fabric is pure NYC energy. Wore this to a rooftop pop-up and had three people stop and ask what brand this was.',
    type: 'photo',
    mediaUrl: '/SONY WHITE & PINKMODEL.png',
    date: 'August 19, 2026'
  },
  {
    id: 't-4',
    name: 'Damon Vance',
    handle: '@damon_vance',
    location: 'Lower East Side, Manhattan',
    borough: 'Manhattan',
    rating: 5,
    product: 'Been Brooklyn Hoodie',
    productSlug: 'been-brooklyn-hoodie',
    comment: 'Outerline really captured what authentic NYC streetwear is supposed to feel like. Heavy, bold, without cheap shortcuts. God bless the dynamic duo for doing this right.',
    type: 'video',
    mediaUrl: '/BEEN BROOKLYN BLACK SWEATER model.png',
    date: 'August 15, 2026'
  },
  {
    id: 't-5',
    name: 'Malik Jenkins',
    handle: '@m_jenkinsnyc',
    location: 'Flatbush, Brooklyn',
    borough: 'Brooklyn',
    rating: 5,
    product: 'So New York Emoji Tee',
    productSlug: 'so-new-york-emoji-tee',
    comment: 'Print quality doesn’t fade or crack after washing. Super clean neckline and fits true to size. Delivery took only 3 business days to Brooklyn.',
    type: 'photo',
    mediaUrl: '/outer-line-models-uniform-1200x1500/exec-9ed0ddf7-4e23-4985-b5c2-e9b1518a1620-4x5.png',
    date: 'August 10, 2026'
  },
  {
    id: 't-6',
    name: 'Chris Morales',
    handle: '@morales_si',
    location: 'St. George, Staten Island',
    borough: 'Staten Island',
    rating: 5,
    product: 'Been Brooklyn Baller Tee',
    productSlug: 'been-brooklyn-baller-tee',
    comment: 'Hard to find tees that fit broad shoulders properly without looking baggy at the waist. Outerline nailed the silhouette. 10/10.',
    type: 'photo',
    mediaUrl: '/outer-line-models-uniform-1200x1500/exec-cd173aa2-7bc1-4aae-a326-d893b50d8c92-4x5.png',
    date: 'August 03, 2026'
  }
]

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

  // Form State
  const [formName, setFormName] = useState('')
  const [formHandle, setFormHandle] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formBorough, setFormBorough] = useState<Testimonial['borough']>('Brooklyn')
  const [formRating, setFormRating] = useState(5)
  const [formProduct, setFormProduct] = useState('Been Brooklyn Hoodie')
  const [formComment, setFormComment] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    setMediaType(isVideo ? 'video' : 'photo')
    setMediaFile(file)
    setMediaPreview(URL.createObjectURL(file))
  }

  const handleRemoveMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formComment.trim()) {
      toast.error('Please enter your name and review.')
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const newTestimonial: Testimonial = {
        id: `user-${Date.now()}`,
        name: formName.trim(),
        handle: formHandle.trim().startsWith('@') ? formHandle.trim() : (formHandle.trim() ? `@${formHandle.trim()}` : '@customer'),
        location: formLocation.trim() || `${formBorough}, NYC`,
        borough: formBorough,
        rating: formRating,
        product: formProduct,
        productSlug: formProduct.toLowerCase().replace(/\s+/g, '-'),
        comment: formComment.trim(),
        type: mediaType,
        mediaUrl: mediaPreview || '/outer-line-models-uniform-1200x1500/exec-400b6388-f8e0-4cd8-9e09-f7c5bbd41c20-4x5.png',
        isUserUploaded: true,
        date: 'Just now'
      }

      setTestimonials([newTestimonial, ...testimonials])
      setIsSubmitting(false)
      setIsUploadModalOpen(false)

      // Reset form
      setFormName('')
      setFormHandle('')
      setFormLocation('')
      setFormComment('')
      setMediaFile(null)
      setMediaPreview(null)

      toast.success('Your fit & review has been published to the community feed!')
    }, 600)
  }

  // Filter testimonials
  const filteredTestimonials = testimonials.filter((t) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'photos') return t.type === 'photo'
    if (activeFilter === 'videos') return t.type === 'video'
    return t.borough.toLowerCase() === activeFilter.toLowerCase()
  })

  return (
    <div className="bg-[#FFFFFF] min-h-screen pt-28 sm:pt-32 md:pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#666666]">
          <Link href="/" className="hover:text-[#0A192F] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A192F]">Testimonials</span>
        </nav>

        {/* Hero Banner */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-[#E5E5E5] pb-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#0A192F]/10 text-[#0A192F] text-[10px] uppercase tracking-[0.25em] font-mono font-semibold">
              COMMUNITY TESTIMONIALS &amp; REVIEWS
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0A192F]">
              REAL NYC STREET FIT REVIEWS
            </h1>
            <p className="text-[#666666] text-base leading-relaxed">
              Customer video reels, street style photos, and genuine reviews from each of the five boroughs. See how the Outerline pieces fit and wear in real life.
            </p>
          </div>

          {/* Action button: Upload video or photo */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-8 py-4 bg-[#0A192F] text-[#FFFFFF] font-serif tracking-[0.2em] uppercase text-xs hover:bg-[#000000] transition-colors flex items-center justify-center gap-2 rounded cursor-pointer shadow-md shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>Share Your Fit &amp; Review</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'photos', label: 'Photos Only' },
            { id: 'videos', label: 'Video Reels' },
            { id: 'brooklyn', label: 'Brooklyn' },
            { id: 'manhattan', label: 'Manhattan' },
            { id: 'queens', label: 'Queens' },
            { id: 'bronx', label: 'The Bronx' },
            { id: 'staten island', label: 'Staten Island' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap uppercase tracking-wider font-mono text-[11px] transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#0A192F] text-white shadow-sm'
                  : 'bg-[#F3F3F3] text-[#666666] hover:bg-[#EAEAEA] hover:text-[#0A192F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredTestimonials.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] overflow-hidden flex flex-col justify-between hover:border-[#0A192F]/50 hover:shadow-xl transition-all duration-300"
              >
                {/* Media Container (Video or Photo) */}
                <div className="relative aspect-[4/5] bg-[#F5F5F5] overflow-hidden">
                  {item.type === 'video' && item.mediaUrl.endsWith('.mp4') ? (
                    <video
                      src={item.mediaUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={item.mediaUrl}
                      alt={`${item.name} wearing ${item.product}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="bg-[#0A192F]/80 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {item.borough}
                    </span>

                    {item.isUserUploaded ? (
                      <span className="bg-green-600 text-white text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Just Added
                      </span>
                    ) : (
                      <span className="bg-white/90 backdrop-blur-md text-[#0A192F] text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        Verified Buyer
                      </span>
                    )}
                  </div>

                  {/* Video Play Overlay Indicator for video card */}
                  {item.type === 'video' && (
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white">
                      <VideoIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Stars & Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-[#888888]">{item.date}</span>
                    </div>

                    {/* Comment */}
                    <p className="font-serif italic text-sm text-[#0A192F] leading-relaxed">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E5E5] space-y-3">
                    {/* Product Tag */}
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="flex items-center justify-between p-2 rounded bg-[#FAFAFA] border border-[#E5E5E5] hover:border-[#0A192F] transition-colors text-xs"
                    >
                      <span className="font-medium text-[#0A192F] truncate">
                        {item.product}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#666666] shrink-0">
                        Shop &rarr;
                      </span>
                    </Link>

                    {/* Author */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#0A192F] block">{item.name}</span>
                        <span className="text-[11px] font-mono text-[#666666]">{item.handle}</span>
                      </div>
                      <span className="text-[10px] text-[#888888]">{item.location}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-[#E5E5E5] my-8 relative"
            >
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="absolute top-5 right-5 text-[#666666] hover:text-[#0A192F] p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0A192F] font-semibold">
                  COMMUNITY REVIEWS
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0A192F]">
                  SUBMIT YOUR FIT &amp; TESTIMONIAL
                </h2>
                <p className="text-xs text-[#666666]">
                  Upload your video reel or fit picture wearing Outerline to be featured on our official pages.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Media Uploader (Video & Picture) */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#0A192F] block mb-1.5">
                    Upload Fit Video or Photo (MP4, MOV, JPG, PNG)
                  </label>

                  {!mediaPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#CCCCCC] hover:border-[#0A192F] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#FAFAFA]"
                    >
                      <div className="flex items-center justify-center gap-3 text-[#666666] mb-2">
                        <Camera className="w-6 h-6 text-[#0A192F]" />
                        <VideoIcon className="w-6 h-6 text-[#0A192F]" />
                      </div>
                      <p className="text-xs font-medium text-[#0A192F]">
                        Click or drag &amp; drop video or photo
                      </p>
                      <p className="text-[10px] text-[#888888] mt-1">
                        High resolution portrait (4:5 or 9:16 reels format recommended)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-[#E5E5E5] bg-black aspect-[16/9] max-h-56 flex items-center justify-center">
                      {mediaType === 'video' ? (
                        <video
                          src={mediaPreview}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={mediaPreview}
                          alt="Upload preview"
                          className="w-full h-full object-contain"
                        />
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveMedia}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-mono uppercase px-2 py-0.5 rounded">
                        {mediaType.toUpperCase()} READY
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#0A192F] block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Miles"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#0A192F] block mb-1">
                      Instagram / Social Handle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. @jordanmiles"
                      value={formHandle}
                      onChange={(e) => setFormHandle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#0A192F] block mb-1">
                      Borough / Location
                    </label>
                    <select
                      value={formBorough}
                      onChange={(e) => setFormBorough(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
                    >
                      <option value="Brooklyn">Brooklyn</option>
                      <option value="Manhattan">Manhattan</option>
                      <option value="Queens">Queens</option>
                      <option value="Bronx">The Bronx</option>
                      <option value="Staten Island">Staten Island</option>
                      <option value="Other">Other / Out of State</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#0A192F] block mb-1">
                      Product Worn
                    </label>
                    <select
                      value={formProduct}
                      onChange={(e) => setFormProduct(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
                    >
                      <option value="Been Brooklyn Hoodie">Been Brooklyn Hoodie</option>
                      <option value="Been Brooklyn Baller Hoodie">Been Brooklyn Baller Hoodie</option>
                      <option value="Been Brooklyn Baller Tee">Been Brooklyn Baller Tee</option>
                      <option value="Been Brooklyn Tee">Been Brooklyn Tee</option>
                      <option value="So New York Emoji Hoodie">So New York Emoji Hoodie</option>
                      <option value="So New York Emoji Tee">So New York Emoji Tee</option>
                    </select>
                  </div>
                </div>

                {/* Star Rating Selection */}
                <div>
                  <label className="text-[11px] font-medium text-[#0A192F] block mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= formRating ? 'fill-amber-500' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs text-[#666666] ml-2 font-mono">{formRating} of 5 stars</span>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="text-[11px] font-medium text-[#0A192F] block mb-1">
                    Review / Fit Notes *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us about the fabric weight, fit, drape, and how you styled it..."
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-[#E5E5E5] bg-[#FAFAFA] text-[#0A192F] focus:outline-none focus:border-[#0A192F]"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="flex-1 py-3 border border-[#E5E5E5] text-[#666666] text-xs font-serif uppercase tracking-wider rounded hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-[#0A192F] text-white text-xs font-serif uppercase tracking-wider rounded hover:bg-black transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Testimonial'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
