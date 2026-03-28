export interface ProductRecord {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  gallery: string[]
  isActive: boolean
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

interface ProductInputRaw {
  name?: unknown
  description?: unknown
  price?: unknown
  imageUrl?: unknown
  gallery?: unknown
  isActive?: unknown
  sortOrder?: unknown
}

export interface NormalizedProductInput {
  name: string
  description: string
  price: number
  image_url: string
  gallery: string[]
  is_active: boolean
  sort_order: number
}

const MAX_GALLERY_IMAGES = 12

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeGallery(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
    .slice(0, MAX_GALLERY_IMAGES)
}

export function normalizeProductInput(body: ProductInputRaw): { data?: NormalizedProductInput; error?: string } {
  const name = toTrimmedString(body?.name)
  const description = toTrimmedString(body?.description)
  const imageUrl = toTrimmedString(body?.imageUrl)
  const rawPrice = typeof body?.price === 'number' ? body.price : Number(body?.price)
  const rawSortOrder = typeof body?.sortOrder === 'number' ? body.sortOrder : Number(body?.sortOrder)
  const gallery = normalizeGallery(body?.gallery)
  const isActive = typeof body?.isActive === 'boolean' ? body.isActive : true

  if (!name) {
    return { error: 'El nombre del producto es obligatorio' }
  }

  if (name.length > 120) {
    return { error: 'El nombre del producto es demasiado largo' }
  }

  if (!Number.isFinite(rawPrice) || rawPrice < 0) {
    return { error: 'El precio del producto no es válido' }
  }

  if (!imageUrl) {
    return { error: 'La imagen principal es obligatoria' }
  }

  if (!Number.isInteger(rawSortOrder) || rawSortOrder < 0) {
    return { error: 'El orden debe ser un número entero mayor o igual a 0' }
  }

  return {
    data: {
      name,
      description,
      price: Math.round(rawPrice * 100) / 100,
      image_url: imageUrl,
      gallery,
      is_active: isActive,
      sort_order: rawSortOrder,
    },
  }
}

export function mapProductRecord(row: Record<string, unknown>): ProductRecord {
  return {
    id: String(row.id ?? ''),
    name: typeof row.name === 'string' ? row.name : '',
    description: typeof row.description === 'string' ? row.description : '',
    price: Number(row.price ?? 0) || 0,
    imageUrl: typeof row.image_url === 'string' ? row.image_url : '',
    gallery: normalizeGallery(row.gallery),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0) || 0,
    createdAt: typeof row.created_at === 'string' ? row.created_at : undefined,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : undefined,
  }
}