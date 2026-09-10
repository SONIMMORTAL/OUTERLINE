import Image from 'next/image'

// The source PNG is 3626×2696 (~800 KB) but renders under 70px wide, so let next/image serve a resized AVIF/WebP.
export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/OUTERLINE LOGO.png"
      alt="Outerline Logo"
      width={3626}
      height={2696}
      sizes="160px"
      priority={priority}
      className={className}
    />
  )
}
