// Stock helpers shared by the storefront, the cart, and the orders API.

export const LOW_STOCK_THRESHOLD = 3

interface StockedVariant {
  color: string
  size: string
  inventory_quantity: number
}

export function findVariant<T extends StockedVariant>(variants: T[], color: string, size: string): T | undefined {
  return variants.find((variant) => variant.color === color && variant.size === size)
}

export function stockFor(variants: StockedVariant[], color: string, size: string): number {
  return Math.max(0, findVariant(variants, color, size)?.inventory_quantity ?? 0)
}

// A product with no variants has nothing to sell, but it is not shown as "sold out".
export function isSoldOut(variants?: { inventory_quantity: number }[]): boolean {
  return Boolean(variants && variants.length > 0) && variants!.every((variant) => variant.inventory_quantity <= 0)
}

// Keep in sync with scripts/seed-catalog.mjs.
export function skuFor(slug: string, color: string, size: string): string {
  return `${slug}-${color}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-')
}
